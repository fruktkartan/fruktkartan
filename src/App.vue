<template>
  <v-app id="app">
    <v-navigation-drawer
      v-model="drawer"
      :color="color"
      :width="width"
      :expand-on-hover="expandOnHover"
      :mini-variant="miniVariant"
      :right="right"
      :bottom="bottom"
      absolute
      dark
    >
      <header class="header">
        <h1 alt="Fruktkartan">
          <img src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/LogoSmall.png" />
        </h1>
      </header>
      <menu id="filters">
        <form>
        <!--<form @change="updateFilters"> -->
          <label>
            <select v-model="filter_type">
              <option value="*">Alla</option>
              <option value="Äpple">Äppelträd</option>
              <option value="Päron">Päronträd</option>
            </select>
            <span class="label">Välj träd att visa</span>
          </label>
          <label>
            <input type="checkbox" v-model="filter_hideempty">
            <span class="label">Dölj träd utan bild eller beskrivning?</span>
          </label>
        </form>
      </menu>
      <footer>
        <p>Om Fruktkartan...</p>
      </footer>
    </v-navigation-drawer>
    <v-content>
      <div id="main">
        <component
          :is="currentView"
          :filter_hideempty="filter_hideempty"
          class="map"
        />
      </div>
    </v-content>
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
      currentView: "Map",

      /* v-navigation-drawer */
      drawer: true,
      right: true,
      miniVariant: false,
      expandOnHover: true,
      bottom: true,
      app: true,
      color: "#FFCC0099",
      width: "317",

      /* filter */
      filter_hideempty: true,
      filter_type: "*",
    }
  }
}
</script>

<style>
@import "../node_modules/leaflet/dist/leaflet.css";

#app {
  font-family: sans-serif;
}
#main {
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

.v-navigation-drawer {
  z-index: 500 !important;
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
