## Oak

Oak is a simple, lightweight way of creating primarily API-focused servers (not much frontend) using dneo, node, or bun.

### Basics

This is an example where `app.use()` registers a handler/middleware that affects all routes:

```ts
import { Application, Router } from "jsr:@oak/oak";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello from oak! 🐿️";
});

await app.listen({ port: 8000 });
```

This is an example where we create a `Router` instance to register routes, and then we register the router using `app.use()`

```ts
import { Application, Router } from "@oak/oak";

const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "Hello world";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.listen();
```

### Middleware

A middleware handler is an async callback that takes a `ctx` object and a `next` function as parameters. Here is what they do:

- `ctx`: app-wide context of type `Context`, an object that is globally accessible across request-response cycles and throughout the life-cycle of the app, which is generically typed by what you pass as the initial context into the `Application()` instantiation.
- `next()`: an async function that when awaited and invoked, triggers the next middleware in the request-response chain.

```ts
// Type signature
type Middleware = (
  ctx: Context,
  next: () => Promise<void>
) => Promise<void> | void;

// Example: timing middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();           // pass to next middleware
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});
```

![middleware chain example](https://i.imgur.com/fivyq5O.jpeg)


> [!NOTE]
> Like how middleware in express works, calling `next()` doesn't stop the middleware execution, it only queues up going to the next handler in the chain. The rest of the middleware will still execute unless you have a `return` statement or throw an error.

If you prefer, you can also create a middleware as a class that implements a `handle(ctx, next)` method, implementing the `MiddlewareObject` interface. Then you can use this as any normal middleware.


```ts
// Implement the MiddlewareObject interface
class Logger {
  async handle(ctx: Context, next: Next) {
    console.log(`${ctx.request.method} ${ctx.request.url}`);
    await next();
  }
}

app.use(new Logger());
```

Just like in express, you can use multiple middleware in a chain, which execute sequentially:

```ts
// Pass multiple middleware to .use()
app.use(auth, logger, cors);

// They execute left to right, each calling next()
```



#### error-handling middleware

```ts
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.status = err.status ?? 500;
    ctx.response.body = { error: err.message };
  }
});
// Register FIRST so it wraps everything
```

#### auth middleware

```ts
app.use(async (ctx, next) => {
  const token = ctx.request.headers.get("Authorization");
  if (!token) {
    ctx.throw(401, "Unauthorized");
  }
  ctx.state.userId = await verifyToken(token);
  await next();
});
```

### Router

The `Router` object is the basic way to scope handlers to a certain route path.

To create a root-level router, do it like so:

```ts
const router = new Router();
```

You can also create a router scoped to a path:

```ts
const router = new Router({ prefix: });
```

#### Basics

```ts
import { Application, Router } from "jsr:@oak/oak";

const router = new Router();

router
  .get("/", (ctx) => {
    ctx.response.body = { status: "ok" };
  })
  .post("/users", async (ctx) => {
    const body = await ctx.request.body.json();
    ctx.response.status = 201;
    ctx.response.body = { created: body };
  })
  .put("/users/:id", async (ctx) => {
    const { id } = ctx.params;
    ctx.response.body = { updated: id };
  })
  .delete("/users/:id", (ctx) => {
    ctx.response.status = 204;
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods()); // handles OPTIONS + 405
await app.listen({ port: 8000 });
```

#### route parameters

```ts
// Named param → ctx.params.id
router.get("/users/:id", (ctx) => {
  ctx.response.body = ctx.params.id;
});

// Optional param
router.get("/posts/:year?/:month?", (ctx) => {
  const { year = "all", month = "all" } = ctx.params;
});

// Wildcard
router.get("/files/(.*)", (ctx) => {
  ctx.response.body = ctx.params[0]; // matched path
});
```

#### router middleware

Using the `router.use(middleware)` method, you can use middleware scoped to the router, and prefix the router with a path:

```ts
const apiRouter = new Router({ prefix: "/api/v1" });

// Middleware runs before all routes in this router
apiRouter.use(requireAuth);

apiRouter.get("/me", (ctx) => {
  ctx.response.body = ctx.state.user;
});
// Matches /api/v1/me
```