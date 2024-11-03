<template>
  <v-app>
    <side-panel
      v-model="filters"
      @show-about-us="showFAQ = true"
    />

    <v-main>
      <!--position:absolute för att lira med navigation drawer-->
      <v-card
        class="fill-height"
        absolute
        width="100%"
        height="100%"
      >
        <karta
          ref="map"
          :filters="filters"
        />
      </v-card>
      <about-us v-model="showFAQ" />
      <user-message />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore, useUserMessageStore } from './stores/app'
import { useRoute } from "vue-router";

import Karta from "./components/Karta.vue"
// import TheMap from "./components/Map.vue"
import AboutUs from "./components/About.vue"
import SidePanel from "./components/SidePanel.vue"
import UserMessage from "./components/UserMessage.vue"

const map = ref()
const appStore = useAppStore()
const userMessageStore = useUserMessageStore()

const route = useRoute()
const showFAQ = ref(route.path == "/om")

const filters = ref({ 
  tree: "*",
})

const selectedTreeName = computed(() => {
  let treeKey = filters.tree
  if (treeKey === "*") {
    return "alla träd"
  } else {
    return selectTreeTypes.find(x => x.value === treeKey).text
  }
})

//watch route to add event to goatcounter
watch(() => route.path, (r) => {
  showFAQ.value = r === "/om"
  if ("goatcounter" in window) {
    // send a page view to goatcounter
    // window.goatcounter.allow_local = true
    window.goatcounter.count({
      path: () => r.path,
      event: true,
    })
  }
})

onMounted(() => {
    // There might be a vue plugin for this, but on the other hand quite straightforward
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
})
onBeforeUnmount(() => {
  window.removeEventListener("online", updateOnlineStatus)
  window.removeEventListener("offline", updateOnlineStatus)
})
const updateOnlineStatus = ({ type }) => {
  if (type === "offline") {
    appStore.setOffline(true)
    userMessageStore.push(
      "Du är offline, och kommer inte kunna lägga till eller ta bort träd",
      "warning",
    )
  } else {
    appStore.setOffline(false)
  }
}
updateOnlineStatus({ type: navigator.onLine ? "online" : "offline" })
</script>

<style>
</style>
