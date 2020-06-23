// polyfill fetch() for IE (and more?)
import "whatwg-fetch"

import Vue from "vue"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import VueRouter from "vue-router"

Vue.config.productionTip = false
Vue.use(VueRouter)
const router = new VueRouter([
  {
    path: "om",
    name: "om",
  },
])

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount("#app")
