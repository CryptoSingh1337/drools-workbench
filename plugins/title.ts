export default defineNuxtPlugin(() => {
  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Drools Workbench` : "Drools Workbench";
    },
  });
});
