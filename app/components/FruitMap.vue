<template>
  <v-progress-linear
    v-if="loading"
    color="primary"
    indeterminate
  />
  <l-map
    v-model:center="center"
    v-model:zoom="zoom"
    :bounds="bounds"
    :options="mapOptions"
    @update:bounds="
      b => {
        bounds = b
        fetchMarkers()
      }
    "
    @ready="onMapReady"
  >
    <l-control position="bottomleft" class="hidden-md-and-up control">
      <v-btn
        prepend-icon="mdi-menu"
        text="meny"
        flat
        slim
        @click="sidebarStore.showDrawer()"
      />
    </l-control>

    <l-tile-layer
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      :attribution="`
kartdata <a href='https://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a>
grafik <a href='https://carto.com/attribution/' target='_blank'>CARTO</a>`"
      layer-type="base"
    />

    <l-marker-cluster-group
      :options="{
        disableClusteringAtZoom: 14,
        spiderfyOnMaxZoom: false,
      }"
    >
      <l-marker
        v-for="marker in filteredMarkers"
        :key="marker.key"
        :lat-lng="marker"
        :icon="marker.icon"
        @click="$router.push(`/t/${marker.key}`)"
      />
    </l-marker-cluster-group>
    <l-marker
      v-model:lat-lng="newTree"
      :visible="addTree"
      :icon="icons.addnew"
      :z-index-offset="999"
      draggable
    />
    <l-control v-if="addTree" position="bottomleft">
      <v-card>
        <v-card-text> Flytta markören till rätt plats </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="emit('treeAdded', newTree)">
            Lägg till träd här
          </v-btn>
          <v-btn color="warning" @click="emit('abortAddTree')"> Avbryt </v-btn>
        </v-card-actions>
      </v-card>
    </l-control>
  </l-map>
</template>

<script setup>
// This ugly hack is required by vue-leaflet-markercluster
import L from "leaflet"
globalThis.L = L
import "vue-leaflet-markercluster/dist/style.css"
import { LocateControl } from "leaflet.locatecontrol"
import "leaflet.locatecontrol/dist/L.Control.Locate.css"

import { LMap, LTileLayer, LControl, LMarker } from "@vue-leaflet/vue-leaflet"
import { LMarkerClusterGroup } from "vue-leaflet-markercluster"
import { icon as licon } from "leaflet"
import { useSidebarStore, useUserMessageStore } from "~/stores/app"
import { raiseOnHttpError } from "~/utils/http"
import groupData from "~/assets/group-data.json"

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  addTree: {
    type: Boolean,
    required: false,
  },
})
const { filters } = props
const center = defineModel("center", { type: Object })
const zoom = defineModel("zoom", { type: Number })
const emit = defineEmits(["treeAdded", "abortAddTree"])

const userMessageStore = useUserMessageStore()

const newTree = ref(center.value)
watch(
  () => props.addTree,
  () => {
    if (props.addTree) {
      newTree.value = center.value
    }
  }
)

const sidebarStore = useSidebarStore()

// map settings
const mapOptions = {
  minZoom: 3,
  zoomSnap: 0.5,
  noWrap: true,
  maxBounds: [
    [-90, -180],
    [90, 180],
  ],
}

const bounds = ref(null)

const loading = ref(false)
const markers = ref([])

const filteredMarkers = computed(() => {
  if (filters.tree === "*") {
    return markers.value
  }
  return markers.value.filter(m => m.group.startsWith(filters.tree))
})

// Hack together a map of icons
function icon(filename) {
  return licon({
    iconSize: [42, 36],
    iconAnchor: [21, 34],
    iconUrl: `/markers/${filename}.svg`,
    // Shadow is included in icon svg, but for some reason Leaflet
    // insists on loading a specific shadow when adding a tree.
    shadowUrl: filename === "addnew" ? "/markers/addnew.svg" : null,
    shadowSize: [0, 0],
  })
}
const icons = Object.fromEntries(
  Object.entries(groupData).map(([k, v]) => [k, icon(v.icon)])
)

let leafletMap = null

function onMapReady(o) {
  leafletMap = o
  bounds.value = o.getBounds()

  const lc = new LocateControl({
    strings: {
      title: "Visa min position",
      metersUnit: "meter",
      feetUnit: "fot",
      popup: "Du är inom {distance} {unit} härifrån",
      outsideMapBoundsMsg: "Du verkar befinna dig utanför kartan",
    },
    locateOptions: { enableHighAccuracy: true },
    setView: "untilPan", // undvik att zooma ut
  })
  lc.addTo(o)

  o.on("locationfound", () => {
    loading.value = false
  })
  o.on("locationerror", e => {
    loading.value = false
    let msg
    if (e.code === 1) {
      msg = "Du har blockerat åtkomst till din position"
    } else if (e.code === 2) {
      msg = "Kunde inte hämta din position just nu"
    } else {
      msg = `Kunde inte hämta din position: ${e.message}`
    }
    userMessageStore.push(msg)
  })
  o.on("locatestart", () => {
    loading.value = true
  })

  fetchMarkers()
}

const fetchMarkers = function () {
  loading.value = true
  fetch(
    // prettier-ignore
    `/api/trees?bbox=${bounds.value._southWest.lat},${bounds.value._southWest.lng},${bounds.value._northEast.lat},${bounds.value._northEast.lng}`
  )
    .then(raiseOnHttpError)
    .then(response => response.json())
    .then(json => {
      markers.value = json.map(m => ({
        ...m,
        icon: icons[m.group] ?? icons.tree,
      }))
    })
    .catch(e => {
      userMessageStore.push(`Vi lyckades inte hämta några träd just nu: ${e}`)
    })
    .finally(() => {
      loading.value = false
    })
}

defineExpose({
  fetchMarkers,
  setView: (center, zoom) => leafletMap?.setView(center, zoom),
  invalidateSize: () => leafletMap?.invalidateSize(),
})
</script>

<style>
@import "leaflet/dist/leaflet.css";

.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large,
.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(230, 180, 43, 0.4) !important;
}
</style>
