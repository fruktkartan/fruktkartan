<template>
  <v-card :loading="loading">
    <v-snackbar
      v-model="addTreeMarker.visible"
      :timeout="-1"
      style="z-index: 4;"
    >
      Dra markören till rätt plats.
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" color="green" @click.stop="addTree = true">
          Fortsätt
        </v-btn>
        <v-btn text v-bind="attrs" @click="removeAddTreeMarker">
          Avbryt
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="errorMessage.visible"
      color="error"
      :timeout="errorMessage.timeout"
      :top="true"
    >
      {{ errorMessage.msg }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="errorMessage.visible = false"
          >Stäng</v-btn
        >
      </template>
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
        <v-icon alt="Meny" title="Meny" @click.stop="$emit('openDrawer')">
          {{ mdiMenu }}
        </v-icon>
        <span style="padding-left: 1em;" @click.stop="$emit('openDrawer')">
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
        <v-icon @click.stop="retrieveUserPosition">
          {{ mdiCrosshairsGps }}
        </v-icon>
      </l-control>
      <l-marker-cluster :options="clusterOptions">
        <l-marker
          v-for="marker in filteredMarkers"
          :key="marker.key"
          :lat-lng="marker"
          :icon="marker.icon"
          @click="$router.push(`/t/${marker.key}`)"
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

      <ViewTreeDialog
        v-model="viewTree"
        @change="fetchMarkers"
        @treeLoaded="adjustMapToTree"
        @error="showErrorMessage"
      />

      <AddTreeDialog
        v-model="addTree"
        :lat-lng="addTreeMarker.latLng"
        @abort="removeAddTreeMarker"
        @added="
          removeAddTreeMarker()
          fetchMarkers()
        "
      />
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
      addTree: false,
      viewTree: null,

      errorMessage: {
        msg: "",
        visible: false,
        timeout: 6000,
      },
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

  watch: {
    $route: function (r) {
      if ("tree" in r.params) {
        this.viewTree = r.params.tree
      } else {
        this.viewTree = null
      }
    },
    viewTree: function (state) {
      // HACK
      // Checking if the dialog was closed, but the route didn't change
      // This is most likely not the way to do it...
      if (!state && "tree" in this.$route.params) {
        this.$router.push("/")
      }
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

    this.canGeoLocate = navigator.geolocation ? true : false
  },

  mounted: function () {
    const map = this.$refs.theMap.mapObject
    map.attributionControl.setPrefix("")

    if ("tree" in this.$route.params) {
      // Routed to a tree. Zoom in and open tree
      map.setZoom(16)
      this.viewTree = this.$route.params.tree
    } else {
      this.retrieveUserPosition()
    }
  },

  methods: {
    /**
     * Display an error message
     *
     * @param {string} msg Message to display
     */
    showErrorMessage: function (msg) {
      // Close any existing error message first
      this.errorMessage.visible = false
      this.errorMessage.msg = msg
      this.errorMessage.visible = true
    },

    /**
     * Use geolocation interface to re-center map, if possible.
     *
     * This method will also cause trees to be fetched and updated.
     *
     * @param {Boolean} manually Did the user manually ask for the position?
     */
    retrieveUserPosition: function (manually) {
      const map = this.$refs.theMap.mapObject

      const getUserPosition = new Promise((resolve, reject) => {
        /* Promise to return user position */
        if (this.canGeoLocate) {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        } else {
          reject()
        }
      })

      getUserPosition
        .then(pos => {
          const ll = latLng(pos.coords.latitude, pos.coords.longitude)
          const bounds = ll.toBounds(
            pos.coords.accuracy
              ? Math.max(pos.coords.accuracy, DEFAULT_MAP_SIZE)
              : DEFAULT_MAP_SIZE
          )
          // Only adjust bounds if it would mean zooming in.
          // Zooming out on geolocating is disruptive
          const mapBounds = map.getBounds()
          const oldWidth = mapBounds.getEast() - mapBounds.getWest()
          const newWidth = bounds.getEast() - bounds.getWest()
          if (newWidth < oldWidth) {
            map.fitBounds(bounds)
          } else {
            map.panTo(ll)
          }
          // fetchMarkers() will be triggered by the map update,
          // so no need to call it here
        })
        .catch(e => {
          let msg
          if (typeof e === "undefined") {
            // Interface not available.
            msg = "Din webbläsare har inte stöd för att hämta position"
          } else if (e.code == e.PERMISSION_DENIED) {
            // Interface is available, but has been blocked.
            msg =
              "Dina webbläsarinställningar låter oss inte hämta din position."
            this.canGeoLocate = false
          } else if (e.code == e.POSITION_UNAVAILABLE) {
            // Interface is available, but position is not.
            this.canGeoLocate = false
            msg = "Vi kunde inte hämta din position just nu."
          } else {
            msg = `Vi kunde inte hämta din position: ${e.message}`
          }

          if (manually) {
            // Only show error message if user actively tried to geolocate
            this.showErrorMessage(msg)
          }
          // keep default bounds
          this.fetchMarkers()
        })
    },

    /**
     * Make sure a specific tree is visible on the map.
     *
     * After opening a tree dialog, we want to make sure the tree is within
     * the map bounds. If routed to a specific tree it will probably not be.
     *
     * @param {Object} tree A tree object
     */
    adjustMapToTree: function (tree) {
      const map = this.$refs.theMap.mapObject
      const bounds = this.$refs.theMap.mapObject.getBounds()
      if (
        tree.lat < bounds._southWest.lat ||
        tree.lat > bounds._northEast.lat ||
        tree.lon < bounds._southWest.lng ||
        tree.lon > bounds._northEast.lng
      ) {
        const ll = latLng(tree.lat, tree.lon)
        map.panTo(ll)
      }
    },

    /**
     * Set the opacity of all markers.
     *
     * @param {number} opacity
     */
    setMarkerOpacity: function (opacity) {
      const map = this.$refs.theMap.mapObject
      map.eachLayer(l => {
        if (l.options?.pane === "markerPane") {
          l.setOpacity(opacity)
        }
      })
    },

    /**
     * Let the user add a new tree by moving a marker.
     *
     * This method is called by ref from outside the Map component
     */
    addNewTree: function () {
      const map = this.$refs.theMap.mapObject
      // Close drawer in case we're on mobile
      this.$emit("closeDrawer")
      this.setMarkerOpacity(0.4)
      this.addTreeMarker = {
        visible: true,
        latLng: map.getCenter(),
        icon: this.icons.addnew,
      }
    },

    /* Clicking (not dragging) the add tree icon will open the add tree dialogue */
    addTreeIconMouseUp: function (x) {
      if (x.latlng == this.addTreeMarker.latLng) {
        this.addTree = true
      }
    },

    removeAddTreeMarker: function () {
      this.addTreeMarker.visible = false
      this.setMarkerOpacity(1)
    },

    fetchMarkers: function () {
      this.loading = true
      let self = this

      let bounds = this.$refs.theMap.mapObject.getBounds()
      fetch(
        // eslint-disable-next-line max-len
        `${process.env.VUE_APP_APIBASE}/trees?bbox=${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
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
          this.showErrorMessage(
            `Vi lyckades inte hämta några träd just nu: ${e}`
          )
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
