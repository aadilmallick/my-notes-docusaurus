## Eslint

```bash
npm install eslint husky lint-staged --save-dev
```

You can set up eslint with this command:

```bash
npx eslint --init
```

### Eslint Config

This is what your `eslint.config.js` should look like:

```ts
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    ignores: ["dist/**/*", "node_modules/**/*", "index.d.ts"],
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    plugins: { js, "@stylistic": stylistic },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    // ignores: ["dist/**/*", "node_modules/**/*", "*.d.ts"],
    rules: {
      "@stylistic/indent": ["error", 2],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: { globals: globals.node },
  },
  // tseslint.configs.recommended,
]);
```

#### Rules

The rules for eslint come in a special format under the `rules` key: `Record<string, "off" | "warn" | "error">`.

Here are what the different values mean:

- `"off"`: turns the rule off. There will be no warnings or errors.
- `"warn"`: Warns if the rule is violated
- `"error"`: Errors out if the rule is violated, exiting the process with a non-zero exit code.



## Husky

Setup husky with this  command:

```bash
npx husky init
```

Then you need to enable git hooks in your reposity with the `prepare` npm script:

```json
"scripts": {
	"prepare": "cd .. && husky server/.husky",
	"lint": "eslint . --fix",
	"postinstall": "npm run prepare"
}
```

### Husky hooks

Your husky hooks will live in a `.husky` folder, and you have several files in there that will trigger at different times in your git lifecycle. Each file is essentially just a bash script to run linux commands.

If any of the scripts fail while running in the shell, then the corresponding git action that the user just tried to do (like committing) will fail.

- `.husky/pre-commit`: runs the contents of this file when the user tries to commit files.
- `.husky/pre-push`: runs the contents of this file when the user tries to push to remote
- `.husky/post-merge`: runs the contents of this file after merging a branch.
	- This is useful to automatically install dependencies (i.e., new branch updates have an updated `package.json`) after merging a branch
- `.husky/pre-rebase`: runs the contents of this file when the user tries to rebase

### Dealing with non-root husky config

If your `package.json` and thus your `.husky` live in a subfolder and not in the root of the repo, then you have to make the following changes:

1. Make this your `prepare` script, referring correctly to the filepath where the `.husky` directory lives relative to the root.

```json
{
	"scripts": {
		"prepare": "cd .. && husky server/.husky",
	}
}
```

2. Make this your `.husky/pre-commit` file, where you cd into your subfolder before running any bash commands:

```bash
cd server
npx eslint .
npx lint staged
echo "hello"
echo "brrruuh"
```

## Prettier

First install prettier as a dev dependency:

```bash
npm install -D prettier
```

Then you can add your rules to a `.prettierrc` file:

```json title=".prettierrc"
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false
}
```

Then you can add the prettier scripts to your `package.json`

```json
{
  //…
  "scripts": {
    //…
    "format:check": "prettier . --check --ignore-path .gitignore",
    "format:fix": "prettier . --check --ignore-path .gitignore"
  }
  //…
}
```