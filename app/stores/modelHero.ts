export const useModelHeroStore = defineStore("modelHero", () => {
  const autoRotate = ref(true);
  const rotationSpeed = ref(0.25);
  const hdriIntensity = ref(0.4);
  const modelScale = ref(2.0);
  const modelX = ref(-20.0);
  const modelY = ref(0.5);

  return { autoRotate, rotationSpeed, hdriIntensity, modelScale, modelX, modelY };
});
