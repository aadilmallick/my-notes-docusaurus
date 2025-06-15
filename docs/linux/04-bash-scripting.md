## Basic bash scripting

### SH files

Bash scripts are simple linux commands run one after the other in the form of a file. They are `.sh` file extensions, and you run such scripts with the `bash` command, like `bash script.sh`

```bash title="script.sh"
mkdir -p brahdir
cd brahdir
touch brah{1..10}
echo "The brah has been planted"
```

### Executable scripts

You can turn simple `.sh` files into executable scripts that you can add to bin with a **shebang**. The shebang is what allows you to turn your bash scripts into executable files and even write them in another language.

It is the first line in a script, and defines the path to the language source for the script.

Bash looks at the shebang, determines the language for that script, and uses the language-specific command associated with that language compiler path like `python` or `node` to run the script.

For example, let’s find the shebang for writing a bash script:

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


### The bash scripting essentials: linux review

#### **short circuiting operators**
****
These are the short circuiting operators in bash and linux:

- `&&`: and, which runs commands sequentially.
- `||`: or, which runs the second command only if the first one fails or is falsy.

```bash
command1 && command2 # runs command1 then command2
command1 || command2 # runs command2 only if command1 fails 
```

For example, you have the values `true` and `false` in bash, so the short circuiting operators are best paired with conditionals:

```bash
true && echo "hi" # does not run the echo
false && echo "hi" # runs the echo 
```

The true power of short circuiting comes with using the `test` command for conditional statements:

```bash
test $AGE -gt 15 && echo "yummy, fertile" # only echo if age > 15
```

#### **variables**

You can create basic variables in a bash script like so:

```bash
VARIABLE_NAME="value"
```

- There should be _no spaces_ on either side of the `=` operator. `variable=value` is correct, while `variable = value` will result in an error.
- Variable names are case-sensitive. `myVariable` is different from `myvariable`.
- Use double quotes around values where you need the spaces to be respected.

You can then interpolate the value of the variable in two ways:

- `$VARIABLE_NAME`: the most common way
- `${VARIABLE_NAME}`: this has less ambiguity and will help you not run into many bugs.

In some cases, you might need to use curly braces `{}` to explicitly delimit the variable name, especially when it's followed by other characters that could be interpreted as part of the variable name.

```bash
version="1.2.3"

# Output: The current version is 1.2.3beta
echo "The current version is ${version}beta" 

# This might not work as expected, as Bash might look for a variable named 'versionbeta'
echo "The current version is $versionbeta" 
```

> [!NOTE]
> A major point to keep in mind is that all variables are casted to be a string in bash, although you can still do arithmetic with them if they are numbers.


**getting the length of a string**

If you want to find how many characters are in a certain string/variable, use this syntax:

```bash
${#VARIABLE_NAME}
```

```bash
echo "${#PATH}"   # 1794
MYNAME="aadil"
echo "I have ${#MYNAME} characters in my name" # 5
```

**special variables**

Here are the special variables you can use in bash scripts:

- `$0` - The name of the Bash script.
- `$1 - $9` - The first 9 arguments to the Bash script. (As mentioned above.)
- `$#` - How many arguments were passed to the Bash script.
- `$@` - All the arguments supplied to the Bash script.
- `$?` - The exit status of the most recently run process.
- `$$` - The process ID of the current script.
- `$USER` - The username of the user running the script.
- `$HOSTNAME` - The hostname of the machine the script is running on.
- `$SECONDS` - The number of seconds since the script was started.
- `$RANDOM` - Returns a different random number each time is it referred to.
- `$LINENO` - Returns the current line number in the Bash script.

**math interpolation**
****
By default, all variables in bash get converted to strings. To have number variables, you need to declare numeric variables with the `let` keyword, like so:

```bash
let x=3
let y=5
let "sum = $x + $y"  # arithmetic expression must be in quotes
echo $sum
```

> [!IMPORTANT]
> If you want to have spacing in your arithmetic expression, you MUST put it in quotes.

You can also use the `expr` command to print out and evaluate an arithmetic expression, like “echo” but for math. This is commonly used with command substitution to avoid overly complicated arithmetic substitution and dealing with quotes.

```bash
let x=3
let y=5
let z=$(expr $x + $y)  # z=8 8
echo "my age is $(expr $x + $y)"  # prints out my age is 8
```

but of course, using the good-old-fashioned `$(( ))` just like in linux lets you do arithmetic substitution:

```bash
num1=10
num2=20
sum=$((num1 + num2))
echo "The sum of $num1 and $num2 is: $sum"
```

#### Incredibly important: word splitting

The most important thing to understand here is that is a difference between doing variable expansion with double quotes and without.

The `$IFS` env variable represents the three delimiters that bash respects to split strings on, which is the tab, newline, and space characters. Whenever you do variable expansion without double quotes, bash will split that string on those delimiters (if the string has those).

- `$VARIABLE` or `${VARIABLE}`: if the variable is a string with spaces, tabs, or newlines, then bash splits the string on those delimiters.
- `"$VARIABLE"` or `"${VARIABLE}"`: even if the variable is a string with spaces, tabs, or newlines, bash will NOT split the string on those delimiters.

An advanced tip is that if you want to avoid the default behavior of splitting on tabs, spaces, and newlines, you can override the `IFS` variable to some other delimiter:

```bash
IFS=":" # now will not split on spaces.
```

#### expansion

linux character expansion is indispensable for writing bash scripts. I will give you a crash course, but make sure to go [here](https://threejsnotes.netlify.app/docs/linux/linux-guide/#character-expansion) to learn more:

- `$VARIABLE_NAME`: variable expansion
- `${VARIABLE_NAME}`: also variable expansion
- `{1..6}`: creates a range of numbers
- `{1..6..2}`: creates a range of numbers skipping by 2

#### **reading user input**

The `read` command waits for user input from the command line and stores that text content in a variable. Basic usage is like so:

```bash
read VARIABLE_NAME

# you can then continue to use $VARIABLE_NAME in your code
```

Often, this is not that useful and we actually want to prompt the user something.

The `read -p <prompt> <variable>` command prints a prompt message and directs the user input into the specified variable. This way we can read user input into a variable.

```bash
read -p "Enter your name: " NAME

echo "Hello $NAME, nice to meet you!"
```

Here are all the options you have:

- `-p <prompt>`: shows a prompting message
- `-t <seconds>`: sets a timeout for the number of seconds before failing the user input.
- `-s` : silent, used for when you don’t want the user typing the text to show up, like for when entering passwords

**reading multiple variables**
****


You can also read multiple variables at a time:

```bash
read VARIABLE1 VARIABLE2 VARIABLE3
```

**reading an array**
****

Using the `-a` option, you can read a string separated by spaces as an array and save that array to a variable.

```bash
read -a ARRAY_NAME

echo "array length ${#ARRAY_NAME[*]}"
```
#### Arguments

In bash scripts, you can also get access to the command line arguments. `$1` is the variable that represents the first command line argument, and the pattern continues with with `$2` and so on.

> [!TIP]
> Best practice is to interpolate these by wrapping them in double quotes, like `"$1"`

**Special arguments**

We have special symbols to deal with an arbitrary number of command line arguments.

- **`$#` :** represents the number of command line arguments passed into the bash script
- `$@` : represents all the arguments passed into the bash script. It is an array of arguments

```bash
#!/bin/bash

echo "Number of arguments: $#"
echo "All arguments: $@"

# Loop through all arguments
echo "Loop through arguments:"
for arg in "$@"; do
  echo "$arg"
done
```

#### Conditional control flow

**the basics behind conditionals**
****
The `test` command runs a conditional test between two values and returns an exit code. The exit code is stored on the `$?` symbol, which is the symbol that stores the exit code of the last most recent command.

Here are all the flags associated with the `test` command:

**numerical flags**

- `test val1 -eq val2`: the `-eq` is the numerical equality flag and returns true if the values are equal
- `test val1 -ne val2`: the `-eq` is the numerical equality flag and and returns true if the values are not equal 
- `test val1 -gt val2`: The equivalent of the `>` operator. Returns true if val1 is greater than val2 
- `test val1 -ge val2`: The equivalent of the `>=` operator.  Returns true if val1 is greater than or equal to val2 
- `test val1 -lt val2`: The equivalent of the `<` operator.  Returns true if val1 is less than val2
- `test val1 -le val2`: The equivalent of the `<=` operator.  Returns true if val1 is less than or equal to val2

**string flags**

- `test -z string`: tests if the string is empty. Returns true if it is.
- `test -n string`: tests if the string is nonempty. Returns true if it is.

**file flags**

* `test -d file` : True if the file is a directory
* `test -e file` : True if the file exists (note that this is not particularly portable, thus `-f` is generally used)
* `test -f file` : True if the provided string is a valid existing filepath
* `test -g file` : True if the group id is set on a file
* `test -s file` : True if the file has a non-zero size
* `test -u file` : True if the user id is set on a file
* `test -r file` : True if the file is readable
* `test -w file` : True if the file is writable
* `test -x file` : True if the file is an executable

**basic if/elif/else logic**
****

Conditional statements are based on using the exact same `test` command flags and are just syntactic sugar over that.

The basic syntax for an `if` control flow block is below:

- For the `if` and `elif` statements, you always specify a test condition in square brackets, end with a semicolon, and then use the `then` keyword to introduce the code on the next line.
- For the `else` block, no condition or `then` keyword is needed.
- You end all conditional control flow with the `fi` statement.

> [!WARNING]
> All conditionals must have spaces after the brackets, otherwise they will not work.

```bash
if [ condition ]; then 
	# code
elif [ condition ]; then 
	# code 
else 
	# code 
fi
```

Here are the main rules when it comes to conditionals in bash:

- spaces in the conditional brackets MUST be respected. Otherwise you'll get an error.
- The AND operator just uses the short-circuiting `&&` symbol, and the OR operator uses the `||` operator.

```bash

NAME="aadil"

# string equality is done with = operator

if [ $NAME = "Brad" ]; then
   echo "Your name is Brad"
elif [ $NAME = "Jack" || $NAME = "Jill" ]; then  
   echo "Your name is Jack or JIll"
else 
   echo "Your name is NOT Brad or Jack or Jill. It is $NAME"
fi
```

You can do negation by placing a `!` in front of the condition in brackets:

```bash
# Check if a file does NOT exist
if [ ! -f "myfile.txt" ]; then
  echo "The file does not exist."
fi
```

**string equality**

When dealing with strings, you don't use the test flags. Rather, you use the equality operators: String equality is done with the `=` operator while numerical equality is using the `-eq` test flag.

- `=`: equality operator for strings
- `!=`: inequality operator for strings

**switch statements**
****

1. Begin a switch statement with `case <value> in` syntax, where we are going to be switching on the specified value
2. Define cases with `<value>)` syntax, where the `)` is kind of how like the `:` colons work in a normal switch statement for defining a case
3. You can then write code to execute for that on the next line. The `break` equivalent in bash is using the `;;` , which you have to put after you finish each case.
4. The catch all default case is the `*)` syntax.
5. End the switch statement with the `esac` keyword

```bash
#! /bin/bash
FIRST_ARG=$1

# begin switch statment
case $FIRST_ARG in

	# if the first command line arg == smile
	"smile")

		# echo this string
		echo "you are smiling because you have a big dick"
		# break statement
		;;

	"sad")
		echo "you are sad because you have a small dick"
		;;

	# catch all statement
	*)
		echo "i guess you didn't put any emotion 
because you already know life is nothing but pain"
		;;

# end switch statement
esac
```

#### `select` control flow

You can use the `select` keyword in bash scripts to create a built-in select menu for reading an option that a user chose.

The `select` keyword is basically an infinite switch statement that iterates over an array. You can think of it as a selector for one of the items in the array, and then you have to decide what to do with that selected item in the select block. The only way to get out of the select block is to use the `break` keyword.

The basic syntax is as follows:

```bash
select ARRAY_ITEM in $array
do
	# insert logic here to deal with $ARRAY_ITEM, break somewhere
done
```

In this example, we include the `break` keyword to break out of the perpetual loop and we also modify the select prompt which is the PS3 variable.

```bash
# A simple menu system
names=(Kyle Cartman Stan Quit)
PS3='Select character: '

select name in $names
do
	if [ $name == 'Quit' ]; then
		break
	fi
	echo Hello $name
done

echo Bye
```




#### Looping control flow

**while loop**
****
A while loop is pretty simple: you just have the same basic conditional test in square brackets, as syntactic sugar over the `test` keyword.

```bash
while [ condition ]
do
	# code
done
```

And here's a full example

```bash
#! /bin/bash
NUM_TO_GUESS=$(($RANDOM % 10 + 1))
GUESSED_NUM=0

echo "guess a number between 1 and 10"

while [ $NUM_TO_GUESS -ne $GUESSED_NUM ]
do
	read -p "your guess: " GUESSED_NUM
done

echo "correct guess"
```

**for loop**
****

A for loop doesn't have a conditional and thus looks very similar to other languages. The for-loop is always element-wise and is thus best paired with looping through an array, but you can also use brace expansion to loop through a set of numbers, thus making it index-based:

```bash
for i in {1..6}
	do
		echo "${i}"
	done
```

For the range, you also have some alternative syntax:

```bash
for ((num = 1; num <= 5; num++))
	do
		echo $num
	done
```

#### Arrays

Arrays in bash are just the values from a space-separated string. 

```bash
friends_arr="friend1 friend2 friend3"
```

You can create arrays in bash like so, where entries are separated by spaces, not commas, and you can wrap multi-word strings in single quotes. Parentheses are syntactic sugar over the quote array syntax.

```bash
arrayName=(val1 val2 val3)
```



**Array basics**
****

Access array values with the `${}` syntax, like `${arrayname[0]}` for index-based access.

- Use the `*` or `@` operator for the index to refer to the whole array
- Use the `#` operator as a prefix to say that you want the length, and join it like so: `${#arrayname[*]}` to get the length of the specified array.
- Use the `!` operator as a prefix to get the index of the specified value(s), like so to get the list of indices of the array: `${!arrayname[*]}`

```bash
#! /bin/bash

friends=(Will Matt "Seanny-D" Keegan)
echo my first friend is ${friends[0]}

for friend in ${friends[*]}
	do
		echo friend: "${friend}"
	done

echo "I have ${#friends[*]} friends"
```

> [!NOTE]
> Whenever you index from an array or reference it in its entirety, bash is converting the array back to a string behind the scenes so it works normally with all commands.

In short, let's summarize:

- `${array[0]}`: gets the first value of the array
- `${array[*]}`: gets all values of the array
- `${#array[*]}`: gets the length of the array
- `${array[@]}`: gets all values of the array
- `${#array[@]}`: gets the length of the array.
-  `${!arrayname[*]}`: gets the list of indices of the array
-  `${!arrayname[@]}`: gets the list of indices of the array

> [!NOTE]
> if you try to access an index or range out of bounds of the array length, then you won't get an error. rather, you'll just get an empty string for those position(s).

**negative indexing**

You have the ability to do negative indexing on arrays to start from the end.

```bash
echo ${arr[-1]}
```

**slicing syntax**

You even have slicing syntax, which includes the start index and excludes the end index. If you omit the end index, it includes the rest of the array in the slice.

```bash
${arr[@]:<start-index>:<end-index>}
```

You can then use it like so:

```bash
years=(2016 2021 2022 2024 2025)
echo ${years[@]:1:4} # get the worst years of my life
```

**adding and deleting elements**

To append items or concat an array to the end of another array, you can use the `+=` operator:

```bash
years=(2016 2017 2018)
years+=(2019 2020)
```

To delete an item from an array, you can use the `unset` command. 

```bash
unset arr[1]
```

> [!WARNING]
> Beware, however, that indices do not automatically shift when you use `unset` to delete an element. Thus if you want to delete elements, it's more preferred to use something like declarative arrays where numerical indices don't matter and are just treated like strings.


**Piping to arrays**
****

Using command substitution, you can actually get the result of a command like `ls` and store that in an array. This is incredibly powerful.

```bash
# 1. store the result of listing all text files in cwd
FILES=$(ls *.txt)
NEW="new"

# 2. loop through to access each file name
for FILE in $FILES  
  do
   echo "Renaming $FILE to new-$FILE"
   # 3. rename the file
   mv $FILE $NEW-$FILE
	done
```

**reading to arrays**
****
If you want to read a file and store its contents in an array, you would use the `readarray` command, which reads from stdin. To do this, you often need to use process substitution to convert a file's contents into stdin.

```bash
# these are equivalent:

readarray my_array < my_file.txt
readarray my_array < <(cat my_file.txt)
```

Here are some useful options:

- `-t`: This option removes the trailing newline from each line read into the array. Without this flag, each line would retain its newline character.
- `-s N`: This skips the first N lines of input. 
- `-n N`: This limits the number of lines read to N. 

```bash
readarray -s 1 my_array < my_file.txt # skips 1st line

readarray -n 5 my_array < my_file.txt # reads frist 5 lines
```

There is a different way to read in strings with newline characters as an array of strings:

The basic syntax is like so:

```bash
arr=($STRING_WITH_NEWLINES)
```

```bash
ENV_NAMES=$(cut -d '=' -f 1 .env)
ENV_VALUES=$(cut -d '=' -f 2 .env)

# create arrays from the strings
arr_names=($ENV_NAMES)
arr_values=($ENV_VALUES)

for ((i = 0; i < ${#arr_names[@]}; i++))
do
    echo "first value is ${arr_names[i]} and second value is ${arr_values[i]}"
done
```

**declarative arrays: dictionaries**

tHe concept of dictionaries in bash is much like in python, except these are really just a special type of array called **declarative arrays**. In declarative arrays, indices are treated as strings rather than numbers which makes them dictionary-like.

You can create a declarative array like so:

```bash
declare -A <arr-name>
```

You can then index them and use them like a dictionary:

```bash
# 1. create declarative array called "userdata"
declare -A userdata 

# 2. set key-value
userdata[username]="aadil" 

# 3. get value from key
echo ${userdata[username]}

# 4. get all values, like Object.values()
echo ${userdata[@]}

# 5. get all keys, like Object.keys()
echo ${!userdata[@]}
```

Here is the syntax for all important operations:

- `arr[key]`: accesses the value under the specified key
- `${userdata[@]}`: accesses the list of all values in the array
- `${!userdata[@]}`: accesses the list of all keys/indices in the array

#### Functions

**intro to functions**

You write functions in bash the exact same way you do in JavaScript. The only difference is that you don’t specify arguments. Instead you have as many implicit parameters as you want, in the form of `$1` and `$2`.

```bash
function greet() {
  echo "Hello, I am $1 and I am $2"
}

greet "Brad" "36"  # pass in arguments
```

You don’t really have a useful `return` statement in bash. If you want to return actual values from a function, then just output the value and use command substitution to save that output to a global variable.

```bash

function printname () {
	name="jack"
	echo $name   # "return" variable by outputting it
}

NAME="$(printname)" # get "return" value via command substitution
```

**local vs global scope functions**

WHen using variables with the same name as a global variable inside functions, you risk overwriting those variables since bash does not have scope by default. Instead, you can specify a variable in a function to be a local variable by using the the `local` keyword in front of it.

```bash

name="aadil"

function printname () {
	local name="jack"
	echo $name
}

localname="$(printname)"
echo "local variable is $localname"
echo "global variable is $name"
```

> [!IMPORTANT]
> Incredibly important to understand - bash has no concept of global and local scope. Thus you risk overwriting the values of global variables even when inside nested blocks of code like control flow and functions.

**go deeper into scope**

The only true concept of scope in bash is the idea of using `export` command to let variables live outside of their process and get exported into the shell environment.

Variables that are defined without the `export` command are local to the current shell. They are not available to child processes. Environment variables, on the other hand, are available to all child processes.

```bash
my_local_variable="local_value"
export MY_ENVIRONMENT_VARIABLE="environment_value"

bash # Start a new subshell

echo "Local variable: $my_local_variable" # Output: (empty string)
echo "Environment variable: $MY_ENVIRONMENT_VARIABLE" # Output: environment_value

exit # Exit the subshell
```

### Piping to bash files

Right now, bash scripts only work with reading CLI arguments or reading from a file. If you want them to work in piping and redirection chains, you first need to understand how the stdin, stdout, and stderr streams actually work. 

Those three streams are just files, obfuscated away and temporarily holding the output of the most recent commands. Here are all the true filepath locations of the streams:

- **STDIN** - `/dev/stdin` or `/proc/self/fd/0`
- **STDOUT** - `/dev/stdout` or `/proc/self/fd/1`
- **STDERR** - `/dev/stderr` or `/proc/self/fd/2`

Thus to access the stdin, stdout, and stderr streams, we would just access those file contents.

```bash
cat /dev/stdin | cut -d' ' -f 2,3 | sort
```

We can access stdin programmatically through the `cat /dev/stdin` command, which will make our program work in piping chains.
## Windows Batch Files

Windows batch files are a way of scripting for powershell instead of bash. The best part is, we don't even need to write powershell. All we have to do is call other files from within the batch file.

But why even use batch files? Well, just by pressing the `windows + R` keyboard shortcut you're able to run any batch file that lives on your path in the system environment variables.

- For example, a batch file named `yttrimmer.bat` that lives in a folder added to the PATH will be able to be run by typing `windows + R` and then typing in `yttrimmer` and then hitting enter.



