
https://stevekinney.com/courses/visual-studio-code
## Keyboard shortcuts

- `ctrl + shift + up arrow` : collpase up emmet
- `ctrl + shift + down arrow`: collapse down emment
- `ctrl + d, ctrl + k`: when highlighting instances of text, use **ctrl + k** to skip instances
- `ctrl + p + p`: **ctrl peepee** goes back to the most recent file
- `ctrl + k`: bring up list of keybindings
- `ctrl + b`: toggle sidebar open and closed
- `ctrl + w`: closes the currently opened file
- `alt + up arrow`: moves code line up
- `alt + up down`: moves code line down
- `ctrl + space`: brings up intellisense suggestions
- `ctrl + shift + space`: brings up parameter info when pressing this keyboard shortcut inside the parenthesis of a function call.
- `ctrl + l`: highlights lines of text
- `ctrl + y` or `ctrl + shift + z`: undo
- `ctrl + [`: tabs to the right
- `ctrl + ]`: tabs to the left
- `ctrl + shift + k`: deletes current line

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

You can create workspace or global snippets by opening up the command pallete and selecting **create snippet**.

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