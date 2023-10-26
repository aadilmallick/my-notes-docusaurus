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