<!--
  The sidebar is a navigation drawer that can be toggled on and off from i Pinia store,
  a global store, so that other components can easily trigger the sidebar to show or hide.
  "On" means that the sidebar is visible (`drawer=true; miniVariant=false`),
  while "off" means that the sidebar is collapsed on desktop
  and hidden on mobile (`drawer=null; miniVariant=true`).
 -->
<template>
  <v-navigation-drawer
    v-model="drawer"
    :mobile-breakpoint="960"
    :width="340"
    :rail="miniVariant"
    location="right"
  >
    <v-list-item @click="miniVariant = !miniVariant">
      <h1>
        <div>
          <v-img v-if="miniVariant" alt="Fruktkartan" :src="logoTiny" />
          <v-img
            v-else
            alt="Fruktkartan"
            :src="mLogo1x"
            :srcset="`${mLogo1x} 1x,${mLogo2x} 2x,${mLogo3x} 3x`"
            :max-width="280"
          />
        </div>
      </h1>
    </v-list-item>

    <v-list nav>
      <v-list-item @click="miniVariant = false">
        <template #prepend>
          <v-icon :icon="getSelectedTreeIcon" width="100%" />
        </template>
        <v-select
          v-model="filters.tree"
          :items="selectTreeTypes"
          label="Välj träd att visa"
        >
          <template #item="{ props }">
            <!-- While waiting for https://github.com/vuetifyjs/vuetify/pull/19912 -->
            <!-- Migration in next Vuetify release:   -->
            <!-- 1. Update selectTrees.json entries from -->
            <!-- { "props": { "divider": true } } → { "type": "divider" } --> 
            <!-- and { "props": { "header": "Nötter" } } → { "type": "subheader", "title": "Nötter" } -->
            <!-- 2. Remove this whole template slot override -->
            <v-list-subheader v-if="props.header">
              {{ props.header }}
            </v-list-subheader>
            <v-divider v-else-if="props.divider" />
            <v-list-item v-else v-bind="props" />
          </template>
        </v-select>
      </v-list-item>

      <v-list-item
        prepend-icon="mdi-plus"
        :active="treeIsBeingAdded"
        :disabled="treeIsBeingAdded"
        @click="emit('addTree')"
      >
        Lägg till träd
      </v-list-item>

      <v-list-item
        prepend-icon="mdi-information"
        :active="$route.path === '/om'"
        to="/om"
      >
        Om Fruktkartan
      </v-list-item>
    </v-list>

    <template #append>
      <v-list>
        <v-list-item
          :prepend-icon="miniVariant ? 'mdi-menu-open' : 'mdi-close'"
          @click="miniVariant = !miniVariant"
        >
          Dölj panelen
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>
<script setup>
import selectTreeTypes from "~/assets/selectTrees.json"
import mLogo1x from "~/assets/img/fruktkartan_m.png"
import mLogo2x from "~/assets/img/fruktkartan_m2.png"
import mLogo3x from "~/assets/img/fruktkartan_m3.png"
import logoTiny from "~/assets/img/f_t.png"
import { useSidebarStore } from "~/stores/app"

// We have a global store for collapsing/expanding
// the sidebar, so that map elements can easily trigger
// sidebar to show or hide.
const sidebarStore = useSidebarStore()

const filters = defineModel({ type: Object })
const { treeIsBeingAdded } = defineProps({
  treeIsBeingAdded: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(["addTree"])

// null means "closed" on mobile and "open" on desktop
const drawer = ref(sidebarStore.isOpen ? true : null)
const miniVariant = ref(!sidebarStore.isOpen)

// Listen to store changes (request from other components to open/close)
watch(
  () => sidebarStore.isOpen,
  isOpen => {
    if (isOpen) {
      drawer.value = true
      miniVariant.value = false
    } else {
      drawer.value = null
      miniVariant.value = true
    }
  },
  { immediate: true }
)
// Update store when sidebar is toggled. Careful not to enter a loop here.
watch(
  () => [miniVariant.value, drawer.value],
  ([mini, drw]) => {
    if (mini && sidebarStore.isOpen) {
      sidebarStore.setDrawer(false)
    } else if (!drw && sidebarStore.isOpen) {
      // If sidebar is closed by clicking outside it on mobile
      sidebarStore.setDrawer(false)
    }
  },
  { immediate: true }
)

const getSelectedTreeIcon = computed(() =>
  filters.value.tree === "*" ? "$tree" : `$${filters.value.tree}`
)
</script>
<style>
.v-icon > svg {
  /* Increadibly dirty hack. Vuetify isn't very clever about custom svg icons. */
  transform: scale(0.6);
  overflow: visible;
}
</style>
