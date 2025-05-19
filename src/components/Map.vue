<template>
  <v-progress-linear
    v-if="loading"
    color="primary"
    indeterminate
    style="position: fixed; top: 0; left: 0; z-index: 100;"
  />
  <l-map
    v-model:bounds="bounds"
    v-model:center="center"
    v-model:zoom="zoom"
    :options="mapOptions"
    @update:bounds="b => {
      bounds = b;
      fetchMarkers();
    }"
    @ready="o => {
      bounds = o.getBounds()
      fetchMarkers()
    } /* needed from start in geopositioning */"
  >
    <l-control
      position="bottomleft"
      class="hidden-md-and-up control"
    >
      <v-btn
        prepend-icon="mdi-menu"
        text="meny"
        flat
        slim
        @click="sidebarStore.showDrawer()"
      />
    </l-control>
    <l-control
      v-if="canGeoLocate"
      position="topleft"
      class="control"
    >
      <v-btn
        icon="mdi-crosshairs-gps"
        flat
        slim
        @click.stop="() => retrieveUserPosition(true)"
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
    <l-control
      v-if="addTree"
      position="bottomleft"
    >
      <v-card>
        <v-card-text>
          Flytta markören till rätt plats
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="success"
            @click="emit('treeAdded', newTree)"
          >
            Lägg till träd här
          </v-btn>
          <v-btn
            color="warning"
            @click="emit('abortAddTree')"
          >
            Avbryt
          </v-btn>
        </v-card-actions>
      </v-card>
    </l-control>
  </l-map>
</template>

<script setup>
const DEFAULT_MAP_SIZE = 750 // meters across map

// This ugly hack is required by vue-leaflet-markercluster
import L from "leaflet"
globalThis.L = L
import "vue-leaflet-markercluster/dist/style.css"

import { ref, computed, watch } from "vue"
import { LMap, LTileLayer, LControl, LMarker } from "@vue-leaflet/vue-leaflet"
import { LMarkerClusterGroup } from "vue-leaflet-markercluster"
import { latLng, icon as licon } from "leaflet"
import { useSidebarStore, useUserMessageStore } from "@/stores/app"
import groupData from "../assets/group-data.json"

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  addTree: {
    type: Boolean,
    required: false,
  }
})
const { filters } = props
const center = defineModel("center", { type: Object })
const zoom = defineModel("zoom", { type: Number })
const emit = defineEmits(["treeAdded", "abortAddTree"])

const userMessageStore = useUserMessageStore()

const newTree = ref(center.value)
watch(() => props.addTree, () => {
  if (props.addTree) {
    newTree.value = center.value
  }
})

/* Middleware for fetch calls */
const raiseForErrors = response => {
  if (!response.ok) {
    throw Error(response.statusText)
  }
  return response
}

const sidebarStore = useSidebarStore()
const canGeoLocate = ref(navigator.geolocation ? true : false)

// map settings
const mapOptions = {
  minZoom: 3,
  zoomSnap: 0.5,
  noWrap: true,
  maxBounds: [[-90, -180], [90, 180]],
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
const icons = Object.entries(groupData)
  .map(([k, v]) => [k, icon(v.icon)])
  .reduce((o, [k, v]) => {
    o[k] = v
    return o
  }, {})

/**
 * Use geolocation interface to re-center map, if possible.
 *
 * This method will also cause trees to be fetched and updated.
 *
 * @param {Boolean} manually Did the user manually ask for the position?
 */
const retrieveUserPosition = manually => {
  loading.value = true
  navigator.geolocation.getCurrentPosition(
    pos => {
      const ll = latLng(pos.coords.latitude, pos.coords.longitude)
      const newBounds = ll.toBounds(
        pos.coords.accuracy
          ? Math.max(pos.coords.accuracy, DEFAULT_MAP_SIZE)
          : DEFAULT_MAP_SIZE
      )
      // Only adjust bounds if it would mean zooming in.
      // Zooming out on geolocating is disruptive
      const oldWidth = bounds.value.getEast() - bounds.value.getWest()
      const newWidth = newBounds.getEast() - newBounds.getWest()
      if (newWidth < oldWidth) {
        bounds.value = newBounds
      } else {
        center.value = ll
      }
      loading.value = false
    },
    e => {
      let msg
      if (typeof e === "undefined") {
        // Interface not available.
        msg = "Din webbläsare har inte stöd för att hämta position"
        this.canGeoLocate = false
      } else if (e.code == e.PERMISSION_DENIED) {
        // Interface is available, but has been blocked.
        msg = "Du har blockerat åtkomst till din position"
      } else if (e.code == e.POSITION_UNAVAILABLE) {
        // Interface is available, but position is not.
        msg = "Vi kunde inte hämta din position just nu."
      } else {
        msg = `Vi kunde inte hämta din position: ${e.message}`
      }
      if (manually) {
        // Only show error message if user actively tried to geolocate
        userMessageStore.push(msg)
      }
      // keep default bounds
      // fetchMarkers()
      loading.value = false
    }
  )
}

const fetchMarkers = function () {
  loading.value = true
  fetch(
    // eslint-disable-next-line max-len
    `${import.meta.env.VITE_APIBASE}/trees?bbox=${bounds.value._southWest.lat},${bounds.value._southWest.lng},${bounds.value._northEast.lat},${bounds.value._northEast.lng}`
  )
    .then(raiseForErrors)
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
})
</script>

<style scope>
@import "leaflet/dist/leaflet.css"
</style>