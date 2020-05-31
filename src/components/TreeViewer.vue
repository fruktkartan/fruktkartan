<!-- Tree view, used in the regular view interface, as well as editing previews -->

<template>
  <v-card :loading="loading">
    <v-card-subtitle v-if="preview">
      <p>
        FÖRHANDSGRANSKNING
      </p>
      <p>
        <em>
          Ditt bidrag görs tillgängligt med licensen
          <a
            href="https://opendatacommons.org/licenses/odbl/summary/"
            target="_blank"
            >Open Database License</a
          >, eventuella bilder med
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/deed.sv"
            target="_blank"
            >CC0</a
          >.
        </em>
      </p>
    </v-card-subtitle>
    <v-card-title>{{ tree.type }} </v-card-title>
    <v-card-text>
      <p>
        <em>Uppdaterat den {{ prettyDate(date) }}</em>
      </p>
      <p>{{ tree.desc }}</p>
      <TreeImage :image="tree.file" alt="Bild av trädet" />
    </v-card-text>
    <v-card-actions>
      <slot name="buttons"></slot>
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
  computed: {
    date() {
      if (this.preview) {
        return new Date()
      } else {
        return this.tree.added
      }
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
