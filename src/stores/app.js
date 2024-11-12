import { defineStore } from "pinia"


// States related to the app in general (e.g. offline status)
export const useAppStore = defineStore("appStore", {
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

export const useSidebarStore = defineStore("sidebarStore", {
  state: () => ({ drawer: false }),
  getters: {
    isOpen: state => state.drawer,
  },
  actions: {
    setDrawer(status) {
      this.drawer = status
    },
    showDrawer() {
      this.drawer = true
    },
    hideDrawer() {
      this.drawer = false
    },
    toggleDrawer() {
      this.drawer = !this.drawer
    },
  },
})

/**
 * Store for user messages, such as errors and warnings.
 * Components can add messages to a message queue, and
 * the messages will be handled by a global UI (displayed in a snackbar).
 * Exact duplicates are not added to the queue.
 */
export const useUserMessageStore = defineStore("UserMessageStore", {
  state: () => ({ queue: []}),
  getters: {
    num: state => state.queue.length,
    next: state => state.queue.length ? state.queue[state.queue.length - 1] : null,
  },
  actions: {
    push(message, type = "error") {
      if (typeof type === "undefined") {
        type = "error"
      }
      if (this.queue.some(m => m.message === message)) {
        return
      }
      if (this.queue.length > 5) {
        this.queue.shift()
      }
      this.queue.push({message, type})
    },
    pop () {
      return this.queue.pop()
    },
    clear() {
      this.queue = []
    }
  },
})