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

### Async Programming

#### Basic Tasks and `async/await`

**intro**

C# async/await was the inspiration for JS async/await and thus they share many similarities.

In C#, a promise is a task, where each asynchronous method or operation returns a `Task<T>` instance, where `T` is the type that the tasks resolves to once awaited.

Here are the two things you should know when trying to do async programming:

1. you can only use async/await syntax inside of an `async` function.
2. All async functions must return some `Task<T>` instance, and just `Task` in the case of a void promise/task.

```csharp
async Task<string> FetchDataAsync()
{
    await Task.Delay(1000); // Simulate async work
    return "Data fetched!";
}

async Task Main()
{
    string data = await FetchDataAsync();
    Console.WriteLine(data); // Output: Data fetched!
}

// how to block thread to wait for async work to be done.
Main().GetAwaiter().GetResult();
```

**synchronous blocking**

You should never try to synchronously wait for the results of an asynchronous function because then that defeats the purpose of async methods.

Using `Task.Result` or `Task.Wait()` on a task can lead to deadlocks, especially in older .NET applications with a synchronization context.

```csharp
// Problematic code
var result = GetDataFromServerAsync().Result; // Can cause deadlocks
```

#### Awaiting multiple tasks in parallel

Similar to `Promise.all()`, we have `Task.WhenAll(...tasks)` that takes in an arbitrary amount of tasks, awaits them all, and then returns a list of their awaited results in order.


### Disposables

#### Dispose pattern

In Python, you have context managers to automatically manage the lifetime of a resource and dispose of it once done within a `with` block.

In C#, you have the same thing, where you manage the lifetime of a resource within the scope of a `using` block.

Here are the main use cases for using the dispose pattern:

- **File Handles**: Resources used to read from or write to files.
- **Network Connections**: Connections to network services or remote servers.
- **Database Connections**: Connections to databases that need to be explicitly closed.
- **Memory from Other Systems**: Memory allocated through native code or APIs that needs manual management.

**creating a disposable**

The `IDisposable` interface is designed for types that need to release unmanaged resources. It contains a single method, `Dispose`, which should be implemented to free these resources.

The `Dispose` method is used to release unmanaged resources that an object holds. 

Unmanaged resources include things like file handles, network connections, database connections, and memory from other systems (such as native OS calls). 

Properly releasing these resources is crucial for avoiding resource leaks and ensuring that your application runs efficiently.

The resource below uses a `SqlConnection` which uses unmanaged resources. It's EXTREMELY important to call `Dispose` on the connection when you're done with it. For this example, since the `MyResource` class creates and manages the `SqlConnection`, it should also be responsible for disposing of it.

```csharp
public class MyResource : IDisposable
{
    private bool _disposed = false; // To detect redundant calls
    private SqlConnection _connection;

    // Implement IDisposable
    public void Dispose()
    {
        if (!disposed)
        {
            _connection.Dispose();

            // Free your own state (unmanaged objects).
            disposed = true;
        }
    }
}
```

In a typical `Dispose()` method implementation, first check if the object has already been disposed using a boolean flag. If not yet disposed, release the unmanaged resources and then set the flag to true to prevent multiple disposal attempts.

**using a disposable**

The `using` statement provides a convenient syntax that ensures the `Dispose` method is called automatically at the end of the block, even if an exception occurs.

For our example above, you would then use the `MyResource` class like this:

```csharp
using (var myResource = new MyResource())
{
    myResource.UseResource();
}
```

You can also use the `using` statement at the beginning of a variable declaration to ensure it's disposed of when the scope ends:

```csharp
using var myResource = new MyResource();
myResource.UseResource();

//automatically disposed of when myResource goes out of scope
```


> [!NOTE] 
> **Behind the scenes: how `using` works**
> ***
> The 'using' keyword provides a convenient way to manage resources that implement IDisposable, automatically calling the Dispose method at the end of the code block, even if an exception occurs. It essentially acts as syntactic sugar for a try-catch-finally block.


**async dispose**

With asynchronous programming, you can use await using to asynchronously dispose of objects that implement `IAsyncDisposable`. This is useful for I/O-bound resources that benefit from asynchronous disposal.

`IAsyncDisposable` is a recent addition that provides an asynchronous Dispose method returning a task, which can be awaited. It should be used when possible to maintain asynchronous operations throughout the code, though using a standard using statement is still important for resource management.

```csharp
await using (var stream = new FileStream("file.txt", FileMode.Open))
{
    // Use the stream
}
```

> 🌶️🌶️🌶️ Rule of thumb: if your method is async and your resource is disposable, you should use `await using` - otherwise, using `using` is fine.

#### Streams

A stream is an abstraction of a sequence of bytes, similar to water moving through a pipeline where you can process data as it flows rather than waiting for the entire data to be available.

Streams are examples of built-in disposables that are useful.

There are three useful types of streams:

- `FileStream`: Used for reading and writing to files on disk.
- `MemoryStream`: Provides a stream for storing data in memory.
- `NetworkStream`: Allows reading and writing over network connections.