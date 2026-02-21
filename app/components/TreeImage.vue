<!-- Display an image in a tree view. -->
<template>
  <div>
    <v-img
      v-if="image && !err"
      :src="img"
      :lazy-src="placeholder"
      :srcset="img_srcset"
      :alt="alt"
      :width="width"
      @error="startPolling()"
      @load="stopPolling()"
    >
      <template #placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular indeterminate color="grey lighten-1" />
        </v-row>
      </template>
    </v-img>
    <v-card v-if="err" class="warning">
      <v-card-text>
        Bilden kunde inte visas just nu. Det kan bero på att den nyss laddats
        upp och fortfarande bearbetas, eller på att den är trasig.
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import placeholder from "~/assets/placeholder.jpg"

const S3_BASE = useRuntimeConfig().public.s3Base
const WIDTH = 400

const props = defineProps({
  image: { type: String, default: null },
  alt: { type: String, default: "" },
})

const err = ref(false)
const width = WIDTH
const timerTicks = ref(0)
let timer = null

const img = computed(
  () => `${S3_BASE}/${props.image}_${WIDTH}.jpg?ci=${timerTicks.value}`
)
const img_srcset = computed(() =>
  [1, 1.5, 2, 3]
    .map(x => `${S3_BASE}/${props.image}_${WIDTH * x}.jpg ${x}x`)
    .join(",")
)

watch(
  () => props.image,
  () => {
    err.value = false
    stopPolling()
    timerTicks.value = 0
  }
)

onBeforeUnmount(() => stopPolling())

function stopPolling() {
  if (timer) clearInterval(timer)
  timer = null
}
function startPolling() {
  if (timer) return
  timer = setInterval(() => {
    timerTicks.value += 1
    if (timerTicks.value > 5) {
      err.value = true
      stopPolling()
    }
  }, 750)
}
</script>
