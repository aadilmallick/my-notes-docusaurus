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

## Repository Pattern

Here is the basic terminology:

| Pattern      | Description                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository   | A pattern that allows you to separate the concerns of data storage from the concerns of data access.                                                                                    |
| Factory      | A pattern that allows you to separate the concerns of object creation from the concerns of object usage. **A fancy name for an object that is responsible for creating other objects.** |
| Unit of Work | A pattern that allows you to group multiple operations into a single unit of work.                                                                                                      |
|              |                                                                                                                                                                                         |


The Repository pattern is a design pattern that allows you to separate the concerns of data storage (e.g. a database) from the concerns of data access.

You can think of it as an abstraction over different concrete data access implementations, whether it be a database, file operations, caching, or in memory array. 

Basically, it follows the D in SOLID for making sure data access follows the pattern of an abstract interface rather than having to refactor code for each type of data access vector.

### Repository Interface

This is how the repository interface should be, as it represents the basic functionality of any data access vector:

```cs
public interface IRepository<T>
{
    T? GetById(int id); // return element with id
    IEnumerable<T> GetAll(); // return entire repository as collection
    void Create(T entity); // add to repository
    void Update(T entity); // update element
    void Delete(T entity); // delete element from repository
}
```

here is what a concrete instantiation of this repository should do:

- `repo.GetAll()`: return all entities in the repository as an enumerable collection.
- `repo.Create(T entity)`: add the specified entity to the repository.
- `repo.Update(T entity)`: update the specified entity within the repository
- `repo.Delete(T entity)`: delete the specified entity from the repository

So you can rethink of a repository as such:

- **repository**: a collection of entities
- **entity**: an element in a repository

Here is an implementation of a repository using an in-memory list as the data access and storage vector:

```cs
public class EmployeeRepository : IRepository<Employee>
{
	private readonly List<Employee> _employees = new();

	public Employee? GetById(int id)
	{
		return _employees.FirstOrDefault(e => e.Id == id);
	}

	public IEnumerable<Employee> GetAll()
	{
		return _employees;
	}

	public void Create(Employee entity)
	{
		if (entity == null)
		{
			throw new ArgumentNullException(nameof(entity));
		}
		var entityWithId = Employee.createEmployee(
			entity.FirstName,
			entity.LastName,
			entity.SocialSecurityNumber,
			entity.Address
		);
		_employees.Add(entityWithId);
	}

	public void Update(Employee entity)
	{
		if (entity == null)
		{
			throw new ArgumentNullException(nameof(entity));
		}
		var existingEmployee = GetById(entity.Id);
		if (existingEmployee != null)
		{
			existingEmployee.FirstName = entity.FirstName;
			existingEmployee.LastName = entity.LastName;
		}
	}

	public void Delete(Employee entity)
	{
		if (entity == null)
		{
			throw new ArgumentNullException(nameof(entity));
		}
		_employees.Remove(entity);
	}
}

```

### Using repositories

The benefit of repositories in C# is not just about a nice clean code design pattern that follows SOLID principles. 

In C-Sharp, the main advantage is that it automatically performs dependency ejection for you, meaning that in each route handler if you add the repository as a service at the beginning, then you can access the repository as an argument within each and every one of your route handlers via dependency injection.

1. Add the repository as a service before defining any routes, where the first type argument is the generic repository interface passing the entity class into it, and the 2nd type argument is the concrete repository implementation.

```cs
builder.Services.AddSingleton<IRepository<Employee>, EmployeeRepository>();
```

And now this is the refactored way with using DI to inject our repository into each route handler:

```cs
// 1. create builder
var builder = WebApplication.CreateBuilder(args);

// 2. add repository as service
builder.Services.AddSingleton<IRepository<Employee>, EmployeeRepository>();

// 3. create app
var app = builder.Build();


var employeeRoute = app.MapGroup("employees");

employeeRoute.MapGet(
	"/",
	(EmployeeRepository repository) =>
	{
		return repository.getAll()
	}
);

// csharpier-ignore
employeeRoute.MapGet( "/{id:int}", (int id, EmployeeRepository repository) =>
	{
		var employee = repository.GetById(id);
		if (employee == null)
		{
			return Results.NotFound();
		}
		return Results.Ok(employee);
	}
);

// csharpier-ignore
employeeRoute.MapPost(
	"/", 
	(CreateEmployeeRequest employee, EmployeeRepository repository) =>
	{
		if ( 
			string.IsNullOrWhiteSpace(employee.FirstName) || string.IsNullOrWhiteSpace(employee.LastName)
		)
		{
			return Results.BadRequest("First name and last name are required.");
		}
		var newEmployee = Employee.createEmployee(
			employee.FirstName, 
			employee.LastName
		);
		repository.Create(newEmployee);
		return Results.Created($"/employees/{newEmployee.Id}", newEmployee);
	}
);

employeeRoute.MapPut(
	"/{id:int}",
	(int id, UpdateEmployeeRequest updatedEmployee, EmployeeRepository repository) =>
	{
		var employee = repository.GetById(id);
		if (employee == null)
		{
			return Results.NotFound();
		}

		employee.SocialSecurityNumber = updatedEmployee.SocialSecurityNumber ?? employee.SocialSecurityNumber;
		employee.Address = updatedEmployee.Address ?? employee.Address;
		return Results.Ok(employee);
	}
);

employeeRoute.MapDelete(
	"/{id:int}",
	(int id, EmployeeRepository repository) =>
	{
		var employee = repository.GetById(id);
		if (employee == null)
		{
			return Results.NotFound();
		}
		repository.Delete(employee);
		return Results.NoContent();
	}
);
```

### Unit testing with repositories

For testing, we can add repositories like so by registering the repository as a service.

```csharp
public BasicTests(WebApplicationFactory<Program> factory)
{
    _factory = factory;

    var repo = _factory.Services.GetRequiredService<IRepository<Employee>>();
    repo.Create(new Employee { FirstName = "John", LastName = "Doe" });
}
```
