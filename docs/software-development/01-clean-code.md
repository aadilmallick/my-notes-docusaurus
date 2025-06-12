
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

