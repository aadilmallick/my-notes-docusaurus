# TypeScript basics: the TypeScript handbook

## Config options

### Compiler options

Let's learn about all the compiler options in the tsconfig, which live under the `compilerOptions` key:

- `outDir`: the directory to output compiled files to.
- `rootDir`: the directory to compile files from.
- `noEmit` : a boolean. If true, does not emit compiled files, meaning running `tsc` will not compile to javascript. Use this when using some frontend framework and not compiling your own typescript.
- `noEmitOnError`: a boolean. If true, does not emit compiled files if there are any errors.
- `target` : the specific year of JavaScript syntax you want to compile to. If you want to support older browsers, you would do es5, but if you want to use newer syntax, you would do es6 or es2015. If you want your compiled typescript to be bleeding edge, the same syntax as typescript but without type annotations, use `esnext`.
- `strictPropertyInitialization`: a boolean. If true, requires that all class properties are initialized and synchronously intialized in the constructor.
- `esModuleInterop`: a boolean. If true, allows you to use default imports from commonjs modules. Always set this to true
- `skipLibCheck`: a boolean. If true, skips type checking of all declaration files in the project. Always set this to true.
- `resolveJsonModule`: a boolean. If true, allows you to import json files as modules. Always set this to true.
- `lib`: Base APIs typescript gives intellisense for. It is an array of strings, and you should always at least include the `"es2022"` option, which gives base APIs for both node and the browser. If working in the browser, also include `"dom"` and `"dom.iterable"`.

```json
{
  "compilerOptions": {
    // base options
    "noEmit": false,
    "noEmitOnError": true,
    "target": "esnext",
    "strictPropertyInitialization": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,

    // compiler options for working in typescript node project
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "sourceMap": true,

    // compiler options for working in typescript frontend project
    "module": "esnext",
    "jsx": "react",
    "moduleResolution": "Bundler",
    "lib": ["dom", "es2022", "dom.iterable"]

    // if building for library
  }
}
```

### Other options

Outside of the compiler options, here are the different options you get access to, many of which are important for deciding which files to compile.

- `include`: an array of glob patterns that match files to include in compilation. The default is `["**/*"]`, which includes all files in the project.
- `exclude`: an array of glob patterns that match files to exclude from compilation. The default is `["node_modules", "bower_components", "jspm_packages"]`, which excludes all files in the `node_modules`, `bower_components`, and `jspm_packages` folders.
- `files`: an array of files to include in compilation.

## TS Theory

### Structural vs nominal typing

Typescript is **structurally typed** instead of being **nominally typed**, meaning that TS will treat two objects as the same even if they implement different interfaces or extend from different classes if they have the exact same properties and methods. 

The code example below demonstrates the structurally typed behavior of TS:

```ts
class Zebra {
  trot() {
    // ...
  }
}

class Poodle {
  trot() {
    // ...
  }
}

function ambleAround(animal: Zebra) {
  animal.trot()
}

let zebra = new Zebra()
let poodle = new Poodle()

ambleAround(zebra)   // OK
ambleAround(poodle)  // OK
```

The `ambleAround()` function is only supposed to take in a Zebra, but instead we can pass in a Poodle instance because they both have the exact same structure. 

> [!NOTE]
> The only exception to this is with private and protected fields, since those live on the object itself instead of on the prototype. 


### Temporal callback issue

Let's look at the following code:

```ts
let count: number | null = 0;

function doCount() {
  if (count !== null) {
    // typescript thinks count may be null here
    [1, 2, 3].map((val) => count + val);
  }
}
```

Why does TypeScript think that the `count` variable may be null in the map callback, even when it's inside a type guard? The reason is because TypeScript assumes all callbacks can be asynchronous by default.

Here is another example where this is a concern because of an async operation with `setTimeout()`:

```ts
let count: number | null = 0;

if (count !== null) {
  // valid point where count could actually be null, even though timeout gets executed
  setTimeout(() => count + 1, 1000);
}
count = null;
```

So any time we're accessing a global variable inside of a callback, we need to make a local copy of it so that Typescript knows that it has a value.

```ts
let count: number | null = 0;

if (count !== null) {
  // make a local copy of count
  let localCount = count;
  setTimeout(() => localCount + 1, 1000);
}
count = null;
```


### Namespaces

Namespaces are ways to keep your code clean and modularized and prevent global autocompletion for some type.

```ts
// myNamespace.ts
namespace MyNamespace {
  export function doSomething() {
    console.log("Doing something...");
  }
}

// main.ts
/// <reference path="myNamespace.ts" />
MyNamespace.doSomething(); // Output: "Doing something..."
```

### Declaration merging

Declaration merging refers to how you can redeclare certain things like interfaces, and their type definitions will merge together to form some larger type rather than throwing an error. 

For example, the below code will work, but if we had used the `Type` keyword instead, it would have thrown an error. 

```ts
// User has a single field, name
interface User {
  name: string
}

// User now has two fields, name and age
interface User {
  age: number
}

let a: User = {
  name: 'Ashley',
  age: 30
}
```

Here is how we can augment namespaces, which is useful when we want to add methods and intellisense to some library:

```ts
// myModule.d.ts
declare namespace MyModule {
  export interface MyModule {
    newFunction(): void;
  }
}

// main.ts
/// <reference path="myModule.d.ts" />
namespace MyModule {
  export class MyModule {
    public newFunction() {
      console.log("I am a new function in MyModule!");
    }
  }
}

const obj = new MyModule.MyModule();
obj.newFunction(); // Output: "I am a new function in MyModule!"
```

Here is how you can globally augment something in NodeJS context:

```ts
// myModule.d.ts
declare namespace NodeJS {
  interface Global {
    myGlobalFunction(): void;
  }
}

// main.ts
global.myGlobalFunction = function () {
  console.log("I am a global function!");
};

myGlobalFunction(); // Output: "I am a global function!"
```

## Create an NPM package with TYpeScript

If we want to use typescript to create an NPM package, the basic flow will look like this:

- Source code is in typescript. Compile to output javascript, which will be main code used as the package.
- Output source maps and type declaration files.

1. `npm init -y` to create a package.json file.
2. `npm install typescript --save-dev` to install typescript as a dev dependency.
3. `npx tsc --init` to create a tsconfig.json file. You should also have the compiler options set:

   ```json
   {
     "compilerOptions": {
       "outDir": "./dist", // specify the output directory for compiled javascript
       "rootDir": "./src", // specify the directory for our typescript source code
       "declaration": true, // generate type declaration files, .d.ts
       "sourceMap": true, // generate source maps for debugging
       "declarationMap": true // generate source maps for type declaration files
       // other compiler options ...
     }
   }
   ```

4. Set the `main` key in the package json to the compiled main js file in the dist.
5. Set the `types` key in the package json to the `dist` folder, which houses the compiled type declaration file.

## Type Narrowing

Type narrowing is the process of narrowing down a union type to a single type so we can access specific methods at runtime.

There are some basic narrowing techniques and others more advanced.

### Basic narrowing

- `typeof` narrowing: using the `typeof` operator to narrow down a union type consisting of primitive types
- truthiess narrowing: checking if a value is falsy or truthy
- `instanceof` narrowing: checking if an object is an instance of a certain class
- `in` narrowing: checking if a property or function exists on an object

#### `typeof` guard

Typeof guards are used with variables that hold primitive values. We use the `typeof` operator to see what type a variable is, allowing us to execute different code on that result.

Here the union type we are trying to narrow down is `number | string`, which is made of primitive types. It is a perfect candidate for the `typeof` guard

```ts
function print(numOrString: number | string) {
  if (typeof numOrString === "number") {
    // typescript now knows that it is a number
    console.log(numOrString ** 4);
  } else {
    // typescript knows that otherwise, it is a string
    console.log(numOrString.repeat(3));
  }
}
```

#### `instanceof` guard

The `instanceof` operator is used to check if an object is an instance of a certain class. This is useful for narrowing down a union type that consists of classes.

```ts
class Cat {
  meow() {}
}

class Dog {
  bark() {}
}

function makeSound(animal: Cat | Dog) {
  if (animal instanceof Cat) {
    // typescript knows that animal is a cat
    animal.meow();
  } else {
    // typescript knows that animal is a dog
    animal.bark();
  }
}
```

### Advanced narrowing

#### Type predicates

Type predicates are useful when you use them with functions that return a boolean, and are used to narrow down a union type. They are used with the `is` keyword.

The type prediacte syntax is like so:

```ts
value is Type
```

1. Create a function that returns a boolean, and type annotate the return type with the type predicate. Whatever value function returns will be the value that the type predicate will be casted to.

   ```ts
   // the `animal is Cat` type predicate will be casted to whatever the function returns`
   function isCat(animal: Cat | Dog): animal is Cat {
     return animal instanceof Cat;
   }
   ```

2. Use the function in an if statement to narrow down the union type.

   ```ts
   function makeSound(animal: Cat | Dog) {
     if (isCat(animal)) {
       // typescript knows that animal is a cat
       animal.meow();
     } else {
       // typescript knows that animal is a dog
       animal.bark();
     }
   }
   ```

You can also make these functions throw errors if the type predicate returns false instead by using the `asserts` syntax like so, and then setting that as the return type of the function:

```ts
asserts value is Type
```

```ts
interface Cat {
  canMeow: true;
  name: string;
}

function isCat(cat: any): asserts cat is Cat {
  if (!(cat.canMeow === true && cat.name)) {
    throw new Error("sorry, not a cat");
  }
}

isCat("meow"); // throws an error
isCat({ canMeow: true, name: "rocky" } as Cat); // passes
```

#### Discriminated Unions + Exhaustiveness checking

**Discriminated unions** are the best, most robust way to type check union types of interfaces. The idea is that we add a dummy property on each interface called a **discriminant**, and type it with a literal type, which is unique to each interface and allows us to distinguish between them.

- The **discriminant** is a property we put on each interface, named `kind` or `discriminant` or whatever, and they should be literal types like strings.
- It is a unique key we can put on each object to distinguish it.

> exhaustive check

If we add new interfaces to the union type but forget to implement the discriminant check, then we run an exhaustive check that will catch all cases.

```javascript
switch(media.discriminant) {
    ...
    default:
        const _exhaustiveCheck : never = media;
}
```

By using the `never` type, we ensure that if our code ever reaches that line of code in execution, typescript will scream and throw an error.

```typescript
interface Anime {
  title: string;
  duration: number;
  discriminant: "anime";
}

interface Movie {
  title: string;
  duration: number;
  discriminant: "movie";
}

interface TVShow {
  title: string;
  duration: number;
  discriminant: "tvshow";
}

function getMedia(media: Anime | Movie | TVShow) {
  switch (media.discriminant) {
    case "anime":
      console.log("Dattebayo");
      break;
    case "movie":
      console.log("It's morbin time");
      break;
    case "tvshow":
      console.log("We're done when I say we're done");
      break;
    default:
      const _exhaustiveCheck: never = media;
  }
}
```

## Functions

### Optional parameters in callbacks

Rule: When writing a function type for a callback, never write an optional parameter unless you intend to call the function without passing that argument.

### Generic constraints

Whenever you are using generics and a parameter in your function has a generic type, like `T`, and you need to access a property off that parameter as if it were an object, you need to use **generic constraints** to tell TypeScript what the structure of the `T` type **at least** looks like:

```ts
interface HasLength {
  length: number;
}

// T must be an object type with at least a length property.
function fn<T extends HasLength>(x: T) {
  console.log(x.length);
}
```

It is recommended whenever possible to not use generic constraints because the type returned broadens after a generic constraint, as opposed to normal generics.

### Class factory functions

When you want to create a class factory function, which is a function that takes in a class name and returns an object instance of that class, you need to use a slightly different syntax.

Say you have a standard function that takes in a class reference `c` and returns an instance of it, like this javascript function below:

```javascript
function createInstance(c) {
  return new c();
}
```

To type this accordingly with generics, you have to tell TypeScript that `c` is a **newable** variable, meaning it is a class reference, like so:

```typescript
function createInstance<T>(c: new () => T): T {
  return new c();
}
```

The class reference type annotation syntax is `new () => ClassName`.

```ts
class Animal {
  name: string;
}

class Lion extends Animal {
  roar() {}
}

class Tiger extends Animal {
  jump() {}
  noItNeedsToBeChildFriendly() {}
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

const lion = createInstance(Lion);
const tiger = createInstance(Tiger);
```


### Function overloads

Function overloads are a way of writing multiple method signatures for the same function, allowing you to call the function and get complete type safety in multiple different ways. There are some rules, however.

**Function signatures** are the single line method overload signatures, defining a possibility for the parameters and return type of the function. They have no function body, meaning no implementation.

**Implementation signatures** are the actual function bodies, which are the actual code that runs when the function is called. They must handle all the variations in parameter and return types that the function signatures define.

- The function signature must be compatible with the implementation signature.
- The implementation signature must handle all cases of parameters and return types defined by its function signatures.

```ts
function fn(x: string): string;
function fn(x: number): string;

// must handle the variation of x as string or number
function fn(x: string | number): string {
  if (typeof x === "string") {
    return x;
  } else {
    return x.toString();
  }
}
```

You can also use a combination of types and arrow functions to have a more scalable approach:

```ts
// 1. create a type that has all the function overloads
type FN = {
    (x: string): string;
    (x: number): string;
}


// 2. create a function of that type, and handle all the branching possibilities
const fn : FN = (x : string | number) => {
  if (typeof x === "string") {
    return x;
  } else {
    return x.toString();
  }
}

fn(12)
fn("12")
```

## Recursive types

we can have recursive types by using the type itself when defining the type.

```ts
type JSONObject = {
  [key: string]: JSONValue | number | string;
};
type JSONArray = JSONObject[] | JSONValue[];
type JSONValue = false | true | null | JSONObject | JSONArray | string | number;
```


## Object types

### Index signatures

Index signatures are a way of mimicking a dictionary type, where you can have string keys and specified values behind each. Here is an example:

```ts
[key: string | number] : type
```

Above is the basic syntax, basically describing any arbitrary key that is either a string or a number, and the value behind it is of the specified type.

```ts
interface Dictionary {
  [key: string]: string;
}
```

One thing to note is that any additional properties you add to a type using an index signature must be compatible with the return type of the index signature. For example, if you have a dictionary type that returns a string, you cannot add a property that is a number type.

All other properties in the interface must have a type that is compatible with the index signature type.

```ts
interface Dictionary {
  [key: string]: string;
  // this will throw an error because it is not compatible with the index signature type of string.
  name: number;
}
```

A common pattern to use is to just different property access methods depending on whether you're accessing a named or index signature.

- **dot property access** : use this for properties explicitly defined on the object
- **bracket property access** : use this for indexed-signature properties.

### Interface with generics

You can also use generic type parameters to provide generics to the properties of an interface, like so:

```ts
interface Box<Type> {
  contents: Type;
}

let box: Box<string> = { contents: "hello" };
```

### Tuples and rest args

Tuples are a way of defining an array with a fixed number of elements, and each element can have a different type.

You can pass tuples as a type for the `...args` spread parameter syntax in a function, making it more concise to type annotate parameters.

```ts
function fn(...args: [string, number, boolean]) {
  const [str, num, bool] = args;
  // ...
}
```

### Readonly Tuples

Tuples are just arrays with a predefined size, but if you want to make them immutable, just add the `readonly` modifier in front of the tuple type.

```ts
function fn(...args: readonly [string, number, boolean]) {
  const [str, num, bool] = args;
  // ...
}
```

## Interfaces

### Augmenting interfaces

You can augment interfaces and add properties to them by just redeclaring them, but you can also globally add properties to interfaces across all files in your typescript codebase by declaring a global like so:

```ts
declare global {
  interface Window {
    appApi: //...
  }
}
```

We simply declare in the global namespace and then we augment the interfaces inside of that.

## Typing this

You may often need to provide a type annotatation for `this` when it's type can't be inferred, like in an object's method or in a freestanding DOM event listener.

You always define the type of this

```ts
function myClickHandler(this: HTMLButtonElement, event: Event) {
  // ...
}

const buttonElement = document.querySelector("button");
const onClick = myClickHandler.bind(buttonElement);
```

## Classes

### Definite assignment assertion operator

You may have cases where you initialize a class property somewhere other than the constructor, like in an async method. TypeScript doesn't allow this. Constructors can't be async, but you can tell TypeScript that you will definitely assign the class property a value somewhere in your code by using the `!:` operator, like so:

```ts
class MyClass {
  // say this will definitely be assigned a value
  private myProp!: string;

  constructor() {
    this.init();
  }

  // set private property asynchronously
  async init() {
    this.myProp = await someAsyncOperation();
  }
}
```

### Static block

You can use singleton construction in classes statically, using the `static {}` block that runs once when the class is first initialized, not on individual instances.

```ts
class Statically {
  private static count: number;

  static {
    // only run once in the program's lifetime
    Statically.count = Math.random();
  }
}
```

### Readonly properties

Making a class property `readonly` means that you cannot reassign it a value outside of the constructor. The only chance you get to give it a value is in the constructor.

```ts
class MyClass {
  readonly myProp: string;

  constructor() {
    this.myProp = "hello";
  }

  // this will throw an error
  setMyProp() {
    this.myProp = "goodbye";
  }
}
```

### Constructor overloads

You can have constructor overloads which are similar to function overloads, except for two things: You cannot use generics and you cannot annotate a return type (since you'll always return a class instance).

```ts
class MyClass {
  constructor(x: string);
  constructor(x: number);
  constructor(x: string | number) {
    // ...
  }
}
```

### Classes and generics

A caveat with generics in classes is that any static method or property cannot be typed with a generic, since static stuff is stateless, even with class types.

### Lexical this

When dealing with strange things surrounding `this`, like passing around class functions into objects and the like, just set class methods as **arrow functions**.

Arrow functions will always remember the value of `this` in the context they were created, whether that be an object or a class, so they are safe to pass around.

For class or object methods we expect to pass around and even save as callback variables, we can annotate the type of `this` as the first argument in the method, like so:

```ts
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
const getName = c.getName;

// this will throw an error because getName is not bound to the class instance
getName();
```

- `this` type parameter annotations must always be the first parameter in a function/method.

### this type predicates

You can also use type predicates to narrow down the type of `this` in a class method. This is useful when you have a parent class and multiple subclasses, and you're trying to figure out which subclass instance an object is.

```ts
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
}

class FileRep extends FileSystemObject {
  contents: string;
}

class Directory extends FileSystemObject {
  children: FileSystemObject[];
}

function printFileOrDirectory(obj: FileSystemObject) {
  if (obj.isFile()) {
    console.log(obj.contents);
  } else {
    console.log(obj.children);
  }
}
```


## Conditional types

```typescript
// make sure passed in generic is either number or string
// if number, return number. Else return T, which can only be string
type NumberOrString<T extends number | string> = T extends number ? number : T;

function createLabel<T extends number | string>(label: T): NumberOrString<T> {
  return label;
}
```

### Using `never`

The `never` type is useful in conditional strings because in union types, `never` is imply ignored.

- `never` can never be assigned as a type to a variable.
- So a `string | never` type is just a `string` type.

```typescript
type MustBeString<T> = T extends string ? string : never;

type ApparentlyString = MustBeString<string | number>; // just returns string.
```

WHen passing in a union type as a generic, you can think of it as splitting into two type equations, one for each type in the union type, so two different type conditional statements are being evaluated, and then joining it in a union.

- `MustBeString<string | number>` is evaluated as `MustBeString<string>` | `MustBeString<number>`

### Conditional and `infer`

The `infer` keyword is used in conditional types to dynamically get the type of something as set it as a generic.

```typescript
// if generic type passed in is a function, infer the return type as Return generic and return it
type GetReturnType<T> = T extends (...args: never[]) => infer Return
  ? Return
  : never;

type Num = GetReturnType<() => number>;
```

In the example above, we are basically creating another generic called `Return` that will the return type of the function we pass in. We are saying that whatever thing we pass into the `GetReturnType<>` generic type alias must be a function, and then we infer its return type.

```ts
type RType<T> = T extends (...args: any[]) => infer R ? R : never;

const multiply = (a: number, b: number) => a * b;

type MyType = RType<typeof multiply>; // number
```

#### Infer with constraints

You can also add type constraints to your `infer` conditionals, like `infer T extends string`

#### Infer with template strings

You can even infer strings from template string literal types.

```ts
type EmailSurname<T> = T extends `${infer S extends string}@${string}`
  ? S
  : never;

type Test = EmailSurname<"waadlingaadil@gmail.com">;
```

### Type Distributivity

When using conditional generic types with union types, they have a **distributive effect**, where all the types in the union type are evaluated separately in the conditional types, and then joined back together in a union.

1. evaluate `MustBeString<string | number>`
2. Split into `MustBeString<string>` | `MustBeString<number>` = `string | never` = `string`

If you want to avoid this distributive effect and keep the union type as one single generic type, all you have to do is wrap the generic type parameter in brackets `[]`

```typescript
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

type ArrOfStrOrNum = ToArrayNonDist<string | number>; // returns (string | number)[]
```

## Utility types

### Extract and Exclude

Once you understand how `extends` works, you can use the `Extract<>` and `Exclude<>` generic types to query parts of a type of you want.

This is useful when working with union types, and you want to extract out specific parts

```ts
type FavoriteColors =
  | "dark sienna"
  | "van dyke brown"
  | "yellow ochre"
  | "sap green"
  | "titanium white"
  | "phthalo green"
  | "prussian blue"
  | "cadium yellow"
  | [number, number, number]
  | { red: number; green: number; blue: number }
  | never;

// from the union type, return only the types that extends string
type StringColors = Extract<FavoriteColors, string>;

// from the union type, return only the types that do not extend string
type NonStringColors = Exclude<FavoriteColors, string>;
```

- `Extract<T, U>` : returns all subtypes from `T` that extends `U`, meaning whatever subtypes in `T` that could be assignable to type `U` , those are what are going to get extracted.
- `Exclude<T, U>` : the exact opposite of extract. All subtypes in `T` that are **not** assignable to `U` are what get extracted and returned.

### `ReturnType<>`

There is a builtin `ReturnType<>` generic that allows you to get and inger the return type of a function on the fly. This is useful if you don't want to manually type out the return type of a function and create a type Alias for that.

The basic syntax is as follows, where you pass in the type of function as the generic parameter:

```typescript
ReturnType<typeof func>;
```

```typescript
function fn() {
  return {
    name: "Why don't I have any love?",
    age: 30,
  };
}

type FnReturnType = ReturnType<typeof fn>; // { name: string, age: number }
```

Under the hood, all this generic type is doing is something like this:

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
// 1. make sure the generic type extends a function, which is typed by the `(...args: any[])` part
// 2. Make the return type a 2nd generic and infer it, which is typed by the `=> infer R` part
// 3. If the generic type does not extend a function, return `any`
// 4. If the generic type does extend a function, return the inferred return type, which is R
```

### `Parameters<T>`

The `Parameters<T>` utility type is used to fetch the types of parameters for a function. The type param should be a function.

The implementation is as follows:

```ts
/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters/**
 * The typeParam passed in, must be some subtype of a call signature,
 * which can take any number of arguments of any types, and can
 * have any return type
 */
<T extends (...args: any) => any> =
  /**
   * As long as `T` matches a call signature, capture all of the args
   * (as a ...rest) parameter in a new tuple typeParam `P`
   */
  T extends (...args: infer P) => any
    ? P // and then return the tuple
    : never; // or return never, if the condition is not matched
```

### `ConstructorParameters<T>`

The `ConstructorParameters<T>` utility type is used to fetch the types of parameters for a constructor. The type param should be a construct signature.

The implementation is as follows:

```ts
/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters/**
 * The typeParam passed in, must be some subtype of a construct
 * signature.
 *
 * The `abstract` keyword lets this also work with abstract classes,
 * which can potentially have an `abstract` constructor
 */
<T extends abstract new (...args: any) => any> =
  /**
   * As long as `T` matches a construct signature, capture all of the
   * args (as a ...rest) parameter in a new tuple typeParam `P`
   */
  T extends abstract new (...args: infer P) => any
    ? P // and then return the tuple
    : never; // or return never, if the condition is not matched
```

### `InstanceType<T>`

The `InstanceType<T>` utility type is used to fetch the type of an instance of a class. The type param should be a class.

The implementation is as follows:

```ts
/**
 * Obtain the return type of a constructor function type
 */
type InstanceType/**
 * The typeParam passed in must be some subtype of a construct signature
 */
<T extends abstract new (...args: any) => any> =
  /**
   * As long as `T` matches the construct signature, capture the return
   * type in a new typeParam `R`
   */
  T extends abstract new (...args: any) => infer R
    ? R // and then return it
    : any; // otherwise return any
```

### `ThisParameterType<T>`

The `ThisParameterType<T>` utility type is used to fetch the type of `this` in a function. The type param should be a function.

The implementation is as follows:

```ts
/**
 * Extracts the type of the 'this' parameter of a function type, or 'unknown'
 * if the function type has no 'this' parameter.
 */
type ThisParameterType<T> = T extends (this: infer U, ...args: never) => any
  ? U
  : unknown;
```

### `NonNullable<T>`

The `NonNullable<T>` type basically returns the same type but excluding null and undefined. 

```ts
type A = {a?: number | null}
type B = NonNullable<A['a']>  // number
```

## Other type things

### Companion Objects

Companion objects are a pattern in typescript you can use that take advantage of declaration merging, where you name any object and then create a type alias that annotates that object, but has the same name. 

This has the same effect as declaration merging, and allows for more concise code and only having to refer to one name for both a type and value. 

```ts
type Currency = {
  unit: 'EUR' | 'GBP' | 'JPY' | 'USD'
  value: number
}

let Currency = {
  DEFAULT: 'USD',
  from(value: number, unit = Currency.DEFAULT): Currency {
    return {unit, value}
  }
}
```

You can then use it like so: 

```ts
import {Currency} from './Currency'

let amountDue: Currency = { 
  unit: 'JPY',
  value: 83733.10
}

let otherAmountDue = Currency.from(330, 'EUR')
```

### `typeof`

The `typeof` type operator infers the type of a variable. What's important to note is that this only works on a variable reference, not any variable value like when executing a function.


> [!WARNING]
> Specifically, it’s only legal to use typeof on identifiers (i.e. variable names) or their properties. This helps avoid the confusing trap of writing code you think is executing, but isn’t.


### Satisfies

The `satisfies` keyword allows you to adhere to some type annotation but while giving more flexibility in how your type is defined.

```ts
interface Color {
  color?: string;
  name?: string;
}

const bruh = { color: "green" } satisfies Color;
bruh.color.repeat(3);
```

In the example above, `bruh.color` would be of type `string | undefined` if we simply type annotated it. By using `satisfies`, we turn it into a const declaration while satisfying the type simultaneously, allowing us to access the color type if we explicitly define it on the object.

### Template literal types

You can use template literal types like so:

```ts
type Size = "small" | "medium" | "large";
type Color = "primary" | "secondary";

type Style = `${Size}-${Color}`;
```

#### String manipulation utitilies

- `Uppercase<T>` : takes in a string literal type and returns that literal type as all uppercase
- `Lowercase<T>` : takes in a string literal type and returns that literal type as all lowercase
- `Capitalize<T>` : takes in a string literal type and returns that literal type with the first letter capitalized

Here is a library I made that uses these types to autogenerate types for functions that I created on the fly.

```ts
interface PrintAdvancedColors {
  colors: {
    RED: string;
    GREEN: string;
    YELLOW: string;
    BLUE: string;
    MAGENTA: string;
    CYAN: string;
  };
  // object of functions that are lowercase of the colors
  print: {
    [k in Lowercase<keyof PrintAdvancedColors["colors"]>]: (
      ...args: any[]
    ) => void;
  };
}

export class PrintAdvanced implements PrintAdvancedColors {
  public readonly colors = {
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
  };
  private BOLD = "";
  private ITALIC = "";
  private RESET = "\x1b[0m";
  public readonly print = {} as PrintAdvancedColors["print"];
  constructor({
    shouldBold = false,
    shouldItalic = false,
  }: {
    shouldBold?: boolean;
    shouldItalic?: boolean;
  } = {}) {
    if (shouldBold) {
      this.BOLD = "\x1b[1m";
    }
    if (shouldItalic) {
      this.ITALIC = "\x1b[3m";
    }

    for (let color in this.colors) {
      // autogenerate functions on the fly
      this.print[color.toLowerCase() as keyof PrintAdvancedColors["print"]] = (
        ...args: any[]
      ) => {
        console.log(
          `${this.BOLD}${this.ITALIC}${
            this.colors[color as keyof PrintAdvanced["colors"]]
          }${args.join(" ")}${this.RESET}`
        );
      };
    }
  }
}
```

### Autocompletion with union types and strings

If you are ever in the situation where you want autocomplete for string literal types defined by a union string type, but you also want any string to be a valid value, you need to use some TypeScript type gymnastics to get appropriate autocomplete.

:::warning
A union type like `"dog" | "cat" | string` will just be broadened into a `string` type, so that's why this approach is not sufficient.
:::

Instead of having a union type with `string`, have a union type with `(string & {})`.

```ts
type Padding = "small" | "medium" | "large" | (string & {});

// gets autocomplete
let padding: Padding = "small";

// no autocomplete, but still valid
let padding: Padding = "12px";
```

### Mapped Types

Mapped types are like index signatures but on a smaller scale, allowing you to iterate through the keys of a type and assign a corresponding type value to each key.

```typescript
type MyMappedType = {
  [key in keyof MyType]: MyType[key];
};
```

- The `keyof` operator returns a union string type of the keys of another type, like an interface
- You can map over union string types, or implicitly map over a union string type by using the `keyof` operator.

You can also use attribute modifiers to make these mapped types `readonly`, required, or `optional`.

```typescript
type ReadonlyType = {
  readonly [key in keyof MyType]: MyType[key];
};

type RequiredType = {
  [key in keyof MyType]-?: MyType[key];
};

type OptionalType = {
  [key in keyof MyType]?: MyType[key];
};
```

You can also negate these operators by prepending the `-` operator to those operators, like `-?` to make it non-optional and `-readonly` to make it non-readonly.

- Adding a `?` after the mapped type makes all those keys optional.
- Adding a `-?` after the mapped type negates the optional operator and instead makes all properties required, even ones which were initially optional.

```typescript
const setOptions = {
  darkMode: () => {},
  fontSize: () => {},
};

type MakeOptions<T> = {
  [key in keyof T]: boolean;
};

type Options = MakeOptions<typeof setOptions>;
```

You also have a bunch of mapped types that are built into typescript.


#### `Pick<T>`

The `Pick` utility type allows you to extract only the properties you want from an object.

```ts
interface Person {
  name: string;
  age: number;
  location?: string;
}

const bob: Pick<Person, "name"> = {
  name: "Bob",
};
```

#### `ReadOnly<>`

The `ReadOnly<T>` mapped type returns a type where all the keys of the passed in generic type are readonly.

Here we make the type from scratch:

```ts
type ReadOnly<T> = {
  readonly [key in keyof T]: T[key];
};

const obj = {
  name: "john",
};

type ReadOnlyIdentifier = ReadOnly<typeof obj>;
```

#### `Partial<>`

The `Partial<T>` mapped type returns a type where all the keys of the passed in generic type are optional.

Here we make the type from scratch:

```ts
type Partial_<T> = {
  [key in keyof T]?: T[key];
};

const obj = {
  name: "john",
};

type PartialIdentifier = Partial_<typeof obj>;
```

#### `Required<>`

The `Required<T>` mapped type returns a type where all the keys of the passed in generic type are required.

#### `Record<K, V>`

A `Record<K, V>` mapped type returns a type where all the keys of the passed in generic type are mapped to the value type, like a dictionary.

```typescript
type Dictionary = Record<string, any>;
type NumberMap = Record<string, number>;
```

#### Key remapping via `as`

```typescript
type MappedTypeWithNewProperties<Type> = {
  [Properties in keyof Type as NewKeyType]: Type[Properties];
};
```

Using the above syntax, we can retype (or most likely rename) keys to a new type using the `as` operator.

This is extremely useful for creating getters and setters on the fly.

```ts
type Store = {
  name: string;
  age: number;
};

type Setters<T> = {
  [key in keyof T as `set${Capitalize<keyof T & string>}`]: (
    value: T[key]
  ) => void;
};

type Getters<T> = {
  [key in keyof T as `get${Capitalize<keyof T & string>}`]: () => T[key];
};

type StoreGetters = Getters<Store>;
type StoreSetters = Setters<Store>;
```

#### Filtering keys

You can carry this further to filtering keys before doing something with them by combining mapped types with conditionals.

Whenever you are trying to filter types based on filtered keys, follow these rules: 

1. **ALWAYS** filter by keys first. Get a subset of the keys you want, and then do the mapped type

```ts
type KeysThatStartWithS<T> = {
  [key in keyof T as key extends `s${string}` ? key : never]: T[key];
};

const store = {
  saliva: true,
  dog: false,
  cat: true,
};

type OnlySaliva = KeysThatStartWithS<typeof store>;
```

Here are custom types that return new objects based on which keys you want to include or exclude: 

```ts
// T: an object you pass in
// V: the keys you want to extract from the object
type WithKeys<T, V extends keyof T> = {
  [K in V]: T[K];
}

type WithoutKeys<T, V extends keyof T> = {
  [K in Exclude<keyof T, V>]: T[K];
};

const thing: WithKeys<{a: number, b: number}, "a"> = {
  a: 1,
}
```

And here is how you can get only required properties out from an object: 

```ts
interface Obj  {
    name: string;
    age?: number;
}

type OmitOptional<T> = { 
  [P in keyof Required<T> as Pick<T, P> extends Required<Pick<T, P>> ? P : never]: T[P] 
}

type OmitRequired<T> = {
    [KEY in Exclude<keyof T, keyof OmitOptional<T>>]: T[KEY]
}

type bruh = OmitRequired<Obj>
```

- `OmitOptional<T>` : returns back only the required properties from an object
- `OmitRequired<T>` : returns back only the optional properties from an object
### Awaited

A quick thing to note is that using the `awaits` keyword to await a promise will actually wait for all the nested promises to unwrap and resolve before returning. So no matter how many levels deep, `await` avoids callback hell.

- If there is a promise that returns another promise, and that promise returns a string, `await` simply waits for all those nested promises to resolve, and then returns the string.

The `Awaited<T>` type takes in a promise type and returns the unwrapped final resolved type value of that nested promise chain.
