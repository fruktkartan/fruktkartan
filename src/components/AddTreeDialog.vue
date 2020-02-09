<template>
  <v-card>
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
        @click="$emit('submit', 'tree')"
        color="green"
        :disabled="!valid"
      >Lägg till träd</v-btn>
      <v-btn
        @click="$emit('close')"
      >Avbryt</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  name: "AddTreeDialog",
  props: ["open"],
  data() {
    return {
      valid: false,
      tree: {
        type: null,
        desc: null,
      },
    }
  },
}
</script>