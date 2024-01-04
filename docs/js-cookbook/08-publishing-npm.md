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

## Using commander

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

### Options

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
### Commands

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
## Typescript and creating a CLI

## Github Workflow