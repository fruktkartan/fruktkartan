import "vuetify/styles"
import "@mdi/font/css/materialdesignicons.css"
import { createVuetify } from "vuetify"
import { aliases as defaultAliases } from "vuetify/iconsets/mdi"
import trees from "@/assets/icons/trees.js"

// Merge our tree icons with the default mdi icons,
// so that we can use them seemlessly with Vuetify.
const iconAliases = {
  ...defaultAliases,
  ...trees,
}

export default createVuetify({
  icons: {
    aliases: iconAliases,
  },
})
