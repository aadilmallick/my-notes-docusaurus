

## Basic React Native Components
## Expo Navigation
## API routes

In expo, api routes are completely served on the server, and expo bundles the mobile web part of your app into a server that runs in the EAS cloud in prod and on localhost in development.

API routes have the exact same syntax as nextjs routes and use file-based routing. They end in the `+api.ts` suffix.

To get started with EXPO API routes, you need to bundle the web output to a server by configuring your `app.json`

```json title="app.json"
{
  "web": {
    "output": "server"
  }
}
```

### API route basics

Expo uses web standard `Request` and `Response` objects for the API routes.

```ts title="app/api/hello+api.ts"
export function GET(request: Request) {
  return Response.json({ hello: 'world' });
}
```

The above route handler that lives in the `app/api/hello+api.ts` file will be the handler for the `/api/hello` route on the server.

You can then fetch your API route in your expo react native code through a relative path:

```ts title="layout.tsx"
const response = await fetch("/api/hello")
```
## Expo SDK

### Expo SQLite

