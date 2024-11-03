<template>
  <v-snackbar v-model="snack" :timeout="-1" :color="snackType">
    {{ snackMessage }}
    <template #actions>
      <v-btn
        variant="text"
        @click="close"
      >
        Stäng
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'

import { useUserMessageStore } from "@/stores/app" 

const userMessageStore = useUserMessageStore()

const snack = ref(false)
const snackMessage = ref('')
const snackType = ref('error')

const checkAndDisplayMessage = () => {
  if (userMessageStore.num > 0) {
    const {type, message} = userMessageStore.pop()
    snackMessage.value = message
    snackType.value = type
    snack.value = true
    return true
  }
  return false
}

const close = () => {
  snack.value = false
  // Pick the next, if any
  checkAndDisplayMessage()
}

userMessageStore.$subscribe((mutation, state) => {
  if (snack.value) {
    // Already showing a message, wait for our turn
    // FIXME: use v-snackbar-queue to simplify this. Waiting for docs (till new in labs)
    // https://vuetifyjs.com/en/components/snackbar-queue/
    return
  }
  checkAndDisplayMessage()
})

// If some component emitted a message before we were mounted
checkAndDisplayMessage()
</script>