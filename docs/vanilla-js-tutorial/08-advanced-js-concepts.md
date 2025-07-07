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

### Object entries and values

These are the basic static methods exposed on the `Object` class to get keys, values, and pairs of keys and values to iterate over in an array-like fashion:

- `Object.keys(obj)`: returns an array of the keys of the object.
- `Object.values(obj)`: returns an array of the keys of the object.
- `Object.entries(obj)`: returns an array of arrays representing the object, where each sub-array represents a key value pair like `[key, value]`.

To serialize back from an array into an object, you can do `Object.fromEntries()`:

```ts
type EntriesType<T = string, V = any> = [T, V][]
const entries : EntriesType = [ ["key1", "val1"], ["key2", 'val2'] ]

const obj = Object.fromEntries(entries)
```



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

### `Object.assign()`

To merge two objects together, you use the `Object.assign(target, source)` method. This copies over all unique properties from `target` object into the `source` object and returns a new object that is the combination of both.

## Arrays

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

## Maps

Maps are hash tables under the hood that are far more performant than simple javascript objects. Here are the main point of benefit maps have over objects:

- can handle a lot of data
- can store any javascript object as a key, storing by reference

## Sets

```ts
const set = new Set()
```

- `set.add(value)` : adds value to set
- `set.delete(value)` : deletes value to set

## Memory management

A **strong reference** is when you set a variable equal to an obj, like so:

```jsx
// strong reference
let obj = {msg: "hello"}

// strong reference
let obj2 = obj
```

Strong references cannot be cleaned up by the garbage collector, which can lead to excessive memory usage. The only way to clean up a strong reference is to manually set the obj and all reference variables that point to that object to null:

```ts
obj = null // -1 strong reference
obj2 = null // -1 strong reference, now no references and can be garbage collected.
```

Once there are no references to an object, it's marked for garbage collection, but doing this manually is terrible. Rather, we can use weak references.

You can instead make **weak references** using three javascript classes, all of which will prevent holding onto an object once it has been marked null (dereferenced).

- `WeakRef`: make any object or value a weak reference
- `WeakSet`: a set where any values/objects it refers to will be weak references
- `WeakMap`: a map where any values/objects it refers to will be weak references

### `WeakRef`

A **weak reference** is something you can create using the `WeakRef()` class that allows you to essentially create a pointer to an object. It doesn’t inhibit garbage-collection: if the strong reference becomes null, so too will the weak reference.

The `weakRef.deref()` method returns the object that thew weak reference pointer is pointing too, and `null` if the object was garbage-collected.

```jsx
let target = weakRef.deref();
if (target !== null) {
  // The target object is still alive.
}
```

This is best combined with registering an event listener for garbage collection through `FinalizationRegistry`.

### `WeakSet`

any objects you add to a weak set will have a weak reference pointing to it, and if you set the object to null, then it will get dereferenced. 

```ts
let object = {}
const weakSet = new WeakSet([object])

object = null
weakSet.size // 0, since automatically gets rid of weak reference
```

### `WeakMap`

a weakmap allows you to use any object as a key just like normal maps, but using weak maps provides performance benefits as it will be garbage collected once all references to that object cease to exist.

```html
<span id="thing" class="thing">a thing.</span>

<script>
const myWeakMap = new WeakMap();

// Set a value to a specific node reference.
myWeakMap.set(document.getElementById('thing'), 'some value');

// Access that value by passing the same reference.
console.log(myWeakMap.get(document.querySelector('.thing')); // 'some value'
</script>
```

To create a new weak map, you can use the `WeakMap.new()` static method:

```ts
const weakmap = WeakMap.new();
```

### `FinalizationRegistry`

The `FinalizationRegistry` class in javascript allows you to apply the observer pattern to watch for garbage collected instances that you subscribe to. Here's an example:

```ts
const listMap = new WeakMap();

listMap.set(document.getElementById('item2'), 'item2')

const registry = new FinalizationRegistry((heldValue) => {
	// Garbage collection has happened!
	console.log('After collection:', heldValue);
});

registry.register(document.getElementById('item2'), listMap);
```

## Functional Programming

### Pure functions

Pure functions are functions that don't have any side effects.

**Side effects** are directly running code, like assigning values to variables, printing to the console, and mutating data.

Here are the guidelines to follow to make a pure function:

- Don't mutate global or outer scope variables
- DOn't mutate your parameters in any way
- Don't have any side effects in your code

> [!NOTE]
> Pure functions are the goal of making a perfect function: a function that returns an output given an input, something with no side effects, which makes a function's behavior predictable

#### Idempotence

**idempotence** is the concept of making a function deterministic - given the same inputs, it will return the same output every time. This makes a function predictable and easy to test.

#### arity

**arity** is just a fancy term for referring to the number of arguments a function accepts. 

> [!TIP]
> The main rule regarding arity is that the less arity a function has, the easier it is to use.

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


## Tagged Template Literal Functions

You can use tagged template functions to easily parse strings and do string manipulations.

```jsx
function bold(strings, ...values) {
  if (values.length === 0) return strings.join("")

  const smallerLength = Math.min(strings.length, values.length)
  const boldedValues = values.map(str => `<b>${str}</b>`)
  let stringBuilder = ""
  for (let i = 0; i < smallerLength; i++) {
    stringBuilder+= strings[i] 
    stringBuilder+= boldedValues[i]
  }

  stringBuilder += strings.slice(smallerLength).join("")
  stringBuilder += boldedValues.slice(smallerLength).join("")
  return stringBuilder
}

const html = bold`My name is ${"Maria"}  and I love french toast. I am a petite ${18} year old.`
console.log(html) // My name is <b>Maria</b> and I love french toast. I am a petite <b>18</b> year old.
```

- `strings` : the array of strings that are not interpolated
- `values` : the array of values that are interpolated with the `${}`
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

## Async 

### Async methods

All the below methods take in an array of promises and return a single promise as a result, which resolves either to an array of data or a single data.

- `Promise.all()`: This takes in an array of promises and returns a promise that resolves when all the promises in the array resolve. If any of the promises in the array reject, then the promise returned by `Promise.all()` rejects.
  - <u>All promises in the array have to be resolved, else the promise rejects</u>.
- `Promise.allSettled()`: This takes in an array of promises and returns a promise that resolves when all the promises in the array resolve or reject - basically when they are **fulfilled**. The promise returned by `Promise.allSettled()` never rejects.
- `Promise.race()`: Given an array of promises, this returns the first promise in the array that gets fulfilled. It doesn't matter whether it resolves or rejects. All the promises race against each other to finish, hence the name.
- `Promise.any()`: Given an array of promises, this returns the first promise in the array that resolves successfully. If all the promises reject, then the promise returned by `Promise.any()` rejects.

### **with resolvers**

There is a new way to promisify functions without going into `new Promise(res, rej)` callback hell: use `Promise.withResolvers()`:

This method synchronously returns an object with these properties:

- `promise`: A blank promise
- `resolve`: the resolver function for the promise. Pass as many args as you want.
- `reject`: the rejector function for the promise.

```ts
const { promise, resolve, reject } = Promise.withResolvers();
```

Now here's a much more concise way of flipping a coin:
```ts
function flipCoin() {
	const { promise, resolve, reject } = Promise.withResolvers();

	setTimeout(() => {
	  if (Math.random() < 0.5) {
	    resolve('Resolved!');
	  } else {
	    reject('Rejected!');
	  }
	}, 1000);
}

flipCoin()
  .then((resolvedValue) => {
    console.log(resolvedValue);
  })
  .catch((rejectedValue) => {
    console.error(rejectedValue);
  });

```

Using this method offers new ways to organize your code and have separation of concerns:

```ts
const worker = new Worker("/path/to/worker.js");

function triggerJob() {
  worker.postMessage("begin job");
  
  return Promise.withResolvers();
}

function listenForCompletion({ resolve, reject, promise }) {
  worker.addEventListener('message', function (e) {
    resolve(e.data);
  });

  worker.addEventListener('error', function (e) {
     reject(e.data);
  });

  worker.addEventListener('messageerror', function(e) {
     reject(e.data);
  });
  
  return promise;
}

const job = triggerJob();

listenForCompletion(job)
  .then((result) => {
    console.log("Success!");
  })
  .catch((reason) => {
    console.error("Failed!");
  })
```

### Cancelling async operations

In javascript, there is not built in way to cancel async operations.

#### Manual cancellation

Here is the poor man's way of aborting an async operation:

1. Create a boolean that if true, signals abortion/cancellation, and if false, signals that the operation should not be cancelled yet.
2. Create a **race condition** of two promises - an async operation and a promise that rejects if the "signal" boolean is true. Execute the race with `Promise.race(promise_arr)`
3. Whenever you want to cancel the operation, just toggle the boolean signal to be true.

```ts
let isAborted = false;

let operation = new Promise((resolve, reject) => {
    setTimeout(() => resolve('operation complete'), 5000);
});

let cancel = new Promise((resolve, reject) => {
    if (isAborted) {
        reject('operation cancelled');
    } 
});

Promise.race([operation, cancel])
.then(data => console.log(data))
.catch(error => console.error(error));

// toggle isAborted to cancel operation
isAborted = true;
```

You can make this a bit more tractable by abstracting away this behavior to work for any async operation:

```ts
function makeCancelable<T>(promise: T){
    let isCanceled = false;
    
    const cancelablePromise = new Promise<T>((resolve, reject) => {
        promise.then(val => {
            isCanceled ? reject({isCanceled, val}) : resolve(val);
        });
        promise.catch(error => {
            isCanceled ? reject({isCanceled, error}) : reject(error);
        });
    });
    
    return {
        promise: cancelablePromise,
        cancel() {
            isCanceled = true;
        },
    };
}
```

However, you might notice a glaring flaw with this solution:

- This pattern doesn't truly cancel the operation, it merely ignores the result
- If the promise is already settled, the cancellation method has no effect

#### Cancelling with generators

We can short circuit a long running generator to stop with `generator.return()`.

```ts
function* generatorFn() {
    // simulate long-running task
    for (let i = 0; i < 1e6; i++) {
        yield i;
    }
} 

const generator = generatorFn();

// initiate long-running task
let nextIteration;
do {
    nextIteration = generator.next();
    // simulate work
    console.log(nextIteration.value);
} while (!nextIteration.done);

// at some point - we want to stop
generator.return();
```

Here is an abstraction around running a one-time async operation in a generator, and then being able to cancel at any time:

```ts

function createCancelablePromise<T>(asyncCb: () => Promise<T>) {
  async function* generator() {
    const result = await asyncCb();
    yield result;
  }

  const generatorInstance = generator();

  return {
    awaitValue: async () => {
      const { value } = await generatorInstance.next();
      return value;
    },
    cancel: async () => {
      await generatorInstance.return();
    },
  };
}
```

#### Cancelling with abort signals

```ts
function createCancelablePromise<T>(cb: () => Promise<T>) {
  const controller = new AbortController();
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  controller.signal.addEventListener("abort", () => {
    reject(new Error("Canceled"));
    return;
  });
  cb().then((value) => {
    if (controller.signal.aborted) {
      reject(new Error("Canceled"));
      return;
    }
    resolve(value);
  });
  return { promise, cancel: () => controller.abort() };
}
```

```ts
function makeAbortable(fn) {
  return signal => {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(signal.reason)
        return
      }

      signal.addEventListener("abort", () => {
        reject(signal.reason)
      })

      fn(resolve, reject, signal)
    })
  }
}
```

### Messaging queues

We can use asynchronous messaging queues in javascript, which is useful for doing stuff like rate limiting, limiting concurrency, and adding delays between requests.

```ts
// =============================================================================
// MESSAGING QUEUE IMPLEMENTATIONS
// =============================================================================

// Problem with your original implementation: 
// You never call processQueue() when adding items!

// =============================================================================
// 1. FIXED VERSION OF YOUR IMPLEMENTATION
// =============================================================================

class PromiseMessagingQueue<T, R> {
  private queue: {
    resolve: (value: R) => void;
    reject: (reason?: any) => void;
    args: T;
  }[] = [];
  private isProcessing = false;

  constructor(private onData: (data: T) => Promise<R>) {}

  add(args: T): Promise<R> {
    const { resolve, reject, promise } = Promise.withResolvers<R>();
    this.queue.push({ resolve, reject, args });
    
    // THIS WAS MISSING - trigger processing when adding items
    this.processQueue();
    
    return promise;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    const item = this.queue.shift()!;
    
    try {
      const result = await this.onData(item.args);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.isProcessing = false;
      // Process next item if any
      this.processQueue();
    }
  }
}

// =============================================================================
// 2. ENHANCED VERSION WITH BETTER ERROR HANDLING
// =============================================================================

class EnhancedPromiseQueue<T, R> {
  private queue: Array<{
    resolve: (value: R) => void;
    reject: (reason?: any) => void;
    args: T;
    id: string;
  }> = [];
  private isProcessing = false;
  private nextId = 0;

  constructor(
    private onData: (data: T) => Promise<R>,
    private options: {
      maxRetries?: number;
      retryDelay?: number;
      onError?: (error: any, args: T) => void;
    } = {}
  ) {}

  add(args: T): Promise<R> {
    const { resolve, reject, promise } = Promise.withResolvers<R>();
    const id = `queue-${this.nextId++}`;
    
    this.queue.push({ resolve, reject, args, id });
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return promise;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await this.processWithRetry(item);
        item.resolve(result);
      } catch (error) {
        this.options.onError?.(error, item.args);
        item.reject(error);
      }
    }
    
    this.isProcessing = false;
  }

  private async processWithRetry(item: any): Promise<R> {
    const maxRetries = this.options.maxRetries || 0;
    const retryDelay = this.options.retryDelay || 1000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.onData(item.args);
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isActive(): boolean {
    return this.isProcessing;
  }
}

// =============================================================================
// 3. RATE-LIMITED QUEUE (WITH CONCURRENCY CONTROL)
// =============================================================================

class RateLimitedQueue<T, R> {
  private queue: Array<{
    resolve: (value: R) => void;
    reject: (reason?: any) => void;
    args: T;
    timestamp: number;
  }> = [];
  private activePromises = new Set<Promise<void>>();
  private lastProcessTime = 0;

  constructor(
    private onData: (data: T) => Promise<R>,
    private options: {
      maxConcurrency?: number;
      minDelay?: number; // Minimum time between requests
      maxRetries?: number;
    } = {}
  ) {
    this.options.maxConcurrency = options.maxConcurrency || 1;
    this.options.minDelay = options.minDelay || 0;
    this.options.maxRetries = options.maxRetries || 0;
  }

  add(args: T): Promise<R> {
    const { resolve, reject, promise } = Promise.withResolvers<R>();
    
    this.queue.push({ 
      resolve, 
      reject, 
      args, 
      timestamp: Date.now() 
    });
    
    // Start processing
    this.processQueue();
    
    return promise;
  }

  private async processQueue() {
    // Check if we can process more items
    if (this.activePromises.size >= this.options.maxConcurrency! || 
        this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift()!;
    
    // Rate limiting - ensure minimum delay between requests
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    
    if (timeSinceLastProcess < this.options.minDelay!) {
      const delay = this.options.minDelay! - timeSinceLastProcess;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastProcessTime = Date.now();
    
    // Process the item
    const processingPromise = this.processItem(item);
    this.activePromises.add(processingPromise);
    
    // Remove from active set when done
    processingPromise.finally(() => {
      this.activePromises.delete(processingPromise);
      // Try to process next item
      this.processQueue();
    });
    
    // Try to process more items if we haven't hit concurrency limit
    this.processQueue();
  }

  private async processItem(item: any): Promise<void> {
    try {
      const result = await this.onData(item.args);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      activeCount: this.activePromises.size,
      canProcess: this.activePromises.size < this.options.maxConcurrency!
    };
  }
}

// =============================================================================
// 4. PRIORITY QUEUE IMPLEMENTATION
// =============================================================================

interface PriorityQueueItem<T, R> {
  resolve: (value: R) => void;
  reject: (reason?: any) => void;
  args: T;
  priority: number;
  timestamp: number;
}

class PriorityQueue<T, R> {
  private queue: PriorityQueueItem<T, R>[] = [];
  private isProcessing = false;

  constructor(private onData: (data: T) => Promise<R>) {}

  add(args: T, priority: number = 0): Promise<R> {
    const { resolve, reject, promise } = Promise.withResolvers<R>();
    
    const item: PriorityQueueItem<T, R> = {
      resolve,
      reject,
      args,
      priority,
      timestamp: Date.now()
    };
    
    // Insert in priority order (higher priority first, then by timestamp)
    this.insertSorted(item);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return promise;
  }

  private insertSorted(item: PriorityQueueItem<T, R>) {
    let insertIndex = 0;
    
    for (let i = 0; i < this.queue.length; i++) {
      const existing = this.queue[i];
      
      // Higher priority goes first
      if (item.priority > existing.priority) {
        insertIndex = i;
        break;
      }
      
      // Same priority, earlier timestamp goes first
      if (item.priority === existing.priority && 
          item.timestamp < existing.timestamp) {
        insertIndex = i;
        break;
      }
      
      insertIndex = i + 1;
    }
    
    this.queue.splice(insertIndex, 0, item);
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await this.onData(item.args);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }
    
    this.isProcessing = false;
  }
}

// =============================================================================
// 5. BATCH PROCESSING QUEUE
// =============================================================================

class BatchProcessingQueue<T, R> {
  private queue: Array<{
    resolve: (value: R) => void;
    reject: (reason?: any) => void;
    args: T;
  }> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private onBatch: (batch: T[]) => Promise<R[]>,
    private options: {
      batchSize?: number;
      maxWaitTime?: number;
    } = {}
  ) {
    this.options.batchSize = options.batchSize || 10;
    this.options.maxWaitTime = options.maxWaitTime || 1000;
  }

  add(args: T): Promise<R> {
    const { resolve, reject, promise } = Promise.withResolvers<R>();
    
    this.queue.push({ resolve, reject, args });
    
    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.options.maxWaitTime);
    }
    
    // Process immediately if batch is full
    if (this.queue.length >= this.options.batchSize!) {
      this.processBatch();
    }
    
    return promise;
  }

  private async processBatch() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Extract batch
    const batchSize = Math.min(this.options.batchSize!, this.queue.length);
    const batch = this.queue.splice(0, batchSize);
    
    try {
      const results = await this.onBatch(batch.map(item => item.args));
      
      // Resolve all promises in the batch
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in the batch
      batch.forEach(item => {
        item.reject(error);
      });
    } finally {
      this.isProcessing = false;
      
      // Process next batch if items remain
      if (this.queue.length > 0) {
        this.processBatch();
      }
    }
  }
}
```

```ts
// =============================================================================
// USAGE EXAMPLES
// =============================================================================

// Example 1: Basic Fixed Queue
async function basicExample() {
  const queue = new PromiseMessagingQueue<string, string>(async (data) => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Processed: ${data}`;
  });

  // Add multiple items
  const promises = [
    queue.add("item1"),
    queue.add("item2"),
    queue.add("item3")
  ];

  const results = await Promise.all(promises);
  console.log("Basic results:", results);
}

// Example 2: Rate Limited Queue
async function rateLimitedExample() {
  const queue = new RateLimitedQueue<string, string>(
    async (data) => {
      console.log(`Processing: ${data} at ${new Date().toISOString()}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return `Done: ${data}`;
    },
    {
      maxConcurrency: 2,
      minDelay: 1000 // 1 second between requests
    }
  );

  // Add multiple items quickly
  const promises = Array.from({ length: 5 }, (_, i) => 
    queue.add(`item-${i}`)
  );

  const results = await Promise.all(promises);
  console.log("Rate limited results:", results);
}

// Example 3: Priority Queue
async function priorityExample() {
  const queue = new PriorityQueue<string, string>(async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Processed: ${data}`;
  });

  // Add items with different priorities
  const promises = [
    queue.add("low-priority", 1),
    queue.add("high-priority", 10),
    queue.add("medium-priority", 5)
  ];

  const results = await Promise.all(promises);
  console.log("Priority results:", results);
  // Should process in order: high-priority, medium-priority, low-priority
}

// Example 4: Batch Processing
async function batchExample() {
  const queue = new BatchProcessingQueue<number, number>(
    async (batch) => {
      console.log(`Processing batch of ${batch.length} items`);
      // Process all items in batch
      return batch.map(x => x * 2);
    },
    {
      batchSize: 3,
      maxWaitTime: 2000
    }
  );

  // Add items one by one
  const promises = Array.from({ length: 7 }, (_, i) => queue.add(i));
  
  const results = await Promise.all(promises);
  console.log("Batch results:", results);
}

// Example 5: Gemini API Client using Enhanced Queue
class GeminiClient {
  private queue: EnhancedPromiseQueue<string, string>;

  constructor(private apiKey: string) {
    this.queue = new EnhancedPromiseQueue(
      async (prompt: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Generated response for: ${prompt}`;
      },
      {
        maxRetries: 3,
        retryDelay: 1000,
        onError: (error, prompt) => {
          console.error(`Failed to process prompt: ${prompt}`, error);
        }
      }
    );
  }

  async generateText(prompt: string): Promise<string> {
    return this.queue.add(prompt);
  }

  getQueueStats() {
    return {
      queueLength: this.queue.getQueueLength(),
      isActive: this.queue.isActive()
    };
  }
}

// Run examples
async function runExamples() {
  console.log("=== Basic Example ===");
  await basicExample();
  
  console.log("\n=== Rate Limited Example ===");
  await rateLimitedExample();
  
  console.log("\n=== Priority Example ===");
  await priorityExample();
  
  console.log("\n=== Batch Example ===");
  await batchExample();
  
  console.log("\n=== Gemini Client Example ===");
  const client = new GeminiClient("fake-api-key");
  
  const geminiPromises = [
    client.generateText("Hello"),
    client.generateText("World"),
    client.generateText("AI")
  ];
  
  const geminiResults = await Promise.all(geminiPromises);
  console.log("Gemini results:", geminiResults);
  console.log("Queue stats:", client.getQueueStats());
}

// Uncomment to run examples
// runExamples().catch(console.error);
```
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

The `yield` statement in a generator essentially returns a value and **pauses the execution** of the function, and only resumes execution once the programmer forces the generator to go to the next yield statement using the `generator.next()` method.

#### Iterators and iterables

Before we learn about generators, we need to learn about iterators and iterables.

- **iterator**: an object with a `next()` method, which when invoked, returns an object in the shape of `{value: any, done: boolean}`.
- **iterable**: an object with a `[Symbol.iterator]()` method implemented that returns an iterator object. This lets an object be iterated over.

**basic example of an iterator**

The iterator below is an object with a `next()` method that returns an object with two properties: `value` and `done`.

```ts
const gospelIterator = {
  index: -1,

  next() {
    const gospels = ["Matthew", "Mark", "Luke", "John"];
    this.index++;

    return {
      value: gospels.at(this.index),
      done: this.index + 1 > gospels.length,
    };
  },
};

gospelIterator.next(); // {value: 'Matthew', done: false}
gospelIterator.next(); // {value: 'Mark', done: false}
gospelIterator.next(); // {value: 'Luke', done: false}
gospelIterator.next(); // {value: 'John', done: false}
gospelIterator.next(); // {value: undefined, done: true}
```

**basic example of an iterable**

In our iterable, we implement the `[Symbol.iterator]()` method to return an iterator object with the `next()` method implemented.

```ts
const gospelIteratable = {
  [Symbol.iterator]() {
    return {
      index: -1,

      next() {
        const gospels = ["Matthew", "Mark", "Luke", "John"];
        this.index++;

        return {
          value: gospels.at(this.index),
          done: this.index + 1 > gospels.length,
        };
      },
    };
  },
};
```

The concepts of iterables returning iterators is useful because it allows us to have good practices for memory:

```ts
function isLeapYear(year) {
  return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

const leapYears = {
  [Symbol.iterator]() {
    return {
      startYear: 1900,
      currentYear: new Date().getFullYear(),
      next() {
        this.startYear++;

        while (!isLeapYear(this.startYear)) {
          this.startYear++;
        }

        return {
          value: this.startYear,
          done: this.startYear > this.currentYear,
        };
      },
    };
  },
};

for (const leapYear of leapYears) {
  console.log(leapYear);
}
```

> [!NOTE]
> Notice that we don't need to wait for the _entire sequence_ of years to be built ahead of time. All state is stored within the iterable object itself, and the next item is computed _on demand_. That's worth camping out on some more.
### Basic generators

Create a generator function in JS using the `function*` syntax, which is syntactic sugar over a regular generator function. It essentially is a function with `return` and `yield` statements which returns an iterable under the hood. 

- Using `function*` syntax makes the function a function that returns 
- Using the `yield <value>` keyword in a generator function basically creates the `{value, done}` object and is what will be returned 

Invoking a `function*` function is syntactic sugar for converting that function into a normal generator function that returns an object with these methods:

- `generator.next()`: gets the value next yield statement in the generator function. This always returns an object with the `value` and `done` properties:
	- `value`: the yielded value
	- `done`: returns a **boolean** of whether or not the generator has any more yield statements. If it does, then `done` is false, otherwise it's `true`
- `generator.return(value)`: ends generator iteration and returns an object like so: 
	- `value`: the return value you passed in
	- `done`: true, since you stopped execution
- `generator.throw(err)`: allows you to throw a custom error which you can handle in the generator function. 

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

### Iterating over a generator + generator methods

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

You also have access to generator methods that a generator object has on its prototype:

- `generator.map(cb)`: maps every yielded value to some new value
- `generator.forEach(cb)`: does something for every yielded value
- `generator.find(cb)`: returns the first yielded value that passes the predicate
- `generator.filter(cb)`: only yields the values that pass the predicate
- `generator.take(n)`: only yields the first `n` values.
- `generator.drop(n)`: skips the first `n` values and yields the rest.

```ts
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

const result = range(3, 5).map((x) => x * 2);
result.next(); // { value: 6, done: false }
```

### Async Iterators

Async iterators let you iterate over the generator in a `for await` loop, since the `generator.next()` function will become asynchronous.

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

Here is an example of changing websockets into a way they can be consumed in a stream-like fashion:

```ts
// Conceptual example for WebSocket
async function* webSocketMessageStream(url) {
  const ws = new WebSocket(url);
  const messageQueue = [];
  let resolveNextMessage = null;

  ws.onmessage = (event) => {
    if (resolveNextMessage) {
      resolveNextMessage(event.data);
      resolveNextMessage = null;
    } else {
      messageQueue.push(event.data);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));
  console.log('WebSocket connected.');

  try {
    while (true) {
      if (messageQueue.length > 0) {
        yield messageQueue.shift();
      } else {
        yield new Promise((resolve) => {
          resolveNextMessage = resolve;
        });
      }
    }
  } finally {
    ws.close();
    console.log('WebSocket closed.');
  }
}

// Example usage (run in a browser context or with a WebSocket library)
// (async () => {
//   const stream = webSocketMessageStream('ws://echo.websocket.org');
//   for await (const message of stream) {
//     console.log('Received WS message:', message);
//     // Simulate sending a message back
//     if (message === 'Hello') {
//       ws.send('World'); // You'd need a reference to 'ws' or a method for this
//     }
//   }
// })();
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

#### Async generators for pagination

If your API has pagination options, you can fetch page data in a generator loop, constantly yielding the API response and then fetching the next one in a loop.

```ts
async function* fetchAllItems() {
  let currentPage = 1;

  while (true) {
    const data = await requestFromApi(currentPage);

    if (!data.hasMore) return;

    currentPage++;

    yield data.items;
  }
}

for await (const items of fetchAllItems()) {
  // Do stuff.
}
```

#### Infinite destructuring / factory

Since generators are iterables (can be converted to arrays), they can be destructured with array destructing. You can even create factories from generators because an infinite generator with a `while (true) {...}` loop is essentially an infinite iterable that can be infinitely destructured.

```ts
function* getElements(tagName = 'div') {
  while (true) yield document.createElement(tagName);
}

const [el1, el2, el3] = getElements('div');
```

We can abstract this to any factory:

```ts
function* factory<T>(numElements: number, factory: (index: number) => T) {
  for (let i = 0; i < numElements; i++) {
    yield factory(i);
  }
}

const dogs = [...factory(3, (i) => `dog number ${i}`)];
console.log(dogs); // [ "dog number 0", "dog number 1", "dog number 2" ]
```

We can also port this to work asynchronously:

```ts
async function* asyncFactory<T>(
  numElements: number,
  factory: (index: number) => Promise<T>
) {
  for (let i = 0; i < numElements; i++) {
    yield await factory(i);
  }
}

const awaitedDogs = await Array.fromAsync(
  asyncFactory(3, async (i) => `dog ${i}`)
);
console.log(awaitedDogs);
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

### Value-object pattern

The value object pattern is the idea of overloading operators or overriding equality to make objects behave like primitive values. Equality would be based on the object's structure and values rather than by reference.

The main use cases for this would be to represent and do basic operations with things like coordinates, dates, employee representations, etc.

The most basic implementation would be exposing a `equals()` method on a class to have a way to check value-equality instead of referential equality:

```ts
export class TodoItem {
    constructor(text) {
        this.text = text;
    }
    equals(other) {
        return this.text == other.text;
    }
}
```

### Memento Pattern

The memento pattern saves the original state of an object and exposes methods to either save the new modified version as the source truth or rollback/restore to the original version. 

The most basic version would use closures:

```ts
function memento(obj: object) {
	const original = {...obj}
	let source = {...obj}
	return {
		save: (newobj: object) => source = {...newobj},
		restore: () => source = {...original},
		obj: source
	}
}
```

### Command pattern

Command pattern helps us make our click handlers reusable/modifiable by helping us create an object that encapsulates all data and info needed to do something on an event trigger. 

The pattern has two main components:

- **command**: a single command represents an encapsulation of some function logic
- **command executor**: what actually runs the command. It takes in a command and some data and executes the command with that data.

Here is the most basic version of the pattern:

```tsx
  export class Command<T> {
    constructor(
      public name: string,
      public cb: (data: T) => void
    ) {}
  
    equals(command: Command<T>) {
      return this.name === command.name;
    }
  }
  
  export class CommandExecutor {
    static execute<T>(command: Command<T>, data: T) {
      command.cb(data);
    }
  }
  
  const add = new Command("add", ({ id } : { id : number }) => {
    console.log("adding to database");
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    CommandExecutor.execute(add, {id: 3});
  });
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

An observable object usually contains 3 important parts:

- `observers`: an array of observers that will get notified whenever a specific event occurs
- `subscribe()`: a method in order to add observers to the observers list
- `unsubscribe()`: a method in order to remove observers from the observers list
- `notify()`: a method to notify all observers whenever a specific event occurs

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

Here's an even simpler observer abstraction by using sets for deduping instead of splicing with arrays.

```ts
  // Observer Design Pattern
export const observerMixin = {
    observers: new Set<() => void>(),
    addObserver(obs : () => void) { this.observers.add(obs) },
    removeObserver(obs: () => void) { this.observers.delete(obs)},
    notify() { this.observers.forEach(obs=>obs()) }
}
```

and you can even make it generic:

```ts
// Observer Design Pattern
export function observerMixin<T extends (...args: any[]) => void>() {
  return {
    _observers: new Set<T>(),
    addObserver(obs: T) {
      this._observers.add(obs);
    },
    removeObserver(obs: T) {
      this._observers.delete(obs);
    },
    notify() {
      this._observers.forEach((obs) => obs());
    },
  };
}
```
#### Classes

Here is the most basic example you can get:

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

The mixin pattern is a way to add reusable custom logic to different objects/classes by adding methods and properties on their prototype, and creating a new object from that. Think of it as a way of combining objects together in a generic, reusable way.

But in the end, there are two ways to do mixins:

- **method 1 - add to prototype**: By applying a mixin on the class's prototype, you will add those properties and methods from the mixin directly onto the object instance rather than them being static.
- **method 2 - add to class**: By applying a mixin on a class, you are applying that mixin statically and all those properties and methods from the mixin object will appear statically on the new object.

To merge two objects together, you use the `Object.assign(obj1, obj2)` method.

Here's an example showcasing both methods:

```ts
// Observer Design Pattern
export function observerMixin<T extends (...args: any[]) => void>() {
  return {
    _observers: new Set<T>(),
    addObserver(obs: T) {
      this._observers.add(obs);
    },
    removeObserver(obs: T) {
      this._observers.delete(obs);
    },
    notify() {
      this._observers.forEach((obs) => obs());
    },
  };
}

class _Todos {
  public data = [] as string[];
}

// returns a class
const mixinOnClass = () => Object.assign(_Todos, observerMixin());
// returns an object
const mixinOnObject = () => Object.assign(new _Todos(), observerMixin());

class Todos extends mixinOnClass() {
  addTodo(todo: string) {
    this.data.push(todo);
    Todos.notify()
  }
}
```



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

### `import.meta`

- `import.meta.url`: gives you the filepath as a file URL of the filename the code is in.
- `import.meta.path`: gives you the filepath as a normal filepath of the filename the code is in.
- `import.meta.dir`: gives you the directory path of the current directory the code is in.
- `import.meta.file`: gives you the filename of the current file.
- `import.meta.main`: a boolean that returns true if this code is being executed as an entrypoint rather than as a module. Think of this as the python equivalent of `__name__ == "__main__"`.



```ts
import.meta.dir;   // => "/path/to/project"
import.meta.file;  // => "file.ts"
import.meta.path;  // => "/path/to/project/file.ts"
import.meta.url;   // => "file:///path/to/project/file.ts"
import.meta.main;  // `true` if this file is directly executed by `bun run`
```

## Cool Hacks

### Template interpolation

A super cool hack to do is interpolation like from langchain:

What if you wanted to declaratively insert values into HTML just like you can with JSX? Well you can use this hacky method to do so with an HTML string.

```tsx
function interpolate (str, params) {
    let names = Object.keys(params);
    let values = Object.values(params);
    return new Function(...names, `return \\`${str}\\`;`)(...values);
}

const HTML = "<p>${price}</p>"

const parsed = interpolate(HTML, {
  price: 49
})
console.log(parsed) // <p>49</p>
```

You can combine this with webcomponent templates to easily insert values into the shadow DOM.

And here is how we do it with a webcomponent:

1. Create the template. `title` is the variable to swap
    
    ```tsx
    <div class="container">
      <h1>${title}</h1>
      <slot></slot>
    </div>
    ```
    
2. Do this
    
    ```tsx
    // any templating we have in our HTML template
    interface HTMLParams {
      title: string;
    }
    
    const newHTML = WebComponent.interpolate<HTMLParams>(HTMLContent, {
      title: "Content Script UI",
    })
    ```

Here's an even cooler version of using template interpolation to interpolate anything in curly braces:

```tsx
function interpolate(str: string, params: Record<string, string>) {
  const newTemplate = str.replace(/\{([A-Za-z0-9_]+)\}/g, (match, p1) => {
    return params[p1] || match;
  });

  return newTemplate;
}

const test = interpolate("Hello {name}", {
  name: "josh",
});

console.log(test);
```