<template>
  <l-popup>type: {{ type }}<br />key: {{ key_ }}</l-popup>
</template>

<script>
import { LPopup } from "vue2-leaflet"

export default {
  name: "Popup",
  components: {
    LPopup,
  },
  props: ["type", "key_"],
  methods: {

  }
}
</script>

<style>
</style>
