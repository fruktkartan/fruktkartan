import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.js'

import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
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
  history: createWebHistory(),
  routes: [
    {
      path: "/om",
      component: () => import("./components/About.vue"),
    }, {
      path: "/",
      component: () => import("./App.vue"),
    }, {
      path: "/t/:tree",
      props: true,
    },
  ],
})
app
  .use(vuetify)
  .use(pinia)
  .use(router)
  .mount('#app')
