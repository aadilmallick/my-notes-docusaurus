# Tmux

[[tmux-cheatsheet.pdf]]

## Why TMUX?

TMUX is a windows manager for the terminal, and provides 6 core benefits:

1. sessions that last even when i close my terminal
2. multiple running sessions, and these sessions are based on directory
3. "tabs" within a session
4. navigate to any session by directory name "instantly"
5. navigate to any session by directory with fuzzy find
6. run scripts or whatever programs i want when navigating to a directory

## TMUX basics

### Understanding TMUX

To enter into a TMUX session, run the `tmux` command, which will boot you into a shell session.

In TMUX, there are three basic concepts you have to keep in mind:

- **pane**: a tile in a window that represents a terminal and thus a separate process. 
	- Through horizontal splits and vertical splits, you can have multiple panes/tiles in a single window.
- **window**: the window you are on.
	- each window can have multiple panes and thus multiple terminals/processes running at once.
- **session**: the TMUX session you are in (records shell history, etc.)
	- Each session can have multiple windows.

Thus the hierarchy is as follows:

```
sessions have many windows ->
windows have many panes ->
1 pane = 1 terminal
```

When using the `tmux` command to open up a tmux session, this is what the CLI will look like:



![](https://i.imgur.com/XWYG4lS.jpeg)


> [!NOTE]
> The default session number is 0 and the first window starts with number 1.


### TMUX command mode
#### Prefix 

The **prefix** keystroke combination is a certain keyboard shortcut you set up to enter into **TMUX command management mode**, where instead of normal typing in keyboard, you are now able to manage the TMUX windows and sessions from the keyboard.

By default, the prefix is `CTRL + B` but since that is pretty awkward, we will switch it to `CTRL + A` via the TMUX config


#### General keyboard shorcuts

- **`Ctrl+B ?`** — View all keybindings. Press **Q** to exit.

#### Window management

For this, we assume the prefix is `ctrl + b` but you can change it as you like.

- **`Ctrl+B D`** — Detach from the current session.
- **`Ctrl+B C`** — Create a new window.


**moving across windows**

- **`Ctrl+B N`**: Move to the next window
- **`Ctrl+B P`**: Move to the previous window
- **`Ctrl+B L`**: Move to the last window
- **`Ctrl+B <num>`** — Move to a specific window by number, like prefix + `1` to move to the first window

This special shortcut lets you move across window across all tmux sessions

- **`Ctrl+B W`** — Open a panel to navigate across windows in multiple sessions.

This is what the prefix + `w` command looks like:

![](https://i.imgur.com/dhNjn1y.jpeg)

**renaming windows**

- **prefix + `,`**: rename current window

**closing windows**

- **prefix + `&`**: kill the current window

#### **pane management**

A pane is a terminal, and each window can have multiple panes and thus multiple terminals running at once.

Each window starts out with a single pane taking up the entire window, but by performing horizontal and vertical splits within a pane, you can create more panes.

- **`Ctrl+B %`** — The prefix + `%` shortcut is used to vertically split the current pane.
- **`Ctrl+B "`** — The prefix + `"` shortcut is used to horizontally split the current pane.

You can use these keyboard combinations to move between panes.

- **`Ctrl+B Arrow Key`** (Left, Right, Up, Down) — Move between panes.

You can use these keyboard combos to delete panes

- **`Ctrl+B X`** — Close pane.
- **`Ctrl+B !`** — Delete all panes except for current one.

To resize panes, hold down the prefix and then use the arrow keys to resize up, down, left, and right.

- **prefix + up arrow**: resize current pane up
- **prefix + down arrow**: resize current pane down
- **prefix + left arrow**: resize current pane left
- **prefix + right arrow**: resize current pane right

Also, there is a really handy shortcut to show pane numbers of the current panes in the window:


![](https://i.imgur.com/TBIb5oX.jpeg)



- **prefix + `Q`**: shows pane numbers



#### Session management

For this, we assume the prefix is `ctrl + b` but you can change it as you like.

- **detach from current session = `Ctrl+B D`**: use the prefix + `d` combo to detach from the current session and exit out of tmux.
- **move to next session = `Ctrl+B )`**: use the prefix + `)` combo to move to the next session in cycle (one session number up)
- **move to previous session = `Ctrl+B (`**: use the prefix + `(` combo to move to the previous session in cycle (one session number down)
- **suspend session = `Ctrl+B Ctrl+Z`**: use the prefix + `Ctrl+Z` combo to suspend the current session.
- **rename session = prefix + `$`**: rename current session

## TMUX CLI



### Targets

A `target` is a tuple of `<session_name>[:<widx>|<wname>[.<pane_idx>]]`

```bash
tmux attach-session -t=<target>
tmux has-session -t=<target> 
tmux switch-client -t=<target>
```

> [!WARNING]
> ALWAYS use `-t=` when supplying the target otherwise bad things happen

A list of example targets are:

- `0`: refers to session 0
- `0:1.0`: refers to session 0, window 1, pane 0

### Session management

#### listing sessions

- `tmux ls`: lists all currently running tmux sessions
- `tmux has-session -t <target>`: checks if TMUX has a specific session

#### Creating new sessions

- `tmux`: opens a new TMUX session

You can also use the `tmux new` command and pass along some flags to customize stuff like the session name or initial window name

- `-s <name>`: names the session 
- `-n <name>`: names the initial window
- `-d`: runs in detached mode, which avoids nested sessions

```bash
# opens a new TMUX session and names it.
tmux new -s <session-name> 

# opens a new TMUX session and names the session and first window, and detaches the session.
tmux new-session -s <sname> -n <initial wname> -d[etach] 
```

#### Attaching to existing sessions

- `tmux attach -t=<target>` : attaches to the specific session
- `tmux switch-client -t=<target>`: switches to the specific session

#### Deleting sessions

- `tmux kill-server`: kills the tmux server and thus destroys all currently running sessions

### Managing windows

```bash
# create a new window for a specific session and assign it an index
tmux new-window -n <name> [-t session:window_index]

# list all windows for a specific session
tmux list-windows [-t session]

# select the specific window or pane
tmux select-window -t session:[window_idx | window_name].[pane_idx]
```




## TMUX config

The tmux config lives in the `~/.tmux.conf` file, and is loaded before a TMUX session in order to provide customization to it.

Here is a basic TMUX config, which runs in command mode thus the only things you can write here are TMUX commands.

```bash
set -g default-terminal "tmux-256color"
set -s escape-time 0
set -g base-index 1

# optional -- i like C-a not C-b (pure preference)
unbind C-b
set-option -g prefix C-a
bind-key C-a send-prefix

# vi key movement for copy/pasta mode
set-window-option -g mode-keys vi
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel 'xclip -in -selection clipboard'

# bind prefix + r keyboard shortcut to source the tmux config
bind r source-file ~/.tmux.conf \; display-message "tmux.conf reloaded"
```

### Changing the prefix

Here's an example of changing the prefix in the `~/.tmux.conf` file

```bash title="~/.tmux.conf"
# Set the prefix to Ctrl+a
set -g prefix C-a

# Remove the old prefix
unbind C-b

# Send Ctrl+a to applications by pressing it twice
bind C-a send-prefix
```

### Changing status bar color

```bash
# Change the status bar background color
set -g status-bg cyan 

# Change inactive window color
set -g window-status-style bg=yellow

Change active window color
set -g window-status-current-style bg=red,fg=white
```

### Changing pane movement keyboard shortcuts (VIM rebindings)

To make moving around in TMUX similar to moving around in VIM, we can remap how we navigate around panes to go from instead of using the arrow keys, we should use vim j,h,k,l keys.

```bash title="~/.tmux.conf"
bind -r h select-pane -L # rebinding of h to navigating left
bind -r j select-pane -D
bind -r k select-pane -U
bind -r l select-pane -R
```

