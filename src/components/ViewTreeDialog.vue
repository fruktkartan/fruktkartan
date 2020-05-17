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
      <TreeImage :image="tree.file" alt="Bild av trädet" />
      <v-card-actions>
        <v-btn @click="close">Stäng</v-btn>
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
          :disabled="!newTree.valid || treesAreEqual(newTree, tree)"
          @click="step = 'preview'"
        >
          Fortsätt
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-if="step === 'preview'">
      <v-card-subtitle>FÖRHANDSGRANSKNING</v-card-subtitle>
      <v-card-title>{{
        newTree.type.value || newTree.type.text || newTree.type
      }}</v-card-title>
      <v-card-text>{{ newTree.desc }}</v-card-text>
      <v-card-actions>
        <v-btn @click="step = 'edit'">Tillbaka</v-btn>
        <v-btn color="green" @click="submitTree">Uppdatera trädet</v-btn>
        <v-btn @click="close">Avbryt</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import TreeEditor from "./TreeEditor.vue"
import TreeImage from "./TreeImage.vue"
import dayjs from "dayjs"
import "dayjs/locale/sv"
dayjs.locale("sv")

export default {
  name: "ViewTreeDialog",
  components: {
    TreeEditor,
    TreeImage,
  },
  props: {
    tree: {
      type: Object,
      default: () => ({}),
    },
    isOpen: {
      type: Boolean,
    },
  },
  data() {
    return {
      step: "view",
      newTree: {},
    }
  },
  /* The dialog is opened before data has been loaded, so we need to watch for 
     tree data change, to update the newTree object (used when editing)
  */
  watch: {
    tree: {
      deep: true,
      immediate: true,
      handler() {
        this.newTree = Object.assign({}, this.tree)
      },
    },
    isOpen: {
      immediate: true,
      handler() {
        // For some reason, Vuetify has no support for closing dialog on ESC
        // and nothing to help us implement it, so we'll have to do it by hand,
        // the old-school vanilla JS way
        let self = this
        let keyPressHandler = function (event) {
          if (event.keyCode === 27) {
            // ESC
            window.removeEventListener("keyup", keyPressHandler)
            self.close()
          }
        }
        if (this.isOpen) {
          window.addEventListener("keyup", keyPressHandler)
        }
      },
    },
  },
  methods: {
    close() {
      this.step = "view"
      this.$emit("close")
    },
    prettyDate(date) {
      if (!date) {
        return ""
      }
      const d = dayjs(date)
      return `${d.format("D MMMM YYYY")} kl ${d.format("H.mm")}`
    },
    submitTree() {
      let editedTree = {
        key: this.newTree.key,
        type:
          this.newTree.type.value ||
          this.newTree.type.text ||
          this.newTree.type,
        desc: this.newTree.desc,
      }
      this.$emit("submit", editedTree)

      // Reset everything, to make sure the form is blank if the users wants
      // to add another tree
      this.step = "view"
      this.newTree = {}
    },
    /* Check if there are differences we care about betw trees*/
    treesAreEqual(tree1, tree2) {
      return tree1.type == tree2.type && tree1.desc === tree2.desc
    },
  },
}
</script>
