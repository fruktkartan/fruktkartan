import pluginVue from "eslint-plugin-vue"
import js from "@eslint/js"


export default [
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
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
        argsIgnorePattern: "next",
      }],

      "max-len": [2, {
        code: 90,
        tabWidth: 2,
        ignoreUrls: true,
      }],
    },
  },
]