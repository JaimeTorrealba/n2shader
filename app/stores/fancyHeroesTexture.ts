export const useFancyHeroesTextureStore = defineStore("fancyHeroesTexture", () => {
  const aoMapIntensity = ref(0.25);
  const normalScale = ref(0.25);
  const roughness = ref(0.5);
  const lightIntensity = ref(2.0);
  const lightColor = ref("#ffffff");

  return { aoMapIntensity, normalScale, roughness, lightIntensity, lightColor };
});
