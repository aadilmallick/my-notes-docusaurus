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
- **reference types** (like objects and classes) are passed by reference, where the pointer to certain obejct properties is what is stored in memory.

Here is a list of the common value and reference types:


| Data Type             | Type      |
| --------------------- | --------- |
| `string`              | reference |
| `object`              | reference |
| `int`, `double`, etc. | value     |
| `char`                | value     |
| `bool`                | value     |
| `null`                | reference |


Here are the main differences between value and reference types:

**Value Types:**

- Stored on the stack.
- Faster access - direct memory allocation
- Automatic memory management - collected by the runtime when out of scope

**Reference Types:**

- Stored on the heap.
- Slower access - indirect memory allocation. Reference typed variables, technically speaking, are pointers to the object's location in memory.
- Cleaned up via garbage collection, which is managed by the .NET runtime. Not automatically removed from memory when out of scope

**summary**

> [!NOTE]
> **Use in methods**
> ***
> Value types are passed by copy, creating a new instance with the same value, while reference types are passed by reference, allowing direct modification of the original object.

#### Nullability

The `null` value is also a datatype in C# that you have to watch out for, since some operations may return `null`.

However, the `null` value is only valid  to assign for reference variables, not primitive values:

```csharp
string str = null; // Valid for reference types
int number = null; // This will cause a compilation error - value types cannot be null
```

To deal with potentially null values and mark not only reference but also primitive values as nullable, we use the nullability operator `?`.

Here is an example of creating an integer that could possibly be null via suffixing the `?` operator after the data type declaration:

```csharp
string str = null; // Valid for reference types
int? nullableInt = null; // Valid for nullable value types
```

Basically when using the `?` operator to create a nullable version of a variable, that returns a `Nullable<T>` instance, and all nullable variables have these two useful properties:

- `nullable.HasValue`: returns true if the value is not null, else return false.
- `nullable.Value`: the actual value of the nullable, either of type `null` or `T`.

```csharp
int? nullableInt = null;
if (nullableInt.HasValue)
{
    Console.WriteLine($"Nullable integer has value: {nullableInt.Value}");
}
else
{
    Console.WriteLine("Nullable integer is null.");
}
```

#### Boxing and Unboxing

- **Boxing** is the process of converting a value type to a reference type.  
- **Unboxing** is the process of converting a reference type back to a value type.

You can box by casting a value data type to the `object` data type, and you can unbox by casting a reference data type to a value type (if possible)

```csharp
int number = 42;
object boxed = number; // Boxing

object boxed = 42;
int number = (int)boxed; // Unboxing
```

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

#### Optional Arguments

You can specify optional arguments by providing a default value for the parameter in a method, with the exact same syntax as of python:

```csharp
void GreetUser1(string name) {
    Console.WriteLine("Hello, " + name);
}

// using optional arguments
void GreetUser2(string name = "User") {
    Console.WriteLine("Hello, " + name);
}

GreetUser1("John");
GreetUser2();
```

#### Variadic Arguments

Variatic arguments allow you to pass a variable number of arguments that get stored into a list, the same as in other languages like Python and JavaScript. 

1. You specify variadic arguments with the `params` keyword before a `string[]` array parameter.
2. A variadic argument must be the last parameter in the method signature.

```csharp
// passing arbitrary number of arguments
void GreetUser3(params string[] names) {
    foreach (string name in names) {
        Console.WriteLine("Hello, " + name);
    }
}

GreetUser3("John", "Jane", "Jim");
```

#### Named arguments

Named arguments allow you to supply parameter values out of order, just like in Python when using keyword arguments.

You pass named arguments via `param: value` syntax.

```csharp
void MyMethod(string child1, string child2, string child3) 
{
  Console.WriteLine("The youngest child is: " + child3);
}

MyMethod(child3: "John", child1: "Liam", child2: "Liam");
```


#### Method overloading


```csharp
static int PlusMethodInt(int x, int y)
{
  return x + y;
}

static double PlusMethodDouble(double x, double y)
{
  return x + y;
}
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

### Base data structures

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

Tuples in C# act exactly like objects in JavaScript as of .NET version 7.

> [!NOTE]
> Under the hood, tuples are just syntactic sugar for creating `struct` object instances.


There are two ways to create tuples:

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

**Property patterns**

Property patterns allow you to check if a value has a specific property.

> [!NOTE] 
> You can basically just think of this as a way of implementing structural object equality.

```csharp
class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
}

Person person = new Person { Name = "John", Age = 30 };
if (person is { Name: "John", Age: 30 })
{
    Console.WriteLine("The person is John and 30 years old.");
}
else
{
    Console.WriteLine("The person is not John and 30 years old.");
}
```

**positional pattern matching**

Positional patterns allow you to check if a value matches a specific pattern based on its position in a tuple or array.

```csharp
(int, string, bool) tuple = (1, "Hello", true);
if (tuple is (1, string str, true))
{
    Console.WriteLine("The tuple matches the pattern.");
}
else
{
    Console.WriteLine("The tuple does not match the pattern.");
}
```

#### **short circuiting**

The short circuiting operators here work the same as in in JS: `||` for **or** and `&&` for **and**.

Here are the AND short circuit operators:

- `&`: Returns true if both operands are true. Always evaluates both operands (unless an exception is thrown).
- `&&`: Returns true if both operands are true. Does not evaluate the right operand if the left operand is false.

here are the OR short circuit operators:

- `|`: Returns true if at least one of the operands is true. Always evaluates both operands (unless an exception is thrown).
- `||`: Returns true if at least one of the operands is true. Does not evaluate the right operand if the left operand is true.

And here is the NOT short circuit operator:

- `!`: negates the boolean version of the operand

### Type Casting and Conversion

#### Implicit Casting

**Implicit conversion** is when you are allowed to implicitly type cast a variable with a stricter data type to a broader, less strict data type that includes the stricter one.

For example, C# allows implicit conversion from int to double (e.g., converting 5 to 5.000), but does not allow implicit conversion from double to int, which would result in a compiler error

```csharp
int a = 5;
double b = a; // Implicit conversion from int to double
```

Implicit conversion only works with types when casting a subset type (stricter) to a superset type (less strict). For example, casting an string to an int and vice versa will fail. 

```csharp
int a = 5;
string b = a; // This will cause a compilation error
```

#### Explicit Casting

You do explicit casting when you want to convert from a broader type to a stricter type. 

You do explicit casting the same way as in Java, by wrapping the data type in parentheses:

For example, when casting from a double to an int, you lose precision, but explicit casting works while implicit casting will not.

```csharp
double d = 3.14;
int i = (int) d; // Explicit cast, truncates to 3
Console.WriteLine($"Explicit cast: {i}");
```


#### Casting summary

For types that share properties in common, like `int` and `double`, you use casting to convert between those types:

- **implicit casting**: casting from a stricter subset type to a less strict superset type, and precision is not lost.
- **explicit casting**: casting from a less strict superset type to a more strict subset type, but precision is lost.

Some types cannot be type casted, like string and int.

#### Parsing

Some data types have the `.Parse` static method on their classes, which lets you try to parse a string to a certain other data type if possible.

Here are the data types that have access to the `Parse()` and `TryParse()` static methods:

- `int` and its numerical siblings
- `bool`
- `DateTime`

There are two ways to achieve this:

**unsafe parsing with `Parse()`**

The `Parse()` static method takes in a string and tries to forcibly convert it to the data type class specifically calling it. 

If not possible to convert the string to the data type, then an exception is thrown.

```csharp
int a = int.Parse("5"); // Converts "5" to 5, throws error if not possible
double d = double.Parse("5.678")
```



**safe parsing with `TryParse()`**

`TryParse()` allows type conversion from a string to a specific type (like int, bool, DateTime) without throwing an exception. 

It returns a boolean indicating success and uses an **out** parameter to store the converted value, which is convenient syntactic sugar that saves many lines of code.

Here's the basic syntax:

```csharp
bool result = int.TryParse(inputString, out var parsedValue)
```

The old way was to declare the **out variable** beforehand.

```csharp
// way 1: declare placeholder variable before
int a;
bool success = int.TryParse("5", out a); // Converts "5" to 5 and returns true
```

The newer syntax requires less code and is more readable by doing it all in one line:

```csharp
int.TryParse("5", out int a); // Converts "5" to 5 and returns true
```


#### Conversion methods

The `Convert` class provides static methods to convert between types and thus return a new variable with the adjusted type and value, such as `Convert.ToInt32()`, which can convert a value like 4.2 to an integer (losing precision in the process).

Here are the useful conversion methods:

- `Convert.ToString(value)`: converts to a string, returns a string
- `Convert.ToInt32(value)`: converts to an int, returns an int
- `Convert.ToDouble(value)`: converts to a double, returns a double


```csharp
int a = Convert.ToInt32("5"); // Converts "5" to 5
```

```csharp
int i2 = Convert.ToInt32(123.45); // converts 123.45 to 123
```

```csharp
int myInt = 10;
double myDouble = 5.25;
bool myBool = true;

Console.WriteLine(Convert.ToString(myInt));    // convert int to string
Console.WriteLine(Convert.ToDouble(myInt));    // convert int to double
Console.WriteLine(Convert.ToInt32(myDouble));  // convert double to int
Console.WriteLine(Convert.ToString(myBool));   // convert bool to strin
```



```csharp
// Type your username and press enter
Console.WriteLine("Enter username:");

// Create a string variable and get user input from the keyboard and store it in the variable
string userName = Console.ReadLine();

// Print the value of the variable (userName), which will display the input value
Console.WriteLine("Username is: " + userName);
```

### Math methods

- `Math.Max(a, b)`: returns the greater of the two numbers
- `Math.Min(a, b)`: returns the smaller of the two numbers
- `Math.Sqrt(a)`: returns the sqrt of the number
- `Math.Abs(a)`: returns the absolute value of the number
- `Math.Rounds(a)`: rounds the number to nearest integer and returns it

## OOP

### Basic Classes

#### Getters and Setters

First, some terminology:

- **Fields** are simple object variables on a class. They can be set inside the constructor, in methods, or in the class definition before the constructor.
- **Properties** are an abstraction over fields that control access to data, allowing customization of getter and setter behaviors with optional accessibility modifiers.
- **Computed properties** are *read-only* properties that dynamically calculate their value based on other properties, such as creating a FullName property that combines FirstName and LastName

This is how we used to define geeters and setters back in C# in the old ways, which is kind of like Java:

```csharp
public class Person
{
    private string _name;
    
    public string Name
    {
        get { return _name; }
        set { _name = value; }
    }
}
```

But now we have a new way which is syntactic sugar over the old way:

```csharp
public class Person
{
	//creates a private backing field under the hood
    public string Name { get; set; }    
}
```

Here are what the different access modifiers do:

- `get`: syntactic sugar over `public get`. This makes the property public and available for consumers to read.
- `private get`: This makes the property private and unavailable for consumers to read. You can only read from this property and access it within the class definition.
- `set`: syntactic sugar over `public set`. This makes the property public and available for anybody to write to.
- `private set`: This makes the property private and unavailable for consumers to write top. You can only write to this property within the class definition.

The absence of modifiers also has special meaning:

- **no getter defined**: Nobody can read from this property, you can only access it within the constructor.
- **no setter defined**: Nobody can write to this property, not even within it the class definition. You can only set it within the constructor.

**Creating a read-only property**

You can create a read-only property over a field by defining a public getter but only a private setter or no setter at all.

```csharp
public class Person
{
    public string Name { get; } // Immutable property, typically set in constructor
    public int Age { get; set; } // Mutable property
}

var person = new Person { Name = "John Doe", Age = 30 };
person.Age = 31; // This is fine
person.Name = "Jane Doe"; // This will cause a compile-time error
```


**Creating computed properties**

You can create computed properties outside of the constructor via a lambda function, which returns a new readonly field computed from other class fields.

```csharp
public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName => $"{this.FirstName} {this.LastName}";
}
```

#### Constructors

**basic constructors**

You define a standard constructor signature like so:

```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }
}

Person person = new Person("John Doe", 30);
```

In the constructor, keep in mind these things:

1. You can either set fields in the constructor or in the property initializer (more on that later), but you don't have to set nonullable fields in the constructor like as in JavaScript.
2. It's best practice to throw argument exceptions for illegal parameters.

```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Name cannot be null or empty", nameof(name));
        }
        Name = name;
        Age = age;
    }
}

Person person = new Person("John Doe", 30);
Person person2 = new Person(string.Empty, 30); // This will throw an exception
```

**constructor overloading**

In C#, you can overload constructors and provide multiple versions of them:

```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

    public Person(string name)
    {
        Name = name;
        Age = 0;
    }
}

Person person = new Person("John Doe", 30);
Person person2 = new Person("John Doe");
```

**using the `this()` constructor**

If you have another constructor already defined, you can prevent reusing code by just reusing that constructor again to make a new constructor.

For example, the `this()` function refers to the constructor of the current class, and you can use that in different constructor overloads:

```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

	// first runs the constructor Person(string, int)
    public Person(string name) : this(name, 0)
    {
	    // ... whatever is in here runs after Person(string, int) is called
	    Console.WriteLine($"Baby {name} was born!")
    }
}
```

> [!IMPORTANT]
> The `this()` function always runs before the rest of the constructor body when doing a constructor overload.

#### Object initializers

Object initializers provide a way to initialize objects with some default properties. The "really really old way" of adding values to properties after construction looked like this:

```csharp
Person person = new Person();
person.Name = "John Doe";
person.Age = 30;        //😕
```

The more common and modern syntax looks like this:

```csharp
Person person = new Person { 
    Name = "John Doe",
    Age = 30            //❤️
};
```

Properties can be made immutable but settable using the object initializer syntax by using the `init` keyword:

```csharp
public class Person
{
    public string Name { get; init; }
    public int Age { get; init; }
}

Person person = new Person { 
    Name = "John Doe", 
    Age = 30
};

// person.Name is now read-only
// person.Age is now read-only
```

You can also force the developer to set the property using object initializer syntax by using the `required` keyword:

```csharp
public class Person
{
    public required string Name { get; init; }
    public required int Age { get; init; }
}

// to create a valid Person instance, you must instantiate it with name and age
```

#### Comparing object instances

All classes you create automatically inherit from the `object` class, so they all have the `object.Equals(object2)` instance method to check equality between two objects.

But lasses are reference types, which means that they are compared by reference, not value.

This means that two classes are considered equal if they reference the same object in memory, but not if they have the same values.

```csharp
Person person1 = new Person { Name = "John Doe", Age = 30 };
Person person2 = new Person { Name = "John Doe", Age = 30 };

Console.WriteLine(person1 == person2); // False
person1.Equals(person2); // False
```

To enable structural equality, we have to code that ourselves, and a nice semantic way of doing so is to override these methods in a class which are inherited from `object`:

Overriding `Equals` and `GetHashCode` is a good way to customize how classes are compared:

```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public override bool Equals(object obj)
    {
        if (obj == null || GetType() != obj.GetType()) return false;
        Person other = (Person)obj;
        return Name == other.Name && Age == other.Age;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Name, Age);
    }
}
```

### Structs, Records, Classes

#### Structs 

Structs are like the C# equivalent of Python dataclasses. 

They are just a simple way of writing classes such that equality and other important functionality are given out of the box, but you can also add class-specific stuff like methods and a constructor.

> [!NOTE]
> Structs are mostly used when you want a high-performance object instance without the overhead of a class. This is because structs are allocated to the stack and are immediately garbage collected once out of scope.

Structs are allocated to the stack and are thus much higher performance than reference objects like class or record instances.

```csharp
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
}

Point point1 = new Point { X = 5, Y = 10 };
Point point2 = new Point { X = 5, Y = 10 };

Console.WriteLine(point1 == point2); // True
point1.Equals(point2); // True
```

To get the most bang for your buck out of structs, keep them lean and readonly. Follow these tips:

1. Keep structs readonly
2. Only have primitive value type properties, no reference types (to keep them lean)

> [!TIP]
> When declaring structs, it is recommended to make them immutable by closing setters and instantiating values via constructors, avoiding reference types within the struct's properties.


#### Records

Records are just like JavaScript objects, so they are just containers for data.

They have structural equality by default, can be easily compared, and support a 'with' syntax for creating modified copies of existing records.

However, they are meant to be used as a simple container for data, so you can't add methods or any other side effects to a record.


```csharp
// define the interface for what a person record should be like
public record Person(string Name, int Age);

// create a new record instance
var person1 = new Person("John Doe", 30);
// create a new record instance from another instance, using object copying and overriding the Age property.
var person2 = person1 with { Age = 31 };
```

The `with` expression allows you to create a new record based on an existing record, with modifications to some properties by overriding them, avoiding side effects.

Records have structural equality.

```csharp
var person1 = new Person("John Doe", 30);
var person2 = new Person("John Doe", 30);

Console.WriteLine(person1 == person2); // True
person1.Equals(person2); // True
```




#### Structs vs Records vs Classes

**Structs**

- **Performance:** Best suited for small, immutable data types due to value semantics.
- **Use Cases:** High-performance scenarios, geometric points, complex numbers.

**Records**

- **Data-Centric:** Best for immutable data models that do not require behavior.
- **Use Cases:** DTOs (data transfer objects), configuration objects, immutable data transfers.

**Classes**

- **Flexibility:** Ideal for complex objects with behavior and mutable state.
- **Use Cases:** Domain models, services, business logic.



### Object Inheritance

To inherit from another class, use the `:` operator

```csharp
public class HourlyEmployee : BaseEmployee
```

#### Access Modifiers

Access modifiers also affect how child classes can use the parent class functionality.

- `protected`: acts exactly like `private` but child classes can access protected methods and fields within the class definition, while consumers cannot.
- `private`: only the class itself (no child classes) can access anything marked private

#### Sealed classes

A sealed class cannot be inherited. Use this to prevent further derivation.

```csharp
public sealed class FinalEmployee
{
    // Implementation
}
```

You can also seal methods and properties to prevent them from being overriden using the `override` operator:

```csharp
public class BaseEmployee
{
    public sealed override string ToString()    //sealed prevents overriding in derived classes
    {
        return "Base employee details";
    }
}
```

#### Virtual Methods

You can mark a virtual method in the parent class using the `virtual` keyword after the access modifier, which means that you want this method to to be used by children and possibly overriden using the `override` keyword:

```csharp
public class BaseEmployee
{
    public virtual string GetEmployeeDetails()
    {
        return "Base employee details";
    }
}

public class DerivedEmployee : BaseEmployee
{
    public override string GetEmployeeDetails()
    {
        return "Derived employee details";
    }
}
```

### Abstract classes

An abstract class is a class that cannot be instantiated directly and is meant to be inherited from.

You can think of an abstract class as a mix between an interface (design only) and a class (implementation only), taking properties from both.

You define the properties and methods you want child classes to implement for you via the `abstract` modifier, but normal class inheritance of non-abstract methods and properties also works here.

Abstract methods and properties do not have implementations; they are meant for the inherited child to implement them.

```csharp
public abstract class Employee
{
    protected Guid Id { get; set; }  //accessible to derived classes only!
    public string FirstName { get; set; }  //accessible to anyone who has access to this object
    public string LastName { get; set; }

    public abstract decimal CalculatePay();
    private void GenerateEmployeeId();  //not accessible to derived classes
}
```

### Interfaces

THis is how you create an interface in C#

```csharp
public interface IDatabase
{
    void Connect();
    void Disconnect();
    bool IsConnected { get; }
}
```

And this is how you implement an interface, by just inheriting from it.

```csharp
public class SqlDatabase : IDatabase
{
    public bool IsConnected { get; private set; }

    public void Connect()
    {
        // Implementation code
        IsConnected = true;
    }

    public void Disconnect()
    {
        // Implementation code
        IsConnected = false;
    }
}
```

Interfaces are usually just contracts for the shape of an object instance instantiated from a class implementing that interface, but you can also define contracts for static properties and methods of the class using the `static abstract` modifier in an interface:

```csharp
public interface ICalculator<T>
{
    static abstract T Add(T a, T b);
}
```

### Generics

#### Basics

Generics in C# work the exact same as in TypeScript, but are slightly less powerful.

```csharp
public class Box<T>
{
    private T _item;

    public void SetItem(T item)
    {
        _item = item;
    }

    public T GetItem()
    {
        return _item;
    }
}

Box<int> intBox = new Box<int>();
intBox.SetItem(10);
Console.WriteLine(intBox.GetItem()); // 10

Box<string> stringBox = new Box<string>();
stringBox.SetItem("Hello");
Console.WriteLine(stringBox.GetItem()); // Hello

stringBox.SetItem(123); // Compile-time error, yay!
```

#### Type Constraints

When creating generic classes, you can use type constraints to make sure that the type variable passed in must be either of a class, extend from a certain type, etc.

In the example below, we assume `T` must be a class and implement the `ITrackedEntity` interface.

```csharp
public interface ITrackedEntity
{
    Guid Id { get; set; }
}

public class DataManager<T> where T : class, ITrackedEntity
{
    public void Manage(T item)
    {
        Console.WriteLine($"Managing entity with ID: {item.Id}");
    }
}
```

Here's a complete generic constraint system:

```csharp
public interface IRepository<T> where T : class
{
    IEnumerable<T> GetAll();
    T GetById(int id);
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
}

public class Repository<T> : IRepository<T> where T : class
{
    private readonly List<T> _entities = new List<T>();

    public IEnumerable<T> GetAll()
    {
        return _entities;
    }

    public T GetById(int id)
    {
        // Simulate fetching entity by ID
        return _entities[id];
    }

    public void Add(T entity)
    {
        _entities.Add(entity);
    }

    public void Update(T entity)
    {
        // Logic for updating entity
    }

    public void Delete(T entity)
    {
        _entities.Remove(entity);
    }
}

var customerRepository = new Repository<Customer>();
var productRepository = new Repository<Product>();

customerRepository.Add(new Customer { Id = Guid.NewGuid(), Name = "John Doe" });
productRepository.Add(new Product { Id = Guid.NewGuid(), Name = "Product A" });
```

## Collections

###  `IEnumerable<T>`

The  `IEnumerable<T>` interface represents a generic collection of any type that can be iterated over.

### `List<T>`

The `List<T>` class is a generic implementation of an array list.

**instantiating a list**

There are two ways to create a list. 

The first is the constructor way:

```csharp
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
```

You can even declare it with collection initializer syntax in newer versions of C#:

```csharp
List<int> numbers = [1, 2, 3, 4, 5];
```

**list methods**

Here are all the list methods

- `list.Add`/`AddRange`
    - `Add`: Adds a single element to the list. `numbers.Add(6);`
    - `AddRange`: Adds multiple elements to the list at once. `numbers.AddRange(new int[] { 7, 8, 9 });`
- `list.Remove`/`RemoveAt`
    - `Remove`: Removes the first occurrence of a specific element. `numbers.Remove(4);`
    - `RemoveAt`: Removes an element at the specified index. `numbers.RemoveAt(2);`
- `list.Insert`: Adds an element at the specified index. `numbers.Insert(1, 10);`
- `list.IndexOf`: Returns the index of the first occurrence of an element. `int index = numbers.IndexOf(5);`
- `list.Count`: Returns the number of elements in the list. `int count = numbers.Count;`
- `list.Sort`: Sorts the elements in the list in ascending order. `numbers.Sort();`
- `list.Reverse`: Reverses the order of elements in the list. `numbers.Reverse();`

```csharp
List<int> numbers = [1, 2, 3, 4, 5];
numbers.Add(6);
numbers.Remove(2);
numbers.Sort();
numbers.Reverse();
Console.WriteLine(string.Join(", ", numbers)); // Output: 6, 5, 4, 3, 1
Console.WriteLine(numbers.Exists(x => x > 4)); // Output: True
Console.WriteLine(numbers.Find(x => x % 2 == 0)); // Output: 6
numbers.Contains(3); // Output: True
```

**list iteration methods**

here are the list iteration methods, all of which take in a lambda function with the first argument being the current element in the iteration.

- `ForEach`: iterates through all elements of the list, where the lambda is a void side effect function.
	- **Purpose**: to perform some side-effect for every element in the array.
- `Exists`: lambda returning a boolean
	- **Purpose**: to see if there exists an element that satisfies the condition defined in the lambda.
- `Find`: lambda returning a boolean, returns the first element that makes the condition in the lambda return true.
	- **Purpose**: to find a specific element that satisfies a condition.

```csharp
numbers.ForEach(number => Console.WriteLine(number));
Console.WriteLine(numbers.Exists(x => x > 4)); // Output: True
Console.WriteLine(numbers.Find(x => x % 2 == 0)); // Output: 6
```

### `Dictionary<T, V>`

```csharp
Dictionary<string, int> dictionary = new Dictionary<string, int>();

//set the values
dictionary["one"] = 1;
dictionary[2] = "two";  //this doesn't compile!
```

```csharp
Dictionary<string, int> dictionary = new Dictionary<string, int>();

//set the values
dictionary["one"] = 1;
dictionary["two"] = 2;

//get the values
int thisValue = dictionary["one"];
int thatValue = dictionary["two"];

int doesNotExistValue = dictionary["three"]; //KeyNotFoundException
```

These are the methods you have on a dictionary object:

- `dict.Add` - add a key-value pair to the dictionary. 
	- Example: `dictionary.Add("three", 3);` 
	- Will throw an exception if the key already exists in the dictioary.
- `dict.Remove` - remove a key-value pair from the dictionary. 
	- Example: `dictionary.Remove("one");`
- `dict.ContainsKey` - check if the dictionary contains a key. 
	- Example: `dictionary.ContainsKey("two");`
- `dict.ContainsValue` - check if the dictionary contains a value. 
	- Example: `dictionary.ContainsValue(3);`
- `dict.TryGetValue` - get the value for a key. 
	- Example: `dictionary.TryGetValue("three", out int value);` 
	- Will return true if the key exists in the dictionary, and false otherwise.
- `dict.Clear` - remove all key-value pairs from the dictionary. 
	- Example: `dictionary.Clear();`
- `dict.Count` - get the number of key-value pairs in the dictionary. 
	- Example: `int count = dictionary.Count;`
- `dict.Keys` - get a collection of the keys in the dictionary. 
	- Example: `IEnumerable<string> keys = dictionary.Keys;`
- `dict.Values` - get a collection of the values in the dictionary. 
	- Example: `IEnumerable<int> values = dictionary.Values;`

### `HashSet<T>`

A hash set is just a key-value pair written in a way that hash collisions make the data structure a set, where duplicates are not allowed

```csharp
HashSet<int> hashSet = new HashSet<int>();
hashSet.Add(1);
hashSet.Add(2);
hashSet.Add(2); // This will not be added because it is a duplicate
```

### `ImmutableArray<T>`

An `ImmutableArray<T>` is a collection that stores a fixed-size array of values. It is immutable, meaning that once it is created, its size and contents cannot be changed.

```csharp
ImmutableArray<int> immutableArray = ImmutableArray.Create(1, 2, 3, 4, 5);
```

Adding to the array returns a new `ImmutableArray<T>` with the added value.

```csharp
ImmutableArray<int> newImmutableArray = immutableArray.Add(6);
```

## Functions as objects

Just like in JavaScript, In C#, functions are reference type objects and can be passed around like variables. This lets us do cool stuff like closures, lamdbas, function type-safety, binding, etc.

### `Func` vs `Action`

When defining a type for functions, you can choose between `Func<...>` and `Action<...>`, both which take a variadic amount of type arguments, depending on how many parameters the function you're trying to type ahs.

- A Func is a function that returns a value, while an Action is a function that does not return anything (returns void). 
- Funcs specify the return type as the last generic type parameter, and Actions do not have a return type.

Here is how to type a `Func`:

```csharp
static int Add(int x, int y)
{
    return x + y;
}

// 1st param types x, 2nd param types y, 3rd param types the return type
Func<int, int, int> addFunc = Add;

int result = addFunc(3, 4); // result = 7
```

Here is how to type an `Action`:

```csharp
static void PrintMessage(string message)
{
    Console.WriteLine(message);
}

Action<string> printAction = PrintMessage;
printAction("Hello, World!"); // Output: Hello, World!
```

### Lambdas

In C#, you have lambda functions which are similar to arrow functions in javascript. In fact, they use the exact same syntax, but the only difference is that you must type them with `Action` or `Func` explicitly.

**one-line lambda function**

```csharp
Action<string> writeStringToConsole = x => Console.WriteLine(x);
```

**multi-line lambda function**

```csharp
Action<string> printAction = (str) =>
{
    Console.WriteLine(str);
};

printAction("Hello, World!"); // Output: Hello, World!
```

### Closures

Closing over a variable means that a lambda expression can access and maintain the value of a variable from its outer scope, even when the lambda is executed outside of its original context. The lambda retains a reference to the original variable, not a copy.

```csharp
int counter = 0;
Func<int, int> incrementCounter = num => {
    counter = num + counter;
    return counter;
};
Console.WriteLine(incrementCounter(5)); // Output: 5
Console.WriteLine(incrementCounter(7)); // Output: 12
Console.WriteLine(incrementCounter(8)); // Output: 20
```

A local function is a function declared inside another function, which can access variables from its containing scope and has similar closure properties to lambda expressions.

## Dealing with files

```embed
title: "File Class (System.IO)"
image: "https://learn.microsoft.com/en-us/media/open-graph-image.png"
description: "Provides static methods for the creation, copying, deletion, moving, and opening of a single file, and aids in the creation of FileStream objects. "
url: "https://learn.microsoft.com/en-us/dotnet/api/system.io.file?view=netframework-4.8"
favicon: ""
aspectRatio: "52.5"
```


### File class

You should import the `System.IO` class in order to start using file methods.

```csharp
using System;
using System.IO;
```

**static File methods**

- `File.Exists(string filepath)`: returns a **boolean**, true if the file exists at the path, false if not. Both relative and absolute paths are accepted.
- `File.ReadAllText(string filepath)`: returns the text content of the file
- `File.Create(string filepath)`: creates a file at the specified filepath
- `File.Delete(string filepath)`: deletes the file at the specified filepath
- `File.WriteAllText(string filepath, string text)`: writes content to the specified file
- `File.Copy(string sourcePath, string destinationPath)`: copies the source file contents to a new file specified by the destination path
- `File.Move(string sourcePath, string destinationPath)`: moves the source file contents to the destination path

### Basic Reading and Writing

**write all at once, read all at once**

```csharp
using System.IO;  // include the System.IO namespace

string writeText = "Hello World!";  // Create a text string
File.WriteAllText("filename.txt", writeText);  // Create a file and write the content of writeText to it

string readText = File.ReadAllText("filename.txt");  // Read the contents of the file
Console.WriteLine(readText);  // Output the content
```

**more control**

```csharp
using System;
using System.IO;

string path = @"files/blah.txt";
if (!File.Exists(path))
{
    // Create a file to write to.
    using (StreamWriter sw = File.CreateText(path))
    {
        sw.WriteLine("Hello");
        sw.WriteLine("And");
        sw.WriteLine("Welcome");
    }
}

// Open the file to read from.
using (StreamReader sr = File.OpenText(path))
{
    string? s;
    while ((s = sr.ReadLine()) != null)
    {
        Console.WriteLine(s);
    }
}
```

