
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

### Single responsibility principle

- Rather than having a single large class, you should split up your class into multiple larger classes.
- This is based on the **single responsibility principle**, which states that each class should be responsible for one purpose.
    - A `Shop` class should only take care of shop duties, and should leave customers to a `Customer` class and products to a `Products` class.
- Each class should have one responsibility

### Cohesion

**cohesion** is the concept of how much classes use their class properties in their methods. 

We want to reach high cohesion, where every method uses all of its class properties. We don’t want methods where we only use one or two class properties.


> [!NOTE] 
> Low cohesion is a clear sign for a class that should maybe just be a data container / data structure instead of an object with a public API (since that public API, the methods, doesn't interact with the internal properties).


Say that `Shop` has three class properties, and in a `getCustomer()` method, we only make use of one property. 1 out of 3. That is not very cohesive.

### SOLID

### S: single responsibility principle

Each class should have a single general responsibility

### O: open-closed principle

- A class should be open for extension but closed for modification
- Build subclasses to avoid modifying code and repeating yourself, to maintain DRY code.


### L: liskov-substitution principle

The Liskov-substitution principle states that a child class should be able to perfectly substitute for its parent class, that is, be capable of doing everything its parent class can.

```ts
class Bird {
 fly() {
	 console.log('Fyling...');
 }
}
class Eagle extends Bird {
 dive() {
	 console.log('Diving...');
 }
}
const bird = new Bird();
bird.fly();
// We can also replace Bird() with Eagle()
const eagle = new Eagle();
eagle.fly();
```

- Don’t remove any functionality in a child class when extending from a parent class
- Make sure all subclasses have access to all methods and properties of its parent class.

### I: interface segregation principle

Many client-specific interfaces are better than one general-purpose interface.

- When a class implements an interface, it should use and implement EVERYTHING from the interface, not leaving out any properties or methods. 


### D: Dependency inversion principle

One should depend on abstractions rather than details.

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

### RBAC (handling permissions)

<iframe width="560" height="315" src="https://www.youtube.com/embed/5GG-VUvruzE?si=Rx3a2rGxMT4CSuuJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

#### RBAC implementation

**Concept:** Instead of checking _roles_ inside components, you check _permissions_. You define a central configuration that maps Roles to Permissions (e.g., "delete:comments").

**The Benefit:** Your components became cleaner. They just ask "Can I delete comments?". They don't care _who_ the user is.

**The Limitation:** It struggles with ownership. A standard RBAC system says "Users can delete comments," but it can't easily say "Users can delete _their own_ comments." This limitation arises because a RBAC system doesn't take into account the **resources** a user owns.

```ts
// ✅ permissions.ts
const ROLES = {
  admin: ["view:comments", "create:comments", "delete:comments"],
  moderator: ["view:comments", "create:comments", "delete:comments"],
  user: ["view:comments", "create:comments"],
} as const;

export function hasPermission(user, permission) {
  return ROLES[user.role].includes(permission);
}

// Usage in Component
// Clean, but lacks "ownership" checks
const canDelete = hasPermission(user, "delete:comments");
```

#### Attribute-Based Access Control (ABAC)

**Concept:** To handle complex rules (e.g., "You can delete a comment IF you own it OR if you are an admin"), you need a system that looks at the **User**, the **Action**, and the **Resource** (the specific data object).

```ts
// ✅ permissions.ts
type User = { id: string; role: 'admin' | 'user' };
type Comment = { authorId: string; blockedBy?: string[] };

const PERMISSIONS = {
  comments: {
    // Admin can do anything; Users can only view if not blocked
    view: (user: User, comment: Comment) => {
      return user.role === 'admin' || !comment.blockedBy?.includes(user.id);
    },
    
    // Admin can delete anything; Users can delete ONLY if they are the author
    delete: (user: User, comment: Comment) => {
      if (user.role === 'admin') return true;
      return user.id === comment.authorId;
    }
  },
  todos: {
    // defined similar rules for other resources...
  }
};

// ✅ lib/auth.ts
export function hasPermission(user, resource, action, data?) {
  const resourcePermissions = PERMISSIONS[resource];
  if (!resourcePermissions) return false;

  const permissionChecker = resourcePermissions[action];
  if (!permissionChecker) return false;

  return permissionChecker(user, data);
}
```

## Feature flags



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


### Polymorphism

### Strategy Pattern

The strategy apttern is an extremely easy way to use classes in a way that promotes loose coupling, dependency-inversion principle, and an easy swapping of features. 

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