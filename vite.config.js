import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify"
import svgLoader from "vite-svg-loader"
import { resolve } from "path"
import path from "path"
import { fileURLToPath } from "url"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify(),
    svgLoader(),
  ],
  resolve: {
    alias: {
      "@": resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
    },
  },
})
