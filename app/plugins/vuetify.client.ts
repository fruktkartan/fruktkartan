import { createVuetify } from "vuetify"
import { aliases as defaultAliases } from "vuetify/iconsets/mdi"
import trees from "~/assets/icons/trees.js"

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    icons: { aliases: { ...defaultAliases, ...trees } },
    defaults: {
      VCardActions: { VBtn: { variant: "elevated" } },
    },
  })
  nuxtApp.vueApp.use(vuetify)
})
