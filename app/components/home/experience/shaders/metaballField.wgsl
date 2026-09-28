/// -----------------------------------------------------------------------------
/// Metaball field: the "N2S" tube word and the gravity bodies (the pointer
/// ball plus the free balls that fall toward it)
///
/// Based on "Metaballs - Quintic" by Inigo Quilez (iq)
///   https://www.shadertoy.com/view/ld2GRz
/// Tetrahedral normal sampling also by iq
///   https://iquilezles.org/articles/normalsSDF/
///
/// From the original: the quintic falloff field and the Lipschitz-bounded
/// distance estimate. Added: any shape joins the field by feeding its signed
/// distance into the same falloff, so the word melts into the balls exactly
/// like another ball would. The balls move with n-body gravity simulated on
/// the CPU (app/utils/gravityBodies.ts).
/// -----------------------------------------------------------------------------

#include ./tubeLettering.wgsl;

// Must match GRAVITY_BODY_COUNT in app/utils/gravityBodies.ts
const BODY_COUNT: u32 = 6u;
// Blob 0 is the word, 1.. are the gravity bodies (1 is the pointer ball)
const BLOB_COUNT: u32 = 1u + BODY_COUNT;

const FIELD_THRESHOLD: f32 = 0.2;
// Where quinticFalloff(x) = 1 - FIELD_THRESHOLD, i.e. where a lone blob's
// surface sits. Update it if FIELD_THRESHOLD changes.
const SURFACE_X: f32 = 0.672;
// How far each blob's pull reaches (bigger = gooier merges); ~a third of it
// extends past the visible surface
const BLOB_INFLUENCE: f32 = 1.2;
// 1 / steepest slope of the field, keeps the raymarch from overshooting
const DISTANCE_SCALE: f32 = 0.5333 * BLOB_INFLUENCE;
const NORMAL_EPSILON: f32 = 0.001;

// Word framing: its largest scale, and how much of a small viewport it may fill
const WORD_MAX_SCALE: f32 = 1.1;
const WORD_FIT_RATIO: f32 = 0.85;
// Gentle vertical bob, in world units. The word stays flat on the z = 0 plane.
const WORD_BOB: f32 = 0.1;

// 1 on wide screens; shrinks with the word on narrow ones so the balls keep proportion
var<private> sceneScale: f32;
var<private> wordScale: f32;
var<private> wordCenter: vec3f;
// World units, xyz = center (z = 0, the word's plane), w = radius
var<private> bodies: array<vec4f, BODY_COUNT>;

struct FieldSample {
  // Summed falloff; > 0 means inside at least one blob's influence
  strength: f32,
  // Distance to the nearest influence region, when outside all of them
  nearestShell: f32,
}

// Quintic smoothstep: 0 at x = 0, 1 at x = 1, flat at both ends
fn quinticFalloff(x: f32) -> f32 {
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

fn sdSphere(position: vec3f, radius: f32) -> f32 {
  return length(position) - radius;
}

// Frames the word. Call before placeBody(), which reads the scale set here.
// visibleSize: world-space size of the view at the z = 0 plane
fn updateBlobs(time: f32, visibleSize: vec2f) {
  layoutTubeWord();
  let fitScale = WORD_FIT_RATIO * visibleSize / tubeWordSize;
  wordScale = min(WORD_MAX_SCALE, min(fitScale.x, fitScale.y));
  sceneScale = wordScale / WORD_MAX_SCALE;
  wordCenter = vec3f(0.0, WORD_BOB * sin(time * 0.5), 0.0);
}

// body: world units, xyz = center, w = radius before the narrow-screen shrink
fn placeBody(index: u32, body: vec4f) {
  bodies[index] = vec4f(body.xyz, body.w * sceneScale);
}

fn sdBlob(index: u32, position: vec3f) -> f32 {
  if (index == 0u) {
    // World -> word units, centred on the text block
    let wordPosition = (position - wordCenter) / wordScale + vec3f(tubeWordSize * 0.5, 0.0);
    return sdTubeWord(wordPosition) * wordScale;
  }

  let body = bodies[index - 1u];
  return sdSphere(position - body.xyz, body.w);
}

fn sampleMetaBlobs(position: vec3f) -> FieldSample {
  var strength = 0.0;
  var nearestShell = 1e20;

  for (var i = 0u; i < BLOB_COUNT; i++) {
    // Places a lone blob's iso-surface exactly on its shape's surface
    let x = SURFACE_X + sdBlob(i, position) / BLOB_INFLUENCE;

    if (x < 1.0) {
      // Same as 1 - quinticFalloff(x), since the curve is symmetric, but exact
      // near x = 1. There the subtraction rounds to 0 in f32: the blob then
      // counts neither as strength nor as nearestShell, the ray tunnels into
      // it and stops inside with a wrong normal (dotted rings and lines in the
      // reflections).
      strength += quinticFalloff(1.0 - max(x, 0.0));
    } else {
      nearestShell = min(nearestShell, (x - 1.0) * BLOB_INFLUENCE);
    }
  }

  return FieldSample(strength, nearestShell);
}

// Conservative distance to the merged surface
fn sdMetaBlobs(position: vec3f) -> f32 {
  let field = sampleMetaBlobs(position);

  if (field.strength > 0.0) {
    return DISTANCE_SCALE * (FIELD_THRESHOLD - field.strength);
  }
  return field.nearestShell + 0.1;
}

// Tetrahedral gradient of the field strength: 4 samples instead of 6
fn metaBlobsNormal(position: vec3f) -> vec3f {
  let e = vec2f(1.0, -1.0) * NORMAL_EPSILON;
  let gradient =
    e.xyy * sampleMetaBlobs(position + e.xyy).strength +
    e.yyx * sampleMetaBlobs(position + e.yyx).strength +
    e.yxy * sampleMetaBlobs(position + e.yxy).strength +
    e.xxx * sampleMetaBlobs(position + e.xxx).strength;

  let gradientLength = length(gradient);
  if (gradientLength < 1e-10) {
    return vec3f(0.0, 0.0, 1.0);
  }

  // Strength grows inward, so the outward normal points down the gradient
  return -gradient / gradientLength;
}
