## Advanced Features

### Extension Methods

Extension methods are the C# equivalent of adding onto the prototype in JavaScript. Essentially, you can add new methods to primitive or existing types like string, int, etc. 

> [!IMPORTANT]
> The primary purpose of an extension class is to add behavior to an existing class without modifying its source code. 

You do this by following these steps:

1. **Define a Static Class**: The extension methods must be in a static class.
2. **Create a Static Method**: The method you want to add must be static.
3. **Use the `this` Keyword on the first parameter**: The first parameter of the method specifies the type that the method operates on, using the `this` keyword.

An extension method uses the 'this' keyword before its first parameter, which allows it to be called directly on an instance of the specified type as if it were an instance method, while still being a static method

For example, we can add a new `str.isPalindrome()` method available to every string instance:

```csharp
public static class StringExtensions
{
    public static bool IsPalindrome(this string str)
    {
        if (string.IsNullOrEmpty(str))
            return false;

        string reversed = new string(str.Reverse().ToArray());
        return str.Equals(reversed, StringComparison.OrdinalIgnoreCase);
    }
}

string name = "Alice";
Console.WriteLine(name.IsPalindrome()); // Output: False
```

> [!NOTE]
> The `this string` parameter type should be the the first parameter, and it makes it so that we start adding onto the prototype. You can think of it as the equivalent of `this` in JavaScript or `self` in Python.

- In the example above, the `this string str` takes on the value `str = name`, since we call the palindrome function on the `name` string instance.
- You can also supply additional arguments, but the first parameter must always be the type param instance (like of type `this string`) to make it an extension method.

> [!NOTE]
> extension methods can have multiple parameters, but the 'this' keyword must only be used on the first parameter, which represents the type being extended



## Built-in Libraries

- **System.Collections**: Provides classes and interfaces for working with collections, such as lists, dictionaries, and queues. We went through a lot of these already, yay!
- **System.IO**: Contains types that allow reading and writing to files and streams.
- **System.Net**: Provides a simple programming interface for many of the protocols used on the Internet.
- **System.Text.Json**: Provides functionality to serialize and deserialize JSON data.
- **System.Net.Http**: Provides a library for making HTTP requests and receiving HTTP responses.
- **System.Linq**: Includes classes and methods for querying and manipulating data in collections.
- **System.Threading.Tasks**: Provides classes and methods for managing threads and asynchronous operations.
- **System.Reflection**: Provides classes and methods for inspecting and manipulating assemblies, modules, and types at runtime.

