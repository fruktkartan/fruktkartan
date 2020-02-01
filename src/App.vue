<template>
  <v-app id="app">
    <v-navigation-drawer
      v-model="drawer"
      :color="color"
      :width="width"
      :expand-on-hover="expandOnHover"
      :mini-variant.sync="miniVariant"
      :right="right"
      :bottom="bottom"
      absolute
    >
      <header class="header">
        <h1 alt="Fruktkartan">
          <img src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/LogoSmall.png" />
        </h1>
      </header>
      <v-form>
        <v-select
         :items="treeTypes"
         label="Välj träd att visa"
         v-model="filters.type"
         />
         <v-switch
          v-model="filters.hideempty"
          label="Dölj träd utan bild eller beskrivning?"
         />
         <v-btn @click="reset()">Återställ</v-btn>
      </v-form>

      <v-btn @click="miniVariant = !miniVariant">
        Visa/Dölj
      </v-btn>
  
      <footer>
        <p>Om Fruktkartan...</p>
      </footer>
    </v-navigation-drawer>

    <v-content>
      <div id="main">
        <component
          :is="currentView"
          :treeFilters="filters"
          class="map"
        />
      </div>
    </v-content>
  </v-app>
</template>

<script>
import Map from "./components/Map.vue"
const DEFAULT_FILTERS = {
  hideempty: true,
  type: "*",
}

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
      expandOnHover: false,
      bottom: true,
      app: true,
      color: "#FFCC00CC",
      width: "317",

      treeTypes: [
        {text: "Alla", value: "*"},
        {text: "Äppelträd", value: "Äpple"},
        {text: "Päronträd", value: "Päron"},
      ],
      filters: {...DEFAULT_FILTERS},
    }
  },
  methods: {
    reset () {
      this.filters = {...DEFAULT_FILTERS}
    },
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
