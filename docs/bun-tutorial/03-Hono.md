# 03: Hono

## Sample app

Hono is a great stand-in for express when using Bun. To get started, run `bun install hono`

A sample app looks like this:

1. Write this code. Yes, you need the `export default app` to work.

```typescript title="index.ts"
import { Hono } from "hono";
import { serveStatic } from "hono/bun";

// 1. create app
const app = new Hono();

// 2. Serve any static files
app.use(
  "*",
  serveStatic({
    root: "./dist",
  })
);

app.get("*", (c) => c.html("./dist/index.html"));

export default app;
```

2. Add the script to run the app to the `package.json`

```json title="package.json"
{
  "scripts": {
    "dev": "bun run --hot index.ts"
  }
}
```

## Basics

### Basic Routing

Create a new routing instance by instantiating the `Hono` class. The top level hono instance of your server is usually called `app`, and all hono instances have these routing methods:

- `app.get(route, (c) => {})` : GET route
- `app.post(route, (c) => {})` : POST route
- `app.put(route, (c) => {})` : PUT route
- `app.delete(route, (c) => {})` : DELETE route
- `app.all(route, (c) => {})` : route that catches all requests to that route, no matter which HTTP verb

You should also export default the top level file/routing instance you have, or some other object - but we'll get to that later.

You can even catch multiple methods or paths.

```ts
// Multiple Method
app.on(["PUT", "DELETE"], "/post", (c) => c.text("PUT or DELETE /post"));

// Multiple Paths
app.on("GET", ["/hello", "/ja/hello", "/en/hello"], (c) => c.text("Hello"));
```

#### Path parameters

Use `:` before some text to make that text a path parameter variable.

```ts
app.get("/user/:name", (c) => {
  const name = c.req.param("name");
  //...
});
```

```ts
app.get("/posts/:id/comment/:comment_id", (c) => {
  const { id, comment_id } = c.req.param();
  //...
});
```

You can even make your path parameters optional by suffixing the path parameter variable name with a `?`.

```ts
// Will match `/api/animal` and `/api/animal/:type`
app.get("/api/animal/:type?", (c) => c.text("Animal!"));
```

### Context object

The `c` object is the context object, and you can get access to the request and response of the server route through `c.request` and `c.response` respectively, which are both web standard `Request` and `Response` classes from browser JavaScript.

- `c.header(key: string, value: string)`: sets a response header.
- `c.status(code: number)`: sets the response status code
- `c.text(text: string)`: returns a plaintext response
- `c.json(obj)`: returns a json response
- `c.html(content: string)`: returns an HTML response, which is a text/html response
- `c.notFound()` : returns a not found 404 response
- `c.redirect(route)` : redirects to the specified route
- `c.error` : any error that a middleware handler throws

Instead of returning something using the context object, you can also return a web standard `Response` instance, like so:

```ts
app.get("/", (c) => {
  return new Response("Thank you for coming", {
    status: 201,
    headers: {
      "X-Message": "Hello!",
      "Content-Type": "text/plain",
    },
  });
});
```

#### `c.req`

The `c.req` property is a `HonoRequest` instance, which is a wrapper around the `Request` web standard class.

**getting info**

- `c.req.param(routeParamName)`: gets the value of the specified route parameter
- `c.req.param()`: returns all the route parameters as an object (key-value pairs).
- `c.req.query(queryParamName)`: gets the value of the specified query parameter
- `c.req.query()` : returns all the query parameters as an object (key-value pairs).
- `c.req.header(headerKey)`: returns the value of the specified request header
- `c.req.routePath`: returns the route string of the request, like `/people/:name`
- `c.req.path`: returns the path of the request, like `/people/happyfatboy`
- `c.req.url` : returns the full URL of the request
- `c.req.raw`: returns the `Request` instance that makes up this request

**body parsing**

- `c.req.parseBody()`: an async method that parses the request body and returns it if request content type is `multipart/formdata` or `application/x-www-urlencoded`.
- `c.req.text()`: as async method that parses the request body and returns it for plaintext requests
- `c.req.json()`: as async method that parses the request body and returns it for JSON requests
- `c.req.arrayBuffer()`: as async method that parses the request body and returns it as an array buffer
- `c.req.blob()`: as async method that parses the request body and returns it as a blob
  **example**

```ts
app.get("/", (c) => {
  const userAgent = c.req.header("User-Agent");
  const body = await c.req.parseBody();
  return c.json({ path: c.req.routePath });
});
```

#### Passing around data

You can pass around data like locals in express with the `c.set(key, value)` and the `c.get(key)` methods, but this requires middleware since these values expire when the request chain ends with a server response.

```ts
app.use(async (c, next) => {
  // set local
  c.set("message", "Hono is cool!!");
  // go to next middleware in middleware chain
  await next();
});

app.get("/", (c) => {
  // get local
  const message = c.get("message");
  return c.text(`The message is "${message}"`);
});
```

And you can add type safety like so:

```typescript
type Variables = {
  message: string;
};

const app = new Hono<{ Variables: Variables }>();
```

### Routers

You have the routers concept as you have in express.

1. Create a router by creating a new hono instance and export default that.

```ts title="routes/apiRouter.ts"
import { Hono } from "hono";

const apiRouter = new Hono();

apiRouter.get("/ping", (c) => {
  return c.json({ message: "pinged api successfully" });
});

export default apiRouter;
```

2. Use the `app.route(route, router)` method to connect a router to a route prefix.

```ts title="index.ts"
import { Hono } from "hono";
import apiRouter from "./routes/apiRouter";

const app = new Hono();
app.route("/api", apiRouter); // prefix with /api
```

### Other routing

#### 404 pages

Here is how you can customize when a user gets a 404 error

```ts
app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});
```

### Error handling

You can throw `HTTPException` instances, which will go to a custom hono error handler.

Here is how you instantiate an `HTTPException`:

```ts
throw new HTTPException(code, options);
```

- `code`: the status code to throw, like 400.
- `options`: an object of options, with these keys:
  - `message`: a string error message to send
  - `res`: a `Response` instance that carries data about the error

```ts
import { HTTPException } from "hono/http-exception";

app.post("/auth", async (c, next) => {
  // authentication
  if (authorized === false) {
    throw new HTTPException(401, { message: "Custom error message" });
  }
  await next();
});
```

```ts
const errorResponse = new Response("Unauthorized", {
  status: 401,
  headers: {
    Authenticate: 'error="invalid_token"',
  },
});
throw new HTTPException(401, { res: errorResponse });
```

Once you throw an exception, you can catch them by registering a hono error handler. This is how you can set up a basic error handler:

```ts
app.onError((err, c) => {
  console.error(`${err}`);
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse();
  }
  return c.text("Custom Error Message", 500);
});
```

### Middleware

Using the hono instance `app.use()` method, you can use middleware. This is how you create middleware:

```ts
app.use(async (c, next) => {
  // ...
  await next(); // go to next in request chain
});
```

For longer middleware we want to put into separate files, we can use the `createMiddleware()` helper which gives us type intellisense for the `c` and `next` parameters, and then import that into the `app.use()`.

```ts
import { createMiddleware } from "hono/factory";

const logger = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});
```

Here is an example of how to use middleware, where route handlers have a second argument after `c`, which is the async `next()` function.

```ts
app.use(async (_, next) => {
  console.log("middleware 1 start");
  await next();
  console.log("middleware 1 end");
});
app.use(async (_, next) => {
  console.log("middleware 2 start");
  await next();
  console.log("middleware 2 end");
});
app.use(async (_, next) => {
  console.log("middleware 3 start");
  await next();
  console.log("middleware 3 end");
});

app.get("/", (c) => {
  console.log("handler");
  return c.text("Hello!");
});
```

#### Zod Validator Middleware

Validators allow you to validate request bodies coming into routes.

1. `npm i zod`
2. `npm i @hono/zod-validator`
3. `import { zValidator } from '@hono/zod-validator'`
4. Use the `zValidator(type, schema)` function that returns middleware to validate request bodies. Returns error message if not valid

```ts
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// 1. create schema
const schema = z.object({
  name: z.string(),
  age: z.number(),
});

// 2. apply middleware for json body
app.post("/author", zValidator("json", schema), (c) => {
  // 3. get data back if valid
  const data = c.req.valid("json");
  return c.json({
    success: true,
    message: `${data.name} is ${data.age}`,
  });
});
```

The `zValidator(type, schema)` function returns a validation middleware you can apply before returning something in a route. Here is how to use it:

- `type`: The request body type you're validating. Here are the different types:
  - `"json"`: for validating json
  - `"form"` : for validating form data (multipart and url encoded)
  - `"query"`: for validating query parameters
  - `"header"`: for validating headers
  - `"param"`: for validating route parameters
  - `"cookie"` : for validating cookies
- `schema`: A Zod schema to validate against, created using the `z` object.

You can even hook into the error response and provide a custom error response if the validation fails or succeeds.

```ts
app.post(
  "/post",
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.text("Invalid!", 400);
    }
  })
  //...
);
```

### Export default: changing the port

In cases where you want to change the port you listen on (by default it's 3000), then you can change the export default from the hono app instance to an object:

```ts
// instead of export default app
export default {
  port: 3001, // required
  fetch: app.fetch, // required
  maxRequestBodySize: 1024 * 1024 * 200,
};
```

## Helpers

## JSX

1. Change the compiler options in the `tsconfig.json`:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

2. Import the `FC` type from `"hono/jsx"` and rename any ts files you have to tsx files. Type JSX components with the `FC` type, and render JSX with the `c.html()` method.

```tsx
import { Hono } from "hono";
import type { FC, PropsWithChildren } from "hono/jsx";

const apiRouter = new Hono();

// type as props with children
const Layout: FC = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <head>
        <title>wow, what an API</title>
      </head>
      <body
        style={{
          backgroundColor: "lightblue",
        }}
      >
        {children}
      </body>
    </html>
  );
};

// type a prop parameter
const NamePlate: FC<{ name: string }> = ({ name }) => {
  return (
    <div>
      <h1>Hi, my name is {name}</h1>
    </div>
  );
};

// return jsx with c.html()
apiRouter.get("/", (c) => {
  return c.html(
    <Layout>
      <NamePlate name="bruhick" />
    </Layout>
  );
});
```

### Props with children

```tsx
import { PropsWithChildren } from "hono/jsx";

type Post = {
  id: number;
  title: string;
};

function Component({ title, children }: PropsWithChildren<Post>) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
```

### Context

You can use context pretty easily to avoid passing own props.

1. Import the methods

```ts
import { createContext, useContext } from "hono/jsx";
```

2. Create the context with `createContext()`. Pass in an object

```ts
const context = createContext(obj);
```

3. Use the context in a component with `useContext()`

```ts
import type { FC, PropsWithChildren } from "hono/jsx";
import { createContext, useContext } from "hono/jsx";

const apiRouter = new Hono();

// 1. create context
const PersonContext = createContext({
  name: "a goddamn loser",
  age: 20,
});

const Intro: FC = () => {
  const person = useContext(PersonContext);
  return (
    <div>
      <h1>Hi, my name is {person.name}</h1>
      <h2>I am {person.age} years old</h2>
    </div>
  );
};

apiRouter.get("/", (c) => {
  return c.html(<Intro />);
});
```

### Client components

You can also create client components using Hono, which allows you to use the DOM.

```tsx
import { useState } from "hono/jsx";
import { render } from "hono/jsx/dom";

// 1. create component with state
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

function App() {
  return (
    <html>
      <body>
        <Counter />
      </body>
    </html>
  );
}

// render react component in a container
const root = document.getElementById("root");
render(<App />, root);
```

## Testing in hono

Here are the things you need to keep in mind when testing routes in hono:

- import your `app`
- Use the `app.request()` method to request routes

```ts title="routes.test.ts"
import { expect, test, describe } from "bun:test";
import app from "..";

describe("API routes", () => {
  // test going to /api route
  test("GET /api", async () => {
    const res = await app.request("/api");
    expect(res.status).toBe(200);
  });

  // test getting data from /api/ping route
  test("GET /api/ping", async () => {
    const res = await app.request("/api/ping");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ message: "pinged api successfully" });
  });
});
```


## Downloading files

This is how when a user requests this route, you send them a file download:

```ts
apiRouter.get("/README", (c) => {
  // first arg: blob data of file to send
  // second arg: options, headers
  return new Response(Bun.file("README.md"), {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": "attachment; filename=README.md",
    },
  });
});
```

The two important headers to send that make a file downloadable:

- `"Content-Type"`
- `"Content-Disposition"`
