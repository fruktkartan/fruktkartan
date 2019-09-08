<template>
  <div>
    <l-map ref="theMap" :center="center" :zoom="zoom" :options="mapOptions">
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-control :position="'topleft'" class="fetch-control">
        <p @click="fetchMarkers">fetch</p>
      </l-control>
      <l-marker-cluster :options="clusterOptions">
      <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker">
        <l-popup>{{ marker.text }}</l-popup>
      </l-marker>
      </l-marker-cluster>
    </l-map>
  </div>
</template>

<script>
import { latLng } from "leaflet"
import { LMap, LTileLayer, LControl, LMarker, LPopup } from "vue2-leaflet"
import Vue2LeafletMarkercluster from "vue2-leaflet-markercluster"

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LControl,
    LPopup,
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
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: false
      },
      markers: []
    }
  },

  methods: {
    fetchMarkers: function() {
      this.markers = []

      let base = "https://fruktkartan-api.herokuapp.com/trees"
      let bounds = this.$refs.theMap.mapObject.getBounds()

      let markers = this.markers
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
              text: json[i].type.trim()
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
