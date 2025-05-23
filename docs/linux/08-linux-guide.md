
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