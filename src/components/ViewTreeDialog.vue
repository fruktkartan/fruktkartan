<template>
  <v-dialog
    v-model="displayDialog"
    max-width="440"
    persistent
    @keydown.esc="close"
  >
    <TreeViewer
      v-if="step === 'view'"
      :loading="!Object.entries(tree).length"
      :tree="tree"
    >
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="close">Stäng</v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <v-btn
              :disabled="$store.state.offline"
              @click="
                step = 'edit'
                newTree = { ...tree }
              "
            >
              Redigera
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </TreeViewer>

    <TreeEditor v-if="step === 'edit'" v-model="newTree">
      <template #title>Redigera träd</template>
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'view'">Tillbaka</v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="green"
              :disabled="!newTree.valid || treesAreEqual(newTree, tree)"
              @click="towardsPreview"
            >
              Fortsätt
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              small
              color="red lighten-3"
              :disabled="$store.state.offline"
              @click="deleteTree"
            >
              Ta bort trädet
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </TreeEditor>

    <TreeViewer v-if="step === 'preview'" :tree="newTree" :preview="true">
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'edit'">Tillbaka</v-btn>
          </v-col>
          <v-col>
            <v-btn
              color="green"
              :disabled="$store.state.offline"
              @click="submitTree"
              >Spara ändringar
            </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn @click="close">Avbryt</v-btn>
          </v-col>
        </v-row>
      </template>
    </TreeViewer>

    <ConfirmDialog ref="confirm" />
  </v-dialog>
</template>

<script>
import TreeViewer from "./TreeViewer.vue"
import TreeEditor from "./TreeEditor.vue"
import ConfirmDialog from "./ConfirmDialog.vue"

function raiseOnHttpError(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    let error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export default {
  name: "ViewTreeDialog",
  components: {
    TreeViewer,
    TreeEditor,
    ConfirmDialog,
  },
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      step: "view",
      treeCache: {},
      tree: {},
      newTree: {},
    }
  },
  computed: {
    displayDialog: function () {
      return this.value ? true : false
    },
  },
  /* The dialog is opened before data has been loaded, so we need to watch for 
     tree data change, to update the newTree object (used when editing)
  */
  watch: {
    value: function (key) {
      if (!key) {
        this.tree = {}
        return
      }
      this.fetchTree()
    },
  },
  created: function () {
    // If routed here, we'll have a tree from start
    if (this.value) {
      this.fetchTree()
    }
    // if ("tree" in this.$route.params) {
    //    console.log(this.$route.params.tree)
    //    this.viewTree = this.$route.params.tree
    //  }
  },
  methods: {
    close() {
      this.step = "view"
      this.$emit("input", null)
    },

    fetchTree() {
      const key = this.value
      const getData = new Promise(resolve => {
        if (this.treeCache[key]) {
          resolve(this.treeCache[key])
        } else {
          fetch(`${process.env.VUE_APP_APIBASE}/tree/${key}`)
            .then(raiseOnHttpError)
            .then(response => response.json())
            .then(resolve)
            .catch(err => {
              let msg
              if (err.response && err.response.status === 404) {
                msg =
                  "Du har följt en länk till ett träd som inte finns. " +
                  "Kanske har det tagits bort?"
              } else {
                msg =
                  "Något gick snett när vi försökte hämta det här trädet. " +
                  err
              }
              this.$emit("error", msg)
              this.close()
            })
        }
      })

      getData
        .then(data => {
          this.$emit("tree-loaded", data)
          this.tree = data
          this.treeCache[key] = this.tree
        })
        .catch(err => {
          const msg = "Vi lyckades inte hämta det här trädet just nu. " + err
          this.$emit("error", msg)
          this.close()
        })
    },

    towardsPreview() {
      // tree is edited, we require confirmation if changing tree type
      if (this.tree.type === this.newTree.type) {
        this.step = "preview"
        return
      }
      this.$refs.confirm
        .open(
          `Vill du ändra trädets typ från ${this.tree.type} till ${this.newTree.type}?`,
          { positiveText: "Fortsätt", positiveColor: "green" }
        )
        .then(confirm => {
          if (confirm) {
            this.step = "preview"
          }
        })
    },

    deleteTree() {
      this.$refs.confirm
        .open(
          "Är du säker på att du vill ta bort det här trädet" +
            ` (${this.tree.type}) från Fruktkartan?`
        )
        .then(confirm => {
          if (confirm) {
            let key = this.value
            fetch(`${process.env.VUE_APP_APIBASE}/tree/${key}`, {
              method: "DELETE",
            })
              .then(() => {
                delete this.treeCache[key]
                this.$emit("change")
                this.close()
              })
              .catch(err => {
                // Display error msg, but do not close.
                // User might want to try again
                const msg = "Ett fel uppstod när trädet skulle tas bort: " + err
                this.$emit("error", msg)
              })
          }
        })
    },
    submitTree() {
      let key = this.value
      let treePayload = this.newTree
      treePayload.type = treePayload.type.trim()
      treePayload.desc = treePayload.desc.trim()
      fetch(`${process.env.VUE_APP_APIBASE}/tree/${this.value}`, {
        method: "POST",
        body: JSON.stringify(treePayload),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(() => {
          delete this.treeCache[key]
          this.$emit("change") // trigger map refresh, in case tree type changed
          this.close()
        })
        .catch(err => {
          // Display error msg, but do not close.
          // User might want to try again
          const msg = "Ett fel uppstod när trädet skulle uppdateras: " + err
          this.$emit("error", msg)
        })
    },

    /* Check if there are differences we care about betw trees*/
    treesAreEqual(tree1, tree2) {
      const type1 = tree1.type ? tree1.type.trim() : ""
      const type2 = tree2.type ? tree2.type.trim() : ""
      const desc1 = tree1.desc ? tree1.desc.trim() : ""
      const desc2 = tree2.desc ? tree2.desc.trim() : ""
      return type1 === type2 && desc1 === desc2 && tree1.file === tree2.file
    },
  },
}
</script>
