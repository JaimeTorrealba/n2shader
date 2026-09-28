/// -----------------------------------------------------------------------------
/// Image-based lighting: equirectangular HDR reflections, split-sum style
///
/// envBrdfApprox: Brian Karis, "Physically Based Shading on Mobile" (2014)
///   https://www.unrealengine.com/en-US/blog/physically-based-shading-on-mobile
/// acesFilmic: Krzysztof Narkowicz, "ACES Filmic Tone Mapping Curve" (2016)
///   https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
/// -----------------------------------------------------------------------------

@group(0) @binding(1) var environmentMap: texture_2d<f32>;
@group(0) @binding(2) var environmentSampler: sampler;

const PI: f32 = 3.14159265;
const TWO_PI: f32 = 6.28318531;

// Material: neutral chrome-ish metal, no tint for now
const BASE_COLOR: vec3f = vec3f(0.95);
const METALNESS: f32 = 1.0;
const ROUGHNESS: f32 = 0.25;
const DIELECTRIC_F0: vec3f = vec3f(0.04);

const EXPOSURE: f32 = 1.0;
// Radians around Y: turns the studio to choose what the blobs reflect
const ENVIRONMENT_ROTATION: f32 = 0.0;

fn sampleEnvironment(direction: vec3f, lod: f32) -> vec3f {
  let c = cos(ENVIRONMENT_ROTATION);
  let s = sin(ENVIRONMENT_ROTATION);
  let rotated = vec3f(c * direction.x - s * direction.z, direction.y, s * direction.x + c * direction.z);

  // Same equirect layout as three.js; v = 0 is the top row of the image
  let uv = vec2f(
    atan2(rotated.z, rotated.x) / TWO_PI + 0.5,
    0.5 - asin(clamp(rotated.y, -1.0, 1.0)) / PI
  );
  return textureSampleLevel(environmentMap, environmentSampler, uv, lod).rgb;
}

// The box-filtered mip chain stands in for a GGX prefilter: rougher = blurrier
fn roughnessToLod(roughness: f32) -> f32 {
  return roughness * f32(textureNumLevels(environmentMap) - 1u);
}

// Mip level whose texels are as wide as `angle` (radians); equirect texels
// span a full turn / width at mip 0
fn angleToLod(angle: f32) -> f32 {
  let texelAngle = TWO_PI / f32(textureDimensions(environmentMap).x);
  return log2(max(angle / texelAngle, 1.0));
}

// Anti-aliased reflection lookup. Near silhouettes the reflection sweeps across
// the studio quickly, and thin, very bright details (ceiling rails, the neon
// tubes) would alias into dotted lines and halos. So blur at least as much as
// one pixel covers, and average 4 taps spread over that pixel.
// reflectedDx/Dy: how the reflection direction changes to the next pixel.
fn sampleReflection(reflected: vec3f, reflectedDx: vec3f, reflectedDy: vec3f, roughness: f32) -> vec3f {
  let footprint = max(length(reflectedDx), length(reflectedDy));
  // Each tap covers half the footprint, the 2x2 spread covers the rest
  let lod = max(roughnessToLod(roughness), angleToLod(footprint * 0.5));

  let tapX = reflectedDx * 0.25;
  let tapY = reflectedDy * 0.25;
  let sum =
    sampleEnvironment(normalize(reflected - tapX - tapY), lod) +
    sampleEnvironment(normalize(reflected + tapX - tapY), lod) +
    sampleEnvironment(normalize(reflected - tapX + tapY), lod) +
    sampleEnvironment(normalize(reflected + tapX + tapY), lod);
  return sum * 0.25;
}

// Analytic fit of the split-sum environment BRDF, no LUT needed
fn envBrdfApprox(specularColor: vec3f, roughness: f32, nDotV: f32) -> vec3f {
  let c0 = vec4f(-1.0, -0.0275, -0.572, 0.022);
  let c1 = vec4f(1.0, 0.0425, 1.04, -0.04);
  let r = roughness * c0 + c1;
  let a004 = min(r.x * r.x, exp2(-9.28 * nDotV)) * r.x + r.y;
  let ab = vec2f(-1.04, 1.04) * a004 + r.zw;
  return specularColor * ab.x + ab.y;
}

fn acesFilmic(color: vec3f) -> vec3f {
  let mapped = (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14);
  return clamp(mapped, vec3f(0.0), vec3f(1.0));
}

// The canvas uses a plain unorm format, so sRGB is encoded by hand
fn linearToSrgb(color: vec3f) -> vec3f {
  let low = color * 12.92;
  let high = 1.055 * pow(color, vec3f(1.0 / 2.4)) - 0.055;
  return select(high, low, color <= vec3f(0.0031308));
}

// Returns display-ready sRGB. `reflected` and its screen derivatives come from
// fs_main, since derivatives can only be taken in uniform control flow.
fn shadeMetaBlobs(
  normal: vec3f,
  viewDirection: vec3f,
  reflected: vec3f,
  reflectedDx: vec3f,
  reflectedDy: vec3f
) -> vec3f {
  let nDotV = clamp(dot(normal, viewDirection), 0.0, 1.0);

  let specularColor = mix(DIELECTRIC_F0, BASE_COLOR, METALNESS);
  let diffuseColor = BASE_COLOR * (1.0 - METALNESS);

  let specular = sampleReflection(reflected, reflectedDx, reflectedDy, ROUGHNESS)
    * envBrdfApprox(specularColor, ROUGHNESS, nDotV);

  // A 4x2 mip averages the studio closely enough for diffuse irradiance
  let irradianceLod = max(f32(textureNumLevels(environmentMap)) - 3.0, 0.0);
  let diffuse = sampleEnvironment(normal, irradianceLod) * diffuseColor;

  return linearToSrgb(acesFilmic((specular + diffuse) * EXPOSURE));
}
