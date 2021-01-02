const config = {
  transpileDependencies: ["vuetify"],
  pwa: {
    name: "Fruktkartan",
    themeColor: "#813717",
    msTileColor: "#ffffff",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "default",
    manifestOptions: {
      background_color: "#ffffff",
      description:
        "Fruktkartan är en öppen databas över fruktträd " +
        "på allmänningar och i parker.",
      lang: "sv",
      categories: ["food", "navigation"],
      shortcuts: [
        {
          name: "Om",
          url: "/#/om",
          description: "Om Fruktkartan",
        },
      ],
    },
    // configure the workbox plugin
    workboxPluginMode: "GenerateSW", // "InjectManifest",
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      // swSrc: "public/service-worker.js",
      // ...other Workbox options...
    },
  },
}

module.exports = config
