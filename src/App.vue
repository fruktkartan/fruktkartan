<template>
  <v-app>
    <div id="app" class="full_div" >
      <header class="header">
        <h1 alt="Fruktkartan">
          <img src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/LogoSmall.png" />
        </h1>
      </header>
      <component :is="currentView" class="map" />
    </div>
  </v-app>
</template>

<script>
import Map from "./components/Map.vue"

export default {
  name: "app",
  components: {
    Map
  },
  data () {
    return {
      currentView: "Map"
    }
  }
}
</script>

<style>
@import "../node_modules/leaflet/dist/leaflet.css";

#app {
  font-family: sans-serif;
}
.full_div {
  display: flex;
  flex-direction: column;

  position: absolute;
  overflow-x: auto;
  height: 100%;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}
.header {
  background-color: #FFCC00;
  text-align:center;
}

.header h1 {
  margin: .2em 0 0 0;
}

.map {
  flex-grow: 1;
}
</style>
