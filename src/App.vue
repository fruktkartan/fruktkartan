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
      <h1 alt="Fruktkartan" class="header">
        <img v-if="!miniVariant" src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/LogoSmall.png" />
        <img v-if="miniVariant" src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/LogoMicro.png" />
      </h1>
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
      <p>Om Fruktkartan...</p>
      <v-btn @click="miniVariant = !miniVariant">
        <v-icon>mdi-chevron-left</v-icon>
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
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


.map {
  flex-grow: 1;
}
</style>
