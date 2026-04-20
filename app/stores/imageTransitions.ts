export const useImageTransitionsStore = defineStore("imageTransitions", () => {
  const currentFragment = ref(0);
  const next = ref<(() => void) | null>(null);
  const previous = ref<(() => void) | null>(null);
  const swapShader = ref<((index: number) => void) | null>(null);

  function register(fns: { next: () => void; previous: () => void; swapShader: (index: number) => void }) {
    next.value = fns.next;
    previous.value = fns.previous;
    swapShader.value = fns.swapShader;
  }

  return { currentFragment, next, previous, swapShader, register };
});
