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
      <v-list>
        <v-list-item>
          <v-list-item-image>
            <v-img :max-width="width" v-if="!miniVariant" src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/fruktkartan_a.png" />
            <v-img max-width="28px" v-if="miniVariant" src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/f_t.png" />
          </v-list-item-image>
        </v-list-item>
        <v-subheader>
          <v-list-item-icon>
            <v-icon>mdi-filter</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Filtrera</v-list-item-content>
        </v-subheader>

        <v-list-item>
          <v-list-item-icon>
            <v-img :src="selectedTreeIcon" max-width="32" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-select
             :items="selectTreeTypes"
             label="Välj träd att visa"
             v-model="filters.type"
             />
         </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="!miniVariant">
           <v-switch
            v-model="filters.hideempty"
            label="Dölj träd utan bild eller beskrivning?"
           />
        </v-list-item>

        <v-list-item @click="reset()">
          <v-list-item-icon>
            <v-icon>mdi-reload</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Återställ</v-list-item-content>
        </v-list-item>

        <v-subheader>
          <v-list-item-icon>
            <v-icon>mdi-information</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Om Fruktkartan</v-list-item-content>
        </v-subheader>

        <v-list-item v-if="!miniVariant">
          fruktkartan.se är en öppen databas med fruktträd. Vem som helst kan lägga till nya träd. Informationen om träden sparas på sajten säsongsmat.nu och kan användas tillsammans med artiklar och säsongsinformation om frukterna där.
          
          Andra sajter och appar kan använda information härifrån, via ett öppet API.
        </v-list-item>

      </v-list>
      <template v-slot:append>
        <v-list>
          <v-list-item @click="miniVariant = !miniVariant">
            <v-list-item-icon>
              <v-icon v-if="!miniVariant">mdi-close</v-icon>
              <v-icon v-if="miniVariant">mdi-menu-open</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Dölj panelen</v-list-item-content>
          </v-list-item>
        </v-list>
      </template>        

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
      color: null, //"#FFCC00CC",
      width: "317",

      selectTreeTypes: require("./assets/selectTrees.json"),

      filters: {...DEFAULT_FILTERS},
    }
  },
  computed: {
    selectedTreeIcon () {
      let tree = this.filters.type === "*" ? "tree" : this.filters.type
      return require(`./components/icons/${tree}.svg`)
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

html {overflow-y: auto}

#app {
  font-family: sans-serif;
}
#main {
  display: flex;
  flex-direction: column;

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
