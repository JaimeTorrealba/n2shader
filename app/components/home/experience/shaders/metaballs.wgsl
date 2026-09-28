/// -----------------------------------------------------------------------------
/// Hero metaballs — plain WebGPU / WGSL
///
/// Based on "Metaballs - Quintic" by Inigo Quilez (iq)
///   https://www.shadertoy.com/view/ld2GRz
///   https://iquilezles.org
///
/// Ported from GLSL to WGSL. All credit for the metaball technique goes to iq.
///
/// Changes from the original: fixed camera (no orbit), transparent background,
/// the word "N2S" is built from tubes, the balls move with n-body gravity
/// (the pointer drags the big one, the rest fall toward it) and melt into the
/// word as they pass, numerical normals, and shading
/// is a rough metal lit only by an HDR environment (reflections, no
/// background).
///
/// License: check the terms on the original Shadertoy page before any
/// commercial use.
///
/// Chunks (inlined by vite-plugin-glsl):
///   metaballField.wgsl      — blobs, distance field, normals
///   tubeLettering.wgsl      — "N2S" glyphs (included by metaballField.wgsl)
///   imageBasedLighting.wgsl — HDR reflections, BRDF, tone mapping
/// -----------------------------------------------------------------------------

#include ./metaballField.wgsl;
#include ./imageBasedLighting.wgsl;

struct Uniforms {
  resolution: vec2f,
  time: f32,
  _padding0: f32,
  // Gravity bodies in screen space: x in [-aspect, aspect], y in [-1, 1], y up.
  // xyz = center (z = 0), w = radius. Body 0 is the pointer ball.
  bodies: array<vec4f, BODY_COUNT>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Camera lives only here: the CPU sends the bodies in screen space and they
// are unprojected onto the z = 0 plane in fs_main().
const CAMERA_DISTANCE: f32 = 10.0;
const FOCAL_LENGTH: f32 = 2.0;

const MAX_STEPS: i32 = 96;
const MIN_DISTANCE: f32 = 3.0;
const MAX_DISTANCE: f32 = 17.0;
// Both in pixels at the current depth
const SURFACE_PRECISION_PIXELS: f32 = 0.1;
const MIN_STEP_PIXELS: f32 = 0.25;
// Width of the anti-aliased silhouette edge
const EDGE_SOFTNESS_PIXELS: f32 = 1.0;

struct MarchResult {
  t: f32,
  // 1 = hit, 0 = clean miss, in between = near miss on a silhouette edge
  coverage: f32,
}

// One oversized triangle that covers the whole viewport
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((vertexIndex << 1u) & 2u), f32(vertexIndex & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

fn raymarchMetaBlobs(rayOrigin: vec3f, rayDirection: vec3f) -> MarchResult {
  // Angle one pixel covers; distances below are scaled by it so precision
  // matches what can actually be seen
  let pixelAngle = 2.0 / (uniforms.resolution.y * FOCAL_LENGTH);

  var t = MIN_DISTANCE;
  var closestT = t;
  var closestAngle = 1e20;

  for (var i = 0; i < MAX_STEPS; i++) {
    let d = sdMetaBlobs(rayOrigin + t * rayDirection);
    if (d < SURFACE_PRECISION_PIXELS * pixelAngle * t) {
      return MarchResult(t, 1.0);
    }

    // Closest approach as seen from the camera, used for edge coverage
    let angle = d / t;
    if (angle < closestAngle) {
      closestAngle = angle;
      closestT = t;
    }

    // A minimum step keeps grazing rays from crawling along silhouettes until
    // they run out of steps (which showed up as dotted holes on the edges)
    t += max(d, MIN_STEP_PIXELS * pixelAngle * t);
    if (t > MAX_DISTANCE) {
      break;
    }
  }

  return MarchResult(closestT, 1.0 - smoothstep(0.0, EDGE_SOFTNESS_PIXELS * pixelAngle, closestAngle));
}

@fragment
fn fs_main(@builtin(position) fragCoord: vec4f) -> @location(0) vec4f {
  let aspect = uniforms.resolution.x / uniforms.resolution.y;
  // One screen-space unit spans this many world units on the z = 0 plane
  let worldPerScreen = CAMERA_DISTANCE / FOCAL_LENGTH;
  updateBlobs(uniforms.time, vec2f(2.0 * aspect, 2.0) * worldPerScreen);
  for (var i = 0u; i < BODY_COUNT; i++) {
    placeBody(i, uniforms.bodies[i] * worldPerScreen);
  }

  // WebGPU's fragment origin is top-left, flip y so up is positive
  var screenPoint = (2.0 * fragCoord.xy - uniforms.resolution) / uniforms.resolution.y;
  screenPoint.y = -screenPoint.y;

  let rayOrigin = vec3f(0.0, 0.0, CAMERA_DISTANCE);
  let rayDirection = normalize(vec3f(screenPoint, -FOCAL_LENGTH));

  let march = raymarchMetaBlobs(rayOrigin, rayDirection);
  let normal = metaBlobsNormal(rayOrigin + march.t * rayDirection);
  let reflected = reflect(rayDirection, normal);

  // Screen derivatives must be taken before any per-pixel early return. Fine
  // (per-pixel) ones, coarse 2x2 blocks made the blur step along thin tubes
  let reflectedDx = dpdxFine(reflected);
  let reflectedDy = dpdyFine(reflected);

  if (march.coverage <= 0.0) {
    // Transparent, so the section's own black shows through
    return vec4f(0.0);
  }

  let color = shadeMetaBlobs(normal, -rayDirection, reflected, reflectedDx, reflectedDy);

  // Premultiplied alpha: edge pixels fade smoothly into the section
  return vec4f(color * march.coverage, march.coverage);
}
