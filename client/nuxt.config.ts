// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["@univerjs/presets/lib/styles/preset-sheets-core.css", "@/assets/css/main.css"],
  build: {
    transpile: ["@univerjs/presets"],
  },
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  vite: {
    optimizeDeps: {
      include: ["@univerjs/presets", "xlsx", "react", "react-dom", "exceljs", "uuid"],
    },
    resolve: {
      alias: {
        react: "react",
        "react-dom": "react-dom",
      },
    },
    define: {
      global: "globalThis",
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    },
    esbuild: {
      jsx: "automatic",
    },
  },
  ssr: true,
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "title", content: "Drools Workbench" },
      ],
    },
  },
  sourcemap: {
    client: false,
    server: false,
  },
});
