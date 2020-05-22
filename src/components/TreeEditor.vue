<!-- A tree editor shared by addTree dialog and editTree dialog. -->
<template>
  <v-card>
    <v-card-title><slot name="title"></slot></v-card-title>
    <v-card-text>
      <v-form v-model="tree.valid">
        <v-select
          v-model="tree.type"
          required
          :rules="[v => !!v || 'Du måste välja en trädtyp!']"
          :items="insertableTrees"
          label="Trädtyp"
        />

        <p>
          <v-img v-if="file" :src="previewSource" height="194" alt="Ny bild" />
          <TreeImage v-else :image="tree.file" alt="Nuvarande bild" />
        </p>
        <v-file-input
          v-model="file"
          accept="image/*"
          label="Ladda upp en bild"
          @change="fileChanged"
        />
        <v-progress-linear
          :active="uploading"
          :value="uploadingProgress"
          :striped="true"
        />
        <v-textarea v-model="tree.desc" label="Beskrivning"></v-textarea>
      </v-form>
    </v-card-text>
    <v-card-actions><slot name="buttons"></slot></v-card-actions>
  </v-card>
</template>

<script>
/**
 * A tree editor, for use in dialogs.
 * Implements v-model
 *
 */
import TreeImage from "./TreeImage.vue"

const APIBASE = "https://fruktkartan-api.herokuapp.com"
//const APIBASE = "http://localhost:8080"

export default {
  name: "TreeEditor",
  components: {
    TreeImage,
  },
  model: {
    prop: "tree",
  },
  props: {
    tree: {
      type: Object,
      default: () => ({
        valid: false,
        file: null,
      }),
    },
  },
  data() {
    return {
      insertableTrees: require("../assets/insertableTrees.json"),
      file: null,
      uploading: false,
      uploadingProgress: 0,
      uploadOk: null,
    }
  },
  computed: {
    previewSource() {
      return URL.createObjectURL(this.file)
    },
  },
  methods: {
    fileChanged() {
      if (!this.file) {
        // Reset tree.file in case someone deleted a file they just uploaded
        this.tree.file = null
        return
      }

      this.uploading = true
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
          request.upload.addEventListener("progress", e => {
            this.uploadingProgress = (e.loaded / e.total) * 100
          })
          request.onreadystatechange = () => {
            if (request.readyState === 4) {
              this.uploading = false
              this.uploadingProgress = 0
              if (request.status === 200) {
                this.uploadOk = true
                // pass
              } else {
                // FIXME error reporting
                this.uploadOk = false
                console.log("Error uploading:", request.status)
              }
            }
          }
          request.send(renamedFile)
          this.tree.file = response.filename
        })
        .catch(err => {
          // FIXME error reporting
          console.log("Error getting upload signature", err)
          this.uploading = false
          this.uploadingProgress = 0
          this.uploadOk = false
        })
    },
  },
}
</script>
