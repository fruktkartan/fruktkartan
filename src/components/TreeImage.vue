<!-- Display an image in a tree view. -->
<template>
  <div>
    <v-img
      v-if="image"
      :src="img"
      :srcset="img_srcset"
      :alt="alt"
      :width="width"
      @error="
        image = false
        err = true
      "
    />
    <div v-if="err" class="warning">
      &lt; Bilden kunde inte visas just nu. Det kan bero på att den nyss laddats
      upp, och fortfarande bearbetas. &gt;
    </div>
  </div>
</template>

<script>
const S3_BASE = process.env.S3_BASE
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
  data() {
    return {
      err: false,
      width: WIDTH,
    }
  },
  computed: {
    img: function () {
      return `${S3_BASE}/${this.image}_${WIDTH}.jpg`
    },
    img_srcset: function () {
      return [1, 1.5, 2, 3]
        .map(x => `${S3_BASE}/${this.image}_${WIDTH * x}.jpg ${x}x`)
        .join(",")
    },
  },
}
</script>
