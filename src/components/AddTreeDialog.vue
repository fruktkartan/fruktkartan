<template>
  <v-dialog
    v-model="displayDialog"
    max-width="500"
    persistent
  >
    <tree-editor
      v-if="step === 'edit'"
      v-model="tree"
    >
      <template #title>
        Lägg till träd
      </template>
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="close">
              Tillbaka
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="green"
              :disabled="!tree.valid"
              @click="step = 'preview'"
            >
              Fortsätt
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              @click="() => {
                close()
                emit('finished')
              }"
            >
              Avbryt
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </tree-editor>

    <tree-viewer
      v-if="step === 'preview'"
      :tree="tree"
      :preview="true"
      :loading="loading"
    >
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'edit'">
              Tillbaka
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="green"
              @click="addTree"
            >
              Publicera
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              @click="() => {
                close()
                emit('finished')
              }"
            >
              Avbryt
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </tree-viewer>
  </v-dialog>
</template>

<script setup>
import TreeEditor from "./TreeEditor.vue"
import TreeViewer from "./TreeViewer.vue"
import { defineEmits, ref, watch } from "vue"
import { useUserMessageStore } from "../stores/app"

const emit = defineEmits(["finished"])

const userMessageStore = useUserMessageStore()
const loading = ref(false)

const displayDialog = defineModel({ type: Boolean })
// Vi kan göra detta till ett modelvalue,
// och nolla när vi är klara istf att använda en emit
const { newTree } = defineProps({
  newTree: {
    type: [Object, null],
    required: true
  }
})
const tree = ref({...newTree})
watch(() => newTree, () => {
  tree.value = {...newTree}
})

const step = ref("edit")
const close = () => {
  step.value = "edit"
  tree.value = {}
  displayDialog.value = false
}

const addTree = () => {
  loading.value = true
  console.log(tree.value)
  let treePayload = {
    ...tree.value,
    type: tree.value.type.trim(),
    desc: tree.value.desc.trim(),
  }
  console.log(treePayload)
  fetch(`${import.meta.env.VITE_APIBASE}/tree`, {
    method: "PUT",
    body: JSON.stringify(treePayload),
    headers: { "Content-Type": "application/json" },
  })
    .then(close)
    .catch(err => {
      const msg =
        "Vi lyckades inte spara trädet just nu: " +
        err +
        "\nFörsök gärna igen om en stund!"
      userMessageStore.addMessage(msg)
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
