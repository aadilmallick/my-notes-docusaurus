# Deno Standard Library

## Working with files

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

### Text Colors

You can easily print text colors in the shell with the deno colors library:

```ts
import { bgGreen, bgRed, yellow } from "jsr:@std/internal@^1.0.5/styles";

console.log(yellow("this text is yellow"));
console.log(bgRed("this text has a red background"));
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

## Server-side

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

### JSX Server Side

Here are the steps to setup JSX in Deno:

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
