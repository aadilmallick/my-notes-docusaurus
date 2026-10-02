## Intro

PowerShell is a powerful tool for both IT professionals and developers because it offers:  
  

- **Rich scripting and automation**: It lets you automate repetitive tasks across many servers, saving time and ensuring consistency.
- **Interactive shell environment**: You can run commands interactively to manage and configure systems efficiently.
- **Object-oriented + Developer-native approach**: Everything you work with in PowerShell is treated as an object, making it intuitive and powerful, especially since it's based on the .NET framework.





### Command syntax


![](https://i.imgur.com/D2miDUg.jpeg)


- **cmdlet**: A cmdlet is a combination of a verb and a noun/resource, like `Get-Service` or `Get-Help`.
- **command**: A powershell command is a combination of a cmdlet and parameters to pass to the cmdlet.

There are 4 verbs: `GET`, `Write`, `Remove`

> [!IMPORTANT]
> Powershell is **case-insensitive**

When you run a powershell command, it returns an object describing the resource.


![](https://i.imgur.com/Frt6zau.jpeg)

> [!IMPORTANT]
> When passing in parameters, you can use wildcard syntax with `*`.

### Piping

The pipe operator `|` works the exact same way it does in bash, piping output from one command as input to another command.

```powershell
get-service | out-file c:\services.txt
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

#### Listing commands with `Get-Command`

- `Get-Command`: all possible commands in powershell.

```ps
Get-Command 

# returns list of all commands that start with "Write"
Get-Command Write-* 

# returns list of all commands that start with "Get"
Get-Command Get-*
```
#### Interacting to console

- The `Write-Host` cmldet takes a string parameter and then echoes it to the string:

```ps
Write-Host "Hello World"
```

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

You can create functions in powershell with the `function` keyword, like so:

1. Type the `function <functionname>` syntax in the powershell console. 
2. Then hit enter to start writing the function body, doing `shift + enter` to go into a new line.

```powershell
function add
{
  $add = [int](2+2)
  write-output "$add"
}
```



### Output

```powershell
Get-Service | format-list DisplayName, Status | Out-File C:\Users\amallick.ENGINEERS\Documents\temp\services.txt
```

- `Out-File`: this cmdlet accepts an output filepath to write the incoming data to.
- `Export-Csv`: this cmdlet accepts an output csv filepath to write the incoming data, forcing the data to parse as a CSV

## Variables and values

In Powershell, variables are prefixed with a `$`, and you refer to them in this syntax:

```
$variableName
```

You can set variables like so:

```
$variableName = value
```


There are three different types of primitive data types you can store:

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

Besides that, you also have object, hashmap, and array types:

- **object or object list**: you can store the results of commands as variables, just like you can in bash

```ps
$Processes = Get-Process

$Processes | Format-List
```

### Primitive data types

Variables are under the hood an object instance of a certain class, and the same goes for primitive data type variables.

For example:

- **strings**: of type `String`
- **numbers**: of type `Int` or `Int32` if integer, or `Double` if floating point.
- **boolean**: of type `Boolean`
#### Strings

With strings you can concatenate them using the `+` operator, which is useful for creating new strings by joining other strings and string variables:

```ps
$Name = "Aadil"
$Age = 22
$Greeting = "Hello, my name is " + $Name + " and I am $Age years old"
```

#### Numbers

In powershell, you can store number values in variables and you can also do basic arithmetic and store the result of that in a variable

```ps
$Age = 22
$FutureAge = 22 + 1

Write-Host "In $($FutureAge - $Age) years I'll be $Age years old" 
```

You have these numeric variable types:

- `Double`: floating point
- `Int`: integer

#### Booleans

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

### Variable metadata

Variables are under the hood an object in powershell which come with their own properties and methods:

- `$variableName.GetType()`: returns the data type of the variable as an object.

```ps
$Age = 22

# prints: The variable 'Age' is Int32
Write-Host "The variable 'Age' is" $Age.GetType().Name
```

### Casting

You can cast variables to another data type like so:

```ps
$Price = "19.99"

# casts $Price to a double
$AfterTaxPrice = [Double]$Price + 1.68
```

Here are the main primitive data types you can do for casting:

- `[Double]$variableName`: cast to a double
- `[Int]$variableName`: cast to an int
- `[String]$variableName`: cast to a string

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

### `New-Variable`, `Set-Variable`, and `Remove-Variable`

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

```ps
$Age = 22

$IsYoung = $Age -lt 35
$IsRipeForPickin = $Age -gt 18

$IsFertile = $IsYoung -And $IsRipeForPickin

Write-Host "Is fertile $IsFertile"
```



### Environment variables

Environment variables are under the `$Env` object variable, and you can access variable properties on `$Env` as if it were a Python dict by using `:` like a `.`:

```ps
Write-Host "You are on $Env:ComputerName"
```

Here are the different available environment variables:

- `$Env:ComputerName`: the name of the machine you are currently on
- `$Env:UserName`: the current username you are running powershell in.


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

### Object formatting

Object formatting allows you to format and transform lists of objects you get back from a powershell cmdlet:

```powershell
Get-Service | format-list DisplayName, Status
Get-Service | format-list *
Get-Service | Sort-Object -Property status | format-table DisplayName, Status
```

Here are the different cmdlets you can use to format the data you get back and perform transformations on, and then write the data to stdout, finishing the stream:

- `Format-List`: displays list of objects in a list format. It accepts a comma-separated list of object properties to show in the list.
- `Format-Table`: displays list of objects in a table format. It accepts a comma-separated list of object properties to show in the list.

Here are the transformation cmdlets that work as streams, meaning you can pass their output as stdin to another command.

- `Sort-Object`: groups objects or sorts by them, accepts these flags:
	- `-Property <propertyname>`: the property to group by

> [!NOTE]
> When referencing properties on a cmdlet, you can use `*` to refer to all properties.

#### `Format-List` and `Format-Table`
#### `Sort-Object`

## System commands

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


### Service management

- `Get-Service`: returns a list of system services

The `Get-Service` cmdlet returns a list of all **service** objects, where a service represents a process on the machine.

Since it returns a list of thousands of services, it's important to pipe the output of the `Get-Service` cmdlet into some filtering command.

For example, the below command lists all services with their `status` property as "stopped".

```powershell
Get-Service | Where-Object {$_.status -eq "stopped"}
```




## Other commands

### `Get-Date`

The `Get-Date` cmdlet retruns the current date and time in a human readable format.

## Modules

A module is a collection of cmdlets for a particular function or application.

A PowerShell module is essentially a package that contains a collection of related cmdlets (commands) designed for a specific function or technology. 

- For example, there are modules for VMware, Citrix, Azure, and Office 365, each providing commands tailored to manage those environments. 
- Modules help organize and extend PowerShell's capabilities, allowing you to easily access and run commands related to particular tasks

### Modules basics

#### List modules

To list all available modules, run the `Get-Module` command:

```powershell
Get-Module -ListAvailable
```
#### Import module manually

In PowerShell 3.0 and later, modules can even load automatically when you run a command from them, making it easier to work with a wide range of tools without manually importing each module.

However, the syntax is still there if you want to manually import/load a module using the `Import-Module` cmdlet

```powershell
Import-Module -name applocker
```

### Installating third-party modules

Use the `Install-Module` cmdlet to install third-party modules.

Here is the basic syntax:

```powershell
Install-Module -Name $packagename
```

And here is how to install Azure as a third-party module:

```powershell
Install-Module -Name AzureAD
```
### Execution policies

PowerShell execution policies control which scripts are allowed to run on your system to help protect against running untrusted code. Here are the four main policies:  
  

- **Restricted**: No scripts are allowed to run. This is the most secure setting and blocks all scripts, including those you create locally.
- **AllSigned**: Only scripts that are digitally signed by a trusted publisher can run, whether they are local or downloaded.
- **RemoteSigned** (default): Locally created scripts run without restriction, but scripts downloaded from the internet must be digitally signed.
- **Unrestricted**: All scripts can run regardless of signature. This is risky for production environments and should only be used temporarily for testing.

> [!NOTE]
> The default policy is `RemoteSigned`, balancing security and usability. 

If you encounter errors running scripts, it’s often due to these policies, and you can change them with the `Set-ExecutionPolicy` command. 

> [!WARNING]
> Just be cautious, especially with Unrestricted, to avoid security risks.

#### Getting the execution policy

To get the current execution policy of PowerShell, use the `Get-ExecutionPolicy` cmdlet

```powershell
Get-ExecutionPolicy
```

#### Setting the execution policy

To set the current execution policy of PowerShell, use the `Set-ExecutionPolicy` cmdlet and then pass in as the argument one of the 4 available execution policies to choose from.

```powershell
Set-ExecutionPolicy restricted
```

## Powershell scripting

### Conditional logic

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
