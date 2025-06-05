
## Keyboard shortcuts

- `CTRL + A `– takes you to the beginning of the line
- `CTRL + E` – takes you to the end of the line
- `CTRL + K` – delete (yank) everything after the cursor
- `CTRL + U` – delete (yank) everything before the cursor
- `CTRL + Y` - "paste" everything you yanked (paste in quotes because it doesn't actually go into your system clipboard, only your bash clipboard).
- `CTRL + L` - clear the screen
- `CTRL + R` – reverse search through history
- `CTRL + D` - exit bash shell


## Bash History

You can use the `history` command to see a record of all your bash history.

## Learning about commands

These are helper commands that help you learn about other commands:

- `help <command>`: shows the MAN page for the specified command.
- `which <command>`: shows the file location for the specified command.
- `type <command>`: tells which type a specified command is. 

For the `type` command, there are 4 types of things a command could be:

1. executable “bin” commands
2. built-in shell command
3. shell function
4. alias


## Dealing with files

### Getting file info

To get information about the what resource a filepath actually is, use the `file` command:

- `file <filepath>`: describes whether the filepath is a symlink, file, or directory.

#### `wc`

The `wc` command tells us the number of words, lines, or bytes in a file.
- `wc <filename>` : outputs three numbers, where first is **number of lines**, **number of words**, and **number of bytes**.

You also have these options:
- `-l` : only outputs number of lines.
- `-w` : only outputs word count

### Reading files

You can use the `cat` command to print out the contents of a file, or have a nice time reading the file using `less`.

```bash
cat <filename> # prints out file contents to stdout
less <filename> # shows file content in dedicated reader
```

#### `cat`

Here is basic usage of the `cat` commandL

- `cat <filename>` : prints out the content of the file.
- `cat FILES...` : concatenates the contents in all the specified files and prints them all out at once.

You also have options on this command:
-  `-n` : prints out line numbers along with text

#### `less`

You have these navigation commands while in the `less` reader:

- **q** to quit
- **space bar** to go down a page
- **b** to go up a page
- `/<pattern>` to search for a pattern

You also have these options:

- `-N` : displays line numbers along with text

#### `head` and `tail`

- `head <filename>` : prints out the first 10 lines of a file
- `tail <filename>` : prints out the last 10 lines of a file
- `head -n NUMLINES FILENAME` : prints out the first numlines lines of a file.
- `tail -n NUMLINES FILENAME` : prints out the last numlines lines of a file.

### Creating folders and files

There are multiple ways to create folders and files. To make a folder, you would use the `mkdir` command:

- `mkdir -p`: the `-p` option creates all subdirectories in the directory path.

```bash
mkdir new_dir
mkdir -p new_dir/sub_dir/even_more_sub_dir
```

To create files, you would use the `touch` command or you would use redirection to a file:

```bash
touch <filename>
```

### Deleting folders and files

To delete folders and files, you use the `rm` command, and you can pair that with extra options:

```bash
rm FILENAME...
```

- `rm <filepath>` : deletes the specified file or folder permanently
- `rm -d <foldername>` : removes the empty directory
- `rm -r <foldername>` : recursively deletes the directory and its contents.
    - Pair the `-r` option with `-i` for extra safety, for the shell to prompt you for confirmation before deleting each file.
    - Pair the `-r` option with `-f` to force deletion, to skip confirmation. Obviously be careful with this.
- `rm -i <filepath>` : prompts the user for confirmation before deleting.
- `rm -f <filepath>` : skips user confirmation when deleting.

### Moving/Renaming folders and files

The `mv` command does both renaming and moving of files and directories, but the key difference is that renaming only exists when using the `mv` command on one source at a time.

- `mv <source> <destination>` : moves the specified file to the specified destination
- `mv SOURCE... DESTINATION` : moves multiple files into the same folder at once
- `mv <folder> <destination>` : moves the specified folder to the specified destination.
    - The folders and destination must exist, otherwise it just renames folders.
- `mv FOLDERS... DESTINATION` : moves multiple folders to the specified destination at once.
    - The folders and destination must exist, otherwise it just renames folders.

### Copying folders

- `cp <source> <destination>` : copies the specified file to the specified destination.
    - If destination does not exist, it will rename the copy.
- `cp SOURCE... DESTINATION` : copies multiple files at once to the same destination.
- `cp -r <folder> <destination>` : copies the directory recursively to the new destination.

## Random commands

### `sort`

the `sort <filename>` command sorts the file alphabetically and outputs it. 

> [!NOTE]
> Lowercase alphabetically comes before uppercase

Here are the options
- `-r` : reverses the output
- `-n` : numeric sort
- `-u` : sort, and output only unique values. Remove all the duplicates.

**advanced sorting**
****
advanced sorting is based on sorting by columns. You can make columns by separating text with a space. 

- `sort -n -k<num-column> <filename>` : sorts numerically by the specified column

### `tar`

The `tar` command takes in a bunch of files and folders and compresses them into a single `.tar.gz` file. 

**compressing to tar**

With the below command, you can zip an arbitrary amount of files and folders into a single tar file.

```bash
tar -zcf <tarfile_name> FILES_AND_FOLDERS...
```

- The `-z` option must be first, and it does the actual file compressions, returning a `.tar.gz` file
- The `-cf` option takes in an arbitrary number of files and folders to zip together

> [!NOTE]
> The tarfile name you pass must have a `.tar.gz` extension

**decompressing from tar**

To unzip a tar file to specific directory, you would run this command:

```bash
tar -xzf <tarfile> -C <destination-dir>
```

- `<tarfile>`: the specified `.tar.gz` file to unzip
- `<destination-dir>`: the specified empty directory to put the unzipped contents.

### text based commands

#### `tr`

The `tr` command either changes characters or deletes them. It gets its input from standard input, so it can only be used with piping or the stdin redirection operator.

- `tr <oldchar> <newchar>` : replaces the old character with the new character.
- `tr -d <char-to-delete>` : deletes the specified character.

```bash
tr a-z A-Z   # replaces all lowercase letters with uppercase letters
```

#### `sed`

#### `awk`
## Shell specific syntax

### Redirection

In linux, you have three concepts of input, output, and error:

- **Standard output** controls where the output of a command goes, like to the terminal, a file, or a printer.
- **Standard error** controls where any errors from a command goes, and you can redirect that stream to somewhere else.
- **standard input** is where a program gets the commands from.
    - By default, you type in commands through your keyboard, but it can come from a program or something else.

#### Basic redirection

**stdout redirection**
****

To redirect to standard output, you would use the `>` operator:

```bash
command > filename
```

In the above example, whatever command was run, the output would be piped into the specified file instead of standard output.

> [!NOTE]
> Basic redirection using `>` will overwrite the file each time and create it if it doesn’t exist.

If you don't want to override the file and instead just append to it, use the `>>` operator, which is the append redirection operator.

```bash
command >> filename
```

**stdin redirection**

some commands like `cat` when used without an argument look for standard input as an argument. For example, this works, where the `<` operator looks for text on the right hand side to pass as standard input to the command on the left hand side.

```
cat < things.txt
```

**stderr redirection**
****
By default, stdout redirection with `>` only redirects the output of the command, not if it errors out. If you also want to get the contents of the error and redirect that, then you must use stderr redirection, which has its own operator.

You can also redirect just the error output of a command to a file. In fact, stdout, stderr, and stdin can also be referred to by certain numbers:

- standard input - **0**, with operator `<` or `0>`
- standard output - **1**, with operator `>` or `1>`. This does not redirect standard error as well.
- standard error - **2**, with operator `2>`

In fact, all these commands work:

```bash
echo "brrruuuuh" 1> bruh.txt # redirects to stdout
```

- `command 2> filename` : redirects the error stream to the specified file.

#### Combined redirection

You can combine redirecting from stdin and redirecting to stdout to form these interesting chains:

- `command < inputfile > outputfile` : takes the output from the command applied on the input file and redirects it to the output file, overwriting the file.
- `command < inputfile >> outputfile` : takes the output from the command applied on the input file and redirects it to the output file, appending to the file.

In fact, this is what a poor man's copy would look like:

```bash
cat < things.txt > things2.txt
```

I would think of this command as these two steps happening in sequence:

1. `cat < things.txt` means that the contents of `things.txt` get redirected as stdin and sucked into the `cat` command. Think of `<` as a vacuum that sucks up the content of whatever is on the right hand side and pipes as input to the command on the left hand side.
2. Then the output of `cat < things.txt` will get redirected to the `things2.txt` file.

#### The `&>` operator

`&>` is the operator used for redirecting both standard output and error at once.

- `command &> file` : redirects both the standard output and error streams to the specified file. Overwrites the file.
- `command &>> file` : redirects both the standard output and error streams to the specified file. Appends to the file.
### Piping

Piping redirects standard input and output from one command to the other. Piping is done via the `|` character and is used to chain commands together.

#### Teeing

If you want to pipe a command to another command while also redirecting the contents to stdout, you can do so with the `tee` command. It essentially copies the stdout stream so that one copy continues in the piping chain while the other gets redirected to a file:

The `tee` command redirects standard input to both a pipe and a file.

```bash
command1 | tee <filename> | command2
```

- redirects the output of `command1` to the specified file while also piping the output to `command2` .

### Character Expansion

#### Pathname expansion

There are certain special symbols in the shell language that have programmatic meaning, like wildcards, which have special meaning when dealing with listing pathnames on the filesystem.

- `*` : matches any character for any number of characters
- `~`: matches the home directory
- `?` : matches exactly one single character

When using these special symbols in a string, there is an important difference between double quotes and single quotes:

- **double quotes**: lets the special symbols be substituted for their programmatic meaning. Escapes everything except these characters: `$`, the backtick, and the backslash `\`.
- **single quotes**: completely escapes all special symbols and treats the string as a raw string.

**ranges**
****

you can specify a range of characters to match inside brackets `[]` . Here are some basic rules:

- Within the range, you can also add a hyphen `-` for a shorthand range.
- Adding a `^` in front of the range tells to not match on that range.

And here are examples:

- `[123]` : will match 1,2,3.
- `[^123]` : will not match 1,2,3.
- `[0-9]` : matches all numbers between 0 and 9

#### Brace expansion

Brace expansion inside the `{}` will generate arbitrary strings. You can pass in a list of values or a range to the brace expansion.

- **list**: to pass in a list of values, comma-separate them - **no spaces**
- **range**: to pass in a range of values, you use the range operator for brace expansion, which is `..`.

Here are some basic examples:

```bash
echo {1,2,3} # generates 1,2,3
echo Monday{1,2,3} # generates Monday1, Monday2, Monday3
```

And you would generate a range using the `..` syntax:

```bash
{START..END}  # range from start to end
{START..END..SKIP} # range from start to end, skipping SKIP number of values
```

- `{a..z}` : matches all characters a-z
- `{a..z..2}` : matches all characters a-z but skips every other character
- `{z..a}` : matches all characters from z-a

#### arithmetic expansion
You can evaluate arithmetic expressions in the command line by wrapping it in `$(())` 
 
 - `echo $((3+5))` : returns 8

#### Command expansion

If you wrap a command in `$()`, it will output it as a string, thus `$(command)` will output the result of the command as a string.
## Dealing with processes

You can see all current processes running with `ps aux`. 

### Killing processes

You can kill any process in the foreground with `CTRL + D`, but you can also use the `kill` command to kill processes:

- `kill -9 <pid>`: ungracefully kills a process, specified by the process id
- `kill -l`: see options for the `kill` command

## Working with the shell environment

### Adding to path

A quick crash course: you can access variables with `$VARIABLE_NAME` in bash, set variables with `export VARIABLE_NAME=<value>`, and access these special things:

- `$PATH`: a list of all folders added to path
- `printenv`: prints all environment variables pairs in the shell session.

Adding to the path is as easy as this, where you separate each directory path with a colon.

```bash
PATH="path/to/folder:$PATH"
```

Then to persist changes to the path, you need to put this code in a startup profile file, like `.bashrc` for linux and `.zshrc` for mac.

### Creating the shell environment

When booting up the shell, the shell looks at different files called **startup files** for customization and lets you do the following use cases:

- Add certain files to the path
- Customize the command prompt's look and feel
- Echo certain things on shell startup

For example, the `$PS1` variable is what is displayed on the command prompt, and you can modify it for quality of life stuff like showing the date and time, displaying the current git branch, and much more.

The default PS1 variable is something like this: `WaadlPenguin@DESKTOP-IJFUEC4 MINGW64 ~` , where the command prompt reflects our username and current location. 

We can change it in the startup files.

**mac**

On mac, the default shell is **zsh**, and therefore the code will look a bit different. The two files that handle shell startup are `~/.zshrc` and `~/.zprofile`. This is how the code will look to display the current git branch on shell startup.

```zsh title="~/.zshrc"
# Function to display current git branch
git_branch() {
    branch=$(git symbolic-ref HEAD 2>/dev/null | sed -e 's|^refs/heads/||')
    if [ -n "$branch" ]; then
        echo "(%F{green}$branch%f)"  # Add color to branch name
    else
        echo "(%F{red}none%f)"  # Add color to indicate no branch
    fi
}

# Add git branch to PS1 prompt with proper zsh syntax
setopt PROMPT_SUBST  # Enable prompt substitution
PS1="${PS1}$(git_branch) "  
```

**linux**

On linux, the default shell is bash, and the startup files are in `~/.bashrc` and `~/.bash_profile`

**git bash**

On git bash, the only startup file that is respected is `~/.bash_profile`.
### Aliases

Aliases in linux are used as ways to shorten commands by pointing a made up command to other existing commands, and is great for simplifying typing and other things. 

The basic syntax is like so: using the keyword `alias` and then a key value pair:

```bash
alias alias_name='commands here'
```

Here are examples for creating aliases to reduce typing:

```bash
alias kgd='kubectl get deployment'
alias kdd='kubectl describe deployment'
alias kgp='kubectl get pod'
alias kdp='kubectl describe pod'
alias kgs='kubectl get service'
alias kds='kubectl describe service'
```

You can temporarily write aliases to the shell session by putting these aliases in a bash script that can be arbitrarily named `aliases.bash` and then running `source aliases.bash` to load that code into the shell session.

If you want aliases to persist, put them in the `.bashrc` or `.bash_profile` file.