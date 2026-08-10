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

## fly.io

You can easily deploy apps to [fly.io](https://fly.io) with docker. 

The first step is to add a `fly.toml` in the root of your project, adding any configuration and environment variables like so:

```toml
# fly.toml app configuration file generated for youtube-download-trimmer on 2025-04-05T09:42:26Z
#
# See https://fly.io/docs/reference/configuration/ for information about how to use this file.
#

app = 'youtube-download-trimmer'
primary_region = 'mad'

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[env]
  SERVER_MODE = "production"
  PORT = "8080"
  VITE_API_URL_DEV = "http://localhost:8080"
  VITE_API_URL_PRODUCTION = "https://youtube-download-trimmer.fly.dev"

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
  memory_mb = 1024
```


> [!IMPORTANT] 
> Make sure your app runs on port 8080 otherwise it will not work.


Here is an example of the docker file used:

```dockerfile
FROM node:20-alpine

# 1. essential downloads
RUN apk update
RUN apk add bash
RUN apk add curl
RUN apk --no-cache add ca-certificates wget
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk
RUN apk add --no-cache --force-overwrite glibc-2.28-r0.apk

# 2. install bun
RUN npm install -g bun


# 3. install python, ffmpeg, and yt-dlp
RUN apk add --no-cache python3 py3-pip
RUN apk add --no-cache ffmpeg
RUN apk -U add yt-dlp


# 4. install dependencies
WORKDIR /usr/src/app
COPY package*.json ./
COPY bun.lock ./
RUN bun install

# 5. copy app code, install frontend dependencies.
COPY . .
RUN npm install --prefix frontend

# 6. run app
EXPOSE 8080
CMD ["bun", "start"]
```

## Netlify

### Netlify TOML

`netlify.toml` is Netlify's project configuration file.

You generally put it at the root of your repository:

```
my-project/
├── netlify.toml
├── package.json
├── src/
└── netlify/
    └── functions/
```

It lets you put deployment configuration **in version control alongside your application**.

For example:

```
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
```

Instead of configuring those settings manually in the Netlify dashboard, they're encoded in your repository.

> [!NOTE]
> Configuration in `netlify.toml` takes precedence over conflicting configuration in the Netlify UI.

Here's an example `netlify.toml` and what each key means:

- `[build]`: defines the build command and the output dist artifact folder to use and deploy
- `[functions]`: Defines the path to the directory that contains the netlify cloud functions for this app.
- `[dev]`: defines the development configuration for running the app
- `[[redirects]]`: defines the URL rewrites for the app, which is useful for static sites that use client-side routers like React router or proxying a route path to direct that traffic isntead to a netlify cloud function, calling it like an API.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 5173

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

The `[[redirects]]` key lets  you query the `/api/users` route from your frontend and then redirects that to invoke the function code at `/.netlify/functions/users`.

### Netlify functions

#### Basic functions

1. 