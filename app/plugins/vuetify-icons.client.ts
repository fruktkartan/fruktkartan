import trees from "~/assets/icons/trees.js"

export default defineNuxtPlugin(nuxtApp => {
  // Hook runs before createVuetify() so aliases are included from creation time
  nuxtApp.hook("vuetify:before-create", ({ vuetifyOptions }) => {
    vuetifyOptions.icons ??= {}
    vuetifyOptions.icons.aliases = {
      ...vuetifyOptions.icons.aliases,
      ...trees,
    }
  })
})
