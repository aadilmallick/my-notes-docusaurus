---
name: markdown-heading-shifter
description: Performs relative adjustments to Markdown heading levels (lifting up or demoting down). Works on whole Markdown files or target sections while preserving code blocks and frontmatter.
---

# Markdown Heading Shifter

Use this skill when you need to perform relative level adjustments (lifting or demoting) to headings in Markdown files.

## Key Features & Rules
1. **Relative Shift**: Lifts heading levels up (e.g. `###` H3 -> `##` H2) or demotes them down (e.g. `##` H2 -> `###` H3) by a specified offset `N`.
2. **Code Block & Frontmatter Protection**: Ignores headings inside fenced code blocks (` ``` ` or `~~~`) and top-of-file YAML frontmatter (`---`).
3. **Section Scoping**: Can target a specific heading (e.g. `"Google ADK"`) and lift/demote only that heading and its nested subheadings (all headings until reaching another heading of equal or higher level).
4. **Safety Caps**: Ensures heading levels do not exceed standard Markdown bounds (H1 to H6).

## Choosing how to run the script

The helper script is at `scripts/shift_headings.py`. It is pure standard library (no dependencies), so any Python 3 interpreter works. Pick the launcher based on the current shell:

| Environment | Command prefix | Notes |
| --- | --- | --- |
| PowerShell / `pwsh` / `cmd` (Windows) | `uv run --no-project` | Preferred. `uv` provisions a Python automatically, so this works even with no system Python installed. |
| WSL / Linux / macOS | `python3` | Standard system interpreter. |
| Any shell with a real Python already on PATH | `python3` (or `python`) | Verify first (see below). |

### Windows gotcha: the `python3` stub
On Windows, `python3.exe` often resolves to the Microsoft Store **App Execution Alias** stub at
`%LOCALAPPDATA%\Microsoft\WindowsApps\python3.exe`. It is not a real interpreter and exits with code `9009` plus:

> Python was not found; run without arguments to install from the Microsoft Store...

`py` (the Python launcher) is frequently absent too. **On PowerShell/cmd, default to `uv run --no-project` rather than probing for Python.**

To check what is actually available:

```powershell
Get-Command python, python3, py, uv -ErrorAction SilentlyContinue | Select-Object Name, Source
```

### Why `--no-project`
`uv run` will otherwise try to resolve and sync the nearest project (`pyproject.toml`), which is slow and irrelevant here. `--no-project` runs the script standalone.

## Usage & Examples

Run from the directory that the file path is relative to (e.g. the docs root). Substitute the prefix from the table above.

- **Preview changes without writing (dry run) — always do this first:**
  ```powershell
  uv run --no-project .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --dry-run
  ```
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --dry-run
  ```

- **Lift all headings in a file by 1 level up:**
  ```powershell
  uv run --no-project .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1
  ```
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1
  ```

- **Lift a specific section and its subheadings by 1 level:**
  ```powershell
  uv run --no-project .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --section "LLM chat apps"
  ```
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --section "LLM chat apps"
  ```

- **Demote headings by 1 level (downward shift):**
  ```powershell
  uv run --no-project .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift -1
  ```
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift -1
  ```

- **Refuse to create an H1 (clamp the floor at H2):**
  ```powershell
  uv run --no-project .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --min-level 2
  ```

### Flags

- `--lift N` / `-l N` — levels to lift up. Default `1`. Negative values demote. `--lift 1` means one fewer `#`.
- `--section TITLE` / `-s TITLE` — restrict the shift to one heading and its nested subheadings.
- `--dry-run` / `-n` — print the proposed changes without writing.
- `--min-level N` — floor for the resulting heading level. Default `1`. The ceiling is fixed at H6 and is not exposed as a flag.

## Recommended workflow
1. **Inspect the file's heading structure first** so you know the baseline level and where the target section ends.
2. **Dry run.** The output lists every affected heading as `Line N: H<old> -> H<new> | Title`.
3. **Sanity-check the dry-run output** against the caveats below — especially the last affected line, to confirm the section boundary is where you expect.
4. **Apply**, then verify the blast radius:
   ```powershell
   git --no-pager diff --stat -- path/to/file.md
   ```
   Insertions and deletions should both equal the number of changed headings.

## Caveats

### `--section` matches heading *text*, not a slug
Matching is case-insensitive and **substring-based** (`target in heading_title`). Pass the heading's literal text, e.g. `--section "LLM chat apps"`, not `llm-chat-apps`.

Because it is a substring match, a short or generic target can re-trigger on unrelated headings later in the file, silently extending the shift. Every re-match also resets the section's base level. **Prefer the full, exact heading text**, and confirm the dry-run output stops where you expect.

### Lifting a top-level heading can create an unwanted H1
Many docs (Docusaurus in particular) are rooted at `##`, with the H1 supplied by frontmatter or the sidebar title. Lifting such a section produces the file's only `#`, which is inconsistent and can affect rendering and the table of contents.

Check the file's baseline level before lifting. If an H1 is undesirable, either shift a nested subtree instead, or reconsider the operation.

Note that `--min-level 2` **clamps** rather than skips: the H2 stays at H2 while its H3 children become H2, collapsing them into siblings of their former parent. That is usually not what you want for a whole section — it is only useful when the top heading is already at the floor and you intend to flatten.

### Structure is not validated
The script performs a mechanical shift. It does not detect heading-level gaps (e.g. H2 followed directly by H4) or duplicate sibling headings created by clamping. Review the dry run.

## Manual Implementation Rules
If running programmatically or via direct edits:
- Parse line by line, keeping track of code blocks (` ``` ` or `~~~`) and YAML frontmatter (`---`).
- Match lines starting with 1–6 `#` symbols followed by whitespace.
- For section targeting, start lifting when matching the target heading, and stop when encountering a heading at or above the target's starting level.
- Preserve the original line endings (`\n` vs `\r\n`) when rewriting a heading line.
