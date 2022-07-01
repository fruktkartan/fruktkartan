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
              :src="mLogo[1]"
              :srcset="`${mLogo[1]} 1x,${mLogo[2]} 2x,${mLogo[3]} 3x`"
              :max-width="280"
            />
          </v-card-title>
          <v-card-title class="hidden-md-and-down">
            <v-img
              v-if="!miniVariant"
              alt="Fruktkartan"
              src="./assets/img/fruktkartan_a.png"
            >
              <span class="beta" :style="{ display: betaDisplay }">beta</span>
            </v-img>
            <v-img v-else alt="Fruktkartan" src="./assets/img/f_t.png" />
          </v-card-title>
        </h1>
      </v-card>

      <v-list>
        <SidebarItem
          :icon-img="selectedTreeIcon"
          :tooltip="`Visar ${selectedTreeName.toLowerCase()}`"
          @mini-action="miniVariant = false"
        >
          <v-select
            v-model="filters.type"
            :items="selectTreeTypes"
            label="Välj träd att visa"
          />
        </SidebarItem>
        <SidebarItem
          :icon="mdiPlus"
          :active="
            $refs.map && ($refs.map.addTree || $refs.map.addTreeMarker.visible)
          "
          :disabled="
            $store.state.offline ||
            ($refs.map && $refs.map.addTreeMarker.visible)
          "
          @on-click="$refs.map.addNewTree()"
        >
          Lägg till träd
        </SidebarItem>
        <SidebarItem :icon="mdiInformation" :active="showFAQ" to="/om">
          Om Fruktkartan
        </SidebarItem>
      </v-list>
      <template #append>
        <v-list class="d-none d-lg-block">
          <v-list-item @click="miniVariant = !miniVariant">
            <v-list-item-icon>
              <v-icon v-if="!miniVariant">
                {{ mdiClose }}
              </v-icon>
              <v-icon v-if="miniVariant" title="Visa panelen">
                {{ mdiMenuOpen }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>Dölj panelen</v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-main>
      <TheMap
        ref="map"
        class="fill-height"
        :tree-filters="filters"
        @open-drawer="drawer = true"
        @close-drawer="drawer = null"
      />
      <AboutUs v-model="showFAQ" />
      <v-snackbar v-model="offlineWarning" :timeout="-1" color="warning">
        Vi kunde inte hitta någon internetuppkoppling just nu. Du kommer inte
        kunna lägga till eller redigera träd förrän du har uppkoppling.
        <template #action="{ attrs }">
          <v-btn text v-bind="attrs" @click="offlineWarning = false">
            Stäng
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script>
import TheMap from "./components/Map.vue"
import AboutUs from "./components/About.vue"
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

const mobileLogotype = {
  // Vue does not support relative imports in srcset
  // See https://github.com/vuejs-templates/webpack/issues/396
  1: require("./assets/img/fruktkartan_m.png"),
  2: require("./assets/img/fruktkartan_m2.png"),
  3: require("./assets/img/fruktkartan_m3.png"),
}

export default {
  name: "App",
  components: {
    TheMap,
    AboutUs,
    SidebarItem,
  },
  data() {
    return {
      offlineWarning: this.$store.state.offline,

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
    console: () => console, // For debugging
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
    mLogo() {
      return mobileLogotype
    },
  },
  watch: {
    $route: function (r) {
      // Check for special routes
      this.showFAQ = r.path === "/om"
      if ("goatcounter" in window) {
        // send a page view to goatcounter
        // window.goatcounter.allow_local = true
        window.goatcounter.count({
          path: () => r.path,
          event: true,
        })
      }
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
  mounted() {
    // There might be a vue plugin for this, but on the other hand quite straightforward
    window.addEventListener("online", this.updateOnlineStatus)
    window.addEventListener("offline", this.updateOnlineStatus)
  },
  created: function () {
    if (window.location.hostname != "fruktkartan.se") {
      this.betaDisplay = "block"
    }
    if (this.$route.path === "/om") {
      this.showFAQ = true
    }

    /* Hack around unintended effects of using 100vh in some mobile browser, see
    https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser
    */
    function appHeight() {
      const doc = document.documentElement
      doc.style.setProperty("--vh", window.innerHeight * 0.01 + "px")
    }
    window.addEventListener("resize", appHeight)
    appHeight()
  },
  beforeDestroy() {
    window.removeEventListener("online", this.updateOnlineStatus)
    window.removeEventListener("offline", this.updateOnlineStatus)
  },
  methods: {
    updateOnlineStatus({ type }) {
      if (type === "offline") {
        this.$store.commit("offline", true)
        this.offlineWarning = true
      } else {
        this.$store.commit("offline", false)
        this.offlineWarning = false
      }
    },
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
  height: calc(var(--vh, 1vh) * 100);
  min-height: calc(var(--vh, 1vh) * 100);
  max-height: calc(var(--vh, 1vh) * 100);
}
.v-application--wrap {
  height: inherit !important;
  max-height: inherit !important;
  min-height: inherit !important;
}

html,
body {
  height: 100vh;
  height: -webkit-fill-available;
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
