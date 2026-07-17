

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

- Code edits in a repo: Ask Codex to modify specific files/functions; review the
 proposed patch; run `codex apply` to commit changes locally.
- Bug triage and fixes: Provide failing test output; Codex pinpoints the issue, 
proposes a change, and helps validate the fix.
- Documentation & READMEs: Generate outlines or complete docs via `codex exec` a
nd refine interactively.
- Refactors: Guide multi-file refactors in steps; use sandboxed execution and ap
provals to run formatters and tests.
- UI reviews: Attach screenshots with `-i` so Codex can suggest accessibility im
provements and produce code updates.
- OSS/local models: Use `--oss` to target a local provider when network-limited 
or to keep data local.

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

### Tips & Best Practices

- Be explicit: Include filenames, functions, and constraints in prompts.
- Iterate: Start broad, then refine with follow-ups or `exec` reruns.
- Review diffs: Read proposed patches before `codex apply`.
- Keep changes scoped: Smaller prompts produce clearer, safer edits.
- Use profiles: Store your defaults in `~/.codex/config.toml` and reference them
 with `-p`.
- Treat `danger-full-access` and `--dangerously-bypass-approvals-and-sandbox` wi
th care; prefer `workspace-write` + `on-request` for day-to-day work.



