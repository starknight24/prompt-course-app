module.exports = {
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  parserOptions: {
    "ecmaVersion": 2020,
    "sourceType": "script",
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "max-len": ["warn", {"code": 120}],
    "require-jsdoc": "off",
    "no-unused-vars": ["warn", {"argsIgnorePattern": "^_", "destructuredArrayIgnorePattern": "^_", "ignoreRestSiblings": true}],
    "object-curly-spacing": ["error", "always"],
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"],
    "new-cap": "off",
    "camelcase": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {
    require: "readonly",
    module: "readonly",
    exports: "readonly",
    __dirname: "readonly",
    __filename: "readonly",
    process: "readonly",
    console: "readonly",
    Buffer: "readonly",
    setTimeout: "readonly",
    clearTimeout: "readonly",
    setInterval: "readonly",
    clearInterval: "readonly",
  },
};
