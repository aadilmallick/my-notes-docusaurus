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

// 3. create web socket server with cors options
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

Both apis for client and server side are pretty similar. On the server side, you have both the `io` and `socket` objects, while on the client you only have the individual `socket` instance.

Here is the difference between the two:

- `io`: represents the server's connection to all connected clients/sockets
- `socket`: represents an individual socket from the client.

Here are the basic methods exposed on the `io` and `socket` objects:

- `socket.emit(channel : string, data : any)` : sends a message to the specified channel passing the data. THe data has to be JSON-parseable.
- `socket.on(channel : string, cb: (...args) => any)` : listens for the message on the specified channel and runs a callback once the message is received, along with any data emitted by the sending end.
- `socket.once(channel : string, cb: (...args) => any)` : listens for the message on the specified channel and runs a callback once the message is received, along with any data emitted by the sending end. The difference between `on` and `once` is that `once` only listens for the message once, and immediately cleans up the handler afterward
- `socket.disconnect()` : disconnects the socket connection.
- `socket.off(channel : string, cb: (...args) => any)` : removes the listener for the specified channel.

## Utility classes

These utility classes and types are meant to be separated into different files as to separate client from server effectively. They share the same typesafe API.

```ts title="socket-io.types.ts"
export type SocketIOPayloads<
  SendPayload extends Record<string, unknown>,
  ReceivePayload extends Record<string, unknown>
> = {
  sendMessagePayload: SendPayload;
  receiveMessagePayload: ReceivePayload;
};
```

```ts
import { Socket } from "socket.io";
import { SocketIOPayloads } from "./socketio.types";

export default class ServerSocket<
  T extends Record<string, SocketIOPayloads<any, any>>
> {
  constructor(public socket: Socket) {}

  onDisconnect(cb: () => void) {
    this.socket.on("disconnect", cb);
  }

  onConnect(cb: () => void) {
    this.socket.on("connect", cb);
  }

  on<K extends keyof T>(
    channel: K,
    cb: (payload: T[K]["receiveMessagePayload"]) => void
  ) {
    type thingy = typeof this.socket.on;
    this.socket.on(channel as string, cb);
  }

  emit<K extends keyof T>(channel: K, payload: T[K]["sendMessagePayload"]) {
    this.socket.emit(channel as string, payload);
  }
}
```

```ts
import { Socket, io } from "socket.io-client";
import { SocketIOPayloads } from "./socketio.types";

export default class ClientSocket<
  T extends Record<string, SocketIOPayloads<any, any>>
> {
  public socket: Socket;
  constructor(url: string) {
    this.socket = io(url);
  }

  onDisconnect(cb: () => void) {
    this.socket.on("disconnect", cb);
  }

  onConnect(cb: () => void) {
    this.socket.on("connect", cb);
  }

  on<K extends keyof T>(
    channel: K,
    cb: (payload: T[K]["receiveMessagePayload"]) => void
  ) {
    type thingy = typeof this.socket.on;
    this.socket.on(channel as string, cb);
  }

  emit<K extends keyof T>(channel: K, payload: T[K]["sendMessagePayload"]) {
    this.socket.emit(channel as string, payload);
  }
}
```


Then you can use it like so on the server:

```ts title="server.ts"
// 1. create express app
const app = express();

// 2. create http server
const server = http.createServer(app);

// 3. create web socket server with cors options
const io = new Server(server, {});

io.on("connection", (socket) => {
  const serverSocket = new ServerSocket<{
    ping: {
      sendMessagePayload: { ping: string };
      receiveMessagePayload: { ping: string };
    };
  }>(socket);

  serverSocket.onConnect(() => {
    console.log(`WTF! a user with ${serverSocket.socket.id} connected`);
  });

  serverSocket.onDisconnect(() => {
    console.log(`WTF! a user with ${serverSocket.socket.id} disconnected`);
  });

  serverSocket.on("ping", ({ ping }) => {
    console.log("got ping", ping);

    serverSocket.emit("ping", {
      ping: "ping",
    });
  });
});
```

and on the client:

```ts
const clientSocket = new ClientSocket<{
  ping: {
    sendMessagePayload: { ping: string };
    receiveMessagePayload: { ping: string };
  };
}>("http://localhost:3000");

clientSocket.onConnect(() => {
  console.log("connected");
  clientSocket.emit("ping", {
    ping: "WTF Beeaaanns",
  });
});

clientSocket.onDisconnect(() => {
  console.log("diconnected");
});

clientSocket.on("ping", ({ ping }) => {
  console.log("from server:", ping);
});
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
