## Zod

Zod is a schema-based way of doing type-inference and checking at runtime while also getting TS compiler hints that make for a good dev experience. 

### Basics

previously to check if something was a user, you would have to run typescript type guards like this:

```ts
// Runtime type checking can impact performance
function validateUser(data: unknown): User {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('username' in data) ||
    !('email' in data) ||
    typeof data.username !== 'string' ||
    typeof data.email !== 'string'
  ) {
    throw new ValidationError('Invalid user data');
  }

  return data as User;
}
```

But with Zod, you reduce that unwieldiness to a more flexible form:

```ts
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// simple type guard
function isUser(user: unknown): user is z.infer<typeof userSchema> {
  return userSchema.safeParse(user).success;
}

// parse that throws error
function validateUser(user: unknown) {
  return userSchema.parse(user);
}

// succeeds
const user = validateUser({ name: "John", age: 30 });
console.log(user);

// fails
const user2 = validateUser({ name: "John", age: "30" });
console.log(user2);
```

The basic flow of using zod is to first create a **schema**, and then use that schema to validate objects of an unknown type. You have two paths to do so:

- **parsing**: throws an error if the value does not fit the schema
- **safe parsing**: does not throw an error, only returns a boolean telling whether or not the value fits the schema.

But after validation, you will get back the object with typescript type inference both at runtime and compile time, offering great dx.

- `z.infer<typeof someSchema>`: a custom generic typing that zod provides to extract the base type that a schema describes.
- `schema.parse(value)`: parses the value and returns it if it passes, throws an error if it does not fit the schema.
- `schema.safeParse(value)`: returns a `success` property you can access that tells you whether or not the obejct you passed in fit the schema.

We can generalize this pattern for any schema using generics

```ts
function isOfType<T>(value: unknown, schema: z.ZodType<T>): value is T {
  return schema.safeParse(value).success;
}

const user3 = { name: "John", age: 30 };
const user4 = { name: "John", age: "30" };

console.log(isOfType(user3, userSchema));
console.log(isOfType(user4, userSchema));

function validateSchema<T>(value: unknown, schema: z.ZodType<T>) {
  return schema.parse(value);
}

const user5 = { name: "John", age: 30 };
const user6 = { name: "John", age: "30" };

console.log(validateSchema(user5, userSchema));
console.log(validateSchema(user6, userSchema));
```

You can use the below class for general validation:

```ts
export class Validation<T> {
  constructor(public schema: z.ZodType<T>) {}

  isOfType(value: unknown): value is T {
    return this.schema.safeParse(value).success;
  }

  validateSchema(value: unknown) {
    return this.schema.parse(value);
  }
}
```

Then I use it in an example:

```ts

const dogSchema = z.object({
  name: z.string(),
  breed: z.enum(["labador", "weenie"]),
});

const dogValidator = new Validation(dogSchema);
console.log(
  dogValidator.isOfType({
    name: "brah",
    breed: "labador",
  })
);
```

### zod types

**Zod types** include objects, arrays, and primitives. For all purposes, zod types mean using any `z.object()`, `z.array()`, or any other zod primitive type.

**primitive zod types**
****
It's important to understand a few primitive zod types:

- `z.number()`: a number type
- `z.string()`: a string type
- `z.date()`: a `Date` type
- `z.boolean()`: a boolean type
- `z.undefined()`: a undefined type
- `z.null()`: a null type

**object zod types**
****

You can build any schema based off the `z.object()` type which represents a javascript object where the keys should have values that are primitive zod types. 

```ts
const userSchema = z.object({
  name: z.string(),
  email: z.string(),
  age: z.number()
});
```

**array zod types**
****

You can create array types in zod with the `z.array()` method and then passing in  any zod type. You can basically pass in anything:

```ts
const strArray = z.array(z.string())
const dogArray = z.array(z.object({
    name: z.string(),
    breed: z.string(),
    age: z.number().gt(0).lt(30)
}))
```
### Modifiers

You can use **modifiers** which chain on primitive types to give more type checking at runtime, such as email check, strong password check, number value checking, etc., which is all invaluable stuff to have at runtime.

The most basic modifier is `z.optional()`, but there are others

```ts
// create user schema with optional age, and email 6-40 chars long
const userSchema = z.object({
  name: z.string(),
  email: z.string().min(6).max(40),
  age: z.number().optional()
});
```

**universal modifiers**
****
these modifiers are universal and can be used on any primitive type:

- `z.optional()`: makes the value optional
- `z.nullable()`: makes the value able to be equal to `null`
- `z.nullish()`: makes the value able to be equal to `null` or `undefined`
- `z.default(value)`: provides a default value if a value is not provided. This only makes sense when combined with `z.optional()`
- `z.literal(value)`: forces the value to be typed literally, as if using `as const`

**string modifiers**
****

**number modifiers**
****

#### Object modifiers

**basic modifiers**
****
There are some modifiers that apply to `z.object()` types:

- `z.partial()`: makes all properties in the object optional (useful for updating)
- `z.pick(object)`: returns only the specified keys, where you specify which ones you want is a `Record<keyof schema, true>` key value pair
- `z.omit(object)`: omits only the specified keys, where you specify which ones you want is a `Record<keyof schema, true>` key value pair

Here is how these work:

![](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748038218/image-clipboard-assets/okwhvkfbh6ddeq5lvedv.webp)

**extending schema**

With the `z.merge()` and `z.extend()` modifiers, both which act on object schemas and take in additional object schemas as arguments, you can create new schemas from other object schemas. 

> [!NOTE]
> Extending and merging do the same thing. The only difference is that they take in different arguments:
> 
> `merge()` takes in a zod object schema while `extend()` takes in a javascript object.


Extending works by taking in a simple object of properties to add onto the schema, not a separate schema.

```ts
const dogSchema = z.object({
  name: z.string(),
});

const tinyDogSchema = dogSchema.extend({
  tiny: z.literal(true),
});

const { name, tiny } = tinyDogSchema.parse({});
```

Merging works by taking in a zod object schema to merge into, making an entirely new schema:

```ts
const catSchema = z.object({
  name: z.string(),
  meows: z.literal(true),
});

const dogOrCatSchema = dogSchema.merge(catSchema);
const {meows, name} = dogOrCatSchema.parse({});
```
### Enums, unions, tuples

you can create an enum like so to create union literal typing like so:

```ts
const dogSchema = z.object({
  breed: z.enum(["labador", "weenie"] as const),
});
```

You can create a tuple with `z.tuple()` and then pass in an array of zod types:

```ts
const coords = z.tuple([z.number(), z.number(), z.number()]) // x,y,x
```

You can create a union type with `z.union()` type which takes in an array of zod types:

```ts
const stringOrNumber = z.union([z.string(), z.number()])
```

### records, maps

Records in zod have a string up on their TS counterparts because of the power of runtime validation and stringent requirements. You can use the `z.record()` method and then pass in any single zod type.

Check, for example, this record that maps user ids to their emails:

```ts
const userToEmailMap = z.record(
  z.string().min(6).max(40).endsWith("@gmail.com")
);

/*
const userToEmails = {
	"kjflasdkjfka-asfnjaskd": "waadlingaadil@gmail.com",
	// ...
}
*/

```

For a more performant solution concerning dealing with objects with an immense number of keys, you can use maps with `z.map()`:

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

const userSchema2 = z.object({
  name: z.string(),
  email: z.string(),
});
// create map of type Map<string, {name: string, email: string}>
const userIdToInfoMap = z.map(z.string().uuid(), userSchema2);

const map = new Map([
    ["thing", {
        email: "thing@gmail.com", 
        name: "thing2"
    }]
]) as z.infer<typeof userIdToInfoMap>
```


### Zod validation class

Here is a wrapper I wrote around some common zod functionality:

```ts
export class Validation<T extends Record<string, any>> {
  constructor(public schema: z.ZodObject<T>) {}

  createObjectWithAutocomplete(obj: T) {
    return obj;
  }

  isOfType(value: unknown): value is T {
    return this.schema.safeParse(value).success;
  }

  validateSchema(value: unknown) {
    return this.schema.parse(value);
  }

  pick(value: unknown, keys: (keyof T)[]) {
    const obj: Partial<Record<keyof T, true>> = {};
    for (let key of keys) {
      obj[key] = true;
    }
    return this.schema
      .pick(obj as unknown as Parameters<z.ZodObject<T>["pick"]>[0])
      .parse(value);
  }

  omit(value: unknown, keys: (keyof T)[]) {
    const obj: Partial<Record<keyof T, true>> = {};
    for (let key of keys) {
      obj[key] = true;
    }
    return this.schema
      .omit(obj as unknown as Parameters<z.ZodObject<T>["omit"]>[0])
      .parse(value);
  }
}
```
### Custom validation

You can add custom validation functions with the universal `z.refine()` modifier, which takes in a callback with the value as a parameter and must return a boolean: `true` if passing, `false` if failing.

```ts
const userSchema2 = z.object({
  name: z.string(),
  email: z.string().refine(value => {
    return value.endsWith("braah@gmail.cp,")
  }),
});
```

#### Adding custom messages

You can add custom messages for when validation fails at certain stages, which is possible at each modifier as an optional argument.