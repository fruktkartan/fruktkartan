<!-- A tree editor shared by addTree dialog and editTree dialog. -->
<template>
  <v-card>
    <v-card-title><slot name="title" /></v-card-title>
    <v-card-text>
      <v-form v-model="tree.valid">
        <v-select
          v-model="tree.type"
          required
          :disabled="isExistingTree"
          :items="insertableTrees"
          label="Trädsort"
          :rules="[v => !!v || 'Du måste ange en trädsort']"
        />

        <div>
          <v-img v-if="file" :src="previewSource" height="194" alt="Ny bild" />
          <tree-image v-else :image="tree.file" alt="Nuvarande bild" />
        </div>
        <div v-if="tree.file && !file">
          <v-btn
            small
            class="px-2 mt-1"
            color="red lighten-3"
            @click="deleteImage"
          >
            <v-icon>mdiDeleteOutline </v-icon>Ta bort bilden
          </v-btn>
        </div>
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
        <p v-if="file">
          Bildens rotation kan vara fel här, men bör bli rätt i nästa steg.
        </p>
        <v-textarea
          v-model="tree.desc"
          :rules="[
            v => {
              if (v && v.trim()) {
                return true
              }
              return 'Beskriv trädet innan du fortsätter'
            },
          ]"
          required
          label="Beskrivning"
        />
      </v-form>
    </v-card-text>
    <v-card-actions><slot name="buttons" /></v-card-actions>
    <confirm-dialog ref="confirm" />
  </v-card>
</template>

<script setup>
import TreeImage from "./TreeImage.vue"
import ConfirmDialog from "./ConfirmDialog.vue"
import { computed, ref, useTemplateRef } from "vue"
import predefinedTrees from "../assets/insertableTrees.json"
import { useUserMessageStore } from "@/stores/app"
import { raiseOnHttpError } from "@/utils/http"
const userMessageStore = useUserMessageStore()

const confirm = useTemplateRef("confirm")

const tree = defineModel({
  type: Object,
  default: () => ({
    valid: false,
    file: null,
  }),
})

const { isExistingTree } = defineProps({
  isExistingTree: {
    type: Boolean,
    default: false,
  },
})

const uploading = ref(false)
const uploadingProgress = ref(0)
const uploadOk = ref(null)
const file = ref(null)

const insertableTrees = computed(() => {
  let treeList = predefinedTrees
    .filter(tree => tree.value)
    .map(tree => tree.value)
  // There are legacy tree types in the database. Make them work here
  if (tree.value.type && !treeList.includes(tree.value.type)) {
    treeList.push(tree.value.type)
  }
  return treeList
})

const previewSource = computed(() => {
  return URL.createObjectURL(file.value)
})

const deleteImage = () => {
  confirm.value
    .open("Är du säker på att du vill ta bort bilden?")
    .then(confirm => {
      if (confirm) {
        tree.value.file = null
      }
    })
}

const fileChanged = () => {
  if (file.value) {
    // Reset tree.file in case someone deleted a file they just uploaded
    tree.value.file = null
  }

  uploading.value = true
  fetch(`${import.meta.env.VITE_APIBASE}/sign`, {
    method: "POST",
    body: JSON.stringify({ "file-name": file.value.name }),
    headers: { "Content-Type": "application/json" },
  })
    .then(raiseOnHttpError)
    .then(response => response.json())
    .then(response => {
      // Rename file. File.name is readonly in most environs
      // Creating a new file object works, except for IE and some Opera versions
      let renamedFile = new File([file.value], response.filename, {
        type: file.value.type,
      })
      let request = new XMLHttpRequest()
      request.open("PUT", response.signedRequest)
      request.upload.addEventListener("progress", e => {
        uploadingProgress.value = (e.loaded / e.total) * 100
      })
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          uploading.value = false
          uploadingProgress.value = 0
          if (request.status === 200) {
            uploadOk.value = true
            // pass
          } else {
            uploadOk.value = false
            userMessageStore.push(
              "Något gick fel vid uppladdning av bilden",
              "error"
            )
          }
        }
      }
      request.send(renamedFile)
      tree.value.file = response.filename
    })
    .catch(err => {
      userMessageStore.push(
        "Något gick fel vid uppladdning av bilden: " + err,
        "error"
      )
      uploadingProgress.value = 0
      uploadOk.value = false
    })
    .finally(() => {
      uploading.value = false
    })
}
</script>
