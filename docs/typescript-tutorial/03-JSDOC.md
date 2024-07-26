# JSDOC

## functions

```ts
/**
 * Adds two numbers together.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of the two numbers.
 */
function add(a, b) {
  return a + b;
}
```

### Optional parameters

Typing an `=` sign after the parameter name makes the parameter optional. You can also provide a default value for the parameter.

```ts
/**
 * Greets a user with an optional greeting.
 * @param {string} name - The name of the user.
 * @param {string} [greeting='Hello'] - Optional greeting message.
 * @returns {string} A greeting message.
 */
function greet(name, greeting = "Hello") {
  return `${greeting}, ${name}!`;
}
```

### Rest parameters

```ts
/**
 * Sums any number of arguments.
 * @param {...number} numbers - The numbers to sum.
 * @returns {number} The total sum.
 */
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
```

### examples

You can provide examples of how to use a function using the `@example` annotation:

```ts
/**
 * Subtracts one number from another.
 * @param {number} a - The number to subtract from.
 * @param {number} b - The number to subtract.
 * @returns {number} The difference of the two numbers.
 * @example
 * // returns 3
 * subtract(5, 2);
 */
function subtract(a, b) {
  return a - b;
}
```

### Deprecation

Use the `@deprecated` tag to mark a function as deprecated.

```ts
/**
 * Calculates the sum of two numbers.
 * @deprecated Use the `add` function instead.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of the two numbers.
 */
function sum(a, b) {
  return a + b;
}
```

## classes

```ts
/**
 * Represents a book.
 * @class
 */
class Book {
  /**
   * Create a book.
   * @constructor
   * @param {string} title - The title of the book.
   * @param {string} author - The author of the book.
   */
  constructor(title, author) {
    this.title = title;
    this.author = author;
  }

  /**
   * Get the title of the book.
   * @returns {string} The title of the book.
   */
  getTitle() {
    return this.title;
  }

  /**
   * Set a new title for the book.
   * @param {string} title - The new title of the book.
   */
  setTitle(title) {
    this.title = title;
  }
}
```

### Extends

You can annotate which class a class extends from using the `@extends` annotation

```ts
/**
 * Represents a person.
 * @class
 */
class Person {
  /**
   * Create a person.
   * @param {string} name - The name of the person.
   */
  constructor(name) {
    this.name = name;
  }
}

/**
 * Represents an employee.
 * @class
 * @extends Person
 */
class Employee extends Person {
  /**
   * Create an employee.
   * @param {string} name - The name of the employee.
   * @param {string} jobTitle - The job title of the employee.
   */
  constructor(name, jobTitle) {
    super(name);
    this.jobTitle = jobTitle;
  }
}
```

## variables

This is how you annotate the type of a variable

```ts
/**
 * @type {string}
 */
let name = "John Doe";
```

### Objects

Here is how we can type objects:

```ts
const obj = {
  /**
   * @type {string | null}
   */
  name: null,
  age: 69,
  bruh: true,
  doSOmethinG() {
    console.log(this.name);
  },
};

obj.doSOmethinG();
```

## Custom type defitions

```ts
/**
 * A point in 2D space.
 * @typedef {Object} Point
 * @property {number} x - The x coordinate.
 * @property {number} y - The y coordinate.
 */

/**
 * @type {Point}
 */
const point = { x: 10, y: 20 };
```

## Typing with this

We can combine custom typedefs with teh `@this` annotation to give the type of `this` in any method or function.

```js
// 1. create typedef
/**
 * @typedef {Object} NewViewInput
 * @property {string} name
 * @property {errorMsg} name
 * @property {string[]} names
 * @property {string[]} views
 * @property {(string) => void} validateText
 */

export default PxComponent.extend(ModalMixin, {
  /**
   * @this NewViewInput
   * @param {string} text
   */
  validateText(text) {
    const { names } = this;
    const alphanumericRegex = /^([a-z]|[A-Z]|\d)+$/;

    if (names?.includes(text)) {
      this.set("errorMsg", "Name is currently in use, please choose another.");
      this.setButtonClickability("confirm", false);
    } else if (!alphanumericRegex.test(text)) {
      this.set("errorMsg", "Only letters and numbers can be used");
      this.setButtonClickability("confirm", false);
    } else if (isBlank(text)) {
      this.setButtonClickability("confirm", false);
    } else {
      this.setButtonClickability("confirm", true);
    }
  },
});
```

## Super cool vscode tricks

### Region

You can have a super cool header in your minimap with a simple js comment like `// region <REGION_NAME>`, like so:

```js
// region REGION_NAME
```

This is great for organization.
