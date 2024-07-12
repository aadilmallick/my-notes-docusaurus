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
