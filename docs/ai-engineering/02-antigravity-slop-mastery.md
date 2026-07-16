
Antigravity 2.0 is now two separate apps:

- **Antigravity**: only agent chat view
- **Antigravity IDE**: the classic agy IDE
## Agent view

### Basics

Open up the current folder in antigravity using the `agy .` command

- **implementation plans**: WHen you're in planning mode you'll be able to create implementation plans and then you can even comment on those plans to have the AI implement your suggestions.
- **inbox**: when you click on the home screen icon, you're taking to a place where you can start a bunch of AI threads in parallel and they can even work on the same project.

### General workflow

With antigravity 2.0, you have three powerful new tools at your disposal:

1. **implementation plans**: still here from the last version, you can ask agy to "create an implementation plan" and it will go into plan mode for you to plan out what to do.
2. **worktrees**: You can spawn a conversation and tell the agent to do something else in a worktree so you can work in parallel.
3. **comment on diffs**: You can comment of file diffs and ask the agent to make changes.
4. **slash commands**: Powerful slash commands like `/browser` allow you to urge the AI to use its browser skill to test code in the browser via Playwright.

Here are the basic steps I use for a general workflow

1. . Prompt the AI with what you want to create, and say **create an implementation plan** for it.
2. Leave comments on the implementation plan so the AI knows what to change. 
3. When adding new changes, choose the agent to deal with the prompt in a **new worktree** as to not interrupt the main flow.

![](https://i.imgur.com/hYL8mvp.jpeg)

### Slash commands

#### Workflow-based commands

- `/browser`: enables remote debugging with chrome and playwright

### Parallel work

#### Worktrees

You can specify to spin up a new worktree on an agent prompt.

#### Subagents

You can tell the agent to spin up subagents to realize parallel work via a prompt like this:

```
"Spin up a bunch of subagents to get this work done in parallel and then let me know when you're done"
```

#### Third-party skills

## IDE view

### MCP servers

You can install MCP servers either by installing MCP servers that have first-class support in antigravity, like the following:

Or you can install them manually by modifying the MCP server json in the `.gemini` folder.


