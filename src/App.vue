<template>
  <v-app id="app">
    <v-navigation-drawer
      v-model="drawer"
      :mobile-breakpoint="960"
      :width="340"
      :mini-variant="miniVariant"
      right
      bottom
      absolute
    >
      <v-card flat>
        <h1>
          <v-card-title class="hidden-lg-and-up">
            <v-img
              src="fruktkartan_m.png"
              srcset="fruktkartan_m.png 1x,fruktkartan_m2.png 2x,fruktkartan_m3.png 3x"
              :max-width="280"
            />
          </v-card-title>
          <v-card-title class="hidden-md-and-down">
            <v-img
              v-if="!miniVariant"
              alt="Fruktkartan"
              src="fruktkartan_a.png"
            >
              <span class="beta" :style="{ display: betaDisplay }">beta</span>
            </v-img>
            <v-img v-else alt="Fruktkartan" src="f_t.png" />
          </v-card-title>
        </h1>
      </v-card>

      <v-list>
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
        <SidebarItem :icon="mdiPlus" @onClick="$refs.map.addNewTree()">
          Lägg till träd
        </SidebarItem>
        <SidebarItem :icon="mdiInformation" to="om">
          Om Fruktkartan
        </SidebarItem>
      </v-list>
      <template v-slot:append>
        <v-list class="d-none d-lg-block">
          <v-list-item @click="miniVariant = !miniVariant">
            <v-list-item-icon>
              <v-icon v-if="!miniVariant">{{ mdiClose }}</v-icon>
              <v-icon v-if="miniVariant" title="Visa panelen">{{
                mdiMenuOpen
              }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>Dölj panelen</v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <Map
        ref="map"
        class="fill-height"
        :tree-filters="filters"
        @openDrawer="drawer = true"
        @closeDrawer="drawer = null"
      />
      <About v-model="showFAQ" />
    </v-main>
  </v-app>
</template>

<script>
import Map from "./components/Map.vue"
import About from "./components/About.vue"
import SidebarItem from "./components/SidebarItem.vue"
import {
  mdiClose,
  mdiMenuOpen,
  mdiFilter,
  mdiReload,
  mdiInformation,
  mdiPlus,
} from "@mdi/js"

const DEFAULT_FILTERS = {
  type: "*",
}

export default {
  name: "App",
  components: {
    Map,
    About,
    SidebarItem,
  },
  data() {
    return {
      showFAQ: false,

      /* v-navigation-drawer */
      drawer: null, // null means closed on mobile, open on desktop
      miniVariant: false,
      betaDisplay: "none",

      /* tree filters */
      selectTreeTypes: require("./assets/selectTrees.json"),
      filters: { ...DEFAULT_FILTERS },

      /* SVG icons */
      mdiClose,
      mdiMenuOpen,
      mdiFilter,
      mdiReload,
      mdiInformation,
      mdiPlus,
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
  watch: {
    $route: function (r) {
      this.showFAQ = r.path === "/om"
    },
    showFAQ: function (state) {
      // HACK
      // Checking if the dialog was closed, but the route didn't change
      // This is most likely not the way to do it...
      if (!state && this.$route.path === "/om") {
        this.$router.push("/")
      }
    },
  },
  created: function () {
    if (window.location.hostname != "fruktkartan.se") {
      this.betaDisplay = "block"
    }
    if (this.$route.path === "/om") {
      this.showFAQ = true
    }
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

/* Hack around unintended effects of using 100vh in some mobile browser, see
https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser
*/
.v-application {
  height: 100vh;
  height: -webkit-fill-available;
}
.v-application--wrap {
  min-height: 100vh !important;
  min-height: -webkit-fill-available !important;
}

html {
  overflow: hidden !important;
}

.beta {
  display: none;
  float: right;
  padding: 0.25em;
  color: black;
  background-color: rgba(112, 206, 155, 0.85);
  border-radius: 50%;
}

/* Override uppercasing of text buttons (but not the flat) */
.v-btn--contained {
  text-transform: none !important;
}

/* Less whitespace on mobile */
.v-navigation-drawer--is-mobile {
  height: auto !important;
}
</style>
