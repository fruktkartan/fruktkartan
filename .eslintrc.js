module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "plugin:vue/recommended",
    "plugin:prettier/recommended",
    "eslint:recommended",
  ],
  parser: "vue-eslint-parser",
  plugins: ["prettier"],
  ignorePatterns: ["dist/**"],
  rules: {
    indent: [
      "error",
      2,
      {
        FunctionDeclaration: { parameters: "first" },
        VariableDeclarator: { var: 2, let: 2, const: 3 },
        ignoredNodes: [],
        SwitchCase: 1,
      },
    ],
    "func-call-spacing": ["error", "never"],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "no-unused-vars": ["error", { argsIgnorePattern: "next" }],
    "prettier/prettier": "error",
    "max-len": [2, { code: 90, tabWidth: 2, ignoreUrls: true }],
  },
}
