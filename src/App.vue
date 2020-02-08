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
      <v-card flat>
        <h1><v-card-title>
          <v-img alt="Fruktkartan" v-if="!miniVariant" src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/fruktkartan_a.png" />
          <v-img alt="Fruktkartan" v-if="miniVariant" src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/f_t.png" />
        </v-card-title></h1>
      </v-card>

      <v-list>

        <v-subheader>
          <v-list-item-icon>
            <v-icon>mdi-filter</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Filtrera</v-list-item-content>
        </v-subheader>

        <v-list-item v-if="!miniVariant">
          <v-list-item-icon />
          <v-switch
            v-model="filters.hideempty"
            label="Dölj träd utan bild eller beskrivning?"
           />
        </v-list-item>

        <v-list-item>
          <v-list-item-icon>
            <v-img :src="selectedTreeIcon" max-width="32" />
          </v-list-item-icon>
          <v-select
            :items="selectTreeTypes"
            label="Välj träd att visa"
            v-model="filters.type"
           />
        </v-list-item>

        <v-list-item @click="reset()">
          <v-list-item-icon>
            <v-icon>mdi-reload</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Återställ</v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list-item @click="$refs.map.addTree()">
          <v-list-item-icon>
            <v-tooltip left>
              <template v-slot:activator="{on}">
              <v-icon v-on="on">mdi-plus</v-icon>
            </template>
              <span>Lägg till träd</span>
            </v-tooltip>
          </v-list-item-icon>
          <v-list-item-content>Lägg till träd</v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list-item v-if="!miniVariant">
          <v-list-item-content>
            <v-card flat>
              <v-card-title>
                Om Fruktkartan
              </v-card-title>
              <v-card-text>
                <p>Fruktkartan är en öppen databas med fruktträd på allmänningar och i parker.
                Vem som helst kan lägga till nya träd, och redigera eller ta bort sådana som inte längre passar.
                Sajten är byggd av Leo Wallentin, Matti Ryhänen och Daniel Lublin.</p>
                
                <p>Andra sajter och appar kan använda information härifrån, via ett öppet API.</p>
                
                <p>Läs mer >></p>
              </v-card-text>
            </v-card>
          </v-list-item-content>
        </v-list-item>

        <SidebarItem
          @onAction="$refs.map.addTree()"
        />

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
          ref="map"
        />
      </div>
    </v-content>
  </v-app>
</template>

<script>
import Map from "./components/Map.vue"
import SidebarItem from "./components/SidebarItem.vue"

const DEFAULT_FILTERS = {
  hideempty: true,
  type: "*",
}

export default {
  name: "app",
  components: {
    Map,
    SidebarItem
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

html {
  overflow: hidden !important;
}
#main {
  display: flex;
  height: 100%;
}
.map {
  flex-grow: 1;
}
</style>
