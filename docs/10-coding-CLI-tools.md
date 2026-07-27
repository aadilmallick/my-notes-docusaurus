
### Github Copilot

You can also use copilot on the web here:

[GitHub Copilot](https://github.com/copilot)

#### Main use cases

- **fix with copilot**: You can highlight line(s), right click, and then use either **modify with copilot** or **review with copilot** to review the code, suggest any improvements, etc.
- **regex**: you can ask copilot to do regex for you
- **generate commit messages for you**: using the github GUI in vscode, you can commit AI-generated messages



#### Attaching context

You can attach context in the inline chat or in the chat sidebar by either manually adding files and images, or you can use these symbol prefixes to reference stuff in your codebase:

- `#`: used to reference individual files, folders, symbols in your code (objects and types), content from the terminal, or an entire codebase
- `@`: used to reference different VSCode contexts, like `@codebase` for your code, `@terminal` for the terminal, or `@workspace` for the current VSCode workspace. *These are only available in the sidebar chat*.

You can attach context in the **inline chat** by clicking `CTRL + I` twice to get a list of slash commands and available contexts.

#### Running terminal commands

With the chat sidebar, you can first type `@terminal` to give github copilot access to your terminal context, and then it will write a command to run based on the prompt.

You can also do `CTRL + I` in the terminal to popup an inline chat in the terminal to run commands there.

#### Slash commands

Copilot has a variety of slash commands that make doing monotonous tasks like documentation, fixing code, and creating unit tests much much easier. You can view a list of slash commands by clicking `CTRL + I` twice or by typing them manually in the chat sidebar.

Here are the most useful ones:

- `/explain`: explains the selected code
- `/fix`: fixes the selected code
- `/doc`: creates documentation for the selected code, like JSdoc
- `/tests`: creates unit tests for the selected code

#### Github copilot CLI

The gh copilot CLI can be installed like so:

```bash
gh extension install github/gh-copilot
```

You can then use it to generate terminal commands:

```bash
gh copilot suggest "create a basic nextjs app"
```

#### Copilot Extensions

Copilot Extensions are 3rd party extensions that add additional context options with the `@`symbol to github copilot in your VSCode.

Go [here](https://github.com/marketplace?type=apps&copilot_app=true) for a list of all extensions

Here are the useful ones:

**Agentic search**

Go to the [agentic search extension](https://github.com/settings/installations/68474817)in order to use agentic search capabilities, using cookies, etc.

**prisma**
****
Provides additional context for asking questions abotu prisma

[go here](https://github.com/apps/prisma-for-github-copilot)

**neon db**
****
Provides an additional context for asking questions about neon db.

[go here](https://github.com/settings/installations/68475406)

#### Copilot instruction files

You can add copilot instruction files in the chat options, which apply to certain files or to all files. Think of these as a style guide and a way to let copilot know what your porject is about.

#### Enabling mcp

1. Create a `.vscode/mcp.json`
2. Specify mcp servers like so:


![](https://i.imgur.com/N0ogxoG.jpeg)


### Cursor

#### Inline chat

The inline chat in cursor has several options for what you can do with it by first typing `CTRL + K` to bring up the inline chat, and then typing `@` for context options. 

You can also instead of asking it to generate or edit code, ask a quick question about it in the inline chat:

![](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748293987/image-clipboard-assets/ut9zdv3eklbjpj8qegh0.webp)

#### Adding context

You can add context with the `@` symbol as a prefix.

- `@docs`: adds documentation
- `@web`: tells cursor to do a web search
- `@<filename>`: adds the specific file as context

##### Adding docs

You can add certain websites' documentation to cursor, and cursor will index it and be able to reference it via the `@docs` context command. There are two ways to add documentation to certain websites you want:

- Add when prompted to add a new documentation when typing the `@docs` command
- Add in the cursor features settings.


#### Cursor rules

Cursor rules are a new way to enforce coding style and give cursor additional context when you're chatting with it. There are 4 ways to create rules:

- Rules live in the `.cursor/rules` folder in your workspace, and are single text `.mdc` file. 
- You can also create a rule in the command palette in cursor
- You can ask cursor chat to create a rule for your project with the `/Generate cursor rules` slash command.
- Go to cursor settings -> project settings -> and create rules.

Here are the 4 types of rules you can have:

![](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748725456/image-clipboard-assets/to77vpbifewtffir4wte.webp)
Here is an example of a cursor mdc rule, where yu can add in additional file context as well with @ symbols.

```
---
description: RPC Service boilerplate
globs: 
alwaysApply: false
---

- Use our internal RPC pattern when defining services
- Always use snake_case for service names.

@service-template.ts
```

You can get a list of reusable rules for each language that makes working on your codebase even better:

```embed
title: "Cursor Directory"
image: "https://pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev/opengraph-image-v2.png"
description: "Find the best cursor rules for your framework and language"
url: "https://cursor.directory/"
favicon: ""
aspectRatio: "52.5"
```




### COpilot CLI

The `copilot` command lets you pull up github copilot and use it like claude code. Everything there still applies.

Here are also some one-off prompts you can do:

```bash
copilot "create a bash script to check for uncommitted changes and push if clean"
```

#### CLI options

- `-p <prompt>`: lets you do a one-off promp
- `--allow-all-tools`: gives copilot access to all tools. Maybe you want to run this in a dev container.

Here's a useful alias that lets you run a one-off prompt with all tools allowed

```bash
cpcli='copilot --allow-all-tools -p "$@"'
```

Then you can use like so:

```sh
cpcli "Explain each of these scripts and offer improvements" 
```

#### Use cases and example prompts:

1. Review the project README to make it easier for newcomers to understand
2. What is taking up the most space on my own laptop?
### Gemini CLI

#### CLI options

You can get just the text content of prompting an AI using the `-p` option, which can be useful for some quick prompting or even just running an AI without the SDK:

```bash
gemini -p "What is fine tuning?"
```

**going YOLO mode**

TO go yolo mode and accept all tool calls automatically, the first thing you'll want to do is to go into a sandbox and make sure nothing gets broken. You'll use these two commands:

- `--sandbox`: runs in sandbox mode via a docker image
- `--sandbox-image`: optionally set the dockerhub iamge URL if you want the sandbox image to start from a different image.
- `--yolo`: sets yolo mode

However, yolo mode by default enters a sandbox, so you don't need that. 

Thus the command to enter YOLO mode would look like so:

```bash
gemini --yolo
```


**reference**

- **`--model <model_name>`** (**`-m <model_name>`**):
    - Specifies the Gemini model to use for this session.
    - Example: `npm start -- --model gemini-1.5-pro-latest`
- **`--prompt <your_prompt>`** (**`-p <your_prompt>`**):
    - Used to pass a prompt directly to the command. This invokes Gemini CLI in a non-interactive mode.
- **`--sandbox`** (**`-s`**):
    - Enables sandbox mode for this session.
- **`--sandbox-image`**:
    - Sets the sandbox image URI.
- **`--debug`** (**`-d`**):
    - Enables debug mode for this session, providing more verbose output.
- **`--all-files`** (**`-a`**):
    - If set, recursively includes all files within the current directory as context for the prompt.
- **`--help`** (or **`-h`**):
    - Displays help information about command-line arguments.
- **`--show-memory-usage`**:
    - Displays the current memory usage.
- **`--yolo`**:
    - Enables YOLO mode, which automatically approves all tool calls.
- **`--telemetry`**:
    - Enables [telemetry](https://github.com/google-gemini/gemini-cli/blob/main/docs/telemetry.md).
- **`--telemetry-target`**:
    - Sets the telemetry target. See [telemetry](https://github.com/google-gemini/gemini-cli/blob/main/docs/telemetry.md) for more information.
- **`--telemetry-otlp-endpoint`**:
    - Sets the OTLP endpoint for telemetry. See [telemetry](https://github.com/google-gemini/gemini-cli/blob/main/docs/telemetry.md) for more information.
- **`--telemetry-log-prompts`**:
    - Enables logging of prompts for telemetry. See [telemetry](https://github.com/google-gemini/gemini-cli/blob/main/docs/telemetry.md) for more information.
- **`--checkpointing`**:
    - Enables [checkpointing](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/commands.md#checkpointing-commands).
- **`--extensions <extension_name ...>`** (**`-e <extension_name ...>`**):
    - Specifies a list of extensions to use for the session. If not provided, all available extensions are used.
    - Use the special term `gemini -e none` to disable all extensions.
    - Example: `gemini -e my-extension -e my-other-extension`
- **`--list-extensions`** (**`-l`**):
    - Lists all available extensions and exits.
- **`--version`**:
    - Displays the version of the CLI.

#### Slash commands

- `/docs`: brings up the Docs.

- **`/chat`**
    
    - **Description:** Save and resume conversation history for branching conversation state interactively, or resuming a previous state from a later session.
    - **Sub-commands:**
        - **`save`**
            - **Description:** Saves the current conversation history. You must add a `<tag>` for identifying the conversation state.
            - **Usage:** `/chat save <tag>`
        - **`resume`**
            - **Description:** Resumes a conversation from a previous save.
            - **Usage:** `/chat resume <tag>`
        - **`list`**
            - **Description:** Lists available tags for chat state resumption.
- **`/clear`**
    
    - **Description:** Clear the terminal screen, including the visible session history and scrollback within the CLI. The underlying session data (for history recall) might be preserved depending on the exact implementation, but the visual display is cleared.
    - **Keyboard shortcut:** Press **Ctrl+L** at any time to perform a clear action.
- **`/compress`**
    
    - **Description:** Replace the entire chat context with a summary. This saves on tokens used for future tasks while retaining a high level summary of what has happened.
- **`/editor`**
    
    - **Description:** Open a dialog for selecting supported editors.

- **`/help`** (or **`/?`**)
    
    - **Description:** Display help information about the Gemini CLI, including available commands and their usage.
- **`/mcp`**
    
    - **Description:** List configured Model Context Protocol (MCP) servers, their connection status, server details, and available tools.
    - **Sub-commands:**
        - **`desc`** or **`descriptions`**:
            - **Description:** Show detailed descriptions for MCP servers and tools.
        - **`nodesc`** or **`nodescriptions`**:
            - **Description:** Hide tool descriptions, showing only the tool names.
        - **`schema`**:
            - **Description:** Show the full JSON schema for the tool's configured parameters.
    - **Keyboard Shortcut:** Press **Ctrl+T** at any time to toggle between showing and hiding tool descriptions.
- **`/memory`**
    
    - **Description:** Manage the AI's instructional context (hierarchical memory loaded from `GEMINI.md` files).
    - **Sub-commands:**
        - **`add`**:
            - **Description:** Adds the following text to the AI's memory. Usage: `/memory add <text to remember>`
        - **`show`**:
            - **Description:** Display the full, concatenated content of the current hierarchical memory that has been loaded from all `GEMINI.md` files. This lets you inspect the instructional context being provided to the Gemini model.
        - **`refresh`**:
            - **Description:** Reload the hierarchical instructional memory from all `GEMINI.md` files found in the configured locations (global, project/ancestors, and sub-directories). This command updates the model with the latest `GEMINI.md` content.
        - **Note:** For more details on how `GEMINI.md` files contribute to hierarchical memory, see the [CLI Configuration documentation](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md#4-geminimd-files-hierarchical-instructional-context).
- **`/restore`**
    
    - **Description:** Restores the project files to the state they were in just before a tool was executed. This is particularly useful for undoing file edits made by a tool. If run without a tool call ID, it will list available checkpoints to restore from.
    - **Usage:** `/restore [tool_call_id]`
    - **Note:** Only available if the CLI is invoked with the `--checkpointing` option or configured via [settings](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md). See [Checkpointing documentation](https://github.com/google-gemini/gemini-cli/blob/main/docs/checkpointing.md) for more details.
- **`/stats`**
    
    - **Description:** Display detailed statistics for the current Gemini CLI session, including token usage, cached token savings (when available), and session duration. Note: Cached token information is only displayed when cached tokens are being used, which occurs with API key authentication but not with OAuth authentication at this time.
- [**`/theme`**](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/themes.md)
    
    - **Description:** Open a dialog that lets you change the visual theme of Gemini CLI.
- **`/auth`**
    
    - **Description:** Open a dialog that lets you change the authentication method.
- **`/about`**
    
    - **Description:** Show version info. Please share this information when filing issues.
- [**`/tools`**](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/index.md)
    
    - **Description:** Display a list of tools that are currently available within Gemini CLI.
    - **Sub-commands:**
        - **`desc`** or **`descriptions`**:
            - **Description:** Show detailed descriptions of each tool, including each tool's name with its full description as provided to the model.
        - **`nodesc`** or **`nodescriptions`**:
            - **Description:** Hide tool descriptions, showing only the tool names.
- **`/privacy`**
    
    - **Description:** Display the Privacy Notice and allow users to select whether they consent to the collection of their data for service improvement purposes.
- **`/quit`** (or **`/exit`**)
    
    - **Description:** Exit Gemini CLI.



#### Memory

You should use a `GEMINI.md` file kind of the same way as a cursor rule - type it to be full of rules that the AI should listen to, like info about the project PRD and the tech stack. 

You can use the `/memory show` slash command to view gemini's current memory in the current workspace. Since gemini has access to the memory tool, you can also tell it to update its memory, remove stuff from its memory, and that will lead to it having better responses.

Whenever you feel like memory is getting stale and the AI has lost the plot of your gemini rules in the `GEMINI.md`, you can always refeed it again and refresh the memory through this slash command:

```bash
/memory refresh
```


#### Adding files to context

You can refer to specific files in context using the `@` prefix, which explicitly tells gemini to use file reading tools. By default, files and folders in your `.gitignore` are excluded from reading.

- **Git-aware filtering:** By default, git-ignored files (like `node_modules/`, `dist/`, `.env`, `.git/`) are excluded. This behavior can be changed via the `fileFiltering` settings.

#### Settings

Here is the complete documentation on how to configure your gemini CLI on the user level, system level, and project level. 

```embed
title: "gemini-cli/docs/cli/configuration.md at main · google-gemini/gemini-cli"
image: "https://repository-images.githubusercontent.com/968197216/8522a757-5632-4fa4-8d01-fcc121390cb1"
description: "An open-source AI agent that brings the power of Gemini directly into your terminal. - google-gemini/gemini-cli"
url: "https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md"
favicon: ""
aspectRatio: "52.5"
```

[![google-gemini/gemini-cli - GitHub](https://gh-card.dev/repos/google-gemini/gemini-cli.svg)](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md)

All project level config lives inside the `.gemini` folder, and there are special files you can put in their that configure the behavior of the Gemini CLI.



**settings.json**

The `settings.json` file configures the CLI settings for the project, like enabling/disabling tools, adding MCP servers, etc.

- **user level config**: to set global gemini CLI settings, go to this path: `~/.gemini/settings.json`
- **project level config**: to set project level gemini CLI settings, create a `.gemini/settings.json` file in the cwd.

```json title=".gemini/settings.json"
{
  // -- UI & THEME SETTINGS --
  // These settings control the look and feel of the Gemini CLI.

  "theme": "GitHub",
  // Sets the visual theme. "Default" is the standard theme.
  // Check the documentation for other available themes.

  "hideBanner": false,
  // Set to true if you want to hide the ASCII art logo on startup.

  "hideTips": false,
  // Set to true to disable the helpful tips that appear in the UI.


  // -- CONTEXT & MEMORY --
  // Configure how the CLI understands the context of your project.

  "contextFileName": "GEMINI.md",
  // Specifies the file name for loading instructional context. The CLI
  // searches for this file in the current directory, parent directories,
  // and sub-directories to build a hierarchical context for the model.
  // You can provide a single string or an array of strings (e.g., ["GEMINI.md", "CONTEXT.md"]).


  // -- TOOL & COMMAND SETTINGS --
  // Control how the model interacts with built-in and custom tools.

  "autoAccept": false,
  // If set to true, the CLI automatically executes tool calls that are
  // considered  (e.g., read-only operations) without asking for confirmation.
  // This can speed up your workflow, but use it with caution.

  "coreTools": [
    "read_file",
    "glob",
    "run_shell_command(ls)",
    "run_shell_command(cat)"
  ],
  // Whitelists specific built-in tools for the model to use, enhancing security.
  // If this setting is omitted, all core tools are available.
  // You can also restrict shell commands to specific patterns, as shown above.

  "excludeTools": [
    "run_shell_command(rm -rf)"
  ],
  // Blacklists specific tools or commands. This is less secure than `coreTools`.
  // A tool listed in both `coreTools` and `excludeTools` will be excluded.
  // Note: Command restrictions are based on simple string matching and can be bypassed.


  // -- SANDBOXING FOR SECURITY --
  // Isolate tool execution to protect your system.

  "sandbox": "docker",
  // Controls the sandboxing environment for executing tools.
  // - "false" (default): No sandboxing.
  // - "true" or "docker": Uses a pre-built Docker image for sandboxing.
  // This is highly recommended when allowing the model to execute shell commands.


  // -- FILE DISCOVERY --
  // Define how the CLI finds files for @-mentions and other file operations.

  "fileFiltering": {
    "respectGitIgnore": true,
    "enableRecursiveFileSearch": true
  },
  // "respectGitIgnore": When true, files and directories listed in your .gitignore
  // (like node_modules/, dist/, .env) are automatically excluded.
  // "enableRecursiveFileSearch": When true, allows recursively searching for
  // files in subdirectories when you use the @ prefix in a prompt.


  // -- CUSTOM TOOLS (ADVANCED) --
  // For integrating your own project-specific tools.

  "toolDiscoveryCommand": "bin/get_tools",
  // A custom shell command that returns a JSON array of function declarations
  // for your project's tools.

  "toolCallCommand": "bin/call_tool",
  // A custom shell command to execute a tool discovered via `toolDiscoveryCommand`.
  // It receives the tool name as an argument and its parameters as JSON on stdin.


  // -- TELEMETRY & USAGE STATISTICS --
  // Help improve the Gemini CLI by sharing anonymous data.

  "telemetry": {
    "enabled": false,
    "target": "local",
    "otlpEndpoint": "http://localhost:4317",
    "logPrompts": false
  },
  // Configures telemetry for debugging and monitoring.
  // "enabled": Set to true to turn on telemetry.
  // "target": Can be "local" or "gcp".
  // "logPrompts": Set to true to include prompt content in logs (use with care for privacy).

  "usageStatisticsEnabled": true,
  // Set to false to opt-out of sending anonymized usage statistics.
  // We don't collect any PII, prompt content, or file content. Disabling this
  // just means we have less data to guide improvements.


  // -- SESSION MANAGEMENT --

  "maxSessionTurns": -1
  // Sets the maximum number of conversation turns before a session is automatically reset.
  // A "turn" consists of one user prompt and one model response.
  // The default, -1, means the session is unlimited.
}

```

> [!TIP]
> **Note on environment variables in settings:** String values within your `settings.json` files can reference environment variables using either `$VAR_NAME` or `${VAR_NAME}` syntax. These variables will be automatically resolved when the settings are loaded. For example, if you have an environment variable `MY_API_TOKEN`, you could use it in `settings.json` like this: `"apiKey": "$MY_API_TOKEN"`.

- **`contextFileName`** (string or array of strings): a list of files to use as context or equivalent of cursor rules for the current gemini session.

By far the most important properties are the ones enabling and disabling tools, allowing you to get as granular as allowlisting certain commands or blacklisting them:

- **`coreTools`** (array of strings):
    - **Description:** Allows you to specify a list of core tool names that should be made available to the model. This can be used to restrict the set of built-in tools. See [Built-in Tools](https://github.com/google-gemini/gemini-cli/blob/main/docs/core/tools-api.md#built-in-tools) for a list of core tools. You can also specify command-specific restrictions for tools that support it, like the `ShellTool`. For example, `"coreTools": ["ShellTool(ls -l)"]` will only allow the `ls -l` command to be executed.
    - **Default:** All tools available for use by the Gemini model.
    - **Example:** `"coreTools": ["ReadFileTool", "GlobTool", "ShellTool(ls)"]`.
- **`excludeTools`** (array of strings):
    - **Description:** Allows you to specify a list of core tool names that should be excluded from the model. A tool listed in both `excludeTools` and `coreTools` is excluded. You can also specify command-specific restrictions for tools that support it, like the `ShellTool`. For example, `"excludeTools": ["ShellTool(rm -rf)"]` will block the `rm -rf` command.
    - **Default**: No tools excluded.
    - **Example:** `"excludeTools": ["run_shell_command", "findFiles"]`.
    - **Security Note:** Command-specific restrictions in `excludeTools` for `run_shell_command` are based on simple string matching and can be easily bypassed. This feature is **not a security mechanism** and should not be relied upon to safely execute untrusted code. It is recommended to use `coreTools` to explicitly select commands that can be executed.
- **`autoAccept`** (boolean):
    
    - **Description:** Controls whether the CLI automatically accepts and executes tool calls that are considered safe (e.g., read-only operations) without explicit user confirmation. If set to `true`, the CLI will bypass the confirmation prompt for tools deemed safe.
    - **Default:** `false`
    - **Example:** `"autoAccept": true`
**`sandbox`** (boolean or string):

- **Description:** Controls whether and how to use sandboxing for tool execution. If set to `true`, Gemini CLI uses a pre-built `gemini-cli-sandbox` Docker image. For more information, see [Sandboxing](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/configuration.md#sandboxing).
- **Default:** `false`
- **Example:** `"sandbox": "docker`

##### Enabling MCP servers

To enable MCP servers per project, you can add them through the `mcpServers` key like so:

```json
"mcpServers": {
  "myPythonServer": {
    "command": "python",
    "args": ["mcp_server.py", "--port", "8080"],
    "cwd": "./mcp_tools/python",
    "timeout": 5000
  },
  "myNodeServer": {
    "command": "node",
    "args": ["mcp_server.js"],
    "cwd": "./mcp_tools/node"
  },
  "myDockerServer": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "API_KEY", "ghcr.io/foo/bar"],
    "env": {
      "API_KEY": "$MY_API_TOKEN"
    }
  }
}
```

##### Blocking tool use

You can restrict the shell commands that can be executed by the run_shell_command tool by using the tools.core and tools.exclude settings in your config file:

- `tools.core`: Specifies an allowlist of commands.
- `tools.exclude`: Specifies a blocklist of commands. The blocklist takes precedence over the allowlist.

Here is an example config that allows git commands but blocks `git push` commands:

```json title=".gemini/settings.json"
{
// ...
 "tools": {
	  "core": [ "run_shell_command(git)" ],
	  "exclude": [ "run_shell_command(git push)" ]
 }
 // ...
}
```


#### Using tools

You can use tools automatically with gemini through just its automatic tool selection capability, but you can also manually invoke them, which may be useful, by just invoking these bash methods:

**web fetch**

```python
web_fetch(
	prompt="Can you summarize the main points of https://example.com/news/latest"
)
```
**google search**

```python
google_web_search(query="Your query goes here.")
```

#### Sandboxing

There are three different ways to sandbox a one-off gemini CLI run or a TUI session into an isolated docker container:

1. Run with the `--sandbox` option
2. Export the `GEMINI_SANDBOX=true` env var into the current shell session
3. Set the `tools.sandbox` key in the `settings.json` to `"docker"`.

```
# Enable sandboxing with a command-line flag
gemini --sandbox --prompt "run the test suite"

# Use environment variable
export GEMINI_SANDBOX=true
gemini --prompt-interactive "explain this code"

# Configure in settings.json
{
  "tools": {
    "sandbox": "docker"
  }
}
```

#### Agent skills

You can add custom agent skills to gemini, which gemini will recognize in a `.agents/skills` folder or the `.gemini/skills` folder.

To enable globally available skills and have them be automatically recognized, put them in the `~/.agents/skills` folder.

**CLI**

- `gemini skills list`: lists all active skills

Here's the complete way to use the cli:


```bash
# List all discovered skills
gemini skills list

# Link agent skills from a local directory via symlink
# Discovers skills (SKILL.md or */SKILL.md) and creates symlinks in ~/.gemini/skills
# (or ~/.agents/skills)
gemini skills link /path/to/my-skills-repo

# Link to the workspace scope (.gemini/skills or .agents/skills)
gemini skills link /path/to/my-skills-repo --scope workspace

# Install a skill from a Git repository, local directory, or zipped skill file (.skill)
# Uses the user scope by default (~/.gemini/skills or ~/.agents/skills)
gemini skills install https://github.com/user/repo.git
gemini skills install /path/to/local/skill
gemini skills install /path/to/local/my-expertise.skill

# Install a specific skill from a monorepo or subdirectory using --path
gemini skills install https://github.com/my-org/my-skills.git --path skills/frontend-design

# Install to the workspace scope (.gemini/skills or .agents/skills)
gemini skills install /path/to/skill --scope workspace

# Uninstall a skill by name
gemini skills uninstall my-expertise --scope workspace

# Enable a skill (globally)
gemini skills enable my-expertise

# Disable a skill. Can use --scope to specify workspace or user (defaults to workspace)
gemini skills disable my-expertise --scope workspace
```

#### Plan mode

You can have gemini follow a plan by just telling it to plan out a feature:


![](https://i.imgur.com/v6KlAki.jpeg)

You can also use the `/plan` command to manually trigger plan mode, and then send messages mid-conversation to steer the agent in the right direction.

```embed
title: "Use Plan Mode with model steering for complex tasks"
image: "https://geminicli.com/assets/social-poster.png"
description: ""
url: "https://geminicli.com/docs/cli/tutorials/plan-mode-steering/"
favicon: ""
aspectRatio: "56.38461538461539"
```

#### MCP

You can enable mcp servers in the gemini settings JSON:

1. Open `~/.gemini/settings.json` (or the project-specific `.gemini/settings.json`).
2. Add the `mcpServers` block. This tells Gemini: “Run this docker container and talk to it.”

```json title=".gemini/settings.json"
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server:latest"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

> [!TIP]
> TO avoid hardcoding secrets into the settings JSON, you can first export any secrets as an environment variable into the current session and then you can interpolate via `${}` syntax in the JSON file.

To verify connections, you can use the `/mcp` command:

- `/mcp list`: lists all currently active MCP servers
- `/mcp reload`: reloads the MCP server


