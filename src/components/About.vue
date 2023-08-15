<template>
  <v-dialog v-model="displayDialog" max-width="500" @keydown.esc="close">
    <v-card>
      <v-card-title>Om Fruktkartan</v-card-title>
      <v-card-text>
        <p>
          Fruktkartan är en öppen databas med fruktträd på allmänningar och i
          parker. Vem som helst kan lägga till nya träd, och redigera eller ta
          bort sådana som inte passar här. Sajten är byggd av Leo Wallentin,
          Matti Ryhänen och Daniel Lublin. Fruktikoner av Pedro Loureiro.
        </p>

        <p>
          Andra sajter och appar kan använda information härifrån, via ett öppet
          API. Informationen är licensierad med
          <a
            href="https://opendatacommons.org/licenses/odbl/summary/"
            target="_blank"
            rel="noopener"
            >Open Database License</a
          >, bilder med
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/deed.sv"
            target="_blank"
            rel="noopener"
            >CC0</a
          >.
        </p>
        <p>
          Fruktkartan är byggd med Vue/Vuetify samt Leaflet med Open Street Maps
          kartor. Källkoden är fri, <em>copyleft</em> och licensierad med
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            target="_blank"
            rel="noopener"
            >AGPLv3</a
          >.
        </p>
        <p>
          Har du hittat en bugg? Rapportera det
          <a
            href="https://github.com/fruktkartan/fruktkartan/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"
            target="_blank"
            rel="noopener"
            >på Github!</a
          ><br />
          Frågor? Skicka ett
          <a href="mailto:mejl@leowallentin.se">mejl</a>!
        </p>
        <small>
          Byggd {{ timestamp }} från
          <a :href="gitcommit" target="_blank" rel="noopener">{{ githash }}</a
          >.
        </small>
      </v-card-text>
      <v-card-actions>
        <v-btn @click.stop="close"> Stäng </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AboutUs",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      timestamp: process.env.VUE_APP_TIMESTAMP ?? "?",
      githash: process.env.VUE_APP_GITHASH ?? "?",
    }
  },
  computed: {
    gitcommit: function () {
      return "https://github.com/fruktkartan/fruktkartan/commit/" + this.githash
    },
    displayDialog: {
      get: function () {
        return this.value ? true : false
      },
      set: function (val) {
        this.$emit("input", val)
      },
    },
  },
  methods: {
    close() {
      this.$emit("input", false)
    },
  },
}
</script>
