# Deno Standard Library

## Working with files

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

### Base 64

- `btoa()`: decodes from base 64
- `atob()`: encodes to base 64

### Command line stuff

#### Command Line Arguments

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

#### Text Colors

You can easily print text colors in the shell with the deno colors library:

```ts
import { bgGreen, bgRed, yellow } from "jsr:@std/internal@^1.0.5/styles";

console.log(yellow("this text is yellow"));
console.log(bgRed("this text has a red background"));
```

#### `confirm()` and `prompt()`

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


Copy

```ts
import { Router } from "./router.ts"; 
const router = new Router(); 

router.get("/", (req) => {   return new Response("Hello World!"); }); router.post("/users", async (req) => {   
	const user = await req.json();  
	return router.json({ success: true, userId: 123 }); 
});
router.initServer();
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

```ts filename="types.d.ts"
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
## Deno Crypto

This is a utility class to hash text and get in back in either hex or base64 format.

```ts
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
}
```

## Deno KV

Deno KV is an object-based key-value storage that is blazingly fast, works on the cloud with Deno Deploy, but has size limitations with each item.

- **Key Size:** Maximum length of 2048 bytes after serialization. 
- **Value Size:** Maximum length of 64 KiB after serialization