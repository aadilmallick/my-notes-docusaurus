
## Keyboard shortcuts

- `CTRL + A `– takes you to the beginning of the line
- `CTRL + E` – takes you to the end of the line
- `CTRL + K` – delete (yank) everything after the cursor
- `CTRL + U` – delete (yank) everything before the cursor
- `CTRL + Y` - "paste" everything you yanked (paste in quotes because it doesn't actually go into your system clipboard, only your bash clipboard).
- `CTRL + L` - clear the screen
- `CTRL + R` – reverse search through history
- `CTRL + D` - exit bash shell



## Editors

### Nano

To open up a file in the nano code editor, just use the `nano` command:

```bash
nano <filename>
```

Here are some keyboard shortcuts that nano provides:

- **ctrl + g :** to see all possible shortcuts and get help
- **alt :** undo last action
### Vim

To open vim, run the `vim <textfile.txt>` command to open up a specific command in vim.

To quit vim, first get into **command mode** by hitting `esc` twice, and then type and run `:q`. To quit no matter what, run `:q!` .

Vim has two modes: insert (typing text) and edit (for commands) mode. Here is how to get to them:

- **insert mode:** press `i` to enter insert mode
- **edit mode:** press `esc` to enter edit mode

Basic commands:

- `esc` : toggles between typing mode and command mode. In typing mode you can make changes to your text file. In command mode you can type vim commands
- `:q` : quit vim
- `:w` : save file
- `:wq` : save and exit
- `:qa!` : quit no matter what.

#### Navigating a file

- **Arrow keys** - move the cursor around
- **j, k, h, l** - move the cursor down, up, left and right (similar to the arrow keys)
- **^ (caret)** - move cursor to beginning of current line
- **$** - move cursor to end of the current line
- **nG** - move to the **n**th line (eg 5G moves to 5th line)
- **G** - move to the last line
- **w** - move to the beginning of the next word
- **nw** - move forward n word (eg 2w moves two words forwards)
- **b** - move to the beginning of the previous word
- **nb** - move back n word
- **{** - move backward one paragraph
- **}** - move forward one paragraph

#### Text editing

Here are commands that you have while in command mode that let you edit text quickly:

- `:d100`: deletes the next 100 lines. Obviously, you can change the number like `:d50` to delete 50 lines.
- `x` - delete a single character
- `nx` - delete n characters (eg 5x deletes five characters)
- `dd` - delete the current line

#### Important commands

- `set nu`: turns on line numbers for a file
- `u`: undo last action
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

You also have these commands to get file size info

- `df -h` : displays the disk usage information for the laptop
- `du -h <folder>` : displays the disk usage info for the specified folder

To parse the basename of a file, you can use the `basename` command:

The `basename <file>` command gets back only the filename (including extension) from a filepath. You can add these options to further customize the command:

- `--suffix=SUFFIX` : if specified, removes the suffix from the basename, like a file extension name like `.sh`.

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

### `tar`

The `tar` command takes in a bunch of files and folders and compresses them into a single `.tar.gz` file. 

**compressing to tar**

With the below command, you can zip an arbitrary amount of files and folders into a single tar file.

```bash
tar -zcf <tarfile_name> FILES_AND_FOLDERS...
```

- `-z`: does the actual file compressions with the GZIP algorithm, returning a `.tar.gz` file
- `-cf`: takes in an arbitrary number of files and folders to zip together
- `-v`: verbose mode

> [!NOTE]
> The tarfile name you pass must have a `.tar.gz` extension

**decompressing from tar**

To unzip a tar file to specific directory, you would run this command using the `-x` option to extract from a tarball.

```bash
tar -xzf <tarfile> -C <destination-dir>
```

- `<tarfile>`: the specified `.tar.gz` file to unzip
- `<destination-dir>`: the specified empty directory to put the unzipped contents.

**listing files in a tar ball**

The `-t` option is used to sneak peek inside the tarball and list all files living inside it:

```bash
tar -tf <tarball>
```

### `zip`

- `zip -r <zip-file-name> <folder>` : zips the folder you want into a zip file with the specified file name.
- `unzip <zip-file>` : unzips the zip file into the current directory.
### `wget`

The `wget` command downloads the contents of an online url and saves it to your local filesystem as a file. The syntax is as follows:

```bash
wget <url>
```

You also have some useful options here:

- `-pk` : downloads an entire website to work offline by downloading all assets and turning them into local assets in a folder.

### `curl`

`curl` is like `wget` in that it downloads content from the internet, but instead of putting it into a file, it simply outputs it into the console. This makes it compatible with things like piping, redirection, etc.

Basic usage is like so:

```bash
curl <url>
```

 To write the response from the url to the specified file, you would use the `-o` option.

```bash
curl <url> -o <file>
```

**redirects**

By default, curl won’t follow any redirects if you fetch an old url and the website is trying to redirect you to the new page.

To manually make curl follow redirects, pass the `-L` option to it.

**HTTP verbs**

By using the `-X <VERB>` syntax, you can use different HTTP verbs with the url you’re requesting, like so:

```bash
curl -X POST <url>
```

You can then send request bodies with the `-d <data>` syntax, where data is a string.

```bash
curl -X POST -d "this is the post body" <url>
```

**cookies**

The `-b` option allows you to create cookies with `-b "key=value"` type of synax. You can reuse this option several times to add several cookies.
    
```bash
curl -X POST -b "I_am_going_to_die_a_virgin=true" <url>
```


**headers**

The `-H` option specifies a single header to attach to the request. You can reuse this option multiple times to attach multiple headers.

```bash
curl -H "Content-type: application/json"
	 -H "Authorization: Bearer pleasegodwhyamisoalone"
```


### `date`

The `date` command prints out the current date, but there are some useful modifiers you should know:

- `date %s`: prints out number of seconds since Jan 1st, 1970
### text based commands

#### `sort`

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



#### `wc`

The `wc` command tells us the number of words, lines, or bytes in a file or text content from stdin

- `wc <filename>` : outputs three numbers, where first is **number of lines**, **number of words**, and **number of bytes**.

You also have these options:
- `-l` : only outputs number of lines.
- `-w` : only outputs word count

#### `nl`

The `nl` command is used to number lines of a file or text content from stdin.

- `nl <file>` : numbers each line, outputs the file
- `nl -s <text>` : The `-s` command handles a number suffix. outputs the file with line numbers, but puts the specified text after each number.
- `nl -w <padding>` : The `-w` command adds a specified number of spaces before line numbers.

#### `uniq`

The `uniq <file>` command displays only unique lines of text.

#### `tr`

The `tr` command either changes characters or deletes them. It gets its input from standard input, so it can only be used with piping or the stdin redirection operator.

- `tr <oldchar> <newchar>` : replaces the old character with the new character.
- `tr -d <char-to-delete>` : deletes the specified character.

```bash
tr a-z A-Z   # replaces all lowercase letters with uppercase letters
```

#### `sed`

The `sed` command uses regex to substitute text in a file or string. The basic use is like so:

```bash
sed 's/oldtext/newtext/g' example.txt
```

You essentially have 4 components in the “sed string” you have to pass in, each separated by a forwards slash:

- `s` : use sed for substitution
- `oldtext` : the text to replace, or a regex pattern to match
- `newtext` : the text or regex pattern to replace the oldtext with
- `g` : any regex flags, like g for global

#### `awk`

AWK allows you to split text into an array and then print out the specific parts you want. The `awk -F<separator>` command basically splits the string on a specific separator. Then you can do a `{print $1}` to print the first part of the string resulting from the split.

```bash
FILETOCOPY="$1"
echo $FILETOCOPY

# gets back something like dummy.txt, and returns dummy
F_BASENAME="$(basename ${FILETOCOPY} | awk -F. '{print $1}')"
# extracts the extension name
EXTNAME="${FILETOCOPY##*.}"
NEWFILE="${F_BASENAME}-$(date -I).${EXTNAME}"
echo "copying to $NEWFILE"
cp $FILETOCOPY $NEWFILE
echo 'done copying'
```

#### `cut`

The `cut` command is used to extract a substring from each line of text. We can use the cut command either on a file or piping from standard in. We can use it two ways:

**susbtrings**

The `-c <range>` option allows us to specify an indexed range from which to extract the substring.

The below example extracts the 2nd-9th characters of each line (indexing starts at 1).

```bash
cut -c 2-9 <file>
```

**splitting and extracting**

We can split on a delimiter using the `-d <delimiter>` option and then use the `--fields=<FIELDS_LIST>` to select the specified numbered fields to return back. The default delimiter is the tab character.

```bash
cut -d ' ' --fields=2 people.txt
```

The above example splits the text on spaces, and returns the 2nd group after the split for each line of text.

#### `grep`

The grep command is used for text-searching based on regex. Here is the basic usage, although any text content can be piped to it:

```bash
grep <pattern> <filename>
```

**basic options**

Here are some basic options you have with grep:
- `-i` : case insensitive
- `-w` : only matches full words instead of substrings.
- `-c` : returns the count of the number of matches
- `-A <num-lines>` : for each occurrence, outputs a specified number of lines after the occurrence for context.
- `-B <num-lines>` : for each occurrence, outputs a specified number of lines before the occurrence for context.
- `-C <num-lines>` : for each occurrence, outputs a specified number of lines before and after for context.
- `-n` : given line numbers

**recursive search**

 Using the `-r` option with grep searches rescursively throughout the entire folder for occurrences of the pattern, checking all subfolders and subfiles.

```bash
grep -r <pattern> <folder>
```

**grep with regex**

When passing in a pattern to grep, you can also just pass in regex by putting the pattern in single quotes `''` , which forces grep to treat the pattern as regex.

However, the `grep` command only provides basic regex functionality, and is actually very limited. Characters like the `+` , `?` , `(` and `)` lose all their meaning.

To go into **extended regex mode** which gives you the full pwoer of all regex symbols at your disposal, use the `-E` option with grep:

```bash
grep -E <pattern> <filename>
```

- `-E` : enables extended regex syntax.
- `-o`: returns only what the regular expression matches

**egrep**

`egrep` is an extension of the grep tool that has extended regex functionality built in.

```bash
egrep <regex> <file>
egrep 'or|is|go' mysampledata.txt
```

> [!IMPORTANT]
> Keep in mind the regex portion should be in single quotes to escape any metacharacters.


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

- standard input - **0**, with operator `<` or `0<`
- standard output - **1**, with operator `>` or `1>`. This does not redirect standard error as well.
- standard error - **2**, with operator `2>`

You also have the appending operators for both the stdout and stderr streams:

- **append to stderr**: `2>>`
- **append to stdout**: `1>>`

In fact, all these commands work:

```bash
echo "brrruuuuh" 1> bruh.txt # redirects to stdout
echodod "bruh" 2>> errorlog.txt # appends to stderr
```

- `command 2> filename` : redirects the error stream to the specified file.
- `command 2>> filename` : appends the error stream to the specified file.

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

**redirecting stdout and stderr**



#### The `&>` operator

`&>` is the operator used for redirecting both standard output and error at once. It is syntactic sugar over this sort of code:

```bash
ls -l video.mpg blah.foo > myoutput.log 2>&1
```

Obviously, this syntax is neater

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

#### `xargs`

The `xargs` command is used to bundle output into input for commands that don’t usually accept standard input. For example, using `xargs` you can pip to commands like `ls` , which don’t accept standard input.

Here are some examples

- `find -name "*pen15*" | xargs ls` : finds all files with “pen15” somewhere in them and runs `ls` on the output.
- `echo hello world | xargs mkdir` : gets the strings “hello” and “world” and makes folders with their names.


### Meta characters

**metacharacters**

Metacharacters in bash shells are special characters that have meaning and do stuff in the bash shell.

- `;` : command separator
- `*` : wildcard for any amount of characters
- `?` : wildcard for a single character
- `$` : used to evaluate variables
- `$?`: prints the exit code of the most recently-run command.
- `\` : used to escape metacharacters
- `&` : makes any preceding commands run in the background.

**quoting**

- **double quotes:** Allows metacharacters to be used. If you want to use metacharacters as actual text, you will need to escape them with a backslash.
- **single quotes:** Escapes everything literally.
### Character Expansion

There are certain special symbols in the shell language that have programmatic meaning, and have different behaviors in these types:

- **pathname expansion**: symbols related to pathnames, like `*`, `~`.
- **brace expansion**: string generation within curly brace `{...}`
- **arithmetic expansion**: doing math inside of `$(( ))` and getting the result as a string redirected to stdin
- **command expansion**: evaluates a command inside of `$()` and returns its output as a string redirected to stdin.
- **variable expansion**: interpolates an environment or user variables with the `$VARIABLE_NAME` syntax.

When using these special symbols in a string, there is an important difference between double quotes and single quotes:

- **double quotes**: lets the special symbols be substituted for their programmatic meaning. Escapes everything except these characters: `$`, the backtick, and the backslash `\`.
- **single quotes**: completely escapes all special symbols and treats the string as a raw string.

#### Pathname expansion

There are certain special symbols in the shell language that have programmatic meaning, like wildcards, which have special meaning when dealing with listing pathnames on the filesystem.

- `*` : matches any character for any number of characters
- `~`: matches the home directory
- `?` : matches exactly one single character

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

```bash
touch "$(date)".txt # Thu Jun  5 09:51:09 EDT 2025.txt
```
## Dealing with processes

You can see all current processes running with the `ps` command. You can see all **background processes** running with the `jobs` command:

- `ps`: lists all currently running processes along with their pid (process identifier)
- `jobs`: lists all currently running background processes
- `jobs -l`: lists all currently running background processes along with their PID.  


### How to run background processes

By putting an `&` after a command, it makes that command run in the background. 

- For example, `sleep 10 &` will make the `sleep` command run in the background, which you can check by using the `ps` command to check all running processes.

However, using the `&` to put the job in the background will not print out the stdout, so if you want to, you can redirect to stdout in the background.

- For example, `echo "bruuuhh" > bruh.txt &` will run the command redirection in the background.

You can check current background jobs running with the `jobs` command, and then based on the index of the background job, you can toggle between running that process in the foreground or background.

- `bg <index>`: brings the specified job back to the background
- `fg <index>`: brings the specified background job to the foreground 

> [!TIP ]
> You can use the `CTRL + Z` shortcut to exit out of the foreground of a process and let it run in the background. This command does not straight up cancel the process.

### Killing processes

You can kill any process in the foreground with `CTRL + D`, but you can also use the `kill` command to kill processes:

- `kill -9 <pid>`: ungracefully kills a process, specified by the process id
- `kill -l`: see options for the `kill` command


## Permissions

Unix and Unix-like operating systems allow multiple users to access their computer with their own accounts, files, etc. Multiple users can actually be logged in at the same time.

Here are the main rules of the permissions:
- One user cannot view the files of another user.
- If something is shared across all users, like the root directory, then every user can access it.
- Some files are special and cannot be accessed.

By default on linux, you don't run on root user, and for good reason. Here are the dangerous things the root user can do:

- Modify, delete, change, and execute all files and folders that are owned either by `root` or any other user.
- Install packages, change users, delete other users.

These things are obviously dangerous, so we can't be the root user. Imagine we unconsciously or impulsively delete our filesystem? By leveraging the **principle of least power**, we can instead get temporary, intentional access through the `sudo` command:

```bash
sudo <command>
```

The `sudo` keyword runs any command as the root user, requiring you to enter the root user password to authenticate yourself.
### File permissions

You can see file permissions, which are described by the 10 characters you get when you use `ls -l` .

![](https://i.imgur.com/CECOCTT.png)

- The first character describes the file type.
    - `-` : normal file
    - `d` : folder
- The other nine characters relate to permissions for the file owner, group owner, and the rest of the world.
- Three characters are devoted to each category of owner. Group, and world. These are the read permission. The write permission, and the execute permission in order respectively.
    - `r` for read permission granted, `-` if not granted.
    - `w` for write permission granted, `-` if not granted.
    - `x` for execute permission granted, `-` if not granted.

Let's go into the different modes:

![](https://i.imgur.com/AwXgv4v.png)

**read mode**

- If a file is in read mode, that means that it can be read.
- If a directory is in read mode, that means its contents can be listed.

**write mode**

If a file is in write mode, you can write to the file.

If a folder is in write mode, the directory’s contents can be modified but only if the folder is also in executable mode. If a directory is not in write mode, you can’t add or remove files. But if the individual files are in write mode, you can modify them.

**execute mode**

- If a file is in executable mode, it can be treated as a program to be executed.
- If a folder is in executable mode, it can be “cd”ed into.

### Changing permissions with `chmod`

The `chmod <mode> <filepath>`  command changes the specified mode of the file or folder.

The mode is a three character combination that decides to which organization to set permissions for, whether to add or remove a permission, and which permission to remove or add.

- **1st character**: `g` for group, `u` for user/owner, `o` for others/world, and `a` for all of the above, like everyone.
- **2nd character**: `+` to add a permission, `-` to remove a permission, `=` to add a permission and remove all other permissions.
- **3rd character**: `r` for read, `w` for write, `x` for execute

You can also refer to the permission level via octal syntax:

![](https://i.imgur.com/EbGkY4a.png)

### User permissions

There are two widely-used commands that you can use to get info about the current user:

- `whoami` : returns the current user’s username
- `id` : returns the users id

You also have these tricks when it comes to permissions.

- To see the permissions of all the directories and files, you can use `ls -l`.
- You can see all the registered users on your linux system by running `cat /etc/passwd` to see the contents of the `/etc/passwd` file.

#### Adding new users and groups

- `sudo useradd <username>` : creates a new user
- `sudo <username> passwd` : creates a new password for the user
- `sudo usermod -aG sudo <username>` : adds the user to the sudo group, meaning you can now do any root commands by prefixing `sudo`
    - The `-a` commands `--append`, or append
    - The `-G` command means `--group` , or append to groups when paired with `-a`

You can add groups with these commands:

- `groups` : shows all the groups that the currently logged in user is a part of.
- `groups <username>` : shows all the groups that the specified user is a part of.
- `addgroup <groupname>` : creates a new group with the specified name.
- `adduser USER GROUP` : adds the specified user to the specified group.

#### Changing ownership

The `chown` command changes ownership of a file to the specified user, but you might have to have to use the `sudo` command to override if you get permission denied errors.

```bash
chown <username>:<groupname> <file-or-folder> 
```

There are also three simple ways to change ownership of a file or folder for just the user:

- `chown :<GROUP> <file>` : changes the group ownership of the specified file or file(s) to the specified group.
- `chown <USER> <file>` : changes the ownership of the specified file or file(s) to the specified user.
- `chown <USER>:<GROUP> <file>` : changes the ownership of the specified file(s) for both the user and the group.

## Working with the shell environment

### Environment variables

A quick crash course: you can access variables with `$VARIABLE_NAME` in bash, set variables with `export VARIABLE_NAME=<value>`, and access these special things:

You can set environment variables using the `export` command. This makes the variable available to all subsequent commands and scripts executed in the current shell and its child processes.

You have access to these two commands to view a list of environment variables:

- `printenv`: prints all environment variables pairs in the shell session.
- `env`: also shows all env variables.

### Adding to path

- `$PATH`: a list of all folders added to path

Adding to the path is as easy as this, where you separate each directory path with a colon.


```bash
expoprt PATH="path/to/folder:$PATH"
```

Then to persist changes to the path, you need to put this code in a startup profile file, like `.bashrc` for linux and `.zshrc` for mac.

### Sourcing

The `source` command basically loads in a bash script and runs it in the context of a shell session. You can use this to restart your `~/.zshrc`, load in new variables, and other stuff/

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


## SSH

For any virtual computer you want to connect to, make sure it has an `authorized_keys` file living in the `~/.ssh` directory.

This will be where you store all your public keys, and then when sshing, you will connect using the private key pair that matches up with one of those public keys.

**creating ssh keys**
****
You can create public and private key pairs using this command:

```bash
ssh-keygen -t rsa # creates a RSA-encrypted key in the ~/ .ssh directory
```

### SFTP

**SFTP** stands for secure file transfer protocol, which is a way of transferring files form your host computer to a virtual machine. By default when you set up ssh, you also set up an sftp connection between your host machine and the virtual machine.

Run `sftp <user>@<ip-address>` to connect to the virtual machine using the SFTP protocol, similar to ssh. This brings up an **SFTP shell** you can use to run file transfer related commands.

You can exit the `sftp` shell by typing `bye` command.

#### SFTP commands

When working with the sftp shell, you have to constantly context switch between your local shell and the remote shell. In the SSH remote shell, you're dealing with a remote filesystem, while you're also still in the local filesystem on your host machine. SFTP solves this problems with prefixing local commands with an `l` or an `!` - both work:

- **remote commands**: commands that will run on the remote shell will NOT have a prefix. For example, `ls` will list all files remotely.
- **local commands**: commands that will run on the local shell will be prefixed with `l` for local or `!`. For example, `lls` will list all files locally and `!ls` will do the same.

However, the `l` prefix only works for certain commands. In most cases, you just want to use the `!` prefix, which escapes to the local shell.

- You can run commands on your local computer by prefixing all your commands with a `!`, like `!cat dog.txt`
- You can also prefix commands with `l` to run the local version, like `lls` to run `ls` locally.

Just to solidify the concepts:

- `pwd` : prints the current directory on the remote machine
- `lpwd` : prints the current directory on your local machine
- `ls` : ls for remote
- `lls` : ls for local

#### `put`

The `put` command is used to move files over from your local machine to the remote machine.

You have two examples: one where you simply move the file over to the corresponding equivalent path on the remote machine, and another where you can specify a remote filepath to transfer the file to.

```bash
put <local-file-path>
```

```bash
put <local-file-path> <remote-file-path>
```

Here are some examples:

```bash
put file.txt # transfers file.txt from local to remote
put file.txt newfile.txt # transfers file.txt from local to remote, renames it
```
#### `get`

You can use the opposite of the `put` command, which is `get` to download files from the remote vm onto your machine. It syntactically works the same way as `put`.

```bash
get <remote-file-path>
```

```bash
get <remote-file-path> <local-file-path>
```


## Cron

Cron jobs run on a schedule and allow you to run command line tasks and run programs based on a schedule. 

Here is where you can go to for getting cron syntax correct:

```embed
title: "Crontab.guru - The cron schedule expression generator"
image: "https://og.cronitor.io/api/blog?title=*%20*%20*%20*%20*%20%0ACrontab%20Guru"
description: "An easy to use editor for crontab schedules."
url: "https://crontab.guru/"
favicon: ""
aspectRatio: "52.5"
```

You can add cronjobs to a crontab file by editing it with the `crontab` command

```bash
crontab -e
```

You can list all active cronjobs with the `-l` option:

```bash
crontab -l
```

> [!NOTE]
> There are also special cron files that already have hardcoded intervals: You can specify commands to run in the `/etc/cron.daily` , `/etc/cron.weekly`, `/etc/cron.monthly`, `/etc/cron.hourly` files. However, this may only be on ubuntu distros.

### Cron job syntax

The basic cron syntax is based on 5 numbers, like so:

![](https://i.imgur.com/6bzzVde.png)

- **1st number**: represents the minute number at which to run, from 0 to 59
- **2nd number**: represents the hour number at which to run in military time, from 0-23
- **3rd number**: represents the day number at which to run, from 1-31
- **4th number**: represents the month number at which to run, from 1-12
- **5th number**: represents the day of the week which to run, from 0-6, starting with 0 as sunday.

The main issue with the cronjob syntax is that it only runs at specific hard-coded times and not at an interval, but there is also special syntax that lets you specify intervallic jobs:

- `*`: signifies "every" or "at all"
- `-`: use this to signify a range of values, like 1-4.
- `,`: use this to signify a list of values, like 5,6
- `*/`: use this to signify a step values and therefore intervals, like `*/5`

Here are some useful examples:

```bash
* * * * * <command> # runs command every minute
0 * * * * <command> # runs command every hear on the dot, like 3:00, 4:00
*/5 * * * * <command> # runs command every 5 minutes
0 7 * * 1-5 # runs a job at 7:00 am every weekday

```

### Running cron jobs

Cron jobs do not have the ability to print to stdout, so if they fail, the fail silently. The best practice is to redirect all stdout from a cron job into a file and also redirect stderr into a file.