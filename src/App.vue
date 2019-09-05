<template>
  <div id="app">
    <component id="full_div" :is="currentView" />
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

#full_div {
  position: absolute;
  overflow-x: auto;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}

#app {
  font-family: sans-serif;
}
</style>
