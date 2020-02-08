<template>
  <v-list-item @click="$emit('onAction')">
    <v-list-item-icon>
      <v-tooltip left>
        <template v-slot:activator="{on}">
        <v-icon v-on="on">mdi-{{ icon }}</v-icon>
      </template>
        <span>{{ tooltip }}</span>
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
  props: ["text", "tooltip", "icon"]
}
</script>