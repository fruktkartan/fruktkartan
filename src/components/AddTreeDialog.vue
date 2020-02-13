<template>
  <div>
    <v-card v-if="step==='edit'">
      <v-card-title>Lägg till träd</v-card-title>
      <v-card-text>
        <v-form v-model="valid">
          <v-combobox
            required
            v-model="tree.type"
            :rules="[v => !!v || 'Du måste välja en trädtyp!']"
            :items="[
              {text: 'Äppelträd', value: 'Äpple'},
              {text: 'Päronträd', value: 'Päron'},
              {text: 'Körsbärsträd', value: 'Körsbär'},
              {text: 'Plommonträd', value: 'Plommon'},
              {text: 'Fläderbuske', value: 'Fläder'},
            ]"
            label="Trädtyp"
          />
          <v-textarea
            v-model="tree.desc"
            label="Beskrivning"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          @click="$emit('goBack')"
        >Tillbaka</v-btn>
        <v-btn
          @click="step='preview'"
          color="green"
          :disabled="!valid"
        >Fortsätt</v-btn>
        <v-btn
          @click="$emit('close')"
        >Avbryt</v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-if="step==='preview'">
      <v-card-subtitle>FÖRHANDSGRANSKNING</v-card-subtitle>
      <v-card-title>{{ tree.type.value || tree.type.text || tree.type }}</v-card-title>
      <v-card-text>{{ tree.desc }}</v-card-text>
      <v-card-actions>
        <v-btn
          @click="step='edit'"
        >Tillbaka</v-btn>
        <v-btn
          @click="submitTree"
          color="green"
        >Publicera trädet</v-btn>
        <v-btn
          @click="step='edit';$emit('close')"
        >Avbryt</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>

export default {
  name: "AddTreeDialog",
  props: ["open"],
  data() {
    return {
      step: "edit",
      valid: false,
      tree: {
        type: null,
        desc: null,
      },
    }
  },
  methods: {
    submitTree() {
      let newTree = {
        type: this.tree.type.value,
        desc: this.tree.desc,
      }
      this.$emit("submit", newTree)

      // Reset everything, to make sure the form is blank if the users wants
      // to add anotrher tree
      this.step = "edit"
      this.tree.type = null
      this.tree.desc = null
    }
  }
}
</script>
