const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  {
    extends: compat.extends("airbnb-base", "plugin:vue/recommended", "jquery"),
    plugins: {},

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        ...globals.node,
        Drupal: true,
        jQuery: true,
        _: true,
        BUILD_TARGET: true
      }
    },

    rules: {
      "func-names": "off",
      "no-param-reassign": "off",
      "eqeqeq": "off",
      "no-plusplus": "off",
      "no-underscore-dangle": "off",
      "prefer-arrow-callback": "off",
      "no-console": [ 0 ],
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: true
        }
      ],
      "import/no-unresolved": "off",
      "vue/max-attributes-per-line": [ 0 ],
      "vue/no-template-shadow": [ 0 ],
      "vue/no-use-v-if-with-v-for": [
        "error",
        {
          allowUsingIterationVar: true
        }
      ],
      "no-unused-vars": [
        2,
        {
          vars: "all",
          args: "none",
          ignoreRestSiblings: false
        }
      ],
      "space-in-parens": [ "error", "never" ],
      "lines-around-comment": "off"
    }
  },
  globalIgnores([ "**/dist/*" ])
]);
