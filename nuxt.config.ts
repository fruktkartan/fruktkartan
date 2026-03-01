export default defineNuxtConfig({
  compatibilityDate: "2026-02-01",
  ssr: false,
  modules: ["@pinia/nuxt", "@vite-pwa/nuxt", "vuetify-nuxt-module", "nuxt-svgo"],

  svgo: {
    svgo: false,
    defaultImport: "component",
  },

  css: ["@mdi/font/css/materialdesignicons.css", "~/assets/fonts.css"],

  vuetify: {
    vuetifyOptions: {
      defaults: {
        VCardActions: { VBtn: { variant: "elevated" } },
      },
    },
  },

  runtimeConfig: {
    public: {
      s3Base: "",
      githash: "?",
      timestamp: "?",
    },
  },

  pwa: {
    workbox: {
      // Include html so that index.html is precached and
      // createHandlerBoundToURL('/') works without throwing non-precached-url.
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
    },
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
          // Redirect legacy hash-based URLs (e.g. /#/t/123) before Vue Router
          // initialises, otherwise it warns about invalid CSS selectors.
          innerHTML: `(function(){
            var h = window.location.hash;
            if (h.startsWith('#/')) window.location.replace(h.slice(1));
          })();`,
        },
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
