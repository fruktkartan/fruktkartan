<!-- A tree editor shared by addTree dialog and editTree dialog. -->
<template>
  <v-form v-model="tree.valid">
    <v-combobox
      v-model="tree.type"
      required
      :rules="[v => !!v || 'Du måste välja en trädtyp!']"
      :items="insertableTrees"
      label="Trädtyp"
    />
    <v-file-input
      v-model="file"
      accept="image/*"
      label="Ladda upp en bild"
      @change="fileChanged"
    />
    <v-textarea v-model="tree.desc" label="Beskrivning"></v-textarea>
  </v-form>
</template>

<script>
/**
 * A tree editor, for use in dialogs.
 * Implements v-model
 *
 */

const APIBASE = "https://fruktkartan-api.herokuapp.com"
//const APIBASE = "http://localhost:8080"

export default {
  name: "TreeEditor",
  model: {
    prop: "tree",
  },
  props: {
    tree: {
      type: Object,
      default: () => ({
        valid: false,
      }),
    },
  },
  data() {
    return {
      insertableTrees: require("../assets/insertableTrees.json"),
      file: null,
    }
  },
  methods: {
    fileChanged() {
      if (!this.file) {
        return
      }

      // TODO: Alert the user the file is still being uploaded in the background!
      fetch(`${APIBASE}/sign`, {
        method: "POST",
        body: JSON.stringify({ "file-name": this.file.name }),
        headers: { "Content-Type": "application/json" },
      })
        .then(response => response.json())
        .then(response => {
          // Rename file. File.name is readonly in most environs
          // Creating a new file object works, except for IE and some Opera versions
          let renamedFile = new File([this.file], response.filename, {
            type: this.file.type,
          })
          let request = new XMLHttpRequest()
          request.open("PUT", response.signedRequest)
          request.send(renamedFile)
          this.tree.file = response.filename
        })
    },
  },
}
</script>
