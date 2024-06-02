# 04: Bun and Docker

This is the dockerfile for installing both node and bun:

```Dockerfile
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
WORKDIR /usr/src/app

# 3. install dependencies
COPY package*.json ./
COPY bun.lockb ./
RUN bun install

# 4. copy app code
COPY . .

# 5. run app
EXPOSE 80
CMD [ "bun", "start" ]
```