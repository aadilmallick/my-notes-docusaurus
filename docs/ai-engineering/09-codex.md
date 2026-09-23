

## CLI

### Intro

```bash
# Interactive: start a session with a prompt
codex "Refactor utils/logger to remove dead code"

# Non-interactive: run once and print the result
codex exec "Generate a README outline for a Flask API"

# Choose a model
codex -m o3 "Summarize the contribution guidelines"

# Use local OSS provider (expects a local Ollama server)
codex --oss "Suggest performance improvements for this script"

# Attach one or more images to the initial prompt
codex -i screenshots/login.png -i screenshots/dashboard.png \
  "Describe accessibility issues in these screens and fix React code"
```


- Prompt: Optional initial message you provide on invocation. If omitted, Codex opens the interactive CLI waiting for your input.
- Models (`-m`): Select the model to use. 
	- Works with configured providers; 
	- `--oss` is a convenience flag to target a local open-source provider (verifies a local Ollama server).
- Images (`-i`): Attach one or more files to give visual context (e.g., UI screenshots) to the first turn.
- Config override (`-c key=value`): Override any config key at runtime. Values parse as JSON when possible; otherwise treated as strings. Examples:
    - `-c model="o3"`
    - `-c 'sandbox_permissions=["disk-full-read-access"]'`
    - `-c shell_environment_policy.inherit=all`
- Sandbox (`-s`): Controls what Codex-generated commands can do when executed.
  - `read-only`: Only safe read operations (e.g., `ls`, `cat`, `sed`).
  - `workspace-write`: Can modify files inside the workspace.
  - `danger-full-access`: No filesystem sandboxing. Use with extreme care.
- Approval policy (`-a`): When Codex asks before executing commands.
  - `untrusted`: Run only trusted read commands automatically; ask for others.
  - `on-failure`: Run all commands; ask only if one fails and needs escalation.
  - `on-request`: Codex decides when to ask (balanced default for many cases).
  - `never`: Never ask; failures are returned immediately.

```
codex -a untrusted -s workspace-write
```

#### Interactive session (default)

```bash
# With an initial prompt
codex "Add pagination to /api/posts, include tests"

# No prompt: open the interactive TUI and chat
codex
```

Use the session to iterate on code, ask Codex to propose patches, run tests, and
 refine outputs. Combine with sandbox + approvals to keep changes safe.

#### `exec` — one-shot non-interactive

```bash
codex exec "Write a bash script that cleans old build artifacts safely"

# Pipe output directly to a file
codex exec "Create a .gitignore for a Rust workspace" > .gitignore

# With images
codex exec -i docs/wireframe.png "Generate a responsive HTML/CSS layout"
```

#### `apply` — apply the latest diff from Codex

When Codex proposes edits, it often produces a patch. Apply it directly to your 
working tree:

```bash
# After Codex proposes a patch in the session
codex apply
```

Under the hood this runs a `git apply` of the last diff the agent produced. Ensu
re you’re in a clean repo or understand what will change before applying.


### Practical Workflows & Use Cases

- **Code edits in a repo**: Ask Codex to modify specific files/functions; review the proposed patch; run `codex apply` to commit changes locally.
- **Bug triage and fixes**: Provide failing test output; Codex pinpoints the issue, proposes a change, and helps validate the fix.
- **Documentation & READMEs**: Generate outlines or complete docs via `codex exec` and refine interactively.
- Refactors: Guide multi-file refactors in steps; use sandboxed execution and approvals to run formatters and tests.
- UI reviews: Attach screenshots with `-i` so Codex can suggest accessibility improvements and produce code updates.
- OSS/local models: Use `--oss` to target a local provider when network-limited  or to keep data local.

Here are some examples

1) **Fix a bug interactively and apply**

```bash
codex -s workspace-write -a on-request \
  "Investigate failing test in tests/test_parser.py and fix the parser"

# In the session, ask Codex to run tests, identify the failure, propose a patch.
# Then apply the patch locally:
codex apply
```

2) **Generate a README non-interactively**

```bash
codex exec -m o3 \
  "Write a comprehensive README for a RESTful Flask service; include setup, run,
 env, testing"
```

3) **Attach images for context**

```bash
codex -i screenshots/mobile-home.png -i screenshots/mobile-detail.png \
  "Spot a11y issues and provide React Native fixes"
```

4) **Override configuration at runtime**

```bash
# Switch model and expand permissions for the current run only
codex -c model="o3" -c 'sandbox_permissions=["disk-full-read-access"]' \
  "Profile code hotspots and propose optimizations"

# Inherit full shell environment (example nested key override)
codex -c shell_environment_policy.inherit=all \
  "Use my local toolchain to compile and test"
```

5) **Tune sandbox and approvals**

```bash
# Conservative: read-only + untrusted (ask for anything risky)
codex -s read-only -a untrusted "List flaky tests and analyze logs"

# Productive middle ground: workspace writes allowed; ask when needed
codex -s workspace-write -a on-request \
  "Refactor utils/date and update usage sites"

# Power mode: bypass everything (only in safe, sandboxed environments)
codex --dangerously-bypass-approvals-and-sandbox \
  "Bulk-apply code style fixes across the repo"
```



## Codex

### Conversation basics

#### Slash commands

- `/plan`: plan

### Prompting codex

#### Spec-driven development

Here are the skills we will use:

- **PRD skill**: the [PRD skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/prd/SKILL.md) is used to create a feature request into a full-fledged PRD, and uses the `qna` skill as well to ask clarifying questions.
- **qna skill**: the [qna skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/qna/SKILL.md) is used to ask clarifying questions.
- **research skill**: use the [research skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/research-solution/SKILL.md) to research how new tech would fit into the existing codebase, what to change, etc.
- **prototype skill**: use the [prototype skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/prototype/SKILL.md) whenever you want to create a simple artifact to showcase how a feature would look like without actually implementing it.
- **module design**: use the [module skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/module-design/SKILL.md) for creating and dealing with abstractions and modules in your codebase
- **slice skill**: use the [slice skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/slice-work/SKILL.md) to break up a feature request into a plan separated across multiple modules, each with their own tests.
- **to issue skill**: use the [to issue skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/to-issues/SKILL.md) to lift each unit of a large plan into an issue and then push it to an issue tracker like github issues or Linear
- **build skill**: use the [build skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/build/SKILL.md) to build up each unit of a sliced plan
- **code review skill**: use the [code review skill](https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/code-review/SKILL.md) to review your uncommitted changes

Here are the general steps as to how you should use these skills:

1. **PRD + qna**: run PRD + qna to create a PRD
2. **research skill**: run the research skill to research how to implement a feature
3. **slice skill + to issue skill**: slice the research plan into individual issues and then push them to an issue tracker.
4. **build skill**: implement each unit of work from the sliced up plan.

#### General prompting best practices

- **Always give acceptance criteria**: give codex acceptance criteria to get done as a list of TODOs.
	- - Verification of AI-generated code against predefined acceptance criteria is essential to ensure quality and correctness.

### MCP

### Skills

#### Skill creator skill

Here is a good skill creator skill:

```embed
title: "openai-codex-create-reusable-engineering-skills-13230026/.agents/skills/skill-design/SKILL.md at course/final · LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026"
image: "https://opengraph.githubassets.com/6aa51dee0d590663b19047255c541b004b3067da70e7d6ac1e894905b510c4a5/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026"
description: "This is a repo for LinkedIn Learning course: OpenAI Codex: Create Reusable Engineering Skills - LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026"
url: "https://github.com/LinkedInLearning/openai-codex-create-reusable-engineering-skills-13230026/blob/course/final/.agents/skills/skill-design/SKILL.md"
favicon: ""
aspectRatio: "50"
```

```md
---
name: skill-design
description: >-
  Author and audit portable agent skills with focused activation, concise workflows, and optional
  Codex metadata. Use when creating or editing a skill, reviewing skill quality, choosing a skill
  boundary, or making skills work across agent hosts. Triggers: "write a skill", "review this
  skill", "design the skills", "make this agent agnostic". Not for running another skill's
  workflow.
---

# Skill Design

Turn variable agent behavior into a focused, repeatable workflow that follows the open Agent Skills format and works especially well in Codex.

## Portable core

Every skill lives in a lowercase, hyphenated folder containing `SKILL.md`.

Keep `SKILL.md` portable:

- Put only `name` and `description` in YAML frontmatter.
- Match the folder name to `name`.
- Write the body as host-neutral instructions.
- Put reusable detail in `references/`, deterministic operations in `scripts/`, and output material in `assets/` only when needed.
- Refer to another workflow by its skill name. If Codex syntax helps the user, add `In Codex, invoke $skill-name`.

## Codex metadata

Add `agents/openai.yaml` for Codex-facing presentation and policy without coupling the portable workflow to Codex.

- Set `interface.display_name`, `interface.short_description`, and a one-sentence `interface.default_prompt` that explicitly names `$skill-name`.
- Set `policy.allow_implicit_invocation: false` when activation could commit, publish, merge, spend money, or otherwise surprise the user.
- Leave implicit invocation enabled for safe disciplines that provide judgment without expanding the user's requested actions.
- Declare required MCP tools only when the skill truly depends on them.

## Activation

Treat `description` as routing logic. State what the skill does, when it applies, representative trigger phrases, and the neighboring workflow it does not own. Front-load the core use case because hosts may shorten long descriptions.

## Process

1. Determine whether the user asked for an audit or a change. In audit mode, inspect and report findings without editing files. Continue to the remaining steps only in authoring mode or after the user explicitly asks to apply fixes.
2. Write three realistic requests the skill must handle, including one that should not activate it. Done when the boundary is observable.
3. Choose one focused user goal and split apart workflows with different inputs, side effects, or success criteria. Done when the skill has one job.
4. Write the smallest workflow that handles the scenarios. Use imperative steps with explicit inputs, outputs, stop conditions, and completion checks. Done when every step can be verified.
5. Add only the supporting resources the workflow repeatedly needs. Done when every bundled file is referenced by `SKILL.md` and no information is duplicated.
6. Add or refresh `agents/openai.yaml`. Done when its display text and default prompt match the skill.
7. Validate the folder and run the scenarios with a fresh agent. Done when activation and output quality both hold without leaked context.

## Hard rules

- Keep the body under 500 lines, and prefer much less. Move detailed reference material one level down rather than bloating the always-loaded workflow.
- Never use unsupported product-specific frontmatter. Product metadata belongs under `agents/`, where other hosts can ignore it safely.
- Never edit a skill during an audit-only request. Why: asking for findings authorizes analysis, not file changes.
- Never add a script when clear instructions and existing tools are reliable enough. Scripts create maintenance cost and should buy determinism.
- Never hide external writes or destructive actions behind implicit invocation. The user must choose workflows with meaningful side effects.
- Never ship an untested description. A skill that runs well but triggers at the wrong time is still broken.
```
### Plugins

## Codex workflows

### Github integration

Once you connect codex to github through your ChatGPT account, you can do the following:

- **Add the `codex` label on issues**: Assign codex to take on issues for you by assigning the "codex" label to an issue
- **Tag `@codex` on comments**: on PR comments or issue bodies, you can tag `@codex` and tell it to do whatever you want.

