<template>
  <v-list-item :to="to" @click="$emit('on-click')">
    <v-list-item-icon @click="$emit('mini-action')">
      <v-tooltip left>
        <template #activator="{ on }">
          <v-img v-if="iconImg" :src="iconImg" max-width="32" v-on="on" />
          <v-icon v-else :color="active ? 'blue' : 'gray'" v-on="on">{{
            icon
          }}</v-icon>
        </template>
        <span>{{ tooltip || $slots.default[0].text }}</span>
      </v-tooltip>
    </v-list-item-icon>
    <v-list-item-content>
      <slot></slot>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: "SidebarItem",
  props: {
    text: {
      type: String,
      default: "",
    },
    to: {
      type: String,
      default: "",
    },
    tooltip: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    iconImg: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
