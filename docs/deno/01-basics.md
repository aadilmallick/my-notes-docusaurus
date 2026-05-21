# The basics of Deno

## Basic deno commands

- `deno upgrade`: upgrades deno to latest stable version
- `deno init <project-name>`: scaffolds out a typescript project
- `deno uninstall <package>`: uninstalls a package
- `deno install`: installs all dependencies
- `deno add <package>`: installs a package
- `deno remove <package>`: removes a package

### Running files and permissions

- `deno run <file>`: runs a file
- `deno run --watch <file>`: runs file in watch mode

You also have these security options in place, because by default deno prevents reading and writing from files. To override this behavior, use these flags:

- `deno run -A <file>`: bypasses all security
- `deno run -R <file>`: allows reading
- `deno run -W <file>`: allows writing
- `deno run -E <file>`: allows access environment variables
- `deno run -N <file>`: allows access to the network. 

To deny reading and writing to specific files or directories, you can use these options:

- `--deny-read=<filepath>`: denies reading the specified filepath or folderpath
- `--deny-write=<filepath>`: denies writing to the specified filepath or folderpath

### Deno scripts

To run a specific script from your `deno.json`, you would use the `deno run` command and then provide the script name: 

```json title="deno.json"
{
  "tasks": {
    "dev": "deno run -A --watch main.ts"
  },
}
```

```
deno task <task-name>
```

In the above example, you would run `deno task dev`.

**Running tasks asynchronously**

You can run two tasks asynchronously or concurrently by connecting them with an ampersand. 

```bash
# runs task1 and task2 concurrently
deno task task1 & deno task task2
```

### Environment variables

To load environment variables from a `.env` file into your project so you can access them during runtime, you need to use the `--env` option when running a file with deno: 

```
deno run --env main.ts
```

You can get environment variables programmatically with `Deno.env.get(var_name)`.


### Format, linting, type checking

- `deno fmt`: formats your code
- `deno lint`: lints your code
- `deno lint --fix`: fixes incompatibility with node modules
- `deno check`: type checks your code

For linting, you can lint specific files and folders like so:

```bash
deno lint <file-or-folder-path>
```

You can also tell the deno linter to ignore specific files by adding the `// deno-lint-ignore-file` comment at the top of your file:

```ts title="main.ts"
// deno-lint-ignore-file

// ... rest of your code
```

### Watch mode

You can supply the `--watch` flag to `deno run`, `deno test`, and `deno fmt` to enable the built-in file watcher. The watcher enables automatic reloading of your application whenever changes are detected in the source files.

```bash
deno run --watch main.ts
deno test --watch
deno fmt --watch
```

Here are all the options associated with watch mode:

- `--watch`: enables watch mode
- `--watch-exclude=<files>`: accepts a comma-separated list of filepaths or glob paths to avoid watching.

When in watch mode, you can also exclude certain files from being watched using the `--watch-exclude` option:

```bash
deno run --watch --watch-exclude=file1.ts,file2.ts main.ts
deno run --watch --watch-exclude='*.js' main.ts
```

### Compile into executable

- `deno compile <file>`: compiles a js file into an executable
	- `-A`: compile with all permissions
	- `-o <filename>`: rename executable to this filename

## Deno Config

The `deno.json` has a bunch of important things that determine the behavior of the deno environment and type checking:

### Compiler options

The compiler options change the typescript environment using and other things. It is basically the same thing as the `tsconfig.json` options:

#### TypeScript environment

- `"compilerOptions"."lib"`: this key specifies the typescript library types to use, and accepts an array of strings that represent the environment types to add:
	- `"dom"`: adds frontend and DOM types
	- `"deno.ns"`: adds types based on the `Deno` namespace, allowing you to have correct types for when using the `Deno` class and any of its methods.
	- `"deno.worker"`: adds types for web workers for the `Worker()` MDN spec
	- `"esnext"`: gives you the types for the latest javascript features.

```json
{
  "compilerOptions": {
    "lib": ["dom", "deno.ns"] // for SSR apps (frontend + backend)
  }
}
```

To specify the library files to use in a TypeScript file, you can use `/// <reference lib="..." />` comments:

```ts
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
```

#### Standard typescript settings

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}

```

### Linting settings

The `"lint"` key has settings that affect the behavior of `deno lint`:

```json title="deno.json"
{
  "lint": {
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"],
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    }
  }
}
```

- `"lint"."include"`: lists the files to include for linting
- `"lint"."exclude"`: lists the files to exclude for linting

### Formatting settings

```json title="deno.json"
{
  "fmt": {
    "useTabs": true,
    "lineWidth": 80,
    "indentWidth": 4,
    "semiColons": true,
    "singleQuote": true,
    "proseWrap": "preserve",
    "include": ["src/"],
    "exclude": ["src/testdata/", "src/fixtures/**/*.ts"]
  }
}
```
- `"fmt"."include"`: lists the files to include for formatting
- `"fmt"."exclude"`: lists the files to exclude for formatting

### Excluding paths from type checking, linting, formatting

To exclude files and folders from being type checked, linted, or formatted by Deno at all, use the top level `"excludes"` key:

```json
{
  "exclude": [
    // exclude the dist folder from all sub-commands and the LSP
    "dist/"
  ]
}
```
## Importing modules

### From NPM

When trying to install a package from npm, you have to specify that it's from npm by prefixing the package name with `npm:`.

```bash
deno add npm:chalk
```

You can then use it like so: 

```ts
import chalk from "chalk";
console.log(chalk.red("bruh"));
```

Or you could just import like so, removing the need to explicitly install a package:

```tsx
import chalk from "npm:chalk";
```

### When downloading type declarations

When you download a package that needs to use type declarations, you can just specify the type declarations package like so instead of separately downloading it.

```ts
// @deno-types="npm:@types/express@^4.17"
import express from "npm:express@^4.17";

// @ts-types="npm:@types/lodash"
import * as _ from "npm:lodash";
```

### Importing native node modules

When importing native node modules, you need to prefix them with `node:`

```ts
// ❌
import * as fs from "fs";
import * as http from "http";

// ✅
import * as fs from "node:fs";
import * as http from "node:http";
```

### Importing online modules

When importing packages from an online URL, you can directly import modules inline from the URL or use the `"imports"` key in the `deno.json` to refer to that url via a different name:

Deno also supports import statements that reference HTTP/HTTPS URLs, either directly:

```js
import { Application } from "https://deno.land/x/oak/mod.ts";
```

or part of your `deno.json` import map:

```json
{
  "imports": {
    "oak": "https://deno.land/x/oak/mod.ts"
  }
}
```

> [!NOTE]
> HTTP imports are not supported by `deno add`/`deno install` commands.

### Import remappings

When using `deno add <package-name>` you can use the `"imports"` key in the `deno.json` as a key-value map between library identifier shorthands and their package resolution url:

```json
{
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.0",
    "chalk": "npm:chalk@5"
  }
}
```

Then your script can use the bare specifier `std/assert`:


```js
import { assertEquals } from "@std/assert";
import chalk from "chalk";

assertEquals(1, 2);
console.log(chalk.yellow("Hello world"));
```

#### **custom remappings** for files

You can have custom remappings just like in `tsconfig.json`:

The import map in `deno.json` can be used for more general path mapping of specifiers. You can map an exact specifiers to a third party module or a file directly, or you can map a part of an import specifier to a directory.


```json title="deno.json"
{
  "imports": {
    // Map to an exact file
    "foo": "./some/long/path/foo.ts",
    // Map to a directory, usage: "bar/file.ts"
    "bar/": "./some/folder/bar/"
  }
}
```

Usage:

```ts
import * as foo from "foo";
import * as bar from "bar/file.ts";
```

#### Custom remapping of folders

Just like in typescript, you can remap entire folderpaths to a different folderpath:

For example:


```json title="deno.json"
{
  "imports": {
    "@/": "./"
  }
}
```

And then you can refer to files under that folder like so:
```ts
import { MyUtil } from "@/util.ts";
```

This causes import specifiers starting with `@/` to be resolved relative to the import map's URL or file path.
## Importing files

### Importing typescript files

When importing TypeScript files, you must add on the `.ts` extension.

```ts
// WRONG: missing file extension
import { add } from "./calc";

// CORRECT: includes file extension
import { add } from "./calc.ts";
```
### Importing asset files

**Json files**

You can import JSON files as javascript objects like so:

```ts
import data from "./data.json" with { type: "json" };

console.log(data.property); // Access JSON data as an object

```

**Text files**

All text files (csv, txt, log, etc.) are imported as strings:

```ts
import text from "./log.txt" with { type: "text" };

console.log(typeof text === "string");
// true
console.log(text);
// Hello from a text file
```

**media**

You can statically import any media asset as a `UInt8Array` instance:

```ts
import bytes from "./image.png" with { type: "bytes" };

console.log(bytes instanceof Uint8Array);
// true
console.log(bytes);
Uint8Array(12) [
//    72, 101, 108, 108, 111,
//    44,  32,  68, 101, 110,
//   111,  33
// ]
```


## Jupyter notebooks in deno

You can add deno kernels to jupyter notebook with the `deno jupyter --install` command. Once you're there, yoiu can start running cells with Deno

### Importing files

The important thing to know about importing TS files into deno is that you can only import them via absolute path (NOT FILE URL).


## Deno Frontend Development

### Deno with React

To setup JSX with Deno, specifically React JSX, set these options in the `deno.json`:

```json title="deno.json"
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "imports": {
    "react": "npm:react",
    "@types/react": "npm:@types/react"
  }
}
```

## Development workflow

### Deno skills

```embed
title: "GitHub - denoland/skills: Modern Deno skills for AI coding assistants. Covers Deno, JSR imports, Fresh, Deno Deploy, and best practices."
image: "https://avatars.githubusercontent.com/u/3490640?s=64&v=4"
description: "Modern Deno skills for AI coding assistants. Covers Deno, JSR imports, Fresh, Deno Deploy, and best practices. - denoland/skills"
url: "https://github.com/denoland/skills"
favicon: ""
aspectRatio: "100"
```


There are a list of skills the official Deno team supplies so that agents always have an up to date way of working with Deno:

| Skill                      | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| **deno-guidance**          | Core Deno best practices, JSR packages, CLI commands |
| **deno-deploy**            | Deployment workflows for Deno Deploy                 |
| **deno-frontend**          | Fresh framework, Preact components, Tailwind CSS     |
| **deno-sandbox**           | Safe code execution with @deno/sandbox               |
| **deno-project-templates** | Project scaffolding templates                        |
| **deno-expert**            | Code review and debugging principles                 |
Using the `npx skills` library, you can install the skill like so:

```bash
npx skills add https://github.com/denoland/skills --skill deno-expert
```