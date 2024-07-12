# Socket.io

## Setup

You need to first create an HTTP server and then listen on that server and establish a socket connection.

1. `npm install express`
2. `npm install socket.io`
3. `npm install socket.io-client`

This is how a basic app setup looks like:

```ts title="server.ts"
import express from "express";
import http from "http";
import { Server } from "socket.io";

// 1. create express app
const app = express();

// 2. create http server
const server = http.createServer(app);

// 3. create web socket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

// 4. establish socket connection
io.on("connection", (socket) => {
  console.log("a user connected");
});

// 5. listen on http server
server.listen(3000, () => {
  console.log("listening on *:3000");
});
```

Then from the client-side, you create a socket and listen on a specific port you set.

```ts title="frontend/index.ts"
import { io } from "socket.io-client";
import ClientSocket from "../utils/ClientSocket";

const socket = io("http://localhost:3000");
```

## Socket api

Both apis for client and server side are pretty similar.

- `socket.emit(channel : string, data : any)` : sends a message to the specified channel passing the data. THe data has to be JSON-parseable.
- `socket.on(channel : string, cb: (...args) => any)` : listens for the message on the specified channel and runs a callback once the message is received, along with any data emitted by the sending end.
- `socket.once(channel : string, cb: (...args) => any)` : listens for the message on the specified channel and runs a callback once the message is received, along with any data emitted by the sending end. The difference between `on` and `once` is that `once` only listens for the message once, and immediately cleans up the handler afterward
- `socket.disconnect()` : disconnects the socket connection.
- `socket.off(channel : string, cb: (...args) => any)` : removes the listener for the specified channel.

## Utility classes

```ts
type ForbiddenChannels =
  | "connect"
  | "disconnect"
  | "connect_error"
  | "disconnect_error";
export type Channels = "message:hello";

type Payloads = {
  [K in Channels]: K extends "message:hello"
    ? { message: string }
    : K extends ForbiddenChannels
    ? never
    : void;
};

export type Payload<T extends Channels> = Payloads[T];
```

```ts
export default class ServerSocket {
  constructor(public socket: Socket) {}

  onDisconnect(cb: () => void) {
    this.socket.on("disconnect", cb);
  }

  on<T extends Channels>(channel: T, cb: (payload: Payload<T>) => void) {
    type thingy = typeof this.socket.on;
    this.socket.on(channel as string, cb);
  }

  emit<T extends Channels>(channel: T, payload: Payload<T>) {
    this.socket.emit(channel, payload);
  }
}
```

```ts
export default class ClientSocket {
  constructor(public socket: Socket) {}

  onConnect(cb: () => void) {
    this.socket.on("connect", cb);
  }

  onDisconnect(cb: () => void) {
    this.socket.on("disconnect", cb);
  }
  on<T extends Channels>(channel: T, cb: (payload: Payload<T>) => void) {
    type thingy = typeof this.socket.on;
    this.socket.on(channel as string, cb);
  }

  emit<T extends Channels>(channel: T, payload: Payload<T>) {
    this.socket.emit(channel, payload);
  }
}
```

## WIth React

- In an `useEffect` hook, you can establish a connection to the server, but during the cleanup function remember to disconnect the socket.
- It might be easier to just instantiate the socket at the beginning of the app

```ts
import { useEffect } from "react";

export default function useSocket() {
  useEffect(() => {
    const socket = io("http://localhost:3000");
    return () => {
      socket.disconnect();
    };
  }, []);
}
```

WHen listening on a channel with `socket.on()` in a `useEffect`, you also have to use the cleanup function to remove the listener with `socket.off()`

```ts
import { useEffect } from "react";

export default function useSocketListener(
  socket: Socket,
  channel: string,
  cb: (...args) => any
) {
  useEffect(() => {
    if (!socket) return;
    socket.on(channel, cb);
    return () => {
      socket.off(channel, cb);
    };
  }, [socket, channel, cb]);
}
```
