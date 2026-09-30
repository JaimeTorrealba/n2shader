import { describe, expect, it } from 'vitest'
import {
  createGravityBodies,
  GRAVITY_BODY_COUNT,
  stepGravityBodies,
} from '../../app/utils/gravityBodies'

// Same rest point as MetaballsCanvas.vue
const POINTER_REST_X = 0
const POINTER_REST_Y = -0.6
const LANDSCAPE_ASPECT = 16 / 9
const FRAME_SECONDS = 1 / 60

const runGravityFrames = (seconds: number, aspect = LANDSCAPE_ASPECT) => {
  const bodies = createGravityBodies(POINTER_REST_X, POINTER_REST_Y)
  const frameCount = Math.round(seconds / FRAME_SECONDS)
  for (let frame = 0; frame < frameCount; frame++) {
    stepGravityBodies(bodies, POINTER_REST_X, POINTER_REST_Y, aspect, FRAME_SECONDS)
  }
  return bodies
}

describe('createGravityBodies', () => {
  it('creates as many bodies as the shader expects, pointer ball first', () => {
    const bodies = createGravityBodies(0.3, -0.2)

    expect(bodies).toHaveLength(GRAVITY_BODY_COUNT)
    expect(bodies[0]).toMatchObject({ x: 0.3, y: -0.2, velocityX: 0, velocityY: 0 })
  })

  it('makes the pointer ball the heaviest and immune to pulls', () => {
    const [pointerBall, ...freeBodies] = createGravityBodies(0, 0)

    expect(pointerBall!.pullResponse).toBe(0)
    freeBodies.forEach((body) => expect(body.mass).toBeLessThan(pointerBall!.mass))
  })
})

describe('stepGravityBodies', () => {
  it('only places the pointer ball on a zero step (reduced motion)', () => {
    const bodies = createGravityBodies(POINTER_REST_X, POINTER_REST_Y)
    const freeBodiesBefore = structuredClone(bodies.slice(1))

    stepGravityBodies(bodies, 0.5, 0.25, LANDSCAPE_ASPECT, 0)

    expect(bodies[0]).toMatchObject({ x: 0.5, y: 0.25 })
    expect(bodies.slice(1)).toEqual(freeBodiesBefore)
  })

  it('keeps the pointer ball exactly on the pointer while the rest move', () => {
    const bodies = runGravityFrames(5)

    expect(bodies[0]).toMatchObject({ x: POINTER_REST_X, y: POINTER_REST_Y })
  })

  it.each([
    ['landscape', LANDSCAPE_ASPECT],
    ['portrait', 390 / 844],
  ])('keeps every ball fully on a %s canvas over a long run', (_label, aspect) => {
    const bodies = runGravityFrames(120, aspect)

    bodies.forEach((body) => {
      expect(Math.abs(body.x)).toBeLessThanOrEqual(Math.max(aspect - body.radius, 0) + 1e-9)
      expect(Math.abs(body.y)).toBeLessThanOrEqual(1 - body.radius + 1e-9)
      expect(Number.isFinite(body.velocityX) && Number.isFinite(body.velocityY)).toBe(true)
    })
  })

  it('splits a long frame into substeps instead of jumping', () => {
    const steppedOnce = createGravityBodies(POINTER_REST_X, POINTER_REST_Y)
    stepGravityBodies(steppedOnce, POINTER_REST_X, POINTER_REST_Y, LANDSCAPE_ASPECT, 0.05)

    const steppedInSubsteps = createGravityBodies(POINTER_REST_X, POINTER_REST_Y)
    for (let substep = 0; substep < 6; substep++) {
      stepGravityBodies(steppedInSubsteps, POINTER_REST_X, POINTER_REST_Y, LANDSCAPE_ASPECT, 0.05 / 6)
    }

    steppedOnce.forEach((body, index) => {
      expect(body.x).toBeCloseTo(steppedInSubsteps[index]!.x, 10)
      expect(body.y).toBeCloseTo(steppedInSubsteps[index]!.y, 10)
    })
  })
})
