# Typescript Tricks

## Private Property Async Initialization

For the use cases where you run some async operation inside your class constructor and a private property in your class gets defined asynchronously, TypeScript throws an error, saying all class properties must be synchronously defined inside the constructor.

To override this behavior and tell TypeScript that you know you will assign that private property a value, you can use the `!:` definite assignment assertion operator.

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

## Extract type of array entry

The `(typeof arrayName)[number]` helps get the typeof an array entry.

```typescript
const statuses = ["active", "inactive"] as const;
type Status = (typeof statuses)[number]; // "active" | "inactive"
```

## Advanced Assertions

### Double assertion

You can cast a variable to any type you want by using a **double assertion**, where you first cast the variable type as `unknown`, which then allows you to cast to whatever type you desire:

```ts
const myVar = "hello" as unknown as number;
```

### Const assertion

You can tell TypeScript that a variable is a constant by using the `as const` assertion. This makes all properties of the variable and the variable itself immutable by adding a `readonly` modifier to all properties and the variable itself.

:::tip
Whenever you use a const assertion, you are telling typescript to infer the type as literally and as narrowly as possible.
:::

```ts
const routes = {
  home: "/",
  about: "/about",
} as const;

typeof Route = (typeof routes)[keyof typeof routes]; // "/about" | "/"

```

const assertions are also useful when you need to type cast a string down to a string literal type:

```ts
const myVar = "hello" as const;

// myVar is now of type "hello" instead of string
```

You can use the `as const` assertion with arrays and generics as well:

```ts
// tell typescript to type the array literally
function useStatuses<const T extends string>(statuses: T[]): T[] {
  return statuses;
}

const statuses = useStatuses(["active", "inactive"]);
```
