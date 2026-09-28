/// -----------------------------------------------------------------------------
/// "N2S" as monoline chrome tubes
///
/// Each glyph is a centreline of segments and circular arcs, laid out in 2D
/// word units (baseline at y = 0, x-height = 1). The tube is every point within
/// STROKE_RADIUS of that centreline, so its exact 3D distance is
/// length(vec2(planarDistance, z)) - STROKE_RADIUS.
///
/// Segment distance by Inigo Quilez (iq)
///   https://iquilezles.org/articles/distfunctions2d/
/// -----------------------------------------------------------------------------

const GLYPH_COUNT: u32 = 3u;
const CAP_HEIGHT: f32 = 1.4;
const STROKE_RADIUS: f32 = 0.14;
// Space between neighbouring glyph boxes, centreline to centreline
const GLYPH_GAP: f32 = 0.45;
const FULL_TURN: f32 = 6.28318531;
// Fillet size where strokes join, in word units
const STROKE_JOIN_SMOOTHNESS: f32 = 0.06;

// Width of each glyph's centreline box, in order: N 2 S
var<private> glyphWidths: array<f32, GLYPH_COUNT> = array<f32, GLYPH_COUNT>(0.95, 0.9, 0.7);

// Filled by layoutTubeWord(): each glyph's bottom-left corner, and the size of
// the whole word (origin at its bottom-left)
var<private> glyphOrigins: array<vec2f, GLYPH_COUNT>;
var<private> tubeWordSize: vec2f;

fn udSegment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Arc starting at `startDegrees` and running counter-clockwise for `sweepDegrees`
fn udArc(p: vec2f, center: vec2f, radius: f32, startDegrees: f32, sweepDegrees: f32) -> f32 {
  let q = p - center;
  let startAngle = radians(startDegrees);
  let sweep = radians(sweepDegrees);

  // Angle of q measured counter-clockwise from the start, wrapped to [0, 2π)
  let angle = atan2(q.y, q.x) - startAngle;
  let wrappedAngle = angle - FULL_TURN * floor(angle / FULL_TURN);
  if (wrappedAngle <= sweep) {
    return abs(length(q) - radius);
  }

  // Outside the arc's wedge the nearest point is one of its ends
  let endAngle = startAngle + sweep;
  let startPoint = radius * vec2f(cos(startAngle), sin(startAngle));
  let endPoint = radius * vec2f(cos(endAngle), sin(endAngle));
  return min(length(q - startPoint), length(q - endPoint));
}

// Unions two strokes that meet at an angle with a small fillet. A plain min()
// leaves a sharp crease there, and the jump in the normal shows up as jagged
// highlights. Only for angled joins (N, the 2's corner): strokes that meet
// tangentially run close together, and this would swell the tube along them.
// Polynomial smooth min by iq (https://iquilezles.org/articles/smin/), clamped
// so the fillet never pushes the centreline distance below zero.
fn joinStrokes(a: f32, b: f32) -> f32 {
  let h = max(STROKE_JOIN_SMOOTHNESS - abs(a - b), 0.0) / STROKE_JOIN_SMOOTHNESS;
  return max(min(a, b) - h * h * STROKE_JOIN_SMOOTHNESS * 0.25, 0.0);
}

fn udGlyphN(q: vec2f) -> f32 {
  let leftStem = udSegment(q, vec2f(0.0, 0.0), vec2f(0.0, CAP_HEIGHT));
  let diagonal = udSegment(q, vec2f(0.0, CAP_HEIGHT), vec2f(0.95, 0.0));
  let rightStem = udSegment(q, vec2f(0.95, 0.0), vec2f(0.95, CAP_HEIGHT));
  return joinStrokes(leftStem, joinStrokes(diagonal, rightStem));
}

// Top bowl flowing into a diagonal, then a flat base
fn udGlyphTwo(q: vec2f) -> f32 {
  let bowlCenter = vec2f(0.45, 0.98);
  let bowlRadius = 0.42;
  let bowlEnd = bowlCenter + bowlRadius * vec2f(cos(radians(-40.0)), sin(radians(-40.0)));

  let bowl = udArc(q, bowlCenter, bowlRadius, -40.0, 200.0);
  let diagonal = udSegment(q, bowlEnd, vec2f(0.0, 0.0));
  let base = udSegment(q, vec2f(0.0, 0.0), vec2f(0.9, 0.0));
  return min(bowl, joinStrokes(diagonal, base));
}

// Two stacked bowls that meet tangentially in the middle
fn udGlyphS(q: vec2f) -> f32 {
  let upperBowl = udArc(q, vec2f(0.35, 1.05), 0.35, 20.0, 250.0);
  let lowerBowl = udArc(q, vec2f(0.35, 0.35), 0.35, 200.0, 250.0);
  return min(upperBowl, lowerBowl);
}

// Distance to glyph `index`'s centreline; q has the glyph's bottom-left at 0
fn udGlyph(index: u32, q: vec2f) -> f32 {
  var planarDistance: f32;

  switch index {
    case 0u: {
      planarDistance = udGlyphN(q);
    }
    case 1u: {
      planarDistance = udGlyphTwo(q);
    }
    default: {
      planarDistance = udGlyphS(q);
    }
  }

  return planarDistance;
}

// Single line: glyphs side by side on one baseline
fn layoutTubeWord() {
  var cursor = 0.0;
  for (var i = 0u; i < GLYPH_COUNT; i++) {
    glyphOrigins[i] = vec2f(cursor, 0.0);
    cursor += glyphWidths[i] + GLYPH_GAP;
  }

  // Drop the trailing gap after the last glyph
  tubeWordSize = vec2f(cursor - GLYPH_GAP, CAP_HEIGHT);
}

// Word units, origin at the word's bottom-left. Needs layoutTubeWord() first.
fn sdTubeWord(wordPosition: vec3f) -> f32 {
  var nearest = 1e20;

  for (var i = 0u; i < GLYPH_COUNT; i++) {
    let glyphWidth = glyphWidths[i];
    let q = wordPosition.xy - glyphOrigins[i];

    // The tube can't be nearer than its glyph's box, so skip glyphs that can't win
    let halfSize = vec2f(glyphWidth, CAP_HEIGHT) * 0.5;
    let outside = abs(q - halfSize) - halfSize;
    let boxDistance = length(max(outside, vec2f(0.0)));
    if (boxDistance - STROKE_RADIUS >= nearest) {
      continue;
    }

    nearest = min(nearest, length(vec2f(udGlyph(i, q), wordPosition.z)) - STROKE_RADIUS);
  }

  return nearest;
}
