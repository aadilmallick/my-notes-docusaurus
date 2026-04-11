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

C# also offers a neat way to make the route params type safe by typing the URL in this syntax:

```
/someurlpath/{paramName:type}
```

Here's an example of how we can make a route param type safe and access it in the route handler:

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

We can make a POST request that accepts a JSON body and returns a JSON response using `app.MapPost(url, handler)`, where the handler accepts a serializable object structure that will be the structure of the json request body the POST request expects.

Here's an example:

```csharp
public record CreateEmployeeRequest(string FirstName, string LastName);

// require request body of {FirstName: string, LastName: string}
app.MapPost("/employees", (CreateEmployeeRequest employee) =>
{
    var newEmployee = Employee.createEmployee(
	    employee.FirstName, 
	    employee.LastName
    );
    employees.Add(newEmployee);
    
    // return serialized employee
    return Results.Created($"/employees/{newEmployee.Id}", newEmployee);
});
```
#### R: reading data with `MapGet()`

To read a single resource, search by some identifier.

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

#### U: updating data with `MapPut()`


```csharp
employeeRoute.MapPut("/{id:int}", (
	int id, 
	CreateEmployeeRequest updatedEmployee
) =>
{
    var employee = employees.SingleOrDefault(e => e.Id == id);
    if (employee == null)
    {
        return Results.NotFound();
    }
    employee.FirstName = updatedEmployee.FirstName;
    employee.LastName = updatedEmployee.LastName;
    return Results.Ok(employee);
});
```

#### D: deleting data with `MapDelete()`


```csharp
employeeRoute.MapDelete("/{id:int}", (int id) =>
{
    var employee = employees.SingleOrDefault(e => e.Id == id);
    if (employee == null)
    {
        return Results.NotFound();
    }
    employees.Remove(employee);
    return Results.NoContent();
});
```

#### Grouping with a router

Much like how we can use routers in express to group routes together under a common prefix, we can do the same in C# using **groups**:

This is how we can create a group with a prefix:

```csharp
var router = app.MapGroup("some_prefix_here");
```

Here is the refactored employee example:

```csharp
var employeeRoute = app.MapGroup("employees");

employeeRoute.MapGet("/", () =>
{
    return employees;
});

employeeRoute.MapGet("/{id:int}", (int id) =>
{
    var employee = employees.SingleOrDefault(e => e.Id == id);
    if (employee == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(employee);
});

employeeRoute.MapPost("/", (CreateEmployeeRequest employee) =>
{
    var newEmployee = Employee.createEmployee(employee.FirstName, employee.LastName);
    employees.Add(newEmployee);
    return Results.Created($"/employees/{newEmployee.Id}", newEmployee);
});
```

#### Attributes

We can use **Bind/From** attributes in C# to make dependency injection work better and for cleaner code. These attributes gives us and C# hints as to which parameters should correspond to what, as in they should be query params, route params, or taken from the request body.

```csharp
app.MapPost("/employees/{id}", (
	[FromRoute] int id, 
	[FromBody] Employee employee, 
	[FromServices] ILogger<Program> logger, 
	[FromQuery] string search
) => {
    return Results.Ok(employee);
});
```

Each of these attributes are used to bind parameters from different parts of the request:

- `[FromRoute] int id`: Binds the `id` parameter from the route.
- `[FromBody] Employee employee`: Binds the `employee` parameter from the body of the request.
- `[FromServices] ILogger<Program> logger`: Binds the `logger` parameter from the DI container.
- `[FromQuery] string search`: Binds the `search` parameter from the query string.

## Unit testing

### Creating tests

In .NET, unit tests live outside the API code directory and instead are created as their own .NET project.

1. Press `ctrl + shift + p` and hit **.NET: create new project**
2. Search for the **xUnit Test Project** template and select that and create it in the default directory


![](https://i.imgur.com/oFMuDZf.jpeg)

Now to get tests working, you need to make the following changes to your code:

1. Install the package in your testing directory using `ctrl + shift + p` and then clicking **Nuget: focus on nuget view**
2. Make your API code public to other .NET projects by writing this declaration in the `Program.cs` file:

```csharp
public partial class Program { }
```

3. Add your API .NET project as a reference to the testing .NET project, which you can do by using `ctrl + shift + p` and searching ".NET: add reference", or you can do via cli:

```bash
dotnet add reference ../first-net-api.csproj
```

### Basic unit tests

You define a class function to be a test by using the `[Fact]` attribute to decorate that function:

```cs
using Microsoft.AspNetCore.Mvc.Testing;
namespace TestProject1;



public class BasicTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public BasicTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

	// testing if the /employees route returns 200 status
    [Fact]
    public async Task GetEmployees_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/employees");
        Assert.True(response.IsSuccessStatusCode);
    }
}
```

Here are some more unit tests covering the entire CRUD spectrum:

```cs
using Microsoft.AspNetCore.Mvc.Testing;
namespace TestProject1;

using System.Net;
using System.Net.Http.Json;


public class BasicTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public BasicTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetEmployees_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/employees");
        Assert.True(response.IsSuccessStatusCode);
    }

	// testing if employee/{id} for existing employee works
    [Fact]
    public async Task GetEmployeeById_ReturnsOkResult()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/employees/1");

        response.EnsureSuccessStatusCode();
    }

	// testing if POST /employees with correct request body returns 204
    [Fact]
    public async Task CreateEmployee_ReturnsCreatedResult()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/employees",
            Employee.createEmployee("John", "Doe")
        );

        response.EnsureSuccessStatusCode();
    }

	// testing if incorrect request body correctly returns a bad request
    [Fact]
    public async Task CreateEmployee_ReturnsBadRequestResult()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/employees",
            new { }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

```