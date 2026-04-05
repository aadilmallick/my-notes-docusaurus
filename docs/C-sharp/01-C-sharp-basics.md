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
- `bool`: boolean
- `char`: single character, defined with single quotes
- `string`: string, defined with double quotes.


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

All primitives and objects in C# inherit from the built-in `object` type, which means every data type is technically an `object` type.

This gives you an escape route from static typing and allows you to set a variable to a different data type than it was initialized as, because `object` is the broadest, least strict type possible.

```csharp
object thisWillChange = 3;
thisWillChange = "hello" // completely valid.
```


#### Value vs Reference Types

- **Value types** (like int, bool) are passed by copy and have default values (e.g., int defaults to 0)
- **reference types** (like objects and classes) are passed by reference and have different memory allocation characteristics.

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

### Built-in data structures

#### Arrays

There are two ways to instantiate an array

Here is how to instantiate a typed array in C#:

```csharp
int[] myIntArray = new int[3];
myIntArray[0] = 1;
myIntArray[1] = 2;
myIntArray[2] = 3;
```

Here are properties and methods on arrays:

- `arr.Length` : gets the length of an array

Here is a cheatsheet:

```csharp
int[] arr = { 1, 2, 3, 4, 5 };
// Array properties
Console.WriteLine($"Length: {arr.Length}");
Console.WriteLine($"Rank: {arr.Rank}");
Console.WriteLine($"First index: {arr.GetLowerBound(0)}");
Console.WriteLine($"Last index: {arr.GetUpperBound(0)}");

// Array access helpers
Console.WriteLine($"First item: {arr[0]}");
arr[0] = 99;

// Search
int firstIndex = Array.IndexOf(arr, 3);
int lastIndex = Array.LastIndexOf(arr, 3);
bool hasFour = Array.Exists(arr, x => x == 4);
int firstGreaterThanTwo = Array.Find(arr, x => x > 2);
int[] evenItems = Array.FindAll(arr, x => x % 2 == 0);

// Transform
Array.Sort(arr);
Array.Reverse(arr);

// Copy and clear
int[] copy = new int[arr.Length];
Array.Copy(arr, copy, arr.Length);
Array.Clear(copy, 0, copy.Length);

// Quick cheat sheet:
// Length        -> number of elements
// Rank          -> number of dimensions
// GetLowerBound -> smallest valid index
// GetUpperBound -> largest valid index
// IndexOf       -> first matching index
// LastIndexOf   -> last matching index
// Exists        -> predicate check
// Find          -> first matching item
// FindAll       -> all matching items
// Sort          -> ascending order
// Reverse       -> reverse order
// Copy          -> duplicate values
// Clear         -> reset values
```

#### Tuples

Tuples in C# act exactly like objects in JavaScript. There are two ways to create tuples:

**method 1: unnamed tuples**

You can create tuples like in Python, but property access is based on the `tuple.Item<n>` syntax, where `n` refers the `n`th element in the tuple, starting at 1.

```csharp
var myTuple = (42, "Hello", true);
Console.WriteLine(myTuple.Item1); // Output: 42
Console.WriteLine(myTuple.Item2); // Output: Hello
Console.WriteLine(myTuple.Item3); // Output: true
```



**method 2: named tuples**

You can declare them inside parenthesis, with `key: value` comma-separated pairs, which is the better way of doing it.

```csharp
var personInfo = (Age: 30, Name: "Alice", IsEmployed: true);
Console.WriteLine(personInfo.Age); // Output: 30
Console.WriteLine(personInfo.Name); // Output: Alice
Console.WriteLine(personInfo.IsEmployed); // Output: true
```

You can also deconstruct tuples like so, just like JavaScript object destructuring

```csharp
var (age, name, isEmployed) = personInfo;
Console.WriteLine(age); // Output: 30
Console.WriteLine(name); // Output: Alice
Console.WriteLine(isEmployed); // Output: true
```

Here is an example of a function that returns a tuple:

```csharp
public (int, string) GetPerson()
{
    return (25, "Bob");
}

var (age, name) = GetPerson();
```

#### Enums

Enums are a way to create semantic constants. There are two ways to create enums:

**method 1: autogeneration**

Let the enum values be autogenerated incrementing integers, starting at 0:

```csharp
enum EmployeeType
{
    Manager,
    Supervisor,
    Worker
}
```

**method 2: explicit setting**

You can also explicitly set the enum values:

```csharp
enum EmployeeType
{
    Manager = 1,
    Supervisor = 2,
    Worker = 10 //note the values don't have to be sequential, but I try to make them sequential as much as possible
}
```

### Strings

#### String Basics

Strings in C# have a few important properties:

- They are Unicode.
- They are immutable.
- They are reference types, but are treated like value types when used. (e.g. when passed to a method, a copy is made).

You define a standard string in double quotes.

#### Escape Characters


- Adding a double quote within a string requires the use of the escape character `\"`: `string myString = "He said \"Hello\" to me.";`
- Adding a backslash within a string requires the use of the escape character `\\`: `string myString = "The path is C:\\Program Files\\MyApp";`
- Adding a newline within a string requires the use of the escape character `\n`: `string myString = "Hello\nWorld!";`
- Adding a tab within a string requires the use of the escape character `\t`: `string myString = "Hello\tWorld!";`

#### Multiline strings

You can define a multiline string using three double quotes, which also lets you use characters like `"`, `'`, or `\` verbatim in the string without having to escape those characters, and also escape sequences like `\n` or `\t` will not be respected (they will be outputted verbatim)


#### String interpolation

You can interpolate strings just like in Python by prefixing a string with the `$` character, and then interpolating with `{}` curly braces:

```csharp
string name = "Alice";
string greeting = $"Hello, {name}!";
```

#### String methods and properties

Here are the static string methods you can use

- `String.IsNullOrEmpty(str)`: Checks if a string is null or empty.
- `String.IsNullOrWhiteSpace(str)`: Checks if a string is null, empty, or consists only of white-space characters (like space or tab).

Here are the string methods that live on the `String` object instances:

- **`str.Length`**: Get the number of characters in a string.
- **`str.String.Join()`**: Concatenate elements of an array into a single string.
- **`str.ToLower() / ToUpper()`**: Convert strings to lowercase or uppercase.
- **`str.Contains()`**: Check if a string contains a specified substring.
- **`str.StartsWith() / EndsWith()`**: Determine if a string starts or ends with a specific substring.
- **`str.Trim() / TrimStart() / TrimEnd()`**: Remove whitespace from the start, end, or both ends of a string.
- **`str.Substring()`**: Extract a substring from a string.
- **`str.IndexOf() / LastIndexOf()`**: Find the position of a substring within a string.
- **`str.Replace()`**: Replace occurrences of a substring with another substring.
- **`str.Split()`**: Split a string into an array of substrings based on a delimiter.

Here are the static string properties/constants:

- `String.Empty`: represents the empty string `""`.

#### String builder

THe `StringBuilder` class is more efficient than simple concatenation with the `+`, and works great when concatenating in loops:

```csharp
StringBuilder sb = new StringBuilder();

for (int i = 0; i < 1000; i++)
{
    sb.Append(i);
}

Console.WriteLine(sb.ToString());
```

#### String equality

To compare equality between strings, use these symbols/methods:

- `==`: Checks if two strings are the same.
- `!=`: Checks if two strings are different.
- `Equals()`: Checks if two strings are the same.

To do case-insensitive equality checking, specify `StringComparison.OrdinalIgnoreCase` as the boolean flag to enable case-insensitive equality checking when using the `String.equals()` static method

```csharp
string str1 = "Hello";
string str2 = "hello";
bool areEqual = String.Equals(str1, str2, StringComparison.OrdinalIgnoreCase)
```

### Control Flow

#### Switch Statements

This is a standard `switch` statement.


> [!IMPORTANT]
> In C#, fall-through cases are not allowed. At the end of each `case` body, you must exit the case with a `break` statement.


```csharp
int day = 3;
switch (day)
{
    case 1:
        Console.WriteLine("Monday");
        break;
    case 2:
        Console.WriteLine("Tuesday");
        break;
    case 3:
        Console.WriteLine("Wednesday");
        break;
    case 4:
        Console.WriteLine("Thursday");
        break;
    case 5:
        Console.WriteLine("Friday");
        break;
    case 6:
        Console.WriteLine("Saturday");
        break; 
    case 7:
        Console.WriteLine("Sunday");
        break;
    default:
        Console.WriteLine("Invalid day.");
        break;
}
```

C# also offers syntactic sugar over the switch statement, leading to a less cumbersome version:

```csharp
int day = 3;
string dayName = day switch
{
    1 => "Monday",
    2 => "Tuesday",
    3 => "Wednesday",
    4 => "Thursday",
    5 => "Friday",
    6 => "Saturday",
    7 => "Sunday",
    _ => "Invalid day"
};
Console.WriteLine(dayName);
```

#### For loop

```csharp
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}
```

#### **foreach loop**

The `foreach` loop allows you to loop element-wise through some iterable collection.

```csharp
foreach (var item in collection)
{
    // code block to be executed
}
```

#### **try/catch**

Nuff said.

```csharp
try
{
    // Code that may throw an exception
}
catch (Exception ex)
{
    // Code to handle the exception
}
finally
{
    // Code that always executes
}
```

You can create custom exceptions by inheriting from the `Exception` base class:

```csharp
public class MyCustomException : Exception
{
    public MyCustomException(string message) : base(message)
    {
    }
}
```

#### **pattern matching**

Pattern matching is syntactic sugar to check the data type of an object and create a local variable copy of it, type casted automatically.

Pattern matching is done with the `is` boolean operator.

There are three types of pattern matching:

**type pattern matching**

Control flow that checks whether a variable is of a specific data type of not, and if it is, then treat it like that data type (casts it) into a new local variable.


```csharp
object value = "Hello, World!";

// if value is string, create copy str = value and cast it as string
if (value is string str) {
    Console.WriteLine($"The value is a string: {str}");
}

else {
    Console.WriteLine("The value is not a string.");
}
```

```csharp
var num = 10;

// if num is an int, then store a copy of it in new local var integer.
if (num is int integer) {
    Console.WriteLine(integer);
}
```

**value pattern matching**

You can use the `is` keyword as a standard boolean operator for simpler conditional statements, as syntactic sugar over `==` and multiple conditional statements. 

> [!NOTE]
> This skips creating the local variable type casted copy.

```csharp
int number = 42;

if (number is 42) {
    Console.WriteLine("The number is 42.");
}

else {
    Console.WriteLine("The number is not 42.");
}
```


```csharp
int number = 42;
if (number is >= 0 and <= 100)
{
    Console.WriteLine("The number is between 0 and 100.");
}
```

**logical pattern matching**

Local pattern matching is a combination of value pattern matching and type pattern matching, allowing you to create both a local type-casted variable copy and do value pattern matching:

```csharp
object value = "Hello, World!";
if (value is string str && str.Length > 5) {
    Console.WriteLine("The string is longer than 5 characters.");
}
else {
    Console.WriteLine("The string is not longer than 5 characters.");
}
```


> [!NOTE] 
> This is essentially just syntactic sugar over multiple if-else statements.


```csharp
string str = "Hello, World!";

if (str is string newstr && newstr.StartsWith("Hello"))
{
    Console.WriteLine($"The string is: {newstr}");
}
```

#### **short circuiting**

The short circuiting operators here work the same as in in JS: `||` for **or** and `&&` for **and**.