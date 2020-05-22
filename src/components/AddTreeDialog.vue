<template>
  <div>
    <TreeEditor v-if="step === 'edit'" v-model="tree">
      <template #title>Lägg till träd</template>
      <template #buttons>
        <v-btn @click="$emit('goBack')">Tillbaka</v-btn>
        <v-btn color="green" :disabled="!tree.valid" @click="step = 'preview'"
          >Fortsätt</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn @click="$emit('close')">Avbryt</v-btn>
      </template>
    </TreeEditor>

    <TreeViewer v-if="step === 'preview'" :tree="tree" :preview="true">
      <template #buttons>
        <v-btn @click="step = 'edit'">Tillbaka</v-btn>
        <v-btn color="green" @click="submitTree">Publicera</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="
            step = 'edit'
            $emit('close')
          "
          >Avbryt</v-btn
        >
      </template>
    </TreeViewer>
  </div>
</template>

<script>
import TreeEditor from "./TreeEditor.vue"
import TreeViewer from "./TreeViewer.vue"

export default {
  name: "AddTreeDialog",
  components: {
    TreeEditor,
    TreeViewer,
  },
  data() {
    return {
      step: "edit",
      tree: {},
    }
  },
  methods: {
    submitTree() {
      let newTree = {
        type: this.tree.type.value || this.tree.type.text || this.tree.type,
        desc: this.tree.desc,
        file: this.tree.file,
      }
      this.$emit("submit", newTree)

      // Reset everything, to make sure the form is blank if the users wants
      // to add another tree
      this.step = "edit"
      this.tree.type = null
      this.tree.desc = null
      this.tree.file = null
    },
  },
}
</script>
