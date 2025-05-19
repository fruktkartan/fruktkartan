<template>
  <v-app>
    <side-panel
      v-model="filters"
      :tree-is-being-added="addTreeStatus !== null"
      @add-tree="addTreeStatus = 'stage_1'"
    />
    <v-main>
      <!--position:absolute för att lira med navigation drawer-->
      <v-card
        class="fill-height"
        absolute
        width="100%"
        height="100%"
      >
        <fruit-map
          ref="map"
          v-model:center="center"
          v-model:zoom="zoom"
          :add-tree="['stage_1', 'stage_2'].includes(addTreeStatus)"
          :filters="filters"
          @tree-added="t => {
            newTree = { lat: t.lat, lon: t.lng }
            addTreeStatus = 'stage_2'
          }"
          @abort-add-tree="addTreeStatus = null"
        />
      </v-card>
      <about-us v-model="showFAQ" />
      <view-tree-dialog
        v-model="showTree"
        @tree-loaded="adjustMapToTree"
      />
      <add-tree-dialog
        v-model="showAddTree"
        :new-tree="newTree"
        @finished="() => {
          addTreeStatus = null
          showAddTree = false
          // trigger map reload, through exposed method in Map.vue
          $refs.map.fetchMarkers()
        }"
        @back="addTreeStatus = 'stage_1'"
      />
      <user-message />
    </v-main>
  </v-app>
</template>

<script setup>
const DEFAULT_MAP_CENTER = latLng(62.3908, 17.3069) // fallback
const MINIMUM_TREE_VIEW_ZOOM = 16 // zoom at least to here when viewing a tree

import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue"
import { useAppStore, useUserMessageStore } from "./stores/app"
import { useRoute, useRouter } from "vue-router"
import { latLng } from "leaflet"

import FruitMap from "./components/Map.vue"
// import TheMap from "./components/Map.vue"
import AboutUs from "./components/About.vue"
import ViewTreeDialog from "./components/ViewTreeDialog.vue"
import AddTreeDialog from "./components/AddTreeDialog.vue"
import SidePanel from "./components/SidePanel.vue"
import UserMessage from "./components/UserMessage.vue"

const map = ref(null)
const appStore = useAppStore()
const userMessageStore = useUserMessageStore()

const coordsFromLocalStorage = () => {
  if (localStorage && localStorage.mapCenter) {
    let [lat, lng] = localStorage.mapCenter.split(",")
    lat = parseFloat(lat)
    lng = parseFloat(lng)
    if (lat && lng) {
      return latLng(lat, lng)
    }
  }
  return null
}
const center = coordsFromLocalStorage()
  ? ref(coordsFromLocalStorage())
  : ref(DEFAULT_MAP_CENTER)

const zoom = ref(15)

const route = useRoute()
const router = useRouter()
const showFAQ = ref(route.path == "/om")
const showTree = ref(router.currentRoute.value?.params?.tree || null)
const filters = ref({
  tree: "*",
})
const newTree = ref(null)

// ROUTING
// Watch route to add event to goatcounter,
// and to display FAQ and trees.
// A simple routing hack, but does the work
watch(() => route.path, r => {

  showFAQ.value = r === "/om"

  if (r.startsWith("/t/")) {
    showTree.value = router.currentRoute.value.params.tree
  } else {
    showTree.value = null
  }

  if ("goatcounter" in window) {
    // send a page view to goatcounter
    // window.goatcounter.allow_local = true
    window.goatcounter.count({
      path: () => r.path,
      event: true,
    })
  }
})

watch(center => {
  if (!localStorage) {
    return
  }
  if (center?.value?.lat && center.value.lat)
    localStorage.mapCenter = [center.value.lat, center.value.lng]
})

onMounted(() => {
  // There might be a vue plugin for this, but on the other hand quite straightforward
  window.addEventListener("online", updateOnlineStatus)
  window.addEventListener("offline", updateOnlineStatus)

  const savedCoords = coordsFromLocalStorage()
  if (savedCoords) {
    center.value = savedCoords
  }
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

/**
 * Make sure a specific tree is visible on the map.
 *
 * After opening a tree dialog, we want to make sure the tree is visible.
 *
 * @param {Object} tree A tree object
 */
const adjustMapToTree = tree => {
  center.value = latLng(tree.lat, tree.lon)
  zoom.value = Math.max(zoom.value, MINIMUM_TREE_VIEW_ZOOM)
}

// ADD TREE STEPS
const addTreeStatus = ref(null) // null, 'stage_1', 'stage_2'
const showAddTree = computed(() => addTreeStatus.value === "stage_2")
</script>

<style></style>
