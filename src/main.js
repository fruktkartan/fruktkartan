// polyfill fetch() for IE (and more?)
import "whatwg-fetch"

import Vue from "vue"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import VueRouter from "vue-router"
import Vuex from "vuex"
import "./registerServiceWorker"

Vue.config.productionTip = false
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    offline: navigator && !navigator.onLine,
  },
  mutations: {
    offline(state, status) {
      state.offline = status
    },
  },
})

Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    {
      path: "/om",
    },
    {
      path: "/t/:tree",
      props: true,
    },
  ],
})

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount("#app")
