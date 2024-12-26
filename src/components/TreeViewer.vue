<!-- Tree view, used in the regular view interface, as well as editing previews -->

<template>
  <v-card :loading="loading">
    <v-card-text v-if="preview">
      <div class="pt-4">
        FÖRHANDSGRANSKNING
      </div>
      <div>
        <small>
          <em>
            Ditt bidrag licenseras med
            <a
              href="https://opendatacommons.org/licenses/odbl/summary/"
              target="_blank"
            >Open Database License</a>, bilder med
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/deed.sv"
              target="_blank"
            >CC0</a>.
          </em>
        </small>
      </div>
    </v-card-text>
    <v-card-title>{{ tree.type }}</v-card-title>
    <v-card-text>
      <p>
        <small>
          <em>Uppdaterat den {{ prettyDate }}</em>
          <br>
          <v-icon
            alt="Koordinater"
            x-small
            class="mr-1 text-grey"
          >
            mdi-map-marker
          </v-icon>
          <var>
            <a
              :href="geoURI"
              title="Visa i separat karta"
              target="_blank"
              rel="noopener"
            >
              {{ geoPos }}
            </a>
          </var>
        </small>
      </p>
      <p class="description mt-4">
        {{ tree.desc ? tree.desc.trim() : "" }}
      </p>
      <tree-image
        :image="tree.file"
        alt="Bild av trädet"
      />
    </v-card-text>
    <v-card-actions>
      <slot name="buttons" />
    </v-card-actions>
  </v-card>
</template>

<script setup>
/**
 * A tree editor, for use in dialogs.
 * Implements v-model
 *
 */
import TreeImage from "./TreeImage.vue"
import { computed } from "vue"

const { loading, preview, tree } = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  preview: {
    type: Boolean,
    default: false,
  },
  tree: {
    type: Object,
    default: () => {},
  },
})

const geoPos = computed(() => {
  if (!tree || !tree.lat || !tree.lon) {
    return ""
  }
  return `${tree.lat.toFixed(6)},${tree.lon.toFixed(6)}`
})
const geoURI = computed(() => {
  if (!tree) {
    return ""
  }
  return `geo:${geoPos.value}`
})
const date = computed(() => {
  if (preview) {
    return new Date()
  }
  if (!tree || !tree.added) {
    return null
  }
  return new Date(tree.added)
})
const prettyDate = computed(() => {
  if (!date.value) {
    return ""
  }
  const datePart = date.value.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const timePart = date.value.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(":", ".")  // CLDR has a weird default for sv-SE
  return `${datePart} kl. ${timePart}`
})
</script>

<style>
.description {
  white-space: pre-wrap;
}
</style>
