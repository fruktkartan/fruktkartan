import withNuxt from "./.nuxt/eslint.config.mjs"
import eslintConfigPrettier from "eslint-config-prettier"

export default withNuxt(
  eslintConfigPrettier,
  {
    rules: {
      indent: ["error", 2, {
        FunctionDeclaration: { parameters: "first" },
        VariableDeclarator: { var: 2, let: 2, const: 3 },
        ignoredNodes: [],
        SwitchCase: 1,
      }],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "max-len": [2, { code: 90, tabWidth: 2, ignoreUrls: true }],
    },
  },
  {
    files: ["app/pages/**/*.vue", "app/layouts/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/valid-template-root": "off",
    },
  },
)
