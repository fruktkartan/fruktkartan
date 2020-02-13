<template>
  <v-app id="app">
    <v-navigation-drawer
      v-model="drawer"
      :mobile-break-point="960"
      :width="340"
      :mini-variant="miniVariant"
      right
      bottom
      absolute
    >
      <v-card flat class="d-none d-lg-block">
        <h1>
          <v-card-title>
            <v-img
              v-if="!miniVariant"
              alt="Fruktkartan"
              src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/fruktkartan_a.png"
            />
            <v-img
              v-else
              alt="Fruktkartan"
              src="https://sasongsmat-1.s3-eu-west-1.amazonaws.com/fruktkartan/images/f_t.png"
            />
          </v-card-title>
        </h1>
      </v-card>

      <v-list>
        <SidebarItem
          icon="mdi-filter"
          :active="filters.hideempty"
          :tooltip="
            filters.hideempty
              ? 'Döljer träd utan beskrivning'
              : 'Visar även träd utan beskrivning.'
          "
          @miniAction="filters.hideempty = !filters.hideempty"
        >
          <v-switch
            v-model="filters.hideempty"
            label="Dölj träd utan beskrivning?"
          />
        </SidebarItem>

        <SidebarItem
          :icon-img="selectedTreeIcon"
          :tooltip="`Visar ${selectedTreeName.toLowerCase()}`"
          @miniAction="miniVariant = false"
        >
          <v-select
            v-model="filters.type"
            :items="selectTreeTypes"
            label="Välj träd att visa"
          />
        </SidebarItem>

        <SidebarItem
          icon="mdi-reload"
          tooltip="Återställ filter"
          @onClick="reset()"
          >Återställ filter</SidebarItem
        >

        <v-divider />

        <SidebarItem
          icon="mdi-plus"
          tooltip="Lägg till träd"
          @onClick="$refs.map.addTree()"
          >Lägg till träd</SidebarItem
        >

        <v-divider />

        <v-list-item v-if="!miniVariant">
          <v-list-item-content>
            <v-card flat>
              <v-card-title>
                Om Fruktkartan
              </v-card-title>
              <v-card-text>
                <p>
                  Fruktkartan är en öppen databas med fruktträd på allmänningar
                  och i parker. Du kan själv lägga till nya träd, och redigera
                  eller ta bort sådana som inte hör hemma här.
                </p>

                <p><a href="#" @click="showFAQ = true">Läs mer &rarr;</a></p>
              </v-card-text>
            </v-card>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <v-list class="d-none d-lg-block">
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
        <Map ref="map" :tree-filters="filters" class="map" />

        <v-dialog v-model="showFAQ">
          <v-card>
            <v-card-title>
              Om Fruktkartan
            </v-card-title>
            <v-card-text>
              <p>
                Fruktkartan är en öppen databas med fruktträd på allmänningar
                och i parker. Vem som helst kan lägga till nya träd, och
                redigera eller ta bort sådana som inte längre passar. Sajten är
                byggd av Leo Wallentin, Matti Ryhänen och Daniel Lublin.
              </p>

              <p>
                Andra sajter och appar kan använda information härifrån, via ett
                öppet API.
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="showFAQ = false">Stäng</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
  name: "App",
  components: {
    Map,
    SidebarItem,
  },
  data() {
    return {
      showFAQ: false,

      /* v-navigation-drawer */
      drawer: true,
      miniVariant: false,

      /* tree filters */
      selectTreeTypes: require("./assets/selectTrees.json"),
      filters: { ...DEFAULT_FILTERS },
    }
  },
  computed: {
    selectedTreeIcon() {
      let tree = this.filters.type === "*" ? "tree" : this.filters.type
      return require(`./components/icons/${tree}.svg`)
    },
    selectedTreeName() {
      let treeKey = this.filters.type
      if (treeKey === "*") {
        return "alla träd"
      } else {
        return this.selectTreeTypes.filter(x => x.value === treeKey)[0].text
      }
    },
  },
  methods: {
    reset() {
      this.filters = { ...DEFAULT_FILTERS }
    },
  },
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
