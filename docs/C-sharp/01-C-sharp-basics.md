## Basics

### History

.NET started in 2001 as a windows-only runtime but has since expanded to be cross-platform with the advent of .NET core in 2014 and has since been well-maintained by Microsoft.

- **.NET**: a runtime and suite of tools and libraries used for .NET development, with a vast standard library.
- **CLR (Common Language Runtime)**: The execution environment for all .NET programs, which compile down to IL (intermediate language) and then executed by the CLR
- **NuGet**: The package manager for C# applications.

> [!NOTE]
> It's a common misconception that .NET is used only with C#. Rather, you can use other languages like Visual Basic .NET or F#, but those suck ass, so we just use C#.



### Dotnet CLI

The `dotnet` command line utility can be obtained by installing the .NET core. This utility is used to create new .NET projects, compile them, and run them.

**creating new projects**

Create new projects in c# with the `dotnet new` command.

- `dotnet new list` : lists all available templates
- `dotnet new <template>` : creates a new project

Common templates include:

- `console`: Console application
- `classlib`: Class library
- `web`: ASP.NET Core empty web app
- `webapi`: ASP.NET Core Web API
- `mvc`: ASP.NET Core Web App (Model-View-Controller)
- `blazorserver`: Blazor Server App
- `blazorwasm`: Blazor WebAssembly App
- `wpf`: Windows Presentation Foundation (WPF) Application
- `winforms`: Windows Forms Application

Here is an example of creating and naming a new console app:

```bash
dotnet new console -n MyConsoleApp
```

**running projects**

1. Compile projects with the `dotnet build` command
2. Run projects with the `dotnet run` command

### Variables

#### Basics

These are the 4 basic data types you can declare a variable as in c#.

```csharp
int age;
string name;
double salary;
bool isEmployed;
```

Here are all the useful data types:

- `int`: 32 bit integer
- `long`: 64 bit integer
- `short`: 16 bit integer
- `byte`: 8 bit unsigned integer (ranges from 0-255)
- `sbyte`: 8 bit signed integer (ranges from -128 to 127)
- `float`: 32 bit floating point
- `double`: 64 bit floating point
- `decimal`: 128 bit floating point


C# also offers two additional variable declaration keywords you can use that have different properties:

- `var`: activates inferential typing and allows you to skip explicitly declaring the data type of the variable.
- `const`: Declares the variable as an immutable constant.

**var**

You can use the `var` variable declaration to get inferential typing without explicitly 

```csharp
var name = "John";
var age = 20;
```

**const**

You can use the `const` modifier in front of any variable declaration to make it an immutable variable.

```csharp
const int MaxScore = 100;
const string CompanyName = "Acme Corp";
```

#### Object Type

All primitives and objects in C# inherit from the built-in `object` type

### Functions

Creating functions in C# works the same as in Java. Here are the things you keep in mind:

- Parameters in functions should be type annotated
- A function’s return type should be annotated, and `void` if not returning anything.

```csharp
// return type is int, two params are ints
int add(int a, int b) {
    return a + b;
}

int result = add(10, 20);
Console.WriteLine("Result: " + result);
```

**optional arguments and variadic arguments**

```csharp
void GreetUser1(string name) {
    Console.WriteLine("Hello, " + name);
}

// using optional arguments
void GreetUser2(string name = "User") {
    Console.WriteLine("Hello, " + name);
}

// passing arbitrary number of arguments
void GreetUser3(params string[] names) {
    foreach (string name in names) {
        Console.WriteLine("Hello, " + name);
    }
}

GreetUser1("John");
GreetUser2();
GreetUser3("John", "Jane", "Jim");
```

### DateTime

The DateTime class in C# is used for basic datetime operations.

Here are the static methods and properties you can access:

- `DateTime.Now`: Gets the current date and time on the local machine, returning a `DateTime` object instance.
- `DateTime.UtcNow`: Gets the current date and time in UTC, returning a `DateTime` object instance.

Here are the methods and properties you have on a `DateTime` object instance:

- `DateTime.Day`: Gets the day of the month.
- `DateTime.Month`: Gets the month of the year.
- `DateTime.Year`: Gets the year.
- `DateTime.Hour`: Gets the hour of the day.
- `DateTime.Minute`: Gets the minute of the hour.
- `DateTime.Second`: Gets the second of the minute.
- `DateTime.Millisecond`: Gets the millisecond of the second.
- `DateTime.DayOfWeek`: Gets the day of the week.
- `DateTime.DayOfYear`: Gets the day of the year.
- `DateTime.TimeOfDay`: Gets the time of day.
- `DateTime.AddDays()`: Adds a specified number of days to the date and time.
- `DateTime.AddHours()`: Adds a specified number of hours to the date and time.
- `DateTime.AddMinutes()`: Adds a specified number of minutes to the date and time.
- `DateTime.AddSeconds()`: Adds a specified number of seconds to the date and time.
- `DateTime.AddMilliseconds()`: Adds a specified number of milliseconds to the date and time.

And here are some static parsing methods on the `DateTime` class.

- `DateTime.Parse()`: Parses a string representation of a date and time into a `DateTime` object.
- `DateTime.TryParse()`: Attempts to convert a string representation of a date and time into a `DateTime` object and returns a boolean indicating whether the conversion succeeded.
- `DateTime.TryParseExact()`: Attempts to convert a string representation of a date and time into a `DateTime` object using a specified format and culture-specific format information, and returns a boolean indicating whether the conversion succeeded.
- `DateTime.TryParseExact()`: Attempts to convert a string representation of a date and time into a `DateTime` object using a specified format and culture-specific format information, and returns a boolean indicating whether the conversion succeeded.
- `DateTime.TryParseExact()`: Attempts to convert a string representation of a date and time into a `DateTime` object using a specified format and culture-specific format information, and returns a boolean indicating whether the conversion succeeded.