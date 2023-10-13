# Classes

## method chaining

You can chain methods together on your class by returning `this` inside every method.

```ts
class DateClass {
  public chain1() {
    console.log("chain1");
    return this;
  }

  public chain2() {
    console.log("chain2");
    return this;
  }

  public chain3() {
    console.log("chain3");
    return this;
  }
}

const date = new DateClass();
date.chain1().chain2().chain3();
```
