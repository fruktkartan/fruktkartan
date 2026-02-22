<template>
  <v-dialog
    v-model="displayDialog"
    :max-width="options.width"
    @keydown.esc="abort"
  >
    <v-card>
      <v-card-text class="pa-6">
        <p>
          {{ message }}
        </p>
        <p>
          Skriv då <code>ja</code> nedan och tryck
          <code>{{ options.positiveText }}</code
          >.
        </p>
        <v-text-field v-model="confirm" label="skriv här" />
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn size="small" @click="negative"> Nej </v-btn>
        <v-spacer />
        <v-btn
          size="small"
          :color="options.positiveColor"
          :disabled="!confirmed"
          @click="positive"
        >
          {{ options.positiveText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const displayDialog = ref(false)
const confirm = ref(null)
const resolve = ref(null)
const reject = ref(null)
const message = ref(null)
const defaultOptions = {
  width: 350,
  positiveText: "Ta bort",
  positiveColor: "red-lighten-3",
}
const options = ref({})
const confirmed = computed(() => {
  return (
    confirm.value && confirm.value.toLowerCase().replace(/[ "']/g, "") === "ja"
  )
})

const open = (msg, opts) => {
  confirm.value = null
  message.value = msg
  displayDialog.value = true
  options.value = Object.assign({}, defaultOptions, opts)
  return new Promise((_resolve, _reject) => {
    resolve.value = _resolve
    reject.value = _reject
  })
}
defineExpose({ open })
const positive = () => {
  resolve.value(true)
  displayDialog.value = false
}
const negative = () => {
  resolve.value(false)
  displayDialog.value = false
}
const abort = () => {
  reject.value("abort")
  displayDialog.value = false
}
</script>
