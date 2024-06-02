# 02: Bun API 

## Environment variables 

All environment variables from any `.env` files are automatically loaded into `process.env`, so just use `process.env` to access any environment variables. 

You can also set environment variables in scripts, like so by setting it in front of the command you're trying to run.

```json title="package.json"
{
  "scripts": {
    "dev": "NODE_ENV=development bun run --watch index.ts"
  }
}
```

## Bun utilities

- `Bun.sleep(ms)`: async method that sleeps for specified number of milliseconds
- `Bun.sleepSync(ms)`: sync method that sleeps for specified number of milliseconds

### Base 64 encoding and decoding

The `btoa(string)` converts a string to a base64 representation and `atob(base64string)` converts a base64 string back to its original contents. These are web standard methods. 

```ts
const data = "hello world";
const encoded = btoa(data); // => "aGVsbG8gd29ybGQ="
const decoded = atob(encoded); // => "hello world"
```

### Compressing data with gzip

```ts
const data = Buffer.from("Hello, world!");
const compressed = Bun.gzipSync(data);
// => Uint8Array

const decompressed = Bun.gunzipSync(compressed);
// => Uint8Array
```
## Node Shell

This is how to run shell commands in node/bun:

```ts
import { spawnSync } from "child_process";

class LinuxError extends Error {
  constructor(command: string) {
    super(`Running the '${command}' command caused this error`);
  }
}

function linux(command: string, args: string[] = []) {
  try {
    const { status, stdout, stderr } = spawnSync(command, args, {
      encoding: "utf8",
    });
    return stdout;
  } catch (e) {
    console.error(e);
    throw new LinuxError(command);
  }
}
```

## Bun Shell

Starting from bun v1.0.24 and on, you can use the bun shell. The great thing about this is that you can treat variables of type `Response`, `ArrayBuffer`, and `Blob` just as you would strings. 

```ts
import { $ } from "bun";

const response = await fetch("https://example.com");

// Use Response as stdin.
await $`cat < ${response} | wc -c`; // 1256
```

Here are some basic methods you can tack on to the end of the tempalte literal method: 

```ts
const { stdout, stderr } = await $`echo "Hello World!"`.quiet(); // No output
const welcome = await $`echo "Hello World!"`.text(); // returns as text
```

- `quiet()`: instead of printing standard out, returns an object with the `stdout`, `stderr`, and `exitCode` as properties. 
- `nothrow()`: doesn't throw on an error. 
- `text()`: returns the standard out of the command as text. 
- `json()`: reads the output of a command as JSON
- `blob()`: reads the output of a command as a blob

```ts
const { stdout, stderr, exitCode } = await $`something-that-may-fail`
  .nothrow()
  .quiet();
```

### Piping and Redirecting with JavaScript Objects

- You can redirect content to a buffer, blob, or file. 
- You can use these files as standard input: buffer, blob, file, `Response`

```ts
import { $ } from "bun";

// redirect output into a buffer
const buffer = Buffer.alloc(100);
await $`echo "Hello World!" > ${buffer}`;

console.log(buffer.toString()); // Hello World!\n
```

```ts
import { $ } from "bun";

const response = new Response("hello i am a response body");

const result = await $`cat < ${response}`.text();

console.log(result); // hello i am a response body
```

### Setting environment variables

You can use the bun shell to set all environment variables, useing the `$.env(obj)` command. Just make sure not to override everything. 

```ts
import { $ } from "bun";

$.env({ ...process.env, FOO: "bar" });
```

### Changing directories

You can change the working directory of a command by passing a string to `.cwd()`:

```ts
import { $ } from "bun";

// temporarily change working directory to /tmp
await $`pwd`.cwd("/tmp"); // /tmp
```

### Iterating through standard output

```ts
import { $ } from "bun";

for await (let line of $`echo "Hello World!"`.lines()) {
  console.log(line); // Hello World!
}
```

### Brace expansion

```ts
import { $ } from "bun";

await $.braces(`echo {1,2,3}`);
// => ["echo 1", "echo 2", "echo 3"]
```


## Files

### Writing files

Use the async `Bun.write(filepath, data)` method to write data to a file

```javascript
await Bun.write("output.txt", "this is output file")
```

The `data` can be a string, `Blob`, `BunFile`, `ArrayBuffer`, or a `Response`.
### File API

You can get a file representation in bun by using the async `Bun.file(filepath)` method, which returns a file. 

```javascript
const file = await Bun.file("output.txt")
```

- `file.exists()` : async method that returns whether the file exists
- `file.size`: returns the file size in number of bytes
- `file.type`: returns the MIME type of the file.

This is how you change the type of a file you create. 

```ts
const notreal = Bun.file("notreal.json", { type: "application/json" });
```

Here is how you write a file to Standard output: 

```ts
const input = Bun.file("input.txt");
await Bun.write(Bun.stdout, input);
```

### Reading Files

One a bun file object, you have these async methods to read data in from different specified encodings: 
- `file.text()` : returns the utf8 text file content
- `file.stream()` : returns the file content as a readable stream
- `file.arrayBuffer()` : returns the file content as an array buffer
- `file.blob()`: returns the file content as a Blob instance


## import.meta

There is a lot of useful information stored on `import.meta`, which is a way for a module to access information about itself.

```ts
import.meta.dir;   // => "/path/to/project"
import.meta.file;  // => "file.ts"
import.meta.path;  // => "/path/to/project/file.ts"
import.meta.url;   // => "file:///path/to/project/file.ts"

import.meta.main;  // `true` if this file is directly executed by `bun run`
```

## SQLite

```ts
import { Database } from "bun:sqlite";

const db = new Database();
const query = db.query("select 'Hello world' as message;");
query.get(); // => { message: "Hello world" }
```

1. Create a new database by instantiating the `Database` class. You can create either an in-memory database or a persisting database. 

```ts
const db = new Database(); // in-memory
const db = new Database("mydb.sqlite", {create: true}); // file
```

2. Create a query with the `db.query(querystring)` method, which return a **query** object. You can then execute the query with `query.get()`

```ts
const query = db.query("select 'Hello world' as message;");
query.get();
```

### Queries

You can pass parameters to queries. and then execute them with methods. We define parameters with a `$` prefixed on the variable name.

```ts
// $param1 and $param2 are now variables we use later
const query = db.query(`SELECT $param1, $param2;`);

// pass values for $param1 and $param2
const data = query.get({
	$param1: "column1",
	$param2: "column2"
})
```

- `query.get()`: returns the first result as an object
- `query.all()`: returns all results as an array of objects
- `query.run()` : runs the query, returns nothing. 
- `query.toString()`: expands the query as a string, plugging in parameters. Useful for debugging. 
## Testing

### Basic testing

This is how you create basic tests in bun.

- Tests should end in the file extension `.test.ts`
- Run tests with `bun test`

```ts
import { expect, test } from "bun:test";

test("2 + 2", () => {
  expect(2 + 2).toBe(4);
});
```

You create a test with `test(name, func)`, and you create a test suite with `describe(name, func)`.

```ts
import { expect, test, describe } from "bun:test";

describe("arithmetic", () => {
  test("2 + 2", () => {
    expect(2 + 2).toBe(4);
  });

  test("2 * 2", () => {
    expect(2 * 2).toBe(4);
  });
});
```

You can even specify a timeout in milliseconds for how long the test should take, else it will fail if it goes over the timeout. 

```ts
test(name, cb, timeoutMillis)
test("my test", () => {}, 500)
```
### Testing with flags

Sometimes you want to run only some tests and not others. You can use these test methods to do that, and then run only those matching tests with CLI options on the `bun test` command. 

- `test.skip(name, cb)`: skips the test
- `test.todo(name, cb)`: marks the test as a TODO test, meaning the test runner expects them to fail since they're supposed to be prematurely done. To exclusively run TODO tests, run `bun test --todo`
- `test.only(name, cb)`: marks tests, and `bun test --only` runs only those tests. 

**conditional testing**

Conditional testing allows you to run or skip tests based on some condition

- `test.if(condition)(name, cb)`: runs the test if the condition is true
- `test.skipif(condition)(name, cb)`: skips the test if the condition is true
- `test.todoif(condition)(name, cb)`: marks the test as a todo test if the condition is true

```ts
test.if(Math.random() > 0.5)("runs half the time", () => {
  // ...
});

const macOS = process.arch === "darwin";
test.if(macOS)("runs on macOS", () => {
  // runs if macOS
});
```
