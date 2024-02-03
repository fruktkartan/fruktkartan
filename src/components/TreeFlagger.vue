<!-- An interface for flagging a tree for moderation (e.g to be deleted) -->
<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>
      <v-form @input="$emit('input', req)">
        <p>
          Tala om varför det här trädet ska raderas, så tar en av oss hand om
          det så snart som bara möjligt.
        </p>
        <v-textarea
          :value="req"
          :rules="[
            v => {
              if (v && v.trim()) {
                return true
              }
              return 'Du behöver tala om varför trädet ska raderas'
            },
          ]"
          required
          label="Motivering"
          @input="$emit('input', req)"
        />
      </v-form>
    </v-card-text>
    <v-card-actions><slot name="buttons" /></v-card-actions>
    <ConfirmDialog ref="confirm" />
  </v-card>
</template>

<script>
import { mdiDeleteOutline } from "@mdi/js"
import ConfirmDialog from "./ConfirmDialog.vue"

export default {
  name: "TreeEditor",
  components: {
    ConfirmDialog,
  },
  props: {
    req: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  emits: "req",
  data() {
    return {
      mdiDeleteOutline,
    }
  },
}
</script>
