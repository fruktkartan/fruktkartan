<template>
  <v-navigation-drawer
    v-model="drawer"
    :mobile-breakpoint="960"
    :width="340"
    :rail="miniVariant"
    location="right"
  >
    <v-list-item
      @click="() => miniVariant = !miniVariant"
    >
      <h1>
        <v-img
          :src="mLogo1x"
          :srcset="`${mLogo1x} 1x,${mLogo2x} 2x,${mLogo3x} 3x`"
          :max-width="280"
          class="hidden-lg-and-up"
        />
        <div class="hidden-md-and-down">
          <v-img
            v-if="miniVariant"
            alt="Fruktkartan"
            :src="logoTiny"
          />
          <v-img
            v-else
            alt="Fruktkartan"
            :src="logo"
          >
          </v-img>
        </div>
      </h1>
    </v-list-item>

    <v-list nav>
      <v-list-item
        @click="() => { miniVariant = false }"
      >
        <template #prepend>
          <v-icon :icon="getSelectedTreeIcon" width="100%"/>
        </template>
        <v-select
          v-model="localFilters.tree"
          :items="selectTreeTypes"
          label="Välj träd att visa"
        >
          <template #item="{ props }">
            <!-- While waiting for https://github.com/vuetifyjs/vuetify/pull/19912 -->
            <v-list-subheader v-if="props.header">
             {{ props.header }}
            </v-list-subheader>
            <v-divider v-else-if="props.divider" />
            <v-list-item v-else v-bind="props" />
          </template>
        </v-select>
      </v-list-item>
  
      <!--
      <v-list-item
      prepend-icon="mdi-plus"
      :active="
          $refs.map && ($refs.map.addTree || $refs.map.addTreeMarker.visible)
      "
      :disabled="
          appStore.offline ||
          ($refs.map && $refs.map.addTreeMarker.visible)
      "
      @click="$refs.map.addNewTree()"
      >
      Lägg till träd
      </v-list-item>
      -->
      <v-list-item prepend-icon="mdi-information" :active="$route == '/om'" to="/om">
        Om Fruktkartan
      </v-list-item>
    </v-list>

    <template #append>
      <v-list>
        <v-list-item
          @click="miniVariant = !miniVariant"
          :prepend-icon="miniVariant ? 'mdi-menu-open' : 'mdi-close'"
        >
          Dölj panelen
        </v-list-item>
      </v-list>
    </template>

    </v-navigation-drawer>

</template>
<script setup>
import { computed, watch, reactive, ref } from 'vue'
import selectTreeTypes from "@/assets/selectTrees.json"
import mLogo1x from "@/assets/img/fruktkartan_m.png"
import mLogo2x from "@/assets/img/fruktkartan_m2.png"
import mLogo3x from "@/assets/img/fruktkartan_m3.png"
import logo from "@/assets/img/fruktkartan_a.png"
import logoTiny from "@/assets/img/f_t.png"

// v-model: filters
const props = defineProps({
  modelValue: Object
})
const emit = defineEmits(['update:modelValue'])
const localFilters = reactive(props.modelValue)
watch(
  localFilters, (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const drawer = ref(true)
const miniVariant = ref(false)

const getSelectedTreeIcon = computed(() => 
  localFilters.tree === "*" ? "$tree" : `$${localFilters.tree}`
)
</script>
<style>
.v-icon > svg {
  /* Increadibly dirty hack. Vuetify isn't very clever about custom svg icons. */
  transform: scale(0.6);
  overflow: visible;
} 
</style>