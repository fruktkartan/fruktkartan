// States related to the app in general (e.g. offline status)

import { defineStore } from 'pinia'


export const useAppStore = defineStore('appStore', {
  state: () => {
    return {
      offline: false,
    }
  },
  actions: {
    setOffline(status) {
      this.offline = status
    },
  },
})