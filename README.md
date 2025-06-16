# @msankhala/drupal-pre-committer

## 🧩 Introduction

`@msankhala/drupal-pre-committer` is a meta-package designed to bootstrap Drupal projects with essential linting and formatting tools. It provides starter configurations and an interactive CLI to help you quickly set up a consistent code quality environment.

## 📦 Installation

You can use this package via `npx` without installing it globally or you can install it as a dev dependency in your Drupal project:

```bash
npm install --save-dev @msankhala/drupal-pre-committer
```

### ⚙️ Usage

Run the CLI:

```bash
npx drupal-pre-committer config
```

Select the tools you want to install from the list:

1. ESLint
1. Prettier
1. Stylelint
1. Secretlint
1. Twig CS Fixer

**The CLI will:**

1. Install the selected tools as dev dependencies.
1. Copy starter configuration files (e.g., .eslintrc.js, .stylelintrc.js, etc.) to your project root

## 🛠️ Supported Tools

1. ESLint
1. Prettier
1. Stylelint
1. Secretlint
1. Twig CS Fixer

## 📁 Configuration Files

Each tool includes:

1. A default configuration file (e.g., .stylelintrc.js)
1. An ignore file (e.g., .stylelintignore)
These are copied to your project root when selected.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve configurations or add support for more tools.
