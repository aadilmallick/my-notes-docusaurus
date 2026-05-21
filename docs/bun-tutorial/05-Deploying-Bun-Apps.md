## Deploying to vercel

Vercel edge functions has adapters for Express, Hono, and other web frameworks, but not `Bun.serve()`. You can serve a Bun server backend application through vercel cloud functions by just following these steps:

```embed
title: "examples/framework-boilerplates/express-bun/src/index.ts at main · vercel/examples"
image: "https://avatars.githubusercontent.com/u/43268759?v=4&size=40"
description: "Enjoy our curated collection of examples and solutions. Use these patterns to build your own robust and scalable applications. - vercel/examples"
url: "https://github.com/vercel/examples/blob/main/framework-boilerplates/express-bun/src/index.ts"
favicon: ""
aspectRatio: "100"
```

1. Create a `vercel.json`
2. Always do an `export default app` so vercel can discover the server you are creating. 

> [!IMPORTANT]
> Vercel only does cloud functions, so it does not allow code that starts a long-running server. What it does is that it takes your route definitions defined by some `app` variable that you export default, and then transforms those into cloud functions. This means you can't do anything like global server variables that live on the `app` variables.

### Express example

```ts
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express + Bun ${process.versions.bun} on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
        </nav>
        <h1>Welcome to Express + Bun ${process.versions.bun} on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
```

### Bun + NextJS

Bun is great for something like NextJS because you get all the benefits of using server-side backend code with Bun APIs and the standard performance and DX that comes with using nextjs and the deployment process is the exact same.

```embed
title: "bun-nextjs-basic/app/page.tsx at main · bun-templates/bun-nextjs-basic"
image: "https://avatars.githubusercontent.com/u/29451794?v=4&size=40"
description: "Contribute to bun-templates/bun-nextjs-basic development by creating an account on GitHub."
url: "https://github.com/bun-templates/bun-nextjs-basic/blob/main/app/page.tsx"
favicon: ""
aspectRatio: "100"
```
