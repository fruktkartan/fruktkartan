<template>
  <div>
    <v-card :loading="!Object.entries(tree).length">
      <v-card-title>{{ tree.type }} </v-card-title>
      <v-card-text>
        <p>
          <em>Uppdaterat {{ prettyDate(tree.added) }}</em>
        </p>
        <p>{{ tree.description }}</p>
      </v-card-text>
      <v-img v-if="tree.img" :src="tree.img" height="194" />
      <v-card-actions>
        <v-btn @click="$emit('close')">Stäng</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="red lighten-3" @click="$emit('delete', tree)">
          Radera
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
// import TreeEditor from "./TreeEditor.vue"
import dayjs from "dayjs"
import "dayjs/locale/sv"
dayjs.locale("sv")

export default {
  name: "ViewTreeDialog",
  /* components: {
    TreeEditor,
  },*/
  props: {
    tree: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {}
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
