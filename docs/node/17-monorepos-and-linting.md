## Linting tools

### Eslint

#### Basics

1. Install

```bash
npm install eslint husky lint-staged --save-dev
```

2. Init eslint

```bash
npx eslint --init
```

#### Eslint Config

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


The rules for eslint come in a special format under the `rules` key: `Record<string, "off" | "warn" | "error">`.

Here are what the different values mean:

- `"off"`: turns the rule off. There will be no warnings or errors.
- `"warn"`: Warns if the rule is violated
- `"error"`: Errors out if the rule is violated, exiting the process with a non-zero exit code.


### Biome

Biome is essentially the combination of prettier and ESLint and Biome is faster as well, making it one easy, fast way to add linting and formatting to your project while also being more performant than ESLint and Prettier.

1. Install biome

```bash
# -E flag pins current version
npm i -D -E @biomejs/biome
```

2. Initialize biome, which creates a `biome.json`

```bash
npx @biomejs/biome init
```

Now you can run commands like this to lint and format your code:

```bash
# Format all files
npx @biomejs/biome format --write

# Format specific files
npx @biomejs/biome format --write $FILES

# Lint files and apply safe fixes to all files
npx @biomejs/biome lint --write

# Lint files and apply safe fixes to specific files
npx @biomejs/biome lint --write $FILES

# Format, lint, and organize imports of all files
npx @biomejs/biome check --write

# Format, lint, and organize imports of specific files
npx @biomejs/biome check --write $FILES
```
#### `biome.json`

A Biome configuration file is named `biome.json` or `biome.jsonc`. It is usually placed in your project’s root folder, next to your project’s `package.json`.

Because Biome is a toolchain, its configuration is organized around the tools it provides. At the moment, Biome provides three tools: the formatter, the linter and the assist. All of these tools are enabled by default. You can disable one or several of them using the `<tool>.enabled` field.

There are 3 important tools to understand:

- `formatter`: controls formatting
- `linter`: controls linting
- `assist`: controls importing and how to refactor code.

```json title="biome.json"
{
  "$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
  "formatter": {
    "enabled": false
  },
  "linter": {
    "enabled": false
  },
  "assist": {
    "enabled": false
  }
}
```

Options that apply to more than one language are placed in the corresponding tool field. Language-specific options of a tool are placed under a `<language>.<tool>` field. 

This also allows overriding general options for a given language:

```json title="biome.jsonc"
{
  "formatter": {
    "indentStyle": "space", // default is `tab`
    "lineWidth": 100 // default is `80`
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single", // default is `double`
      "lineWidth": 120 // override `formatter.lineWidth`
    }
  },
  "json": {
    "formatter": {
      "enabled": false
    }
  }
}
```

> [!NOTE]
> Biome refers to all variants of the JavaScript language as `javascript`. This includes TypeScript, JSX and TSX.

##### Ignoring files

The Biome configuration file can be used to refine which files are processed. You can explicitly list the files to be processed using [the `files.includes` field](https://biomejs.dev/reference/configuration/#filesincludes). 

- `files.includes` accepts [glob patterns](https://biomejs.dev/reference/configuration/#glob-syntax-reference) such as `src/**/*.js`. 
- Negated patterns starting with `!` can be used to exclude files.
- Paths and globs inside Biome’s configuration file are resolved relative to the folder the configuration file is in.

Basically there are two ways to configure what files to ignore:

- **global level**: `files.includes` applies to all of Biome’s tools, meaning the files specified here are processed by the linter, the formatter and the assist, unless specified otherwise. 
- **tool level**: For the individual tools, you can further refine the matching files using `<tool>.includes`.

```json
{
  "files": {
    "includes": ["src/**/*.js", "test/**/*.js", "!**/*.min.js"]
  },
  "linter": {
    "includes": ["**", "!test/**"]
  }
}
```

And run the following command:

```bash
biome format test/
```

The command will format the files that end with the `.js` extension and don’t end with the `.min.js` extension from the `test/` folder.

##### Git integration

You can also ignore files that are ignored in your version control (in your `.gitignore`) by using the `"vcs"` key in the `biome.json`:

- `vcs.enabled`: enables version control
- `vcs.clientKind`: Set this to `"git"`
- `vcs.defaultBranch`: String type, set this to the name of the default branch of your repo.
- `vcs.useIgnoreFile`: If set to true, then ignores whatever is ignored in the `.gitignore` file.

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
  "vcs": {
	  "enabled": true,
	  "clientKind": "git",
	  "useIgnoreFile": true,
	  "defaultBranch": "main"
  },
  "formatter": {
    "enabled": false
  },
  "linter": {
    "enabled": false
  },
  "assist": {
    "enabled": false
  }
}
```

If you have `vcs.defaultBranch` specified, you can now run these specific git-integrated commands with biome to lint or format only the staged or unstaged changes on the current branch:


```bash
biome check --changed # check all modifications, staged or unstaged

biome check --staged # check only staged
```
#### Biome with VSCode

1. Install the VSCode biome extension
2. Create a `.vscode/settings.json` and set the default formatter and format on save to point to the Biome extension identifier:

```json title=".vscode/settings.json"
{
	"editor.defaultFormatter": "biomejs.biome",
	"editor.formatOnSave": true,
	"editor.codeActionsOnSave": {
		"source.fixAll.biome": "explicit",
		"source.organizeImports.biome": "explicit"
	}
}
```

3. Press `Ctrl + Shift + P` and then click **Biome: Restart** to restart biome.

Now you should have automatic formatting in version control as well as automatic linting what's safe to lint and organizing imports.

#### Biome with CI

The `biome ci` command is meant to run in CI/CD environments and Biome even has its own github action to lint and format branches.

### Oxlint

1. Install oxlint

```bash
npm install -D oxlint
```

2. Run the `oxlint` command to lint your code:

```json title="package.json"
{
..
  "scripts": {
    "lint": "oxlint"
  },
...
}

```


The great thing about Oxylint is that it has sensible defaults that work right out of the box, so it doesn't require much configuration. 

#### Oxlint config

Run this command to create an `.oxlintrc.json` with default settings, enabled plugins, and a full set of linting rules:

```bash
npx oxlint --init 
```

Now on futures instances of running `oxlint`, it will pull the configuration from the  `.oxlintrc.json`.

#### Oxlint with husky

1. Install the oxlint extension in VSCode:

```bash
code --install-extension oxc.oxc-vscode
```

2. Install husky and lint-staged

```bash
npm install -D husky lint-staged
```

3. Setup the precommit hooks, which creates a `.husky` directory and adds a Husky preparation script to your package.json.

```bash
npx husky-init && npm install
```

4. Point the `"lint-staged"` key in the `package.json` to the `oxlint` command:

```json title="package.json"
{
  ..
  },
  "devDependencies": {
    ...
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": "oxlint"
  }
}

```

5. Run `npx husty init`, which creates a `.husky` directory with a pre-commit hook template.

```
npx husky init
```

6. Now edit the `.husky/pre-commit` file to run the `lint-staged` command:

```bash
lint-staged
```

With this setup, Oxlint will automatically run on any staged JavaScript or TypeScript files before each commit. If linting fails, the commit is blocked until you fix the issues.

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

