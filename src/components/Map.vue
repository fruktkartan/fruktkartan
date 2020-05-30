<template>
  <v-card :loading="loading">
    <v-snackbar
      v-model="addTreeMarker.visible"
      :timeout="0"
      style="z-index: 4;"
    >
      Dra markören till rätt plats.
      <v-btn text color="green" @click="addTreeDialog = true">Fortsätt</v-btn>
      <v-btn text @click="addTreeMarker.visible = false">Avbryt</v-btn>
    </v-snackbar>
    <l-map
      ref="theMap"
      :center="center"
      :zoom="zoom"
      :options="mapOptions"
      style="z-index: 0;"
      @update:bounds="fetchMarkers"
      ><!-- z-index to avoid shadowing Vuetify elements -->

      <l-control
        position="bottomleft"
        class="hidden-md-and-up control"
        style="z-index: 1;"
      >
        <v-icon alt="Meny" title="Meny" @click="$emit('openDrawer')">
          {{ mdiMenu }}
        </v-icon>
        <span style="padding-left: 1em;" @click="$emit('openDrawer')">
          Meny
        </span>
      </l-control>

      <l-tile-layer
        :url="url"
        :options="layerOptions"
        :attribution="attribution"
        :z-index="0"
      />
      <l-control v-if="canGeoLocate" position="topleft" class="control">
        <v-icon @click="retrieveUserPosition">{{ mdiCrosshairsGps }}</v-icon>
      </l-control>
      <l-marker-cluster :options="clusterOptions">
        <l-marker
          v-for="marker in filteredMarkers"
          :key="marker.id"
          :lat-lng="marker"
          :icon="marker.icon"
          @click="fetchPopupContent(marker)"
        />
      </l-marker-cluster>
      <!-- add-a-tree marker -->
      <l-marker
        key="addTreeMarker"
        :visible="addTreeMarker.visible"
        :lat-lng.sync="addTreeMarker.latLng"
        :icon="addTreeMarker.icon"
        :z-index-offset="999"
        draggable
        @mouseup="addTreeIconMouseUp"
      />

      <v-dialog
        v-model="viewTreeDialog"
        max-width="440"
        persistent
        @keydown.esc="viewTreeDialog = false"
      >
        <ViewTreeDialog
          :tree="viewTreeData"
          :is-open="viewTreeDialog"
          @submit="doEditTree"
          @delete="deleteTree"
          @close="
            viewTreeDialog = false
            viewTreeData = {}
          "
        />
      </v-dialog>

      <v-dialog v-model="addTreeDialog" max-width="500" persistent>
        <AddTreeDialog
          @submit="doAddTree"
          @goBack="addTreeDialog = false"
          @close="
            addTreeDialog = false
            addTreeMarker.visible = false
          "
        />
      </v-dialog>
    </l-map>
  </v-card>
</template>

<script>
import { latLng, latLngBounds, icon as licon } from "leaflet"
import { LMap, LTileLayer, LMarker, LControl } from "vue2-leaflet"
import Vue2LeafletMarkercluster from "vue2-leaflet-markercluster"
import AddTreeDialog from "./AddTreeDialog.vue"
import ViewTreeDialog from "./ViewTreeDialog.vue"
import { mdiMenu, mdiCrosshairsGps } from "@mdi/js"

const APIBASE = "https://fruktkartan-api.herokuapp.com"
//const APIBASE = "http://localhost:8080"
const DEFAULT_MAP_SIZE = 750 // meters across map
const MAP_CENTER = latLng(62.3908, 17.3069)
/* Middleware for fetch calls */
const raiseForErrors = response => {
  if (!response.ok) {
    throw Error(response.statusText)
  }
  return response
}

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LControl,
    LMarkerCluster: Vue2LeafletMarkercluster,
    AddTreeDialog,
    ViewTreeDialog,
  },

  props: {
    treeFilters: {
      type: Object,
      default: function () {
        return {
          type: "*",
        }
      },
    },
  },
  data() {
    return {
      loading: true,
      center: MAP_CENTER,
      zoom: 5,
      url:
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution:
        "kartgrafik <a href='https://carto.com/attributions' target='_blank'>CARTO</a>" +
        " · kartdata <a href='https://www.openstreetmap.org/copyright' target='_blank'>Open Street Map</a>",
      layerOptions: {
        maxZoom: 19,
        subdomains: "abcd",
      },
      // TODO go back to this once OSM.se's server is repaired  https://github.com/karlwettin/carto-style-hydda/issues/3
      // url: "https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png",
      // attribution:
      //   "kartgrafik <a href='https://openstreetmap.se/' target='_blank'>Open Street Map Sverige</a>" +
      //   " · kartdata <a href='https://www.openstreetmap.org/copyright' target='_blank'>Open Street Map</a>",
      // layerOptions: {
      //   maxZoom: 20,
      // },
      mapOptions: {
        minZoom: 3,
        zoomSnap: 0.5,
        noWrap: true,
        maxBounds: latLngBounds(latLng(-90, -180), latLng(90, 180)),
      },
      clusterOptions: {
        disableClusteringAtZoom: 14,
        spiderfyOnMaxZoom: false,
      },

      markers: [],
      //filteredMarkers: [],
      icons: {},
      mdiMenu,
      mdiCrosshairsGps,

      canGeoLocate: true,

      addTreeMarker: {
        latLng: MAP_CENTER,
        visible: false,
      },
      addTreeDialog: false,

      viewTreeDialog: false,
      viewTreeCache: {},
      viewTreeData: {},
    }
  },

  computed: {
    filteredMarkers() {
      let fm = this.markers
      if (this.treeFilters.type !== "*") {
        fm = fm.filter(m => m.group.startsWith(this.treeFilters.type))
      }
      return fm
    },
  },

  created: function () {
    function icon(filename) {
      return licon({
        iconSize: [42, 36],
        iconAnchor: [21, 34],
        iconUrl: require(`./icons/${filename}.svg`),
        // Shadow is included in icon svg, but for some reason Leaflet
        // insists on loading a specific shadow when adding a tree.
        shadowUrl: filename === "addnew" ? require("./icons/addnew.svg") : null,
        shadowSize: [0, 0],
      })
    }
    this.icons = Object.entries(require("../assets/group-data.json"))
      .map(([k, v]) => [k, icon(v.icon)])
      .reduce((o, [k, v]) => {
        o[k] = v
        return o
      }, {})

    this.canGeoLocate = navigator.geolocation
  },

  mounted: function () {
    this.$refs.theMap.mapObject.attributionControl.setPrefix("")
    this.retrieveUserPosition()
  },

  methods: {
    /**
     * Use geolocation interface to re-center map, if possible
     */
    retrieveUserPosition: function () {
      let self = this

      let getUserPosition = new Promise((resolve, reject) => {
        /* Promise to return user position */
        if (this.canGeoLocate) {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        } else {
          reject()
        }
      })

      getUserPosition
        .then(pos => {
          let ll = latLng(pos.coords.latitude, pos.coords.longitude)
          let bounds = ll.toBounds(
            pos.coords.accuracy
              ? Math.max(pos.coords.accuracy, DEFAULT_MAP_SIZE)
              : DEFAULT_MAP_SIZE
          )
          self.$refs.theMap.mapObject.panTo(ll).fitBounds(bounds)
          // fetchMarkers() will be triggered by the map update,
          // so no need to call it here
        })
        .catch(e => {
          if (e.code == e.PERMISSION_DENIED) {
            // Interface is available, but has been blocked.
            this.canGeoLocate = false
          }
          // keep default bounds
          self.fetchMarkers()
        })
    },

    /**
     * Let the user add a new tree by moving a marker.
     */
    addTree: function () {
      let map = this.$refs.theMap.mapObject
      // Close drawer in case we're on mobile
      this.$emit("closeDrawer")
      this.addTreeMarker = {
        visible: true,
        latLng: map.getCenter(),
        icon: this.icons.addnew,
      }
    },

    /**
     * Actually add the tree to the DB
     */
    doAddTree: function (tree) {
      // TODO Merge with doEditTree and move to TreeEditor component

      // Call the API
      this.addTreeDialog = false
      this.addTreeMarker.visible = false
      let treePayload = {
        ...tree,
        lat: this.addTreeMarker.latLng.lat,
        lon: this.addTreeMarker.latLng.lng,
      }
      fetch(`${APIBASE}/tree`, {
        method: "PUT",
        body: JSON.stringify(treePayload),
        headers: { "Content-Type": "application/json" },
      }).then(() => {
        this.fetchMarkers()
      })
    },

    doEditTree: function (tree) {
      fetch(`${APIBASE}/tree/${tree.key}`, {
        method: "POST",
        body: JSON.stringify(tree),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        this.viewTreeDialog = false
        delete this.viewTreeCache[tree.key]
        this.fetchMarkers() // In case a tree type changed
      })
    },

    fetchPopupContent: function (marker) {
      let self = this
      this.viewTreeDialog = true

      let getData = new Promise(resolve => {
        if (self.viewTreeCache[marker.key]) {
          resolve(self.viewTreeCache[marker.key])
        } else {
          fetch(`${APIBASE}/tree/${marker.key}`)
            .then(response => response.json())
            .then(resolve)
        }
      })

      getData.then(data => {
        self.viewTreeData = { ...marker, ...data }
        self.viewTreeCache[marker.key] = self.viewTreeData
      })
    },

    deleteTree: function (marker) {
      let result = window.confirm(
        `Är du säker på att du vill ta bort det här trädet
(${marker.type}) från Fruktkartan?`
      )
      if (result) {
        fetch(`${APIBASE}/tree/${marker.key}`, { method: "DELETE" }).then(
          () => {
            this.viewTreeDialog = false
            this.fetchMarkers()
          }
        )
      }
    },

    /* Clicking (not dragging) the add tree icon will open the add tree dialogue */
    addTreeIconMouseUp: function (x) {
      if (x.latlng == this.addTreeMarker.latLng) {
        this.addTreeDialog = true
      }
    },

    fetchMarkers: function () {
      this.loading = true
      let self = this

      let bounds = this.$refs.theMap.mapObject.getBounds()
      fetch(
        // eslint-disable-next-line max-len
        `${APIBASE}/trees?bbox=${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
      )
        .then(raiseForErrors)
        .then(response => response.json())
        .then(json => {
          self.markers = json.map(m => ({
            ...m,
            icon: self.icons[m.group] ?? self.icons.tree,
          }))
        })
        .catch(e => {
          console.log("Error fetching trees: ", e)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style>
@import "~leaflet.markercluster/dist/MarkerCluster.css";
@import "~leaflet.markercluster/dist/MarkerCluster.Default.css";

.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large,
.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(230, 180, 43, 0.4) !important;
}

@media (min-width: 600px) {
  .leaflet-right .leaflet-control-attribution {
    /* Collapsed sidebar is 56px */
    margin-right: 56px !important;
  }
}

.control {
  background: #f0f0f099;
  padding: 0.5em 1em;
  border-radius: 0.5em;
}
</style>
