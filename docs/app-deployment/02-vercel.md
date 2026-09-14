
## Vercel


Here is an example of how to deploy express with vercel: https://github.com/vercel/examples/tree/main/solutions/express

### How to use vercel

1. Install Vercel CLI globally if you haven't already:

   ```bash
   npm install -g vercel
   ```

2. Login to vercel with `vercel login` command.
3. Create a new project with `vercel dev` command. This will create a `.vercel` directory in your project root.

Here's a quick summary of the core commands:

- `vercel dev`: used to set up your vercel project, configure deployment settings, and start a local development server.
- `vercel`: used to deploy your project to the Vercel platform. It will automatically detect your project settings and deploy it to the cloud.
- `vercel login`: login to your vercel account using `vercel login`
- `vercel switch`: switch vercel team accounts
- `vercel list`: list all vercel projects
- `vercel link`: Link existing vercel projects to your local codebase with `vercel link`


#### `vercel` command

Anytime you want to deploy your app, use the `vercel --prod` command.

```json title="package.json"
{
  "scripts": {
    "deploy": "vercel --prod"
  }
}
```

Then you can imply run `npm run deploy` to deploy your app.


### Deploying different frameworks

#### Deploying React apps to vercel

When doing client side routing, you MUST have a `vercel.json` in the root of your project that specifies to redirect all requests to the index HTML:

```json title="vercel.json"
    {
      "rewrites": [
        {
          "source": "/:path*",
          "destination": "/index.html"
        }
      ]
    }
```

### Express with vercel complete steup guide

Express with vercel adapts express routes to be serverless functions, which means on each request the server is instantly fired up from a cold start.

This is could lead to millions of requests easily, so build express apps for vercel keeping in mind techniques like pooling, and avoid global state in a server.

1.  Create this `vercel.json` pointing to the entrypoint of your express app.

    ```json
    {
      "version": 2,
      "builds": [{ "src": "api/server.js", "use": "@vercel/node" }],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "api/server.js"
        }
      ]
    }
    ```

2.  Create a basic express app in your entrypoint and make it a default export.

    ```javascript
    // api/server.js

    import express from "express";

    const app = express();

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    export default app;
    ```

3.  Create a `package.json` file with a start script that begins your express server.

    ```json
    {
      "scripts": {
        "start": "node api/server.js"
      }
    }
    ```




## Vercel KV

#### Basics

Through the vercel marketplace, you can add veercel KV and connect to it through env vars.

```ts
import { kv } from '@vercel/kv';

// string
await kv.set('key', 'value');
let data = await kv.get('key');
console.log(data); // 'value'

await kv.set('key2', 'value2', { ex: 1 });

// sorted set
await kv.zadd(
  'scores',
  { score: 1, member: 'team1' },
  { score: 2, member: 'team2' },
);
data = await kv.zrange('scores', 0, 0);
console.log(data); // [ 'team1' ]

// list
await kv.lpush('elements', 'magnesium');
data = await kv.lrange('elements', 0, 100);
console.log(data); // [ 'magnesium' ]

// hash
await kv.hset('people', { name: 'joe' });
data = await kv.hget('people', 'name');
console.log(data); // 'joe'

// sets
await kv.sadd('animals', 'cat');
data = await kv.spop('animals', 1);
console.log(data); // [ 'cat' ]

// scan for keys
for await (const key of kv.scanIterator()) {
  console.log(key);
}
```

#### Rate limiting

You can ratelimit using vercel kv and combining with the `@upstash/ratelimit` package.

```ts title="middleware.ts"
import {kv} from "@vercel/kv"
import { Ratelimit } from '@upstash/ratelimit'

const ratelimiter = new RateLimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(5, '10 s')
})

// which routes to rate limit on
export const config = {
	matcher: "/"
}

export default async function middleware(request: NextRequest) {
  // You could alternatively limit based on user ID or similar
  const ip = request.ip ?? '127.0.0.1'
  const { success, pending, limit, reset, remaining } =
    await ratelimit.limit(ip)

  return success
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/blocked', request.url))
}
```

## vercel blob storage

1. Go to your vercel deployment and click on "storage" -> "add blob storage"
2. Copy the read write blob token to your env vars
3. Install with `npm i @vercel/blob`

There are two different ways you can store files with vercel blob:

- **server uploads**: Get binary form data from API routes or server actions in your nextjs project, then upload that with a max request body size of 4.5mb for a file.
- **client-side upload**: Up to 5TB file for uploading via client-side.

#### API route upload

You can make an API request to an endpoint you set up for file handling like so:

There are three components to the fetch request you make in order for your API route to handle it correctly to upload to vercel blob storage:

1. **method**: should be a POST request
2. **headers**: should pass the mime type for `Content-type` header and have filename passed for the `"x-vercel-filename"` header.
3. **body**: request body should be `Blob` or `File` instance.

```ts
async function uploadFile(file: File) {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file?.type || "application/octet-stream",
      "x-vercel-filename": file?.name || "image.png",
    },
    body: file,
  });

  if (!res.ok) throw new Error("image upload failed")

  const { url } = (await res.json()) as { url: string };
  return url
}
```

To add a blob to vercel storage, we just use the `put` method:

```ts
import { put } from '@vercel/blob'

 const blob = await put(filename, file, options)
```

- `filename`: the filename to set
- `file`: the `File` or `Blob` instance to uplaod
- `options`: important options
	- `contentType`: the mimetype of the file
	- `access`: "public" for public access.

Then we can handle the API route like so:

```ts
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401
      }
    )
  }

  const file = req.body
  const filename = req.headers.get('x-vercel-filename') || "file"
  const contentType = req.headers.get('content-type')
  const fileExtendion = `.${contentType.split('/')[1]}`

  // construct final filename based on content-type if not provided
  const finalName = filename.includes(fileType)
    ? filename
    : `${filename}${fileType}`
    
  const blob = await put(finalName, file, {
    contentType,
    access: 'public'
  })

  return NextResponse.json(blob)
}
```

#### Server Action upload

```ts
"use server"
import { put } from '@vercel/blob';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  const blob = await put(file.name, file, { 
	  access: 'public', 
	  addRandomSuffix: true 
  });

  return Response.json(blob);
}
```

## Vercel Inngest background jobs

