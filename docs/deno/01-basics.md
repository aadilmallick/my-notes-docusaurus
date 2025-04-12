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

### Running scripts

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


### Format and linting

- `deno fmt`: formats your code
- `deno lint`: lints your code
- `deno lint --fix`: fixes incompatibility with node modules
- `deno check`: type checks your code

For linting, you can lint specific files and folders like so:

```bash
deno lint <file-or-folder-path>
```

You can also tell the deno linter to ignore specific files by adding the `// deno-lint-ignore-file` comment at the top of your file:

```ts file="main.ts"
// deno-lint-ignore-file

// ... rest of your code
```

### Compile into executable

- `deno compile <file>`: compiles a js file into an executable
	- `-A`: compile with all permissions
	- `-o <filename>`: rename executable to this filename

## Deno Config

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

