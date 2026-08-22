
[![aadilmallick/my-favorite-resources - GitHub](https://gh-card.dev/repos/aadilmallick/my-favorite-resources.svg?fullname=)](https://github.com/aadilmallick/my-favorite-resources/blob/main/coding/Clean%20Code%20Summary.pdf)

## Functions

### Minimize the number of parameters. 

Less parameters means better understanding.

- Avoid functions with three or more parameters.
- One parameter is just perfect. Always examine your code to see if a parameter is really necessary or not. Create another function to eliminate that parameter.
- We can just pass in an object of properties, as a better way to minimize the number of parameters without creating any extra functions.

For example, we can use passing in a single javascript object of options as a better choice compared to many parameters.

```ts
createRectangle({x: 10, y: 9, width: 30, height: 12});
```

### Keep functions small.

Makes functions easier to understand.

- Split up your function body into smaller helper functions to make the function overall smaller.

### Functions should do exactly only one thing

A function is considered to do just one thing if all operations in the function body are on the same level of abstraction and one level below the function name.

- No matter how much stuff your function actually does, the level of abstraction should only be what the purpose of the function already was.
- A `createUser()` function should only contain the logic for creating a user, and should instead delegate stuff like validating user to a `validateEmailAndPassword()` method.
- We keep abstracting functions by splitting them into other functions, and keeping only the logic related to the function inside the function.
- A function could do multiple operations inside of it, but all of its logic really should be towards **one thing**. Extract all other logic not immediately related to the purpose into other functions.

### Don’t mix levels of abstraction

- Don’t mix low-level built-in JavaScript API code with functions and variables that you have already made.
- Don’t mix high levels of abstraction with low levels of abstraction.

### Keep functions pure

Prefer pure functions - functions without side effects

- For the same inputs, you should always get the same outputs.
- Minimize side effects. Don’t mutate variables.
- If we do have side effects, then we must name the function accordingly to let us know that those side effects will occur.

## Control flow

### Nested control flow

- To avoid deeply nested `if` and `else` structures, make sure to use something called **guards**.
    - **guards** are a way of returning early, to avoid complex nesting. If some condition isn’t satisfied, then return early and exit the function.
    - Combine guards with extracting logic into functions, making your code even slimmer.
- A better way instead of returning early is to create **error guards**. This means you throw an error to stop execution, and then handle the error in your code.




## Classes


### Cohesion

**cohesion** is the concept of how much classes use their class properties in their methods. 

> [!NOTE]
> The main goal is to reach **high cohesion** for good class design.


- **high cohesion**: We want to reach high cohesion, where every method uses all of its class properties. We don’t want methods where we only use one or two class properties.
- **Low cohesion** is a clear sign for a class that should maybe just be a data container / data structure instead of an object with a public API (since that public API, the methods, doesn't interact with the internal properties).


Say that `Shop` has three class properties, and in a `getCustomer()` method, we only make use of one property. 1 out of 3. That is not very cohesive.

### Coupling

Coupling refers to the concept of how closely related classes are to each other, like how much code they share or how much their APIs are used in other classes.

> [!NOTE]
> The main goal is to reach **loose coupling** for good class design.

- **loose coupling**: when components are independent, relying on knowledge of other components as little as possible.
- **tight coupling**: when components are too dependent on each other.


![](https://i.imgur.com/F94JIcj.jpeg)

> [!TIP]
> To achieve loose coupling, use the dependency-inversion principle, where you use methods on an interface rather than the concrete subclasses.

![](https://i.imgur.com/tzC0LQq.jpeg)

### S: single responsibility principle

>Each class should have a single general responsibility. Each class should only have one reason to change.

- Rather than having a single large class, you should split up your class into multiple smaller classes.
- This is based on the **single responsibility principle**, which states that each class should be responsible for one purpose.
    - A `Shop` class should only take care of shop duties, and should leave customers to a `Customer` class and products to a `Products` class.
- Each class should have one responsibility

### O: open-closed principle


A class should be open for extension but closed for modification. This means that you should be able to add new functionality to a class without changing the existing code.

For example, let's think of an example where we want to calculate the area of a shape. Instead of doing a bunch of if checks to check which shape it is before calculating the area, we just create a `Shape` interface, have different shapes implement it, and call the same area method on all of them.

```typescript
class AreaCalculator {
  constructor(private shape: Shape) {
    console.log(this.shape.area());
  }
}

interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Square implements Shape {
  constructor(private side: number) {}
  area() {
    return this.side ** 2;
  }
}
```

> [!NOTE]
> Basically everything goes back to dealing with interfaces rather than concrete classes.

### L: liskov-substitution principle

This principle states that objects of a superclass should be replaceable with objects of a subclass without affecting the functionality of the program.

This is a fancy way of saying that if you have a class `A` and a class `B` that extends `A`, you should be able to replace `A` with `B` in any part of the code and the code should still work.

Here is an example:

```typescript
class Bird {
  fly() {
    console.log("I am flying");
  }
}

class Duck extends Bird {
  quack() {
    console.log("Quack quack");
  }
}

function makeBirdFly(bird: Bird) {
  bird.fly();
}

makeBirdFly(new Duck());
```

The Liskov-substitution principle states that a child class should be able to perfectly substitute for its parent class, that is, be capable of doing everything its parent class can.

- Don’t remove any functionality in a child class when extending from a parent class
- Make sure all subclasses have access to all methods and properties of its parent class.

### I: interface segregation principle

> Many client-specific interfaces are better than one general-purpose interface. 

- A class should not implement interfaces that it doesn't use. This is to prevent classes from having to implement methods that they don't need.
- Essentially, never include unnecessary information and force a class to implement it.
- When a class implements an interface, it should use and implement EVERYTHING from the interface, not leaving out any properties or methods. 

> [!NOTE]
> Violating the interface segregation principle leads to low cohesion, which is bad.


### D: Dependency inversion principle

>"Program to interfaces, not implementations."

>High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

> [!NOTE]
> Basically in your classes, type variables as interfaces instead of concrete classes. This prevents tight coupling and promotes loose coupling. 

Examples of this pattern are any patterns that use polymorphism so that we can use all subclasses of a parent class in the exact same way.

- **strategy pattern**
- **observer pattern**


![](https://i.imgur.com/FBU7Cbo.jpeg)



### Law of Demeter

The Law of Demeter states that a module should not know about the internal workings of the objects it interacts with. It should only know about its immediate friends.

Prevent deeply nested object property access when dealing with class instances.

## Enterprise Code

### managing complexity

#### The three rules

When writing functions, there are three golden rules to follow:

1. **make sure know what the function returns** at all times. The output should essentially be deterministic and known.
2. **Make sure the code is reusable**
3. **Make sure the code is testable**

To remember these three rules better, ask yourself these three questions when writing a function:

1. Do I know what this function returns?
2. Can I reuse this function?
3. Can I test this function? 

#### Remove Hidden state

**Hidden state** is the idea that a class property or global variable outside of the function influences the return value of that function or how that function executes. 

Hidden state is extremely difficult to track and violates rule 1: *always know what your functions return.*

Here is an example of code that uses hidden state and violates rule 1 through the `mode` property:

![](https://i.imgur.com/6BpJJ8q.png)


There are two ways to mitigate complexity brought by hidden state:

- **dependency injection**: Accept class properties as parameters to functions or opt for a functional programming approach.
- **extract to method**: Use your IDE to select a couple problematic lines and extract them to a method.

#### Fine-grained code vs coarse-grained code

These terms are based on SOLID design principle, specifically on the D for dependency-inversion principle.

Here is an example of what coarse-grained code looks like:

![](https://i.imgur.com/AYBRG8P.png)

why is it that way? Because you have to mentally parse what each line of code is doing to say, "Ok, this is how it updates or deletes". Understanding of what the code is doing is not immediate since there are too many low level details in the same function.

And here is find-grained code, where the immediate difference is you can understand exactly what the code is trying to do, depending on abstractions rather than details:

![](https://i.imgur.com/4gkbhyu.png)

### Reducer functions

Reducer functions are important ways to manage state changes in a clean code way. Here is an example of what they do and how they look like:

- **first parameter**: The first parameter is the **state** that the reducer handles
- **second state**: The second parameter is the **action**, which includes `action.type` that specifies the state change event to trigger and `action.payload` for the data to pass into the state change.

![](https://i.imgur.com/HMIITRQ.png)

Here's a level 1 abstraction that's not so bad:

```ts
type ReducerTypes<
  ActionTypes extends readonly string[],
  State,
  PayloadTypes extends Partial<Record<ActionTypes[number], unknown>>
> = {
  [K in ActionTypes[number]]: (
    state: State,
    action: {
      // type: K;
      payload: PayloadTypes[K] extends object ? PayloadTypes[K] : never;
    }
  ) => State;
};

type ActionTypes = ["ADD", "SQUARE", "CUBE"];

type Reducer = ReducerTypes<
  ActionTypes,
  { a: number; b: number; c: number },
  {
    ADD: {
      incrementBy: 1;
    };
  }
>;

const reducer: Reducer= {
  ADD: (state, action) => {
    return { ...state, a: state.a + action.payload.incrementBy };
  },
  SQUARE: (state, action) => {
    return { ...state, c: state.c + 1 };
  },
  CUBE: (state, action) => {
    return { ...state, b: state.b + 1 };
  },
};
```

Here's a level 2 abstraction that keeps track of state

```ts
// Simplified reducer types that work better with TypeScript
type ReducerAction<T extends string, P = any> = {
  type: T;
  payload: P;
};

type ReducerFunction<State, ActionType extends string, Payload = any> = (
  state: State,
  action: ReducerAction<ActionType, Payload>
) => State;

type ReducerMap<State, Actions extends Record<string, any>> = {
  // @ts-ignore
  [K in keyof Actions]: ReducerFunction<State, K, Actions[K]>;
};

function createReducer<
  State extends Record<string, any>,
  PayloadMap extends Record<string, any>
>(initialState: State, reducers: ReducerMap<State, PayloadMap>) {
  let state = { ...initialState };

  const getState = () => state;
  const setState = (newState: State) => {
    state = { ...newState };
    observers.forEach((cb) => cb(state));
  };

  const dispatch = <K extends keyof PayloadMap>(
    type: K,
    payload: PayloadMap[K]
  ): State => {
    const reducer = reducers[type];
    if (reducer) {
      const newState = reducer(getState(), {
        type: String(type) as K,
        payload,
      });
      setState(newState);
      return newState;
    }
    return getState();
  };

  // todo: add observers
  const observers = new Map<string, (state: State) => void>();

  const subscribe = (key: string, cb: (state: State) => void) => {
    observers.set(key, cb);
  };

  const unsubscribe = (key: string) => {
    observers.delete(key);
  };

  return {
    getState,
    dispatch,
    reducers,
    subscribe,
    unsubscribe,
  };
}

// Example usage with proper typing
const simpleReducer = createReducer(
  { a: 1, b: 2 },
  {
    SET_A: (state, action: ReducerAction<"SET_A", { value: number }>) => ({
      ...state,
      a: action.payload.value,
    }),
    SET_B: (state, action: ReducerAction<"SET_B", { value: number }>) => ({
      ...state,
      b: action.payload.value,
    }),
  }
);

// Test the reducer
simpleReducer.dispatch("SET_A", { value: 10 });
simpleReducer.dispatch("SET_B", { value: 20 });
simpleReducer.dispatch("SET_A", { value: 30 });
simpleReducer.dispatch("SET_A", { value: 40 });
```

### FOlder structure

The best folder structure is based on having a `features` folder, with each subfolder containing all the code for a feature.

For example, this is how a single feature in NextJS would look like, being subdivided into server and client:

![](https://i.imgur.com/68i9H4M.png)


### Error handling

- **The Problems with Naive Handling:** Simply scattering _try/catch_ blocks throughout a codebase creates **duplicated logic**, makes code hard to reuse, and ignores the potential for unhandled, unexpected errors.
- **The Service Layer Approach:** Moving business logic into a dedicated service layer allows for shared functionality across both server actions and API routes. However, relying on custom error classes can still leave gaps in **compile-time type safety**.
- **The Result Type Pattern:** By returning a discriminated union (a `Result` type) that represents either a success or a failure, developers are forced to explicitly handle all possible error states. Using the `satisfies` keyword ensures that every error case is accounted for, preventing future bugs when errors are added or removed.
- **Leveraging Libraries:** Use `neverthrow`, a library that formalizes the Result pattern. It provides utilities like `match` and `andThen` to chain operations, and suggests using an ESLint plugin to enforce that developers actually handle every returned error.

So basically follow these steps:

1. Extract `try/catch` functionality into its own helper function
2. Create abstractions over business logic into its own service so you're not writing raw code in API route handlers, instead abstracting that into an OOP service,
3. Create custom error classes that are easy to identify what actually went wrong.


## Antipatterns

### Storing booleans in DB

<iframe width="560" height="315" src="https://www.youtube.com/embed/xIRL3klHM9I?si=EFRAa_a98Cua35Yv" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


> if data can be derived, then derive it instead of storing it.

Booleans are the main issue with the above law of coding. Often, you will have data stored in your DB that you can use to derive some boolean value. These booleans should not be stored in the DB but rather derived at runtime from data.

here are the numerous advantages of deriving booleans instead of storing them:

- Less data to be stored in DB
- Less faulty logic - multiple booleans lead to terrible logic and broken states.

### deeply nested data


- **Rule**: Flatten data structures by storing entities in separate collections with ID references
- **Anti-pattern**: Deep nesting creates complex dependencies and update patterns
- **Best practice**: Normalize data to avoid redundancy and ensure consistency
- **Benefits**:
    - Simplified updates with O(1) lookups instead of O(n+m) traversals
    - Better performance with minimal re-renders
    - Cleaner, more maintainable reducer logic
    - Easier implementation of cross-entity operations



Deeply nested data structures like so where an object has a sub-collection (an array of objects) lead to O(n x m) updates and traversals, leading to less performant code.


```ts
// ❌ Nested structure
interface NestedState {
  destinations: Array<{
    id: string;
    name: string;
    todos: Array<{
      id: string;
      text: string;
    }>;
  }>;
}
```

This is bad. for example, to find a specific todo within a specific destination, the code complexity would be O(n + m):

```ts
function findTodo(state: NestedState, destinationId: string, todoId: string) {
	// O(n)
	const destination = state.destinations.find(
		dest => dest.id === destinationId
	)
	// O(m)
	const todo = destination.todos.find(todo => todo.id === todoId)
	return todo // O (n + m)
}
```

You can normalize it better, like so, modeling relational tables like SQL, and instead of using arrays, you can model a collection as a large, flat object, where each key in a collection object is an ID that maps to the actual record, resulting in O(1) lookup, especially when used with a map.

```ts
// ✅ Normalized structure
interface NormalizedState {
  destinations: { [id: string]: { id: string; name: string } };
  todos: { [id: string]: { id: string; text: string; destinationId: string } };
}
```

Now to find a specific todo, the code becomes O(1):


```ts
function findDestinationOfTodo(state: NestedState, todoId: string) {
	const destinationId = state.todo[todoId].destinationId // O(1)
	return state.destinations[destinationId] // O(1)
}
```

**Deeply Nested Updates**

The current travel itinerary application stores data in a deeply nested structure where each destination contains an array of todos. This creates several problems:

When updating or deleting a todo item, the reducer must:

1. Find the correct destination by mapping through all destinations
2. Find the correct todo within that destination's todos array
3. Create a new nested structure preserving immutability

```ts
// ❌ Complex nested update - hard to read and error-prone
destinations: state.destinations.map((dest) =>
  dest.id === action.destinationId
    ? {
        ...dest,
        todos: dest.todos.filter((todo) => todo.id !== action.todoId),
      }
    : dest
);
```

**Performance Issues**

- **O(n×m) complexity**: Every todo operation requires iterating through destinations AND todos
- **Unnecessary re-renders**: Updating one todo causes the entire destinations array to be recreated
- **Memory overhead**: Deeply nested objects are harder for JavaScript engines to optimize

**Code Complexity**

- Reducer logic becomes increasingly complex with more nesting levels
- Difficult to implement features like global todo search or cross-destination operations
- Error-prone when adding new nested relationships

**benefits of data normalization**

Normalization flattens the data structure by storing entities in separate collections and using IDs to reference relationships:

**Simplified Updates**

```ts
// ✅ Normalized - direct and clear
case 'DELETE_TODO':
  return {
    ...state,
    todos: state.todos.filter(todo => todo.id !== action.todoId)
  }
```

**Better Performance**

- **O(1) lookups**: Direct access to entities by ID using objects/Maps
- **Minimal re-renders**: Only affected components re-render
- **Efficient operations**: No need to traverse nested structures

**Code Clarity**

- Each entity type has clear, focused update logic
- Easy to implement complex queries and cross-entity operations
- Reducer actions become more predictable and testable

---

### God classes

A "God Class" is a class that knows too much or does too much. It centralizes control and functionality, violating the Single Responsibility Principle (SRP). Instead of distributing responsibilities across multiple, well-defined classes, a God Class attempts to handle a wide range of tasks within a single entity.

Here are the three characteristics of an actual good class we want, all of which god classes violate:

1. **single responsibility principle**: We want all classes to do only one thing
2. **high cohesion**: all methods in a class should use most if not all of the properties on a class. Basically, the method should make sense for being there.
3. **loose coupling**: A change in one class should not affect how another class works. If that happens, then you have tight coupling, which is a bad thing that leads to a lot interdependency between classes, making refactoring a nightmare.
#### Characteristics of a God Class

- **High Complexity:** God Classes tend to have a large number of methods and attributes, making them difficult to understand and navigate.
- **Low Cohesion:** The methods within a God Class often perform unrelated tasks, leading to low cohesion. **Cohesion** refers to the degree to which the elements inside a module belong together.
- **High Coupling:** God Classes are often tightly coupled to other classes in the system. Other classes depend on the God Class for many different things, making it difficult to change the God Class without affecting other parts of the system.
- **Large Size:** God Classes are typically very large in terms of lines of code.
- **Centralized Control:** They often act as central controllers, orchestrating the behavior of other classes.

#### Problems Caused by God Classes

- **Reduced Maintainability:** The complexity of God Classes makes them difficult to understand, modify, and debug. Any change to a God Class can have unintended consequences in other parts of the system.
- **Increased Coupling:** God Classes increase coupling between different parts of the system. This makes it difficult to reuse components and increases the risk of cascading failures.
- **Reduced Testability:** Testing God Classes is challenging because they have many responsibilities and dependencies. It's hard to isolate specific behaviors for testing.
- **Hindered Reusability:** The broad scope of God Classes makes them difficult to reuse in other contexts.
- **Increased Development Time:** Developers spend more time understanding and modifying God Classes, leading to increased development time and costs.
- **Performance Bottlenecks:** Due to their size and complexity, God Classes can become performance bottlenecks in the system.

## Design Patterns

There are three main types of design patterns, of which all patterns fall into one of these three categories:

- **creational patterns**: patterns around instantiating objects
- **structural patterns**: patterns around structuring objects and providing them with functionality.
- **behavioral patterns**: patterns around adding behavior to an object.

### Creational patterns

#### Singleton pattern

Singletons are classes which can be instantiated once, and can be accessed globally. This _single instance_ can be shared throughout our application, which makes Singletons great for managing global state in an application.

```ts
let instance;
let counter = 0;

class Counter {
  constructor() {
    if (instance) {
      throw new Error("You can only create one instance!");
    }
    instance = this;
  }

  getInstance() {
    return this;
  }

  getCount() {
    return counter;
  }

  increment() {
    return ++counter;
  }

  decrement() {
    return --counter;
  }
}

// use Object.freeze() to make sure we don't modify the singleton
const singletonCounter = Object.freeze(new Counter());
export default singletonCounter;
```

#### Factory pattern

The factory pattern is a way of abstracting the instantiation of multiple classes by delegating it to an external function. This gives you more control over the way things are instantiated and a simpler way to know which classes exist:

```ts
class Person {
    toString() {
        return "Person"
    }
}

class Employee extends Person {
    toString() {
        return "Employee"
    }
}

class Employer extends Person {
    toString() {
        return "Employer"
    }
}

const factoryMap = {
    "employee": Employee,
    "employer": Employer,
} satisfies Record<string, new (...args: any[]) => Person>;


function createFactory<TMap extends Record<string, new (...args: any[]) => any>>(map: TMap) {
    // 3. The returned function takes a specific Key from the map
    return <Key extends keyof TMap>(
        key: Key, 
        ...constructorArgs: ConstructorParameters<TMap[Key]>
    ): InstanceType<TMap[Key]> => {
        
        const Constructor = map[key];
        
        // We use a type assertion here because TypeScript struggles to 
        // safely correlate a dynamic generic constructor with dynamic arguments
        return new Constructor(...constructorArgs) as InstanceType<TMap[Key]>;
    }
}

const factory = createFactory(factoryMap)
const employee = factory("employee") // of type Employee
```

The factory method design pattern is a way to create objects by defining an interface or abstract class for creating them, but leaving the actual creation to subclasses. This means you can write flexible code that doesn’t need to know the exact types of objects it’s working with.  


![](https://i.imgur.com/rxC545l.jpeg)


  
**Benefits**
  
- **loose coupling**: It promotes loose coupling by separating object creation from usage.
- **makes code easy to modify**: It centralizes class creation in one place, making it easier to add new classes without changing existing code.
- It’s useful when building libraries or frameworks that need to support various use cases.
- **compatible with singleton pattern**: It can save resources by reusing existing objects instead of creating new ones each time.

**Cons**

- **complexity over time**: it can add complexity if too many subclasses are created.

**Code example**


```ts
// Abstract product 
abstract class Furniture {
    public abstract assemble(): void;
}

// concrete product 1
class Chair extends Furniture {
    public assemble(): void {
        console.log('Assembling a chair.');
    }
}

// concrete product 2
class Table extends Furniture {
    public assemble(): void {
        console.log('Assembling a table.');
    }
}

// Factory w/ factory method 
abstract class FurnitureFactory {
    public abstract createFurniture(type: string): Furniture;
}

class ConcreteFurnitureFactory extends FurnitureFactory {
    public createFurniture(type: string): Furniture {
        if (type === 'chair') {
            return new Chair();
        } else if (type === 'table') {
            return new Table();
        } else {
            throw new Error('Furniture type not supported.');
        }
    }
}

function factoryClient() {
    const factory = new ConcreteFurnitureFactory();
    const chair = factory.createFurniture('chair');
    chair.assemble();
    const table = factory.createFurniture('table');
    table.assemble();
}

factoryClient()
```

#### Abstract factory method

An abstract factory method abstracts even more on top of a factory method because you return abstract classes from the factory instead of individual concrete classes.

The Abstract Factory pattern is a design approach that lets you create families of related objects without specifying their exact classes upfront. It defines an interface or abstract class for creating these related objects, and the actual creation is handled by subclasses.  


![](https://i.imgur.com/qeDwAmn.jpeg)

Here are the main components:

- **abstract factory interface**: defines a shared contract all concrete factories should implement.
- **concrete factory**: a concrete factory function that adheres to the factory interface and creates concrete products that adhere to an abstract product interface.

Here are the details:

- **benefits**
	- It groups multiple Factory Method patterns to manage a family of products.
	- Unlike the Factory Method, which creates one product, the Abstract Factory creates a whole set of related products.
	- It uses composition to delegate creation responsibilities to subclasses.
	- It helps ensure that related objects work well together since they come from the same family.
	- It centralizes object creation, making it easier to introduce new product families without breaking existing code.
- **con**: however, it can add complexity due to the many interfaces and classes involved. 
- **usage**: This pattern is useful when your code needs to handle multiple related objects that should be created together but whose exact types aren’t known until runtime.
	- **don't know exact dependencies beforehand**
	- **want to allow future expansion of codebase**



```ts
// Product Interfaces
abstract class Chair {
    abstract sitOn(): void;
}

abstract class Table {
    abstract eatOn(): void;
}

// Concrete Products
class ModernChair extends Chair {
    sitOn(): void {
        console.log("Sitting on a modern chair.");
    }
}

class ModernTable extends Table {
    eatOn(): void {
        console.log("Eating on a modern table.");
    }
}

class VictorianChair extends Chair {
    sitOn(): void {
        console.log("Sitting on a victorian chair.");
    }
}

class VictorianTable extends Table {
    eatOn(): void {
        console.log("Eating on a victorian table.");
    }
}


// Abstract Factory
abstract class FurnitureFactory {
    abstract createChair(): Chair;
    abstract createTable(): Table;
}


// Concrete Factories
class ModernFurnitureFactory extends FurnitureFactory {
    createChair(): Chair {
        return new ModernChair();
    }
    createTable(): Table {
        return new ModernTable();
    }
}

class VictorianFurnitureFactory extends FurnitureFactory {
    createChair(): Chair {
        return new VictorianChair();
    }
    createTable(): Table {
        return new VictorianTable();
    }
}

// Implement the Abstract Factory

function furnitureClient(factory: FurnitureFactory) {
    const chair = factory.createChair();
    const table = factory.createTable();
    chair.sitOn();
    table.eatOn();
}

// Create modern furniture
furnitureClient(new ModernFurnitureFactory());

// Create victorian furniture
furnitureClient(new VictorianFurnitureFactory());
```

> [!NOTE]
> Basically, abstract factory takes in a concrete factory that then actually creates the individual class instances.

#### Builder pattern

The purpose of the builder pattern is to separate the construction of a complex object from its representation so that the same construction process can represent different representations.

basically the idea is that instead of having a ton of constructor arguments, just have chaining methods that return `this` and allow you to iteratively build the object instance with the desired properties you want.

> [!NOTE]
> This is overkill. You can also just accept an object of arguments, with default or optional arguments and that would be a lot easier.


The builder design pattern solves several key problems:  
  
- **simpler constructors**: It eliminates the need for constructors with many optional parameters (telescoping constructors), allowing you to set parameters step-by-step instead of all at once.
- **more flexibility without creating multiple classes**: It enables creating different representations of the same object, like different types of burgers, using the same class.
- **object creation simplicity**: It helps construct complex objects in a manageable, step-by-step way, isolating complex code parts.

![](https://i.imgur.com/h7PXAWR.jpeg)

The builder pattern has several key components that work together to create complex objects step-by-step:  
  

- **Builder Interface:** This defines all the methods needed to build parts of the final object. It acts as a blueprint for creating different representations.
- **Concrete Builder Classes:** These implement the builder interface and contain the actual code to build the parts of the object. Each builder can create a different version of the product.
- **Director:** This class controls the construction process by defining the order in which the builder's methods are called. It allows reusing different building sequences.
- **Client:** The client assigns a specific builder to the director and initiates the construction. It interacts with the director to get the final product.


```ts
class Burger {
    name: string
    cheese: boolean
    bacon: boolean
    lettuce: boolean
    tomato: boolean
    
    constructor(name: string, cheese: boolean, bacon: boolean, lettuce: boolean, tomato: boolean) {
        this.name = name
        this.cheese = cheese
        this.bacon = bacon
        this.lettuce = lettuce
        this.tomato = tomato
    }

    showDetails() : string {
        let details = "This " + this.name  + " Burger has: "

        if(this.cheese) {
            details = details + " Cheese, "
        }

        if(this.bacon) {
            details = details + " Bacon, "
        }

        if(this.lettuce) {
            details = details + " Lettuce, "
        }

        if(this.tomato) {
            details = details + " Tomato "
        }

        return details

    }
}

class BurgerBuilder {

    private name: string
    private cheese: boolean = false
    private bacon: boolean = false
    private lettuce: boolean = false
    private tomato: boolean = false
    
    constructor(name: string) {
        this.name = name
    }
    
    addCheese(): BurgerBuilder {
        this.cheese = true
        return this
    }
    
    addBacon(): BurgerBuilder {
        this.bacon = true
        return this
    }
    
    addLettuce(): BurgerBuilder {
        this.lettuce = true
        return this
    }
    
    addTomato(): BurgerBuilder {
        this.tomato = true
        return this
    }
    
    build(): Burger {
        return new Burger(this.name, this.cheese, this.bacon, this.lettuce, this.tomato)
    }
}

// Usage

function builderClient() {
    const everythingBurgerBuilder = new BurgerBuilder("Everything")
    const everythingBurger = everythingBurgerBuilder
	    .addCheese()
	    .addBacon()
	    .addLettuce()
	    .addTomato()
	    .build()
    
    console.log(everythingBurger.showDetails()) 
    const cheeseBurgerBuilder = new BurgerBuilder("Cheese")
    const cheeseBurger = cheeseBurgerBuilder.addCheese().addTomato().build() 
    console.log(cheeseBurger.showDetails())
}
builderClient()


```


#### Prototype pattern

The prototype design pattern is a creational pattern that helps you create copies of objects efficiently without depending on their classes.

1. It works by defining a prototype interface with a cloning method, which concrete prototype objects implement. 
2. When you need a copy, the client produces it from this prototype interface.  
  
Key benefits include:  
  

- Objects copied this way are independent, so changes to one don’t affect the other.
- It reduces the need for creating many subclasses.
- It avoids repeated initialization by cloning existing objects.

  
However, copying complex objects can be tricky and may introduce errors. 

This pattern is especially useful when your classes are only initialized at runtime and you want to manage object creation flexibly in TypeScript.


```ts
// Prototype Interface
abstract class Shape  {
    abstract print() : void
    abstract clone() : Shape
}

// Concrete Prototype

class Circle extends Shape {
    color: string 
    
    constructor(color: string) {
        super()
        this.color = color
    }

    print() : void {
        console.log(this.color + " circle")
    }

    clone() : Shape {
        console.log("Cloning a " + this.color + " circle")
        return new Circle(this.color)
    }
}



// Client 
function circleClient() {

    let greenCircle = new Circle("Green")
    let blueCircle = new Circle("Blue")
    let redCircle = new Circle("Red")



    let greenClone = greenCircle.clone()
    let blueClone = blueCircle.clone()
    let redClone = redCircle.clone()


    greenCircle.print()
    blueCircle.print()
    redCircle.print()
    greenClone.print()
    blueClone.print()
    redClone.print()

}

circleClient()

```

### Structural patterns

#### Adapter patterns

The adapter design pattern acts as a bridge between two incompatible types by using a single interface to connect different functionalities, where both sides are unaware that there is an adapter.

- It allows you to use a class that otherwise wouldn't fit with your existing code by wrapping it in an adapter. 
- This pattern is useful when you want to reuse subclasses that don't share common functionality but need to work together. 
- In TypeScript, the adapter implements the client interface and handles incompatible services through wrapper functions, keeping your business logic separate from the interface. 
- This approach follows good design principles like single responsibility and open/closed, making your code more flexible, though it can get complex as you add more adapters.

Here are the pros of the adapter pattern:

1. Uses single responsibility principle
2. Follows the open/closed principle

Here are the cons of the adapter pattern:

- Code gets complex as clients and services grow and you have to adapt to all of them.

There are two types of adapter patterns:

- **object adapter**: uses composite pattern to accept a concrete object into its class and then wrap functionality around that.
	- **universality**: universal across all programming languages
- **class adapter**: adapter inherits interfaces from both objects at the same time
	- **universality**: only in languages with multiple inheritance 


![](https://i.imgur.com/Vc8l5Xq.jpeg)

- **client**: a specific piece of functionality that contains business logic
- **client interface**: interface that represents the shared contract of all the functionality a client exposes.
- **adapter**: implements the client interface and uses the service to do so, providing custom business logic to use the methods on the service to implement the client interface.
- **service**: a separate piece of business logic you want to adapt to the client.

```ts
// Client 
class Publisher {
    constructor () {}

    publishContentOnPlatform(platform: Platform){
        console.log("Pubisher is ready to post your content")
        platform.postMedia()
    }
}


// Client Interface
abstract class Platform  {
    abstract postMedia() : void
}


// Compatible Services
class Instagram extends Platform {

    postMedia() {
        console.log("Instagram has published your post.")
    }
}


// Incompatible Service
class TikTok {
    constructor(){}

    scheduleMedia(){
        console.log("TikTok is ready to schedule your post.")
    }
}

// Adapter 
class TikTokAdapter extends Platform {
    tikTok : TikTok
    constructor(tikTok : TikTok) {
        super()
        this.tikTok = tikTok
    }

    postMedia() {
        this.tikTok.scheduleMedia()
        console.log("Adapter has posted the TikTok content.")
    }
}

function adapterClient() {

    let publisher = new Publisher()
    let instagram = new Instagram()

    publisher.publishContentOnPlatform(instagram)

    // Using the Adapter 
    let tikTok = new TikTok()
    let tikTokAdapter = new TikTokAdapter(tikTok)

    publisher.publishContentOnPlatform(tikTokAdapter)
}

adapterClient()
```
#### Proxy pattern

The proxy pattern is a way to hook into getters and setters of an object and provide additional functionality on top of that, running side effects on every get or set.

In JavaScript, we have a native implementation to hook into the proxy pattern using the `Proxy` object like so:

```ts
const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    if (!obj[prop]) {
      console.log(
        `Hmm.. this property doesn't seem to exist on the target object`
      );
    } else {
      console.log(`The value of ${prop} is ${obj[prop]}`);
    }
  },
  set: (obj, prop, value) => {
    if (prop === "age" && typeof value !== "number") {
      console.log(`Sorry, you can only pass numeric values for age.`);
    } else if (prop === "name" && value.length < 2) {
      console.log(`You need to provide a valid name.`);
    } else {
      console.log(`Changed ${prop} from ${obj[prop]} to ${value}.`);
      obj[prop] = value;
    }
  },
});
```

#### Composite pattern

The Composite pattern lets you compose objects into tree structures to represent part-whole hierarchies. It allows clients to treat individual objects (Leaves) and compositions of objects (Branches/Composites) uniformly.

There are three components to this pattern:

1. **shared interface**: The shared interface both the composite and leaf classes implement so that you can treat composites and leaves the exact same.
2. **leaf class**: A concrete class implementation of a single object, implementing the shared interface.
3. **composite class**: A concrete class implementation of handling an array of leaf objects, called **composites**, implementing the shared interface.

```ts
// 1. The shared interface
interface FileSystemNode {
    getSize(): number;
    getName(): string;
}

// 2. The "Leaf" (Individual object)
class FileNode implements FileSystemNode {
    constructor(private name: string, private size: number) {}
    getName() { return this.name; }
    getSize() { return this.size; }
}

// 3. The "Composite" (Contains leaves or other composites)
class DirectoryNode implements FileSystemNode {
    private children: FileSystemNode[] = [];

    constructor(private name: string) {}

    add(node: FileSystemNode) { this.children.push(node); }

    getName() { return this.name; }
    
    // The magic: Directory calculates size by recursively summing its children
    getSize() {
        return this.children.reduce((total, child) => total + child.getSize(), 0);
    }
}
```

Here are the main use cases for when you would want to use the composite pattern:

- You want a tree-like object structure.
- You want simple and complex objects to be treated the same way.


![](https://i.imgur.com/P2cjWn6.jpeg)

- **Component:** An interface describing operations for both simple and complex elements.
- **Leaf:** Implements the component interface and represents simple objects without children.
- **Composite:** A container that holds leaves or other composites, delegating tasks to its children.
- **Client:** Interacts with all elements through the component interface.


This pattern is great for building hierarchical structures and follows the open/closed principle, so you can add new classes without breaking existing code.


```ts
// Component Interface 
abstract class Member  {
    abstract printMemberInfo() : void
}
 

 // Leaf 
class TeamMember extends Member {
    name : string
    teamNumber: number 
    position : string 

    constructor(name: string, teamNumber: number, position: string) {
        super()
        this.name = name
        this.teamNumber = teamNumber
        this.position = position
    }

    printMemberInfo(): void {
        console.log("Name: %s Team Number: %d Position: %s\n", 
        this.name, this.teamNumber, this.position)
    }

}
 
 

// Composite
 class Roster extends Member {
     members : Member[] = []
     name : string 
 
     constructor(name: string) {
         super()
         this.name = name
     }
 
    printMemberInfo(): void {
        console.log("Here's the roster for team: " + this.name)
        for(let i = 0; i < this.members.length; i++) {
            this.members[i].printMemberInfo()
        }
    }
 
     add(m : Member) : void{
         this.members.push(m)
     }
 }
 

// Initialize our team members
let member1 = new TeamMember("Johnny Rocket", 12, "Forward")
let member2 = new TeamMember("Tim Hoops", 24, "Point Guard")
let member3 = new TeamMember("Billy Banks", 29, "Shooting Guard")

// Initialize our roster 
let roster = new Roster("Bobcats")

// Add team members to our roster 
roster.add(member1)
roster.add(member2)
roster.add(member3)

// print out the member info
roster.printMemberInfo()
```
#### Decorator pattern

The Decorator pattern allows you to dynamically attach new behaviors or responsibilities to an object by placing it inside special wrapper objects.

Instead of creating massive inheritance chains (e.g., `DarkRoastWithMilkAndSugar`), you create a base object (`DarkRoast`) and wrap it in decorators (`Milk`, `Sugar`). The decorator implements the exact same interface as the object it wraps, intercepting calls to modify the input or output.

```ts
// 1. The shared interface
interface Coffee {
    cost(): number;
    description(): string;
}

// 2. The "Base Component"
class SimpleCoffee implements Coffee {
    cost() { return 2.00; }
    description() { return "Simple Coffee"; }
}

// 3. The "Decorator" base class
abstract class CoffeeDecorator implements Coffee {
    constructor(protected coffee: Coffee) {} // Wraps the interface!
    
    cost() { return this.coffee.cost(); }
    description() { return this.coffee.description(); }
}

// 4. Concrete Decorators
class MilkDecorator extends CoffeeDecorator {
    cost() { return super.cost() + 0.50; }
    description() { return super.description() + ", Milk"; }
}

class SugarDecorator extends CoffeeDecorator {
    cost() { return super.cost() + 0.25; }
    description() { return super.description() + ", Sugar"; }
}

const myCoffee = new SugarDecorator(new MilkDecorator(new SimpleCoffee()))
console.log(myCoffee.cost()) // 2.00 + 0.50 + .25
```

The main purpose of the decorator pattern is to dynamically add new functionality to a specific object without affecting other objects of the same class. 

- It wraps the original object with decorator classes, allowing you to extend behavior flexibly and avoid the complications of inheritance. 
- This is especially useful when only some objects need extra features, keeping your code clean and focused on single responsibilities.


![](https://i.imgur.com/nQbuR2t.jpeg)

- **component interface**: Declares the structure for all the wrappers and wrapped objects. 
- **concrete component**: the class that is being wrapped by the decorator. It defines the basic behavior the decorator can alter.
- **base decorator**: delegates all the operations to the wrapped object 
- **concrete decorator**: concrete subclass of a base decorator that defines extra functionality that can be added to an object dynamically, overriding functionality of the base decorator

```ts
// Component Interface 
abstract class  AbstractIceCream  {
	abstract addToppings() : string
}

// Concrete Component
class IceCream extends AbstractIceCream {
    flavor : string 

    constructor(flavor : string) {
        super()
        this.flavor = flavor
    }

    addToppings() : string {
        return "2 scoops of " + this.flavor
    }
}

// Base Decorators
abstract class IceCreamDecorator  {
	abstract makeIceCream() : void 
}


// Concrete Decorator 1
class Sprinkles extends IceCreamDecorator {
    iceCream : AbstractIceCream

    constructor(iceCream : AbstractIceCream) {
        super()
        this.iceCream = iceCream
    }

    addToppings(): string {
        let currentOrder = this.iceCream.addToppings()
        return currentOrder + " and Rainbow Sprinkles"
    }

    makeIceCream() : void {
        console.log("Here's Your Ice Cream Order")
        console.log(this.addToppings())
        console.log()
    }
}

// Concrete Decorator 2
class Syrup extends IceCreamDecorator {
    iceCream : AbstractIceCream

    constructor(iceCream : AbstractIceCream) {
        super()
        this.iceCream = iceCream
    }

    addToppings(): string {
        let currentOrder = this.iceCream.addToppings()
        return currentOrder + " and Chocolate Syrup"
    }

    makeIceCream() : void {
        console.log("Here's Your Ice Cream Order")
        console.log(this.addToppings())
        console.log()
    }
}


let iceCream = new IceCream("Chocolate")


let iceCreamWithSprinkles = new Sprinkles(iceCream)
iceCreamWithSprinkles.makeIceCream()

let iceCreamWithSprinkesAndChocolateSyrup = new Syrup(          iceCreamWithSprinkles 
)
iceCreamWithSprinkesAndChocolateSyrup.makeIceCream()



```
#### Composites and Decorators abstraction

```ts
// The universal interface
export interface Executable<T> {
    execute(): T;
}

// 1. Generic Leaf: The raw data or base execution
export class Leaf<T> implements Executable<T> {
    constructor(private payload: T | (() => T)) {}

    execute(): T {
        // Allows both static values and lazy evaluation
        return typeof this.payload === 'function' 
            ? (this.payload as () => T)() 
            : this.payload;
    }
}

// 2. Generic Composite: Combines multiple Executables
export class Composite<T> implements Executable<T> {
    private children: Executable<T>[] = [];
    
    // Accepts a strategy to reduce an array of T into a single T
    constructor(private aggregatorStrategy: (results: T[]) => T) {}

    add(child: Executable<T>): this { 
        this.children.push(child); 
        return this; // Return 'this' for chainability
    }

    execute(): T {
        // Execute all children, then aggregate the results
        const results = this.children.map(child => child.execute());
        return this.aggregatorStrategy(results);
    }
}

// 3. Generic Decorator: Intercepts and mutates a single Executable
export class Decorator<T> implements Executable<T> {
    constructor(
        protected component: Executable<T>, 
        private mutationStrategy: (result: T) => T
    ) {}

    execute(): T {
        // Intercept the execution and apply the mutation
        const result = this.component.execute();
        return this.mutationStrategy(result);
    }
}
```

We can use this as a string builder scenario:

```ts
// Leaves
const title = new Leaf("Hello World");
const body = new Leaf("This is built with patterns.");

// Composite: Join strings with line breaks
const document = new Composite<string>((results) => results.join("\n"));
document.add(title).add(body);

// Decorators: Wrap elements in HTML tags
const h1Title = new Decorator<string>(title, (text) => `<h1>${text}</h1>`);
const pBody = new Decorator<string>(body, (text) => `<p>${text}</p>`);

// Re-compose with the decorated HTML elements
const htmlDocument = new Composite<string>((results) => results.join("\n"));
htmlDocument.add(h1Title).add(pBody);

console.log(htmlDocument.execute());
// Output:
// <h1>Hello World</h1>
// <p>This is built with patterns.</p>
```

#### Facade pattern

The facade pattern is simply a single class that wraps around the complexities of a library or framework just to abstract around it and make it easier to use. 

Here are the main use cases:

- When you want a limited but straightforward interface to a complex system, when you want to hide a lot of business logic to make the code simpler.
- When you want to structure a system into layers and prevent tight coupling.




### Behavioral patterns

#### Request, handler, and next pattern

This pattern is what makes the express request, middleware, and response cycle work. In this pattern, you are supposed to designate the next handler in a chain using the `next` property, and if the handler is set, then you execute it.

```ts
abstract class Chain<T> {
    protected next: Chain<T> | null = null
    setNext(chain: Chain<T>) {
        this.next = chain
    }
}

class Employee {
    constructor(public name: string) {}
}

class EmployeeChain extends Chain<Employee> {

    protected next: EmployeeChain | null = null

    constructor(private employees: Employee[]) {
        super()
    }

    findEmployee(name: string): Employee | null {
        const foundEmployee = this.employees.find(em => em.name === name)
        if (foundEmployee) return foundEmployee
        if (this.next) return this.next.findEmployee(name)
        else {
            return null
        }
    }
}

const techSector = new EmployeeChain([
    new Employee("Harsh"),
    new Employee("Aadil"),
    new Employee("Peter"),
    new Employee("Kai"),
])

const hrSector = new EmployeeChain([
    new Employee("hr girl"),
    new Employee("that one super hot french chick")
])

const company = new EmployeeChain([])
company.setNext(techSector)
techSector.setNext(hrSector)

console.log(company.findEmployee("that one super hot french chick")) // finds employee
```

Here's another way to do it, where we add a generic `handle()` to the chain interface, which either executes and returns a value or delegates to the next handler in the chain:

```ts
abstract class Chain<T> {
    protected next: Chain<T> | null = null
    setNext(chain: Chain<T>) {
        this.next = chain
    }

    handle(executor : (chainInstance: Chain<T>) => T | null) : T | null {
        const value = executor(this)
        if (value) return value
        else if (this.next) return this.next.handle(executor)
        else return null
    }
}

class Employee {
    constructor(public name: string) {}
}

class EmployeeChain extends Chain<Employee> {

    protected next: EmployeeChain | null = null

    constructor(private employees: Employee[]) {
        super()
    }

    findEmployee(name: string): Employee | null {
        return this.handle((chainInstance) => {
            return (chainInstance as EmployeeChain).employees.find(em => em.name === name) ?? null
        })
    }
}

const techSector = new EmployeeChain([
    new Employee("Harsh"),
    new Employee("Aadil"),
    new Employee("Peter"),
    new Employee("Kai"),
])

const hrSector = new EmployeeChain([
    new Employee("hr girl"),
    new Employee("that one super hot french chick")
])

const company = new EmployeeChain([])
company.setNext(techSector)
techSector.setNext(hrSector)

console.log(company.findEmployee("that one super hot french chick")) // finds employee
```
#### Strategy Pattern

The strategy pattern is an extremely easy way to use classes in a way that promotes loose coupling, dependency-inversion principle, and an easy swapping of features. 

> [!NOTE]
> The strategy pattern defines a family of algorithms and encapsulates each one and makes them interchangeable and works exact same by providing and implementing the same interface. The strategy pattern lets the algorithm vary independently from the clients that use it.



Here are the components of the strategy pattern:

- **base strategy**: A base `Strategy` interface or abstract class that all concrete strategies should extend from, following the dependency-inversion principle
- **concrete strategy**: Unique implementation of the `Strategy` interface
- **strategy user**: A class that uses the strategy, referring to the base type `Strategy` when using it. It should have these methods:
	- `setStrategy(strategy: Strategy)`: for changing the strategy during runtime
	- `getStrategy()`: for getting the current strategy during runtime

```java
// After refactoring
public interface ReportStrategy {
    void generateReport(Data data);
}

public class PDFReportStrategy implements ReportStrategy {
    @Override
    public void generateReport(Data data) {
        // Generate PDF report
    }
}

public class CSVReportStrategy implements ReportStrategy {
    @Override
    public void generateReport(Data data) {
        // Generate CSV report
    }
}

public class XMLReportStrategy implements ReportStrategy {
    @Override
    public void generateReport(Data data) {
        // Generate XML report
    }
}

public class ReportGenerator {
    private ReportStrategy reportStrategy;

    public ReportGenerator(ReportStrategy reportStrategy) {
        this.reportStrategy = reportStrategy;
    }

    public void generateReport(Data data) {
        reportStrategy.generateReport(data);
    }
}
```

And here's a more abstract implementation:

```ts
interface Strategy<T> {
    execute(data: T) : void
}

abstract class StrategyUser<T> {
    
    constructor(protected strategy: Strategy<T>) {}

    setStrategy(strategy: Strategy<T>) {
        this.strategy = strategy
    }

    getStrategy() {
        return this.strategy
    }

    executeStrategy(data: T) {
        this.strategy.execute(data)
    }
}
```

#### Command pattern

The main use case of the command pattern is when you have a bunch of operations that you would like to compose in different orders and execute them and would also like to make them reversible. 

Here are the main use cases:

- **scheduling or queuing operations**: When you want to schedule certain operations or queue them in an easy, declarative way.
- **reversing operations**: When you want to easily reverse operations instead of writing the concrete code to reverse it.

The pattern has two main components:

- **command**: a single command represents an encapsulation of some function logic
- **command executor (conductor)**: what actually runs the command. It takes in a command and some data and executes the command with that data.

Here is the most basic version of the pattern:

```ts
// conductor interface must have an execute() method that takes in command and executes it.
interface Conductor<T> {
	execute<T>(command: Command<T>, data: T) => void;
}

export class Command<T> {
	constructor(
	  public name: string,
	  public cb: (data: T) => void
	) {}

	equals(command: Command<T>) {
	  return this.name === command.name;
	}
}
  
export class CommandExecutor implements Conductor {
	// for keeping track of commands
	history: {command: Command<T>, data: T}[]
	
	execute<T>(command: Command<T>, data: T) {
	  command.cb(data);
	  history.push({
		  command,
		  data
	  })
	}
}
```

Here is a more concrete example of the command pattern:


```ts
// conductor
class OrderManager {
  constructor() {
    this.orders = [];
  }

  execute(command, ...args) {
    return command.execute(this.orders, ...args);
  }
}

// base command
class Command {
  constructor(execute) {
    this.execute = execute;
  }
}

// concrete implementations of the command
function PlaceOrderCommand(order, id) {
  return new Command(orders => {
    orders.push(id);
    console.log(`You have successfully ordered ${order} (${id})`);
  });
}

function CancelOrderCommand(id) {
  return new Command(orders => {
    orders = orders.filter(order => order.id !== id);
    console.log(`You have canceled your order ${id}`);
  });
}

function TrackOrderCommand(id) {
  return new Command(() =>
    console.log(`Your order ${id} will arrive in 20 minutes.`)
  );
}

const manager = new OrderManager();

manager.execute(new PlaceOrderCommand("Pad Thai", "1234"));
manager.execute(new TrackOrderCommand("1234"));
manager.execute(new CancelOrderCommand("1234"));
```


![](https://i.imgur.com/5rGfCBK.jpeg)

- **Command Interface:** Declares a method for executing the command.
- **Concrete Command Objects:** Implement the command interface and encapsulate specific requests.
- **Receiver:** Contains the business logic to perform the actual work.
- **Invoker:** Handles requests from the client and references command objects instead of calling the receiver directly.
- **Client:** Creates and configures concrete command objects with the invoker to execute requests.

```ts
class Train {
    name : string
    location : string
    passengers : string[]

    constructor(name : string, location : string , passengers : string[]){
        this.name = name
        this.location = location
        this.passengers = passengers
    }
}



// Command Interface 
abstract class Command {
    abstract execute(train: Train) : void
}



// Concrete Command 1
class AddPassengerCommand extends Command  {
    passenger : string 

    constructor(passenger : string) {
        super()
        this.passenger = passenger
    }

    execute(train : Train) {
        train.passengers.push(this.passenger)
        console.log("New passenger on board: " + this.passenger)
    }
}


// Concrete Command 2 
class MoveTrainCommand extends Command  {
    location : string 

    constructor(location : string) {
        super()
        this.location = location
    }

    execute(train : Train) {
        train.location = this.location
        console.log("The train is locatied at: " + train.location)
    }
}


// Invoker
class Invoker {

    command! : Command
    

    setCommand(command: Command) {
        this.command = command
    }

    executeCommand(train : Train) {
        this.command.execute(train)
    }
}




// Client
function commandClient() {
    let train = new Train("Express", "Station A", [])

	
	let addPassengerCommand = new AddPassengerCommand("Alice")
	let moveTrainCommand = new MoveTrainCommand("Station B")
	
	let invoker = new Invoker()
	
	invoker.setCommand(addPassengerCommand)
	invoker.executeCommand(train)
	
	invoker.setCommand(moveTrainCommand)
	invoker.executeCommand(train)	
}

commandClient()
```
#### Iterator pattern

The iterator pattern allows you to traverse the items of any collection without actually knowing the actual structure of the collection.

- **iterator**: an object with a `next()` method, which when invoked, returns an object in the shape of `{value: any, done: boolean}`.
- **iterable**: an object with a `[Symbol.iterator]()` method implemented that returns an iterator object. 
	- This lets an object be iterated over using a for loop or other array iteration methods.

```ts
interface CustomIterator<T> {
    index: number;
    data: T[];
    next: () => {value: T | undefined | null, done: boolean}
}

interface CustomIterable<T> {
    [Symbol.iterator]: () => CustomIterator<T>
}

const gospelIterator : CustomIterator<string> = {
    index: -1,
    data: ["Matthew", "Mark", "Luke", "John"],
    next() {
        this.index++;

        return {
            value: gospelIterator.data.at(this.index),
            done: this.index + 1 > gospelIterator.data.length,
        };
    },
};

const gospelIteratable : CustomIterable<string> = {
  [Symbol.iterator]() {
    return gospelIterator
  },
};

for (const gospel of gospelIteratable) {
    console.log(gospel)
}
```

Here are the pros of the iterator pattern:

- Follows SOLID principles of single responsibility and open/closed principle


![](https://i.imgur.com/Lpbh62Y.jpeg)


- **Iterator Interface:** Declares methods to traverse the collection, like getting the next element or checking if more elements exist.
- **Collection Interface:** Provides a method to get an iterator for the collection.
- **Concrete Iterator:** Implements the iterator interface, allowing traversal through the collection independently.
- **Concrete Collection:** Returns new instances of the concrete iterator.
- **Client:** Uses both the iterator and collection to access elements without knowing the collection's structure.

```ts
// Iterator Interface
abstract class AbstractIterator {
    abstract next(): TeamMember;
    abstract hasNext(): boolean;
}

// Collection Iterface
abstract class Aggregator {
    abstract getIterator(): AbstractIterator
 }


class TeamMember  {
    name : string
    teamNumber: number 
    position : string 

    constructor(name: string, teamNumber: number, position: string) {
        this.name = name
        this.teamNumber = teamNumber
        this.position = position
    }

    printMemberInfo(): void {
        console.log("Name: %s Team Number: %d Position: %s\n", this.name, this.teamNumber, this.position)
    }

 }


 // Concrete Iterator
 class TeamMemberIterator extends AbstractIterator {

    teamMembers : TeamMember[]
    index : number = 0

    constructor(teamMembers : TeamMember[] ){
        super()
        this.teamMembers = teamMembers
    }

    hasNext(): boolean {
        return this.index < this.teamMembers.length
    }

    next(): TeamMember{
        return this.teamMembers[this.index++];
    }
 }

 // Concrete Collection
 class Roster extends Aggregator {
    teamMembers : TeamMember[] 

    constructor(teamMembers : TeamMember[]) {
        super()
        this.teamMembers = teamMembers
    }

    getIterator(): TeamMemberIterator {
        return new TeamMemberIterator(this.teamMembers)
    }
 }

 // Client
 function iteratorClient() {
    let member1 = new TeamMember("Johnny Rocket", 12, "Forward")
	let member2 = new TeamMember("Tim Hoops", 24, "Point Guard")
    let member3 = new TeamMember("Billy Banks", 29, "Shooting Guard")

    let roster = new Roster([member1, member2, member3])
    let iterator = roster.getIterator()

    while(iterator.hasNext()) {
        iterator.next().printMemberInfo()
    }
    
 }

 iteratorClient()


```
#### Observer pattern

The purpose of the observer pattern is to define a one-to-many dependency between objects so that when one object changes state, all of its dependents are notified and updated automatically.

This can be achieved by having two components, namely an observer and a subscriber, where the observer can notify all the subscribers and the subscribers are just callback functions that are executed when the observer chooses to notify.

```ts
class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(func) {
    this.observers.push(func);
  }

  unsubscribe(func) {
    this.observers = this.observers.filter((observer) => observer !== func);
  }

  notify(data) {
    this.observers.forEach((observer) => observer(data));
  }
}
```

```ts
import { ToastContainer, toast } from "react-toastify";

function logger(data) {
  console.log(`${Date.now()} ${data}`);
}

function toastify(data) {
  toast(data);
}

observable.subscribe(logger);
observable.subscribe(toastify);

function handleClick() {
	observable.notify("User clicked button!");
}

function handleToggle() {
	observable.notify("User toggled switch!");
}
```

#### State pattern

The state pattern just follows a state machine and allows for objects to alter behavior depending on their current state. 

Here are the main use cases for when you would want to use the state pattern:

- If you have an object that behaves differently depending on the state
- If you have a bunch of conditionals in a class, you could benefit from refactoring to use a state pattern to remove those conditionals and instead just program to an interface. 
- If you have a bunch of duplicate code across multiple subclasses, you could benefit from refactoring to use a state pattern to remove those conditionals and instead just program to an interface. 

![](https://i.imgur.com/g45X028.jpeg)

- **State Interface:** Declares methods used by all different states.
- **Concrete States:** Implement the state interface with specific behaviors for each state.
- **Context:** Holds a reference to a concrete state object and delegates state-specific work to it.
- **Setter Method in Context:** Allows switching the current state dynamically.
- **Client:** Interacts with the context and can change its state.

  
This pattern helps objects change behavior based on their internal state, making the object appear to change its class while keeping code organized and flexible.


```ts
// State Interface 
abstract class ShapeState {
    abstract drawShape() : void
    abstract eraseShape() : void 
}



// Concrete State 
class CircleState extends ShapeState {

    drawShape(): void {
        console.log("Drawing Circle")
    }

    eraseShape(): void {
        console.log("Erasing Circle")
    }
}
// Concrete State 
class RectangleState extends ShapeState {

    drawShape(): void {
        console.log("Drawing Rectangle")
    }

    eraseShape(): void {
        console.log("Erasing Rectangle")
    }

}


// Context 
class Shape {
    state : ShapeState

    constructor(state : ShapeState) {
        this.state = state
    }
    draw() : void {
        this.state.drawShape()
    }

    erase() : void {
        this.state.eraseShape()
    }
}


// Client 
function stateClient() {
    let circle = new Shape(new CircleState())
    circle.draw()
    circle.erase()

    let rectangle = new Shape(new RectangleState())
    rectangle.draw()
    rectangle.erase()

}

stateClient()
```

#### Template method pattern

The template method is useful when you have a multi-step algorithm that can be implemented differently with different concrete subclasses, where you have a **template** that always runs the same instructions the same way, but the individual steps within the algorithm may vary across child components.

- You don't want to change all the code to account for all the different ways a concrete class could implement the individual steps. 
- Instead you abstract each step so that the concrete class has its own implementation for it. 

It defines the skeleton of an algorithm in an abstract superclass, allowing subclasses to override specific steps without changing the overall structure, which helps reduce code duplication when multiple classes share similar algorithms.


![](https://i.imgur.com/HRi4uGc.jpeg)

- **abstract class**: an interface that describes individual steps of an algorithm to be implemented by concrete classes
	- **template method**: a method that controls the business logic and order of how the steps execute in the algorithm. 
		- This should not be overridden by child components.
	- **step method**: individual steps of the template which should be overridden by child components to provide concrete implementation of a step in the algorithm.
- **concrete class**: implements the abstract class and provides business logic for overriding the outlined steps set by the abstract class with a concrete implementation.

```ts
abstract  class Car {

    abstract drive() : void 
    startEngine(): void {
        console.log("Starting Engine")
    }

    stopEngine(): void {
        console.log("Stoping Engine")
    }

    // template method 
    run() : void {
        this.startEngine()
        this.drive()
        this.stopEngine()
    }

}


class Sedan extends Car {

    drive() {
        console.log("Driving a sedan")
    }
}


class SUV extends Car {

    drive(){
        console.log("Driving an SUV")
    }
}



let sedan = new Sedan()
sedan.run()

let suv = new SUV()
suv.run()

templateMethodClient()
```

#### Mediator pattern

The mediator pattern restricts direct communication between objects and forces them to collaborate instead via a mediator object. 

You should use the mediator pattern when specific dependencies prevent your ability to change a class and you can't reuse that class because it's too tightly coupled to other classes. 


![](https://i.imgur.com/dAehA6f.jpeg)


Benefits:

- Reduces the amount of dependencies and promotes loose coupling 

Cons:

- Becomes a dreaded god object over time

**Example**

```ts
// Component Interface 
abstract class Package {
    abstract ship() : void
    abstract deliver() : void
    abstract allowShipping() :void
}


// Mediator Interface 
abstract class Mediator {
    abstract canShip(pack : Package) : boolean
    abstract notifyAboutDelivery() : void
}

// Concrete Component A 
class UPSPackage extends Package {
    mediator : Mediator 

    constructor(mediator : Mediator) {
        super()
        this.mediator = mediator
    }

    ship(){
        if (this.mediator.canShip(this)) {
            console.log("UPS Package Shipping blocked...waiting")
        }
    }

    deliver() : void {
        console.log("Delivering UPS package")
	    this.mediator.notifyAboutDelivery()

    }

    allowShipping(): void {
        console.log("UPS Package: Ready to ship")
        this.ship();
    }
}

// Concrete Compomnent B
class FedExPackage extends Package {
    mediator : Mediator 

    constructor(mediator : Mediator) {
        super()
        this.mediator = mediator
    }

    ship(){
        if (this.mediator.canShip(this)) {
            console.log("FedEx Package Shipping blocked...waiting")
        }
    }

    deliver() : void {
        console.log("Delivering FedEx package")
	    this.mediator.notifyAboutDelivery()

    }

    allowShipping(): void {
        console.log("FedEx Package: Ready to ship")
        this.ship();
    }

}


// Concrete Mediator
class PackageManager extends Mediator {
    isPackagePacked : boolean
    packages : Package[] = []

    constructor(isPackagePacked : boolean) {
        super()
        this.isPackagePacked = isPackagePacked
    }

    canShip(pack: Package): boolean {
       if (this.isPackagePacked) {
        this.isPackagePacked = false
        return true
       }
       this.packages.push(pack)
       return false
    }

    notifyAboutDelivery(): void {
        if (!this.isPackagePacked) {
            this.isPackagePacked = true
        }
        if (this.packages.length > 0) {
            let firstPackage = this.packages[0]
            this.packages.shift()
            firstPackage.allowShipping()
        }
    }
}


// Client 
function mediatorClient() {
    let packageManager = new PackageManager(true)

    let upsPackage = new UPSPackage(packageManager)
    let fedExPackage = new FedExPackage(packageManager)

    upsPackage.ship()
    fedExPackage.ship()
    upsPackage.deliver()
    fedExPackage.deliver()
}
mediatorClient()
```