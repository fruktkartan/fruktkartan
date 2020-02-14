module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:vue/recommended",
    "prettier/babel",
    "prettier/vue",
  ],
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2018,
  },
  plugins: ["prettier", "vue"],
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
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "no-unused-vars": ["error", { argsIgnorePattern: "next" }],
    "prettier/prettier": 2,
  },
}
