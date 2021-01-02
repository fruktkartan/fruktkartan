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
        <v-btn @click="close">Stäng</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="$store.state.offline"
          @click="
            step = 'edit'
            newTree = { ...tree }
          "
          >Redigera</v-btn
        >
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
              @click="step = 'preview'"
            >
              Fortsätt
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
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
          <v-spacer></v-spacer>
          <v-col>
            <v-btn @click="close">Avbryt</v-btn>
          </v-col>
        </v-row>
      </template>
    </TreeViewer>
  </v-dialog>
</template>

<script>
import TreeViewer from "./TreeViewer.vue"
import TreeEditor from "./TreeEditor.vue"

function raiseOnHttpError(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export default {
  name: "ViewTreeDialog",
  components: {
    TreeViewer,
    TreeEditor,
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
              console.log(err)
              let msg
              if (err.response.status === 404) {
                msg =
                  "Du har följt en länk till ett träd som inte finns. " +
                  "Kanske har det raderats?"
              } else {
                msg = "Något gick snett när vi försökte hämta det här trädet."
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

    deleteTree() {
      let key = this.value
      let result = window.confirm(
        "Är du säker på att du vill ta bort det här trädet" +
          ` (${this.tree.type}) från Fruktkartan?`
      )
      if (result) {
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
            const msg = "Ett fel uppstod när trädet skulle raderas: " + err
            this.$emit("error", msg)
          })
      }
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
      return (
        tree1.type === tree2.type &&
        tree1.desc === tree2.desc &&
        tree1.file === tree2.file
      )
    },
  },
}
</script>
