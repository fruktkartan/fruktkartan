<template>
  <div id="app" class="full_div" >
    <header>
      <h1>Fruktkartan</h1>
    </header>
    <component :is="currentView" class="map" />
  </div>
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

.map {
  flex-grow: 1;
}
</style>
