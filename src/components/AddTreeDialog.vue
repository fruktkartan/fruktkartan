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
      <v-card-title>{{ tree.type.text || tree.type.value || tree.type }}</v-card-title>
      <v-card-text>{{ tree.desc }}</v-card-text>
      <v-card-actions>
        <v-btn
          @click="step='edit'"
        >Tillbaka</v-btn>
        <v-btn
          @click="step='edit';tree={...TREE_TEMPLATE};$emit('submit', tree)"
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

const TREE_TEMPLATE = {
  type: null,
  desc: null,
}
export default {
  name: "AddTreeDialog",
  props: ["open"],
  data() {
    return {
      step: "edit",
      valid: false,
      tree: {...TREE_TEMPLATE},
    }
  },
}
</script>