<!-- Tree view, used in the regular view interface, as well as editing previews -->

<template>
  <v-card :loading="loading">
    <v-card-text v-if="preview">
      <div class="pt-4">FÖRHANDSGRANSKNING</div>
      <div>
        <small>
          <em>
            Ditt bidrag licenseras med
            <a
              href="https://opendatacommons.org/licenses/odbl/summary/"
              target="_blank"
              >Open Database License</a
            >, bilder med
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/deed.sv"
              target="_blank"
              >CC0</a
            >.
          </em>
        </small>
      </div>
    </v-card-text>
    <v-card-title>{{ tree.type }} </v-card-title>
    <v-card-text>
      <p>
        <small>
          <em>Uppdaterat den {{ prettyDate(date) }}</em>
          <br />
          <v-icon alt="Koordinater" x-small class="mr-1">
            {{ mdiMapMarker }}
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
      <p class="description">
        {{ tree.desc ? tree.desc.trim() : "" }}
      </p>
      <TreeImage :image="tree.file" alt="Bild av trädet" />
    </v-card-text>
    <v-card-actions>
      <slot name="buttons" />
    </v-card-actions>
  </v-card>
</template>

<script>
/**
 * A tree editor, for use in dialogs.
 * Implements v-model
 *
 */
import TreeImage from "./TreeImage.vue"
import dayjs from "dayjs"
import "dayjs/locale/sv"
import { mdiMapMarker } from "@mdi/js"
dayjs.locale("sv")

export default {
  name: "TreeViewer",
  components: {
    TreeImage,
  },
  model: {
    prop: ["loading", "preview", "tree"],
  },
  props: {
    loading: {
      type: Boolean,
    },
    preview: {
      type: Boolean,
      default: false,
    },
    tree: {
      type: Object,
      default: () => {},
    },
  },
  data: function () {
    return {
      mdiMapMarker,
    }
  },
  computed: {
    date() {
      if (this.preview) {
        return new Date()
      } else {
        return this.tree.added
      }
    },
    geoPos() {
      if (!this.tree || !this.tree.lat || !this.tree.lon) {
        return ""
      }
      return `${this.tree.lat.toFixed(6)},${this.tree.lon.toFixed(6)}`
    },
    geoURI() {
      if (!this.tree) {
        return ""
      }
      return `geo:${this.geoPos}`
    },
  },
  methods: {
    prettyDate(date) {
      if (!date) {
        return ""
      }
      const d = dayjs(date)
      return `${d.format("D MMMM YYYY")} kl. ${d.format("H.mm")}`
    },
  },
}
</script>

<style>
.description {
  white-space: pre-wrap;
}
</style>
