<template>
  <div>
    <header>
      <h1>Fruktkartan</h1>
    </header>
    <menu id="filters">
      <form @change="updateFilters">
        <label>
          <input type="checkbox" v-model="filter_hideempty">
          <span class="label">Dölj träd utan bild eller beskrivning?</span>
        </label>
      </form>
    </menu>

    <l-map ref="theMap" :center="center" :zoom="zoom" :options="mapOptions">
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-control :position="'topleft'" class="fetch-control">
        <p @click="fetchMarkers">hämta träd</p>
      </l-control>
      <l-marker-cluster :options="clusterOptions">
      <l-marker
        @popupopen="() => fetchPopupContent(marker.key)"
        @popupclose="() => popupDescription = null"
        v-for="marker in filteredMarkers"
        :key="marker.id" :lat-lng="marker" :icon="marker.icon"
      >
        <l-popup>
          <div class="treeType">{{ marker.type }}</div>
          <div class="treeDesc">{{ popupDescription === null ? "laddar..." : popupDescription }}</div>
        </l-popup>
      </l-marker>
      </l-marker-cluster>
    </l-map>
  </div>
</template>

<script>
import { latLng, icon as licon } from "leaflet"
import { LMap, LTileLayer, LMarker, LPopup, LControl } from "vue2-leaflet"
import Vue2LeafletMarkercluster from "vue2-leaflet-markercluster"

const APIBASE = "https://fruktkartan-api.herokuapp.com"

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LControl,
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
        spiderfyOnMaxZoom: false
      },
      markers: [],
      filteredMarkers : [],
      icons: {},
      popupDescription: null,
      filter_hideempty: true,
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

  methods: {
    fetchPopupContent: function (key) {
      let self = this
      fetch(
        `${APIBASE}/tree/${key}`
      )
        .then(response => response.json())
        .then(data => {
          self.popupDescription = data.description
        })
    },
    getIcon: function(type) {
      let icon = this.icons[type]
      if (!icon) {
        icon = this.icons["Annan sort"]
      }
      return icon
    },
    
    updateFilters: function() {
      this.filteredMarkers = this.markers
        .filter(m => this.filter_hideempty ? m.desc || m.img : true)
    },

    fetchMarkers: function() {
      let self = this
      this.markers = []

      let bounds = this.$refs.theMap.mapObject.getBounds()

      let markers = this.markers
      let getIcon = this.getIcon
      fetch(
        `${APIBASE}/trees?bbox=${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
      )
        .then(function(response) {
          return response.json()
        })
        .then(function(json) {
          for (var i in json) {
            markers.push({
              lat: json[i].lat,
              lng: json[i].lon,
              id: i,
              img: json[i].img,
              desc: json[i].desc,
              key: json[i].key,
              type: json[i].type.trim(),
              icon: getIcon(json[i].type.trim())
            })
          }
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

.fetch-control > p {
  background: #f0f0f0;
  padding: .5em 1em;
  border: 1px solid black;
  border-radius: .5em;
}

</style>
