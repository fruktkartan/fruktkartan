<template>
  <div>
    <v-card v-if="step === 'edit'">
      <v-card-title>Lägg till träd</v-card-title>
      <v-card-text>
        <TreeEditor v-model="tree" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('goBack')">Tillbaka</v-btn>
        <v-btn color="green" :disabled="!tree.valid" @click="step = 'preview'"
          >Fortsätt</v-btn
        >
        <v-btn @click="$emit('close')">Avbryt</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-if="step === 'preview'">
      <v-card-subtitle>FÖRHANDSGRANSKNING</v-card-subtitle>
      <v-card-title>{{
        tree.type.value || tree.type.text || tree.type
      }}</v-card-title>
      <v-card-text>{{ tree.desc }}</v-card-text>
      <v-card-actions>
        <v-btn @click="step = 'edit'">Tillbaka</v-btn>
        <v-btn color="green" @click="submitTree">Publicera trädet</v-btn>
        <v-btn
          @click="
            step = 'edit'
            $emit('close')
          "
          >Avbryt</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import TreeEditor from "./TreeEditor.vue"

export default {
  name: "AddTreeDialog",
  components: {
    TreeEditor,
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
