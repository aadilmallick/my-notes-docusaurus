



## Claude code basics

### CLAUDE.md

The `CLAUDE.md` file is based on three facts about LLM agents:

1. Coding agents know absolutely nothing about your codebase at the beginning of each session.
2. The agent must be told anything that's important to know about your codebase each time you start a session.
3. `CLAUDE.md` is the preferred way of doing this.

This file should clarify three questions:

- **WHAT**: tell Claude about the tech, your stack, the project structure. Give Claude a map of the codebase. This is especially important in monorepos! Tell Claude what the apps are, what the shared packages are, and what everything is for so that it knows where to look for things
- **WHY**: tell Claude the _purpose_ of the project and what everything is doing in the repository. What are the purpose and function of the different parts of the project?
- **HOW**: tell Claude how it should work on the project. For example, do you use `bun` instead of `node`? You want to include all the information it needs to actually do meaningful work on the project. How can Claude verify Claude's changes? How can it run tests, typechecks, and compilation steps?

To write a good `CLAUDE.md` file, we should follow these core principles:

1. `CLAUDE.md` is for onboarding Claude into your codebase. It should define your project's **WHY**, **WHAT**, and **HOW**.
2. **Less (instructions) is more**. While you shouldn't omit necessary instructions, you should include as few instructions as reasonably possible in the file.
3. Keep the contents of your `CLAUDE.md` **concise and universally applicable**.
4. Use **Progressive Disclosure** - don't tell Claude all the information you could possibly want it to know. Rather, tell it _how to find_ important information so that it can find and use it, but only when it needs to to avoid bloating your context window or instruction count. Also, don't embed files directly with `@`, as that bloats the context. Just reference the file.
5. Claude is not a linter. Use linters and code formatters, and use other features like [Hooks](https://code.claude.com/docs/en/hooks) and [Slash Commands](https://code.claude.com/docs/en/slash-commands) as necessary.
6. **`CLAUDE.md` is the highest leverage point of the harness**, so avoid auto-generating it. You should carefully craft its contents for best results.

ANother 4 principles:

1. **Start with Guardrails, Not a Manual.** Your `CLAUDE.md` should start small, documenting based on what Claude is getting wrong.
    
2. **Don’t** `@`**-File Docs.** If you have extensive documentation elsewhere, it’s tempting to `@`-mention those files in your `CLAUDE.md`. This bloats the context window by embedding the entire file on every run. But if you just _mention_ the path, Claude will often ignore it. You have to _pitch_ the agent on _why_ and _when_ to read the file. “For complex … usage or if you encounter a `FooBarError`, see `path/to/docs.md` for advanced troubleshooting steps.”
    
3. **Don’t Just Say “Never.”** Avoid negative-only constraints like “Never use the `--foo-bar` flag.” The agent will get stuck when it thinks it _must_ use that flag. Always provide an alternative.
    
4. **Use** `CLAUDE.md` **as a Forcing Function.** If your CLI commands are complex and verbose, don’t write paragraphs of documentation to explain them. That’s patching a human problem. Instead, write a simple bash wrapper with a clear, intuitive API and document _that_. Keeping your `CLAUDE.md` as short as possible is a fantastic forcing function for simplifying your codebase and internal tooling.

#### **principle 1 - Keep your claude md small**

**As instruction count increases, instruction-following quality decreases uniformly**. This means that as you give the LLM more instructions, it doesn't simply ignore the newer ("further down in the file") instructions - it begins to **ignore all of them uniformly**

This implies that your `CLAUDE.md` file should contain as few instructions as possible - ideally only ones which are universally applicable to your task.


> [!TIP]
> Aim for a `CLAUDE.md` less than 60 lines long


#### **principle 2 - use progressive disclosure**

The term Progressive disclosure is just a fancy way of saying to reference different markdown files inside your `CLAUDE.md` file and then give brief descriptions of those files so that Claude can decide whether or not to read those markdown files.

However, referencing files directly with the `@` prefix is NOT progressive disclosure, as that just completely embeds the file content into the context. 

Rather, in the `CLAUDE.md`, to implement progressive disclosure, just reference the filepath and describe what that file does, and claude will decide whether or not to look at that md file.

### CLI options

- `claude -p <prompt>`: runs a one-off prompt
- `claude --model=<model>`: runs claude with a specific model. Here are the different values you can pass for the `--model` parameter:
	- `sonnet`
	- `opus`
	- `haiku`
- `claude --continue`: continue off from the last session
- `claude --resume`: resume a specific session.

### Keyboard shortcuts

- **auto accept mode**: TO enter auto accept mode for edits, press `shift + tab` keyboard shortcut
- **plan mode**: TO enter plan mode, press `shift + tab` twice

### Slash options

When inside a conversation with claude code, you have access to these special slash commands:

- `/model <model>`: change the model mid convo to one of `haiku`, `sonnet`, or `opus`
- `/compact`: compacts previous conversation history into a summary. Useful when you've now moved on to a different task.
- `/clear`: clears the conversation history
- `/init`: reads the current codebase and based off that, creates a `CLAUDE.md` file
- `/context`: visualize the current context and how much of it is taken up.
- `/status`: shows current token and session info
- `/review`: performs a code review
- `/security-review`: performs a code review that searches for security flaws.
- `/install-github-app`: allows you to add claude as a collaborator to a github repoi so you can assign it issues and to pull requests

### Chat techniques

#### Managing context

Hit the `esc` key twice to stop a response while Claude is generating. Then you can start a user query by prefixing with a `#` to start a **memory** which claude code will remember during the conversation.

Also use these slash commands to manage memory:

- `/clear`: clears the conversation history
- `/compact`: compacts previous conversation history into a summary. Useful when you've now moved on to a different task.

#### Forcing thinking

To force thinking, you can use these keywords in your prompt:

- **"think"**: reasoning up to 4000 tokens
- **"think harder"**: reasoning up to 10000 tokens

#### **switch models smartly**

Use opus for planning, sonnet for execution.

#### **Use plan mode**

You can tell claude to "make the plan multi-phase" which makes the plan, well, multi-phase.





## Advanced claude tools

### Commands

Commands are special markdown files that must live within the `.claude/commands` folder, and can be used as custom slash commands. 

- For example, a `.claude/commands/goal.md` can be invoked via the `/goal` slash command, and it acts like a really big prompt to claude, giving it all the markdown content.

> [!NOTE]
> The main use case of commands is to prompt for repetitive tasks like linting, testing, or adding documentation. You can also do neat stuff like dynamically add arguments and interpolate bash commands in these markdown files.

### Skills / Plugins

You can install MCP servers and skills as "plugins" in claude code.

- List all skills claude has access to with `/skills` command.
- Manage plugins (install and delete) by using the `/plugins` command

To add custom skills to claude code, they should be `SKILL.md` files within the `.claude/skills` folder

![](https://i.imgur.com/tEYm0Ux.png)

### Hooks

Claude hooks are bash commands that run at different lifecycle moments such as session start, pre compact, and on stop. Key moments include startup, resume, clear, and various tool use stages like pre tool use and post tool use.

> [!NOTE]
> You can check all registered hooks with the `/hooks` command.

If you want to create a claude command that can easily create hooks for you, use this command:

```embed
title: "automated-notebooklm/.claude/commands/create-hook.md at main · omril321/automated-notebooklm"
image: "https://opengraph.githubassets.com/30cad5e5dd2202e9efcd80dbb8ad749500d60fdac65f49c94f599ffdb95a8c08/omril321/automated-notebooklm"
description: "Automation around NotebookLM, with a monday.com board integration - omril321/automated-notebooklm"
url: "https://github.com/omril321/automated-notebooklm/blob/main/.claude/commands/create-hook.md"
favicon: ""
aspectRatio: "50"
```

Here is a typescript SDK for creating claude commands:

```embed
title: "GitHub - johnlindquist/claude-hooks"
image: "https://camo.githubusercontent.com/1ab28d1e589dba211bec354e41b81e747e793e34e472b57a3abdebfd7a354ba9/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f636c617564652d686f6f6b732e737667"
description: "Contribute to johnlindquist/claude-hooks development by creating an account on GitHub."
url: "https://github.com/johnlindquist/claude-hooks"
favicon: ""
aspectRatio: "25"
```

You can specify the events to listen to and a file to run on those events, and you do all this from a json file. These are the lifecycle hooks you can listen for:

- **PreToolUse**: This hook runs _before_ a tool (like `edit_file` or `Bash`) is executed. It is the **most powerful point of control for preventative measures** and is the _only_ event that can proactively **block a tool’s execution**.
- **PostToolUse**: This hook runs _after_ a tool has successfully completed. It’s ideal for reactive tasks like automatic formatting, running tests, or logging. It cannot block execution but can provide feedback to Claude.
- **Notification**: This hook triggers whenever Claude Code sends a notification to the user, for example, when it’s waiting for input or has completed a long task. It is purely informational and cannot block execution.
- **Stop**: This hook runs when the **main Claude Code agent finishes responding**. It can be configured to **prevent the agent from terminating**, forcing it to continue working until a specific condition is met.
- **SubagentStop**: This hook runs when a sub-agent task completes its work. Like the `Stop` hook, it can block the sub-agent from stopping.

You specify hooks in JSON in the `.claude/settings.local.json` under the `"hooks"` key:

- `"matcher"`: the tools to match on
- `"hooks"`: the files to run when matched

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '\\(.tool_input.command) - \\(.tool_input.description // \"No description\")' >> ~/.claude/bash-command-log.txt"
          }
        ]
      }
    ]
  }
}
```

Hooks receive JSON data via standard input (stdin) that provides session information and event-specific data, such as `session_id`, `transcript_path`, and `tool_name`. 

They communicate status back to Claude Code primarily through **shell exit codes** and, for more advanced control, **structured JSON output** to stdout.

- **Exit Code 0**: Indicates success. Any output to stdout is shown to the user in the transcript, but _not_ to the model.
- **Exit Code 2**: Signals a **blocking error**. This tells Claude Code to halt the current action (for `PreToolUse` hooks) and processes the feedback from `stderr` as new input for Claude to understand the error and adjust its plan. It is crucial that error messages for blocking errors are sent to `stderr`.
- **Other Non-Zero Exit Codes**: Indicate a non-blocking error. The hook failed, but execution continues. The error message from `stderr` is shown to the user, but not to Claude.

> [!NOTE]
> This means since hooks provide parameters in a deterministic format, we can programatically do stuff with those inputs in another program, like a python or bash script.


For more examples on how to use hooks, look here:

```embed
title: "Claude Code Hooks | Developing with AI Tools | Steve Kinney"
image: ""
description: "Learn how to use event-driven hooks to provide deterministic control over Claude's behavior and automate development workflows"
url: "https://stevekinney.com/courses/ai-development/claude-code-hooks"
favicon: ""
```


**custom hook: deny dangerous commands**

This hook is used to deny dangerous commands like `rm -rf` or curling to a non HTTPS string.

```json title=".claude/settings.local.json"
"hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/pre-bash-firewall.sh"
          }
        ]
      }
    ]
  }
```

```bash title=".claude/hooks/pre-bash-firewall.sh"
#!/usr/bin/env bash
set -euo pipefail

# stdin: JSON with .tool_input.command
cmd=$(jq -r '.tool_input.command // ""')

# Block list (add as needed)
deny_patterns=(
  'rm\s+-rf\s+/'
  'git\s+reset\s+--hard'
  'curl\s+http'
)

for pat in "${deny_patterns[@]}"; do
  if echo "$cmd" | grep -Eiq "$pat"; then
    echo "Blocked command: matches denied pattern '$pat'. Use a safer alternative or explain why it's necessary." 1>&2
    exit 2
  fi
done

exit 0

```

**custom hook: write bash commands to a log**

```bash title=".claude/hooks/pre-bash-log.sh"
#!/usr/bin/env bash
set -euo pipefail
cmd=$(jq -r '.tool_input.command // ""')
printf '%s %s\n' "$(date -Is)" "$cmd" >> .claude/bash-commands.log
exit 0
```
### Subagents

Subagents in claude are just several different agents each with their own system prompt and context window.

You can create subagents with the `/agents` command, and the agent specification is like so:

- **storage**: agents are stored as markdown files in the `.claude/agents` folder in your project
- **tools**: You can specify which tools the agent has access to.

You can also set agents on the global level:

| Type        | Location            | Scope                                 | Priority |
| ----------- | ------------------- | ------------------------------------- | -------- |
| **Project** | `.claude/agents/`   | Available only in the current project | Highest  |
| **User**    | `~/.claude/agents/` | Available across all your projects    | Lower    |

Here is an example of the different types of subagent personalities you can create.

![](https://i.imgur.com/36NkZ2h.jpeg)

![more subagent ideas](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1767097337/image-clipboard-assets/fjxy7nax7x6yhoyv1dcl.webp)

**subagents in claude code skills**

You can specify skills that a subagent can access, as they don't inherit skills from the parent.

```markdown
# .claude/agents/code-reviewer/AGENT.md
---
name: code-reviewer
description: Review code for quality and best practices
skills: pr-review, security-check
---
```

Here's another example:

```md
---
name: your-sub-agent-name
description: A clear description of when this sub agent should be used.
tools: tool1, tool2 # Optional - inherits all tools from the main agent if omitted.
---

Your sub agent's system prompt goes here.

This section should clearly define the sub agent's role, capabilities, personality, and approach to solving problems. Include specific instructions, best practices, and any constraints the sub agent should follow.
```

| Field         | Required | Description                                                                                                                                                 |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | Yes      | A unique identifier for the agent, using lowercase letters and hyphens.                                                                                     |
| `description` | Yes      | A natural language description of the agent’s purpose, used by Claude for automatic delegation.                                                             |
| `tools`       | No       | A comma-separated list of specific tools the agent can use. If omitted, it inherits all tools from the main agent, including any connected via MCP servers. |
| `skills`      | No       | A command-separated list of skill names the agent can have access to.                                                                                       |


## Claude config

The claude config file lives here:

- **global**: `~/.claude/settings.json`
- **local**: `.claude/settings.local.json`

**allowed tools**

At the project or global level, you can set which tools claude does and doesn't need permission for:

```json title=".claude/settings.local.json"
{
  "permissions": {
    "allow": [
      "WebSearch",
      "WebFetch"
      "Bash(git add:*)"
    ],
    "deny": [],
    "ask": []
  }
}
```

**MCP**

You can add MCP config in a `.mcp.json` in the current directory, which claude can access and load the MCP servers from.

It should be in this format:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer <ACCESS_TOKEN_HERE>" 
      }
    }
  }
}

```

Here are some important things to keep in mind:

- The `type` property is required in MCP configuration with claude, and should be one of these three types:
	- `"http"`: HTTP transport server
	- `"stdio"`: locally running STDIO transport server
	- `"sse"`: SSE transport server

The access token must be valid and scoped correctly, having at least the repo permissions.

Here's an example of my favoriute MCP setuo:

```json
"mcpServers": {
"playwright": {
  "type": "stdio",
  "command": "npx",
  "args": [
	"@playwright/mcp@latest"
  ],
  "env": {}
},
"context7": {
  "type": "http",
  "url": "https://mcp.context7.com/mcp",
  "headers": {
	"CONTEXT7_API_KEY": "apikeyhere"
  }
}
},
```

## Claude code for coding


### Process - Claude code planning workflow


1. **Start each task with a plan file**
    
    - Create or designate a `plans/` folder in your repo (e.g. `plans/feature-query-builder.md`).
        
    - Ask the AI to write a plan into that file, not to write code yet.​
        
2. **Prompt the AI to draft the plan**  
    Use a prompt along the lines of​
    
    - “Here is the feature I want. Create a detailed implementation plan and write it into `plans/feature-X.md`. Include: restated requirements, architecture, file-level changes, pseudo-code, and test/lint/type-check commands.”​
        
3. **Review and edit the plan with the AI**
    
    - Read the plan and comment like you would on a junior engineer’s design doc (e.g. “route naming is off”, “missing auth checks”, “doesn’t match existing patterns”).​
        
    - Ask the AI to revise the plan until it matches how you actually want to build the feature.​
        
4. **Implement strictly from the plan**
    
    - Once happy, say: “Now follow the plan in `plans/feature-X.md` and implement the changes step by step.”​
        
    - When things change, first update the plan file, then implement according to the updated plan.​
        
5. **Keep the plan as a living document**
    
    - Whenever tests fail or requirements shift, tell the AI: “Update `plans/feature-X.md` to reflect what we’ve learned, then adjust the implementation.”​
        
    - For new related features, point the AI at existing plan files so it keeps architecture consistent.​

**Living document feature: save to github issue.**

Ask Claude to **save the current plan state to a GitHub Issue** before clearing the context.

**Step A: Save State**

> "Make a GitHub issue containing the current plan, checking off the items we have already completed."

_Claude runs `gh issue create` automatically._

**Step B: Reset & Resume**

> /clear "Get GitHub issue #24 and enact Phase 4 of that plan."

_Claude reads the issue from GitHub, sees where it left off, and resumes work with a fresh context window._

### Claude on your PRs

Run the `/install-github-app` to install a claude code github action.

- By default, the Claude Code GitHub Action listens for comments or issues mentioning `@claude`.

This actions makes claude become a collaborator on your PRs for the current repo. You can now tag claude on issues, make it an assignee, etc.