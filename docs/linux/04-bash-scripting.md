## Basic bash scripting

### SH files

Bash scripts are simple linux commands run one after the other in the form of a file. They are `.sh` file extensions, and you run such scripts with the `bash` command, like `bash script.sh`

```bash file="script.sh"
mkdir -p brahdir
cd brahdir
touch brah{1..10}
echo "The brah has been planted"
```

### Executable scripts

You can turn simple `.sh` files into executable scripts that you can add to bin with a **shebang**

The shebang is what allows you to turn your bash scripts into executable files and even write them in another language.

It is the first line in a script, and defines the path to the language source for the script.

Bash looks at the shebang, determines the language for that script, and uses the language-specific command associated with that language compiler path like `python` or `node` to run the script.

For example, let’s find the shebang for writing a bash script

1. Use `which bash` to find the location of the `bash` command on your laptop. You should get back `/usr/bin/bash`
2. Type `#! /usr/bin/bash` as the first line of your script to register this as a bash language script
3. Rename your file to have no file extensions.
4. Make the script executable by doing `chmod 777 <scriptname>`

Here is an example:

```sh
#!/bin/bash

TEXTFILES="$(ls *.txt)"
for FILE in $TEXTFILES
        do
                wc -w $FILE | cat
        done
```