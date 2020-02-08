<template>
  <v-list-item @click="$emit('onClick')">
    <v-list-item-icon>
      <v-tooltip left>
        <template v-slot:activator="{on}">
          <v-img v-if="iconImg" :src="iconImg" max-width="32" v-on="on"/>
          <v-icon v-else v-on="on" :color="active ? 'blue' : 'gray'">{{ icon }}</v-icon>
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
  props: ["text", "tooltip", "icon", "icon-img", "active"]
}
</script>