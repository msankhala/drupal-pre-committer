module.exports = {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-recommended-scss",
    "stylelint-config-prettier",
    "stylelint-config-drupal"
  ],
  plugins: [
    "stylelint-scss"
  ],
  rules: {
    // Drupal coding standards
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "declaration-block-trailing-semicolon": "always",
    "indentation": 2,
    "max-empty-lines": 1,
    "number-leading-zero": "always",
    "string-quotes": "double",
    "selector-class-pattern": [
      "^[a-z0-9\\-]+(__[a-z0-9\\-]+)?(--[a-z0-9\\-]+)?$",
      {
        "message": "Selector should follow BEM naming convention (lowercase, hyphens, optional __ or --)."
      }
    ],
    "scss/at-import-partial-extension": "never",
    "scss/at-mixin-pattern": "^([a-z0-9\\-]+)$",
    "scss/dollar-variable-pattern": "^([a-z0-9\\-]+)$"
  },
  ignoreFiles: [
    "**/node_modules/**",
    "**/vendor/**",
    "**/dist/**"
  ]
};
