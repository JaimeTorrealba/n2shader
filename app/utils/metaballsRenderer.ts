import metaballsShader from "~/components/home/experience/shaders/metaballs.wgsl";
import { createEnvironmentMap } from "./environmentMap";
import { GRAVITY_BODY_COUNT, type GravityBody } from "./gravityBodies";
import { loadRadianceHdr, type RadianceHdrImage } from "./radianceHdr";

export interface MetaballsRendererOptions {
  // Equirectangular .hdr used for the reflections (never drawn as background)
  environmentMapUrl: string;
  onDeviceLost?: () => void;
}

export interface MetaballsRenderer {
  resizeMetaballsCanvas: (cssWidth: number, cssHeight: number) => void;
  renderMetaballsFrame: (sceneTime: number, bodies: readonly GravityBody[]) => void;
  destroyMetaballsRenderer: () => void;
}

// Raymarching is fill-rate bound, so cap the backing store resolution
const MAX_PIXEL_RATIO = 1.5;
// resolution (2) + time (1) + padding (1), then one vec4 per gravity body
const UNIFORM_HEADER_FLOAT_COUNT = 4;
const FLOATS_PER_BODY = 4;
const UNIFORM_FLOAT_COUNT = UNIFORM_HEADER_FLOAT_COUNT + GRAVITY_BODY_COUNT * FLOATS_PER_BODY;

const requestGpuDevice = async (): Promise<GPUDevice | null> => {
  if (!("gpu" in navigator)) return null;

  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) return null;

  return adapter.requestDevice();
};

const loadEnvironmentImage = (url: string): Promise<RadianceHdrImage | null> =>
  loadRadianceHdr(url).catch((error) => {
    console.warn("[metaballs] environment map failed, using neutral fallback", error);
    return null;
  });

/**
 * Sets up a fullscreen WebGPU pass that draws the metaballs shader.
 * Resolves to `null` when WebGPU is unavailable or the pipeline fails,
 * so callers can fall back to the plain section background.
 */
export const createMetaballsRenderer = async (
  canvas: HTMLCanvasElement,
  { environmentMapUrl, onDeviceLost }: MetaballsRendererOptions
): Promise<MetaballsRenderer | null> => {
  // Download the HDR while the GPU spins up
  const [device, environmentImage] = await Promise.all([
    requestGpuDevice().catch(() => null),
    loadEnvironmentImage(environmentMapUrl),
  ]);
  if (!device) return null;

  const context = canvas.getContext("webgpu");
  if (!context) {
    device.destroy();
    return null;
  }

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });

  const shaderModule = device.createShaderModule({ label: "metaballs", code: metaballsShader });

  let pipeline: GPURenderPipeline;
  try {
    pipeline = await device.createRenderPipelineAsync({
      label: "metaballs",
      layout: "auto",
      vertex: { module: shaderModule, entryPoint: "vs_main" },
      fragment: { module: shaderModule, entryPoint: "fs_main", targets: [{ format }] },
      primitive: { topology: "triangle-list" },
    });
  } catch (error) {
    console.warn("[metaballs] pipeline creation failed", error);
    device.destroy();
    return null;
  }

  const uniformBuffer = device.createBuffer({
    label: "metaballs uniforms",
    size: UNIFORM_FLOAT_COUNT * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const environmentMap = createEnvironmentMap(device, environmentImage);

  const bindGroup = device.createBindGroup({
    label: "metaballs bind group",
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: environmentMap.texture.createView() },
      { binding: 2, resource: environmentMap.sampler },
    ],
  });

  const uniformData = new Float32Array(UNIFORM_FLOAT_COUNT);
  let isDestroyed = false;

  device.lost.then(() => {
    if (!isDestroyed) onDeviceLost?.();
  });

  const resizeMetaballsCanvas = (cssWidth: number, cssHeight: number) => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const maxSize = device.limits.maxTextureDimension2D;

    canvas.width = Math.min(maxSize, Math.max(1, Math.round(cssWidth * pixelRatio)));
    canvas.height = Math.min(maxSize, Math.max(1, Math.round(cssHeight * pixelRatio)));
  };

  const renderMetaballsFrame = (sceneTime: number, bodies: readonly GravityBody[]) => {
    if (isDestroyed) return;

    uniformData[0] = canvas.width;
    uniformData[1] = canvas.height;
    uniformData[2] = sceneTime;
    bodies.forEach((body, index) => {
      const offset = UNIFORM_HEADER_FLOAT_COUNT + index * FLOATS_PER_BODY;
      uniformData[offset] = body.x;
      uniformData[offset + 1] = body.y;
      // z (offset + 2) stays 0: every body sits on the z = 0 plane
      uniformData[offset + 3] = body.radius;
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const encoder = device.createCommandEncoder({ label: "metaballs frame" });
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    device.queue.submit([encoder.finish()]);
  };

  const destroyMetaballsRenderer = () => {
    if (isDestroyed) return;
    isDestroyed = true;
    uniformBuffer.destroy();
    environmentMap.texture.destroy();
    context.unconfigure();
    device.destroy();
  };

  return { resizeMetaballsCanvas, renderMetaballsFrame, destroyMetaballsRenderer };
};
