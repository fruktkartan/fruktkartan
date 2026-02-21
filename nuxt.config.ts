import svgLoader from "vite-svg-loader"

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  future: { compatibilityVersion: 4 },
  ssr: false,
  modules: ["@pinia/nuxt", "@vite-pwa/nuxt", "vuetify-nuxt-module"],
  css: ["@mdi/font/css/materialdesignicons.css", "~/assets/fonts.css"],
  vite: {
    plugins: [svgLoader()],
  },
  vuetify: {
    vuetifyOptions: {
      defaults: {
        VCardActions: { VBtn: { variant: "elevated" } },
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBase: "",
      s3Base: "",
      githash: "?",
      timestamp: "?",
    },
  },
  pwa: {
    manifest: {
      name: "Fruktkartan: en kollaborativ karta över fruktträd",
      short_name: "Fruktkartan",
      display: "standalone",
      icons: [{ src: "favicon.png", sizes: "any" }],
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "sv" },
      title: "Fruktkartan",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width,initial-scale=1.0" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "sv_SE" },
        { property: "og:site_name", content: "Fruktkartan.se" },
        { property: "og:title", content: "Fruktkartan" },
        { property: "og:url", content: "https://fruktkartan.se" },
        {
          name: "description",
          property: "og:description",
          content:
            "Fruktkartan är en öppen databas över fruktträd på allmänningar och i parker.",
        },
        { property: "og:image", content: "https://fruktkartan.se/og-f.png" },
      ],
      link: [{ rel: "icon", href: "/favicon.ico" }],
      script: [
        {
          innerHTML: `if (window.location.hostname == "fruktkartan.se") {
            window.goatcounter = { endpoint: "https://frukt.goatcounter.com/count" }
          }`,
        },
        { src: "/count.js", async: true },
      ],
    },
  },
})
