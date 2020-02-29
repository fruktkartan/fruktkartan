<!-- A tree editor shared by addTree dialog and editTree dialog. -->
<template>
  <v-form v-model="tree.valid">
    <v-combobox
      v-model="tree.type"
      required
      :rules="[v => !!v || 'Du måste välja en trädtyp!']"
      :items="[
        { text: 'Äppelträd', value: 'Äpple' },
        { text: 'Päronträd', value: 'Päron' },
        { text: 'Körsbärsträd', value: 'Körsbär' },
        { text: 'Plommonträd', value: 'Plommon' },
        { text: 'Fläderbuske', value: 'Fläder' },
      ]"
      label="Trädtyp"
    />
    <v-textarea v-model="tree.desc" label="Beskrivning"></v-textarea>
  </v-form>
</template>

<script>
/**
 * A tree editor, for use in dialogs.
 * Implements v-model
 *
 */
export default {
  name: "TreeEditor",
  model: {
    prop: "tree",
  },
  props: {
    tree: {
      type: Object,
      default: () => ({
        valid: false,
      }),
    },
  },
}
</script>
