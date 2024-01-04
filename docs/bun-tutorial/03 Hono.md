# Hono 

## Sample app

Hono is a great stand-in for express when using Bun. To get started, run `bun install hono`

A sample app looks like this: 

```typescript
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