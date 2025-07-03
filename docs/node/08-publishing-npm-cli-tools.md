# CLI tools and publishing to NPM

## Creating a CLI: Note

Here is a simple walkthrough of creating a note-taking CLI. 

### Setup

The first step is to register a file as a script. You can do this in your `package.json` by setting the `bin` key, which establishes files as binary scripts.

By making it an object and then adding a `"note"` key, we get to choose the name for our command. Instead of `note-cli`, the base command will be `note`.

```json
{
  "name": "note-cli",
  "bin": {
	  // bind running index.js to the note command. 
    "note": "./index.js"
  }
}
```
Here we are specifying `index.js` as a binary script, for it to really become executable, we need to add this shebang at the top of the file: `#!/usr/bin/env node`

To get this running as a CLI, run `npm link`. Then type in `note` to run the actual command.

So in summary, here are the steps: 
1. Register the file you want to use as a script under the `bin` key in the `package.json`
2. Add the `#!/usr/bin/env node` shebang at the top of the script file
3. Run `npm link`
### Yargs

yargs is an NPM module that comes with a lot of CLI features out of the box, like specifying the number of arguments, parsing those arguments, and even displaying error messages if the arguments are in the wrong format.

A simple use case is to simply use yargs to process `process.argv` into a more readable format, like so: 

```javascript
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// use the argv property to get the processed args back
const args = yargs(hideBin(process.argv)).argv
```
This is an example of using yargs to act as a CLI tool, not only parsing command line arguments but executing code when it gets them.
```javascript
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// removes the first two arguments (node and file) from process.argv
yargs(hideBin(process.argv))
  .command(
	  // the command string form, where note argument is optional: note new [note]
    "new [note]",
    // the command description
    "Create a new note",
    (yargs) => {
    // defines the cli arg we pass down to the second callback
    // also outputs help message if need be
      return yargs.positional("note", {
        type: "string",
        description: "The note to create",
      });
    },
    (argv) => {
    // passes CLI arg through argv, then execute whatever code you want with that
      console.log(`Creating a new note: ${argv.note}`);
    }
  )
  .demandCommand(1) // requires user to type at least one command
  .parse(); // parse it
```

#### `yargs.command()`

`yargs.command(commandStr, description, builderCb, handlerCb)`  describes a command for the CLI, and has three arguments:

- **command name**: How to use the command, in a form of a string using special characters
    - You specify arguments either with `[]` or `<>`. `[]` are optional while `<>` are required
    - For `new [note]`, the entire command would be like `note new "bruh hire me"`.
- **command description**:****************************************** The command description string
- **builder callback**: A callback used to further describe the syntax of the command and give types to the cli arguments you want. In this callback you will use the `yargs.positional()` method to define command line arguments. 
- **handler callback** : A callback that is executed when the command executes. Basically defines what code you want to run for your custom command. It takes in an `argv` parameter into the callback, which are the parsed command line arguments. 

```javascript
yargs(hideBin(process.argv))
	.command(
		"commandName [arg]", 
		"some command",
		(yargs) => {
			// call yarg positional stuff here
		},
		(argv) => {
			// the code in this callback defines execution for the command
			// access command line arguments here
		}
	)
```

#### Other commands

- `option()` : creates a new command option like `--tags` for the CLI
- `demandCommand()` : the number you pass into this method is the number of arguments that are required for the command.
- `parse()` : executes the command and parses CLI arguments

## Command Line Tools

### Using commander

Commander is a feature-rich version of yarg that acts as a full CLI tool.

```typescript
const { Command } = require("commander");
```

Here is basic code in commander: 

```typescript
  program
	 // define CLI version and override show version option to -v
    .version("0.0.1", "-v, --version", "output the current version")
     // describe CLI
    .description("A CLI for creating canvas projects")
    // name CLI
    .name("commander-practice");

  program
     // define a new command with a name of create, so: commander-practice create
    .command("create")
    // describe command
    .description("create a new project")
    // 1: have a required argument, 2: describe it, 3: provide default value
    .argument("<username>", "name of the user", "username not provided")
    // create -n and --name option which takes an argument
    .option("-n <name>, --name <name>", "name of the project", "default-project-name")
    .option("-p5, --p5", "use p5.js")
    // an option that takes arbitrary amount of arguments
    .option("-f <FILES...>, --files <FILES...>", "use specified files files")
    .action(async (username, options) => {
      console.log(username);
      console.log(options.name);
    });

  program.parse(process.argv);
```

#### Options

Using the `program.option()` method, we can create a global option or a command-specific option. 

You can define whether an option will take arguments or not. If an option does not take arguments, it becomes a boolean type. 

The method call will look like this: 

```javascript
program.option(optionSyntax, description, defaultValue)
```
- `optionSyntax` : a string that defines both the short form and the long form usage for the option, in this exact comma-separated syntax: `-n, --name`. If an option takes an argument, you can specify it with angle brackets or regular brackets. 
- `description` : the option description
- `defaultValue` : the default value for the option if the option is not specified. 

After parsing the program and executing it with `program.parse(process.argv)`, you can get the options with `program.opts()`. Getting options will not work if you already have a command set up however, since you can only use commander one of two ways: 
1. A way to process `process.argv`
2. A full-fledged CLI tool that executes code on commands

```javascript
program
.option("-n <name>, --name <name>", "name of the project", "default-project-name")
.option("-p5, --p5", "use p5.js")
.option("-f <FILES...>, --files <FILES...>", "use specified files files")

program.parse(process.argv)
const opts = program.opts()
```
#### Commands

```javascript
  program
    .command("create")
    .description("create a new project")
    .argument("<username>", "name of the user", "username not provided")
    .option("-n <name>, --name <name>", "name of the project", "default-project-name")
    .action(async (username, options) => {
	    // get access to the username argument and all options
      console.log(username);
      console.log(options.name);
    });
```

You create a command with `program.command(commandName)` as the first method in a series of method chains, but then you have other necessary methods to define after that: 

- `command.description(description)` : the description for the command
- `command.argument(syntax, description, defaultValue)` : defines an argument for the command. You can have as many arguments as you want, and they will be passed to the action handler in the order you call them.
	- `syntax` : the argument syntax, using `<>` for required and `[]` for optional, like `<name>` to specify a required argument called "name".
	- `description` : the argument description
	- `defaultValue` : the default value if the argument is optional
- `action()` : a callback that executes the implementation of the command. All the command arguments and options are passed as arguments into this callback

### Inquirer

Inquirer is a package that lets you choose CLI options and type in input. This is honestly a better way of working with command line arguments than something like yargs or `process.argv`.

Import it like so:

```ts
import inquirer from "inquirer";
```

#### `inquirer.prompt()` method

The `inquirer.prompt(options)` method handles user input, user choice, and etc.

In the example below, it returns whatever the user typed. Here are the properties of the options you can pass in:

- `name` : the name of the input. The value of this is the key that the user input will be stored in.
  - For example, if you set `name: "dirName"` and the method returns a result object, you can get the user input from `result.dirName`.
- `type` : the type of input. Can be `input`, `confirm`, `list`, `rawlist`, `expand`, `checkbox`, `password`, `editor`
	- `input` - Free text input
	- `password` - Hidden text input
	- `number` - Number input
	- `editor` - Opens system editor
	-  `list` - Single selection from list
	- `rawlist` - Numbered list selection
	- `expand` - Expandable choices with shortcuts
	- `checkbox` - Multi-selection
	- `confirm` - Yes/No confirmation
- `message` : the prompt message to display to the user
- `default` : the default value to use if the user doesn't type anything

```ts
const result = await inquirer.prompt({
  name: "dirName",
  type: "input",
  message: "Enter the name of the directory:",
  default: () => {
    return "canvas-project";
  },
});

result.dirName; // result stored on whatever you specify the name as
```

You can also setup multiple input gathering at the same time:

```ts
const answers = await inquirer.prompt([
  {
    name: 'name',
    type: 'input',
    message: 'What is your name?'
  },
  {
    name: 'age',
    type: 'number',
    message: 'How old are you?'
  },
  {
    name: 'color',
    type: 'list',
    message: 'What is your favorite color?',
    choices: ['Red', 'Blue', 'Green', 'Yellow']
  }
]);
```

You can also set up a validation:

```ts
const result = await inquirer.prompt({
  name: 'email',
  type: 'input',
  message: 'Enter your email:',
  validate: (input) => {
    if (!input.includes('@')) {
      return 'Please enter a valid email address';
    }
    return true;
  }
})
```

Here is a complete type safe abstraction over using inquirer that you can copy and paste to any project:

```ts
import inquirer from 'inquirer';

// Quick pick from a list of options
export async function showQuickPick<T extends readonly string[]>(
  choices: T,
  message?: string,
  defaultChoice?: T[number]
) {
  const result = await inquirer.prompt({
    name: "selection",
    type: "list",
    message: message ?? "Choose an option:",
    choices,
    default: () => {
      return defaultChoice ?? choices[0];
    },
  });
  return result.selection as T[number];
}

// Multi-select checkbox
export async function showMultiSelect<T extends readonly string[]>(
  choices: T,
  message?: string,
  defaultChoices?: T[number][]
) {
  const result = await inquirer.prompt({
    name: "selections",
    type: "checkbox",
    message: message ?? "Select options (use space to select):",
    choices,
    default: defaultChoices ?? [],
  });
  return result.selections as T[number][];
}

// Text input with validation
export async function showTextInput(
  message?: string,
  defaultValue?: string,
  validator?: (input: string) => boolean | string
) {
  const result = await inquirer.prompt({
    name: "input",
    type: "input",
    message: message ?? "Enter text:",
    default: defaultValue,
    validate: validator ? (input: string) => {
      const validation = validator(input);
      return validation === true ? true : (validation || "Invalid input");
    } : undefined,
  });
  return result.input as string;
}

// Password input (hidden)
export async function showPasswordInput(
  message?: string,
  validator?: (input: string) => boolean | string
) {
  const result = await inquirer.prompt({
    name: "password",
    type: "password",
    message: message ?? "Enter password:",
    mask: "*",
    validate: validator ? (input: string) => {
      const validation = validator(input);
      return validation === true ? true : (validation || "Invalid password");
    } : undefined,
  });
  return result.password as string;
}

// Yes/No confirmation
export async function showConfirm(
  message?: string,
  defaultValue: boolean = false
) {
  const result = await inquirer.prompt({
    name: "confirmed",
    type: "confirm",
    message: message ?? "Continue?",
    default: defaultValue,
  });
  return result.confirmed as boolean;
}

// Number input with validation
export async function showNumberInput(
  message?: string,
  defaultValue?: number,
  validator?: (input: number) => boolean | string
) {
  const result = await inquirer.prompt({
    name: "number",
    type: "number",
    message: message ?? "Enter a number:",
    default: defaultValue,
    validate: validator ? (input: number) => {
      if (isNaN(input)) return "Please enter a valid number";
      const validation = validator(input);
      return validation === true ? true : (validation || "Invalid number");
    } : (input: number) => isNaN(input) ? "Please enter a valid number" : true,
  });
  return result.number as number;
}

// Editor input (opens system editor)
export async function showEditor(
  message?: string,
  defaultValue?: string
) {
  const result = await inquirer.prompt({
    name: "content",
    type: "editor",
    message: message ?? "Enter content (will open editor):",
    default: defaultValue,
  });
  return result.content as string;
}

// Raw list (numbered options)
export async function showNumberedList<T extends readonly string[]>(
  choices: T,
  message?: string,
  defaultChoice?: T[number]
) {
  const result = await inquirer.prompt({
    name: "selection",
    type: "rawlist",
    message: message ?? "Choose an option:",
    choices,
    default: () => {
      return defaultChoice ?? choices[0];
    },
  });
  return result.selection as T[number];
}

// Expandable choices (shortcuts)
export async function showExpandableChoices(
  choices: Array<{ key: string; name: string; value: string }>,
  message?: string,
  defaultKey?: string
) {
  const result = await inquirer.prompt({
    name: "selection",
    type: "expand",
    message: message ?? "Choose an option:",
    choices,
    default: defaultKey ?? choices[0]?.key,
  });
  return result.selection as string;
}

// Complex form builder
export async function showForm<T extends Record<string, any>>(
  fields: Array<{
    name: keyof T;
    type: 'input' | 'password' | 'confirm' | 'list' | 'checkbox' | 'number';
    message: string;
    choices?: readonly string[];
    default?: any;
    validate?: (input: any) => boolean | string;
  }>
) {
  const questions = fields.map(field => ({
    name: field.name as string,
    type: field.type,
    message: field.message,
    choices: field.choices,
    default: field.default,
    validate: field.validate ? (input: any) => {
      const validation = field.validate!(input);
      return validation === true ? true : (validation || "Invalid input");
    } : undefined,
  }));

  const result = await inquirer.prompt(questions);
  return result as T;
}

// Utility: Create a series of questions
export async function showSeries<T>(
  questions: Array<() => Promise<T>>
): Promise<T[]> {
  const results: T[] = [];
  for (const question of questions) {
    const result = await question();
    results.push(result);
  }
  return results;
}

// Utility: Conditional questions
export async function showConditional<T>(
  condition: () => Promise<boolean>,
  questionIfTrue: () => Promise<T>,
  questionIfFalse?: () => Promise<T>
): Promise<T | undefined> {
  const shouldAsk = await condition();
  if (shouldAsk) {
    return await questionIfTrue();
  } else if (questionIfFalse) {
    return await questionIfFalse();
  }
  return undefined;
}
```
### Nanospinner

The nanospinner library offers a cool looking spinner utility to show that an operation is loading. Here is how you use it:

```ts
import { createSpinner } from "nanospinner";

const spinner = createSpinner("Loading...");
// show loading spinner with instantiated message
spinner.start();

// show x mark with specified message
spinner.error({
  text: "Directory already exists",
});

// show check mark with specified message
spinner.success({
  text: "Directory created successfully",
});
```

- `createSpinner(message)` : creates a spinner with the specified message. Returns a `spinner` object
- `spinner.start()` : starts the spinner, showing loading state
- `spinner.error({ text : string})` : shows an x mark with the specified message. stops loading state
- `spinner.success({ text : string })` : shows a check mark with the specified message and stops loading state

### Figlet

The `figlet` module makes big words in the command line using ascii art and looks cool. Try the things below:

```javascript
console.log(figlet.textSync("Hello World!"));
```

```typescript
import figlet from "figlet";
import gradient from "gradient-string";
const program = new Command();

// makes big figlet rainbow text
function gradientText(text: string) {
  return new Promise((resolve, reject) => {
    figlet(text, (err, data) => {
      console.log(gradient.pastel.multiline(data));
      resolve(data);
    });
  });
}
```

## Typescript and creating a CLI

### folder structure
Here is how your folder structure should look like: 
- `dist` : where your compiled code will live. You don't have to make this beforehand.
- `src` : a folder that includes all your typescript code. 
- `package.json`
- `tsconfig.json`

### tsconfig

This is what the tsconfig should look like: 

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",  // compile typescript files into dist directory
    "strict": true,
    "target": "ES6",
    "module": "ESNext", // use esnext features
    "sourceMap": true,
    "esModuleInterop": true,
    "moduleResolution": "Node" // only the way this all works
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "src/test.ts"]
}
```

When creating a CLI, we don't actually output any types, since the users won't actually need them.

### Package json

Here is how the package JSON should look like: 

```json
{
  "name": "@2022amallick/canvas-boilerplate",
  "version": "1.0.9",
  "description": "A typescript boilerplate for canvas projects in game development",
  "scripts": {
    "build": "tsc",
    "start": "tsc && npm link --force && canvasplate"
  },
  "keywords": [
    "HTML canvas",
    "typescript",
    "canvas boilerplate",
    "canvas game development"
  ],
  "author": "jawdiallick",
  "license": "ISC",
  "devDependencies": {
    "@types/figlet": "^1.5.7",
    "@types/gradient-string": "^1.1.4",
    "@types/inquirer": "^9.0.6",
    "@types/node": "^20.9.0",
    "typescript": "^5.2.2"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "chalk-animation": "^2.0.3",
    "commander": "^11.1.0",
    "figlet": "^1.7.0",
    "glob": "^10.3.10",
    "gradient-string": "^2.0.2",
    "inquirer": "^9.2.11",
    "nanospinner": "^1.1.0"
  },
  "bin": {
    "canvasplate": "./dist/index.js" // 
  },
  "type": "module",
  "repository": {
    "type": "git",
    "url": "https://github.com/adfasfmallick/canvas-boilerplate-typescript.git"
  },
}
```

There are really only two important properties: 
- `"type": "module"`: lets you use ES6 module syntax
- `"bin"` : basically treats whatever javascript file you specify as a bash script. To run the command, you just do `npx <package-name>`.

### Dealing with paths

When using es6 modules in node, the `__dirname` constant is undefined. Instead we have to use the `import.meta` object.

We use the below code to convert URL syntax into classic node filepath syntax.

```javascript
import { fileURLToPath } from "url";
import path from "path";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
```

## TypeScript and creating a Node package

### Setup

1. `npm init -y`
2. `npm install @types/node typescript tsx vitest --save-dev`
3. Create a git repo and push your code. You'll need this for the package JSON

You can now use `npx tsx <ts-file>` to run typescript files directly without compiling.

### Tsconfig

This is the tsconfig, with some important properties.

```json
{
  "compilerOptions": {
    "target": "ES2020",  // necessary
    "module": "ESNext",  // necessary for import.meta.env to work
    "declaration": true, // outputs .d.ts files
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "Node",  // necessary for no errors
    "skipLibCheck": true
  },
  "include": ["src/index.ts"],  // compile entrypoint
  "exclude": ["node_modules", "dist"]
}
```

All the typescript files we use that go into the `index.ts` entrypoint will be compiled into the `dist` folder, which we then connect to our package.json in the next step.

### Package json

```json
{
  "name": "lw-ffmpeg-node",
  "version": "1.0.0",
  
  // most important properties
  "main": "dist/index.js",
  "files": [
    "dist"
  ],
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "test": "vitest --watch --reporter=verbose",
    "build": "rm -rf dist && tsc", // clear and compile
  },
  "type": "module",
  // less important
  keywords: [],
  "author": "afsadfsamallick",
  "devDependencies": {
    "@types/node": "^20.14.2",
    "tsup": "^8.1.0",
    "tsx": "^4.14.0",
    "typescript": "^5.4.5",
    "vitest": "^1.6.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/masdfsdick/lw-ffmpeg-node.git"
  }
}
```

Here are the important keys you must specify: 
- `"main"`: the compiled entrypoint of your application, which is `dist/index.js` here. Used by commonJS programs, so advised to create cjs or mjs files and set that for this key.
- `"files"`: the entire compiled source code, which is the `dist` folder
- `"module"`: Used for ES6-compatible programs, so it's just the compiled entrypoint of your application, which is `dist/index.js` here.
- `"types"`: Specifies the declaration typings to use, which should be a `.d.ts` file.

### CLI class

```ts
import { spawnSync, spawn } from "child_process";
import * as path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import os from "os";

class LinuxError extends Error {
  constructor(command: string, extraData?: string) {
    super(`Running the '${command}' command caused this error`);
    console.error(extraData);
  }
}

export default class CLI {
  static isLinux() {
    const platform = os.platform();
    return platform === "linux";
  }

  static isWindows() {
    const platform = os.platform();
    return platform === "win32";
  }

  static getFilePath(filePath: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, path.normalize(filePath));
  }

  static linux_sync(command: string, args: string[] = []) {
    try {
      const { status, stdout, stderr } = spawnSync(command, args, {
        encoding: "utf8",
      });
      if (stderr) {
        throw new LinuxError(command, stderr);
      }
      return stdout;
    } catch (e) {
      console.error(e);
      throw new LinuxError(command);
    }
  }

  static async linuxWithData(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { shell: true });

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`exited with code ${code}: ${errorOutput}`));
        } else {
          resolve(output.trim());
        }
      });
    });
  }

  static async linux(
    command: string,
    { quiet = false, detached = false } = {}
  ) {
    try {

      return new Promise((resolve, reject) => {
        const child = spawn(command, {
          shell: true,
          stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit",
          detached,
        });

        child.on("close", (code) => {
          if (code !== 0) {
            reject(new LinuxError(command, stderr));
          } else {
            resolve(stdout);
          }
        });
      });
    } catch (e) {
      throw new LinuxError(command);
    }
  }
}
```

This is how you deal with filepaths in es6 modules:

```ts
function getFilePath(filePath: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, path.normalize(filePath));
}
```

### Adding the workflow

To automatically test our code before publishing it as a package, we can use github actions. You can pretty much copy and paste this, but you need to set your NPM access token as a secret on your repository.

Create the `NPM_AUTH_TOKEN` secret.


```yaml
name: "publish package to npm"

on: push

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
	    # 1) checkout and installation
      - name: checkout
        uses: actions/checkout@v4
      - name: node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - name: "Setup FFmpeg"
        uses: FedericoCarboni/setup-ffmpeg@v3
        # 2) build and compile code
      - name: build
        run: npm install && npm run build
        # 3) test code
      - name: test
        run: npx vitest run
        # 4) publish code
      - name: publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
        run: npm publish --access public
```

### Testing your package

1. Run `npm link` in your package directory
2. Go to another test directory, and run `npm link <package-name>`
3. Now type out the import statement and it should have type intellisense.

## Bun and typescript and NPM

Have a folder structure where all typescript is inside a `src` folder, and application entrypoint is in `src/index.ts`.

1.  Create a build script that appropiately compiles the `src/index.ts` file into a `dist` folder. Make sure you target bun, else it will not work.

    ```bash
    bun build --target=bun --outdir dist src/index.ts
    ```

2.  Install a `.d.ts` generator library with `bun add --save-dev dts-bundle-generator` with `bun add -D dts-bundle-generator`. Go here for more info: [dts bundle generator github](https://github.com/timocov/dts-bundle-generator)

    ```bash
    dts-bundle-generator --out-file dist/index.d.ts src/index.ts
    ```

3.  Create the build script in the package json

    ```json
    {
      "scripts": {
        "build": "bun build --minify --target=bun --outdir dist src/index.ts && bun run compile-declaration",
        "compile-declaration": "dts-bundle-generator --out-file dist/index.d.ts src/index.ts"
      }
    }
    ```

4.  Set tsconfig:

    ```json
    {
      "compilerOptions": {
        "lib": ["ESNext"],
        "target": "ESNext", // necessary
        "module": "ESNext", // necessary for import.meta.env to work
        "declaration": true, // outputs .d.ts files
        "outDir": "./dist",
        "strict": true,
        "esModuleInterop": true,
        "moduleResolution": "Node", // necessary for no errors
        "skipLibCheck": true
      },
      "include": ["src/index.ts"], // compile entrypoint
      "exclude": ["node_modules", "dist"]
    }
    ```

5.  Set package json, point to entry points and type declarations

    ```json
    {
      "name": "lw-ffmpeg-bun",
      "main": "dist/index.js",
      "module": "dist/index.js",
      "files": ["dist"],
      "type": "module",
      "types": "dist/index.d.ts",
      "devDependencies": {
        "@types/bun": "latest",
        "dts-bundle-generator": "^9.5.1"
      },
      "peerDependencies": {
        "typescript": "^5.0.0"
      },
      "scripts": {
        "build": "bun build --minify --target=bun --outdir dist src/index.ts && bun run compile-declaration && cp src/info.bun.sh dist",
        "compile-declaration": "dts-bundle-generator --out-file dist/index.d.ts --project ./tsconfig.json --no-check src/index.ts"
      },
      "version": "1.0.0",
      "author": "safailmallick",
      "keywords": ["ffmpeg", "bun"],
      "license": "MIT",
      "description": "A bun wrapper for ffmpeg",
      "repository": {
        "type": "git",
        "url": "git+https://github.com/maasdfllick/lw-ffmpeg-bun.git"
      }
    }
    ```