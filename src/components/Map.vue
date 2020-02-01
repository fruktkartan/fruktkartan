<template>
  <div>
    <l-map
      ref="theMap"
      :center="center"
      :zoom="zoom"
      :options="mapOptions"
      @update:bounds="fetchMarkers"
      style="z-index: 0"
    ><!-- z-index to avoid shadowing Vuetify elements -->
      <l-tile-layer :url="url" :attribution="attribution" />
      <!--
      <l-control :position="'topleft'" class="control">
      </l-control>
      -->
      <l-marker-cluster :options="clusterOptions">
        <l-marker
          @click="fetchPopupContent(marker)"
          v-for="marker in filteredMarkers"
          :key="marker.id" :lat-lng="marker" :icon="marker.icon"
        />
      </l-marker-cluster>
      <v-dialog
        v-model="popupOpen"
        max-width="290"
      >
        <article class="tree">
          <header class="treeType">{{ currPopupData.type }}</header>
          <div class="treeDesc" v-if="popupIsLoaded">
            <img class="treeImg" v-if="currPopupData.img" :src="currPopupData.img" width="200" />
            <p>{{ currPopupData.description  }}</p>
          </div>
          <div class="treeDesc" v-else>
            <p>Laddar...</p>
          </div>
          <footer>
            <button @click="deleteTree(currPopupData.key)">Radera</button>
          </footer>
        </article>
      </v-dialog>
    </l-map>
  </div>
</template>

<script>
import { latLng, icon as licon } from "leaflet"
import { LMap, LTileLayer, LMarker /*, LPopup, /* LControl */ } from "vue2-leaflet"
import Vue2LeafletMarkercluster from "vue2-leaflet-markercluster"

const APIBASE = "https://fruktkartan-api.herokuapp.com"
const DEFAULT_MAP_SIZE = 1000  // meters across map

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    // LPopup,
    // LControl,
    LMarkerCluster: Vue2LeafletMarkercluster
  },
  data() {
    return {
      center: latLng(62.3908, 17.3069),
      zoom: 5,
      url:
        "https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png",
      attribution:
        "Imagery &copy; <a href=\"http://giscience.uni-hd.de/\">GIScience</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/copyright\">OSM</a> contributors",
      mapOptions: {
        zoomSnap: 0.5
      },
      clusterOptions: {
        disableClusteringAtZoom: 15,
        spiderfyOnMaxZoom: false,
      },
      popupOpen: false,
      popupOptions: {
        closeOnEscapeKey: false,  // buggy with Vue
      },
      markers: [],
      filteredMarkers: [],
      icons: {},
      popupData: {},
      currPopupData: {},
      popupIsOpen: false,
      popupIsLoaded: false,
      
    }
  },

  props: ["treeFilters"],
  
  watch: {
    treeFilters: {
      // the callback will be called immediately after the start of the observation
      // immediate: true, 
      deep: true,
      handler() {
        this.updateFilters()
      }
    }
  },

  created: function () {
    function icon(filename) {
      return licon({
        iconSize: [42, 36],
        iconAnchor: [21, 34],
        popupAnchor: [0, -36],
        iconUrl: require(`./icons/${filename}.svg`)
      })
    }
    this.icons = {
      "Berberisbär":     icon("berry"),
      "Blåbär":          icon("berry"),
      "Blåhallon":       icon("berry"),
      "Jordgubbar":      icon("berry"),
      "Krusbär":         icon("berry"),
      "Körsbärskornell": icon("berry"),
      "Lingon":          icon("berry"),
      "Björnbär":        icon("berry-blackberry"),
      "Aroniabär":       icon("berry-chokeberry"),
      "Röda vinbär":     icon("berry-currant"),
      "Vinbär":          icon("berry-currant"),
      "Fläder":          icon("berry-elder"),
      "Fläderblom":      icon("berry-elder"),
      "Fläderbär":       icon("berry-elder"),
      "Bocktörne":       icon("berry-goji"),
      "Gojibär":         icon("berry-goji"),
      "Mullbär":         icon("berry-mullberry"),
      "Svart mullbär":   icon("berry-mullberry"),
      "Hallon":          icon("berry-raspberry"),
      "Nypon":           icon("berry-rosehip"),
      "Rönnbär":         icon("berry-rowanberry"),
      "Havtorn":         icon("berry-seabuckthorn"),
      "Krikon":          icon("berry-sloeberry"),
      "Slånbär":         icon("berry-sloeberry"),
      "Smultron":        icon("berry-wildstrawberry"),
      "Mandel":          icon("nut"),
      "Hasselnöt":       icon("nut-hazelnut"),
      "Kastanj":         icon("nut-sweetchestnut"),
      "Valnöt":          icon("nut-walnut"),
      "Äpple":           icon("tree-apple"),
      "Bigarråer":       icon("tree-cherry"),
      "Körsbär":         icon("tree-cherry"),
      "Surkörsbär":      icon("tree-cherry"),
      "Päron":           icon("tree-pear"),
      "Körsbärsplommon": icon("tree-plum"),
      "Mirabell":        icon("tree-plum"),
      "Mirabellplommon": icon("tree-plum"),
      "Plommon":         icon("tree-plum"),
      "Kvitten":         icon("tree-quince"),
      "Rosenkvitten":    icon("tree-quince"),
      "Rabarber":        icon("tree-rhubarb"),
      "Humle":           icon("herb"),
      "Kamomill":        icon("herb-chamomille"),
      "Körvel":          icon("herb-chervil"),
      "Brännässla":      icon("herb-nettle"),
      "Ramslök":         icon("herb-wildgarlic"),
      "Annan sort":      icon("tree"),
    }
  },

  mounted: function () {
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
        let bounds = ll.toBounds(pos.coords.accuracy ? pos.coords.accuracy : DEFAULT_MAP_SIZE)
        self.$refs.theMap.mapObject.panTo(ll).fitBounds(bounds)
        // fetchMarkers() will be triggered by map update
      })
      .catch(() => {
        // keep default bounds
        self.fetchMarkers()
      })
  },

  methods: {
    fetchPopupContent: function (marker) {
      let self = this
      self.currPopupData = {}
      self.popupOpen = true

      //self.popupIsOpen = true
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
        self.currPopupData = {...data}
        self.popupData[marker.key] = self.currPopupData
        self.popupIsLoaded = true
      })

    },

    getIcon: function(type) {
      return this.icons[type] ?? this.icons["Annan sort"]
    },

    deleteTree: function(marker) {
      let result = window.confirm(`Är du säker på att du vill radera det här trädet? Trädtyp: ${marker.type}`)
      if (result) {
        console.log("raderar träd")
        /*
        fetch(`${APIBASE}/tree/${marker.key}`, {method: "DELETE"})
          .then(() => {
            this.$refs.map.mapObject.closePopup()
            this.fetchMarkers()
          })
        */
      }
    },

    updateFilters: function() {
      this.filteredMarkers = this.markers
        .filter(m => this.treeFilters.hideempty ? m.desc || m.img : true)
        .filter(m => this.treeFilters.type === "*" ? true  : this.treeFilters.type === m.type)
    },

    fetchMarkers: function() {
      if (this.popupIsOpen) {
        // abort if a popup is open, as leaflet freaks out otherwise
        return
      }
      let self = this

      let bounds = this.$refs.theMap.mapObject.getBounds()
      fetch(
        `${APIBASE}/trees?bbox=${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
      )
        .then(response => response.json())
        .then(json => {
          self.markers = json
            .map(m => ({
              ...m,
              icon: self.getIcon(m.type),
            }))
          self.updateFilters()
        })
    }
  }
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
  padding: .5em 1em;
  border: 1px solid black;
  border-radius: .5em;
}

.treeImg {
  float: left;
}

</style>
