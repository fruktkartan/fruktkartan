<template>
  <div>
    <v-snackbar v-model="addTreeMarker.visible" :timeout="0" style="z-index:4">
      Dra markören till rätt plats.
      <v-btn text color="green" @click="addTreeDialog = true">Fortsätt</v-btn>
      <v-btn text @click="addTreeMarker.visible = false">Avbryt</v-btn>
    </v-snackbar>
    <l-map
      ref="theMap"
      :center="center"
      :zoom="zoom"
      :options="mapOptions"
      style="z-index: 0"
      @update:bounds="fetchMarkers"
      ><!-- z-index to avoid shadowing Vuetify elements -->
      <l-tile-layer :url="url" :attribution="attribution" />
      <!--
      <l-control position="topleft" class="control">
        <v-icon style="background:white;border-radius:5px" @click="addTree()">mdi-plus</v-icon>
      </l-control>
      -->
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
        draggable
      />

      <v-dialog v-model="popupOpen" max-width="290">
        <v-card :loading="!Object.entries(currPopupData).length">
          <v-card-title>{{ currPopupData.type }} </v-card-title>
          <v-card-text>{{ currPopupData.description }}</v-card-text>
          <v-img
            v-if="currPopupData.img"
            :src="currPopupData.img"
            height="194"
          />
          <v-card-actions>
            <v-btn @click="popupOpen = false">Stäng</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="red lighten-3" @click="deleteTree(currPopupData)"
              >Radera</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="addTreeDialog" persistent>
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
  </div>
</template>

<script>
import { latLng, icon as licon } from "leaflet"
import { LMap, LTileLayer, LMarker /*LControl*/ } from "vue2-leaflet"
import Vue2LeafletMarkercluster from "vue2-leaflet-markercluster"
import AddTreeDialog from "./AddTreeDialog.vue"

const APIBASE = "https://fruktkartan-api.herokuapp.com"
const DEFAULT_MAP_SIZE = 1000 // meters across map
const MAP_CENTER = latLng(62.3908, 17.3069)

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    // LControl,
    LMarkerCluster: Vue2LeafletMarkercluster,
    AddTreeDialog,
  },

  props: {
    treeFilters: {
      type: Object,
      default: function() {
        return {
          hideempty: true,
          type: "*",
        }
      },
    },
  },
  data() {
    return {
      center: MAP_CENTER,
      zoom: 5,
      url: "https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png",
      attribution:
        "Karta från <a href='https://openstreetmap.se/' target='_blank'>OpenStreetMap Sverige</a>",
      mapOptions: {
        zoomSnap: 0.5,
        maxZoom: 18,
      },
      clusterOptions: {
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: false,
      },
      popupOpen: false,
      popupData: {},
      currPopupData: {},

      markers: [],
      //filteredMarkers: [],
      icons: {},

      addTreeMarker: {
        latLng: MAP_CENTER,
        visible: false,
      },

      addTreeDialog: false,
    }
  },

  computed: {
    filteredMarkers() {
      return this.markers
        .filter(m => (this.treeFilters.hideempty ? m.desc || m.img : true))
        .filter(m =>
          this.treeFilters.type === "*"
            ? true
            : m.group.startsWith(this.treeFilters.type)
        )
    },
  },

  created: function() {
    function icon(filename) {
      return licon({
        iconSize: [42, 36],
        iconAnchor: [21, 34],
        popupAnchor: [0, -36],
        iconUrl: require(`./icons/${filename}.svg`),
      })
    }
    this.icons = Object.entries(require("../assets/group-data.json"))
      .map(([k, v]) => [k, icon(v.icon)])
      .reduce((o, [k, v]) => {
        o[k] = v
        return o
      }, {})
  },

  mounted: function() {
    let self = this

    let getUserPosition = new Promise((resolve, reject) => {
      /* Promise to return user position */
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      } else {
        reject()
      }
    })

    getUserPosition
      .then(pos => {
        let ll = latLng(pos.coords.latitude, pos.coords.longitude)
        let bounds = ll.toBounds(
          pos.coords.accuracy ? pos.coords.accuracy : DEFAULT_MAP_SIZE
        )
        self.$refs.theMap.mapObject.panTo(ll).fitBounds(bounds)
        // fetchMarkers() will be triggered by the map update,
        // so no need to call it here
      })
      .catch(() => {
        // keep default bounds
        self.fetchMarkers()
      })
  },

  methods: {
    /**
     * Let the user add a new tree by moving a marker.
     */
    addTree: function() {
      let map = this.$refs.theMap.mapObject
      this.addTreeMarker = {
        visible: true,
        latLng: map.getCenter(),
        icon: this.icons["addnew"],
      }
    },

    /**
     * Actually add the tree to the DB
     */
    doAddTree: function(tree) {
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
        headers: {
          "Content-Type": "application/json",
        },
      }).then(this.fetchMarkers)
    },

    fetchPopupContent: function(marker) {
      let self = this
      this.currPopupData = {}
      this.popupOpen = true

      let getData = new Promise(resolve => {
        if (self.popupData[marker.key]) {
          resolve(self.popupData[marker.key])
        } else {
          fetch(`${APIBASE}/tree/${marker.key}`)
            .then(response => response.json())
            .then(resolve)
        }
      })

      getData.then(data => {
        self.currPopupData = { ...marker, ...data }
        self.popupData[marker.key] = self.currPopupData
      })
    },

    deleteTree: function(marker) {
      let result = window.confirm(
        `Är du säker på att du vill radera det här trädet? Trädtyp: ${marker.type}`
      )
      if (result) {
        console.log("raderar träd")
        fetch(`${APIBASE}/tree/${marker.key}`, { method: "DELETE" }).then(
          () => {
            this.popupOpen = false
            this.fetchMarkers()
          }
        )
      }
    },

    fetchMarkers: function() {
      let self = this

      let bounds = this.$refs.theMap.mapObject.getBounds()
      fetch(
        `${APIBASE}/trees?bbox=${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
      )
        .then(response => response.json())
        .then(json => {
          self.markers = json.map(m => ({
            ...m,
            icon: self.icons[m.group] ?? self.icons.tree,
          }))
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

.control > p {
  background: #f0f0f0;
  padding: 0.5em 1em;
  border: 1px solid black;
  border-radius: 0.5em;
}
</style>
