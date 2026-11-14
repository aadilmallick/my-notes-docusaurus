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
