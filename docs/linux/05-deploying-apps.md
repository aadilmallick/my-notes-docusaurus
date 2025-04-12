## Vercel


Here is an example of how to deploy express with vercel: https://github.com/vercel/examples/tree/main/solutions/express

### How to use vercel

1. Install Vercel CLI globally if you haven't already:

   ```bash
   npm install -g vercel
   ```

2. Login to vercel with `vercel login` command.
3. Create a new project with `vercel dev` command. This will create a `.vercel` directory in your project root.

### `vercel dev`

The `vercel dev` command is used to set up your vercel project, configure deployment settings, and start a local development server.

### `vercel`

The `vercel` command is used to deploy your project to the Vercel platform. It will automatically detect your project settings and deploy it to the cloud.

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