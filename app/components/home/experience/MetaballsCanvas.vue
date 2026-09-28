<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 block size-full opacity-0"
  />
</template>

<script setup lang="ts">
const { $gsap } = useNuxtApp();

// Where the pointer ball rests when the cursor is away, in shader screen space.
// Below the word, not the centre, so it doesn't sit on the letters and blur them,
// while staying clear of the navbar dock at the bottom. The other balls fall toward it.
const MOUSE_REST_POSITION = { x: 0, y: -0.6 };
// With reduced motion the word's bob holds still at this point
const FROZEN_SCENE_TIME = 4;
// Clamp long frames (tab switch, hitch) so the balls never jump
const MAX_FRAME_DELTA_MS = 50;
// Reflections only, never shown as background
const ENVIRONMENT_MAP_URL = "/hdri/ferndale_studio_12_1k.hdr";

type MouseBallSetter = (value: number) => void;

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const { left, top, width, height } = useElementBounding(canvasRef);
const isHeroVisible = ref(false);

let metaballsRenderer: MetaballsRenderer | null = null;
let motionMatchMedia: ReturnType<typeof $gsap.matchMedia> | null = null;
let isUnmounted = false;
let isMotionReduced = false;
let sceneTime = 0;

// Smoothed pointer position; the gravity sim puts the pointer ball here every frame
const mouseBall = { ...MOUSE_REST_POSITION };
const gravityBodies = createGravityBodies(MOUSE_REST_POSITION.x, MOUSE_REST_POSITION.y);
let moveMouseBallX: MouseBallSetter = (value) => (mouseBall.x = value);
let moveMouseBallY: MouseBallSetter = (value) => (mouseBall.y = value);

const setMouseBallTarget = (x: number, y: number) => {
  moveMouseBallX(x);
  moveMouseBallY(y);
};

const returnMouseBallToRest = () =>
  setMouseBallTarget(MOUSE_REST_POSITION.x, MOUSE_REST_POSITION.y);

// Last mouse/pen position, re-checked on scroll (touch is left out on purpose)
let lastPointerPosition: { clientX: number; clientY: number } | null = null;

// Hit-tests the element actually under the cursor, not the hero's rect: the
// navbar floats over the hero and the next section slides over it on scroll.
// The canvas ignores pointer events, so its parent (the hero) is what gets hit.
const isPointerOverHero = (hitElement: EventTarget | null) =>
  hitElement instanceof Node && !!canvasRef.value?.parentElement?.contains(hitElement);

// Maps the cursor to the shader's screen space: x in [-aspect, aspect], y in [-1, 1], y up
const aimMouseBall = (clientX: number, clientY: number, hitElement: EventTarget | null) => {
  const canvasWidth = width.value;
  const canvasHeight = height.value;

  if (!canvasHeight || !isPointerOverHero(hitElement)) {
    returnMouseBallToRest();
    return;
  }

  const x = clientX - left.value;
  const y = clientY - top.value;
  setMouseBallTarget((2 * x - canvasWidth) / canvasHeight, (canvasHeight - 2 * y) / canvasHeight);
};

const followPointer = (event: PointerEvent) => {
  lastPointerPosition =
    event.pointerType === "touch" ? null : { clientX: event.clientX, clientY: event.clientY };
  aimMouseBall(event.clientX, event.clientY, event.target);
};

// Scrolling moves content under a still cursor without firing pointermove
const refollowPointerOnScroll = () => {
  if (!lastPointerPosition) return;
  const { clientX, clientY } = lastPointerPosition;
  aimMouseBall(clientX, clientY, document.elementFromPoint(clientX, clientY));
};

const forgetPointer = () => {
  lastPointerPosition = null;
  returnMouseBallToRest();
};

const renderMetaballsTick = (_time: number, deltaTime: number) => {
  if (!metaballsRenderer || !isHeroVisible.value) return;

  // With reduced motion nothing moves on its own: a zero step only places the pointer ball
  const deltaSeconds = isMotionReduced ? 0 : Math.min(deltaTime, MAX_FRAME_DELTA_MS) / 1000;
  const aspect = height.value ? width.value / height.value : 1;

  sceneTime += deltaSeconds;
  stepGravityBodies(gravityBodies, mouseBall.x, mouseBall.y, aspect, deltaSeconds);
  metaballsRenderer.renderMetaballsFrame(sceneTime, gravityBodies);
};

const setupMetaballsMotion = (canvas: HTMLCanvasElement) => {
  motionMatchMedia = $gsap.matchMedia();
  motionMatchMedia.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      allowMotion: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };
      isMotionReduced = reduceMotion;

      if (reduceMotion) {
        sceneTime = FROZEN_SCENE_TIME;
        moveMouseBallX = (value) => (mouseBall.x = value);
        moveMouseBallY = (value) => (mouseBall.y = value);
        $gsap.set(canvas, { opacity: 1 });
        return;
      }

      moveMouseBallX = $gsap.quickTo(mouseBall, "x", { duration: 0.8, ease: "power3.out" });
      moveMouseBallY = $gsap.quickTo(mouseBall, "y", { duration: 0.8, ease: "power3.out" });
      $gsap.to(canvas, { opacity: 1, duration: 1.6, ease: "power3.out" });
    }
  );
};

const teardownMetaballs = () => {
  $gsap.ticker.remove(renderMetaballsTick);
  motionMatchMedia?.revert();
  motionMatchMedia = null;
  metaballsRenderer?.destroyMetaballsRenderer();
  metaballsRenderer = null;
};

useIntersectionObserver(canvasRef, ([entry]) => {
  isHeroVisible.value = entry?.isIntersecting ?? false;
});

useResizeObserver(canvasRef, ([entry]) => {
  if (!entry) return;
  metaballsRenderer?.resizeMetaballsCanvas(entry.contentRect.width, entry.contentRect.height);
});

useEventListener(window, "pointermove", followPointer, { passive: true });
useEventListener(window, "scroll", refollowPointerOnScroll, { passive: true });
useEventListener(document.documentElement, "pointerleave", forgetPointer);

onMounted(async () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // null means no WebGPU: the canvas stays transparent and the section's black shows
  const renderer = await createMetaballsRenderer(canvas, {
    environmentMapUrl: ENVIRONMENT_MAP_URL,
    onDeviceLost: teardownMetaballs,
  });
  if (!renderer) return;

  if (isUnmounted) {
    renderer.destroyMetaballsRenderer();
    return;
  }

  metaballsRenderer = renderer;
  renderer.resizeMetaballsCanvas(canvas.clientWidth, canvas.clientHeight);
  setupMetaballsMotion(canvas);
  $gsap.ticker.add(renderMetaballsTick);
});

onBeforeUnmount(() => {
  isUnmounted = true;
  teardownMetaballs();
});
</script>
