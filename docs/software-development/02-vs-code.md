
https://stevekinney.com/courses/visual-studio-code
## Keyboard shortcuts

- `ctrl + shift + right arrow` : selects up (idk how to explain this)
- `ctrl + shift + left arrow`:  selects down (idk how to explain this)
- `ctrl + d, ctrl + k`: when highlighting instances of text, use **ctrl + k** to skip instances
- `ctrl + p + p`: **ctrl peepee** goes back to the most recent file
- `ctrl + k`: bring up list of keybindings
- `ctrl + b`: toggle sidebar open and closed
- `ctrl + w`: closes the currently opened file
- `alt + up arrow`: moves code line up
- `alt + up down`: moves code line down
- `alt + click`: creates an extra cursor where you click to get multiple cursors
- `ctrl + u`: undoes a misplaced cursor when dealing with creating multiple cursors
- `ctrl + space`: brings up intellisense suggestions
- `ctrl + shift + space`: brings up parameter info when pressing this keyboard shortcut inside the parenthesis of a function call.
- `ctrl + l`: highlights lines of text
- `ctrl + y` or `ctrl + shift + z`: undo
- `ctrl + [`: tabs to the right
- `ctrl + ]`: tabs to the left
- `ctrl + shift + k`: deletes current line
- `ctrl + enter`: moves cursor down a line, creating an empty line
- `ctrl + shift + enter`: moves cursor up a line, creating an empty line
- `ctrl + /`: comments out a line or lines of selected code
- `shift + alt + /` or `shift + option + /`: comments out only the selected text. Useful for fine grained commenting-out
- `ctrl + tab`: switch between tabs in VScode
- `ctrl + <panel/tab index>`: switches between panels in VScode. There are 9 panels. If there are no panels open, it just switches between tabs.
- `ctrl + shift + tilde` :brings up a terminal in vscode. In mac, you use ctrl, not command.
- `ctrl + tilde`: switches focus to terminal
- `ctrl + shift + f`: global search across workspace
- `fn + f2`: refactor across codebase (much better than ctrl + d  )
- `ctrl + shift + o`: searches for symbols in the current file (same as opening up command palette and typing `@` prefix to initiate symbol search mode)

## Essentials

### Command Palette

Press `ctrl + p` to bring up a file searcher, which is useful for searching for files through a large codebase. There are some special symbols you can type to execute different searching behaviors:

- `@` : You can also type `@` in the file search input to see all the code symbols in the current file.
- `#`: Shows all code symbols in the current file
- `:<number>`: Goes to the specified line in your current file, like `:20` to jump to line 20.

### Find and replace

With find and replace you can search by regex and when performing global find and replace across your entire codebase, you can also exclude certain files based on a glob pattern.

The below example shows how to use regex search with capturing groups:

1. Create a capturing group with parentheses `()`
2. Refer to the capturing group with `$1`, etc.

![regex capturing groups with find and replace](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1747443837/image-clipboard-assets/o4apazuglg0ih7r5nkpf.webp)

### Emmet

**Emmet** is a way to use shortcuts in jsx or HTML that allows you to type HTML markup faster

Here are the three basic operators:

- `>`: direct parent operator: the left hand element will nest the right hand element.
- `*`: multiplication operator - duplicates the element on the left hand side.
- `+`: adjacency operator - adds the element on the right hand side adjacently

Here are some examples:

- `div>ul>li`: Creates a `<div>` with a nested `<ul>` and that also has a nested `<li>`
- `div*3`: Creates three `<div>` tag
- `header+section`: Creates a header then a section

You can nest content as well inside using curly braces `{}`. There are several things you can do in terms of nesting content tricks

- `div{hello}`: creates a `<div>` tag with "hello" as its text content
- `div{Item $}*3`: creates 3 `<div>` tags with incrementing numbers based on `$` as a placeholder, which would produce this content:

```html
<div>Item 1</div>
<div>Item 2</div>
<div>Item 3</div>
```

## Snippets

Snippets are a way to type a prefix in a file and to write out some boilerplate in the code file. This is very useful if you find yourself copying and typing the same boilerplate over and over again.

You can create workspace or global snippets by opening up the command pallete and selecting **create snippet**. Then either a global snippet will be created that works across all workspaces, or you can create workspace-specific snippets inside the `.vscode` folder.

```json
{
  "Snippet Name": {
    "prefix": "trigger",
    "body": ["// Code line 1", "// Code line 2", "// ..."],
    "description": "Snippet description"
  }
}
```

- **`prefix` (String, Required):** This is the trigger word or characters you type in the editor to activate the snippet suggestion. When you type the `prefix`, Visual Studio Code will suggest your snippet in the IntelliSense dropdown. Choose a short, memorable, and unique prefix to avoid conflicts with existing commands or keywords.
- **`body` (Array of Strings, Required):** This is the core of the snippet – the actual code block that will be inserted. Each element in the array represents a line of code. Visual Studio Code will join these strings and insert them into the document, respecting indentation and line breaks. You can use placeholders, variables, and choices within the `body` to make your snippets dynamic.
- **`description` (String, Optional):** A brief explanation of what the snippet does. This description is displayed in the IntelliSense suggestion list, helping you understand the snippet’s purpose when choosing from multiple suggestions. Providing clear descriptions is crucial for managing a large collection of snippets.
- **`scope` (String, Optional):** Defines the languages or file types where the snippet should be available. If omitted, the snippet is considered global and will be available in all languages. You can specify a single language identifier (e.g., `"javascript"`, `"python"`) or a comma-separated list of language identifiers (e.g., `"javascript,typescript"`). You can find a list of language identifiers [here](https://www.google.com/url?sa=E&source=gmail&q=https://code.visualstudio.com/docs/languages/identifiers&authuser=1).

### Dynamic jumping cursors

Using the placeholders `$1` and `$2`, etc., are placeholders to jump to when the user tabs to them and are empty, meant to be populated by the user.

You can move around these placeholders with `Tab` or `Shift+Tab`

- `$0` will always be the last tabbable spot.
- You can reuse the same placeholders as many times as you want, which will cause multiple cursors effect.

You can take this a step further by providing default strings for the tabbable placeholders by using colon syntax. You use placeholder names like `${1:variableName}` to provide a default value or hint for the placeholder.

```json
"for/of Loop": {
    "prefix": "forloop",
    "body": [
        "for (let i = 0; i < ${1:array}.length; i++) {",
        "\tconst ${2:element} = ${1:array}[i];",
        "\t${0:// body}",
        "}"
    ],
    "description": "Basic for loop in JavaScript"
}
```

In the above example, the string "array" was the default value for the first and second tabbable placeholder.

You can also provide a dropdown list of options to choose from, which vscode will display in a quick pick menu.

```json
"Print to console": {
	"prefix": "log",
	"body": [
		"console.${1|log,warn,error,info,table}($2)"
	],
	"scope": "javascript,typescript"
}
```

### Built in snippets variables

There are a list of built in global snippet variables you can access that VSCode allows you to use, all that need the `${}` syntax to be interpolated:

- **File and Path Variables:**
    - `${TM_FILENAME}`: The current filename (e.g., `my_script.js`).
    - `${TM_FILENAME_BASE}`: The current filename without the extension (e.g., `my_script`).
    - `${TM_DIRECTORY}`: The directory of the current file.
    - `${TM_FILEPATH}`: The full file path of the current file.
    - `${WORKSPACE_NAME}`: The name of the opened workspace or folder.
    - `${WORKSPACE_FOLDER}`: The path of the opened workspace or folder.
- **Date and Time Variables:**
    - `${CURRENT_YEAR}`: The current year (e.g., `2025`).
    - `${CURRENT_YEAR_SHORT}`: The current year in two digits (e.g., `25`).
    - `${CURRENT_MONTH}`: The month as two digits (e.g., `03`).
    - `${CURRENT_MONTH_NAME}`: The full name of the month (e.g., `March`).
    - `${CURRENT_MONTH_NAME_SHORT}`: The short name of the month (e.g., `Mar`).
    - `${CURRENT_DATE}`: The day of the month as two digits (e.g., `07`).
    - `${CURRENT_DAY_NAME}`: The name of the day (e.g., `Friday`).
    - `${CURRENT_DAY_NAME_SHORT}`: The short name of the day (e.g., `Fri`).
    - `${CURRENT_HOUR}`: The current hour in 24-hour format (e.g., `17`).
    - `${CURRENT_MINUTE}`: The current minute (e.g., `08`).
    - `${CURRENT_SECOND}`: The current second (e.g., `14`).
    - `${CURRENT_TIMEZONE_OFFSET}`: The timezone offset from UTC (e.g., `-0700` for MST).
    - `${CURRENT_TIMESTAMP}`: The current Unix timestamp.
- **User and Environment Variables:**
    - `${CLIPBOARD}`: The content of your clipboard.
    - `${RANDOM}`: 6 random Base-16 characters.
    - `${RANDOM_HEX}`: A random Base-16 number.
    - `${UUID}`: A version 4 UUID.
    - `${USER_NAME}`: Your operating system username.

This is an example that puts the currently selected code in a try-catch block:

```json
  "Try Catch Block": {
    "scope": "javascript,typescript",
    "prefix": "tc",
    "body": [
      "try {",
      "  $TM_SELECTED_TEXT",
      "} catch (error) {",
      "$1",
      "  console.error('Error occurred:', error);",
      "} finally {",
      "  console.timeEnd('$2');",
      "}"
    ],
    "description": "Put copied text in a try catch block."
  }
```

## Workspace specific configuration with `.vscode`

Let's talk about all the different files you can have in `.vscode`, which is the folder that contains all JSON configuration files for your workspace settings.

Here are the different files you can have in your `.vscode`:

| File                    | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `settings.json`         | Overrides user settings specifically for this workspace.                      |
| `launch.json`           | Configures debugging setups (e.g., how to launch a program, attach debugger). |
| `tasks.json`            | Defines custom tasks (e.g., build scripts, linters, test runners).            |
| `extensions.json`       | Recommends extensions for the current workspace.                              |
| `c_cpp_properties.json` | (C/C++ only) Defines IntelliSense settings for the C/C++ extension.           |
| **devcontainers**       | builds a devcontainer for the workspace from a `devcontainer.json`            |
| **snippets**            | has workspace-level snippets                                                  |

### `extensions.json`

The `extensions.json` is going to look like this, and it shows up recommended extension to install for this workspace, which is super useful for collaboration.

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### `tasks.json`

**Tasks** in VsCode are essentially like npm scripts except they can be run from the command palette. You just list them in a `tasks.json` file first:

```json title=".vscode/tasks.json"
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "tsc: build the project", // what shows up in command palette
      "type": "shell",       // type of script to run (shell for linux)
      "command": "tsc",      // the command to run
      "problemMatcher": "$tsc", // use tsc tool to parse error output,
      "group": {              // create group for additional organization
        "kind": "build",
        "isDefault": true,
      },
    }
  ]
}
```

> [!NOTE]
> VSCode will automatically detect npm scripts from `package.json` and add them as recognizable tasks it can run.

Here is another example of creating tasks:

```json title=".vscode/tasks.json"
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Lint",
      "type": "npm",
      "script": "lint",
      "group": "build", // Allows Run Build Task to trigger lint
      "problemMatcher": ["$eslint-stylish"] // Highlights ESLint errors in Problems pane
    },
    {
      "label": "Test",
      "type": "shell",
      "command": "npm run test", // Or a direct test runner command
      "group": "test", // Allows Run Test Task to trigger tests
      "problemMatcher": [] // (Attach a matcher if test output can be parsed for errors)
    },
    {
      "label": "Build (Frontend)",
      "type": "shell",
      "command": "npm run build", // Runs Vite or tsc build for frontend
      "problemMatcher": ["$tsc"] // Use TypeScript matcher to catch type errors
    },
    {
      "label": "Dev Server (Frontend)",
      "type": "npm",
      "script": "dev", // Launches Vite dev server
      "isBackground": true, // Mark as long-running background task
      "problemMatcher": "$tsc-watch" // Treat TS compile errors during dev
    }
  ]
}
```

#### Using variables

When running a task, you can also display a VSCode quick picker to get user input from a list of choices and store that as a variabel you can use in your app:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Deploy",
      "type": "shell",
      "command": "npm run deploy -- --env ${input:whichEnv}",
    },
  ],
  "inputs": [
    {
      "id": "whichEnv",
      "type": "pickString",
      "description": "Select environment to deploy to",
      "options": ["development", "staging", "production"],
      "default": "development",
    },
  ],
}
```
