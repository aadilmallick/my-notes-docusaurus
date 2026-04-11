## Basic VIM

### Intro

Here is all the important terminology:

- **Buffer**: A buffer is a representation of a file in memory. When you edit a buffer, you are not directly editing the file. To save changes, you must write the buffer to the file.
- **Window**: A window is something that displays a buffer. A buffer can remain in memory even after a window is closed, meaning the underlying content is still available.
- **motion**: A motion is anything that moves your cursor in the Vim editor

### Opening VIM

To open vim, run the `vi <textfile.txt>` command to open up a specific command in vim.

### Modes

Vim has two main modes: insert (typing text) and edit (for commands) mode. Here is how to get to them:

- **insert mode:** press `i` to enter insert mode
- **edit mode:** press `esc` to enter edit mode

However, there are four modes in total: Normal mode, Insert mode, Visual mode, and Command mode. 

1. Normal mode is for editing text
2. Insert mode is for typing new text
3. Visual mode is for highlighting text
4. Command mode is accessed by pressing colon (:) in normal mode to execute commands.

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
- `G` - move to the last line in the file
- `w` - move forward one word
- `b` - move backward one word
- `{` - move backward one paragraph
- `}` - move forward one paragraph

You also have these commands that take in numerical arguments:

- `<n>G` - move to the `n`th line (eg `5G` moves to 5th line)
- `<n>w` - move forward `n` word (eg `2w` moves two words forwards)
- `<n>b` - move back `n` words

### Deleting content

Here is how you can delete content while in edit mode:

- `x` - delete a single character
- `dd` - delete the current line
- `D` - delete the rest of the line (starting from current cursor position)

And you have these that take in a numerical argument:

-  `<n>x` - delete `n` characters (eg `5x` deletes five characters)
- `<n>dd` - Deletes the next `n` lines (eg `5dd` means delete 5 lines)

#### Deletion mode

Simply typing `d` enters you into deletion mode, where any navigation command you type after that deletes up to that navigation:

- `<n>j`: navigates downward `n` lines and deletes them all
- `<n>k`: navigates upward `n` lines and deletes them all
- `<n>h`: navigates left `n` characters and deletes them all
- `<n>l`: navigates right `n` characters and deletes them all
- `<n>w`: navigates right `n` words and deletes them all
- `<n>b`: navigates left `n` words and deletes them all

### Undoing Changes

Here is how you can undo any changes while in edit mode:

- `u` - Undo the last action (you may keep pressing u to keep undoing)
- `U` - Undo all changes to the current line

### Copying and pasting (yanking)

To enter yanking mode, type `y`: Once in yanking mode, you can type these additional characters for different behavior.

These characters copy words or lines

- `y`: copy the current line
- `w`: copy the current word
- `Y`: copy all content in the current line starting from current cursor position

Also any navigation you do henceforth while yank mode is activated just adds or subtracts from the yanking range:

- `y<n>j`: enter yanking mode and copy `n` lines down.
- `y<n>k`: enter yanking mode and copy `n` lines up.
- `y<n>h`: enter yanking mode and copy `n` characters left.
- `y<n>l`: enter yanking mode and copy `n` characters right.
- `y<n>b`: enter yanking mode and copy `n` words left.
- `y<n>w`: enter yanking mode and copy `n` words right.

These characters are used for pasting things

 - `p`: paste whatever you have copied to the line below
- `P`: paste whatever you have copied to the line above

### Highlighting text

#### Visual mode

Visual mode is where you can highlight text to copy or delete it.

Press `v` to enter into visual mode, highlighting the current character. Now any navigation you do will highlight where you navigate to. Press `esc` to escape from visual mode.

Once in visual mode, you can access other modes like yanking mode, taking advantage of what you have highlighted:

- `y`: copies whatever you have highlighted (enters yanking mode)
- `d`: deletes whatever you have highlighted and also copies it to the clipboard (enters yanking mode)

#### Visual line mode

Press `V` (shift + v) to enter into visual line mode, which is just visual mode but it also highlightsa the entire current line. 

here's an example of how to use it:

```bash
Vyp # highlight current line, copies it, and pastes it below
```

So here's a basic summary:

- `v`: enters visual mode
- `V`: enters visual mode and highlights current line
- `esc`: escapes from visual mode

### How to enter insert mode

- `i`: Pressing 'i' enters insert mode with the cursor positioned to the left of the current cursor position
- `a`: Pressing 'a' enters insert mode with the cursor positioned to the right of the current cursor position
- `I`: Pressing `Shift+i` enters insert mode at the first non-whitespace character at the beginning of the line
- `A`: Pressing `Shift+A` enters insert mode at the end of the line, including any trailing whitespace
- `o`: Pressing 'o' creates a new line below the current line, respects the current indentation, and enters insert mode

## Find and replace

### basics

- `/<pattern>`: search for matches matching the specified regex pattern, enters **search mode**.
- `n`: goes to next match while in search mode
- `:%s/<pattern>/<replace>/g`: performs find and replace globally


## Vim customization

#### `~/.vimrc`

You can execute special commands in each vim session to customize vim behavior. 

To avoid having to re-execute these commands again and again for each new session, you can put those commands into a `~/.vimrc` in your home directory that Vim will automatically read.

So a `~/.vimrc` file is just a file read in command mode, where each line corresponds to a vim command to be executed, and this file is loaded on every single vim bootup.

Here is my vimrc:

```vim
set scrolloff=8
set number
set tabstop=4 softtabstop=4
set expandtab
set smartindent
syntax on
set cursorline
set shiftwidth=4
set incsearch
set smartcase
set hlsearch
set backspace=indent,eol,start
colorscheme habamax
```

### Basic built-in customizations

#### UI

- `set scrolloff=8`: sets the tolerance as the cursor being 8 lines above or below the center of the screen before the document scrolls with you.
- `set number`: turns on line numbers for the file
- `set relativenumber` (or `:set rnu` for short): turns on relative line numbers from the current cursor position, which is useful for yanking and deleting.
- **`syntax on`**: Enables color coding for different programming languages.
- **`set cursorline`**: Highlights the horizontal line where your cursor is sitting, making it easier to find.
- **`set mouse=a`**: Enables the mouse for scrolling and clicking, which is helpful while you're still learning keyboard motions.

#### Indentation and spacing

- **`set tabstop=4`**: Makes a tab character look 4 columns wide.
- **`set shiftwidth=4`**: Sets the number of spaces used for each level of (auto)indent.
- **`set expandtab`**: Converts tabs into spaces.
- **`set autoindent`**: Automatically matches the indentation level of the previous line when you hit enter.

#### Find and replace

- **`set incsearch`**: Starts searching and highlighting matches as you type your query.
- **`set hlsearch`**: Keeps search results highlighted after you finish typing.
- **`set ignorecase`**: Makes searches case-insensitive by default.
- **`set smartcase`**: Automatically switches to case-sensitive if you include a capital letter in your search.

#### Quality of life

- **`set nocompatible`**: Ensures Vim uses its own features rather than trying to act exactly like the ancient "Vi" editor.
- **`set hidden`**: Allows you to switch buffers (open files) without being forced to save the current one first.
- **`set backspace=indent,eol,start`**: Fixes the common frustration where the backspace key won't delete characters in certain modes or across lines.

### Changing color scheme

Use the `:colorscheme <theme>` command to change the color scheme of vim by selecting one of the built-in themes vim offers.

You can find all theme options by typing first `:colorscheme` and then a space and then hitting `ctrl + d` to pull up all the options.

Then you can put your choice of colorscheme inside your vimrc.