## Eslint

### Basics

1. Install

```bash
npm install eslint husky lint-staged --save-dev
```

2. Init eslint

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

## Dealing with monorepos

- **monorepo**: All packages are in the same repository, and tooling is used to share code between packages.
- **polyrepo**: each app or service is kept in its own separate repository, and shared components are published to a package manager like npm.

> [!NOTE]
> The unified setup in a monorepo makes it easier to manage code, share dependencies, use consistent tooling, and improve collaboration across teams.

### The state of tooling

**Turborepo and NX** 

Turborepo and NX deal with build steps for a monorepo and use **distributed caching** to speed up build times across teams.

1. Cached build steps, where tasks with consistent inputs and outputs can be skipped
2. A cloud service that allows sharing these cached results across development teams and CI environments.

**pnpm**

The most heavily used tool for monorepos as an NPM replacement.

### PNPM

First install PNPM like so:

```bash
npm i -g pnpm
# or
brew install pnpm
```

#### Create a package

A **pnpm workspace** is a monorepo setup driven by a root-level `pnpm-workspace.yaml` file that lists all local package folders, where individual packages are in a `packages/<repo-name>` folder to create a monorepo consisting of multiple individual packages.


Here are the steps to create an individual package

1. Make a directory called `packages/firstpackage`
2. Go into the individual package, run `pnpm init` to create a `package.json` in that directory.
3. Create a `index.ts` that exports everything from the package

```js
// exports here
```

4. Create a script in that package

```json
{
	"scripts": {
		"start": "node run index.js"
	}
}
```

Now here are the steps to control packages from the root of the monorepo:

1. Create a `pnpm-workspace.yaml`:

```yaml title="pnpm-workspace.yaml"
# pnpm-workspace.yaml
packages:
  - 'packages/**'
```

2. Create a `package.json` by running `pnpm init` in the root of the monorepo, then add specific scripts to target running scripts in another package.

```json
{
  "name": "seeds",
 "repository": "https://github.com/mike-north/ts-monorepos-v2",
  "private": true,
  "volta": {
    "node": "22.16.0"
  },
   "scripts": {
    "build": "pnpm --color run -r build",
    "lint": "pnpm --color run -r lint",
    "check": "pnpm --color run -r check",
    "test": "pnpm --color run -r test",
    "format": "pnpm --color run -r format",
    "dev": "pnpm --color run -r dev",
    "firstpackage:start": "pnpm -r --filter @seeds/firstpackage run start"
  },
}
```


> [!NOTE]
> The '`-r` flag in pnpm commands stands for "recursive." In a monorepo, using this flag runs the specified command across all packages within the monorepo.
> 
> This means instead of running a command in each package individually, you can run it once at the root, and pnpm will execute it in every package automatically, making management much easier and more efficient.

For example, the `pnpm -r run start` recursively goes to all packages and runs the `pnpm run start` command in all of those packages.

#### Adding other packages as dependencies

Within another package this is how you can add another package from your mono repo as a dependency:

```json title="packages/secondpackage/package.json"
{
	"dependencies": {
		"@seeds/firstpackage": "workspace:*"
	}
}
```

Then after adding a new dependency to the `package.json` in a package, you must run `pnpm install` to actually register those dependencies.

Here are all the steps in detail:

- First, make each package an ECMAScript module by adding "type": "module" in their package.json files.
- In the source package, export the function you want to share.
- In the target package, import the function using the package name (e.g., import { functionName } from "@your-scope/source-package").
- Add the source package as a dependency in the target package's package.json using "workspace:*" to reference the local package.
- Run `pnpm install` in the target package folder to install the local dependency.
- Finally, run your project from the root with `pnpm start` or the appropriate script.
### Code formatting with prettier

1. Add `prettier` to the top level `package.json`

```json title="package.json"
{
  "devDependencies": {
    "prettier": "^3.5.3",
  }
}
```

2. Run `pnpm install` for these changes to take effect
3. Now run this command to use the `prettier` CLI to format all files that match a glob pattern:

```
pnpm dlx prettier --write packages/*/src/**/*
```

4. Make this an NPM script:

```json title="package.json"
{
	"scripts": {
	  "format": "prettier --write packages/*/{src,tests}/**/*.ts packages/*/{tailwind.config.js,postcss.config.cjs,vite.config.ts,svelte.config.js}"
		}
}
```

### ESLint

1. Install node types

```
pnpm i -D @types/node
```


Now do the same for ESLint:

```json title="package.json"
{
	"scripts": {
	  "lint": "eslint packages/*/src/**/*"
	}
}
```

### NX

## TurboRepo

1. Create a monorepo with turborepo

```bash
npx create-turbo@latest
```

### Installing external packages

In a monorepo, installing dependencies only where they are used helps keep the project clear and organized. It improves build caching by avoiding unnecessary dependencies, which speeds up builds. It also allows each package to be flexible and independent, making it easier to scale and manage different projects within the monorepo efficiently.

### Creating a new package

1. Inside the `packages` directory of your monorepo, create a new folder for your package (e.g., `elevation`).
2. Navigate into this new folder and run `pnpm init` to generate a `package.json` file.
3. In the `package.json`, make these changes:
	- **set package name**: set the package name with your repo namespace, like `@repo/elevation`.
	- **make ES module package**: Add a `type` field with the value `module` to enable ES modules syntax.
	- **add scripts**: Add any scripts you want to be available to be called from the root of your monorepo.

```json title="packages/elevation/package.json"
{
	"name": "@repo/elevation",
	"scripts": {
		"dev": "tsc --watch",
		"build": "tsc"
	},
	"type": "module"
}
```
    
      
    
5. Add dev dependencies including `@repo/typescript-config` (pointing to `workspace:*`) and `typescript` (latest version) to ensure proper TypeScript setup.

```json title="packages/elevation/package.json"
{
	"name": "@repo/elevation",
	"scripts": {
		"dev": "tsc --watch",
		"build": "tsc"
	},
	"type": "module",
	"devDependencies": {
		"@repo/typescript-config": "workspace:*",
		"typescript": "latest"
	}
}
```

6. Create a `tsconfig.json` in the package that extends from an existing root `tsconfig.json`:

```json title="packages/elevation/tsconfig.json"
{
	"extends": "@repo/typescript-config/base.json",
	"compilerOptions": {
		"outDir": "dist",
		"rootDir": "src"
	},
	"include": ["src"],
	"exclude": ["node_modules", "dist"]
}
```

7. Run `pnpm install` inside the package folder to install dependencies.

### Building packages

Configuring `dist/**` in your `turbo.json` tells Turborepo where to find the build output files (artifacts) for your package. This is important because Turborepo uses that information to manage build caching and optimize the build process across your monorepo. By specifying the output directory, Turborepo knows which files to cache and reuse, speeding up builds and making your development workflow more efficient.

Then run `turbo build`

