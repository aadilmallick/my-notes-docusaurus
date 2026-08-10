
## Coderabbit

### Coderabbit in pull requests

```embed
title: "CodeRabbit Documentation - AI code reviews on pull requests, IDE, and CLI"
image: "https://coderabbit.mintlify.app/mintlify-assets/_next/image?url=%2F_mintlify%2Fapi%2Fog%3Fdivision%3DPull%2BRequest%2BReviews%26title%3DAutomatic%2Breview%2Bcontrols%26description%3DConfigure%2Bwhen%2Band%2Bhow%2BCodeRabbit%2Bautomatically%2Breviews%2Bpull%2Brequests%2Busing%2Bthe%2B%2560reviews.auto_review%2560%2Bsettings.%26logoLight%3Dhttps%253A%252F%252Fmintcdn.com%252Fcoderabbit%252F8RnjEPbKrF2YZ_KZ%252Fcoderabbit-logo-light.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253D8RnjEPbKrF2YZ_KZ%2526q%253D85%2526s%253Dc40e013627fc045a1b93c713c37b2353%26logoDark%3Dhttps%253A%252F%252Fmintcdn.com%252Fcoderabbit%252F8RnjEPbKrF2YZ_KZ%252Fcoderabbit-logo-dark.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253D8RnjEPbKrF2YZ_KZ%2526q%253D85%2526s%253Da48d7cdfd9bcb216ab70bba0f1a7879c%26primaryColor%3D%2523FF570A%26lightColor%3D%2523FF570A%26backgroundLight%3D%2523ffffff%26backgroundDark%3D%25230e0b0b&w=1200&q=100"
description: "Complete documentation for CodeRabbit. AI code reviews, on pull requests, on the IDE, and on the CLI. With deep integrations to Codex, Claude Code, Cursor, and Gemini and more."
url: "https://docs.coderabbit.ai/configuration/auto-review"
favicon: ""
aspectRatio: "52.5"
```


By default, CodeRabbit treats any new commit pushed to the PR branch—even commits it generated itself—as a prompt to run another incremental review. You can stop or control this behavior using the methods below:

- **method 1 - use the `@coderabbitai ignore` command**: Open your PR description and insert **`@coderabbitai ignore`** anywhere in the text.
	- As long as that tag remains in the description, CodeRabbit will completely ignore subsequent automatic commits.
	- Once you are ready for a final full review, simply delete `@coderabbitai ignore` from the description.
- **method 2 - Configure a Commit Threshold (Repository-Wide)**: You can configure a rule in your global `.coderabbit.yaml` configuration file to stop reviews after a specific amount of back-and-forth activity. This prevents endless agentic review loops.
	- Once the PR hits this threshold, CodeRabbit pauses automatic reviews. You can still manually prompt it later by typing `@coderabbitai review` when you are ready

```yaml title=".coderabbit.yaml"
reviews:
  auto_review:
    enabled: true
    max_commits: 3 # Pauses automatic reviews after 3 commits on this PR

```

Basically these two comment commands let you deterministically control whether coderabbit responds to PR change or not:

- `@coderabbitai ignore`: once you comment this anywhere in the PR description or in a specific comment, coderabbit will ignore that specific comment or if in the PR description, ignores changes to the PR.
- `@coderabbitai review`: Forces CodeRabbit to manually review any comment or PR description with that phrase. 

### CodeRabbit CLI

- `coderabbit`: runs a normal code review session
- `coderabbit --plain`: runs a normal code review session

## Jules

### Jules CLI

#### Installation

1. Install the jules CLI with NPM:

```bash
npm install -g @google/jules
```

2. Login

```bash
jules login
```

3. Ask for help and see the version

```bash
# Get general help
jules help

# Get help for a specific command (e.g., remote)
jules remote --help

jules version
```

#### remote session management

The `remote` command is the primary way to interact with Jules sessions running in the cloud. It has several subcommands.

- `jules remote list`: lists all the remote sessions

```bash
# List all connected repositories
jules remote list --repo

# List all active and past sessions
jules remote list --session
```

- `jules remote new`: Creates a new remote session to delegate a task to Jules.
	- `--repo <repo_name>`: Specifies the repository for the session (e.g., torvalds/linux or . for the current directory’s repo).
    
	- `--session "<prompt>"`: A string describing the task for Jules to perform.
    
	- `--parallel <number>`: Starts multiple parallel sessions to work on the same task.

```bash
# Start a new session to write unit tests in the 'torvalds/linux' repo
jules remote new --repo torvalds/linux --session "write unit tests"
```

- `jules remote pull`: Pulls the results (e.g., code changes) from a completed session.
	- `--session <session_id>`: The ID of the session you want to pull.

#### Jules TUI

```
jules
```
## Greptile