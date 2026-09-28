import type { RadianceHdrImage } from "./radianceHdr";

export interface EnvironmentMap {
  texture: GPUTexture;
  sampler: GPUSampler;
}

interface MipLevel {
  width: number;
  height: number;
  pixels: Float32Array;
}

// rgba16float is filterable everywhere (rgba32float needs an optional feature)
const ENVIRONMENT_FORMAT: GPUTextureFormat = "rgba16float";
const BYTES_PER_TEXEL = 8;
// Just under half-float max, so rounding never tips a value into infinity
const MAX_HALF_VALUE = 65000;
// Neutral grey used when the HDR fails to load, so the balls still render
const FALLBACK_RADIANCE = 0.5;

const floatScratch = new Float32Array(1);
const floatBitsScratch = new Uint32Array(floatScratch.buffer);

const toHalfFloatBits = (value: number): number => {
  floatScratch[0] = Math.min(value, MAX_HALF_VALUE);
  const bits = floatBitsScratch[0]!;

  const sign = (bits >>> 16) & 0x8000;
  const exponent = ((bits >>> 23) & 0xff) - 127 + 15;
  const mantissa = bits & 0x7fffff;

  if (exponent <= 0) {
    if (exponent < -10) return sign;
    const subnormal = (mantissa | 0x800000) >>> (1 - exponent);
    return sign | ((subnormal + 0x1000) >>> 13);
  }

  // Addition (not OR) lets a rounding carry bump the exponent correctly
  return sign | ((exponent << 10) + ((mantissa + 0x1000) >>> 13));
};

const toHalfFloatArray = (pixels: Float32Array): Uint16Array => {
  const halfPixels = new Uint16Array(pixels.length);
  for (let i = 0; i < pixels.length; i++) halfPixels[i] = toHalfFloatBits(pixels[i]!);
  return halfPixels;
};

// 2x2 box filter. Blurrier mips stand in for rougher reflections.
const downsampleMipLevel = (source: MipLevel): MipLevel => {
  const width = Math.max(1, source.width >> 1);
  const height = Math.max(1, source.height >> 1);
  const pixels = new Float32Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const sourceY0 = Math.min(y * 2, source.height - 1);
    const sourceY1 = Math.min(y * 2 + 1, source.height - 1);

    for (let x = 0; x < width; x++) {
      const sourceX0 = Math.min(x * 2, source.width - 1);
      const sourceX1 = Math.min(x * 2 + 1, source.width - 1);
      const target = (y * width + x) * 4;

      for (let channel = 0; channel < 4; channel++) {
        pixels[target + channel] =
          (source.pixels[(sourceY0 * source.width + sourceX0) * 4 + channel]! +
            source.pixels[(sourceY0 * source.width + sourceX1) * 4 + channel]! +
            source.pixels[(sourceY1 * source.width + sourceX0) * 4 + channel]! +
            source.pixels[(sourceY1 * source.width + sourceX1) * 4 + channel]!) *
          0.25;
      }
    }
  }

  return { width, height, pixels };
};

const buildMipChain = (image: RadianceHdrImage): MipLevel[] => {
  const levels: MipLevel[] = [image];

  while (levels.at(-1)!.width > 1 || levels.at(-1)!.height > 1) {
    levels.push(downsampleMipLevel(levels.at(-1)!));
  }

  return levels;
};

const createFallbackImage = (): RadianceHdrImage => ({
  width: 1,
  height: 1,
  pixels: new Float32Array([FALLBACK_RADIANCE, FALLBACK_RADIANCE, FALLBACK_RADIANCE, 1]),
});

/**
 * Uploads an equirectangular HDR with a full mip chain.
 * Pass `null` to get a neutral 1x1 fallback.
 */
export const createEnvironmentMap = (device: GPUDevice, image: RadianceHdrImage | null): EnvironmentMap => {
  const levels = buildMipChain(image ?? createFallbackImage());
  const baseLevel = levels[0]!;

  const texture = device.createTexture({
    label: "environment map",
    size: [baseLevel.width, baseLevel.height],
    format: ENVIRONMENT_FORMAT,
    mipLevelCount: levels.length,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  levels.forEach((level, mipLevel) => {
    device.queue.writeTexture(
      { texture, mipLevel },
      toHalfFloatArray(level.pixels),
      { bytesPerRow: level.width * BYTES_PER_TEXEL },
      [level.width, level.height]
    );
  });

  const sampler = device.createSampler({
    label: "environment sampler",
    // Wrap around horizontally, clamp at the poles
    addressModeU: "repeat",
    addressModeV: "clamp-to-edge",
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
  });

  return { texture, sampler };
};
