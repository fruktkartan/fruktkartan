<template>
  <v-dialog
    v-model="displayDialog"
    :max-width="options.width"
    @keydown.esc="negative"
  >
    <v-card>
      <v-card-text class="pa-6">
        <p>
          {{ message }}
        </p>
        <p>
          Skriv då <code>ja</code> nedan och tryck
          <code>{{ options.positiveText }}</code
          >.
        </p>
        <v-text-field v-model="confirm" label="skriv här" />
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn small @click.native="negative"> Nej </v-btn>
        <v-spacer />
        <v-btn
          small
          :color="options.positiveColor"
          :disabled="!confirmed"
          @click.native="positive"
        >
          {{ options.positiveText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    confirm: null,
    resolve: null,
    reject: null,
    message: null,
    defaultOptions: {
      width: 350,
      positiveText: "Ta bort",
      positiveColor: "red lighten-3",
    },
    options: {},
  }),
  computed: {
    displayDialog: {
      get() {
        return this.dialog
      },
      set(value) {
        this.dialog = value
        if (value === false) {
          this.negative()
        }
      },
    },
    confirmed: {
      get() {
        return (
          this.confirm &&
          this.confirm.toLowerCase().replace(/[ "']/g, "") === "ja"
        )
      },
    },
  },
  methods: {
    open(message, options) {
      this.confirm = null
      this.dialog = true
      this.message = message
      Object.assign(this.options, this.defaultOptions)
      this.options = Object.assign(this.options, options)
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    positive() {
      this.resolve(true)
      this.dialog = false
    },
    negative() {
      this.resolve(false)
      this.dialog = false
    },
  },
}
</script>
