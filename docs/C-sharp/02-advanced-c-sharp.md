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

### Streams

A stream is an abstraction of a sequence of bytes, similar to water moving through a pipeline where you can process data as it flows rather than waiting for the entire data to be available.

Streams are examples of built-in disposables that are useful.

There are three useful types of streams:

- `FileStream`: Used for reading and writing to files on disk.
- `MemoryStream`: Provides a stream for storing data in memory.
- `NetworkStream`: Allows reading and writing over network connections.

Streams are often unmanaged resources, so they should be used with 'using' statements to ensure proper disposal and prevent resource leaks, such as keeping file handles locked.

#### File Streams

Streams are commonly used to read from files. You can perform both synchronous and asynchronous read operations.

This is an example where you can read a file piecemeal

```csharp
using (var fileStream = new FileStream("file.txt", FileMode.Open))
{
    using (var reader = new StreamReader(fileStream))
    {
        string content = reader.ReadToEnd();
        Console.WriteLine(content);
    }
}
```

This is an example where you can write to a file piecemeal

```csharp
using (var fileStream = new FileStream("file.txt", FileMode.Create))
{
    using (var writer = new StreamWriter(fileStream))
    {
        writer.Write("Hello, World!");
    }
} 
```

#### **memory stream**

`MemoryStream` is useful for in-memory data storage. It's a type of stream that stores data in memory, which can be useful for scenarios where you need to work with data in memory without using a file.

```csharp
byte[] data = Encoding.UTF8.GetBytes("Hello, MemoryStream!");
using (var memoryStream = new MemoryStream(data))
{
    using (var reader = new StreamReader(memoryStream))
    {
        string content = reader.ReadToEnd();
        Console.WriteLine(content);
    }
}
```

> [!WARNING]
> MemoryStreams are often overused by developers who put data into memory when it's not necessary. They are useful for small amounts of data or in-memory storage, but not always the most efficient solution.



If you find yourself using `MemoryStream` frequently, consider whether you need to load the entire byte stream into memory. For large datasets, it may be more efficient to process the data in chunks or use other types of streams.

To avoid cluttering up memory, you can use temporary file APIs to write data to disk temporarily.

```csharp
string tempFilePath = Path.GetTempFileName();

try
{
    using (var tempFileStream = new FileStream(tempFilePath, FileMode.Create))
    {
        using (var writer = new StreamWriter(tempFileStream))
        {
            writer.Write("Temporary data");
        }
    }

    // Read from the temporary file
    using (var tempFileStream = new FileStream(tempFilePath, FileMode.Open))
    {
        using (var reader = new StreamReader(tempFileStream))
        {
            string content = reader.ReadToEnd();
            Console.WriteLine(content);
        }
    }
}
finally
{
    // Clean up temporary file
    File.Delete(tempFilePath);
}
```

### JSON

To use jSON libraries, import the `System.Text.Json` library and use the `JsonSerializer` class.

The ``

- `JsonSerializer.SerializeObject(object obj)`: serializes the object to a JSON string and returns it.
- `JsonSerializer.DeserializeObject<T>(string str)`: deserializes the json string into an object of type T.

```csharp
var employee = new Employee
{
    Id = 1,
    FirstName = "John",
    LastName = "Doe",
    Age = 30
};

var json = JsonSerializer.Serialize(employee); var johnReborn = JsonSerializer.Deserialize<Employee>(json);
```

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

The File class has both synchronous and async versions of the same operations/methods.

- `File.Exists(string filepath)`: returns a **boolean**, true if the file exists at the path, false if not. Both relative and absolute paths are accepted.
- `File.ReadAllText(string filepath)`: returns the text content of the file
- `File.Create(string filepath)`: creates a file at the specified filepath
- `File.Delete(string filepath)`: deletes the file at the specified filepath
- `File.WriteAllText(string filepath, string text)`: writes content to the specified file
- `File.Copy(string sourcePath, string destinationPath)`: copies the source file contents to a new file specified by the destination path
- `File.Move(string sourcePath, string destinationPath)`: moves the source file contents to the destination path

#### Copy, Move, Deleting

```csharp
File.Copy("source.txt", "destination.txt");
File.Move("source.txt", "destination.txt");
File.Delete("file.txt");
```

### Basic Reading and Writing

#### Loading entire file into memory

The basic pipeline is as follows:

```csharp
using System.IO;  // include the System.IO namespace

string writeText = "Hello World!";  // Create a text string
File.WriteAllText("filename.txt", writeText);  // Create a file and write the content of writeText to it

string readText = File.ReadAllText("filename.txt");  // Read the contents of the file
Console.WriteLine(readText);  // Output the content
```

Here are the methods to read a file all at once, loading the entire file's contents into memory

- **`File.ReadAllText()`**: Reads the contents of a file as a single string.
- **`File.ReadAllLines()`**: Reads the contents of a file and returns an array of strings, each representing a line in the file.
- **`File.ReadAllBytes()`**: Reads the contents of a file as a byte array.

```csharp
string content = File.ReadAllText("file.txt");
string[] lines = File.ReadAllLines("file.txt");
byte[] bytes = File.ReadAllBytes("file.txt");
```

Here are the methods to write to a file all at once, loading the entire file's contents into memory

- **`File.WriteAllText()`**: Writes text to a file, overwriting the file if it already exists.
- **`File.AppendAllText()`**: Appends text to a file, creating the file if it doesn't exist.
- **`File.WriteAllLines()`**: Writes an array of strings to a file, each string being a line in the file.

```csharp
File.WriteAllText("file.txt", "Hello, World!");
File.AppendAllText("file.txt", "\nGoodbye, World!");
File.WriteAllLines("file.txt", new[] { "Hello", "World" });
```



#### Using streams

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

### FileInfo class

The `FileInfo` class provides instance methods and properties for working with files.

```csharp
var fileInfo = new FileInfo("file.txt");
```

**common properties**

- **`fileInfo.Length`**: Gets the size of the file in bytes.
- **`fileInfo.CreationTime`**: Gets or sets the creation date and time of the file.
- **`fileInfo.LastAccessTime`**: Gets or sets the date and time the file was last accessed.

```csharp
var fileInfo = new FileInfo("file.txt");
Console.WriteLine(fileInfo.Length);
Console.WriteLine(fileInfo.CreationTime);
Console.WriteLine(fileInfo.LastAccessTime);
```

### Directory class

Here are the static methods on the `Directory` class, which provides utilities for working with directories:

- `Directory.CreateDirectory(folderpath)`: Creates a directory and any subdirectories specified in the path. If the directory already exists, no action is taken, so it's safe to call this method multiple times.

```csharp
Directory.CreateDirectory("newDirectory");
```

### Path Class

The `Path` class offers a bunch of static methods that serve as utilities for working with paths.

- `Path.Combine(params string[] paths)`: Combines two or more strings into a path, OS agnostic.
- `Path.GetDirectoryName(string filepath)`: Gets the directory information for the specified path string.
- `Path.GetExtension(string filepath)`: Gets the extension of the specified path string.
- `Path.GetTempFileName()`: Gets the full path to a temporary file. This file is actually created inside of the user's temp directory. Useful for creating a temporary file and then deleting it after the program is done using it.


```csharp
string path = Path.Combine("directory", "file.txt"); // returns combined path
string directory = Path.GetDirectoryName("file.txt"); // returns directory path
string extension = Path.GetExtension("file.txt"); // returns .txt
string randomFileName = Path.GetRandomFileName(); // returns random file name
string tempFileName = Path.GetTempFileName(); // returns temp file path
```


## Network Requests

### HTTPClient class

The `HttpClient` class is a high-level abstraction for making HTTP requests and receiving/processing HTTP responses.

Create an HTTP client like so:

```csharp
var httpClient = new HttpClient();
```

#### Basic Requesting

The `HttpRequestMessage` instance is ab abstraction over crafting the headers, body content, etc. that goes into a crafting a request.

The basic syntax for crafting a request object is like so:

```csharp
var request = new HttpRequestMessage(method_type, url);
```

- `method_type`: one of `HttpMethod.Get`, `HttpMethod.Post`, `HttpMethod.Delete`, `HttpMethod.Put`, `HttpMethod.Patch`.
- `url`: the url to make a request to.


```csharp
var request = new HttpRequestMessage(HttpMethod.Get, "https://microsoft.com");
var httpClient = new HttpClient();

var response = await httpClient.SendAsync(request);
```

`HttpClient` includes a set of default headers for every request, which can be overridden or added to as needed.

```csharp
var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Add("X-Secret-Header", "some_secret_value");

var request = new HttpRequestMessage(
	HttpMethod.Get, 
	"https://yourfavoriteservice.com/some_secret_api"
);
```

You can set the authorization header to include tokens or credentials for secured endpoints.

```csharp
var httpClient = new HttpClient();

// add auth request headers to be passed on every request
httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
	"Bearer", 
	"your_token_here"
);

var request = new HttpRequestMessage(
	HttpMethod.Get, 
	"https://yourfavoriteservice.com
)
```


#### Dealing with the response

Once you craft a request, then you actually fetch that request using the `httpClient.SendAsync(request)`, which returns a response.

```csharp
var httpClient = new HttpClient();

var request = new HttpRequestMessage(HttpMethod.Get, "https://microsoft.com");
var response = await httpClient.SendAsync(request);
```

Here is what you can do on the response:

- `response.Content.ReadAsStringAsync()`: returns the response body as a string
- `response.Content.ReadFromJsonAsync<T>()`: returns the response body as a string
- `response.Content.ReadAsStreamAsync()`: returns the response body as a string
- `response.IsSuccessStatusCode`:  Checks if the HTTP response status code indicates success (status codes 200-299).
- `response.EnsureSuccessStatusCode()`: throws an exception if the response status code does not indicate success.

```csharp
var response = await httpClient.GetAsync(
	"https://jsonplaceholder.typicode.com/posts/1"
);
if (response.IsSuccessStatusCode) {
	var content = await response.Content.ReadFromJsonAsync<Post>();
}
```

### HTTPClient Factory

> [!NOTE]
> **Don’t Create One `HttpClient` per Request**
> ***
> Creating a new `HttpClient` instance for each request can exhaust system resources. Instead, reuse a single instance.

Creating a network connection via HTTPClient is expensive and cannot be reopened again and again via creating multiple instances of the class. We must use one of these two techniques to mitigate this problem:

1. **Static Shared `HttpClient`**: In older applications or scenarios where resource management is a concern, using a single static instance of `HttpClient` is considered best practice.
2. **Avoid Disposing `HttpClient`**: Typically, you should avoid disposing of `HttpClient` instances manually, even though it implements `IDisposable`. The disposal is managed automatically by the runtime in most cases.

