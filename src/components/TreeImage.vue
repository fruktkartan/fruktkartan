<template>
  <v-img v-if="image" :src="img" :srcset="img_srcset" height="194" :alt="alt" />
</template>

<script>
const S3_BASE = "https://fruktkartan-thumbs.s3.eu-north-1.amazonaws.com"
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
