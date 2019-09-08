<template>
  <div>
    <l-map ref="theMap" :center="center" :zoom="zoom" :options="mapOptions">
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-control :position="'topleft'" class="fetch-control">
        <p @click="fetchMarkers">fetch</p>
      </l-control>
      <l-marker-cluster :options="clusterOptions">
      <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker" :icon="marker.icon">
        <l-popup>{{ marker.type }}</l-popup>
        <l-tooltip>{{ marker.type }}</l-tooltip>
      </l-marker>
      </l-marker-cluster>
    </l-map>
  </div>
</template>

<script>
import { latLng } from "leaflet"
import { LMap, LTileLayer, LIcon, LMarker, LTooltip, LPopup, LControl } from "vue2-leaflet"
import Vue2LeafletMarkercluster from "vue2-leaflet-markercluster"

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LIcon,
    LMarker,
    LTooltip,
    LPopup,
    LControl,
    LMarkerCluster: Vue2LeafletMarkercluster
  },
  data() {
    return {
      center: latLng(55.5917, 13.0199),
      zoom: 12,
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
      icons: {}
    }
  },

  created: function () {
    // almost straight from the old frontend
    function makeIcon(icon) {
      let iconBase = "http://static.sasongsmat.nu/fruktkartan/images/markers/"
      return L.icon({
        iconSize: [42, 36],
        iconAnchor: [21, 34],
        popupAnchor: [0, -36],
        iconUrl: `${iconBase}${icon}.svg`
      })
    }
    let cherryIcon = makeIcon("trädikon, körsbär");
    let currantIcon = makeIcon("bärikon, vinbär");
    let gojiIcon = makeIcon("bärikon, bocktörne");
    let mirabellIcon = makeIcon("bärikon, slånbär");
    let slanIcon = makeIcon("bärikon, slånbär");
    let mullberryIcon = makeIcon("bärikon, mullbär");
    let berryIcon = makeIcon("bärikon");
    let elderIcon = makeIcon("bärikon, fläder");
    let quinceIcon = makeIcon("trädikon, kvitten");
    let plumIcon = makeIcon("trädikon, plommon");
    this.icons = {
      "Äpple": makeIcon("trädikon, äpple"),
      "Päron": makeIcon("trädikon, päron"),
      "Plommon": plumIcon,
      "Mirabellplommon": plumIcon,
      "Fläder": elderIcon,
      "Fläderbär": elderIcon,
      "Fläderblom": elderIcon,
      "Aroniabär": makeIcon("bärikon, aronia"),
      "Björnbär": makeIcon("bärikon, björnbär"),
      "Bocktörne": makeIcon("bärikon, bocktörne"),
      "Havtorn": makeIcon("bärikon, havtorn"),
      "Rönnbär": makeIcon("bärikon, rönnbär"),
      "Smultron": makeIcon("bärikon, smultron"),
      "Gojibär": makeIcon("bärikon, bocktörne"),
      "Hallon": makeIcon("bärikon, hallon"),
      "Nypon": makeIcon("bärikon, nypon"),
      "Vinbär": currantIcon,
      "Röda vinbär": currantIcon,
      "Hasselnöt": makeIcon("nötikon, hasselnöt"),
      "Kastanj": makeIcon("nötikon, kastanj"),
      "Valnöt": makeIcon("nötikon, valnöt"),
      "Ramslök": makeIcon("örtikon, ramslök"),
      "Brännässla": makeIcon("örtikon, brännässla"),
      "Körvel": makeIcon("örtikon, körvel"),
      "Rosenkvitten": quinceIcon,
      "Kvitten": quinceIcon,
      "Rabarber": makeIcon("trädikon, rabarber"),
      "Svart mullbär": mullberryIcon,
      "Mullbär": mullberryIcon,
      "Körsbär": cherryIcon,
      "Surkörsbär": cherryIcon,
      "Bigarråer": cherryIcon,
      "Krikon": slanIcon,
      "Slånbär": slanIcon,
      "Berberisbär": berryIcon,
      "Krusbär": berryIcon,
      "Jordgubbar": berryIcon,
      "Blåbär": berryIcon,
      "Lingon": berryIcon,
      "Körsbärsplommon": mirabellIcon,
      "Mirabell": mirabellIcon,
      "Annan sort": makeIcon("trädikon")
    }
  },

  methods: {
    getIcon: function(type) {
      let icon = this.icons[type]
      if (!icon) {
        icon = this.icons["Annan sort"]
      }
      return icon
    },

    fetchMarkers: function() {
      this.markers = []

      let base = "https://fruktkartan-api.herokuapp.com/trees"
      let bounds = this.$refs.theMap.mapObject.getBounds()

      let markers = this.markers
      let getIcon = this.getIcon
      fetch(
        `${base}?bbox=${bounds._southWest.lat},${bounds._southWest.lng},${bounds._northEast.lat},${bounds._northEast.lng}`
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
              type: json[i].type.trim(),
              icon: getIcon(json[i].type.trim())
            })
          }
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

.fetch-control {
  background: #f0f0f0;
  padding: 0 0.5em;
  border: 1px solid black;
  border-radius: 0.1em;
}
</style>
