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
- **normal mode:** press `esc` to enter normal mode

However, there are four modes in total: Normal mode, Insert mode, Visual mode, and Command mode. 

1. Normal mode is for moving around and able to edit text with shortcuts
2. Insert mode is for typing new text and editing text
3. Visual mode is for highlighting text
4. Command mode is accessed by pressing colon (:) in normal mode to execute commands.

There are also several more secondary modes that can be accessed:

1. **window management mode**: accessed via `ctrl + w`, which lets you manage windows.
2. **yanking mode**: accessed by first typing `y`, which lets you copy lines of text and gives secondary commands to paste or delete lines.
3. **deletion mode**: accessed by first typing `d`, which lets you delete characters, words, or even entire lines at a time.

#### Normal mode

In normal mode, you can use `j`, `k`, `h`, and `l` to navigate (and more like `w`, `b`, and `g`) and access all of the secondary modes to do stuff like yanking, deletion, and window management.

#### Insert mode

You have several different ways of entering insert mode but once you're in insert mode, by default no keybindings except `esc` work to go back into normal mode. It's just like editing a text document once you're in insert mode.

#### Visual mode

You enter visual mode by typing `v` to highlight the current character or `V` to initially highlight the entire current line.

While in visual mode, all navigation keystrokes work, but where you navigate to either expands or shrinks the highlighted area.

You can exit visual mode and used the highlighted text for the secondary modes like yanking and deletion:

- `y`: yanks the highlighted text
- `d`: deletes the highlighted text

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



### Remaps

Rempas are a way to add custom key bindings in VsCode, where you can map a sequence of keystrokes to a specific command in vim.

Here is how to create a remap in your `~/.vimrc`:

```bash
let mapleader = " "  # create the <leader> = " " variable
nnoremap <leader>pv :Vex<CR> # maps " pv" to the :Vex command execution
```

The `nnoremap` keyword is actually made of three components that you can change:

```bash
<mode> <lhs> <rhs> # mode, then left hand side, then right hand side
```

- `n`: stands for **normal mode**, which means this remap will only be active when the user is in normal mode in vim.
- `nore`: stands for **no recursive execution**, which means this remap will not recursively trigger other remaps
- `map`: performs a mapping between the left hand side and right hand side, separated by a space.

What these two lines of code do is to non-recursively map the `<leader>pv` (a space before the pv) to the `:Vex<CR>` command, where `<CR>` is a carriage return, automatically hitting the `Enter` keystroke and executing the `:Vex` command.

For special characters like a space, we have to create a variable, here we call it `<leader>` by mapping the `leader` variable to a space character, and then we can refer to those variables  via `<leader>` because otherwise spaces have special behaviors in commands.

```bash
# map <leader> to the space character
let mapleader = " "
```

#### The danger of remaps

Bad remaps can make vim laggy and bad remaps are also ones that are hard to remember (anything more than three keystrokes).

Here's an example of remaps taken too far, where we create recursive remaps in insert mode:


![](https://i.imgur.com/5wB9MK7.jpeg)

Here's an example of a bad remap that makes vim laggy, because if the first keystroke of our remap is a popular keystroke like `p` for pasting, vim will always wait ~500ms for the next pair of keystrokes before realizing you aren't going to type the command, so it ends the keystroke listening and just executes what you typed.

```bash
# bad because just typing `p` will be laggy because vim is waiting to see if `pv` will be typed out.
nnoremap pv :Vex
```

### Sourcing `~/.vimrc`

The `:so <filepath>` command takes in a filepath to source into the current vim environment.

This means `:so ~/.vimrc` sources the vimrc without you having to quit your current vim session.

- `:so ~/.vimrc`: sources the vimrc
- `:so %`: sources the current file buffer that is being focused on.

Here is a remap that sources `~/.vimrc` by just hitting the keystroke combination **Space + Enter**:

```bash
# declare <leader> = space character
let mapleader = " "
# map space + enter to sourcing the vimrc and executing that command.
nnoremap <leader><CR> :so ~/.vimrc<CR>
```




## Split windows in vim

In Vim you'll often have to deal with multiple windows in the same vim session and it's useful to know how to switch between them and manage them.

To manage windows in vim, use the `ctrl + w` keyboard shortcut to enter **window management mode**.

### Switching windows

Once in window management mode by pressing `ctrl + w`, do the following to switch the currently focused window, which comes from the navigation commands:

- `j`: selects window one down
- `k`: selects window one up
- `h`: selects window to the immediate left
- `l`: selects window to the immediate right

You also have access to an easy way for cycling through the windows:

- `ctrl + w`: hitting this again switches to the next window in the cycle.

### Closing windows

To close a window, you can simply quit it or do `ctrl + w, c`, where you first enter window management mode and then press `c` to close the window.

- `ctrl + w, c`: close the currently focused window
- `ctrl + w, ctrl + o`: close all windows except the currently focused one.

### Splitting windows

Once in window management mode by pressing `ctrl + w`, do the following to create multiple windows of the current buffer, sort of like multiple tabs of the same file in VsCode:

- `s`: horizontal split
- `v`: vertical split



### Summary

- **Move Down:** Press `Ctrl + w`, then `j` (or the down arrow).
- **Move Up:** Press `Ctrl + w`, then `k` (or the up arrow).
- **Cycle Through:** Press `Ctrl + w` twice (`Ctrl + w`, `w`) to jump to the next window.
- **Make Equal Size:** `Ctrl + w` followed by `=`
- **Maximize Current Window:** `Ctrl + w` followed by `_` (underscore)
- **Close Current Window:** `:q` or `Ctrl + w`, then `c`


## Navigating the filesystem with vim

Vim can also be used as a quick way to view files in a directory and navigate between files and directories. Think of it like `ls` on steroids.

To open up a file tree in the current directory (able to navigate to all files and subdirectories within the current directory), type `vim <foldername>`:

```bash
vim <folderpath> # opens up the specified directory path in the vim file explorer
vim . # opens up cwd in the vim file explorer
```

You have these basic navigations:

- `j`: go down the file tree
- `k`: go up the file tree
- `enter`: press the **enter** key to enter a directory or open a file

To exit from a file and go back to the directory containing the file, you can use these commands:

- `:Ex`: stands for *explore*, which opens up the file tree of the directory containing the file.
- `:Vex`: stands for *vertical explore*, creating a vertical split which opens up the file tree of the directory containing the file to the left of it, giving you two tiles, where the left panel is the file tree and the right panel is the file. 
	- **left**: file tree
	- **right**: opened file contents
- `:Sex`: stands for *split explore*, creating a horizontal split which opens up the file tree of the directory containing the file to the bottom of it, giving you two tiles, where the bottom panel is the file tree and the top panel is the file. 
	- **top**: file tree
	- **bottom**: opened file contents

To edit a file, use the `:e <filepath>` command, which will open up a normal vim session for that file, loading that file as a bugger. To search for the specific file, you have these options:

- `Ctrl + d` shows all possible auto-complete options
- **Tab** can be used to walk around and auto-complete file names

You can do fuzzy searching with regex and then try looking at the options with `ctrl + d` and autocomplete options with `tab`


### Filesystem Remaps

### Marks

Marks are a way to save a position in a file when navigating a file tree and opening up files, and then you can navigate to those marks, navigating to that saved position in the file. There are two types of marks:

- **global marks**: marks that are registered globally for the current vim navigation session.
- **file marks**: marks that are registered locally only to the file you set those marks in.

To create a mark, you go into **marking mode** with `m`. Then you can type one of two things:

- **capital letter**: A capital letter creates a global mark.
- **lowercase letter**: A lowercase letter creates a file mark.

If you use the same letter (case-sensitive) twice during a session, the most recent mark you set overrides the previous one. 

To navigate to a mark, press a single quote `'` to enter **mark navigation mode**, and then type the letter of the global or file mark you want to navigate to in order to navigate to that specific saved point.


> [!WARNING] 
> Marks have a lot of cognitive overhead because you have to keep a lot of things in your mind and you have to remember which letters you've used and which marks you've already used and which marks are global or file marks. So in order to get the best use out of marks, it's important to create a consistent pattern for how you define them and use them.





## NeoVim
