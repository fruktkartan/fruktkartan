<template>
  <div>
    <v-card v-if="step === 'view'" :loading="!Object.entries(tree).length">
      <v-card-title>{{ tree.type }} </v-card-title>
      <v-card-text>
        <p>
          <em>Uppdaterat {{ prettyDate(tree.added) }}</em>
        </p>
        <p>{{ tree.desc }}</p>
      </v-card-text>
      <!-- We'll remove the image if it couldn't be loaded, to avoid empty vertical space -->
      <v-img
        v-if="tree.img"
        :src="tree.img"
        height="194"
        @error="tree.img = false"
      />
      <v-card-actions>
        <v-btn @click="$emit('close')">Stäng</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="step = 'edit'">Redigera</v-btn>
        <v-btn color="red lighten-3" @click="$emit('delete', tree)">
          Radera
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-if="step === 'edit'">
      <v-card-title>Redigera träd</v-card-title>
      <v-card-text>
        <TreeEditor v-model="newTree" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="step = 'view'">Tillbaka</v-btn>
        <v-btn
          color="green"
          :disabled="!newTree.valid"
          @click="step = 'preview'"
        >
          Fortsätt
        </v-btn>
        <v-btn @click="$emit('close')">Avbryt</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import TreeEditor from "./TreeEditor.vue"
import dayjs from "dayjs"
import "dayjs/locale/sv"
dayjs.locale("sv")

export default {
  name: "ViewTreeDialog",
  components: {
    TreeEditor,
  },
  props: {
    tree: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      step: "view",
      newTree: this.tree,
    }
  },
  methods: {
    prettyDate: function(date) {
      if (!date) {
        return ""
      }
      const d = dayjs(date)
      return `${d.format("D MMMM YYYY")} kl ${d.format("H.mm")}`
    },
  },
}
</script>
