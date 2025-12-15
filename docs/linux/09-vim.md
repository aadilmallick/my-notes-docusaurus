## Basic VIM

To open vim, run the `vim <textfile.txt>` command to open up a specific command in vim.

### Modes

Vim has two modes: insert (typing text) and edit (for commands) mode. Here is how to get to them:

- **insert mode:** press `i` to enter insert mode
- **edit mode:** press `esc` to enter edit mode

### Quitting and writing files

To quit vim, first get into **command mode**  by hitting `esc`, and then type and run `:q`. To quit no matter what, run `:q!` .

Basic commands:

- `esc` : toggles between typing mode and command mode. In typing mode you can make changes to your text file. In command mode you can type vim commands
- `:q` : quit vim
- `:w` : save file
- `:wq` : save and exit
- `:qa!` : quit no matter what.
- :q! - discard all changes, exit without **saving**

### Navigating files

Here are the different ways to navigate a file in vim while in edit mode

- **Arrow keys** - move the cursor around
- **j, k, h, l** - move the cursor down, up, left and right (similar to the arrow keys)
- `^` - move cursor to beginning of current line
- `$` - move cursor to end of the current line
- `gg`: move the first line in the file
- **G** - move to the last line in the file
- **w** - move forward one word
- **b** - move backward one word
- **{** - move backward one paragraph
- **}** - move forward one paragraph

You also have these commands that take in numerical arguments:

- `<n>G` - move to the `n`th line (eg `5G` moves to 5th line)
- `<n>w` - move forward `n` word (eg `2w` moves two words forwards)
- `<n>b` - move back `n` words

### Turn on line numbers

In edit mode, type this command to turn on line numbers for a file:

```vi
:set nu
```

### Deleting content

Here is how you can delete content while in edit mode

- `x` - delete a single character
- `<n>x` - delete `n` characters (eg `5x` deletes five characters)
- `dd` - delete the current line
- `D` - delete the rest of the line (starting from current cursor position)
- `<n>dw` - Deletes the next `n` words (eg `5dw` means delete 5 words)
- `<n>dd` - Deletes the next `n` lines (eg `5dd` means delete 5 lines)

### Undoing Changes

Here is how you can undo any changes while in edit mode:

- `u` - Undo the last action (you may keep pressing u to keep undoing)
- `U` - Undo all changes to the current line

### Copying and pasting

- `p`: paste the clipboard contents
- `yy`: delete and copy the current line
- `yw`: delete and copy the current word
- `y$`: delete and copy all content in the current line starting from current cursor position

## Find and replace

### basics

- `/<pattern>`: search for matches matching the specified regex pattern, enters **search mode**.
- `n`: goes to next match while in search mode
- `:%s/<pattern>/<replace>/g`: performs find and replace globally