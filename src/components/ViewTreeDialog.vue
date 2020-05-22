<template>
  <div>
    <TreeViewer
      v-if="step === 'view'"
      :loading="!Object.entries(tree).length"
      :tree="tree"
    >
      <template #buttons>
        <v-btn @click="close">Stäng</v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="step = 'edit'">Redigera</v-btn>
        <v-btn color="red lighten-3" @click="$emit('delete', tree)">
          Ta bort
        </v-btn>
      </template>
    </TreeViewer>

    <TreeEditor v-if="step === 'edit'" v-model="newTree">
      <template #title>Redigera träd</template>
      <template #buttons>
        <v-btn @click="step = 'view'">Tillbaka</v-btn>
        <v-btn
          color="green"
          :disabled="!newTree.valid || treesAreEqual(newTree, tree)"
          @click="step = 'preview'"
        >
          Fortsätt
        </v-btn>
      </template>
    </TreeEditor>

    <TreeViewer v-if="step === 'preview'" :tree="newTree" :preview="true">
      <template #buttons>
        <v-btn @click="step = 'edit'">Tillbaka</v-btn>
        <v-btn color="green" @click="submitTree">Uppdatera trädet</v-btn>
        <v-btn @click="close">Avbryt</v-btn>
      </template>
    </TreeViewer>
  </div>
</template>

<script>
import TreeViewer from "./TreeViewer.vue"
import TreeEditor from "./TreeEditor.vue"

export default {
  name: "ViewTreeDialog",
  components: {
    TreeViewer,
    TreeEditor,
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
  },
  methods: {
    close() {
      this.step = "view"
      this.$emit("close")
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
