import { createApp } from "vue"
import App from "./App.vue"
import vuetify from "./plugins/vuetify.js"

import { createRouter, createWebHashHistory } from "vue-router"
import { createPinia } from "pinia"
import "./registerServiceWorker"

const app = createApp(App)
const pinia = createPinia({
  state: {
    offline: navigator && !navigator.onLine,
  },
  mutations: {
    offline(state, status) {
      state.offline = status
    },
  },
})
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/om",
      component: () => import("./components/AboutUs.vue"),
    },
    {
      path: "/",
      component: () => import("./App.vue"),
    },
    {
      path: "/t/:tree",
      component: () => import("./components/ViewTreeDialog.vue"),
      props: true,
    },
    {
      path: "/nytt",
      component: () => import("./components/AddTreeDialog.vue"),
    },
  ],
})
app.use(vuetify).use(pinia).use(router).mount("#app")
