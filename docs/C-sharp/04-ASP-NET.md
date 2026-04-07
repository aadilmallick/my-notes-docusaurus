## Basics

### Creating the server

This is the most basic way to create a server and start in ASP.NET:

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.Run();
```

### Middleware and Context

This is how we can make our own middleware, very similar to how we do it in express.

1. Every middeware takes two arguments, the **context** and **next** function.
2. Use a middleware with the `app.Use()` method.

```csharp
app.Use(async (HttpContext context, RequestDelegate next) =>
{
    context.Response.Headers.Append("Content-Type", "text/html");
    await context.Response.WriteAsync("<h1>Welcome to Ahoy!</h1>");
});
```

- `context`: an `HttpContext` object instance that lets you do stuff to the request and response midflight.
- `next`: a `RequestDelegate` instance that is a function that when invoked, passes on to the next request handler in the pipeline.

The `HttpContext` object instance has these properties:

- `context.Request`: represents the current request
- `context.Response`: represents the forming response
- `context.Items`: 	A dictionary of items that can be used to store data during the request/response process

### Basic JSON API

We can define basic routes that return JSON using the **app.Map** family of handlers:

- `app.MapGet(route, handler)`: JSON response handler for a GET request
- `app.MapPost(route, handler)`: JSON response handler for a POST request

```csharp
public class Employee
{
    private static int _idCounter = 1;
    public static Employee createEmployee(string firstName, string lastName)
    {
        return new Employee
        {
            Id = _idCounter++,
            FirstName = firstName,
            LastName = lastName
        };
    }
    public required int Id { get; init; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}

var employees = new List<Employee>
{
    Employee.createEmployee("John", "Doe"),
    Employee.createEmployee("Jane", "Smith"),
    Employee.createEmployee("Alice", "Johnson")
};

app.MapGet("/employees", () =>
{
    return employees; // automatically returns the list as json
});

app.Run();
```

#### Returning response status codes

To return specific response static codes, we can use the `Result` class like so to gain semantic response codes easily.

```csharp
app.MapGet("/employees", () => {
    return Results.Ok(employees); // returns 200 status code
});
```

All of the below methods return a response object with an added status code

- `Results.Ok(data)`: returns the data as a response with a 200 status code
- `Results.Created(data)`: returns the data as a response with a 204 status code
- `Results.NotFound()`: returns a 404 response

#### Route parameters

In a url, you can access dynamic route parameters by putting them in curly braces, following this syntax:

```
/someurlpath/{paramName}
```

C# also offers a neat way to make the route par

```csharp
app.MapGet("/employees/{id:int}", (int id) =>
{
    var employee = employees.SingleOrDefault(e => e.Id == id);
    if (employee == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(employee);
});
```

#### C: creating data with `MapPost()`


#### R: reading data with `MapGet()`

```csharp
app.MapGet("/employees/{id:int}", (int id) =>
{
    var employee = employees.SingleOrDefault(e => e.Id == id);
    if (employee == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(employee);
});
```

