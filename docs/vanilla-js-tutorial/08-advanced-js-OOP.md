# Advanced JS: Concepts

## This

### Basic `this` behavior

Any variable or function defined in the global scope will have the value of `this` set to the `window`.

```javascript
const hello = "hello";
window.hello; // "hello"
```

When you define a function inside an object, the value of `this` will be set to the object itself.

```javascript
const person = {
  name: "John",
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  },
};

person.sayHello(); // "Hello, my name is John"
```

When you define a function inside a function, the value of `this` will be set to the global object, which is `window`.

```javascript
function sayHello() {
  console.log(`Hello, my name is ${this.name}`);
}

sayHello(); // "Hello, my name is undefined"

// sayHello() is the exact same as window.sayHello(), and window.name is undefined
```

So any time you use the `function` keyword to create a function, `this` will be evaluated depending on what context you try to call it in:

- **Event listeners** : will be set to whatever element the event listener is attached to
- **Function being called by itself**: If it is a function you are calling rather than a method, then `this` will almost always be `window`

You can think about it with the **left hand rule**: whatever is on the left side of the dot calling the method, is probably the value of this:

```javascript
obj.doSomething(); // this = obj
doSomething(); // this = window

const doSomething2() = obj.doSomething;
doSomething2(); // this = window
```

:::tip
If you save a method from an object to a variable, then the value of `this` will be `window` when you call the variable, because in the end you are calling the method as a function by itself.
:::

### `this` and classes

In static methods, `this` refers to the class instance itself, like `Dog`.

In any other method including the constructor method, `this` refers to the instance of the class, like `myDog`.

```javascript
class Dog {
  constructor(name, breed) {
    this.name = name;
    this.breed = breed;
  }

  static info() {
    console.log(this);
  }

  bark() {
    console.log(this);
  }
}

const myDog = new Dog("Rex", "Golden Retriever");

Dog.info(); // Dog {}
myDog.bark(); // Dog { name: "Rex", breed: "Golden Retriever" }
```

If we do the same thing as before, where we save a class method to a variable, that function will instead have a value of `this` to be undefined. Why? I don't know.

```javascript
const myDog = new Dog("Rex", "Golden Retriever");
const bark = myDog.bark;

bark(); // this = undefined
```

### call, apply, bind

- `func.call(obj, ...args)` : when a function uses its `call()` method, it executes itself an sets the value of `this` to the object passed in as the first argument. You can then pass in any subsequent arguments as normal.

  ```javascript
  const person = {
    name: "John",
    sayHello() {
      console.log(`Hello, my name is ${this.name}`);
    },
  };

  person.sayHello(); // "Hello, my name is John"

  const lisa = {
    name: "Lisa",
  };

  const sayHello = person.sayHello;
  sayHello.call(lisa); // "Hello, my name is Lisa" Bakes in value of `this` = lisa
  ```

- `func.apply(obj, args[])` : the `apply()` method of a function is much like `call()`, except that it accepts only two arguments. The first is the value of `this` to set, and the second is an _array_ of all the arguments to pass in, which then get automatically spread as arguments to the function.

  ```javascript
  const person = {
    name: "John",
    sayHello(...friends) {
      console.log(
        `Hello, my name is ${this.name} and my friends are ${friends.join(
          ", "
        )}`
      );
    },
  };

  const lisa = {
    name: "Lisa",
  };

  const sayHello = person.sayHello;
  sayHello.apply(lisa, ["jake", "jill", "L"]); // "Hello, my name is Lisa" Bakes in value of `this` = lisa
  ```

- `func.bind(obj, ...args)` : the difference between `bind()` and the others is that `bind()` does not execute the function. Instead it just returns the function with the value of `this` and any args you set already baked in, which makes it much more useful.

### `this` and arrow functions

Arrow functions don't have their own `this` value, so they will always inherit the value of `this` from the parent scope.

These are good use cases for arrow functions:

- For event listeners
- For timeouts and intervals

## Prototypes

### `new` keyword

The `new` keyword doesn't jsut work for classes. It also works for things called **factory functions**, which modify `this` and return an object instance. The `new` keyword works as follows:

1. Creates an empty object `{}`
2. Sets the keyword `this` to point to the empty object
3. Sets the prototype for the object, which lives on the `__proto__` property
4. Returns `this`

```javascript
function Dog(name, breed) {
  this.name = name;
  this.breed = breed;
}

const myDog = new Dog("Rex", "Golden Retriever");
// 1. this = {}
// 2. this.name = "Rex"
// 3. this.breed = "Golden Retriever"
// 4. return this
```

### Prototype chain

The prototype chain describes the phenomenon where if properties and methods aren't found on an object, JavaScript will look for those properties and methods on the object's prototype, and so on until it reaches the top.

```javascript
const grandparent = {
  greetOld() {
    console.log("Hello, I am old");
  },
};

const parent = {
  greetMiddle() {
    console.log("Hello, I am a parent");
  },
  __proto__: grandparent,
};

const child = {
  greetYoung() {
    console.log("Hello, I am a child");
  },
  __proto__: parent,
};

// the child object gets access to all prototypes in its chain

child.greetYoung(); // "Hello, I am a child"
child.greetMiddle(); // "Hello, I am a parent"
child.greetOld(); // "Hello, I am old"
```

### Classes and prototypes

### Prototype methods

There are some useful static methods on the `Object` class that use prototypes:

- `Object.create(proto)` : returns an object with a prototype set to the object that is passed in
- `Object.getPrototypeOf(obj)` : returns the prototype of the object passed in as a javascript object
- `Object.setPrototypeOf(obj, proto)` : sets the prototype of the object passed in to the object passed in as the second argument

```javascript
const grandparent = {
  greetOld() {
    console.log("Hello, I am old");
  },
};

const parent = Object.create(grandparent);
parent.greetOld();
```

## Closures

Closures are functions returning other functions, but the function will retain and remember the values of all variables described in the outer function because they get stored on the _heap memory_ of the inner function.

### var, let, const

When declaring a variable with `var` in the global scope, it is automatically added to the `window` object, which can be problematic if you name your variable as a property that already exists on the window object, like `window.origin`.

`let` and `const` avoid this behavior.

### Scope chain

The scope chain defines how expressions that use variables get the value for the variables, especially when you have global and local identifiers for the same variable name.

The order goes as follows:

1. Local scope
2. Any outer functions (if variable is in nested function)
3. Global scope

### CLosure basics

A closure is a function that returns another function, and that nested function gains access to all the local variables in the outer function and essentially stores a snapshot of those variables.

This is used for encapsulation and effectively mimicking a global variable without actually using a global variable.

```javascript
function counting() {
  let count = 0;

  // return nested function that accesses outer scope variable and modifies it
  return function () {
    count++;
    return count;
  };
}

const increment = counting();
// increments the count variable inside the counting() function
increment();
```

You can also return an object that has methods on it:

```javascript
function createCounter() {
  let count = 0;
  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    getCount() {
      return count;
    },
  };
}

const myCounter = createCounter();
myCounter.increment();
```

### Factory functions

Factory functions are closures except that you memorize the parameter being passed into through the outer function, which could be useful sometimes.

```javascript
function toThePowerOf(exponent: number) {
  return function (base: number) {
    // using exponent from outer function parameter encloses it in the inner function memory
    return base ** exponent;
  };
}

const square = toThePowerOf(2);
const cube = toThePowerOf(3);
console.log(square(2)); // 4
console.log(cube(2)); // 8
```

In the above function when we return the nested function, the value of `exponent` is saved as a snapshot for whatever we passed in. If we passed in 2, the function returned will always remember `exponent` as 2.

### Closures and event listeners

When we need to update some global variable in an event listener, we could instead refactor that to use closures like so:

```javascript
const btn = document.getElementById("btn1");

function withClosure() {
  let count = 0;
  btn.addEventListener("click", () => {
    count += 1;
    btn.innerText = `Clicked ${count} times`;
  });
}

withClosure();
```

By just adding the event listener inside a function and then immediately invoking it, we get all the benefits of closures.

## Objects

### Sealing and freezing objects

Both these methods return the same object, but with different behavior.

- `Object.seal(obj)` : seals an object, meaning you can't add or remove properties from it, but you can still modify the existing properties
- `Object.freeze(obj)` : freezes an object, meaning you can't add, remove, or modify any properties on it

## Functional Programming

### Pure functions

Pure functions are functions that don't have any side effects.

**Side effects** are directly running code, like assigning values to variables, printing to the console, and mutating data.

Here are the guidelines to follow to make a pure function:

- Don't mutate global or outer scope variables
- DOn't mutate your parameters in any way
- Don't have any side effects in your code

### Partial functions

Partial functions are when you bake in some parameters into a function, creating another version of that function with some parameters already hardcoded in.

You've seen examples of this before with the `bind()` method:

```javascript
function greet(greeting, name) {
  console.log(`${greeting} ${name}`);
}

const sayHello = greet.bind(null, "Hello");
sayHello("John"); // Hello John
```

### Composing

Composing is based on the idea from math, where we can do something like $f(g(x))$. It's the exact smae idea where we can compose functions together, where each function takes only one argument.

A compose function would take in an arbitrary amount of functions, and return one single function that takes in one parameter. THe return value of _that_ function would be the composition of all those functions with passing in the value to the first function.

A simple compose in the spirit of $f(g(x))$ would be:

```javascript
function compose(fn1, fn2) {
  return function (val) {
    return fn1(fn2(val));
  };
}

const double = (x) => x * 2;
const triple = (x) => x * 3;

const sextuple = compose(double, triple); // same as double(triple(x))
sextuple(2); // 12
```

This is a true composing function that takes in an arbitrary amount of functions:

```typescript
function composeAdvanced(...functions: Function[]) {
  return function (value: any) {
    const composingFunctions = functions.slice().reverse();
    return composingFunctions.reduce((val, fn) => {
      return fn(val);
    }, value);
  };
}
```

And this is how we can compose with using type generics:

```typescript
type Func<T> = (a: T) => T;

function composeWithTypes<T>(...functions: Func<T>[]) {
  return function (value: T) {
    // apply function composing in reverse order, like f(g(x))
    const composingFunctions = functions.slice().reverse();
    return composingFunctions.reduce((val, fn) => {
      return fn(val);
    }, value);
  };
}

function repeatTwice(str: string) {
  return str.repeat(2);
}

function upperCase(str: string) {
  return str.toUpperCase();
}

// infers type from return type
composeWithTypes(repeatTwice, upperCase)("hello");
```

### Currying

Currying refers to a way of making calling functions more flexible by allowing us to pass in arguments one at a time.

A normal function with 3 arguments called like `func(a, b, c)` can be curried to be called like `func(a)(b)(c)`.

```javascript
function addThreeNumbers(a, b, c) {
  return a + b + c;
}

function curriedAdding(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}

// creates a partial function
const partialAddBy3 = curriedAdding(3);
```

The flexibility of currying is that true currying allows you call all the arguments at once, or just one at a time and end up with a partial function.

## Short circuiting

- `||` : logical or short circuit. If the left-side value is falsy (0, "", false, null, undefined), it returns the right-side value.
- `&&` : logical and short circuit. If the left-side value is truthy, it returns the right-side value.
- `??` : nullish coalescing operator. If the left-side value is `null` or `undefined`, it returns the right-side value.
- `||=` : logical or assignment operator. If the left-side value is falsy, it assigns the right-side value to the left-side value.
- `&&=` : logical and assignment operator. If the left-side value is truthy, it assigns the right-side value to the left-side value.
- `??=` : nullish coalescing assignment operator. If the left-side value is `null` or `undefined`, it assigns the right-side value to the left-side value.

```javascript
let num = 10;
num || 20; // returns 10
num && 20; // returns 20
num ?? 20; // returns 10

num = 0;
num ||= 20; // makes num = 20

num = 10;
num &&= 20; // makes num = 20

num = null;
num ??= 20; // makes num = 20
```

## Timers

### Basics

You can set timeouts and set intervals like below:

```javascript
let timeoutId = setTimeout(func, delay);
let intervalId = setInterval(func, delay);

clearTimeout(timeoutId);
clearInterval(intervalId);
```

- `setTimeout(func, delay)` : the first argument is the function to run, and the second is the delay. It returns a **number**, which is a timeout id you can pass to `clearTimeout` to stop the timeout
- `setInterval(func, delay)` : the first argument is the function to run, and the second is the delay. It returns a **number**, which is an interval id you can pass to `clearInterval` to stop the interval

### Debouncing

The basic formula for debouncing is like this:

1. Have a global variable that stores the timeout id
2. When running the code/function you want to debounce, immediately clear the timeout by passing in the timeout id to `clearTimeout()`
3. Invoke the debounced code/function with `setTimeout()`, and set the timeout id to the return value.

In the below example, you can see how we debounce the code inside the event listener

```javascript
// 1. global variable to store timeout id
let debounceTimeout;
searchInput.addEventListener("input", () => {
  // 2. clear timeout. This ensures that code does not run if 400 ms has not passed yet
  clearTimeout(debounceTimeout);
  // 3. set timeout and store timeout id
  debounceTimeout = setTimeout(() => {
    queryAPI();
  }, 400);
});
```

For a debounce function, it must be a closure that returns a function, since that is the only way for it to "remember" `timeoutId`.

```typescript
function debounce(callback: Function, delay: number) {
  let timeoutId: number;
  // return a function that accepts any number of arguments
  return (...args: any[]) => {
    // clear timeout if function is called before delay time has passed
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
```

### Throttle

Throttling ensures some code is run at most _once_ every n seconds, which is ideal for events that get triggered a lot, like scrolling and mousemove.

```typescript
// returns a throttled function
const throttle = (fn: Function, wait: number = 300) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any) {
    const context = this,
      args = arguments;
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};
```

## Miscellaneous

### `Array.from()`

The `Array.from()` method takes in an iterable and returns an array from that iterable. An iterable can be a set, string, object, etc.

```javascript
const set = new Set([1, 2, 3]);
const arr = Array.from(set); // returns [1, 2, 3]
```

There's also a second argument you can pass, which is a callback that accepts each entry of the array as an argument, and whatever you return becomes the new entry, much like `map()`:

```javascript
const set = new Set([1, 2, 3]);
const arr = Array.from(set, (num) => num * 2); // returns [2, 4, 6]
```

We can take advantage of the fact that there is an `Array.length` property, and manually specify that beforehand to generate a big array size, and then loop through with the callback to fill the entries:

```javascript
const arr = Array.from({ length: 10 }, (e, i) => i + 1); // returns [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

## Async methods

All the below methods take in an array of promises and return a single promise as a result, which resolves either to an array of data or a single data.

- `Promise.all()`: This takes in an array of promises and returns a promise that resolves when all the promises in the array resolve. If any of the promises in the array reject, then the promise returned by `Promise.all()` rejects.
  - <u>All promises in the array have to be resolved, else the promise rejects</u>.
- `Promise.allSettled()`: This takes in an array of promises and returns a promise that resolves when all the promises in the array resolve or reject - basically when they are **fulfilled**. The promise returned by `Promise.allSettled()` never rejects.
- `Promise.race()`: Given an array of promises, this returns the first promise in the array that gets fulfilled. It doesn't matter whether it resolves or rejects. All the promises race against each other to finish, hence the name.
- `Promise.any()`: Given an array of promises, this returns the first promise in the array that resolves successfully. If all the promises reject, then the promise returned by `Promise.any()` rejects.

## SOLID principles

### Single responsibility principle

A class should only have one reason to change. It should only have one responsibility or function.

In large codebases, this prevents God classes that do everything and are hard to maintain. This ensures proper maintainability.

![SRS](https://www.webpagescreenshot.info/image-url/ppzJv3svr)

### Open/closed principle

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

Basically everything goes back to dealing with interfaces rather than concrete classes.

### Liskov substitution principle

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

### Interface segregation principle

A class should not implement interfaces that it doesn't use. This is to prevent classes from having to implement methods that they don't need.

Essentially, never include unnecessary information and force a class to implement it.

### Dependency inversion principle

High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions.

Basically in your classes, type variables as interfaces instead of concrete classes. This prevents tight coupling.

### Law of Demeter

The Law of Demeter states that a module should not know about the internal workings of the objects it interacts with. It should only know about its immediate friends.

Prevent deeply nested object property access when dealing with class instances.

## Design Patterns

### Module Pattern

The module pattern takes advantage of closures to create an object with "private" and "public" properties. It works as follows:

It creates an immediately-invoked function that returns an object.

```javascript
const myModule = (() => {
  // any variables that are not returned are private
  const privateVar = "I AM PRIVATE!!!";
  const privateMethod = () => "I AM A PRIVATE METHOD";

  // any variables that are returned are public
  return {
    publicVar: "I AM PUBLIC!!!",
    publicMethod: () => {
      console.log("calling private method: ", privateMethod());
    },
  };
})();
```

Whatever you don't return in the object becomes private, and whatever you return becomes public.

Here is another example:

```javascript
const counter = (() => {
  let count = 1;
  return {
    getCount: () => count,
    increment: () => count++,
  };
})();
```

### Singleton Pattern

The singleton pattern is a design pattern that restricts the instantiation of a class to one object. It is useful when exactly one object is needed to coordinate actions across the system.

1. On your class or object, store a property called `instance`, which will keep track of the created instance
2. When the user wants to create a new instance, first see if `instance` is null or not.
   1. If it is null, create a new instance and store it in `instance`
   2. If it is not null, don't create a new instance and return the existing `instance`

#### With closures

Here is an example of the singleton pattern with closures:

```typescript
const ChickenFarm = () => {
  // private variables, + way to remember data
  let instance;
  const createInstance = () => ({ numChickens: 100 });

  return {
    // create instance and return if it doesn't exist. Else return existing
    getInstance: () => {
      // 1. if not null, return existing
      if (instance) return instance;
      // 2. if null, create and then return
      instance = createInstance();
      return instance;
    },
  };
};
```

#### Class example

We store a static `instance` property, and the great thing about this property is that since it is static, it will be stored on the prototype of any object instance, thus this `instance` static property will always be on the class itself rather than on the instance.

```typescript
class DBConnection {
  private static instance?: DBConnection;
  constructor() {
    if (DBConnection.instance) return instance;

    DBConnection.instance = this;
    return DBConnection.instance;
  }
}
```

#### With `Object.freeze()`

We can use the `Object.freeze()` method to freeze an object and thus any variables it referenced at runtime, using the concept of closures.

```typescript
let counter = 0;

// the value of counter is baked in at 0, and then the object is frozen
export default Object.freeze({
  getCount: () => counter,
  increment: () => ++counter,
  decrement: () => --counter,
});
```

### Observer pattern

The observer pattern build son top of the registry pattern by storing an array of observables, with the ability to subscribe other observables into the observer store and notify all observers in the store.

```typescript
const observers = [];

export default Object.freeze({
  notify: (data) => observers.forEach((observer) => observer(data)),
  subscribe: (func) => observers.push(func),
  unsubscribe: (func) => {
    [...observers].forEach((observer, index) => {
      if (observer === func) {
        observers.splice(index, 1);
      }
    });
  },
});
```

In the above example, we create an observable store that can subscribe and unsubscribe functions, and "notify" all subscribed functions by calling them all with the same data.

Here's a complete example of how to use it:

```javascript
import {
  sendToGoogleAnalytics,
  sendToCustomAnalytics,
  sendToEmail,
} from "./analytics.js";

const observers = [];

const store = Object.freeze({
  notify: (data) => observers.forEach((observer) => observer(data)),
  subscribe: (func) => observers.push(func),
  unsubscribe: (func) => {
    [...observers].forEach((observer, index) => {
      if (observer === func) {
        observers.splice(index, 1);
      }
    });
  },
});

store.subscribe(sendToGoogleAnalytics);
store.subscribe(sendToCustomAnalytics);
store.subscribe(sendToEmail);

const pinkBtn = document.getElementById("pink-btn");
const blueBtn = document.getElementById("blue-btn");

pinkBtn.addEventListener("click", () => {
  const data = "🎀 Click on pink button! 🎀";
  store.notify(data);
});

blueBtn.addEventListener("click", () => {
  const data = "🦋 Click on blue button! 🦋";
  store.notify(data);
});
```

#### Classes

And here is an example with typescript:

```typescript
class ObservableStore<T extends CallableFunction> {
  private observers: Set<T> = new Set();
  notify(...args: any[]) {
    this.observers.forEach((observer) => observer(...args));
  }
  addObserver(observer: T) {
    this.observers.add(observer);
  }
  removeObserver(observer: T) {
    this.observers.delete(observer);
  }
}

const add = (a: number, b: number) => console.log(a + b);
const multiply = (a: number, b: number) => console.log(a * b);
const subtract = (a: number, b: number) => console.log(a - b);

const store = new ObservableStore<typeof add>();
store.addObserver(add);
store.addObserver(multiply);
store.addObserver(subtract);

store.notify(5, 4); // 9, 20, 1
```

### Registry Pattern

The registry pattern is a design pattern that allows us to store objects in a central location. It is like a factory of objects that we can get objects out at any time. It is useful when we want to store objects that we want to access from anywhere in our code.

You can think of the registry pattern as simple aggregation of another class, and then having convenience methods on top of it like these:

- adding instances to the registry
- getting instances from the registry
- removing instances from the registry
- checking if an instance exists in the registry
- getting all instances from the registry
- clearing all instances from the registry
- getting the number of instances in the registry

```typescript
class Chicken {
  constructor(
    public id: string,
    public name: string,
    public age: number,
    public breed: string
  ) {}
}

class ChickenRegistry {
  // aggregate structure
  private chickens: Record<string, Chicken> = {};
  // keeps track of size
  private size = 0;

  addChicken(chicken: Chicken) {
    if (!chicken.id) {
      throw new Error("Chicken must have an id");
    }
    this.chickens[chicken.id] = chicken;

    this.size++;
  }

  getChicken(id: string) {
    return this.chickens[id];
  }

  length() {
    return this.size;
  }

  removeChicken(id: string) {
    if (this.chickens[id]) {
      delete this.chickens[id];
      this.size--;
    }
  }

  getAllChickens() {
    return Object.values(this.chickens);
  }
}
```

We use an object instead of an array to store the chickens because it is much faster to access an object property than it is to loop through an array.

### Prototype pattern

It's more memory efficient to store shared properties and methods on classes rather than on objects, because they will be stored in the prototype instead of in memory on the object.

```typescript
class Dog {
  // stored on instance
  constructor(public name: string, public breed: string) {}
  // stored on prototype
  bark() {
    console.log("Woof woof");
  }
}
```

Now you don't have to worry about allocating memory for the bark method on an object.
