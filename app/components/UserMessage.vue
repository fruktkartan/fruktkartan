<template>
  <v-snackbar-queue v-model="queue">
    <template #actions="{ props }">
      <v-btn variant="text" v-bind="props">Stäng</v-btn>
    </template>
  </v-snackbar-queue>
</template>

<script setup>
import { useUserMessageStore } from "~/stores/app"

const userMessageStore = useUserMessageStore()
const queue = ref([])

const drainStore = () => {
  while (userMessageStore.num > 0) {
    const { message, type } = userMessageStore.pop()
    queue.value.push({ text: message, color: type, timeout: -1 })
  }
}

userMessageStore.$subscribe(drainStore)
drainStore()
</script>
