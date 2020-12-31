const config = {
  transpileDependencies: ["vuetify"],
  pwa: {
    name: "Fruktkartan",
    themeColor: "#813717",
    msTileColor: "#ffffff",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "default",

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
