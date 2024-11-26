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

### Applying closures
#### Factory functions

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

#### Closures and event listeners

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

#### Memoization

We can memoize a function by caching its return value. This memoize function takes in a single argument: a callback to memoize. We then achieve memoization by following these steps: 

1. Create a cache variable using closures. This should be a map where each key is the function's passed in arguments, and the value is the function's return value. 
2. When the same exact arguments are passed in to the returned function, the map should have a key that exists for those arguments, and just short circuit and return the value.

```ts
function memoize<T extends any[], V>(cb: (...args: T) => V) {
    const cache = new Map<string, V>()
    return (...funcArgs: T) => {
        const key = JSON.stringify(funcArgs)
        if (cache.has(key)) {
            console.log("returned from cache!")
            return cache.get(key) as V
        }

        const value = cb(...funcArgs)
        cache.set(key, value)
        return value as V
    }
}

const memoizedAdd = memoize((a : number, b: number) => a + b)
console.log(memoizedAdd(5, 4))
console.log(memoizedAdd(5, 10))
console.log(memoizedAdd(5, 4))
```

Memoziation comes especially useful for instantly executing recursive functions like Fibonacci by memoizing each recursive call.


> [!NOTE] The great thing
> Executing `fibonacci(40)` takes 3 seconds. With memoization, `fibonacci(400)` executes instantly.


```ts
function memoizedFibonacci(n : number, prevValues = new Map<number, number>()) {
    if (n <=2) return 1

    let result : number;
    if (prevValues.has(n)) {
        result = prevValues.get(n)!;
    }
    else {
        result = memoizedFibonacci(n-2, prevValues) + memoizedFibonacci(n-1, prevValues)
        prevValues.set(n, result)
    }
    return result;
}

console.log(memoizedFibonacci(400))
```

You can even take memoization a step further by invalidating the cache based on time elapsed. 

```ts
export function memoizeWithInvalidation<T extends any[], V>(
  cb: (...args: T) => V,
  invalidationTimeInSeconds: number = 60 * 60
) {
  const cache = new Map<
    string,
    {
      data: V;
      lastExecuted: number;
    }
  >();
  return (...funcArgs: T): V => {
    const key = JSON.stringify(funcArgs);

    // if cache has the key, check if the last execution time is greater than the invalidation time
    // if so, remove the key from the cache. Else return cached value
    if (cache.has(key)) {
      const cachedData = cache.get(key);
      if (
        Date.now() - cachedData!.lastExecuted >
        invalidationTimeInSeconds * 1000
      ) {
        cache.delete(key);
      } else {
        console.log("returned from cache!");
        return cachedData!.data;
      }
    }

    const value = cb(...funcArgs);
    const lastExecuted = Date.now();
    cache.set(key, {
      data: value,
      lastExecuted,
    });
    return value as V;
  };
}
```

## Objects

### Sealing and freezing objects

Both these methods return the same object, but with different behavior.

- `Object.seal(obj)` : seals an object, meaning you can't add or remove properties from it, but you can still modify the existing properties
- `Object.freeze(obj)` : freezes an object, meaning you can't add, remove, or modify any properties on it

### `Object.defineProperty()`

The `Object.defineProperty()` method allows you to have more fine-grain controlled over object property access and writability. 

The basic syntax is like so: 

```ts
Object.defineProperty(object, propertyname, {
	value: any,
	writable: boolean,
	enumerable: boolean,
	configurable: boolean
});
```

- **first argument**: the object to pass in
- **second argument**: the property to configure
- **third argument**: the object of options, with these keys:
	- `value`: the value to set for the property
	- `writable`: if set to true, trying to reassign the property to a new value will throw an error. Basically makes the property readonly if true.
	- `enumerable`: if set to false, the property will not show up in for loops. 
	- `configurable`: if set to false, then trying to delete the property will throw an error.
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
composeWithTypes(repeatTwice, upperCase)("hello"); // returns HELLOHELLO
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

And here it is with generics: 

```ts
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  let timeoutId: ReturnType<Window["setTimeout"]>;
  return ((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;
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

And here it is with generics: 

```ts
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait: number = 300
) {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: any, ...args: any[]) {
    const context = this;
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
  } as T;
}
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

## Decorators

Decorators in javascript work just like they do in Python. They are syntactic sugar around functions that return wrapper functions and add some extra reusable functionality. 

```ts
function asyncLogger(fn) {
  return async function (...args) {
    console.log('Starting async function...');
    const result = await fn(...args);
    console.log('Async function completed.');
    return result;
  };
}

@asyncLogger
async function main() {
  const data = await makeRequest('http://example.com/');
  console.log(data);
}
```


## Generators

Generators in JS follow the same exact concept as in python, where you can iterate through a data structure without there being an actual data structure. 

Generators are created with generator functions, in which you use the special `yield` keyword.

The `yield` statement in a generator essentially returns a value and **pauses the execution** of the function, and only resumes execution once the programmer forces the generator to go to the next yield statement using the `generator.next()` method.

### Basic generators

```ts
// 1. create generator function
function* nums() {
	try {
		 yield 1; 
		 yield 2; 
		 yield 3;
	}
	catch(e) {
		console.error("gaah i hate the number 2 my grandpa died yesterday")
	}
}

// 2. get generator
var generator = nums(); 

// 3. call generator.next() to get next yielded element.
const {value, done} = generator.next()
console.log(`yielded value is ${value}, generator is done: ${done}`)

// 4. you can use generator.throw() to throw an error
generator.throw(new Error("idk bro"))
```

Create a generator function in JS using the `function*` syntax. Then you can use the yield keyword to yield values. 

Calling the generator function returns a `generator` object, which has these methods: 

- `generator.next()`: gets the value next yield statement in the generator function. This always returns an object with the `value` and `done` properties:
	- `value`: the yielded value
	- `done`: returns a **boolean** of whether or not the generator has any more yield statements. If it does, then `done` is false, otherwise it's `true`
- `generator.return(value)`: ends generator iteration and returns an object like so: 
	- `value`: the return value you passed in
	- `done`: true, since you stopped execution
- `generator.throw(err)`: allows you to throw a custom error which you can handle in the generator function. 

Whenever iteration stops, meaning you have no more yield statements or you purposely stop execution early, the `generator.next()` method will always return `{value: undefined, done: true}`

### Delegating to other generators

You can essentially reuse other generators inside generator functions for more modular and reusable code: 

```ts
function* g1() {
 yield 2;
 yield 3;
 yield 4;
}

function* g2() {
 yield 1;
 yield* g1();
 yield 5;
}

var it = g2();
console.log(it.next()); // 1
console.log(it.next()); // 2
console.log(it.next()); // 3
console.log(it.next()); // 4
console.log(it.next()); // 5
console.log(it.next()); // undefined
```

By using the `yield* generatorFunction()` syntax, it's essentially like copy pasting all the other generator function's code into the current generator function's body. 

### The full power of `yield*`

More generally, the `yield*` keyword allows us to break each element in an iterable to multiple yield statements, like so:

```ts
const nums = [1, 2, 3]

function* myguy() {
    yield* nums;
}

for (let num of myguy()) {
    console.log(num) 
}
```

You can also use it to create recursive generators: 

```ts
function* nTimes(n) {
  if (n> 0) {
    yield* nTimes(n - 1);
    yield n - 1;
  }
}
```

### Iterating over a generator

The main use case of a generator is to iterate over large datasets (like numbers from 1-100000) without actually using the memory to store a data structure that large. 

You can also use the spread `...` operator on a generator to spread out all its yield statements at once. 

```ts
function* range(n) {
 for (let i = 0; i < n; ++i) {
	 yield i;
 }
}
// looping
for (let n of range(10)) {
 // n takes on the values 0, 1, ... 9
}

// spread operator
let nums = [...range(3)]; // [0, 1, 2]
let max = Math.max(...range(100)); // 99
```


### Async Iterators

```ts
/**
 * Returns a promise which resolves after time had passed.
 */
const delay = time => new Promise(resolve => setTimeout(resolve, time));
async function* delayedRange(max) {
	 for (let i = 0; i < max; i++) {
		 await delay(1000);
		 yield i;
	 }
}

// takes 10 seconds total
for await (let number of delayedRange(10)) {
 console.log(number);
}
```

### Generator use cases

#### Iterating over object keys

```ts
let o = {
    x: 1, y: 2, z: 3,
    // A generator that yields each of the keys of this object
    *g() {
        for(let key of Object.keys(this)) {
            yield key;
        }
    }
};
console.log([...o.g()])
```

## Super weird performance tips

### Don't create objects in loops

Instead of creating objects, which is very expensive, just modify existing objects. 

```ts
a = {x:0,y:0}

function createObj() {
	return {x: 1, y: 1}
}

function modifyObj(a) {
	a.x = 1;
	a.y = 1;
	return a
}

for(i = 0; i < 100; i ++){ // Loop 1 is slow
 const slow = createObj();
}

for(i = 0; i < 100; i ++){ // Loop 2 is 500% faster than loop 1
 const fast = modifyObj(a);
}
```

### Don't create private methods

True private methods in JS prefixed with a `#` are memory-inefficient because they don't get stored on the prototype. Instead, each object instance of a class will carry along a copy of that private method instead of being able to access it on the prototype. 

The best of both worlds is to just use typescript private methods, which aren't really private. 
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

Here we combine classes with closures to create a singleton-factory pattern for any class with type support. 

```ts
type ConstructorArgs<T extends new (...args: any[]) => any> = T extends new (
  ...args: infer A
) => any
  ? A
  : never;

type ClassType = new (...args: any[]) => any;

function createClassFactory<T extends ClassType>(
  _class: T,
  ...args: ConstructorArgs<T>
) {
  let instance: InstanceType<T> | null = null;

  return {
    getInstance: () => {
      if (instance) return instance;
      instance = new _class(...args);
      return instance as InstanceType<T>;
    },
  };
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

You can also use it with objects instead like so: 

```ts
export class Subject<T> {
  private observers: Observable<T>[] = [];
  addObserver(observer: Observable<T>) {
    this.observers.push(observer);
  }
  removeObserver(observer: Observable<T>) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  notify(data: T) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

interface Observable<T> {
  update(data: T): void;
}

export class ConcreteObserver<T> implements Observable<T> {
	update(data: T) {
		console.log(data)
	}
}

const subject = new Subject<number>();
const observer1 = new ConcreteObserver<number>();
subject.addObserver(observer1);
subject.notify(1); // 1
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

### Mixin Pattern

The mixin pattern is a way to add reusable custom logic to different objects/classes by adding methods and properties on their prototype. 

I found out about a cool way to apply the mixin pattern and get type intellisense at the same time. Follow these steps: 

1. Create a function that accepts a class as an argument,
2. In the function, create a subclass that extends that class and adds whatever methods you want.
3. Return an instance of that subclass.

And voila, there's your mixin with type intellisense. 

```ts
function MoveMixin<T extends new (...args: any[]) => any> (superclass: T) {
    class MixinClass extends superclass {
        moveUp() {
            console.log('move up');
        }
        moveDown() {
            console.log('move down');
        }
        stop() {
            console.log('stop! in the name of love!');
        }
    };
    return MixinClass 
}

class Dog {
    bark() {
        console.log("woof woof")
    }
}

const MovingDog = MoveMixin(Dog)
const movingDog = new MovingDog()
movingDog.bark()
movingDog.moveUp()
```

You can even use mixins with static properties:

```ts
function FactoryMixin<T extends new (...args: any[]) => any>(superclass: T) {
  class MixinClass extends superclass {
    static instances: InstanceType<T>[] = [];

    static addInstance(instance: InstanceType<T>) {
      this.instances.push(instance);
    }

    static removeInstance(instance: InstanceType<T>) {
      this.instances = this.instances.filter((i) => i !== instance);
    }
  }
  return MixinClass;
}

class ResizeObserverModelTemp {
  observer: ResizeObserver;

  constructor(
    private element: HTMLElement,
    cb: (height: number, width: number, element: HTMLElement) => void
  ) {
    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const [box] = entry.borderBoxSize;
        cb(box.blockSize, box.inlineSize, this.element);
      });
    });
    this.observer.observe(this.element);
  }
}

class ResizeObserverModel extends FactoryMixin(ResizeObserverModelTemp) {
  constructor(
    element: HTMLElement,
    cb: (height: number, width: number, element: HTMLElement) => void
  ) {
    super(element, cb);
    ResizeObserverModel.instances.push(this);
  }
}
```

## ES6

### Script lazy loading

There are three important attributes that you should know when dealing with script tags: `async`, `defer`, and `type`.

- `async` : the script will be downloaded asynchronously, and executed as soon as it is available. The HTML parsing will not wait for the script to be downloaded and executed.
- `defer` : the script will be downloaded asynchronously, and executed only after the entire web page has loaded
- `type: "module"`: makes this script a module type, allowing you to import and export variables, but also makes the script behave as if it had a `defer` attribute, downloading script asynchronously and executing it after the entire web page has loaded.