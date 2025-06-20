import { defineConfig, globalIgnores } from "eslint/config"
import pluginVue from "eslint-plugin-vue"
import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"

export default defineConfig([
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  globalIgnores(["dist", "public"]),
  {
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

      "func-call-spacing": ["error", "never"],
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
  eslintConfigPrettier,
])
