
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