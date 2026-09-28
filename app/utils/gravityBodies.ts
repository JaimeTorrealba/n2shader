/**
 * n-body gravity for the hero metaballs
 *
 * Based on "The Nature of Code", Example 2.9: n Bodies, by Daniel Shiffman
 *   https://natureofcode.com/forces/#example-29-n-bodies
 *
 * Every body pulls on every other with F = G·m1·m2 / d², and d is clamped so
 * close passes can't fling bodies away while far ones still feel a pull. Body
 * 0 is the pointer ball: it pulls like the rest but follows the pointer
 * instead of the forces, so everything else falls toward it. Added: bounces
 * off the canvas edges so nothing drifts out of view.
 *
 * Units are the pointer's screen space: y in [-1, 1] (1 = half the canvas
 * height), x in [-aspect, aspect], y up. Time is in seconds.
 */

export interface GravityBody {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  // How hard it pulls on the others
  mass: number;
  // How much of the others' pull it feels: pace², see SMALL_BALL_PACE
  pullResponse: number;
}

const POINTER_BALL_INDEX = 0;
const POINTER_BALL_RADIUS = 0.26;
const MEDIUM_BALL_RADIUS = 0.18;
// Small balls travel their paths at this share of the speed gravity alone
// would give them. Feeling pace² of every pull slows a path down by pace
// without changing its shape (it's like extra inertia), so they still orbit
// and melt through the others, just calmer. They still pull at full mass.
const SMALL_BALL_PACE = 0.5;

// Free bodies start on circular orbits around the pointer ball, all in its
// upper half so they begin on screen. orbitAngle is in degrees, counter-clockwise from +x.
const FREE_BODY_STARTS = [
  { radius: MEDIUM_BALL_RADIUS, pace: 1, orbitDistance: 0.6, orbitAngle: 30 },
  { radius: MEDIUM_BALL_RADIUS, pace: 1, orbitDistance: 0.85, orbitAngle: 145 },
  { radius: 0.1, pace: SMALL_BALL_PACE, orbitDistance: 0.45, orbitAngle: 100 },
  { radius: 0.08, pace: SMALL_BALL_PACE, orbitDistance: 0.7, orbitAngle: 70 },
  { radius: 0.06, pace: SMALL_BALL_PACE, orbitDistance: 1.0, orbitAngle: 165 },
];

// Must match BODY_COUNT in metaballField.wgsl
export const GRAVITY_BODY_COUNT = 1 + FREE_BODY_STARTS.length;

// A body 0.6 away circles the pointer ball in about 6 seconds
const GRAVITATIONAL_CONSTANT = 0.25;
// Pull distance clamp, the example's constrain(distance, 5, 25)
const MIN_PULL_DISTANCE = 0.2;
const MAX_PULL_DISTANCE = 1.2;
// Caps slingshots off a fast-moving pointer ball
const MAX_SPEED = 2.5;
// Share of the speed kept when bouncing off the canvas edges. Lossless: any
// loss cools the system until the heavy balls settle on the pointer ball.
const EDGE_BOUNCE = 1;
// Longest integration step; longer frames are split so orbits stay stable
const MAX_SUBSTEP_SECONDS = 1 / 120;

// Mass grows with volume; the pointer ball weighs 1
const massFromRadius = (radius: number) => (radius / POINTER_BALL_RADIUS) ** 3;

const clampPullDistance = (distance: number) =>
  Math.min(Math.max(distance, MIN_PULL_DISTANCE), MAX_PULL_DISTANCE);

export const createGravityBodies = (pointerX: number, pointerY: number): GravityBody[] => {
  const pointerBall: GravityBody = {
    x: pointerX,
    y: pointerY,
    velocityX: 0,
    velocityY: 0,
    radius: POINTER_BALL_RADIUS,
    mass: massFromRadius(POINTER_BALL_RADIUS),
    // Never pulled, it follows the pointer
    pullResponse: 0,
  };

  const freeBodies = FREE_BODY_STARTS.map(({ radius, pace, orbitDistance, orbitAngle }) => {
    const angle = (orbitAngle * Math.PI) / 180;
    // Circular orbit speed, v = pace·sqrt(G·M / d); every start sits inside the pull clamp
    const orbitSpeed = pace * Math.sqrt((GRAVITATIONAL_CONSTANT * pointerBall.mass) / orbitDistance);

    return {
      x: pointerX + orbitDistance * Math.cos(angle),
      y: pointerY + orbitDistance * Math.sin(angle),
      velocityX: -orbitSpeed * Math.sin(angle),
      velocityY: orbitSpeed * Math.cos(angle),
      radius,
      mass: massFromRadius(radius),
      pullResponse: pace * pace,
    };
  });

  return [pointerBall, ...freeBodies];
};

// Each pair once: equal and opposite pulls. Bodies never collide, they pass
// through each other and the metaball field melts them together. a = F / m,
// so the change in a body's velocity scales with the other body's mass, not
// its own (then with its pullResponse).
const pullBodiesTogether = (bodies: GravityBody[], deltaSeconds: number) => {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bodyA = bodies[i]!;
      const bodyB = bodies[j]!;
      const offsetX = bodyB.x - bodyA.x;
      const offsetY = bodyB.y - bodyA.y;
      const distance = Math.hypot(offsetX, offsetY);
      if (distance === 0) continue;

      const pullDistance = clampPullDistance(distance);
      // G / d², spread over the offset (hence the extra / distance) and the step
      const pull = (GRAVITATIONAL_CONSTANT / (pullDistance * pullDistance) / distance) * deltaSeconds;

      const pullOnA = pull * bodyB.mass * bodyA.pullResponse;
      const pullOnB = pull * bodyA.mass * bodyB.pullResponse;
      bodyA.velocityX += offsetX * pullOnA;
      bodyA.velocityY += offsetY * pullOnA;
      bodyB.velocityX -= offsetX * pullOnB;
      bodyB.velocityY -= offsetY * pullOnB;
    }
  }
};

// The example's checkEdges(): keeps the whole ball on the canvas
const bounceOffEdges = (body: GravityBody, halfWidth: number) => {
  const limitX = Math.max(halfWidth - body.radius, 0);
  const limitY = 1 - body.radius;

  if (Math.abs(body.x) > limitX) {
    body.x = Math.sign(body.x) * limitX;
    body.velocityX = -Math.sign(body.x) * Math.abs(body.velocityX) * EDGE_BOUNCE;
  }
  if (Math.abs(body.y) > limitY) {
    body.y = Math.sign(body.y) * limitY;
    body.velocityY = -Math.sign(body.y) * Math.abs(body.velocityY) * EDGE_BOUNCE;
  }
};

const moveFreeBody = (body: GravityBody, halfWidth: number, deltaSeconds: number) => {
  const speed = Math.hypot(body.velocityX, body.velocityY);
  if (speed > MAX_SPEED) {
    body.velocityX *= MAX_SPEED / speed;
    body.velocityY *= MAX_SPEED / speed;
  }

  body.x += body.velocityX * deltaSeconds;
  body.y += body.velocityY * deltaSeconds;
  bounceOffEdges(body, halfWidth);
};

/**
 * Moves the pointer ball to the pointer and advances the rest. A delta of 0
 * (reduced motion) only places the pointer ball and keeps bodies on the canvas.
 * halfWidth: the canvas aspect ratio, the x extent of screen space.
 */
export const stepGravityBodies = (
  bodies: GravityBody[],
  pointerX: number,
  pointerY: number,
  halfWidth: number,
  deltaSeconds: number
) => {
  const pointerBall = bodies[POINTER_BALL_INDEX]!;
  pointerBall.x = pointerX;
  pointerBall.y = pointerY;

  const substeps = Math.max(1, Math.ceil(deltaSeconds / MAX_SUBSTEP_SECONDS));
  const substepSeconds = deltaSeconds / substeps;

  for (let step = 0; step < substeps; step++) {
    // Velocities first, then positions (semi-implicit Euler, as in the example)
    pullBodiesTogether(bodies, substepSeconds);
    bodies.forEach((body, index) => {
      if (index !== POINTER_BALL_INDEX) moveFreeBody(body, halfWidth, substepSeconds);
    });
  }
};
