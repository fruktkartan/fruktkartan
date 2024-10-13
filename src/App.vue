<template>
  <v-app>
    <side-panel
      v-model="filters"
      @show-about-us="showFAQ = true"
    />

    <v-main>
      <!--
      <TheMap
        ref="map"
        class="fill-height"
        style="width:100%;height:100%;position:absolute"
        :tree-filters="filters"
        @open-drawer="drawer = true"
        @close-drawer="drawer = false"
      />
      -->
      <!--position absolut för att lira med navigation drawer-->
      <v-card
        class="fill-height"
        style="position:absolute;width:100%;height:100%"
      >
        <karta
          style="position:absolute"
        />
      </v-card>
      <about-us v-model="showFAQ" />

      <v-snackbar v-model="appStore.offline" :timeout="-1" color="warning">
        Vi kunde inte hitta någon internetuppkoppling just nu. Du kommer inte
        kunna lägga till eller redigera träd förrän du har uppkoppling.
        <template #action="{ attrs }">
          <v-btn text v-bind="attrs" @click="appStore.offline = false">
            Stäng
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from './stores/app'
import { useRoute } from "vue-router";

import Karta from "./components/Karta.vue"
import TheMap from "./components/Map.vue"
import AboutUs from "./components/About.vue"
import SidePanel from "./components/SidePanel.vue"
const map = ref()
const appStore = useAppStore()

const route = useRoute()
const showFAQ = ref(route.path == "/om")

const filters = ref({ 
  tree: "*",
})

const selectedTreeName = computed(() => {
  let treeKey = filters.tree
  if (treeKey === "*") {
    return "alla träd"
  } else {
    return selectTreeTypes.filter(x => x.value === treeKey)[0].text
  }
})

//watch route to add event to goatcounter
watch(() => route.path, (r) => {
  showFAQ.value = r === "/om"
  if ("goatcounter" in window) {
    // send a page view to goatcounter
    // window.goatcounter.allow_local = true
    window.goatcounter.count({
      path: () => r.path,
      event: true,
    })
  }
})




</script>
<script>

  /*
export default {

  mounted() {
    // There might be a vue plugin for this, but on the other hand quite straightforward
    window.addEventListener("online", this.updateOnlineStatus)
    window.addEventListener("offline", this.updateOnlineStatus)
  },
  created: function () {


    // Hack around unintended effects of using 100vh in some mobile browser, see
    // https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser
    //
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
        appStore.setOffline(true)
      } else {
        appStore.setOffline(false)
      }
    },
    reset() {
      this.filters = { ...DEFAULT_FILTERS }
    },
  },
}
*/
</script>

<style>

/* Hack around unintended effects of using 100vh in some mobile browser, see
https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser
*/
/*
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
*/

/* Override uppercasing of text buttons (but not the flat) */
/*
.v-btn--contained {
  text-transform: none !important;
}
*/
/* Less whitespace on mobile */
/*
.v-navigation-drawer--is-mobile {
  height: auto !important;
}
*/
</style>
