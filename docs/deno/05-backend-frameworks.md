## Oak

Oak is a simple, lightweight way of creating primarily API-focused servers (not much frontend) using dneo, node, or bun.

### Basics

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