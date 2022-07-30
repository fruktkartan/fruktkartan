<template>
  <v-dialog v-model="displayDialog" max-width="500" persistent>
    <TreeEditor v-if="step === 'edit'" v-model="tree">
      <template #title> Lägg till träd </template>
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="$emit('input', false)"> Tillbaka </v-btn>
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
              @click="
                $emit('input', false)
                $emit('abort')
              "
            >
              Avbryt
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </TreeEditor>

    <TreeViewer v-if="step === 'preview'" :tree="tree" :preview="true">
      <template #buttons>
        <v-row dense>
          <v-col>
            <v-btn @click="step = 'edit'"> Tillbaka </v-btn>
          </v-col>
          <v-col>
            <v-btn color="green" @click="addTree"> Publicera </v-btn>
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn
              @click="
                step = 'edit'
                $emit('input', false)
                $emit('abort')
              "
            >
              Avbryt
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </TreeViewer>
  </v-dialog>
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
  props: {
    value: {
      type: Boolean,
    },
    latLng: {
      type: Object,
      default: () => ({
        lat: null,
        lng: null,
      }),
    },
  },
  data() {
    return {
      step: "edit",
      tree: {},
    }
  },
  computed: {
    displayDialog: function () {
      return this.value ? true : false
    },
  },
  methods: {
    addTree: function () {
      let treePayload = {
        ...this.tree,
        lat: this.latLng.lat,
        lon: this.latLng.lng,
      }
      treePayload.type = treePayload.type.trim()
      treePayload.desc = treePayload.desc.trim()
      fetch(`${process.env.VUE_APP_APIBASE}/tree`, {
        method: "PUT",
        body: JSON.stringify(treePayload),
        headers: { "Content-Type": "application/json" },
      })
        .then(() => {
          this.step = "edit"
          this.tree = {}
          this.$emit("input", false)
          this.$emit("added")
        })
        .catch(err => {
          const msg =
            "Vi lyckades inte spara trädet just nu: " +
            err +
            "\nFörsök gärna igen om en stund!"
          this.$emit("error", msg)
        })
    },
  },
}
</script>
