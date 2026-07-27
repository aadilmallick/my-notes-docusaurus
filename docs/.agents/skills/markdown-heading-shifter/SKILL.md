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

## Usage via Helper Script

The skill includes a python utility at `scripts/shift_headings.py`.

### Examples

- **Lift all headings in a file by 1 level up:**
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1
  ```

- **Lift headings under a specific section by 1 level:**
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --section "google-adk"
  ```

- **Demote headings by 1 level (downward shift):**
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift -1
  ```

- **Preview changes without writing (Dry Run):**
  ```bash
  python3 .agents/skills/markdown-heading-shifter/scripts/shift_headings.py path/to/file.md --lift 1 --dry-run
  ```

## Manual Implementation Rules
If running programmatically or via direct edits:
- Parse line by line, keeping track of code blocks (` ``` ` or `~~~`) and YAML frontmatter (`---`).
- Match lines starting with 1–6 `#` symbols followed by whitespace.
- For section targeting, start lifting when matching the target heading, and stop when encountering a heading at or above the target's starting level.
