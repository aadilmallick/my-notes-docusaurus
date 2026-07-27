#!/usr/bin/env python3
import sys
import re
import argparse
from pathlib import Path

def parse_heading(line):
    """
    Parses a markdown heading line.
    Returns (level, title) if it is a heading, else None.
    Example: '### Github Copilot' -> (3, 'Github Copilot')
    """
    match = re.match(r'^(#{1,6})\s+(.*)$', line)
    if match:
        return len(match.group(1)), match.group(2).strip()
    return None

def process_markdown(content, offset=-1, section_target=None, min_level=1, max_level=6):
    """
    Processes markdown content and adjusts heading levels.
    :param content: str, input markdown text
    :param offset: int, amount to shift (-1 to lift up, +1 to demote)
    :param section_target: str or None, title of heading section to restrict changes to
    :param min_level: int, minimum allowed heading level (default 1)
    :param max_level: int, maximum allowed heading level (default 6)
    :return: (new_content, list of changes)
    """
    lines = content.splitlines(keepends=True)
    in_code_block = False
    code_block_fence = None
    in_frontmatter = False
    frontmatter_checked = False

    new_lines = []
    changes = []

    # Section tracking state
    target_active = False
    target_base_level = None

    for idx, line in enumerate(lines):
        line_str = line.rstrip('\r\n')

        # Frontmatter check (only at start of file)
        if idx == 0 and line_str.strip() == '---':
            in_frontmatter = True
            new_lines.append(line)
            continue
        if in_frontmatter:
            new_lines.append(line)
            if line_str.strip() == '---':
                in_frontmatter = False
            continue

        # Code block fence check (``` or ~~~)
        fence_match = re.match(r'^\s*(```+|~~~+)(.*)$', line_str)
        if fence_match:
            fence_ticks = fence_match.group(1)
            info_string = fence_match.group(2).strip()
            fence_char = fence_ticks[0]
            fence_len = len(fence_ticks)

            if not in_code_block:
                in_code_block = True
                code_block_char = fence_char
                code_block_len = fence_len
                new_lines.append(line)
                continue
            else:
                # Closing fence must match char, be at least as long, and have NO info string
                if fence_char == code_block_char and fence_len >= code_block_len and not info_string:
                    in_code_block = False
                    code_block_char = None
                    code_block_len = 0
                new_lines.append(line)
                continue

        if in_code_block:
            new_lines.append(line)
            continue

        # Heading check
        heading_info = parse_heading(line_str)
        if heading_info:
            current_level, title = heading_info

            # Check if section target filtering is active
            if section_target is not None:
                # Normalize titles for matching
                norm_title = title.strip().lower()
                norm_target = section_target.strip().lower()

                if norm_title == norm_target or norm_target in norm_title:
                    target_active = True
                    target_base_level = current_level
                elif target_active:
                    # If we encounter a heading at or above the target base level, section ended
                    if current_level <= target_base_level:
                        target_active = False
                        target_base_level = None

            should_shift = (section_target is None) or target_active

            if should_shift:
                new_level = current_level + offset
                new_level = max(min_level, min(max_level, new_level))
                
                if new_level != current_level:
                    # Reconstruct heading line
                    ending = line[len(line_str):]  # preserve original line ending \n or \r\n
                    new_heading_line = f"{'#' * new_level} {title}{ending}"
                    new_lines.append(new_heading_line)
                    changes.append((idx + 1, current_level, new_level, title))
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    return ''.join(new_lines), changes

def main():
    parser = argparse.ArgumentParser(
        description="Relative shifter/lifter for Markdown heading levels."
    )
    parser.add_argument("file", type=Path, help="Path to markdown file")
    parser.add_argument(
        "--lift", "-l",
        type=int,
        default=1,
        help="Number of levels to lift up (default: 1). Use negative number to demote down."
    )
    parser.add_argument(
        "--section", "-s",
        type=str,
        default=None,
        help="Target section heading title. If specified, only this heading and its subheadings will be lifted."
    )
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Show proposed changes without modifying the file."
    )
    parser.add_argument(
        "--min-level",
        type=int,
        default=1,
        help="Minimum heading level cap (default: 1, i.e. H1)."
    )

    args = parser.parse_args()

    if not args.file.exists():
        print(f"Error: File '{args.file}' not found.", file=sys.stderr)
        sys.exit(1)

    content = args.file.read_text(encoding="utf-8")
    offset = -args.lift  # lifting 1 level means reducing # count by 1 (-1)

    new_content, changes = process_markdown(
        content,
        offset=offset,
        section_target=args.section,
        min_level=args.min_level
    )

    if not changes:
        print("No heading level changes were required.")
        return

    print(f"Proposed heading changes in {args.file.name}:")
    for line_num, old_lvl, new_lvl, title in changes:
        print(f"  Line {line_num}: H{old_lvl} -> H{new_lvl} | {title}")

    if args.dry_run:
        print("\n[Dry run] File was not modified.")
    else:
        args.file.write_text(new_content, encoding="utf-8")
        print(f"\nSuccessfully updated {len(changes)} heading(s) in {args.file}.")

if __name__ == "__main__":
    main()
