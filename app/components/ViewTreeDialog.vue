<template>
  <v-dialog v-model="showTree" max-width="440" persistent @keydown.esc="close">
    <tree-viewer v-if="step === 'view'" :loading="loading" :tree="tree">
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="close"> Stäng </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              :disabled="appStore.offline || loading"
              @click="step = 'delete'"
            >
              Ta bort
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              :disabled="appStore.offline || loading"
              @click="
                () => {
                  step = 'edit'
                  newTree = { ...tree }
                }
              "
            >
              Redigera
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </tree-viewer>

    <tree-editor
      v-if="step === 'edit'"
      v-model="newTree"
      :is-existing-tree="true"
    >
      <template #title> Redigera träd </template>
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'view'"> Tillbaka </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              color="green"
              :disabled="!newTree.valid || treesAreEqual"
              @click="step = 'preview'"
            >
              Fortsätt
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </tree-editor>

    <tree-viewer
      v-if="step === 'preview'"
      :tree="newTree"
      :preview="true"
      :loading="loading"
    >
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'edit'"> Tillbaka </v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="green"
              :disabled="appStore.offline"
              @click="submitTree"
            >
              Spara ändringar
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn @click="close"> Avbryt </v-btn>
          </v-col>
        </v-row>
      </template>
    </tree-viewer>

    <v-card v-if="step === 'delete'" :loading="loading">
      <v-card-title>Anmäl träd för borttagning</v-card-title>
      <v-card-text>
        <p>
          Tala om varför det här trädet ska tas bort, så tar en av oss hand om
          det så snart som bara möjligt.
        </p>
        <v-textarea
          v-model="deleteReason"
          :disabled="loading"
          :rules="[
            v => {
              if (v && v.trim()) {
                return true
              }
              return 'Du behöver tala om varför trädet ska tas bort'
            },
          ]"
          required
          label="Motivering"
        />
      </v-card-text>
      <v-card-actions>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'view'"> Tillbaka </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              color="red"
              :disabled="
                loading ||
                appStore.offline ||
                !deleteReason ||
                !deleteReason.trim()
              "
              @click="flagForDeletion"
            >
              Anmäl för borttagning
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <confirm-dialog ref="confirm" />
  </v-dialog>
</template>

<script setup>
import { useAppStore, useUserMessageStore, useSidebarStore } from "~/stores/app"
import { raiseOnHttpError } from "~/utils/http"

const modelValue = defineModel({
  type: [String, null],
  required: true,
})
const emit = defineEmits(["treeLoaded"])

const appStore = useAppStore()
const userMessageStore = useUserMessageStore()
const sidebarStore = useSidebarStore()
const loading = ref(true)
const step = ref("view")
const tree = ref({})
const newTree = ref({})
const deleteReason = ref(null)
const router = useRouter()
const route = useRoute()

// Reset the reason when coming (back) to step delete
watch(step, newVal => {
  if (newVal === "delete") {
    deleteReason.value = null
  }
})

const fetchTree = () => {
  const key = modelValue.value
  if (!key) {
    return
  }
  loading.value = true
  fetch(`/api/tree/${key}`)
    .then(raiseOnHttpError)
    .then(response => response.json())
    .then(response => {
      tree.value = response
      loading.value = false
      emit("treeLoaded", response)
    })
    .catch(err => {
      let msg
      if (err.response && err.response.status === 404) {
        msg =
          "Du har följt en länk till ett träd som inte finns. " +
          "Kanske har det tagits bort?"
      } else {
        msg = "Något gick snett när vi försökte hämta det här trädet. " + err
      }
      userMessageStore.push(msg)
      close()
    })
}
onMounted(() => {
  fetchTree()
})
watch(modelValue, () => {
  if (modelValue.value) {
    // Dialog opened (including via browser forward/back)
    step.value = "view"
    tree.value = {}
    newTree.value = {}
    deleteReason.value = null
    sidebarStore.hideDrawer()
    fetchTree()
  }
})

/* COMPUTED */

const showTree = computed(() => modelValue.value !== null)

/* Check if there are differences we really care about betw trees*/
const treesAreEqual = computed(() => {
  const type1 = tree.value.type ? tree.value.type.trim() : ""
  const type2 = newTree.value.type ? newTree.value.type.trim() : ""
  const desc1 = tree.value.desc ? tree.value.desc.trim() : ""
  const desc2 = newTree.value.desc ? newTree.value.desc.trim() : ""
  const file1 = tree.value.file || ""
  const file2 = newTree.value.file || ""
  return type1 === type2 && desc1 === desc2 && file1 === file2
})

/* METHODS */

const close = () => {
  // Don't reset state here — the dialog is still visible until the route
  // change commits. State is reset in the modelValue watcher on next open.
  // Guard against double-navigation if an async callback fires after the
  // user has already navigated away (e.g. browser back during a slow request).
  if (route.path.startsWith("/t/")) {
    router.push("/")
  }
}

const flagForDeletion = () => {
  loading.value = true
  const key = modelValue.value
  fetch(`/api/flag/${key}/delete`, {
    method: "POST",
    body: JSON.stringify({ reason: deleteReason.value }),
    headers: { "Content-Type": "application/json" },
  })
    .then(raiseOnHttpError)
    .then(() => {
      const msg =
        "Trädet är markerat för borttagning. Vi tittar på det så snart vi kan."
      userMessageStore.push(msg, "success")
    })
    .catch(err => {
      let msg
      if (err.response && err.response.status === 404) {
        msg =
          "Du har försökt ta bort ett träd som inte finns. " +
          "Kanske har det redan hunnit tas bort?"
      } else {
        msg =
          "Något gick snett när vi försökte markera det här trädet för borttagning. " +
          err
      }
      userMessageStore.push(msg)
    })
    .finally(() => {
      loading.value = false
      close()
    })
}

const submitTree = () => {
  const key = modelValue.value
  let treePayload = newTree.value
  treePayload.desc = treePayload.desc.trim()
  fetch(`/api/tree/${key}`, {
    method: "POST",
    body: JSON.stringify(treePayload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(() => {
      close()
    })
    .catch(err => {
      // Display error msg, but do not close.
      // User might want to try again
      const msg = "Ett fel uppstod när trädet skulle uppdateras: " + err
      userMessageStore.push(msg)
    })
}
</script>
