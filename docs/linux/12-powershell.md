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

When you run a powershell command, it returns an object describing the resource.


![](https://i.imgur.com/Frt6zau.jpeg)


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

Run the `Get-Command` cmdlet to list all possible commands in powershell.

#### Process management with `Get-Service`


The `Get-Service` cmdlet returns a list of all **service** objects, where a service represents a process on the machine.

Since it returns a list of thousands of services, it's important to pipe the output of the `Get-Service` cmdlet into some filtering command.

For example, the below command lists all services with their `status` property as "stopped".

```powershell
Get-Service | Where-Object {$_.status -eq "stopped"}
```

### Important flags

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



### Object-oriented info with`Get-Member`

Since objects in powershell are based off of classes in .NET, you have a powerfull way of listing methods and properties on object isntances and then being able to use them.

For example, piping the output of a list of objects in powershell to the `Get-Member` cmdlet will list all the methods and properties on those objects:

```powershell
Get-Service | Get-Member
```
### Aliases

Powershell bridges the gap for bash developers by providing **aliases** for common bash commands and mapping them to the underlying powershell command.

For example, the alias for the bash `ls` command maps to the `Get-ChildItem` command in powershell, which is what actually lists a directory.


![](https://i.imgur.com/fY6FaG0.jpeg)

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

### Output

```powershell
Get-Service | format-list DisplayName, Status | Out-File C:\Users\amallick.ENGINEERS\Documents\temp\services.txt
```

- `Out-File`: this cmdlet accepts an output filepath to write the incoming data to.
- `Export-Csv`: this cmdlet accepts an output csv filepath to write the incoming data, forcing the data to parse as a CSV
## File-handling

### Listing directory

Use the `Get-ChildItem` command to list a directory.


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

