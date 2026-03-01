<template>
  <v-app>
    <side-panel
      v-model="filters"
      :tree-is-being-added="addTreeStatus !== null"
      @add-tree="addTreeStatus = 'stage_1'"
    />
    <v-main>
      <!--position:absolute för att lira med navigation drawer-->
      <v-card class="fill-height" absolute width="100%" height="100%">
        <fruit-map
          ref="map"
          v-model:center="center"
          v-model:zoom="zoom"
          :add-tree="['stage_1', 'stage_2'].includes(addTreeStatus)"
          :filters="filters"
          @tree-added="
            t => {
              newTree = { lat: t.lat, lon: t.lng }
              addTreeStatus = 'stage_2'
            }
          "
          @abort-add-tree="addTreeStatus = null"
        />
      </v-card>
      <about-us v-model="showFAQ" />
      <view-tree-dialog v-model="showTree" @tree-loaded="adjustMapToTree" />
      <add-tree-dialog
        v-model="showAddTree"
        :new-tree="newTree"
        @finished="
          () => {
            addTreeStatus = null
            // trigger map reload, through exposed method in FruitMap.vue
            $refs.map.fetchMarkers()
          }
        "
        @back="addTreeStatus = 'stage_1'"
      />
      <user-message />
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
import { latLng } from "leaflet"
import { useAppStore, useUserMessageStore } from "~/stores/app"

const DEFAULT_MAP_CENTER = latLng(62.3908, 17.3069) // fallback
const MINIMUM_TREE_VIEW_ZOOM = 16 // zoom at least to here when viewing a tree

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
const center = ref(coordsFromLocalStorage() ?? DEFAULT_MAP_CENTER)

const zoom = ref(15)

const route = useRoute()
const showFAQ = ref(route.path == "/om")
const showTree = ref(route.params.tree ?? null)
const filters = ref({
  tree: "*",
})
const newTree = ref(null)

// ROUTING
// Watch route to add event to goatcounter,
// and to display FAQ and trees.
// A simple routing hack, but does the work
watch(route, r => {
  showFAQ.value = r.path === "/om"

  if (r.path.startsWith("/t/")) {
    showTree.value = r.params.tree ?? null
  } else {
    showTree.value = null
  }

  if ("goatcounter" in window) {
    // send a page view to goatcounter
    window.goatcounter.count({
      path: () => r.path,
      event: true,
    })
  }
})

watch(center, c => {
  if (!localStorage) {
    return
  }
  if (c.lat && c.lng) localStorage.mapCenter = [c.lat, c.lng]
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
      "warning"
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
  zoom.value = Math.max(zoom.value, MINIMUM_TREE_VIEW_ZOOM)
  // center.value = latLng(tree.lat, tree.lon)
  // jobba runt en knepig Leaflet-begränsning här:
  map.value.setView(latLng(tree.lat, tree.lon), zoom.value)
}

// ADD TREE STEPS
const addTreeStatus = ref(null) // null, 'stage_1', 'stage_2'
const showAddTree = computed(() => addTreeStatus.value === "stage_2")
</script>
