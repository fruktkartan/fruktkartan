import { defineConfig, globalIgnores } from "eslint/config"
import pluginVue from "eslint-plugin-vue"
import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"

export default defineConfig([
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  globalIgnores(["dist", "public", ".nuxt", ".output"]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // Vue auto-imports (provided by Nuxt)
        ref: "readonly",
        computed: "readonly",
        watch: "readonly",
        watchEffect: "readonly",
        onMounted: "readonly",
        onBeforeUnmount: "readonly",
        onUnmounted: "readonly",
        nextTick: "readonly",
        useTemplateRef: "readonly",
        // Nuxt auto-imports
        useRuntimeConfig: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        useNuxtApp: "readonly",
        defineNuxtPlugin: "readonly",
        // Pinia auto-imports (via @pinia/nuxt)
        defineStore: "readonly",
        storeToRefs: "readonly",
      },
    },
    rules: {
      indent: ["error", 2, {
        FunctionDeclaration: {
          parameters: "first",
        },

        VariableDeclarator: {
          var: 2,
          let: 2,
          const: 3,
        },

        ignoredNodes: [],
        SwitchCase: 1,
      }],

      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "never"],

      "no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
      }],

      "max-len": [2, {
        code: 90,
        tabWidth: 2,
        ignoreUrls: true,
      }],
    },
  },
  // Nuxt pages and layouts use single-word file names by convention
  {
    files: ["app/pages/**/*.vue", "app/layouts/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/valid-template-root": "off",
    },
  },
  eslintConfigPrettier,
])
