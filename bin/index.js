#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import ora from "ora";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { execSync } from "child_process";

const require = createRequire(import.meta.url);

const program = new Command();
const pkg = require("../package.json");

program
  .name("drupal-pre-committer")
  .description(pkg.description)
  .version(pkg.version);

program
  .command("config")
  .description("Setup pre-commit hooks and linter configs in your repo")
  .action(async () => {
    // Show banner
    console.log(
      chalk.cyan(
        figlet.textSync("Drupal Pre-Committer", { horizontalLayout: "full" })
      )
    );
    // Dynamically import config.js and run main
    // const { default: runConfig } = await import("./config.js");
    // await runConfig();
  });

program.parse(process.argv);

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.resolve(__dirname, "../templates");

const LINTERS = [
  {
    name: "Secretlint",
    value: "secretlint",
    type: "npm",
    deps: ["secretlint", "@secretlint/secretlint-rule-preset-recommend"],
    config: "secretlintrc.json",
    ignore: ".secretlintignore"
  },
  {
    name: "Prettier",
    value: "prettier",
    type: "npm",
    deps: ["prettier", "prettier-eslint"],
    config: "prettierrc.js",
    ignore: ".prettierignore"
  },
  {
    name: "ESLint (JavaScript/TypeScript)",
    value: "eslint",
    type: "npm",
    deps: [
      "eslint",
      "eslint-config-airbnb-base",
      "eslint-config-airbnb",
      "eslint-config-jquery",
      "eslint-plugin-import",
      "eslint-plugin-jquery",
      "eslint-plugin-yml",
      // "eslint-config-prettier",
      // "eslint-plugin-prettier"
    ],
    config: "eslint.config.js",
    ignore: ".eslintignore"
  },
  {
    name: "Stylelint (CSS/SCSS/Drupal)",
    value: "stylelint",
    type: "npm",
    deps: [
      "stylelint",
      "stylelint-config-standard",
      "stylelint-config-recommended-scss",
      // "stylelint-config-prettier",
      // "stylelint-config-drupal",
      "stylelint-scss"
    ],
    config: "stylelint.config.js",
    ignore: ".stylelintignore"
  },
  {
    name: "PHPCS (PHP_CodeSniffer)",
    value: "phpcs",
    type: "composer",
    deps: [
      "dealerdirect/phpcodesniffer-composer-installer",
      "drupal/coder"
    ],
    config: null,
    ignore: null
  },
  {
    name: "PHPCBF (PHP_Code Beautifier and Fixer)",
    value: "phpcbf",
    type: "composer",
    deps: [
      "dealerdirect/phpcodesniffer-composer-installer",
      "drupal/coder"
    ],
    config: null,
    ignore: null
  },
  {
    name: "Twig CS Fixer",
    value: "twigcs",
    type: "composer",
    deps: [
      "vincentlanglet/twig-cs-fixer"
    ],
    config: null,
    ignore: null
  }
];

// Additional tools to always install
const EXTRA_NPM_DEPS = [
  "husky",
  "lint-staged",
  "jira-prepare-commit-msg",
  "validate-branch-name"
];

// Extra config files to always copy
const EXTRA_CONFIGS = [
  { src: ".lintstagedrc.js", dest: ".lintstagedrc.js" },
  { src: "jira-prepare-commit-msg.config.js", dest: "jira-prepare-commit-msg.config.js" },
  { src: "validate-branch-namerc.js", dest: ".validate-branch-namerc.js" }
];

// Helper to sanitize and resolve repo path (accepts absolute or relative)
function safeResolveRepoPath(inputPath) {
  // Resolve relative paths to absolute
  const resolved = path.resolve(process.cwd(), inputPath);
  return resolved;
}

async function main() {
  // 1. Ask for repo root path
  const { repoPath: userInputPath } = await inquirer.prompt([
    {
      type: "input",
      name: "repoPath",
      message: chalk.cyan("Enter the path to the root of your repo (absolute or relative):"),
      validate: function (input) {
        try {
          const resolved = safeResolveRepoPath(input);

          if (!fs.existsSync(resolved)) {
            console.error(chalk.red("Error: Path does not exist."));
            process.exit(1);
          }

          if (!fs.existsSync(path.join(resolved, ".git"))) {
            console.error(chalk.red("Error: Not a valid git repository."));
            process.exit(1);
          }
          return true;
        } catch (e) {
          return chalk.red(e.message);
        }
      }
    }
  ]);

  let repoPath;
  try {
    repoPath = safeResolveRepoPath(userInputPath);
  } catch (e) {
    console.error(chalk.red(e.message));
    process.exit(1);
  }

  // 2. Ask which linters to enable
  const { linters } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "linters",
      message: chalk.cyan("Select linters to enable (use space to select):"),
      choices: LINTERS.map(l => ({ name: l.name, value: l.value })),
      validate: (input) => input.length ? true : chalk.red("Select at least one linter.")
    }
  ]);

  // 3. Install npm dependencies
  const npmDeps = [
    ...new Set([
      ...LINTERS.filter(l => linters.includes(l.value) && l.type === "npm").flatMap(l => l.deps),
      ...EXTRA_NPM_DEPS
    ])
  ];

  if (npmDeps.length) {
    const spinner = ora("Installing npm dependencies...").start();
    try {
      execSync(`npm install --save-dev ${npmDeps.join(" ")}`, { cwd: repoPath, stdio: "inherit" });
      spinner.succeed(chalk.green("NPM dependencies installed successfully."));
    } catch (err) {
      spinner.fail(chalk.red("Failed to install npm dependencies."));
      console.error(chalk.red(err.message));
      process.exit(1);
    } finally {
      spinner.stop();
    }
  }

  // 4. Install composer dependencies
  const composerDeps = [
    ...new Set(
      LINTERS.filter(l => linters.includes(l.value) && l.type === "composer").flatMap(l => l.deps)
    )
  ];

  if (composerDeps.length) {
    const spinner = ora("Installing composer dependencies...").start();
    try {
      execSync(`composer config allow-plugins.dealerdirect/phpcodesniffer-composer-installer true && composer require --dev --no-interaction ${composerDeps.join(" ")}`, { cwd: repoPath, stdio: "inherit" });
      spinner.succeed(chalk.green("Composer dependencies installed successfully."));
    } catch (err) {
      spinner.fail(chalk.red("Failed to install composer dependencies."));
      console.error(chalk.red(err.message));
      process.exit(1);
    } finally {
      spinner.stop();
    }
  }

  // 5. Copy config and ignore files for selected linters
  for (const linter of LINTERS.filter(l => linters.includes(l.value))) {
    if (linter.config) {
      const configSrc = path.join(TEMPLATE_DIR, linter.config);
      const configDest = path.join(repoPath, linter.config.startsWith(".") ? linter.config : `.${linter.config}`);
      if (
        configSrc.startsWith(TEMPLATE_DIR) &&
        fs.existsSync(configSrc)
      ) {
        fs.copyFileSync(configSrc, configDest);
        console.log(chalk.green(`✔ Copied ${linter.config} to repo root.`));
      }
    }
    if (linter.ignore) {
      const ignoreSrc = path.join(TEMPLATE_DIR, linter.ignore);
      const ignoreDest = path.join(repoPath, linter.ignore);
      if (
        ignoreSrc.startsWith(TEMPLATE_DIR) &&
        fs.existsSync(ignoreSrc)
      ) {
        fs.copyFileSync(ignoreSrc, ignoreDest);
        console.log(chalk.green(`✔ Copied ${linter.ignore} to repo root.`));
      }
    }
  }

  // 6. Copy extra config files
  for (const extra of EXTRA_CONFIGS) {
    const src = path.join(TEMPLATE_DIR, extra.src);
    const dest = path.join(repoPath, extra.dest);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(chalk.green(`✔ Copied ${extra.dest} to repo root.`));
    }
  }

  // 7. Setup Husky and lint-staged
  const spinner = ora("Setting up Husky hooks...").start();
  try {
    execSync("npx husky init", { cwd: repoPath, stdio: "inherit" });
    // Add pre-commit hook for lint-staged
    execSync('echo "npx validate-branch-name \nnpx lint-staged" > .husky/pre-commit', { cwd: repoPath, stdio: "inherit" });
    // Add prepare-commit-msg hook for jira-prepare-commit-msg
    execSync('echo "npx jira-prepare-commit-msg" > .husky/prepare-commit-msg', { cwd: repoPath, stdio: "inherit" });
    // Add pre-push hook for validate-branch-name
    // execSync('npx husky add .husky/pre-push "npx validate-branch-name"', { cwd: repoPath, stdio: "inherit" });
    spinner.succeed(chalk.green("Husky hooks set up successfully."));
  } catch (err) {
    console.error(chalk.red("Failed to set up Husky hooks."));
    console.error(chalk.red(err.message));
    process.exit(1);
  } finally {
    spinner.stop();
  }

  // console.log(chalk.bold.cyan("\nPre-commit linter configuration complete!"));
}

main();
// export default main;
