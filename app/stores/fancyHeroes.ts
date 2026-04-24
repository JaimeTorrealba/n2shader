export const useFancyHeroesStore = defineStore("fancyHeroes", () => {
  // Image transitions
  const currentFragment = ref(0);
  const next = ref<(() => void) | null>(null);
  const previous = ref<(() => void) | null>(null);
  const swapShader = ref<((index: number) => void) | null>(null);

  function register(fns: { next: () => void; previous: () => void; swapShader: (index: number) => void }) {
    next.value = fns.next;
    previous.value = fns.previous;
    swapShader.value = fns.swapShader;
  }

  // Texture demo
  const aoMapIntensity = ref(0.25);
  const normalScale = ref(0.25);
  const roughness = ref(0.5);
  const lightIntensity = ref(2.0);
  const lightColor = ref("#ffffff");

  // Backgrounds — shared
  const activeBackground = ref<'aurora' | 'floatingLines'>('floatingLines');

  // Aurora background
  const auroraColorStops = ref(['#7cff67', '#171D22', '#7cff67']);
  const auroraAmplitude = ref(1.0);
  const auroraBlend = ref(0.5);
  const auroraSpeed = ref(1.0);
  const auroraIntensity = ref(1.0);
  const auroraOffsetY = ref(-0.5);

  // Floating lines background
  const flLineCount = ref(15);
  const flLineDistance = ref(6);
  const flAnimationSpeed = ref(1.0);
  const flInteractive = ref(true);

  // Model hero
  const autoRotate = ref(true);
  const rotationSpeed = ref(0.25);
  const hdriIntensity = ref(0.4);
  const modelScale = ref(2.0);
  const modelX = ref(-2.0);
  const modelY = ref(0.5);

  return {
    currentFragment, next, previous, swapShader, register,
    aoMapIntensity, normalScale, roughness, lightIntensity, lightColor,
    activeBackground,
    auroraColorStops, auroraAmplitude, auroraBlend, auroraSpeed, auroraIntensity, auroraOffsetY,
    flLineCount, flLineDistance, flAnimationSpeed, flInteractive,
    autoRotate, rotationSpeed, hdriIntensity, modelScale, modelX, modelY,
  };
});
