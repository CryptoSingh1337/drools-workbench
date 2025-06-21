// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  // Import Univer CSS
  css: ["@univerjs/presets/lib/styles/preset-sheets-core.css", "@/assets/css/main.css"],
  // Ensure proper transpilation
  build: {
    transpile: ["@univerjs/presets"],
  },
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  // Vite optimizations
  vite: {
    optimizeDeps: {
      include: ["@univerjs/presets", "xlsx", "react", "react-dom"],
      // exclude: [
      //   '@univerjs/presets/preset-sheets-core'
      // ]
    },
    // Handle React module resolution issues
    resolve: {
      alias: {
        react: "react",
        "react-dom": "react-dom",
      },
    },
    // Handle potential module resolution issues
    define: {
      global: "globalThis",
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    },
    // Ensure proper React handling
    esbuild: {
      jsx: "automatic",
    },
  },

  // SSR configuration
  ssr: false, // Disable SSR for client-side spreadsheet functionality
});
