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
      <template v-slot:placeholder>
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

<script>
const S3_BASE = process.env.VUE_APP_S3_BASE
const WIDTH = 400

export default {
  name: "TreeImage",
  props: {
    image: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      default: "",
    },
  },
  data: function () {
    return {
      err: false,
      width: WIDTH,
      placeholder: require("@/assets/placeholder.jpg"),
      timer: null,
      timerTicks: 0,
    }
  },
  computed: {
    img: function () {
      // Adding the url fragment serves two purposes:
      // - It will trigger a redraw (polling for the image)
      // - It will fix some cache issues when an image is generated after page load
      return `${S3_BASE}/${this.image}_${WIDTH}.jpg?ci=${this.timerTicks}`
    },
    img_srcset: function () {
      return [1, 1.5, 2, 3]
        .map(x => `${S3_BASE}/${this.image}_${WIDTH * x}.jpg ${x}x`)
        .join(",")
    },
  },
  watch: {
    image: function () {
      // Because the same component is reused, we need to reset
      // some data when showing a new image
      this.err = false
      this.stopPolling()
      this.timerTicks = 0
      this.timer = null
    },
  },
  beforeDestroy() {
    // This is probably never really needed
    this.stopPolling()
  },
  methods: {
    stopPolling: function () {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    startPolling: function () {
      // start polling the image server for an image, in case it wasn't
      // yet generated on the first attemt. Generating an image thumb can
      // sometimes take a couple of seconds.

      if (this.timer) {
        // Don't start multiple timers
        return
      }
      this.timer = setInterval(() => {
        this.timerTicks += 1
        if (this.timerTicks > 5) {
          this.err = true
          this.stopPolling()
        }
      }, 750)
    },
  },
}
</script>
