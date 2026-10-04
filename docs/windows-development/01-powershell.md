## Intro

PowerShell is a powerful tool for both IT professionals and developers because it offers:  
  

- **Rich scripting and automation**: It lets you automate repetitive tasks across many servers, saving time and ensuring consistency.
- **Interactive shell environment**: You can run commands interactively to manage and configure systems efficiently.
- **Object-oriented + Developer-native approach**: Everything you work with in PowerShell is treated as an object, making it intuitive and powerful, especially since it's based on the .NET framework.





### Command syntax


![](https://i.imgur.com/D2miDUg.jpeg)


- **cmdlet**: A cmdlet is a combination of a verb and a noun/resource, like `Get-Service` or `Get-Help`.
- **command**: A powershell command is a combination of a cmdlet and parameters to pass to the cmdlet.

> [!IMPORTANT]
> Powershell is **case-insensitive**

When you run a powershell command, it returns an **object**


![](https://i.imgur.com/Frt6zau.jpeg)

> [!IMPORTANT]
> When passing in parameters, you can use wildcard syntax with `*`.


![](https://i.imgur.com/ErgQtlq.jpeg)

#### Parameter types

There are two types of parameters you can pass to a cmdlet in order to make it a command:

- **positional parameters**: parameters specified without flags
- **named parameters**: parameters specified with flags or they are another way to explicitly name positional parameters

> [!IMPORTANT]
> Positional parameters always have named parameter variants, but not the other way around. 
> 
> Some named parameters cannot be positional parameters.


#### Parameter sets

In PowerShell, a parameter set is a way for a single cmdlet to support different groups of parameters for various related tasks. 

Each parameter set defines a unique combination of parameters that can be used together, ensuring only valid parameter combinations are accepted. 

- This design helps reduce errors and makes cmdlets more flexible and user-friendly. 
- For example, the Get-EventLog cmdlet uses different parameter sets to query events by log name or event ID, allowing you to perform different queries with the same command but different parameters.

#### Backticks

Backticks are used for line continuation in long commands.

```ps
# Backticks (`) for Line Continuation
Get-Process -Name `
    "notepad", `
    "powershell"
```

#### Splatting

In PowerShell, splatting is a technique that lets you group multiple parameters into a single variable (usually a hash table or array) and then pass them all at once to a cmdlet or function using the `@` symbol. 

This makes your scripts cleaner and easier to read, especially when dealing with commands that require many parameters. Instead of writing a long command line with lots of parameters, you define them upfront in a variable and then pass that variable to the command.

Instead of:

```ps
Get-Process -Name "notepad", "powershell"
```

We can just pass a hastable of those same named parameter values to the command:

```ps
# Splatting
$params = @{
    Name = "notepad"
}
Get-Process @params
```

```ps
$processParams = @{
    Name         = "notepad"
    ComputerName = "Server01"
    ErrorAction  = "SilentlyContinue"
}

Get-Process @processParams
```
### Important cmdlets

#### Getting help

The `Get-Help` cmdlet is a universal cmdlet that takes in another cmdlet as an argument and returns help information about that cmdlet:

```powershell
Get-Help <cmdlet>
```

You also have these additional options to organize how the help information comes back:

- `-examples`: returns command examples
- `-detailed`: returns detailed text information. 
- `-full`: returns all info.
- `-online`: links you to the online documentation for the command.

```ps
Get-Help Format-Table | Out-Host -Paging

# Display more information for a cmdlet
Get-Help Format-Table -Detailed
Get-Help Format-Table -Full

# Display selected parts of a cmdlet by using parameters
Get-Help Format-Table -Examples
Get-Help Format-Table -Online
Get-Help Format-Table -Parameter *
Get-Help Get-ChildItem -Parameter *
Get-Help Format-Table -Parameter GroupBy
```

##### Viewing help info on parameters of a cmdlet

For named parameters for a cmdlet you can view help info for them by following this syntax and specifying the parameter with the `-Parameter <ParameterName>` flag:

```
Get-Help Get-Process -Parameter Name
```

#### Listing commands with `Get-Command`

The `Get-Command` lists all possible commands in powershell.

```ps
Get-Command 

# returns list of all commands that start with "Write"
Get-Command Write-* 

# returns list of all commands that start with "Get"
Get-Command Get-*
```




![](https://i.imgur.com/atPe5LM.jpeg)

You have these named parameters:

- `-Verb <verb>`: the verb to filter on, like `Get`, `Remove`, etc.
- `-Noun <noun>`: the noun to filter on, like `Process`, `Service`, etc.
- `-CommandType <type>`: the command type to filter on, like `Alias` to filter down to only alias commands. Here are the different types:
	- `Cmdlet`
	- `Function`
	- `Alias`
- `-Name <name>`: the name of a certain command to find. Also the 1st positional parameter.
### Protecting against destructive commands

You have two additional flags you can add to any cmdlet that starts with `Write` or `Remove` which will help you protect against running destructive actions blindly.

- `-whatif`: performs a dry run of a command without actually executing it, just showing what would be outputted.
- `-confirm`: asks before performing the destructive action on each item in the list of objects returned by the command

#### `-whatif`

The `-whatif` flag lets you perform a dry-run of a command without actually running it, just to see what the output would be.

Normally the command below, where you're piping a list of service objects into the `Stop-Service` cmdlet, would kill every single process on your computer and force you to restart. 

```powershell
Get-Service | Stop-Service
```

But with the `-whatif` flag it lets you perform a dry run and view the output of the command without actually running it:


```powershell
Get-Service | Stop-Service -whatif
```

#### `-confirm`

The `-confirm` flag will ask you to confirm the command execution for each object the operation is being performed on.

```powershell
Get-Service | Stop-Service -confirm
```

### `ErrorAction`

`-ErrorAction` is a global flag you can set to control try/catch behavior with a single flag:

- `-ErrorAction SilentlyContinue`: don't exit 1 in case of error, just silently continue
- `-ErrorAction Stop`: exit 1 in case of error, stop command execution.


### Aliases

Powershell bridges the gap for bash developers by providing **aliases** for common bash commands and mapping them to the underlying powershell command.

For example, the alias for the bash `ls` command maps to the `Get-ChildItem` command in powershell, which is what actually lists a directory.

![](https://i.imgur.com/fY6FaG0.jpeg)

> [!WARNING]
> Use aliases sparingly, and don't use them in scripts. This is because you need powershell scripts to be as easy to understand as possible.


**creating aliases**

Here's how to create an alias:

```ps

```

**get alias**

```
Get-Alias pwd
Get-Alias -Definition pwd
```






## Variables and values

In Powershell, variables are prefixed with a `$`, and you refer to them in this syntax:

```
$variableName
```

You can set variables like so:

```
$variableName = value
```


#### Primitive variables basics


There are four different types of primitive data types you can store:

- **string**: string value represented by text within double quotes

```ps
# stores the value of "Aadil" in the `$UserName` variable.
$UserName = "Aadil"
```

- **number**: stores a numeric value, either integer or float.

```ps
$Age = 22

Write-Host "Hello, you are $Age years old"
```

- **boolean**: stores a conditional value, either `$True` for true or `$False` for false.

```
$IsActive = $True

If ($IsActive) {
	Write-Host "is active is true"
}
Else {
	Write-Host "is active is false"
}
```

- **null**: null value represented by `$Null` value.

Variables are under the hood an object instance of a certain class, and the same goes for primitive data type variables.

For example:

- **strings**: of type `String`
- **numbers**: of type `Int` or `Int32` if integer, or `Double` if floating point.
- **boolean**: of type `Boolean`

#### Object variable basics

Besides that, you also have object, hashmap, and array types:

- **object or object list**: you can store the results of commands as variables, just like you can in bash

```ps
$Processes = Get-Process

$Processes | Format-List
```

### Strings

With strings you can concatenate them using the `+` operator, which is useful for creating new strings by joining other strings and string variables:

```ps
$Name = "Aadil"
$Age = 22
$Greeting = "Hello, my name is " + $Name + " and I am $Age years old"
```

#### Escaping strings

To escape certain characters in strings, you don't use a backslash. Instead, you use a backtick:

```ps
Write-Host "`n`n loser"
```

#### `String` object

For all following notation, we will store an object instance of the `String` class (a normal string) in a `$String` variable.

Here are the properties on a string object:

- `$String.Length`: returns the length of the string

Here are the methods on a string object:

- `$String.Substring(start: Int, end: Int)`: returns a substring
- `$String.Replace(old: String, new: String)`: replace the first matching string with the new string.
- `$String.ToLower()`: return the string as lowercase
- `$String.ToUpper()`: return the string as uppercase

##### Substrings

You have multiple ways of creating a substring, which will return a slice of that string:

```ps
$String = "Hello world"

# start at 0 inclusive, end at 4 exclusive
$Hell = $String.Substring(0, 4)

# start at 6 inclusive, go to end of string
$World = $String.Substring(6)
```

#### Regex and replacement

**Testing regex**

The `-Match` option on a string variable allows you to test if a certain regex pattern or substring matches the string or not, returning a boolean value.

This is the most simple case of substring matching:

```ps
$String = "the quick brown fox"
$IsMatch = $String -Match "fox"
```


Here is an example of regex matching:

```ps
$String = "the quick brown fox"
$IsMatch = $String -Match ".o[a-z]"
```

> [!NOTE]
> The `-Like` option does the same thing.


#### Double quotes vs single quotes

- Use double quotes to allow variable expansion. 
- Use single quotes to escape everything. 


![](https://i.imgur.com/qWx2akd.jpeg)

### Numbers

In powershell, you can store number values in variables and you can also do basic arithmetic and store the result of that in a variable

```ps
$Age = 22
$FutureAge = 22 + 1

Write-Host "In $($FutureAge - $Age) years I'll be $Age years old" 
```

You have these numeric variable types:

- `Double`: floating point
- `Int`: integer

### Special variables in powershell


![](https://i.imgur.com/hMX0Lfu.jpeg)

- `$null`: represents null value
- `$Error`: stores errors from previous command stderr
- **booleans**: either `$true` or `$false`

**Boolean values**

There are two values for a boolean:

- `$True`: represents a true value
- `$False`: represents a false value

Booleans are very useful in conditionals:

```ps
$IsActive = $True

If ($IsActive) {
	Write-Host "is active is true"
}
Else {
	Write-Host "is active is false"
}
```

### Arrays

Arrays are zero-indexed and you can create them in two different ways:

- **Method 1 (deprecated) - comma-separated list**: as a comma-separated list of values and then store that in a variable.
- **Method 2 - using `@()`**: as a comma-separated list of values wrapped in `@()` and then store that in a variable.


```ps
$Fruits = "Apple", "Banana", "Orange", "Grape"
$Fruits = @("Apple", "Banana", "Orange", "Grape")

# indexed based access
$Fruits[0] 

# appending element to array
$Fruits += "Passionfruit"
```




![](https://i.imgur.com/BpCbFwx.jpeg)

#### `Array` class

Here are the properties on the underlying `Array<T>` class

- `$Array.count`: returns length

#### Adding elements

You could append elements to the array with the `+=` operator

```ps
$Fruits = "Apple", "Banana", "Orange", "Grape"
$Fruits += "Passionfruit"
```

> [!DANGER]
> The problem? `+=` is extremely inefficient because it destroys the old array to make a new one with the included element.

#### Looping over an array

You can either use `ForEach` loop:

```ps
$Fruits = "Apple", "Banana", "Orange", "Grape"

ForEach ($Element in $Fruits) {
	# use $Element as current item iteration
}
```

Or pipe the array as stdin to the `ForEach-Object` cmdlet, which takes in an iteration lambda as the positional parameter:

```ps
$Fruits | ForEach-Object { Write-Host $_.Count }
```

#### List filtering

This method of list filtering returns a new array.

1. Pipe the array to the `Where-Object` cmdlet, which takes in a lambda function.
2. In this lambda function, you have access to the `$_` variable which represents the value of the current iteration.
3. Based on the value of the current `$_` variable, return a boolean.
	- If returning `$True`, the value of the `$_` will be included in the resultant array
	- If returning `$False`, the value of the `$_` will not omitted from the resultant array

```ps
$Fruits = "Apple", "Banana", "Orange", "Grape"

$NoVitaminC = $Fruits | Where-Object {
	($_ -ne "Orange") -And ($_ -ne "Grape")
}

$NoVitaminC # Apple, Banana
```

### Hashtable

Here is how to create a hashtable/dict in powershell, which is under the hood a `HashTable` object instance.

```ps
$Grades = @{
	"Alice": 90
	"Bob": 85
}

# key/value access
$Grades["Alice"]
$Grades["Alice"] = 95
```

Key-value access is just the same as in Python, even easier.

- **retrieving values**: use `$Dict["Key"]` notation, and if the key is not in the dictionary, `null` (or nothing) is returned, not throwing an error.
- **setting values**: use `$Dict["Key"] = value` notation

Here are the properties available on the `Hashtable` object instance:

- `$Dict.Keys`: returns the string array of keys in the dict
- `$Dict.Values`: returns the array of values in the dict
- `$Dict.Count`: returns the number of key-value pairs in the dict.

#### Removing keys

Use the `$Dict.Remove(key: String)` method to remove a specific key from the hashtable:

```ps
$Grades = @{
	"Alice": 90
	"Bob": 85
}
$Grades.Remove("Alice")
```


### Variable and command interpolation

Variable interpolation within a string is very simple. Just reference the variable name:

```ps
$UserName = "Aadil"

Write-Host "Hello $UserName"
```

If you want to escape the `$`, you can do so by putting a backtick before it, like so:

```ps
$UserName = "Aadil"

Write-Host "The `$UserName variable value is $Username"
```

What if you want to interpolate a command? Well you use this syntax for command interpolation, wrapping the command in `$()`:

```
$(command)
```

Here's an example:

```ps
Write-Host "Here's a list of all process-related commands: $(Get-Command *-Process)"
```


### Variable management
#### Variable metadata

Variables are under the hood an object in powershell which come with their own properties and methods:

- `$variableName.GetType()`: returns the data type of the variable as an object.

```ps
$Age = 22

# prints: The variable 'Age' is Int32
Write-Host "The variable 'Age' is" $Age.GetType().Name
```

#### Casting

Powershell handles automatic type conversion, converting narrower types to broader types by default, like int to double, called **implicit conversion**

For cases where you need **explicit conversion**, like when converting a broad type to a narrower type, you can do so via casting by forcing conversion using type accelerators.

Here are the different type accelerators you have access to:

- `[Double]$variableName`: cast to a double
- `[Float]$variableName`: cast to a float
- `[Boolean]$variableName`: cast to a boolean
- `[Int]$variableName`: cast to an int
- `[String]$variableName`: cast to a string


```ps
$Price = "19.99"

# casts $Price to a double
$AfterTaxPrice = [Double]$Price + 1.68
```


```ps
# Ensuring the right data types for variables
[int32]$var #Displays single number e.g. 1
[float]$var #Displays number with decimal e.g. 1.2
[string]$var #Displays text value e.g. 1.2
[boolean]$var #Displays either true or false e.g. True
[datetime]$var #Displays a date e.g. "Thursday, January 2, 2020 12:00:00 AM" 
```

#### `New-Variable`, `Set-Variable`, and `Remove-Variable`

When you create a variable like so and then overwrite it's value, here's what's happening under the hood:

- **variable declaration**: The `New-Variable` cmdlet creates the variable and initializes it with a value.
- **variable setting**: The `Set-Variable` cmdlet sets a variable to another value:

```ps
# syntactic sugar for New-Variable -Name Age -Value 22
$Age = 22

# syntactic sugar for Set-Variable -Name Age -Value 23
$Age = 23
```

Here are the flags you can set on the `New-Variable` cmdlet:

- `-Name <string>`: the name of the variable
- `-Value <string>`: the value of the variable
- `-Option <option>`: setting the behavior of the variable. You have these options:
	- `Readonly`: makes it a readonly variable.
	- `Constant`: makes it a constant variable.

Here are the flags you can set on the `Set-Variable` cmdlet:

- `-Name <string>`: the name of the variable
- `-Value <string>`: the value of the variable
- `-Force`: forces a set to occur, even on readonly variables. Fails on constants.

You can delete a variable with the `Remove-Variable` cmdlet:

```
Remove-Variable <variableName>
```

Here are the options you have available:

- `-Force`: forces removal, even on readonly variables. Fails on constants.

> [!IMPORTANT]
> For all these cmdlets that work under the hood of variable management, you DO NOT refer to variables with the `$` prefix.

#### `Get-Variable`

`Get-Variable` lists all the variables in the session, and then you can further scope it down with named parameters to find specific variables
#### Readonly vs const

To create a **readonly** variable where you cannot overwrite it, you should create a variable using the `New-Variable` cmdlet and pass the `-Option Readonly` flag:

```ps
New-Variable -Name DemoReadOnly -Value "hi" -Option Readonly
```

> [!NOTE]
> Read-only variables can only be changed when you force the change with the `-Force` option on the `Set-Variable` cmdlet. 

To create a **constant** variable where you cannot mutate it or overwrite it, you should create a variable using the `New-Variable` cmdlet and pass the `-Option Constant` flag:

```ps
New-Variable -Name DemoConstant -Value "hi" -Option Constant
```

> [!NOTE]
> The main difference between constants and read-only variables is that constants can never be forcibly overwritten via the `-force` option. They can't be overwritten ever.

Here are the main differences between the two:


|                            | constant                                          | readonly                                              |
| -------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| How to create              | Run `New-Variable` cmdlet with `-Option Constant` | Run `New-Variable` cmdlet with `-Option Readonly`     |
| Can mutate/overwrite value | No                                                | Yes, with `-Force` option on `Set-Variable` cmdlet    |
| Can remove/delete          | No                                                | Yes, with `-Force` option on `Remove-Variable` cmdlet |
### Operators

#### Arithemtic operators

```ps
$Age = 2 * 3 + (10/5)
```

#### Comparison operators

- `-eq`: checks if two values are equal to each other, returns a boolean.
- `-ne`: checks if two values are NOT equal to each other, returns a boolean.
- `-gt`: checks if the first value is greater than the second value, returns a boolean.
- `-lt`: checks if the first value is less than the second value, returns a boolean.
- `-gte`: checks if the first value is greater than or equal to the second value, returns a boolean.
- `-lte`: checks if the first value is less than or equal to the second value, returns a boolean.

```ps
$Age1 = 22
$Age2 = 23

$Age1 -eq $Age2 # returns $False
$Age1 -ne $Age2 # returns $True

$Age1 -lt $Age2 # returns $True
$Age1 -gt $Age2 # returns $False
```

You also have these boolean-specific operators:

- `-And`: returns `$True` if both conditions evaluate to `$True`
- `-Or`: returns `$True` if at least one boolean evaluates to `$True`
- `-not`: returns `$True` if the operand is false or falsy.

```ps
$Age = 22

$IsYoung = $Age -lt 35
$IsRipeForPickin = $Age -gt 18

$IsFertile = $IsYoung -And $IsRipeForPickin

Write-Host "Is fertile $IsFertile"

$IsHag = -not $IsYoung
```



### Environment

#### Environment variables

Environment variables are under the `$Env` object variable, and you can access variable properties on `$Env` as if it were a Python dict by using `:` like a `.`:

```ps
Write-Host "You are on $Env:ComputerName"
```

Here are the different available environment variables:

- `$Env:ComputerName`: the name of the machine you are currently on
- `$Env:UserName`: the current username you are running powershell in.


### Scopes

In PowerShell, scopes define the visibility and lifetime of variables, functions, and modules within your session or scripts. Here are the main scopes:  

![](https://i.imgur.com/qiHsaD0.jpeg)

  

- **Global scope:** The top-level scope for the entire PowerShell session. *Variables and functions here are accessible anywhere in the session.*
	- Variables defined here are accessible anywhere—across scripts, functions, and commands—throughout the session. 
	- This is useful for sharing data widely but requires caution to avoid accidental changes that can cause bugs.
- **Local scope:** The current scope, such as inside a function or script. *Variables defined here are only accessible within that scope.*
	- This is the default scope inside functions or script blocks. 
	- Variables here are only accessible within that specific function or block, preventing interference with variables elsewhere. 
- **Script scope:** Applies to the entire script file. *Variables and functions defined here are accessible anywhere within the script but not outside it*.
	- Variables in this scope are accessible anywhere within the same script file but not outside it. 
	- This allows sharing data between functions in a script without exposing it globally, helping organize script-level data.
- **Private scope:** Used to restrict variables or functions so they are only accessible *within the current scope and not inherited by child scopes*.
	- This restricts variable access strictly to the current function or block, not even allowing child functions to access them. 
	- It's ideal for protecting variables from unintended modifications, ensuring data integrity within tightly controlled sections of code.

There are two extremely important rules to keep in mind:

1. PowerShell follows a hierarchy where inner scopes can access variables from outer scopes, but outer scopes cannot see inner scope variables. 
2. Child scopes inherit copies of parent variables, so changes in child scopes don't affect the parent unless explicitly specified with `$global:`, `$script:`, or `$private:` to override.
3. Scope precedence affects which variable value is used when names conflict, and the order is as follows from highest precendence to lowest precendence:

```
local > private > script> global
```


Here is an example of using these variables:

- **global variables**: global variables are declared with the `$global:` namespace prefix
- **script variables**: script variables are declared with the `$script:` namespace prefix
- **private variables**: private variables are declared with the `$private:` namespace prefix


```ps
$global:varGlobal = "Global"
$script:varScript = "Script"

function Test-Scope {
    $localVar = "Local"
    $private:varPrivate = "Private"
    Write-Host "Inside Function: $varGlobal, $varScript, `
    $localVar, $varPrivate"
}

Test-Scope

Write-Host "Outside Function: $varGlobal, $varScript"
```

#### Global scope

Global variables defined within a script become available in the general powershell session and are able to be accessed from any script, function, or other command that is subsequently run within the same session.

To create a global-scoped variable, create a variable under the `$global:` object namespace, like so:

1. Create the global variable within a powershell script

```ps
$global:globalVar = "global var"
```

2. After running the script, that variable is now "exported" into the current shell session

```ps
Write-Host $global:globalVar
```



![](https://i.imgur.com/EJfqNjw.jpeg)

- **pro**: useful for sharing data across functions and scripts
- **con**: can lead to unintended modifications and harder to debug
#### Local scope


![](https://i.imgur.com/PerOP3i.jpeg)


Local scope is the default of how you think variables should act, where variables defined within a block are scoped to that block and child scopes.

```ps
$localVar = "in script body"

function localScope {
	$localVar = "in function body"
	Write-Host $localVar
}
```

- **pro - better memory management**: local variables live only in the execution context for a block or function, so they get automatically deallocated once the scope completes.
#### Script scope

Script scoped variables act like global variables within the context of the script, but are not exported into the current shell session after running the script.

Script-scoped variables are namespaced under the `$script:` namespace:

```ps
$script:counter = 0

function Increment {
	$script:counter++
	Write-Host "Counter: $script:counter"
}
```



![](https://i.imgur.com/VzqDONe.jpeg)

#### Private scope

Private-scoped variables can only be accessed within the scope they are created and not any parent or child scopes.

> [!NOTE]
> The ideal use case for private scopes is for when you want to contain variable usage strictly within a function, preventing other scopes or child scopes from modifying or accessing that variable.
> 

If you want variables to be unique a function, create private variables, scoped under the `$private:` namespace

```ps
function PrivateFun {
	$private:varPrivate = "private, can't be accessed outside of function body"
}
```




![](https://i.imgur.com/qFHAOew.jpeg)
## Object-oriented powershell

### Object basics

Objects in powershell have methods and properties attached to them.

Most cmdlets in powershell return a **list** of objects, and then from that you can access certain properties and methods:

- `list.count`: returns the size of the list.

```ps
(Get-Command).count # returns 1905
```

Different objects have different properties and methods, but these two rules are consistent across all objects:

- **property access syntax**: for accessing properties on an object, just use dot-notation syntax, just like in other programming languages.
- **method syntax**: Invoke just like a method.
### Object-oriented info with`Get-Member`

Since objects in powershell are based off of classes in .NET, you have a powerfull way of listing methods and properties on object isntances and then being able to use them.

For example, piping the output of a list of objects in powershell to the `Get-Member` cmdlet will list all the methods and properties on those objects:

```powershell
Get-Service | Get-Member
```

You have different member types:

- **Properties:** These are data attributes that describe the object, like a process's ID or name.
- **Methods:** These are actions the object can perform, such as starting or stopping a process.
- **Events:** These are triggers related to the object that you can respond to.
- **Types:** This indicates the class or category the object belongs to.

#### Adding new members

You can dynamically add new members on objects like so, and you can do this for any object in powershell:

```ps
# 10. Dynamic Members of PSObjects
# Add a dynamic member to a custom object and inspect it
$obj = [PSCustomObject]@{ Name = "Dynamic"; Type = "Object" }

Add-Member -InputObject $obj `
 -MemberType NoteProperty `
 -Name "NewProperty" -Value "Value" `
 $obj | Get-Member
```


### Pipeline methods

Here are the transformation cmdlets that work as streams, meaning you can pass their output as stdin to another command down the pipeline

- `Sort-Object`: groups objects or sorts by them, accepts these flags:
	- `-Property <propertyname>`: the property to group by
- `Select-Object`: list of properties/fields in the objects to select and return.

> [!NOTE]
> When referencing properties on a cmdlet, you can use `*` to refer to all properties.

#### `Select-Object`

Here's an example of filtering down the returned properties to only `CPU` on the objects that are returned in the pipeline:

```ps
Get-Process | Select-Object CPU
```

And you can use this at any point in the pipeline, since it's a producer and consumer.


![](https://i.imgur.com/eqOOcAm.jpeg)

You can also create **computed properties** with `Select-Object` via **expressions**, which allow you to create a new *column* or *computed property* based on the properties of the object in the stream.

For example:

```ps
Get-ChildItem -Path "C:\temp" | Select-Object Name, Status, `
	@{
		# name of column
		Name="NewComputedColumn - Size in MB"
		# value to give for field in column
		Expression = { 
			[math]::Round($_.Length / 1MB, 2) 
		}
	}
```

This creates a new computed column on the data returned by `Select-Object`, calculated with the iteration lambda from the `Expression` object property.
#### `Sort-Object` and `Group-Object`

The `Sort-Object` cmdlet sorts the object by a certain property of the object in the pipeline by ascending or descending:

```ps
Get-Service | Sort-Object -Property Status -Descending
```

- `-Property <propertyName>`: the property name of the object to sort on
- `-Descending`: if applied, sorts in descending order
- `-Ascending`: if applied, sorts in ascending order


![](https://i.imgur.com/dee9Fbb.jpeg)
Here is an example of using `Group-Object`, which returns a list of objects with a `Name` and `Count` property:

- `Name`: name of the group. In the example below, the value of the `Service.Status` property will be the group name.
- `Count`: count of the group members.

```ps
# Grouping Data with Group-Object - Group services by their status
Get-Service | Group-Object Status | Select-Object Name, Count
```
#### `Where-Object`


![](https://i.imgur.com/sJ2h3OY.jpeg)

Filter streams by piping to the `Where-Object` cmdlet, which accepts an **iteration lambda** as a positional argument:

- `$_` refers to the current element/object iteration
- The lambda must return a boolean, `$True` to include the element, `$False` to omit it.

```ps
Get-Process | Where-Object { $_.CPU -gt 10 } | Select-Object CPU
```

=
### Object formatting and aggregation
#### `Format-List` and `Format-Table`

Object formatting allows you to format and transform lists of objects you get back from a powershell cmdlet:

```powershell
Get-Service | format-list DisplayName, Status
Get-Service | format-list *
Get-Service | Sort-Object -Property status | format-table DisplayName, Status
```

- `Format-List`: displays list of objects in a list format. It accepts a comma-separated list of object properties to show in the list.
- `Format-Table`: displays list of objects in a table format. It accepts a comma-separated list of object properties to show in the list.

> [!IMPORTANT]
> The important thing to understand here is that these object formatting commandlets can only come last in the pipeline, after any object filtering or transformation commandlets. 

#### `Measure-Object`

![](https://i.imgur.com/mbZElKC.jpeg)

#### `ForEach-Object`

the `ForEach-Object` cmdlet takes in an iteration lambda as the positional parameter, and then in there you can write as many lines of code as you want to interact with each object in the pipeline.

```ps
$Fruits | ForEach-Object { Write-Host $_.Count }
```

You can also use it to store mapped results, storing the result of the pipeline:

```ps
$directory = "C:\temp"

# Store the pipeline output in a variable
$largeFiles = $fileExtensions | ForEach-Object {
    Get-ChildItem -Path $directory -Filter $_ | Where-Object { $_.Length -gt 1KB }
}
```


### Output

The family of output commands completely end the pipeline, meaning that they can't pipe to any other commands; they are pure consumers.

Here are the different types of `Out-*` cmdlets:

- `Out-File <filepath>`: writes the data from the pipeline to a filepath
- `Out-GridView`: writes the data from the pipeline to a GUI table you can view, providing a hands-on way to interact, filter, and view the output of a pipeline.
- `Out-Host`:
- `Out-Null`: discards the data entirely, like echoing to `/dev/null`

#### `Out-GridView`

Grid view is another way to format objects and then display them in the powershell GUI as a table you can easily filter.

```ps
Get-Service | Out-GridView
```

### Pipelines

Pipelines in powershell are a mechanism for passing the output of one command as an input to another via the `|` character, by streaming objects from one command to another.

> [!NOTE]
> The difference is that powershell pipelines allow streaming objects as stdin and stdout, and since every primitive data type is under the hood an object, you can have any type of variable be used as stdin or stdout in a pipeline.

Based on object streaming capabilities, are two types of commands in powershell:

- **accepts pipeline input**: able to accept pipeline input, meaning it can be piped to and then consume the stream
	- Example: `Write-Host` or `Format-Table`
- **accepts pipeline input and outputs to pipeline**: can be at any point in the pipeline.  



![](https://i.imgur.com/0PCdxzD.jpeg)
Here is how pipelines work:

1. Cmdlets output data as a stream of objects
2. Objects are passed to the next cmdlet in the pipeline, which can filter, sort, or transform the stream of objects.
3. Each cmdlet processes objects as they are received.


![](https://i.imgur.com/BuZo3kY.jpeg)

Here's a complete pipeline example:

1. Loop through the `$fileExtensions` array, map it to a list of files in the `C:\temp` directory that end in the current file extension specified by `$_`, filtered further to if the file specified by `$_` is greater than 1 kilobyte.
2. From that list of filtered files, select only the name, length, and last modified time, then export that into a CSV.

```powershell
$directory = "C:\Temp"
$fileExtensions = @("*.txt", "*.csv", "*.log")
$outputFile = "C:\Temp\FilteredFiles.csv"

# Capture and export the results
$fileExtensions | ForEach-Object {
    Get-ChildItem -Path $directory -Filter $_ | Where-Object { $_.Length -gt 1KB }
} | Select-Object Name, Length, LastWriteTime | Export-Csv -Path $outputFile -NoTypeInformation

Write-Output "Filtered file list saved to $outputFile"
```
#### Input and output basics

Using the `Write-Output` cmdlet writes data to the pipeline stream which you can then use for piping to other commands as stdin.

> [!NOTE]
> The difference of `Write-Output` and `Write-Host` is that under the hood, `Write-Output` creates an object that can then be piped into other commands, will `Write-Host` ends the stream/pipeline by writing to stdout.

Here is an example showcasing the differences between the two:

![](https://i.imgur.com/OuBkFJJ.jpeg)


- `Write-Host` doesn't return anything. It just writes to stdout and accepts stdin
- `Write-Output` returns a `String` object instance which you can store in a variable.

For cmdlets like `Write-Host` which write to stdout and are pipeline consumers, not producers, you can pipe stdin to them.

Since stdin as per powershell pipelines is any object, that means you can pipe variables as stdin to `Write-Host` and similar cmdlets:

```ps
$Result = "Hello world"

$Result | Write-Host
```

```ps
$Processes = Get-Process

$Process | Select-Object ProcessName, Id
```
#### Pipeline `.take()`

During any point in the pipeline, you can use these flags to transform or filter the stream:

- `-First <n>`: returns only the first `n` objects being streamed in.

#### Common pipeline cmdlets


![](https://i.imgur.com/1dIoYAZ.jpeg)

- `Where-Object`: allows you to filter each object in the stream via a predicate and choose whether to keep it in or omit it from the pipeline
- `ForEach-Object`: allows you to execute commands on each item individually in the pipeline via iteration
- `Select-Object`: allows you to pick only certain properties from the objects in the stream, creating shallow copies with only those properties
- `Sort-Object`: organizes objects based on their properties in ascending or descending order.

**filtering and iteration**


![](https://i.imgur.com/oTbdgrM.jpeg)


```ps
Get-ChildItem -Path C:\Logs | `
    Where-Object { $_.Length -gt 100KB } | `
    ForEach-Object { \$_.FullName }
```



#### Pipeline output


```powershell
Get-Service | format-list DisplayName, Status | Out-File C:\Users\amallick.ENGINEERS\Documents\temp\services.txt
```

These commands accept stdin from pipelines and are consumers, meaning they end the pipeline, consuming it completely.


Here are the different commands you have and how to use them you pipe to them as pipeline consumers:

- `Write-Host`: writes stdin to stdout.
- `Out-File <filepath>`: this cmdlet accepts an output filepath to write the incoming data to. It has these flags:
	- `-Append`: if set, then appends to the existing file rather than overwriting it.
- `Export-Csv <filepath>`: this cmdlet accepts an output csv filepath to write the incoming data, forcing the data to parse as a CSV

#### Pipeline examples

```ps
# 5. Sort Large Files by Size
# Sort files larger than 1 MB by size in descending order
Get-ChildItem -Path C:\Temp -Recurse | `
Where-Object { \$_.Length -gt 1KB } | `
Sort-Object -Property Length -Descending | `
Select-Object Name, @{Name = "Size (MB)"; Expression = { [math]::Round(\$_.Length / 1MB, 2) }}
```

### Custom objects

#### `PSCustomObject`

A PSCustomObject in PowerShell is a flexible way to create your own structured objects with custom properties and methods. It lets you organize data neatly, like creating a table with named columns, which you can then manipulate or pass through your scripts.

The `PSCustomObject` class is the equivalent of **dataclasses** in Python. Basically, you can create an object that automatically has the methods `.equals()`, `.toString()`, etc.

```ps
$people = @(
    [PSCustomObject]@{ Name = "Alice"; Age = 25 }
    [PSCustomObject]@{ Name = "Bob"; Age = 35 }
    [PSCustomObject]@{ Name = "Charlie"; Age = 28 }
)

$people | `
    Where-Object { $_.Age -gt 30 } | `
    Select-Object Name, Age

```

> [!NOTE]
> The point of using a PS custom object as opposed to just creating a normal hash table is that a PS custom object gives you type safety and gives you property completion.

You can even nest these objects:

```ps
# 4. Create Custom Objects with Nested Properties
# Define a custom object with nested properties
$company = [PSCustomObject]@{
    Name     = "TechCorp"
    Location = [PSCustomObject]@{
        City    = "Seattle"
        Country = "USA"
    }
    Employees = 500
}

```

You can also create them in a loop using a `ForEach` loop

```ps
# Create a Report for Running Services
$services = Get-Service | Where-Object { $_.Status -eq "Running" }
$report = foreach ($service in $services) {
    [PSCustomObject]@{
        ServiceName = $service.DisplayName
        Status      = $service.Status
        StartType   = $service.StartType
    }
}

```
### Object methods

All objects have method versions of the pipeline methods

#### `.Where()` and `.Select()`

Using the **`.Where()` method** is much faster than running data through the pipeline (`| Where-Object`) because it processes the collection entirely in memory at the .NET layer rather than passing objects one by one down a pipeline stream.

Here is how you can filter the array using both the **`.Where()`** and **`.Select()`** methods, which eliminates the pipeline and backticks entirely:

```ps
$people = @(
    [PSCustomObject]@{ Name = "Alice"; Age = 25 }
    [PSCustomObject]@{ Name = "Bob"; Age = 35 }
    [PSCustomObject]@{ Name = "Charlie"; Age = 28 }
)

# Faster in-memory filtering and property selection
$filteredPeople = $people.Where({ $_.Age -gt 30 }).Select({ [PSCustomObject]@{ Name = $_.Name; Age = $_.Age } })

$filteredPeople
```
### Custom classes

#### Custom classes with splatting

If we want something more robust than splatting, we can create a custom class and then create an object instance for that and use that type-safe object instance as the params hashtable for splatting:

1. Create the custom class intended to hold named parameter values for the cmdlet you want to run

```ps
class ProcessParams {
	[string[]]$Name
}
```

2. Create an object instance from that custom class, cast it to the class type

```ps
$params = [ProcessParams]@{
	Name = @("svchost", "msedge")
}
```

3. Use it with splatting or normal named parameter passing

```ps
# named parameter passing
Get-Process -Name $params.Name

# splatting
Get-Process @params
```

## System commands and interaction

### Getting operating system info

### Process management

- `Get-Process`: returns a list of processes or a single specific process
- `Start-Process`: cmdlet to start a specific process.
- `Stop-Process`: cmdlet to stop a specific process

```ps
Get-Process
Get-Process *-Process

Start-Process notepad
Stop-Process -Name notepad
```

#### `Get-Process`

Here are the named parameters you can set:

- `-Name <name>`: gets a single process or a list of processes by a name or pattern. Also a positional parameter.
### Service management

The `Get-Service` cmdlet returns a list of all **service** objects, where a service represents a process on the machine.

Since it returns a list of thousands of services, it's important to pipe the output of the `Get-Service` cmdlet into some filtering command.

For example, the below command lists all services with their `status` property as "stopped".

```powershell
Get-Service | Where-Object {$_.status -eq "stopped"}
```

```ps
# View the methods for an object
Get-Service | Get-Member -MemberType 'Method'

# Selecting values from a PowerShell Object
Get-Service -ServiceName * | Select-Object -Property 'Status','DisplayName'

# Sorting values from Object
Get-Service -ServiceName * | Select-Object -Property 'Status','DisplayName' |
    Sort-Object -Property 'Status' -Descending
    
# Filtering the objects
Get-Service * | Select-Object -Property 'Status','DisplayName' |
Where-Object -FilterScript {$_.Status -eq 'Running' -and $_.DisplayName -like "Windows*" |
    Sort-Object -Property 'DisplayName' -Descending | Format-Table -AutoSize
```
#### Service class and methods

```ps
# Populate variable with object
$svc = Get-Service -ServiceName 'Dnscache'
$svc.Name
$svc.RequiredServices
```
### Powershell customization

#### UI customization

The `$host.UI` object represents the powershell window UI, and you can change how it looks like:

- `$host.UI.RawUI.BackgroundColor`: setting this string variable to a color changes the background color of the text prompt in powershell.
- `$host.UI.RawUI.ForegroundColor`: setting this string variable to a color changes the text color of the text prompt in powershell.


#### Powershell profile 

The powershell profile is the startup file script that runs at startup of a new powershell session.

The `$PROFILE` variable gives you the filepath to the profile file.

You can scope the powershell profile to a different scope, like the current windows user or all users on the machine.

These different scopes have different profile files locations:


![](https://i.imgur.com/sXhLMgx.jpeg)

#### Customizing prompt

The prompt text in powershell is read from the `prompt` function in the powershell profile, which you can override in the powershell profile

```ps title="~\Documents\WindowsPowerShell\Microsoft.PowerShellISE_profile.ps1"

function prompt {
	"Custom prompt> "
}
```

To reset to the current prompt, just remove the `prompt` function from the current powershell session:


```ps
Remove-Item Function:prompt
```


## Modules

A module is a collection of cmdlets, variables, functions, etc., packaged up. 

A module consists of three main components:

1. cmdlets
2. functions
3. aliases

Once a module is imported/loaded into a powershell session, you have access to use all cmdlets, functions, and aliases that come from that module.

PowerShell modules come in several main types:  
  

- **Script modules:** These bundle PowerShell scripts into reusable packages.
- **Binary modules:** These are DLL files that integrate compiled .NET assemblies for advanced functions.
- **Manifest modules:** These include metadata about the module and can combine multiple module types.
- **Dynamic modules:** These are created on the fly during a session for specific tasks.

Additionally, modules can be categorized by their source:  
  

- **Built-In modules:** Pre-installed with PowerShell for common administrative tasks.
- **Community modules:** Available from the PowerShell Gallery, contributed by the community.
- **Custom modules:** Developed within organizations for specific internal needs.
- **Personal modules:** Created by individual users to organize frequently used scripts into modules

### Installation configuration context

In PowerShell, configuration context scopes determine where modules, settings, or scripts are applied and who can access them. Here are the common scopes you’ll encounter:  
  

- **`CurrentUser`:** Applies settings or installs modules only for the logged-in user. This doesn’t require administrative rights and keeps changes isolated to that user’s environment.  
      
    
- **`LocalMachine` (`AllUsers`):** Applies system-wide, making modules or settings available to all users on the machine. This usually requires administrative privileges.  
      
    
- **`Process`:** A temporary scope limited to the current PowerShell session or process; changes here don’t persist after the session ends.
### Modules basics

```ps
# Import the members of a module into the current session
Import-Module -Name PSDiagnostics

# Import all modules specified by the module path
Get-Module -ListAvailable | Import-Module

# Import the members of several modules into the current session
$module = Get-Module -ListAvailable PSDiagnostics, Dism
Import-Module -ModuleInfo $module

# Restrict module members imported into a session
Import-Module PSDiagnostics -Function Disable-PSTrace, Enable-PSTrace
(Get-Module PSDiagnostics).ExportedCommands
```

#### List modules

Run the `Get-Module` command to see all installed modules.

You have these flags:

- `-ListAvailable`: Lists all available modules ready for download.

#### Loading and unloading modules

In PowerShell, loading modules means bringing their cmdlets, functions, variables, and aliases into your current session so you can use them. There are two main ways to load modules:  
  

- **Explicit loading:** Use the `Import-Module` cmdlet to manually load a module, like `Import-Module ActiveDirectory`. This makes all the module's features immediately available.  

```powershell
Import-Module -name applocker
```

- **Automatic loading:** PowerShell can load a module automatically the first time you run a cmdlet or function from that module, so you don't have to import it manually.

> [!NOTE]
> In PowerShell 3.0 and later, modules can even load automatically when you run a command from them, making it easier to work with a wide range of tools without manually importing each module.

When a module is no longer needed, you can unload it with `Remove-Module` to free up resources and remove from the current powershell session the aliases, cmdlets, and variables from that module.

##### `ImportModule`

Here are the available flags on the `ImportModule` cmdlet:

- `-Name`: the name of the module to load
- `-Force`: force reload the module without restarting the session
- `-Scope <scope>`: controls which scope the module will get loaded into.


##### `RemoveModule`

Here are the available flags on the `RemoveModule` cmdlet:

- `-Name`: the name of the module to unload
- `-Force`: force unload the module

#### Using commands from modules

Once you import/load a module into a powershell session, you can use all cmdlets, functions, variables, and aliases from that module.

To avoid naming ambiguity in case there are multiple loaded modules that have the same names for cmdlets, functions, and aliases, you can reduce the ambiguity with a special naming syntax:

```
<ModuleName>\<CommandName>
```

To find all the commands/functions a module exposes, you can list them with the `Get-Command` cmdlet with the `-Module` named parameter:

```bash
Get-Command -Module PSReadLine
```

### Execution policies

PowerShell execution policies control which scripts are allowed to run on your system to help protect against running untrusted code. 

- Execution policies act as a safety feature to control when scripts can run, helping prevent accidental execution of potentially malicious scripts.
- Changing execution policies requires administrator privileges for machine-wide settings; users can change policies for their own scope without admin rights.
- Windows also blocks scripts downloaded from the internet by default, showing a security warning until the file is unblocked manually.

> [!NOTE]
> You can run commands manually, it's just script execution that's blocked and that you need to change execution policies for.

Here are the four main policies:  
  

- **Restricted**: No scripts are allowed to run. This is the most secure setting and blocks all scripts, including those you create locally.
	- You can run commands, but not scripts
- **AllSigned**: Only scripts that are digitally signed by a trusted publisher can run, whether they are local or downloaded.
	- You can run commands, and scripts only if they are digitally signed.
- **RemoteSigned** (default): Locally created scripts run without restriction, but scripts downloaded from the internet must be digitally signed.
	- You can run commands and local scripts
- **Unrestricted**: All scripts can run regardless of signature. This is risky for production environments and should only be used temporarily for testing.

> [!NOTE]
> The default policy is `RemoteSigned`, balancing security and usability. 


#### Getting the current execution policy

To get the current execution policy of PowerShell, use the `Get-ExecutionPolicy` cmdlet

```powershell
Get-ExecutionPolicy
```

#### Changing the execution policy

If you encounter errors running scripts, it’s often due to these policies, and you can change them with the `Set-ExecutionPolicy` command. 

> [!WARNING]
> Just be cautious, especially with Unrestricted, to avoid security risks.


To set the current execution policy of PowerShell, use the `Set-ExecutionPolicy` cmdlet and then pass in as the argument one of the 4 available execution policies to choose from.

```powershell
Set-ExecutionPolicy restricted
```

Here are the additional flags you can set on this cmdlet:

- `-Scope`: how to scope this. accepts these values:
	- `-CurrentUser`: scope to powershell session, changing the execution policy just for this session. The advantage of this is that now you don't need to run as admin to change the execution policy.
- `-ExecutionPolicy`: specify the execution pollicy, which you use this flag instead of supplying the parameter if you are using flags.
- `-Force`: force override

```ps
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

### Custom modules

Before we can create custom modules, we have to understand module internals:

- **private functions**: private functions internal to the module, can't be used after loading a module
- **public functions**: functions exposed publicly and are accessible after loading the module.

You can create your own modules by creating `.psm1` files (stands for ps1 module files) within the **powershell modules** directory, which you can get the directory path for via the `$ENV:PSModulePath` variable.

That file will then declare functions and export them with the `Export-ModuleMember` cmdlet, allowing reuse and sharing across systems.

So here are the generic steps to create and use the custom module:

1. Inside the `$ENV:PSModulePath` directory, create a subfolder and then within that subfolder create a file named the same as that subfolder but with the `.psm1` file extension.
2. Create functions in that file.
3. Export the specific functions you want to make public by using the `Export-ModuleMember` cmdlet with the `-Function` option, which takes in an array of functions
4. Import the module via the module name

Here is how to create a custom module example:

1. Inside the `$ENV:PSModulePath` directory, create a `greetings` subdirectory (choose the name for the module)
2. Create a `greetings.psm1` file with the `.psm1` extension (module file name must be same as module directory) and then create a bunch of powershell functions

```ps title="greetings.psm1"
Function Say-Hello {
	param($Name)
	
	Write-Host "Hello, $Name"
}
```

3. If you don't want to export everything, then export the specific functions you want to make public by using the `Export-ModuleMember` cmdlet with the `-Function` option, which takes in an array of functions.
4. Import the module to use the functions from it.

```ps
Import-Module greetings
```




### Powershell gallaery

The PowerShell Gallery is a centralized online repository where you can find and download a wide variety of PowerShell resources like modules, scripts, and tools created by both Microsoft and the community. 

- It makes it easy to discover new functionality and install modules directly into your environment using commands like Install-Module and Find-Module. 
- The gallery also allows you to share your own scripts and collaborate with others, helping you extend and customize your PowerShell experience efficiently.

#### Finding third party modules

You can find third party modules available to install with the `Find-Module` cmdlet:



#### Installing third-party modules

Use the `Install-Module` cmdlet to install third-party modules.

Here is the basic syntax:

```powershell
Install-Module -Name $packagename
```

And here is how to install Azure as a third-party module:

```powershell
Install-Module -Name AzureAD -Scope CurrentUser -Force -AllowClobber
```

You have these options:

- `-Name <module-name>`: the name of the module to install
- `-Scope <scope>`: the scope to install the modules in, `CurrentUser` by default.
- `-Force`: forces installation by overwriting any existing packages without text prompts.
- `-AllowClobber`: solving naming conflicts of cmdlets, variables, etc. across different installed modules

#### Managing third-party modules

- `Get-InstalledModule`: lists all installed third-party modules
- `Update-Module`: update modules to the latest version
- `Uninstall-Module`: uninstall a third-party module

## Providers

PowerShell providers are components that let you interact with different types of data stores—like files, the Windows registry, environment variables, and certificates—using a consistent, file system-like interface. 

This means you can navigate and manage these diverse data sources with familiar commands, simplifying complex tasks by instead using commands exposed on an abstract interface.

> [!NOTE]
> Providers make it easier to automate and manage various system resources seamlessly within PowerShell, which is especially useful for scripting and backend development.

Here are some key providers:  
  

- **File System Provider:** Manages files and directories, allowing you to create, move, copy, and delete files just like navigating folders.
- **Registry Provider:** Lets you access and modify Windows registry keys and values as if they were files and folders.
- **Environment Provider:** Provides access to environment variables, so you can view or change system and user settings.
- **Certificate Provider:** Enables management of digital certificates, such as viewing, importing, and exporting certificates.
- **Active Directory Provider:** Allows direct interaction with directory objects like users and groups without extra tools.
- **Custom Providers:** You can create your own providers to manage specialized data sources like databases or APIs.

The key point of providers is that you can use the same cmdlets with all of them, since all providers follow the same unified abstract interface that they implement with their own concrete functions.

- `Get-ChildItem`: a listing function that lists all children of some item
- `New-Item`: creates a new item
- `Set-Location`: traverse to a specific node
- `Get-Location`: get the current node info


```ps
# use FileSystem provider
Get-ChildItem -Path C:\Temp
New-Item -Path "C:\Temp" -ItemType Directory
New-Item -Path "C:\Temp\temp1.txt" -ItemType File

# use EnvironmentProvider
Get-ChildItem -Path Env:
```


### FileSystem provider

#### Navigation

- `Get-Location`: return `pwd`
- `Set-Location -Path <dirpath>`: `cd` to the specified folder

#### File management

##### Listing files

```ps
Get-ChildItem -Path C:\Temp
```

- `-Path <dirpath>`: the path to the directory to use for `ls`
- `-Recurse`: recursively get all files and folders

##### Creating files

```ps
New-Item -Path "C:\Temp" -ItemType Directory
```

- `-Path <filepath>`: the filepath to create the new file in
- `-ItemType`: `Directory` to create a folder, `File` to create a file.

##### Deleting files

```ps
Remove-Item -Path "C:\Temp\node_modules" -Recurse -Force
```

- `-Path <path>`: the folder or file to remove
- `-Recurse`: same as `rm -r`
- `-Force`: same as `rm -f`

#### File content

##### Reading file content

```ps
Get-Content -Path "C:\Temp\temp1.txt"
```

- `-Path <filepath>`: the filepath to the file whose content you want to read

##### Adding file content




### Env provider


### Custom providers with PSDrive

A PSDrive in PowerShell is a special kind of provider that lets you map different data stores—like network shares, folders, or even registry keys—as drives you can navigate and manage just like a regular file system.

It is the abstraction and unified interface for all providers.


#### Additional File drives

Here's how to create a PSDrive and use it

1. Create a new PSDrive and choose the concrete provider type you want to use, like filesystem or env provider, using the `New-PSDrive` cmdlet

```ps
New-PSDrive -Name "SharedDrive" -PSProvider FileSystem -Root "C:\Temp"
```

2. View your newly created PSDrive using the `Get-PSDrive` cmdlet


```ps
Get-PSDrive -Name "SharedDrive"
```

3. Switch to the filesystem of the PSDrive you created, in order to cd into the isolated mount path filesystem:


```ps
# like you cd into C:, now you cd into SharedDrive:

Set-Location -Path SharedDrive:
```
## Powershell scripting

### Special script variables

### Scripts and environments

#### sourcing scripts

You can source scripts like so, which is called **dot-sourcing**

```ps
. $pathToPWSHScript
```

Sourcing a script runs it and then it makes all local variables and functions in the script public in the shell session.

To understand how sourcing works, it's also important to understand how it mixes with variable scopes:



### Interacting to console

- The `Write-Host` cmldet takes a string parameter and then echoes it to the string:

```ps
Write-Host "Hello World"
```


#### `Write-Host`

The `Write-Host` cmdlet writes to stdout and accepts stdin as input via powershell pipelines.

The `Write-Host` cmdlet takes in an unlimited amount of parameters of any type and then writes them to the console as strings separated by spaces:

```ps
$IsFertile = $True

Write-Host "Is fertile" $IsFertile
```

Here are the options you have available for this cmdlet:

- `-ForegroundColor <color>`: sets the text color of the output in the console.
- `-BackgroundColor <color>`: sets the background color of the text output in the console.

#### `Read-Host` and `Clear-Host`

- The `Clear-Host` command clears the screen for you
- The `Read-Host` command accepts user input, used commonly with variables, see [[#Variables and values]]

```ps
$Age = Read-Host "What's your age?"

Write-Host "Hello, you are $Age years old"
```

```
PS C:\Users\amallick.ENGINEERS> $Age = Read-Host "What's your age?"

Write-Host "Hello, you are $Age years old"
What's your age?: 22
Hello, you are 22 years old
```

#### `Write-Output`

The `Write-Output` cmdlet writes to the pipeline stdout, meaning you can store the contents of `Write-Output` in a variable or forward it along the pipeline.

#### `Write-Warning`

The `Write-Warning` cmdlet is the same thing as `Write-Host`, but different semantics.

#### `Write-Error`

The `Write-Error` cmdlet writes to stderr, creating a new error that then gets stored in the `$Error` variable.


### Conditional logic and loops

#### If/else

```ps
$IsActive = $True

If ($IsActive) {
	Write-Host "is active is true"
}
Else {
	Write-Host "is active is false"
}
```

You also have `If`, `ElseIf` and `Else`

```ps
$Choice = Read-Host "Enter a number (1-3)"

If ($Choice -eq 1) {
    Write-Host "You chose option 1"
} ElseIf ($Choice -eq 2) {
    Write-Host "You chose option 2"
} ElseIf ($Choice -eq 3) {
    Write-Host "You chose option 3"
} Else {
    Write-Host "Invalid choice"
}
```

#### Switch

```ps
$Choice = Read-Host "Enter a number (1-3)"

Switch ($Choice) {
    1 { Write-Host "You chose option 1" }
    2 { Write-Host "You chose option 2" }
    3 { Write-Host "You chose option 3" }
    Default { Write-Host "Invalid choice" }
}
```

#### For loop

```ps
For ($i=1; $i -le 10; $i++) {
	Write-Host "the value of i is $i"
}
```

#### `ForEach`

You can also use the `ForEach` loop to loop through an array or object stream in the pipeline to store the output of each iteration element to create a new mapped stream.

Use cases:

- Looping through an array and doing something in it
- Being a pipeline method able to accept and map object streams

```ps
$Processes = Get-Process

$to_show = ForEach ($Element in $Processes) {
	[PSCustomObject]@{
		Name = $Element.Name
		Id = $Element.Id
	}
}
```

#### `While` loop

```ps
$Count = 0

While ($Count -le 10) {
	# do something
	$Count++
}
```

#### `Break` and `Continue`

Within a `For` or `While` loop, you can use the `Break` or `Continue` statements, which work exactly the way you think they do.

- The **break** statement immediately exits a loop, skipping any remaining iterations and continuing with the code after the loop.
- The **continue** statement skips the rest of the current loop iteration and moves directly to the next iteration.
#### Ranges

You can create a range of numbers like so, which creates an array:

```ps
$count_to_ten = 1..10
```

Since arrays are just a stream of objects, you can use ranges as producers in the pipeline:

```ps
1..10 | ForEach-Object {
	Write-Host "on iteration $_"
}
```
### Error handling

#### `$Error` variable

The `$Error` variable is a special variable always available within a powershell session, and it is an array of error objects which stores all errors that have been thrown during the current powershell session.

On each error object, you have these properties:

- `$err.Exception`: returns the exception and message of the error thrown



#### `try/catch` and throwing errors

In a `try/catch` block, you get access to the individual error thrown through the `$_` variable within the `catch` block, which is an error object.

```ps
try {
	Get-Item -Path "C:\temp\nonexistentfile"
}
catch {
	# $_ within a catch block stores the current error.
	$_.Exception | Out-File "C:\temp\errorlog.txt"
}
```

You can throw halting errors by using the `Throw` keyword with an error message:

```ps
try {
	Throw "never try."
}
catch {
	Write-Host "hope you learned your lesson: $_"
}
```

Also, combining commands that may error with `-ErrorAction Stop` when within a `try` block helps by immediately halting execution and then jumping to the `catch` block if an error occurs:

```ps
try {
	Get-Item -Path "C:\temp\nonexistentfile" -ErrorAction Stop
	Write-Host "This never gets reached"
}
catch {
	$_.Exception | Out-File "C:\temp\errorlog.txt"
}
```

#### Powershell debugger

1. **Set a breakpoint** at a specific line in your script using `Set-PSBreakpoint -Script <path-to-script> -Line <line-number>`.
2. **Run your script** normally. When execution reaches the breakpoint, PowerShell enters debug mode and pauses.
3. In debug mode, you can **inspect variables** by typing their names to see their current values.
4. Use commands like **`S` (Step)** to execute the next line of code or **`C` (Continue)** to run until the next breakpoint.
5. To **exit debug mode**, you can close the PowerShell session, which clears breakpoints tied to that session.

### Functions

Functions let you extend PowerShell by writing your own reusable commands tailored to your needs. 

We invoke functions the same way as we do cmdlets

> [!NOTE]
> **functions vs cmdlets**
> ***
> PowerShell functions and cmdlets are similar in how you use them—they're both called like commands. However, cmdlets are built-in commands designed for specific tasks, while functions can be created by you to perform custom or more complex operations. 
> 
> - **Functions** can bundle multiple commands or logic inside them, giving you flexibility to automate tasks like calculations or processing data.
> - **cmdlets** are predefined, built-in commands.

You can create functions in powershell with the `Function` keyword, like so:

```powershell
# 1. create the function
Function add
{
  $add = [int](2+2)
  write-output "$add"
}

# 2. invoke it
```

What if you want to add parameters and return statements:

- `param($VariableName)`: when invoked within a function body, creates a parameter for the function that you can then use in the function body.
- `Return`: the `Return` statement returns something from the function that you can then use in a pipeline.
	- The **return** statement exits a function immediately, stopping any further code execution within that function and returning control to the main script.

```ps
Function Get-ProcessReport {
	# 1. define $Name as a parameter the function takes
    param($Name)

	# 2. function body
    $Process = Get-Process -Name $name -ErrorAction SilentlyContinue
	
	$Result = $null
    If ($Process) {
        $Result = $Process | Select-Object ProcessName, CPU
    } Else {
        $Result = "Process $Name not found"
    }
    
    # 3. return something
    Return $Result
}

# 4. invoke with parameter
$Result = Get-ProcessReport Notepad
```

#### Functions with parameters

There are two ways to declare functions with parameters in powershell

- **Method 1 - inline parameters in function signature**: easier to understand
- **Method 2 - declared with `param()` block**



![](https://i.imgur.com/pOkC9cC.jpeg)


When defining the parameters with the `param(...$VariableName)` function, you have two additional things you can do:

- **explicit type casting**: add type hintings to the parameter via type accelerators:

```ps
function Hello {
	# string parameter $Name
	param([string]$Name)
	
	Write-Host "Hello $Name"
}

Hello "Aadil"
Hello -Name "Aadil"
```

- **default values**: add default values for the parameter variables by assigning them a value instead of just declaring them

```ps
function Hello {
	param($Name = "Aadil")

	Write-Host "Hello $Name"
}
```

- **multiple parameters**: you can add as many parameters as you want

```ps
function Add {
	param([int]$x, [int]$y)
	
	Return $x + $y
}

function Get-EvenNumbersInRange {
	param([int]$start, [int]$end)
	
	$start..$end | Where-Object { $_ % 2 -eq 0 }
}
```

When invoking functions with parameters, you can also pass in named parameters instead of just using them positionally:


![](https://i.imgur.com/heSbOnk.jpeg)

#### Naming conventions and best practices

The best practice naming conventions for functions is as follows:

- **camelCase**: for private or helper functions
- **Pascal-Case**: for public functions


![](https://i.imgur.com/lMByAKR.jpeg)

### Best practices

Here are the best practices when creating a script:

1. **modularity**: Break large scripts into smaller components (functions, variables, classes/objects, etc.) and then source them for reusability into the main script.
2. **documentation**: use documentation that's compatible with the `Get-Help` cmdlet.
3. **error handling**: use try/catch blocks and `-ErrorAction` flag
4. **validate inputs**: validate inputs to the script and any functions
5. **avoid hard coding variable values**: accept configuration parameters or read variables from JSON.
6. **avoid running scripts as admin**: limit the damage that could be done by the script by running as a user, not as admin.

#### Modularity

Break large scripts into smaller components (functions, variables, classes/objects, etc.) and then source them for reusability into the main script.

#### Comments and documentation

On a script, you can create comment blocks that will appear when you use the `Get-Help` cmdlet on your script, which is great for documentation purposes.

```powershell
<#
This script prompts the user for a process name,
checks if it is running, and saves the result to a file.
#>

<#
.SYNOPSIS
Finds a process and saves details to a report file.

.DESCRIPTION
Prompts the user for a process name. If found, outputs
the process name and CPU usage to a text file.

.EXAMPLE
.\process_report.ps1

.NOTES
Beginner script example
#>
```
## Other commands

### `Get-Date`

The `Get-Date` cmdlet retruns the current date and time in a human readable format.

### HTTP requests

#### `Invoke-WebRequest`

This makes a fetch request and returns back a response object:

```ps
Invoke-WebRequest -Uri "https://example.com"
```

#### `Invoke-RestMethod`

```ps
$response = Invoke-RestMethod -Uri "https://typicode.com"
$customUser = [PSCustomObject]@{
    UserID = $response.id
    Name   = $response.name
    Email  = $response.email
    City   = $response.address.city
}
```

## Powershell 7 features

PowerShell 7 is designed to coexist with PowerShell 5.1 on the same system without interfering with each other. This is possible because PowerShell 7 installs into a new directory (`%programfiles%\PowerShell\7`), separate from where PowerShell 5.1 is installed. 

This setup lets you run either version independently depending on your needs. So, you can have both versions available and choose which one to use for different tasks or scripts, which is helpful when transitioning or working with different environments.  


### Pipeline parallelization

Pipeline parallelization in PowerShell 7 allows you to process multiple objects at the same time instead of one after another, which can speed up tasks that handle many items. This is done using the ForEach-Object cmdlet with the -Parallel parameter.  
  
Here's a simple example:  
  
```ps1
1..5 | ForEach-Object -Parallel { Start-Sleep -Seconds $_ "Processed item $_" }
```

In this example, numbers 1 to 5 are processed in parallel. Each item causes a sleep for that number of seconds, but because they run simultaneously, the total time is roughly the longest sleep, not the sum of all sleeps.  
  
This feature is useful when you have tasks that can run independently and you want to save time by running them concurrently.

### `Get-Error` and `ConsiseView`

- `Get-Error`: Print detailed information about the last error that occurred.
- `ConciseView`: provides a streamlined way to view errors. When enabled (it's the default view), it shows a simple single error message if the error isn't from a script. 
	- But if the error comes from a script and involves multiple issues, it displays a detailed multiline error message with a pointer to the exact line where the error happened, similar to a stack trace. 
## Powershell administration

### Check powershell version

View the value of the `$PSVersionTable` variable to see what the current powershell version is.


![](https://i.imgur.com/lmZ0wXz.jpeg)


### Powershell access levels

You can run PowerShell either as an administrator or just a normal user. 

If you're not an admin, you can't run the `Enable-PSRemoting` cmdlet to enable SSHing into other windows servers, but if you do have admin permissions, you're able to run sensitive cmdlets like that.



## Powershell ISE

The `ise` command in pwoershell gives you an IDE to write powershell scripts with intellisense on steroids.


![](https://i.imgur.com/7lRRVm7.jpeg)

When writing a powershell script, you have two choices of execution:

- **execute entire script**: press `FN + F5` to run the entire script
- **execute selection**: highlight some lines of code, and then press `FN + F8` to run only the selected lines of code

Here are the intellisense tips to keep in mind:

- **use the correct case**: Intellisense only works when you use the correct casing, like `Get-Service`.
- **use `CTRL + SPACE`**: this shortcut works exactly like VSCode to give you intellisense options directly

### SSHing into a remote windows server

You can also SSH into a remote Windows server and run PowerShell ISE on there. 

![](https://i.imgur.com/HgFnyxr.jpeg)

The shortcut to do this is `CTRL + SHIFT + R`

#### Running commands remotely

You can use RPC with powershell super simply with the `-ComputerName` flag:

```powershell
Get-Service -ComputerName mycomputer | Out-Gridview
```

### Grid View

You can view all of the properties and methods on an object easier through the **gridview** in ISE, which pulls up a GUI showcasing all of the different properties and methods of the object in detail.

To achieve this, pipe object output into the `Out-Gridview` cmdlet

```powershell
Get-Service | Out-Gridview
```

> [!NOTE]
> What makes this so useful? You have a GUI to easily view and filter properties.

If you want to filter object properties beforehand before piping the data stream to the gridview, use the `Select-Object` cmdlet to select specific properties first, then piping the output of that command to the gridview.

```powershell
Get-Service | Select-Object DisplayName, Status, ServiceType | Out-GridView
```

## Office 365 Powershell

### Installation and setup

1. Install this via powershell administrator access:

```powershell
Install-Module -Name AzureAD
```

2. See if it worked by listing all commands that are exposed on the installed module.

```
Get-Command -module AzureAD
```
## Azure Powershell

Azure integrates with powershell very well and has three types of ways to use azure in the command-line:

- **Azure powershell**: client-based shell that you install on your local machine, comes with Azure module installed to allow you to run azure commands.
- **Azure cloud shell**: Shell in the azure cloud that you can use. It comes with all commands and authentication already there.
- **Azure CLI**: a cross-platform CLI you install.

![](https://i.imgur.com/mZG4OEB.jpeg)
