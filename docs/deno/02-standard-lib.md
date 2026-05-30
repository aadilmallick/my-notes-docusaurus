# Deno Standard Library

## Working with files

### Node

This is a standard file implementation using Node

```ts
import fs from "node:fs/promises";

export class FileManager {
  static async exists(filePath: string) {
    try {
      await fs.access(filePath);
      return true; // The file exists
    } catch (_) {
      return false; // The file does not exist
    }
  }

  static async removeFile(filepath: string) {
    if (await this.exists(filepath)) {
      await fs.rm(filepath);
    }
  }

  static async createFile(
    filepath: string,
    content: string,
    options?: {
      override?: boolean;
    }
  ) {
    if ((await this.exists(filepath)) && options?.override) {
      await fs.rm(filepath);
    }
    await fs.writeFile(filepath, content);
  }

  static async createDirectory(
    directoryPath: string,
    options?: {
      overwrite?: boolean;
    }
  ) {
    if (await this.exists(directoryPath)) {
      if (options?.overwrite) {
        await fs.rm(directoryPath, { recursive: true, force: true });
        await fs.mkdir(directoryPath, { recursive: true });
      }
    } else {
      await fs.mkdir(directoryPath, { recursive: true });
    }
  }

  static async readFile(filepath: string) {
    return await fs.readFile(filepath, "utf-8");
  }
}
```

### Deno fs

But we can make an even better and easier implementation using methods from the `@std/file` deno standard library.

```ts
import { ensureFile, copy, ensureDir, move } from "@std/fs";

await ensureFile("example.txt");

await copy("example.txt", "example_copy.txt");

await ensureDir("subdir");

await move("example_copy.txt", "subdir/example_copy.txt");
```

Here is a better class:

```ts
import {
  ensureFile,
  copy,
  ensureDir,
  move,
  exists,
  expandGlob,
  emptyDir,
  walk,
} from "@std/fs";

export class DenoFileManager {
  static async upsertFile(filePath: string) {
    return await ensureFile(filePath);
  }

  static async upsertFolder(dirPath: string) {
    return await ensureDir(dirPath);
  }

  static async exists(path: string) {
    return await exists(path);
  }

  static async listFilesFromGlob(globPath: string) {
    const files = await Array.fromAsync(expandGlob(globPath));
    return files;
  }

  static async moveFileToFolder(filePath: string, folderPath: string) {
    await move(filePath, folderPath);
  }

  static async rename(path: string, newPath: string) {
    await fs.rename(path, newPath);
  }

  static async copyFile(source: string, folder: string) {
    await copy(source, folder);
  }

  static async copyFolder(source: string, folder: string) {
    await copy(source, folder, {
      overwrite: true,
    });
  }

  static async walkDir(
    dirPath: string,
    cb: (entry: Deno.DirEntry) => Promise<void>,
    options?: {
      extensionsToInclude?: string[];
      includeDirs?: boolean;
      includeFiles?: boolean;
      filePatternsToMatch?: RegExp[];
      filePatternsToSkip?: RegExp[];
    }
  ) {
    for await (const entry of walk(dirPath, {
      exts: options?.extensionsToInclude,
      includeDirs: options?.includeDirs,
      includeFiles: options?.includeFiles,
      skip: options?.filePatternsToSkip,
      match: options?.filePatternsToMatch,
    })) {
      await cb(entry);
    }
  }
}
```

### Deno path

```ts
import * as path from "@std/path";
import { assertEquals } from "@std/assert";

// Get components of a path
if (Deno.build.os === "windows") {
  assertEquals(path.basename("C:\\Users\\user\\file.txt"), "file.txt");
  assertEquals(path.dirname("C:\\Users\\user\\file.txt"), "C:\\Users\\user");
  assertEquals(path.extname("C:\\Users\\user\\file.txt"), ".txt");
} else {
  assertEquals(path.basename("/home/user/file.txt"), "file.txt");
  assertEquals(path.dirname("/home/user/file.txt"), "/home/user");
  assertEquals(path.extname("/home/user/file.txt"), ".txt");
}

// Join path segments
if (Deno.build.os === "windows") {
  assertEquals(path.join("C:\\", "Users", "docs", "file.txt"), "C:\\Users\\docs\\file.txt");
} else {
  assertEquals(path.join("/home", "user", "docs", "file.txt"), "/home/user/docs/file.txt");
}

// Normalize a path
if (Deno.build.os === "windows") {
  assertEquals(path.normalize("C:\\Users\\user\\..\\temp\\.\\file.txt"), "C:\\Users\\temp\\file.txt");
} else {
  assertEquals(path.normalize("/home/user/../temp/./file.txt"), "/home/temp/file.txt");
}

// Resolve absolute path
if (Deno.build.os === "windows") {
  const resolved = path.resolve("C:\\foo", "docs", "file.txt");
  assertEquals(resolved, "C:\\foo\\docs\\file.txt");
  assertEquals(path.isAbsolute(resolved), true);
} else {
  const resolved = path.resolve("/foo", "docs", "file.txt");
  assertEquals(resolved, "/foo/docs/file.txt");
  assertEquals(path.isAbsolute(resolved), true);
}

// Get relative path
if (Deno.build.os === "windows") {
  assertEquals(path.relative("C:\\Users", "C:\\Users\\docs\\file.txt"), "docs\\file.txt");
  assertEquals(path.relative("C:\\Users", "D:\\Programs"), "D:\\Programs");
} else {
  assertEquals(path.relative("/home/user", "/home/user/docs/file.txt"), "docs/file.txt");
  assertEquals(path.relative("/home/user", "/var/data"), "../../var/data");
}

```

```ts
import * as path from "@std/path";
import { assertEquals } from "@std/assert";

if (Deno.build.os === "windows") {
  const parsedWindows = path.parse("C:\\Users\\user\\file.txt");
  assertEquals(parsedWindows.root, "C:\\");
  assertEquals(parsedWindows.dir, "C:\\Users\\user");
  assertEquals(parsedWindows.base, "file.txt");
  assertEquals(parsedWindows.ext, ".txt");
  assertEquals(parsedWindows.name, "file");

  // Format path from components (Windows)
  assertEquals(
    path.format({ dir: "C:\\Users\\user", base: "file.txt" }),
    "C:\\Users\\user\\file.txt"
  );
} else {
  const parsedPosix = path.parse("/home/user/file.txt");
  assertEquals(parsedPosix.root, "/");
  assertEquals(parsedPosix.dir, "/home/user");
  assertEquals(parsedPosix.base, "file.txt");
  assertEquals(parsedPosix.ext, ".txt");
  assertEquals(parsedPosix.name, "file");

  // Format path from components (POSIX)
  assertEquals(
    path.format({ dir: "/home/user", base: "file.txt" }),
    "/home/user/file.txt"
  );
}

```

```ts
import * as path from "@std/path";
import { assertEquals } from "@std/assert";

// Convert between file URLs and paths
if (Deno.build.os === "windows") {
  assertEquals(path.fromFileUrl("file:///C:/Users/user/file.txt"), "C:\\Users\\user\\file.txt");
  assertEquals(path.toFileUrl("C:\\Users\\user\\file.txt").href, "file:///C:/Users/user/file.txt");
} else {
  assertEquals(path.fromFileUrl("file:///home/user/file.txt"), "/home/user/file.txt");
  assertEquals(path.toFileUrl("/home/user/file.txt").href, "file:///home/user/file.txt");
}

```

```ts
import * as path from "@std/path";
import { assertEquals } from "@std/assert";

// Check if path is absolute
if (Deno.build.os === "windows") {
  assertEquals(path.isAbsolute("C:\\Users"), true);
  assertEquals(path.isAbsolute("\\\\Server\\share"), true);
  assertEquals(path.isAbsolute("C:relative\\path"), false);
  assertEquals(path.isAbsolute("..\\relative\\path"), false);
} else {
  assertEquals(path.isAbsolute("/home/user"), true);
  assertEquals(path.isAbsolute("./relative/path"), false);
  assertEquals(path.isAbsolute("../relative/path"), false);
}

// Convert to namespaced path (Windows-specific)
if (Deno.build.os === "windows") {
  assertEquals(path.toNamespacedPath("C:\\Users\\file.txt"), "\\\\?\\C:\\Users\\file.txt");
  assertEquals(path.toNamespacedPath("\\\\server\\share\\file.txt"), "\\\\?\\UNC\\server\\share\\file.txt");
} else {
  // On POSIX, toNamespacedPath returns the path unchanged
  assertEquals(path.toNamespacedPath("/home/user/file.txt"), "/home/user/file.txt");
}

```

```ts
import * as path from "@std/path";
import { assertEquals } from "@std/assert";

// Check if a string is a glob pattern
assertEquals(path.isGlob("*.txt"), true);

// Convert glob pattern to RegExp
const pattern = path.globToRegExp("*.txt");
assertEquals(pattern.test("file.txt"), true);

// Join multiple glob patterns
if (Deno.build.os === "windows") {
  assertEquals(path.joinGlobs(["src", "**\\*.ts"]), "src\\**\\*.ts");
} else {
  assertEquals(path.joinGlobs(["src", "**\/*.ts"]), "src/**\/*.ts");
}

// Normalize a glob pattern
if (Deno.build.os === "windows") {
  assertEquals(path.normalizeGlob("src\\..\\**\\*.ts"), "**\\*.ts");
} else {
  assertEquals(path.normalizeGlob("src/../**\/*.ts"), "**\/*.ts");
}

```

## Command line stuff

Go to this library for more info: https://jsr.io/@std/cli/doc

### Command Line Arguments

We can use the `Deno.args` to get all command line arguments passed when running a file with `deno run`, and we can parse those arguments with options and type safety using `parseArgs()` method.

```ts
import { parseArgs } from "jsr:@std/cli@^1.0.8/parse-args";

const args = parseArgs(Deno.args, {
  string: ["name", "age"],
  boolean: ["is_old"],
  default: {
    name: "John",
    age: 20,
    is_old: false,
  },
});

console.log(args);
```

The above example created three options a user could pass: `--name`, `--age`, and `--is_old`, along with type safety and default values for each.

The resulting `args` object looks like so:

```ts
{
	name: "John",
	age: 20,
	is_old: false
}
```

Here is a complete example:

```ts
import { parseArgs } from "jsr:@std/cli/parse-args";
import { toKebabCase, toSnakeCase } from "jsr:@std/text";
import { red, bgGreen, blue, yellow, magenta } from "jsr:@std/fmt/colors";

const flags = parseArgs(Deno.args, {
  boolean: ["snake", "kebab"],
  string: ["text"],
  default: { text: "Hi Mom" },
});

const age = prompt("How old are you?");

if (parseInt(age!) < 21) {
  console.log(red('You are not old enough to run this command 💀'));
  Deno.exit();
}

console.log()
console.log(bgGreen('ACCESS GRANTED'));
console.log()


const shouldProceed = confirm("Wait, r u sure?");

if (!shouldProceed) {
  console.log(red('Terminated 💀'));
  Deno.exit();
}

console.log()
console.log(yellow((flags.text.toUpperCase())))
flags.kebab && console.log(blue(toKebabCase(flags.text)))
flags.snake && console.log(magenta(toSnakeCase(flags.text)))
```

### Text Colors

You can easily print text colors in the shell with the deno colors library:

```ts
import { bgGreen, bgRed, yellow } from "jsr:@std/internal@^1.0.5/styles";

console.log(yellow("this text is yellow"));
console.log(bgRed("this text has a red background"));
```

### CLI utilities

Deno offers basic global methods that help with scaffolding CLIs:

- `confirm(text: string)`: pulls up a yes/no picker in the command line and records the response as a boolean.
- `prompt(text: string)`: reads user input from the command line and records the response as a string.
- `alert(text: string)`: shows the user a message and waits for the user to press **enter** to continue.

But besides those, we have helpful CLI utilities from npm:

```ts

import ora from "npm:ora";
import { pastel } from "npm:gradient-string";
import figlet from "npm:figlet";
import inquirer from "npm:inquirer";

export async function showQuickPick<T extends readonly string[]>(
  choices: T,
  message?: string,
  defaultChoice?: T[number]
) {
  const result = await inquirer.prompt({
    name: "template",
    type: "list",
    message: message ?? "Choose an option:",
    choices,
    default: () => {
      return defaultChoice ?? choices[0];
    },
  });
  return result.template as T[number];
}

export const showLoader = (text: string) => {
  const spinner = ora({
    text,
    color: "cyan",
  }).start();

  return {
    stop: () => spinner.stop(),
    succeed: (text?: string) => spinner.succeed(text),
    fail: (text?: string) => spinner.fail(text),
    update: (text: string) => (spinner.text = text),
  };
};

export function gradientText(text: string) {
  return new Promise((resolve, reject) => {
    figlet(text, (err: unknown, data: string) => {
      console.log(pastel.multiline(data));
      resolve(data);
    });
  });
}

export async function promptYesOrNo(
  message: string,
  cbs: {
    success: () => void | Promise<void>;
    fail: () => void | Promise<void>;
  }
) {
  const action = confirm(`${message}`);
  if (action) {
    await cbs.success();
  } else {
    await cbs.fail();
  }
}

```

### Running commands

You can use the `Deno.Command(cmd, options)` method to run shell commands in a way that is consistent across every platform.

```ts
const cmd = new Deno.Command("mkdir", {
  args: ["-p", "parent_folder/sub_folder"],
  stdout: "inherit",
  stderr: "inherit",
});
await cmd.output();
```

## From Web To Deno

There are numerous built in functions in Deno that are adapted from the web and fit to the command line environment.

### Command line related functions

`confirm()` and `prompt()` are two built in functions in Deno that get input from the command line so you can use them programmatically.

```ts
const name = prompt("What is your name?");
const isSure = confirm("Are you sure?");

if (isSure) {
  console.log("Yes");
  console.log(name);
} else {
  console.log("No");
  console.log(name);
}
```

- `confirm(text: string)`: pulls up a yes/no picker in the command line and records the response as a boolean.
- `prompt(text: string)`: reads user input from the command line and records the response as a string.
- `alert(text: string)`: shows the user a message and waits for the user to press **enter** to continue.

### Timeouts and Intervals

The `setInterval()`, `setTimeout()`, `clearInterval()`, and `clearTimeout()` functions work exactly like they do in web.

### Fetching data

When fetching data server-side from deno using `fetch()`, it's necessary to use absolute filepaths.

```ts
const response = await fetch(new URL("./config.json", import.meta.url));
const config = await response.json();
```
### Processes

The `close()` function exits the main Deno process, stopping the file from running.

## Deno cron

Deno cron is an unstable API, so you need to add `"cron"` to the `"unstable"` key array in your `deno.json` config.

### Basic

You can register cron jobs using the `Deno.cron()` method, which follows this syntax:

```ts
Deno.cron(jobName, cronSyntax, cb)
```

Here are some examples:

```ts
Deno.cron("log-a-message", "* * * * *", () => {
  console.log("This runs once a minute.");
});

Deno.cron("hourly-task", { hour: { every: 1 } }, () => {
  console.log("This runs once an hour.");
});
```

> [!IMPORTANT]
> Cron jobs must be registered at the top level of a module, before any server starts. Definitions nested inside request handlers, conditionals, or callbacks will not be picked up.

### Retrying failed jobs

```ts
Deno.cron(
  "retry-example",
  "* * * * *",
  { backoffSchedule: [1000, 5000, 10000] },
  () => {
    throw new Error("Will be retried up to three times.");
  },
);

```



## Deno Frontend Development

### Deno with React

To setup JSX with Deno, specifically React JSX, set these options in the `deno.json`:

```json title="deno.json"
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "imports": {
    "react": "npm:react",
    "@types/react": "npm:@types/react"
  }
}
```

#### SSR


If you're using React instead of Preact, you can use React's own server rendering capabilities:


```json title="deno.json"
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "imports": {
    "react": "npm:react@^18.2.0",
    "react-dom": "npm:react-dom@^18.2.0",
    "react-dom/server": "npm:react-dom@^18.2.0/server"
  }
}
```

And in your server code:


```tsx
import { renderToString } from "react-dom/server";

const App = () => {
  return <h1>Hello from React</h1>;
};

Deno.serve(() => {
  const html = `<!DOCTYPE html>${renderToString(<App />)}`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
```


### Deno with Preact

#### Precompile transform

Deno ships with a [new JSX transform](https://deno.com/blog/v1.38#fastest-jsx-transform) that is optimized for server-side rendering. It can be up to **7-20x faster** than the other JSX transform options. The difference is that the precompile transform analyses your JSX statically and stores precompiled HTML strings if possible. That way a lot of time creating JSX objects can be avoided.

To use the precompile transform, set the `jsx` option to `"precompile"`.


```diff title="deno.json"
  {
    "compilerOptions": {
+     "jsx": "precompile",
      "jsxImportSource": "preact"
    },
    "imports": {
      "preact": "npm:preact"
    }
  }
```

To prevent JSX nodes representing HTML elements from being precompiled, you can add them to the `jsxPrecompileSkipElements` setting.


```diff title="done.json"
  {
    "compilerOptions": {
      "jsx": "precompile",
      "jsxImportSource": "preact",
+     "jsxPrecompileSkipElements": ["a", "link"]
    },
    "imports": {
      "preact": "npm:preact"
    }
  }
```

> [!NOTE]
> The `precompile` transform works best with [Preact](https://preactjs.com/) or [Hono](https://hono.dev/). It is not supported in React.

#### SSR

For Preact applications, you can use the `preact-render-to-string` package:


```json title="deno.json"
{
  "compilerOptions": {
    "jsx": "precompile",
    "jsxImportSource": "preact"
  },
  "imports": {
    "preact": "npm:preact@^10.26.6",
    "preact-render-to-string": "npm:preact-render-to-string@^6.5.13"
  }
}
```

Then in your server code:

```tsx title="server.tsx"
import { renderToString } from "preact-render-to-string";

const App = () => {
  return <h1>Hello world</h1>;
};

Deno.serve(() => {
  const html = `<!DOCTYPE html>${renderToString(<App />)}`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
});
```

This approach works well with the precompile transform, providing optimal performance for server-side rendering.


## Server-side

### Deno HTTP

#### Creating a basic server

Everything starts with the `Deno.serve(handler)` function, which starts the server.

```ts
Deno.serve((_req) => {
  return new Response("Hello, World!");
});
```

```ts
// To listen on port 4242.
Deno.serve({ port: 4242 }, handler);

// To listen on port 4242 and bind to 0.0.0.0.
Deno.serve({ port: 4242, hostname: "0.0.0.0" }, handler);
```

#### Handlers

**handlers** are the basic request-response cycle execution, taking in a `Request` instance argument in the callback, and you must return a `Response` from the handler.

This is how you access the request on the handler. Here are the properties on the `req` object:

```ts
Deno.serve(async (req) => {
  console.log("Method:", req.method);

  const url = new URL(req.url);
  console.log("Path:", url.pathname);
  console.log("Query parameters:", url.searchParams);

  console.log("Headers:", req.headers);

  if (req.body) {
    const body = await req.text();
    console.log("Body:", body);
  }

  return new Response("Hello, World!");
});
```

Here is an example of returning a response:

```ts
Deno.serve((req) => {
  const body = JSON.stringify({ message: "NOT FOUND" });
  return new Response(body, {
    status: 404,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
});
```

#### Returning streams

```ts
Deno.serve((req) => {
  let timer: number;
  const body = new ReadableStream({
    async start(controller) {
      timer = setInterval(() => {
        controller.enqueue("Hello, World!\n");
      }, 1000);
    },
    cancel() {
      clearInterval(timer);
    },
  });
  return new Response(body.pipeThrough(new TextEncoderStream()), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
});

```

> [!WARNING]
> Note the `cancel` function above. This is called when the client hangs up the connection. It is important to make sure that you handle this case, otherwise the server will keep queuing up messages forever, and eventually run out of memory.

### Custom Deno Router

```ts
import { route, type Route, Handler } from "@std/http/unstable-route";
import { serveDir, serveFile } from "@std/http/file-server";

type Middleware<T> = (
  state: T,
  req: Request
) => Partial<T> | Promise<Partial<T>>;

export class Router<
  GlobalStateType = Record<string, any>,
  RequestStateType = Record<string, any>
> {
  private routes: Route[] = [];
  private globalMiddlewares: Middleware<GlobalStateType>[] = [];

  constructor(
    private globalState: GlobalStateType = {} as GlobalStateType,
    private requestState: RequestStateType = {} as RequestStateType
  ) {}

  private setGlobalState(state: Partial<GlobalStateType>) {
    this.globalState = {
      ...this.globalState,
      ...state,
    };
  }

  private async executeRouteMiddleware(
    middleware: Middleware<RequestStateType>,
    req: Request
  ) {
    if (!req.payload) {
      req.payload = this.requestState;
    }
    const currentPayload = req.payload as RequestStateType;
    const newPayload = await middleware(currentPayload, req);
    req.payload = {
      ...currentPayload,
      ...newPayload,
    };
  }

  public getGlobalState() {
    return this.globalState;
  }

  public getRequestPayload(req: Request) {
    return req.payload as RequestStateType;
  }

  useGlobalMiddleware(
    cb: (
      state: GlobalStateType,
      req: Request
    ) => Partial<GlobalStateType> | Promise<Partial<GlobalStateType>>
  ) {
    this.globalMiddlewares.push(cb);
  }

  get(path: string, handler: Handler) {
    this.addRoute("GET", path, handler);
  }

  post(path: string, handler: Handler) {
    this.addRoute("POST", path, handler);
  }

  put(path: string, handler: Handler) {
    this.addRoute("PUT", path, handler);
  }

  delete(path: string, handler: Handler) {
    this.addRoute("DELETE", path, handler);
  }

  produceGlobalMiddleware(cb: Middleware<GlobalStateType>) {
    return cb;
  }

  produceLocalMiddleware(cb: Middleware<RequestStateType>) {
    return cb;
  }

  getWithGlobalMiddleware(
    path: string,
    middlewares: Middleware<GlobalStateType>[],
    handler: Handler
  ) {
    this.addRoute("GET", path, handler, middlewares, "global");
  }

  postWithGlobalMiddleware(
    path: string,
    middlewares: Middleware<GlobalStateType>[],
    handler: Handler
  ) {
    this.addRoute("POST", path, handler, middlewares, "global");
  }

  putWithGlobalMiddleware(
    path: string,
    middlewares: Middleware<GlobalStateType>[],
    handler: Handler
  ) {
    this.addRoute("PUT", path, handler, middlewares, "global");
  }

  deleteWithGlobalMiddleware(
    path: string,
    middlewares: Middleware<GlobalStateType>[],
    handler: Handler
  ) {
    this.addRoute("DELETE", path, handler, middlewares, "global");
  }

  getWithLocalMiddleware(
    path: string,
    middlewares: Middleware<RequestStateType>[],
    handler: Handler
  ) {
    this.addRoute("GET", path, handler, middlewares, "local");
  }

  postWithLocalMiddleware(
    path: string,
    middlewares: Middleware<RequestStateType>[],
    handler: Handler
  ) {
    this.addRoute("POST", path, handler, middlewares, "local");
  }

  putWithLocalMiddleware(
    path: string,
    middlewares: Middleware<RequestStateType>[],
    handler: Handler
  ) {
    this.addRoute("PUT", path, handler, middlewares, "local");
  }

  deleteWithLocalMiddleware(
    path: string,
    middlewares: Middleware<RequestStateType>[],
    handler: Handler
  ) {
    this.addRoute("DELETE", path, handler, middlewares, "local");
  }

  redirect(path: string): Response {
    return new Response(null, {
      status: 302,
      headers: {
        Location: path,
      },
    });
  }

  json(data: Record<string, any>, status = 200) {
    return new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
      },
      status,
    });
  }

  renderHTML(html: string, status = 200) {
    return new Response(html, {
      headers: {
        "content-type": "text/html",
      },
      status,
    });
  }

  text(data: string, status = 200) {
    return new Response(data, {
      headers: {
        "content-type": "text/plain",
      },
      status,
    });
  }

  serveStatic(path: string) {
    let newPath = path;
    if (!path.endsWith("/*")) {
      newPath = path.endsWith("/") ? `${path}*` : `${path}/*`;
    }
    this.addRoute("GET", newPath, (req) => serveDir(req));
  }

  serveFile(path: string, filepath: string) {
    this.addRoute("GET", path, (req) => serveFile(req, filepath));
  }

  private addRoute(
    method: string,
    path: string,
    handler: Handler,
    middlewares:
      | Middleware<GlobalStateType>[]
      | Middleware<RequestStateType>[] = [],
    middlewareType: "global" | "local" = "global"
  ) {
    const pattern = new URLPattern({ pathname: path });
    this.routes.push({
      pattern,
      method,
      handler: async (req, info, params) => {
        try {
          // 1. run global middleware
          for await (const middleware of this.globalMiddlewares) {
            this.setGlobalState(await middleware(this.globalState, req));
          }
          // 2. run route local middleware (that affects global state)
          if (middlewareType === "global") {
            for await (const middleware of middlewares as Middleware<GlobalStateType>[]) {
              this.setGlobalState(await middleware(this.globalState, req));
            }
          } else {
            for await (const middleware of middlewares as Middleware<RequestStateType>[]) {
              // each time this is called, modifies req.payload
              await this.executeRouteMiddleware(middleware, req);
            }
          }
          // 3. run response handler, which ends cycle
          return await handler(req, info!, params!);
        } catch (error) {
          console.error("Error handling request:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    });
  }

  get handler() {
    return route(this.routes, () => new Response("Not Found", { status: 404 }));
  }

  initServer() {
    Deno.serve(this.handler);
  }
}

```

#### Basic Usage


```ts
import { Router } from "./router.ts"; 
const router = new Router(); 

router.get("/", (req) => {   return new Response("Hello World!"); }); router.post("/users", async (req) => {   
	const user = await req.json();  
	return router.json({ success: true, userId: 123 }); 
});
router.initServer();
```

You can deal with route parameters like so:

```ts
app.get("/realtime/:id", async (_req, info, params) => {
	// get dynamic route param `id`
  const id = info?.pathname.groups["id"] as string;
})
```

#### Type Parameters

The Router accepts two generic type parameters:

- `GlobalStateType` - Type for global state shared across all requests
- `RequestStateType` - Type for request-specific state, stored on `request.payload`

#### Middleware

##### Global Middleware

Global middleware runs for every request and can modify the global state. There are two ways you can use global middleware:

- **purely global**: Runs on every request.
- **scoped to certain requests**: Affects the app's global state, but this middleware only runs on the routes you add it to.

Here is an example of creating a basic global middleware

```ts
export const app = new Router<AppState, {}>(
  {
    currentUser: null,
  },
  {
  }
);

export const userAuthMiddleware = app.produceGlobalMiddleware(
  async (_state, req) => {
    const currentUser = await getCurrentUser(req);
    
	// this will be value of new global state
    return {
      currentUser: currentUser,
    };
  }
);
```

Here is the first purely global way of using it so that it runs before every request:

```ts
app.useGlobalMiddleware(userAuthMiddleware)
```

Here is the second way of using it so that it runs only on the routes you add it to:

```ts
app.getWithGlobalMiddleware("/", [userAuthMiddleware], () => {
	// this value will be populated after middleware runs
	const {currentUser} = app.getGlobalState()

	// ...
})
```

##### Request-scoped Middleware

Middleware that runs for specific routes and affects the request payload. This requires some typescript fuckery by extending the web `Request` interface in a `.d.ts` file:

```ts title="types.d.ts"
interface Request {
  payload: any;
}
```

`
```ts
export const app = new Router<AppState, AppState>(
  {},
  {
    currentUser: null,
  }
);

export const userAuthLocalMiddleware = app.produceLocalMiddleware(
  async (_state, req) => {
    const currentUser = await getCurrentUser(req);

	// this will modify req.payload
    return {
      currentUser: currentUser,
    };
  }
);

app.getWithLocalMiddleware("/", [userAuthLocalMiddleware], (req) => {
	// this value will be populated after middleware runs
	const { currentUser } = app.getRequestPayload(req);

	// ...
})
```


#### API Reference

##### Router Methods

- `get(path, handler)` - Register GET route
- `post(path, handler)` - Register POST route
- `put(path, handler)` - Register PUT route
- `delete(path, handler)` - Register DELETE route
- `getWithGlobalMiddleware(path, middlewares, handler)` - GET route with global middleware
- `getWithLocalMiddleware(path, middlewares, handler)` - GET route with request middleware
- `useGlobalMiddleware(middleware)` - Add global middleware to run on all routes
- `produceGlobalMiddleware(callback)` - Create global middleware
- `produceLocalMiddleware(callback)` - Create request middleware
- `getGlobalState()` - Get current global state
- `getRequestPayload(req)` - Get request payload
- `initServer()` - Start the HTTP server

##### Response Helpers

- `json(data, status)` - JSON response
- `renderHTML(html, status)` - HTML response
- `text(data, status)` - Plain text response
- `redirect(path)` - HTTP redirect
- `serveStatic(path)` - Serve static directory
- `serveFile(path, filepath)` - Serve single file found at filepath to the specified path on the server.

### Web sockets

web sockets in Deno are super easy to implement because deno offers a helper method for upgrading a HTTP request to a websocket connection. On the frontend, you use web standards to interact with web sockets.

The method to use is `Deno.upgradeWebSocket(req)` which takes in a web standard `Request` and returns an object of two important pieces of data: the websocket instance and the response.

```ts
const { socket, response } = Deno.upgradeWebSocket(request);
```

You then use the socket for messaging, and you'll return the response in your HTTP handler to handle the websocket upgrade request accordingly.

```ts
app.get("/websocket", (request) => {
  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.onopen = () => {
	console.log("CONNECTED");
  };
  socket.onmessage = (event) => {
	console.log(`RECEIVED: ${event.data}`);
	socket.send("pong");
  };
  socket.onclose = () => console.log("DISCONNECTED");
  socket.onerror = (error) => console.error("ERROR:", error);

  return response;
});
```

```ts
Deno.serve((req) => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.addEventListener("open", () => {
    console.log("a client connected!");
  });

  socket.addEventListener("message", (event) => {
    if (event.data === "ping") {
      socket.send("pong");
    }
  });

  return response;
});
```



### JSX Server Side (Preact)

Here are the steps to setup JSX in Deno using preact

1. Add these settings to the `deno.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "npm:preact"
  }
}
```

You can now create components like so:

```tsx
import { FileManager } from "./FileManager.ts";

const css = await FileManager.readFile(`${import.meta.dirname}/style.css`);

export const HomePage = () => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>{css}</style>
      </head>
      <body>
        <CreateShortlinkPage />
      </body>
    </html>
  );
};
```

You can then render them into an actual HTML string like so:

```ts
import { HomePage } from "./src/index.tsx";
import { Router } from "./src/Router.ts";
import { render } from "npm:preact-render-to-string";
const app = new Router();

app.get("/", () => {
  // 1. convert JSX to html string
  const html = render(HomePage());
  // 2. return plain text HTML response
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    },
  });
});
```

Here is an example of a component accepting children props, where you have to use the `ComponentChildren` typing to type annotate the `children` prop appropriately.


```tsx
import { ComponentChildren } from "npm:preact";

const Layout = (props: { children: ComponentChildren }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>{css}</style>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/links">Your Links</a>
        </nav>
        {props.children}
      </body>
    </html>
  );
};
```

#### pre-compiled jSX

When using preact, you can get a 7-20x speed up boost in SSR by just adding this to your `deno.json`:

```json
{
    "compilerOptions": {
     "jsx": "precompile",
      "jsxImportSource": "preact"
    },
    "imports": {
      "preact": "npm:preact"
    }
  }

```

### Deno OAuth

#### Main flow

To successfully implement user data with OAuth, this type of data strategy is required. 

First, you must create a `"sessions"` table that stores temporary session IDs. Each key will point to a specific `userId` that represents the logged in user, such as an email or a username.

Since during the OAuth flow, we only get access to the `sessionId`, we need to store it temporarily in a table and have it point to the `userId`, and then create a permanent `"users"` table that stores user data under the `userId` key.

Once the user logs out, we grab hold of the current `sessionId` and delete it from the `"sessions"` table.`

Here is an example of the basic data flow:

- Store key `["sessions", "mySessionId"]` with value of the user ID, like `waadlingbruh@gmail.com`.
- Store key  `["users", "waadlingbruh@gmail.com"]` with value of the user data.

Then whenever you need to access the user data, you can just fetch the current session ID, query that key from the `"sessions"` table which gives you the user ID, and query that key from the `"users"` table to get the user data. 


**complete flow**

1. On the redirect URI OAuth path you specify, have a route handler that stores the `sessionId` in its own table and the user data in its own table.
2. On every route, call the helper `getSessionId()` in your middleware to get access to the `sessionId`, and from that session ID, fetch the user data. 
3. On the logout route, make sure to delete the current session ID from the `"sessions"` table in order to free up space, since that session ID will not be used anymore.

#### Github

To set up github OAuth, first follow these setup instructions:

1. Go to your github **settings**, then to **developer settings**, and then click on **new github app**. Or just go [here](https://github.com/settings/apps)
2. Register your redirect URI as `http://localhost:8000/oauth/callback`
3. Copy your github client id and github secret.

Then you want to store `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `REDIRECT_URI` as environment variables that your app can use at runtime.


> [!IMPORTANT] 
>  And yes, they MUST BE NAMED LIKE THAT, since the Deno OAuth code looks for those environment variables at runtime.

```ts
import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
import { pick } from "jsr:@std/collections/pick";
import { createGoogleOAuthConfig } from "jsr:@deno/kv-oauth";

interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export class GitHubOAuth {
  #redirectUriPath: string;
  private oauthConfig: ReturnType<typeof createGitHubOAuthConfig>;
  constructor(redirectUri: string) {
    // reads the GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from the environment variables to create OAuth config
    this.oauthConfig = createGitHubOAuthConfig({
      redirectUri,
    });
    this.#redirectUriPath = new URL(redirectUri).pathname;
    // helpers for handling OAuth flow
  }

  public get redirectUriPath() {
    return this.#redirectUriPath;
  }

  public async getSessionId(req: Request) {
    const { getSessionId } = createHelpers(this.oauthConfig);
    return await getSessionId(req);
  }

  /** 
  gets the session id of the currently logged in user, undefined otherwise.
  store this in your database.
  */

  private async getGitHubProfile(accessToken: string) {
    const response = await fetch("https://api.github.com/user", {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      response.body?.cancel();
      throw new Error("Failed to fetch GitHub user");
    }

    return response.json() as Promise<GitHubUser>;
  }

  /**this method should be the handler for the /oauth/callback route.
  `cb` is called with the sessionId and the user data.
  This is where you should store the user data in your database 
  */
  async onGithubCallback(
    req: Request,
    cb: (sessionId: string, user: GitHubUser) => void
  ) {
    const { handleCallback } = createHelpers(this.oauthConfig);
    const { response, tokens, sessionId } = await handleCallback(req);
    const userData = await this.getGitHubProfile(tokens?.accessToken);
    const filteredData = pick(userData, ["avatar_url", "html_url", "login"]);
    cb(sessionId, filteredData);
    return response;
  }

  /**this method should be the handler for the /oauth/signin route and
  it redirects the user to the GitHub OAuth page
  */
  signIn(req: Request) {
    const { signIn } = createHelpers(this.oauthConfig);
    return signIn(req);
  }

  /**  this method should be the handler for the /oauth/signout route.
   * It redirects the user to the GitHub OAuth page
   */
  signOut(req: Request) {
    const { signOut } = createHelpers(this.oauthConfig);
    return signOut(req);
  }
}

export const githubAuth = new GitHubOAuth(Deno.env.get("REDIRECT_URI")!);
```

You would first define the routes that deal with github OAuth:

- **login route**: Execute the `signIn(req)` handler, which returns a `Response`
- **logout route**: Execute the `signOut(req)` handler, which returns a `Response`
- **callback route**: This should be the route that you define within any OAuth app settings, the *redirect uri*. We use the `onGithubCallback(req, cb)` handler, which gets access to the logged in user data in a callback. This is a perfect opportunity to store the user info in a database. 

```ts
import { githubAuth } from "./src/DenoOAuth.ts";

// on sign in route, execute the signIn handler
app.get("/oauth/github/signin", async (req) => {
  return await githubAuth.signIn(req);
});

// on sign out route, execute the signOut handler
app.get("/oauth/github/signout", async (req) => {
  return await githubAuth.signOut(req);
});

// on callback route, access login info and store in database
app.get("/oauth/github/callback", async (req: Request) => {
  return await githubAuth.onGithubCallback(
    req,
    async (sessionId, userData) => {
      await storeUser(sessionId, userData);
    }
  );
});
```
#### Google

The Google OAuth process is pretty much the exact same as the github one by design.

```ts
import { pick } from "jsr:@std/collections/pick";
import { createGoogleOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";


export interface GoogleUser {
  id: string;
  name: string;
  picture: string;
  email?: string; // only gets populated if requesting email scope
}

export class GoogleOAuth {
  #redirectUriPath: string;
  private oauthConfig: ReturnType<typeof createGoogleOAuthConfig>;

  constructor(redirectUri: string, scope: "email" | null = null) {
    const extraScopes = scope
      ? ["https://www.googleapis.com/auth/userinfo.email"]
      : [];
    this.oauthConfig = createGoogleOAuthConfig({
      redirectUri,
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        ...extraScopes,
      ],
    });
    this.#redirectUriPath = new URL(redirectUri).pathname;
  }

  public get redirectUriPath() {
    return this.#redirectUriPath;
  }

  private async getGoogleProfile(accessToken: string) {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      response.body?.cancel();
      throw new Error("Failed to fetch Google user");
    }
    const data = await response.json();
    console.log(data);
    return data as Promise<GoogleUser>;
  }

  /**this method should be the handler for the /oauth/signin route and
  it redirects the user to the GitHub OAuth page
  */
  signIn(req: Request) {
    const { signIn } = createHelpers(this.oauthConfig);
    return signIn(req);
  }

  /**  this method should be the handler for the /oauth/signout route.
   * It redirects the user to the GitHub OAuth page
   */
  signOut(req: Request) {
    const { signOut } = createHelpers(this.oauthConfig);
    return signOut(req);
  }

  async getSessionId(req: Request) {
    const { getSessionId } = createHelpers(this.oauthConfig);
    return await getSessionId(req);
  }

  /**this method should be the handler for the /oauth/callback route.
  `cb` is called with the sessionId and the user data.
  This is where you should store the user data in your database 
  */
  async onGoogleCallback(
    req: Request,
    cb: (sessionId: string, user: GoogleUser) => void
  ) {
    const { handleCallback } = createHelpers(this.oauthConfig);
    const { response, tokens, sessionId } = await handleCallback(req);
    const userData = await this.getGoogleProfile(tokens?.accessToken);
    const filteredData = pick(userData, ["id", "name", "picture", "email"]);
    cb(sessionId, filteredData);
    return response;
  }
}

export const googleAuth = new GoogleOAuth(Deno.env.get("REDIRECT_URI_GOOGLE")!);
```

And here is how you would adapt your server to handle the OAuth login flow:

```ts
// login handler
app.get("/oauth/google/signin", async (req) => {
  return await googleAuth.signIn(req);
});

// logout handler
app.get("/oauth/google/signout", async (req) => {
	// delete current sessionId from database
  return await googleAuth.signOut(req);
});

// redirect uri handler
app.get(googleAuth.redirectUriPath, async (req: Request) => {
  const response = await googleAuth.onGoogleCallback(
    req,
    async (sessionId, userData) => {
      await storeUser(sessionId, userData);
    }
  );
  return response;
});
```
## Miscellaneous

### Deno Crypto

This is a utility class to hash text and get in back in either hex or base64 format.

```ts
import { encodeBase64Url, encodeHex } from "jsr:@std/encoding";
import { crypto, DigestAlgorithm } from "jsr:@std/crypto/crypto";

export class CryptoUtils {
  private static async getHash(
    str: string,
    algorithm: DigestAlgorithm,
    format: "hex" | "base64" = "hex"
  ) {
    const stringData = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest(algorithm, stringData);
    const hashArray = new Uint8Array(hash);
    return format === "hex" ? encodeHex(hashArray) : encodeBase64Url(hashArray);
  }

  static sha256(str: string, format: "hex" | "base64" = "hex") {
    return this.getHash(str, "SHA-256", format);
  }

  static decodeFromBase64(str: string) {
    return atob(str);
  }

  static encodeToBase64(str: string) {
    return btoa(str);
  }

  static uuid() {
    return crypto.randomUUID();
  }
}
```

- `btoa()`: decodes from base 64
- `atob()`: encodes to base 64
- `crypto.randomUUID()`: returns a random string uuid v4.

### Deno Assertions

Assertions are great for clean code and debugging.

```ts
import { assert, assertEquals } from "@std/assert";

assert("I am truthy"); // Doesn't throw
assert(false); // Throws `AssertionError`
assertEquals(2, 2)
```

- `assert(boolean)`: asserts that the given boolean is true
- `assertEquals(val1, val2)`: asserts that both of the values are deeply equal
- `assertExists(val)`: asserts that the passed in arg is not null or undefined.
- `assertFalse(val)`: asserts that the passed in arg is a falsy value

### Deno Streams

The `@std/streams` library offers utility methods for converting `ReadableStreams` into different data objects.

```ts
import { toText } from "@std/streams";
import { assertEquals } from "@std/assert";

const stream = ReadableStream.from(["Hello, world!"]);
const text = await toText(stream);

assertEquals(text, "Hello, world!");
```

Here is a class:

```ts
import { toText, toArrayBuffer, toBlob, toJson } from "@std/streams";

export class DenoReadableStreamManager {
  constructor(public stream: ReadableStream) {}
  toText = () => toText(this.stream);
  toArrayBuffer = () => toArrayBuffer(this.stream);
  toBlob = () => toBlob(this.stream);
  toJson = () => toJson(this.stream);
}
```

### Deno helpers

#### Delaying

```ts
import { delay } from "@std/async/delay";

await delay(100); // waits for 100 milliseconds
```

#### Debouncing

```ts
import { debounce } from "@std/async/debounce";

const log = debounce(
  (event: Deno.FsEvent) =>
    console.log("[%s] %s", event.kind, event.paths[0]),
  200,
);

for await (const event of Deno.watchFs("./")) {
  log(event);
}
```

#### Retrying

```ts
import { retry } from "@std/async/retry";
const req = async () => {
 // some function that throws sometimes
};

// Below resolves to the first non-error result of `req`
const retryPromise = await retry(req, {
 multiplier: 2,
 maxTimeout: 60000,
 maxAttempts: 5,
 minTimeout: 100,
 jitter: 1,
});
```

#### `pooledMap()`

pooledMap transforms values from an (async) iterable into another async iterable. The transforms are done concurrently, with a max concurrency defined by the poolLimit.

```ts
pooledMap<T, R>(
	poolLimit: number,
	array: Iterable<T> | AsyncIterable<T>,
	iteratorFn: (data: T) => Promise<R>
): AsyncIterableIterator<R>
```

```ts
import { pooledMap } from "@std/async/pool";
import { assertEquals } from "@std/assert";

const results = pooledMap(
  2,
  [1, 2, 3],
  (i) => new Promise((r) => setTimeout(() => r(i), 1000)),
);

assertEquals(await Array.fromAsync(results), [1, 2, 3]);

```

### Deno cache

The `@std/cache` library offers useful utilities for in-memory caching

```bash
deno add jsr:@std/cache
```

- `LruCache`: a class implementing a LRU cache

```ts
import { memoize, LruCache, type MemoizationCacheResult } from "@std/cache";
import { assertEquals } from "@std/assert";

const cache = new LruCache<string, MemoizationCacheResult<bigint>>(1000);

// fibonacci function, which is very slow for n > ~30 if not memoized
const fib = memoize((n: bigint): bigint => {
  return n <= 2n ? 1n : fib(n - 1n) + fib(n - 2n);
}, { cache });

assertEquals(fib(100n), 354224848179261915075n);
```

### Deno tar

```ts
import { UntarStream } from "@std/tar/untar-stream";
import { dirname, normalize } from "@std/path";

for await (
  const entry of (await Deno.open("./out.tar.gz"))
    .readable
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeThrough(new UntarStream())
) {
  const path = normalize(entry.path);
  await Deno.mkdir(dirname(path), { recursive: true });
  await entry.readable?.pipeTo((await Deno.create(path)).writable);
}

```

### Deno yaml

```ts
import { parse, stringify } from "@std/yaml";
import { assertEquals } from "@std/assert";

const data = parse(`
foo: bar
baz:
  - qux
  - quux
`);
assertEquals(data, { foo: "bar", baz: [ "qux", "quux" ] });

const yaml = stringify({ foo: "bar", baz: ["qux", "quux"] });
assertEquals(yaml, `foo: bar
baz:
  - qux
  - quux
`);

```

###  Deno encoding

```bash
deno add jsr:@std/encoding
```

```ts
import {
  encodeHex,
  encodeBase32,
  encodeBase58,
  encodeBase64,
  encodeAscii85,
  decodeHex,
  decodeBase32,
  decodeBase58,
  decodeBase64,
  decodeAscii85,
} from "@std/encoding";
import { assertEquals } from "@std/assert";

// Many different encodings for different character sets
assertEquals(encodeHex("Hello world!"), "48656c6c6f20776f726c6421");
assertEquals(encodeBase32("Hello world!"), "JBSWY3DPEB3W64TMMQQQ====");
assertEquals(encodeBase58("Hello world!"), "2NEpo7TZRhna7vSvL");
assertEquals(encodeBase64("Hello world!"), "SGVsbG8gd29ybGQh");
assertEquals(encodeAscii85("Hello world!"), "87cURD]j7BEbo80");

// Decoding
assertEquals(new TextDecoder().decode(decodeHex("48656c6c6f20776f726c6421")), "Hello world!");
assertEquals(new TextDecoder().decode(decodeBase32("JBSWY3DPEB3W64TMMQQQ====")), "Hello world!");
assertEquals(new TextDecoder().decode(decodeBase58("2NEpo7TZRhna7vSvL")), "Hello world!");
assertEquals(new TextDecoder().decode(decodeBase64("SGVsbG8gd29ybGQh")), "Hello world!");
assertEquals(new TextDecoder().decode(decodeAscii85("87cURD]j7BEbo80")), "Hello world!");

```

```ts
import { encodeBase64, encodeBase64Url } from "@std/encoding";
import { assertEquals } from "@std/assert";

assertEquals(encodeBase64("ice creams"), "aWNlIGNyZWFtcw=="); // Not url-safe because of `=`
assertEquals(encodeBase64Url("ice creams"), "aWNlIGNyZWFtcw"); // URL-safe!

// Base64Url replaces + with - and / with _
assertEquals(encodeBase64("subjects?"), "c3ViamVjdHM/"); // slash is not URL-safe
assertEquals(encodeBase64Url("subjects?"), "c3ViamVjdHM_"); // _ is URL-safe

```

```ts
import { encodeHex, encodeBase64 } from "@std/encoding";
import { assertEquals } from "@std/assert";

// Working with binary data
const binaryData = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]);
assertEquals(encodeHex(binaryData), "deadbeef");
assertEquals(encodeBase64(binaryData), "3q2+7w==");

```

### Deno media types

The `@std/media-types` library is used to translate from content type HTTP headers to file format extensions and vice-versa

```bash
deno add jsr:@std/media-types
```


#### 1. `contentType(typeOrExtension)`

Resolves a full `Content-Type` header value from a given extension or media type. If the type is text-based, it automatically appends the appropriate default charset (like `; charset=UTF-8`).


```ts
import { contentType } from "@std/media-types";

// Lookup by file extension (with or without the leading dot)
console.log(contentType(".json")); // "application/json; charset=UTF-8"
console.log(contentType("html"));   // "text/html; charset=UTF-8"

// Lookup by generic media type to get the full header value
console.log(contentType("text/plain")); // "text/plain; charset=UTF-8"

// Returns undefined if the type or extension isn't recognized
console.log(contentType(".unknown-extension")); // undefined
```

#### 2. `allExtensions(mediaType)`

Returns all known file extensions associated with a specific media type. This is incredibly helpful when a single MIME type could map to multiple valid extensions.


```ts
import { allExtensions } from "@std/media-types";

// Get extensions for standard formats
console.log(allExtensions("application/json")); 
// Output: ["json", "map"]

console.log(allExtensions("text/markdown")); 
// Output: ["md", "markdown", "mkd", "mkdn", "mdwn"]

console.log(allExtensions("image/jpeg")); 
// Output: ["jpeg", "jpg", "jpe"]
```

#### 3. `getCharset(mediaType)`

Extracts or determines the default character set (charset) for a given media type string.


```ts
import { getCharset } from "@std/media-types";

console.log(getCharset("text/plain"));                 // "UTF-8"
console.log(getCharset("application/json"));           // "UTF-8"
console.log(getCharset("text/html; charset=iso-8859-1")); // "ISO-8859-1"
```

#### 4. `extension(mediaType)`

If you only need the **most common or preferred** file extension for a given media type, use `extension()`.


```ts
import { extension } from "@std/media-types";

console.log(extension("text/markdown")); // "md"
console.log(extension("image/jpeg"));     // "jpeg"
```

#### 5. `parseMediaType(mediaTypeString)`

Parses a full media type header string (like a `Content-Type` header) into its base type and its parameters.


```ts
import { parseMediaType } from "@std/media-types";

const header = "text/html; charset=utf-8; boundary=something";
const [type, params] = parseMediaType(header);

console.log(type);   // "text/html"
console.log(params); // { charset: "utf-8", boundary: "something" }
```

#### 6. `formatMediaType(type, params)`

The inverse of `parseMediaType`. This function takes a base media type and an object of parameters, serializing them into a single valid format header string.


```ts
import { formatMediaType } from "@std/media-types";

const mediaTypeString = formatMediaType("multipart/form-data", {
  boundary: "----WebKitFormBoundary12345"
});

console.log(mediaTypeString); 
// Output: "multipart/form-data; boundary=----WebKitFormBoundary12345"
```

#### Real-World Example: Building a Basic File Server

Below is an operational example of how you can use `@std/media-types` alongside standard web APIs to safely serve local files with accurate `Content-Type` headers.


```ts
import { contentType } from "@std/media-types";
import { extname } from "@std/path"; // Optional helper for extension extraction

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let filepath = "." + url.pathname;

  // Default to index.html if pointing to a directory
  if (filepath.endsWith("/")) {
    filepath += "index.html";
  }

  try {
    const fileBytes = await Deno.readFile(filepath);
    
    // 1. Get the extension (e.g., ".png", ".html")
    const ext = extname(filepath); 
    
    // 2. Resolve the full content type header using @std/media-types
    const mimeType = contentType(ext) || "application/octet-stream";

    return new Response(fileBytes, {
      status: 200,
      headers: { "content-type": mimeType },
    });
  } catch {
    return new Response("404 Not Found", { status: 404 });
  }
}

// Start a Deno server
Deno.serve(handleRequest);
```
### `@std/fmt`

#### human readable bytes

Use the `format(num)` function from the `@std/fmt/bytes` package to format a file size number into a human-readable file size

```ts
import { format } from "@std/fmt/bytes";
import { red } from "@std/fmt/colors";

console.log(red(format(1337))); // Prints "1.34 kB"
```

#### colors

You can print out colors to the console using the `@std/fmt/colors` package


```ts
import { format } from "@std/fmt/bytes";
import { red } from "@std/fmt/colors";

console.log(red(format(1337))); // Prints "1.34 kB"
```

#### human readable duration

Use the `format(num)` function from the `@std/fmt/duration` package to format a number in milliseconds to a human-readable duration


```ts
import { format } from "@std/fmt/duration";
import { assertEquals } from "@std/assert";

assertEquals(format(99674, { style: "digital" }), "00:00:01:39:674:000:000");

assertEquals(format(99674), "0d 0h 1m 39s 674ms 0µs 0ns");

assertEquals(format(99674, { ignoreZero: true }), "1m 39s 674ms");

assertEquals(format(99674, { style: "full", ignoreZero: true }), "1 minute, 39 seconds, 674 milliseconds");

```


## Storage in Deno

### LocalStorage + SessionStorage

Deno adapted web APIs like local storage and session storage from the web to the server-side.

- **local storage**: Persistent data storage that lasts across reruns of the application. Ideal for preferences or user data.
- **session storage**: Data storage that only lasts as long as the application is active. Ideal for storage session-related items like user session Ids, carts, etc.

### Deno KV

Deno KV is an object-based key-value storage that is blazingly fast, works on the cloud with Deno Deploy, but has size limitations with each item.

- **Key Size:** Maximum length of 2048 bytes after serialization. 
- **Value Size:** Maximum length of 64 KiB after serialization

#### Basic

In Deno KV, keys are arrays of strings and values can be anything less than 64KB per each unique key. All methods are asynchronous.

You can create a deno KV instance like so:

```ts
const kv = await Deno.openKv();
```

Here are the methods you have:

- `kv.set<T>(key: string[], value: any)`: asynchronously sets data under the specified key
- `kv.get<T>(key: string[])`: asynchronously gets data from the specified key
- `kv.delete<T>(key: string[])`: asynchronously deletes data from the specified key

Any here is a basic class that lets you get autocomplete for types:

```ts
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

abstract class AtomicOperation {
  abstract key: string[];
  abstract value: unknown;
  abstract type: "check" | "set" | "delete";

  abstract execute(res: Deno.AtomicOperation): Deno.AtomicOperation;
}

class AtomicSetOperation extends AtomicOperation {
  override type: "check" | "set" | "delete" = "set";
  constructor(public key: string[], public value: unknown) {
    super();
  }

  override execute(res: Deno.AtomicOperation): Deno.AtomicOperation {
    return res.set(this.key, this.value);
  }
}

class AtomicDeleteOperation extends AtomicOperation {
  override type: "check" | "set" | "delete" = "delete";
  override value: unknown = null;
  constructor(public key: string[]) {
    super();
  }

  override execute(res: Deno.AtomicOperation): Deno.AtomicOperation {
    return res.delete(this.key);
  }
}

class AtomicCheckOperation extends AtomicOperation {
  override type: "check" | "set" | "delete" = "delete";
  override value: unknown = null;
  constructor(public key: string[], public versionstamp: string | null) {
    super();
  }

  override execute(res: Deno.AtomicOperation): Deno.AtomicOperation {
    return res.check({
      key: this.key,
      versionstamp: this.versionstamp,
    });
  }
}

class AtomicNotExistCheckOperation extends AtomicCheckOperation {
  constructor(key: string[]) {
    super(key, null);
  }

  override execute(res: Deno.AtomicOperation): Deno.AtomicOperation {
    return res.check({
      key: this.key,
      versionstamp: this.versionstamp,
    });
  }
}

export class KVDB {
  constructor(private kv: Deno.Kv) {}
  static async init(path?: string) {
    const kv = await Deno.openKv(path);
    return new KVDB(kv);
  }

  async set<T>(key: string[], value: T) {
    const response = await this.kv.set(key, value);
    if (!response.ok) {
      throw new DatabaseError(`Error setting value ${value} for key ${key}`);
    }
  }

  async upsert<T>(key: string[], value: T) {
    const res = await this.kv
      .atomic()
      .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
      .set(key, value)
      .commit();
    if (!res.ok) {
      throw new DatabaseError(`Error setting value ${value} for key ${key}`);
    }
  }

  async get<T>(key: string[]) {
    return await this.kv.get<T>(key);
  }

  async getMany<T extends readonly unknown[]>(keys: string[][]) {
    return await this.kv.getMany<T>(
      keys as readonly [...{ [K in keyof T]: Deno.KvKey }]
    );
  }

  async atomic(actions: AtomicOperation[]) {
    let res = this.kv.atomic();
    for (const action of actions) {
      res = action.execute(res);
    }
    const response = await res.commit();
    if (!response.ok) {
      throw new DatabaseError(`Error committing atomic operation`);
    }
    return response;
  }

  async delete(key: string[]) {
    await this.kv.delete(key);
  }

  getTable<KeyType extends string[], ValueType>(keyPrefix: string[]) {
    return new KVDBTable<KeyType, ValueType>(this.kv, keyPrefix);
  }

  close() {
    this.kv.close();
  }
}

export class KVDBTable<KeyType extends string[], ValueType> {
  constructor(private kv: Deno.Kv, private keyPrefix: string[]) {}

  private getKey(key: KeyType) {
    return [...this.keyPrefix, ...key];
  }

  async getAll() {
    const list = this.kv.list<ValueType>({
      prefix: this.keyPrefix,
    });
    const data = await Array.fromAsync(list);
    return data.map((item) => item);
  }

  async getAllKeys() {
    const list = this.kv.list<ValueType>({
      prefix: this.keyPrefix,
    });
    const data = await Array.fromAsync(list);
    return data.map((item) => item.key);
  }

  async getMany(keys: KeyType[]) {
    const res = await this.kv.getMany(keys.map((key) => this.getKey(key)));
    const data = await Array.fromAsync(res.values());
    return data.map((item) => item.value) as unknown as ValueType[];
  }

  async set(key: KeyType, value: ValueType) {
    await this.kv.set([...this.keyPrefix, ...key], value);
  }

  async upsert<T>(key: KeyType, value: ValueType) {
    const res = await this.kv
      .atomic()
      .check({ key, versionstamp: null }) // `null` versionstamps mean 'no value'
      .set(key, value)
      .commit();
    if (!res.ok) {
      throw new DatabaseError(`Error setting value ${value} for key ${key}`);
    }
  }

  async get(key: KeyType) {
    return await this.kv.get<ValueType>([...this.keyPrefix, ...key]);
  }

  async delete(key: KeyType) {
    await this.kv.delete([...this.keyPrefix, ...key]);
  }

  async deleteTable() {
    const list = this.kv.list<ValueType>({
      prefix: this.keyPrefix,
    });
    for await (const item of list) {
      await this.kv.delete(item.key);
    }
  }

  produceSetAction(key: KeyType, value: ValueType) {
    return new AtomicSetOperation([...this.keyPrefix, ...key], value);
  }

  produceDeleteAction(key: KeyType) {
    return new AtomicDeleteOperation([...this.keyPrefix, ...key]);
  }

  produceCheckAction(key: KeyType, versionstamp?: string) {
    if (versionstamp) {
      return new AtomicCheckOperation(
        [...this.keyPrefix, ...key],
        versionstamp
      );
    } else {
      return new AtomicNotExistCheckOperation([...this.keyPrefix, ...key]);
    }
  }
}
```

You use this class to create tables, which gives you complete type safety over your database logic.


#### Querying based on multiple keys

The `kv.getMany<T>(keys: string[])` method returns all the database values fetched from the multiple keys all at once in an array of results.

```ts
async function getMany<T>() {
	const resultsArr = await kv.getMany<T>([
		["users", "sharon"],
		["users", "dill"]
	])
	return resultsArr.map(result => result.value)
}
```

The `kv.list()` method is a way to get all values corresponding to all keys starting with a specific key prefix, which is great for modeling relational data without explicitly defining links. 

- This method returns an async generator which you can loop over or immediately get back all results by converting it to an array with the `Array.fromAsync(asyncGenerator)` method.
- A call to `kv.list({prefix: ["users"]})` would fetch all records with the first element in their key array being `"users"`.

```ts
async getAll<T>(keyPrefix: string[]) {
    const list = await this.kv.list<T>({
      prefix: keyPrefix,
    });
    const data = await Array.fromAsync(list);
    return data;
  }
```

#### Transactions

In Deno KV, you can make atomic transactions that fail if one of the actions fail, and succeeds only if all the actions succeed.

Here are some basic atomic operations you can perform:

- **set operations**: modifying data
- **delete operations**: deleting data
- **check operations**: checking the versionTimestamp of some data, either to check if the data already exists or if its version timestamp was corrupted.

```ts
  const res = await kv.atomic()
    .set(["shortlinks", "123456"], {
	    longUrl: "https://youtube.com"
	})
    .set(["brandon", "123456"], "123456")
    .commit()
```

```ts
  async function atomic(actions: { key: string[]; value: unknown }[]) {
    let res = kv.atomic();
    for (const action of actions) {
      res = res.set(action.key, action.value);
    }
    const response = await res.commit();
    if (!response.ok) {
      throw new DatabaseError(`Error committing atomic operation`);
    }
  }
```

#### Realtime Updates

You can watch for a key in deno kv by using the `db.watch()` method like so, which returns a readable stream.

```ts
const stream = db.watch([["list_updated", listId]]).getReader();
```

You can then pair this with server sent events to make the frontend get realtime updates from the server:

```ts
app.get("/realtime/:id", (_req, _info, params) => {
  const shortCode = params?.pathname.groups["id"];
  
  // Setup KV watch reader
  const shortLinkKey = ["shortlinks", shortCode];
  const shortLinkStream = kv.watch([shortLinkKey]).getReader();

  // Create stream response body
  const body = new ReadableStream({
    async start(controller) {
      // Fetch initial data if needed
      // const initialData = await getShortLink(shortCode);
      // controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ clickCount: initialData.clickCount })}\n\n`));

      while (true) {
        const { done } = await stream.read();
        if (done) {
          return;
        }
        const shortLink = await getShortLink(shortCode);
        const clickAnalytics = shortLink.clickCount > 0 &&
          await getClickEvent(shortCode, shortLink.clickCount);

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${
              JSON.stringify({
                clickCount: shortLink.clickCount,
                clickAnalytics,
              })
            }\n\n`,
          ),
        );
        console.log("Stream updated");
      }
    },
    cancel() {
      stream.cancel();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
```