<template>
  <v-list-item
    :to="to"
    :active="active"
    :disabled="disabled"
    :inactive="disabled"
    @click="disabled || $emit('on-click')"
  >
    <v-list-item-icon @click="disabled || $emit('mini-action')">
      <v-tooltip left>
        <template #activator="{ on }">
          <v-img v-if="iconImg" :src="iconImg" max-width="32" v-on="on" />
          <v-icon v-else :color="iconColor" v-on="on">
            {{ icon }}
          </v-icon>
        </template>
        <span>{{ tooltip || $slots.default[0].text }}</span>
      </v-tooltip>
    </v-list-item-icon>
    <v-list-item-content>
      <slot />
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
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconColor: function () {
      if (this.active) {
        return "active"
      } else if (this.disabled) {
        return "disabled"
      } else {
        return "default"
      }
    },
  },
}
</script>
