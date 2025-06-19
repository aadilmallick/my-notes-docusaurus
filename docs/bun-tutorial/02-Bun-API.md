# 02: Bun API 


## Bun utilities

### Sleep

- `Bun.sleep(ms)`: async method that sleeps for specified number of milliseconds
- `Bun.sleepSync(ms)`: sync method that sleeps for specified number of milliseconds

### file urls

To convert file paths to a from a file url protocol (`file://`), you can use these two methods:

- `Bun.fileURLToPath(url: URL)`: takes in a `URL` object representing a file url and converts it into a filesystem path
- `Bun.pathToFileURL(path: string)`: takes in a filepath and converts it to its file url representation by returning a `URL` instance.

```ts
const path = Bun.fileURLToPath(new URL("file:///foo/bar.txt"));
console.log(path); // "/foo/bar.txt"

const url = Bun.pathToFileURL("/foo/bar.txt");
console.log(url); // "file:///foo/bar.txt"
```

### Bun color

The `Bun.color()` method offers a robust API for converting color strings into different formats, like hex, CSS, RGB, and ansi.

```ts
Bun.color("#ff0000", "css"); // => "red"
Bun.color("rgb(255, 0, 0)", "css"); // => "red"
Bun.color("red", "ansi"); // => "\x1b[31m"
Bun.color("#f00", "ansi-16m"); // => "\x1b[38;2;255;0;0m"
Bun.color(0xff0000, "ansi-256"); // => "\u001b[38;5;196m"
Bun.color({ r: 255, g: 0, b: 0 }, "number"); // => 16711680
Bun.color("hsl(0, 0%, 50%)", "{rgba}"); // => { r: 128, g: 128, b: 128, a: 1 }
```

### Printing out tables

The `Bun.inspect.table()` method takes in a type of `T[]` to console log the data in a tabular format:

```ts
console.log(
  Bun.inspect.table([
    { a: 1, b: 2, c: 3 },
    { a: 4, b: 5, c: 6 },
    { a: 7, b: 8, c: 9 },
  ]),
);

// ┌───┬───┬───┬───┐
// │   │ a │ b │ c │
// ├───┼───┼───┼───┤
// │ 0 │ 1 │ 2 │ 3 │
// │ 1 │ 4 │ 5 │ 6 │
// │ 2 │ 7 │ 8 │ 9 │
// └───┴───┴───┴───┘
```

### Base 64 encoding and decoding

The `btoa(string)` converts a string to a base64 representation and `atob(base64string)` converts a base64 string back to its original contents. These are web standard methods. 

```ts
const data = "hello world";
const encoded = btoa(data); // => "aGVsbG8gd29ybGQ="
const decoded = atob(encoded); // => "hello world"
```

### Compressing data with gzip

Using the `Bun.gzipSync(unint8arr)` and `Bun.gunzipSync(unint8arr)`, you can can compress and decompress `UInt8Array` instances of binary data using GZIP.

```ts
const data = Buffer.from("Hello, world!");
const compressed = Bun.gzipSync(data);
// => Uint8Array

const decompressed = Bun.gunzipSync(compressed);
// => Uint8Array
```

### `HTMLRewriter`

This bun api lets you parse HTML strings and do stuff with them using a DOM API, and then turn it back into a string. Really useful for generating server-side HTML to server render.

More info: 

```embed
title: "HTMLRewriter – API | Bun Docs"
image: "data:image/svg+xml;base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktZGlzY29yZCIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTMuNTQ1IDIuOTA3YTEzLjIyNyAxMy4yMjcgMCAwIDAtMy4yNTctMS4wMTEuMDUuMDUgMCAwIDAtLjA1Mi4wMjVjLS4xNDEuMjUtLjI5Ny41NzctLjQwNi44MzNhMTIuMTkgMTIuMTkgMCAwIDAtMy42NTggMCA4LjI1OCA4LjI1OCAwIDAgMC0uNDEyLS44MzMuMDUxLjA1MSAwIDAgMC0uMDUyLS4wMjVjLTEuMTI1LjE5NC0yLjIyLjUzNC0zLjI1NyAxLjAxMWEuMDQxLjA0MSAwIDAgMC0uMDIxLjAxOEMuMzU2IDYuMDI0LS4yMTMgOS4wNDcuMDY2IDEyLjAzMmMuMDAxLjAxNC4wMS4wMjguMDIxLjAzN2ExMy4yNzYgMTMuMjc2IDAgMCAwIDMuOTk1IDIuMDIuMDUuMDUgMCAwIDAgLjA1Ni0uMDE5Yy4zMDgtLjQyLjU4Mi0uODYzLjgxOC0xLjMyOWEuMDUuMDUgMCAwIDAtLjAxLS4wNTkuMDUxLjA1MSAwIDAgMC0uMDE4LS4wMTEgOC44NzUgOC44NzUgMCAwIDEtMS4yNDgtLjU5NS4wNS4wNSAwIDAgMS0uMDItLjA2Ni4wNTEuMDUxIDAgMCAxIC4wMTUtLjAxOWMuMDg0LS4wNjMuMTY4LS4xMjkuMjQ4LS4xOTVhLjA1LjA1IDAgMCAxIC4wNTEtLjAwN2MyLjYxOSAxLjE5NiA1LjQ1NCAxLjE5NiA4LjA0MSAwYS4wNTIuMDUyIDAgMCAxIC4wNTMuMDA3Yy4wOC4wNjYuMTY0LjEzMi4yNDguMTk1YS4wNTEuMDUxIDAgMCAxLS4wMDQuMDg1IDguMjU0IDguMjU0IDAgMCAxLTEuMjQ5LjU5NC4wNS4wNSAwIDAgMC0uMDMuMDMuMDUyLjA1MiAwIDAgMCAuMDAzLjA0MWMuMjQuNDY1LjUxNS45MDkuODE3IDEuMzI5YS4wNS4wNSAwIDAgMCAuMDU2LjAxOSAxMy4yMzUgMTMuMjM1IDAgMCAwIDQuMDAxLTIuMDIuMDQ5LjA0OSAwIDAgMCAuMDIxLS4wMzdjLjMzNC0zLjQ1MS0uNTU5LTYuNDQ5LTIuMzY2LTkuMTA2YS4wMzQuMDM0IDAgMCAwLS4wMi0uMDE5Wm0tOC4xOTggNy4zMDdjLS43ODkgMC0xLjQzOC0uNzI0LTEuNDM4LTEuNjEyIDAtLjg4OS42MzctMS42MTMgMS40MzgtMS42MTMuODA3IDAgMS40NS43MyAxLjQzOCAxLjYxMyAwIC44ODgtLjYzNyAxLjYxMi0xLjQzOCAxLjYxMlptNS4zMTYgMGMtLjc4OCAwLTEuNDM4LS43MjQtMS40MzgtMS42MTIgMC0uODg5LjYzNy0xLjYxMyAxLjQzOC0xLjYxMy44MDcgMCAxLjQ1MS43MyAxLjQzOCAxLjYxMyAwIC44ODgtLjYzMSAxLjYxMi0xLjQzOCAxLjYxMloiLz4KPC9zdmc+"
description: "Parse and transform HTML with Bun's native HTMLRewriter API, inspired by Cloudflare Workers."
url: "https://bun.sh/docs/api/html-rewriter"
favicon: ""
aspectRatio: "100"
```


```ts
// Replace all images with a rickroll
const rewriter = new HTMLRewriter().on("img", {
  element(img) {
    // Famous rickroll video thumbnail
    img.setAttribute(
      "src",
      "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    );

    // Wrap the image in a link to the video
    img.before(
      '<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">',
      { html: true },
    );
    img.after("</a>", { html: true });

    // Add some fun alt text
    img.setAttribute("alt", "Definitely not a rickroll");
  },
});

// An example HTML document
const html = `
<html>
<body>
  <img src="/cat.jpg">
  <img src="dog.png">
  <img src="https://example.com/bird.webp">
</body>
</html>
`;

const result = rewriter.transform(html);
console.log(result);
```
## Bun stream API

Bun offers a bunch of useful helpers abstracting over streams.

```ts
const stream = (await fetch("https://bun.sh")).body;
stream; // => ReadableStream

await Bun.readableStreamToArrayBuffer(stream);
// => ArrayBuffer

await Bun.readableStreamToBytes(stream);
// => Uint8Array

await Bun.readableStreamToBlob(stream);
// => Blob

await Bun.readableStreamToJSON(stream);
// => object

await Bun.readableStreamToText(stream);
// => string

// returns all chunks as an array
await Bun.readableStreamToArray(stream);
// => unknown[]

// returns all chunks as a FormData object (encoded as x-www-form-urlencoded)
await Bun.readableStreamToFormData(stream);

// returns all chunks as a FormData object (encoded as multipart/form-data)
await Bun.readableStreamToFormData(stream, multipartFormBoundary);
```

## Bun CLI API

### Spawning processes

### Bun Shell

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

#### Piping and Redirecting with JavaScript Objects

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

#### Setting environment variables

You can use the bun shell to set all environment variables, useing the `$.env(obj)` command. Just make sure not to override everything. 

```ts
import { $ } from "bun";

$.env({ ...process.env, FOO: "bar" });
```

#### Changing directories

You can change the working directory of a command by passing a string to `.cwd()`:

```ts
import { $ } from "bun";

// temporarily change working directory to /tmp
await $`pwd`.cwd("/tmp"); // /tmp
```

#### Iterating through standard output

```ts
import { $ } from "bun";

for await (let line of $`echo "Hello World!"`.lines()) {
  console.log(line); // Hello World!
}
```

#### Brace expansion

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



## Fetching data

### DNS prefetching

WIth bun, you can perform DNS prefetching to make fetching websites and APIs even faster:

```ts
import { dns } from "bun";

// ...on startup
dns.prefetch("example.com");

// ...later on
await fetch("https://example.com/");
```

## SQLite

### Setup

SQLite in bun is synchronous and has a good API.

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

You can also remove the dollar signs and make sure you are passing in arguments correctly by enabling the `strict: true` option when creating a new database:

```ts
import { Database } from "bun:sqlite";

const db = new Database(":memory:", {
  strict: true,
});

const query = db.query(`select $message;`);

query.all({
  message: "Hello world"
});
```

### Type safety

When you query a SQL database, you often want to map your query results to a JavaScript object. 

You can now use `query.as(Class)` to map query results to instances of a class. This lets you attach methods, getters, and setters without using an ORM.

```ts
import { Database } from "bun:sqlite";

class Tweet {
  id: number;
  text: string;
  username: string;

  get isMe() {
    return this.username === "jarredsumner";
  }
}

const db = new Database("tweets.db");

// query and map object to class without TS bullshit
const tweets = db.query("SELECT * FROM tweets")
					.as(Tweet);

for (const tweet of tweets.all()) {
  if (!tweet.isMe) {
    console.log(`${tweet.username}: ${tweet.text}`);
  }
}
```

### iteration

If you want to use generators to iterate over a large number of records, the bun sqlite lets you do that:

```ts
import { Database } from "bun:sqlite";

class User {
  id: number;
  email: string;
}

const db = new Database("users.db");
const rows = db.query("SELECT * FROM users")
						.as(User)
						.iterate();

for (const row of rows) {
  console.log(row);
}
```

You can also directly iterate over the query object.

```ts
for (const row of db.query("SELECT * FROM users")) {
  console.log(row); // { id: 1, email: "hello@bun.sh" }
}
```
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

## Bun server side

### Creating servers with `Bun.serve()`

The `Bun.serve()` command is a super fast way to spin up a performant server, built upon web standards. This is the basic syntax of the `Bun.serve()` method:

```ts
const server = Bun.serve(options)
```

The `options` object has these keys and properties:

- `port`: the port to listen on
- `fetch(req)`: this callback triggers on each request to the server. It takes in a web standard `Request` instance and must return a web standard `Response` instance.
- `routes`: an object that maps route strings to their route handlers
- `development`: a boolean that if set, enables hot reloading on the server.

The `Bun.serve()` method returns a server object with these properties and methods:

- `server.reload(staticRoutes)`: takes in a static routes configuration
- `server.port`: the port the server is listening on

**basic server**

```ts
const server = Bun.serve({
  port: 3000, // Optional; defaults to process.env.PORT || 3000
  fetch(request: Request): Response | Promise<Response> {
    return new Response("Welcome to Bun!");
  },
});

console.log(`Listening on http://localhost:${server.port}`);
```

**routing**

By specifying the `routes` option of type `Record<string, Handler>`, bun offers an easy way to provide route handlers:

```ts
Bun.serve({
  routes: {
    "/api/version": async () => {
      // Example: fetch version from database
      return Response.json({ version: "1.0.0" });
    },
    "/orgs/:orgId/repos/:repoId": req => {
      const { orgId, repoId } = req.params;
      return Response.json({ orgId, repoId });
    },
  },
});
```

#### New v1.2 static HTML imports

The cool thing about bun v1.2 is that you can import HTML files just like that as text content into your file. However, that's really not useful if you have stuff like CSS or uncompiled TS you need to go to the network first and compile.

But if you use `Bun.serve()` and serve that HTML text content statically, behind the scenes Bun will automatically fetch all other linked resources the HTML needs, compiling typescript and doing all sorts of other build steps on the fly.

So if you have some static HTML like this that references CSS and TS:

```html title="index.html"
<!DOCTYPE html>
  <head>
    <title>Home</title>
    <link rel="stylesheet" href="./reset.css" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./sentry-and-preloads.ts"></script>
    <script type="module" src="./my-app.tsx" /></script>
  </body>
```

You can import it and then serve it statically via a route to HTML map through the `static` key option in the `Bun.serve()` options or through the `routes` key:

```ts
import homepage from "./index.html";

const server = Bun.serve({
  static: {
    "/": homepage,
  },

  async fetch(req) {
    // ... api requests
  },
});
```

```ts
import appHTML from "./frontend/index.html";
const server = Bun.serve({
  port: 3000, // Optional; defaults to process.env.PORT || 3000
  fetch(request: Request): Response | Promise<Response> {
    return new Response("pAGE NOT FOUND!", {
      status: 404,
    });
  },
  routes: {
    "/": appHTML,
  },
});
```

You can use this to make a complete SSG app, as well as programmatically refreshing and reloading static pages through the `server.reload()` method:

```ts
import { serve } from "bun";

const server = serve({
  static: {
    "/": new Response("Static!"),
  },
  async fetch(request) {
    return new Response("Dynamic!");
  },
});

setInterval(() => {
  const date = new Date().toISOString();
  server.reload({
    static: {
      "/": new Response(`Static! Updated at ${date}`),
    },
  });
}, 1000);
```

#### Complete modern bun server

```ts
import { sql, serve } from "bun";
import dashboard from "./dashboard.html";
import homepage from "./index.html";

const server = serve({
  routes: {
    // ** HTML imports **
    // Bundle & route index.html to "/". This uses HTMLRewriter to scan the HTML for `<script>` and `<link>` tags, run's Bun's JavaScript & CSS bundler on them, transpiles any TypeScript, JSX, and TSX, downlevels CSS with Bun's CSS parser and serves the result.
    "/": homepage,
    // Bundle & route dashboard.html to "/dashboard"
    "/dashboard": dashboard,

    // ** API endpoints ** (Bun v1.2.3+ required)
    "/api/users": {
      async GET(req) {
        const users = await sql`SELECT * FROM users`;
        return Response.json(users);
      },
      async POST(req) {
        const { name, email } = await req.json();
        const [user] =
          await sql`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
        return Response.json(user);
      },
    },
    "/api/users/:id": async req => {
      const { id } = req.params;
      const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
      return Response.json(user);
    },
  },

  // Enable development mode for:
  // - Detailed error messages
  // - Hot reloading (Bun v1.2.3+ required)
  development: true,
});

console.log(`Listening on ${server.url}`);
```

#### Websockets in Bun

`Bun.serve()` offers built in support for creating websockets, keeping track of clients, upgrade requests, etc.

For a complete guide, go here:

```embed
title: "WebSockets – API | Bun Docs"
image: "data:image/svg+xml;base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktZGlzY29yZCIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTMuNTQ1IDIuOTA3YTEzLjIyNyAxMy4yMjcgMCAwIDAtMy4yNTctMS4wMTEuMDUuMDUgMCAwIDAtLjA1Mi4wMjVjLS4xNDEuMjUtLjI5Ny41NzctLjQwNi44MzNhMTIuMTkgMTIuMTkgMCAwIDAtMy42NTggMCA4LjI1OCA4LjI1OCAwIDAgMC0uNDEyLS44MzMuMDUxLjA1MSAwIDAgMC0uMDUyLS4wMjVjLTEuMTI1LjE5NC0yLjIyLjUzNC0zLjI1NyAxLjAxMWEuMDQxLjA0MSAwIDAgMC0uMDIxLjAxOEMuMzU2IDYuMDI0LS4yMTMgOS4wNDcuMDY2IDEyLjAzMmMuMDAxLjAxNC4wMS4wMjguMDIxLjAzN2ExMy4yNzYgMTMuMjc2IDAgMCAwIDMuOTk1IDIuMDIuMDUuMDUgMCAwIDAgLjA1Ni0uMDE5Yy4zMDgtLjQyLjU4Mi0uODYzLjgxOC0xLjMyOWEuMDUuMDUgMCAwIDAtLjAxLS4wNTkuMDUxLjA1MSAwIDAgMC0uMDE4LS4wMTEgOC44NzUgOC44NzUgMCAwIDEtMS4yNDgtLjU5NS4wNS4wNSAwIDAgMS0uMDItLjA2Ni4wNTEuMDUxIDAgMCAxIC4wMTUtLjAxOWMuMDg0LS4wNjMuMTY4LS4xMjkuMjQ4LS4xOTVhLjA1LjA1IDAgMCAxIC4wNTEtLjAwN2MyLjYxOSAxLjE5NiA1LjQ1NCAxLjE5NiA4LjA0MSAwYS4wNTIuMDUyIDAgMCAxIC4wNTMuMDA3Yy4wOC4wNjYuMTY0LjEzMi4yNDguMTk1YS4wNTEuMDUxIDAgMCAxLS4wMDQuMDg1IDguMjU0IDguMjU0IDAgMCAxLTEuMjQ5LjU5NC4wNS4wNSAwIDAgMC0uMDMuMDMuMDUyLjA1MiAwIDAgMCAuMDAzLjA0MWMuMjQuNDY1LjUxNS45MDkuODE3IDEuMzI5YS4wNS4wNSAwIDAgMCAuMDU2LjAxOSAxMy4yMzUgMTMuMjM1IDAgMCAwIDQuMDAxLTIuMDIuMDQ5LjA0OSAwIDAgMCAuMDIxLS4wMzdjLjMzNC0zLjQ1MS0uNTU5LTYuNDQ5LTIuMzY2LTkuMTA2YS4wMzQuMDM0IDAgMCAwLS4wMi0uMDE5Wm0tOC4xOTggNy4zMDdjLS43ODkgMC0xLjQzOC0uNzI0LTEuNDM4LTEuNjEyIDAtLjg4OS42MzctMS42MTMgMS40MzgtMS42MTMuODA3IDAgMS40NS43MyAxLjQzOCAxLjYxMyAwIC44ODgtLjYzNyAxLjYxMi0xLjQzOCAxLjYxMlptNS4zMTYgMGMtLjc4OCAwLTEuNDM4LS43MjQtMS40MzgtMS42MTIgMC0uODg5LjYzNy0xLjYxMyAxLjQzOC0xLjYxMy44MDcgMCAxLjQ1MS43MyAxLjQzOCAxLjYxMyAwIC44ODgtLjYzMSAxLjYxMi0xLjQzOCAxLjYxMloiLz4KPC9zdmc+"
description: "Bun supports server-side WebSockets with on-the-fly compression, TLS support, and a Bun-native pubsub API."
url: "https://bun.sh/docs/api/websockets"
favicon: ""
aspectRatio: "100"
```


On an HTTP request to your server, you can listen on a specific route for websocket upgrade requests through the `server.upgrade(req)` method:

```ts
const upgraded = server.upgrade(req)
```

- This method tries to see if the client requesting a socket upgrade, and if not, it returns false. It returns true if the client is trying to upgrade to the websocket protocol.

```ts
Bun.serve({
  websocket: {
    open: (ws) => { console.log("Client connected"); },
    message: (ws, message) => { console.log("Received:", message); },
    close: (ws) => { console.log("Client disconnected"); },
  },
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      const upgraded = server.upgrade(req);
      if (!upgraded) return new Response("Upgrade failed", { status: 400 });
    }
    return new Response("Hello World");
  },
});
```

You have all possible websocket configuration through the `websocket` object in the server options:

- `open(ws)`: a callback that gets triggered when a new websocket connects on the client

Here is a complete example with type safety for messages:

```ts title="index.d.ts"
type Payloads<
  SendPayload extends Record<string, unknown>,
  ReceivePayload extends Record<string, unknown>
> = {
  sendMessagePayload: SendPayload;
  receiveMessagePayload: ReceivePayload;
};

type AppSockets = {
	"dogs": {
		sendMessagePayload: {message: string},
		receiveMessagePayload: {message: string},
	}
}
```

In the example below, we listen for websocket upgrade requests on the `/websocket` route.

```ts title="server.ts"
import appHTML from "./frontend/index.html";


// class for type safety
class BunServerSocket<T extends Record<string, Payloads<any, any>>> {
  constructor(public ws: Bun.ServerWebSocket<unknown>) {}

  sendMessage<K extends keyof T>(key: K, message: T[K]["sendMessagePayload"]) {
    this.ws.send(JSON.stringify({ type: key, payload: message }));
  }

  onMessage<K extends keyof T>(
    key: K,
    message: string,
    listener: (payload: T[K]["receiveMessagePayload"]) => void
  ) {
    try {
      const data = JSON.parse(message) as {
        type: K;
        payload: T[K]["receiveMessagePayload"];
      };
      if (data.type === key) {
        listener(data.payload);
      }
    } catch (e) {
      console.error(`error tried to parse:`, message);
    }
  }
}

const server = Bun.serve({
  port: 3000, // Optional; defaults to process.env.PORT || 3000
  routes: {
    "/": appHTML,
    "/websocket": (req) => {
      const upgraded = server.upgrade(req);
      if (!upgraded) return new Response("Upgrade failed", { status: 400 });
    },
  },
  websocket: {
    open: (ws) => {
      console.log(`Client connected`);
    },
    message: (ws, message) => {
      console.log("Received:", message);
      const websockets = new BunServerSocket<AppSockets>(ws);
      
      websockets.sendMessage("dogs", {
        message: "hello from server!",
      });

      websockets.onMessage("dogs", message as string, (payload) => {
        console.log(payload.message);
      });
    },
    close: (ws) => {
      console.log("Client disconnected");
    },
  },
});

console.log(`Listening on http://localhost:${server.port}`);
```

You can then use the simple web standard for sockets on the client side:

```ts
const websocket = new WebSocket("ws://localhost:3000/websocket");

websocket.onopen = (e) => {
  websocket.send(
    JSON.stringify({
      type: "dogs",
      payload: {
        message: "hello world",
      },
    })
  );
};

websocket.onmessage = (e) => {
  console.log(e.data);
};
```

#### Streaming files

You can easily stream files on the server-side as an API route by just sending back a response and passing in a `BunFile` iinstance:

```ts
Bun.serve({
  fetch(req) {
    return new Response(Bun.file("./hello.txt"));
  },
});
```