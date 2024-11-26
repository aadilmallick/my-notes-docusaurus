# The basics of Deno

## Basic deno commands

- `deno upgrade`: upgrades deno to latest stable version
- `deno init <project-name>`: scaffolds out a typescript project
- `deno uninstall <package>`: uninstalls a package
- `deno install`: installs all dependencies
- `deno add <package>`: installs a package
- `deno remove <package>`: removes a package

### Running files

- `deno run <file>`: runs a file
- `deno run --watch <file>`: runs file in watch mode

You also have these security options in place, because by default deno prevents reading and writing from files. To override this behavior, use these flags:

- `deno run -A <file>`: bypasses all security
- `deno run -R <file>`: allows reading
- `deno run -W <file>`: allows writing
- `deno run -E <file>`: allows access environment variables
- `deno run -N <file>`: allows access to the network. 

### Running scripts

To run a specific script from your package json, you would use the `deno task` command and then provide the script name: 

```
deno task <script-name>
```

### Format and linting

- `deno fmt`: formats your code
- `deno lint`: lints your code
- `deno lint --fix`: fixes incompatibility with node modules
- `deno check`: type checks your code

### Compile into executable

- `deno compile <file>`: compiles a js file into an executable

## Using modules

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
### From jsr

### When downloading type declarations

When you download a package that needs to use type declarations, you can just specify the type declarations package like so instead of separately downloading it.

```ts
// @deno-types="npm:@types/express@^4.17"
import express from "npm:express@^4.17";
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