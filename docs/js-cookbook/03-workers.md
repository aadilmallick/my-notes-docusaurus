# Workers

Workers are ways of offloading JavaScript tasks onto a separate thread. There are three different types of workers:

- **dedicated workers**: Heavy-set workers that work in a separate JS thread, meant for doing work that shouldn't run on main thread
- **shared workers**: Like dedicated workers but can be shared across different contexts
- **service workers**: act as a proxy for all network requests for the app

## Dedicated workers

Dedicated workers are how you multithread in javascript, where each worker can get its own core. If you have 8 cores on your machine, then you can run 8 workers in parallel at a time. 
### Dedicated Worker basics

Workers are a way of multithreading in JavaScript, where you can delegate expensive tasks to be performed by a **worker**, which works in the background much like a service worker.

You can then communicate with workers using a messaging and event based system.

1. Register the worker. Create a `worker.ts` file. The global object there is `self`.

   ```js
   const worker = new Worker("./worker.ts");
   ```

You can also listen to errors on the worker like so:

```ts
worker.onerror = function (e) {
  console.log("error in worker", e);
  e.preventDefault();
};
```

If you want to prevent the error in a worker from propagating and crashing your program, you can call `e.preventDefault()` to prevent the error from propagating into the window and main thread.

Now let's talk about sending messages between the worker and main thread.

### TypeScript

The `self` object in a dedicated worker file is of type `DedicatedWorkerGlobalScope`.

You can enable the type intellisense for a dedicated worker in the tsconfig: 

```json
{
  "compilerOptions": {
    "lib": ["webworker", "es2015"]
  }
}
```

### Worker lifecycle

The worker lifecycle goes through three stages:

- **initializing**:
- **active**
- **terminated**

Here are the different methods a worker has to deal with the lifecycle: 

- `worker.terminate()`: terminates the worker
- `worker.close()`: discards all worker tasks in the event loop


> [!TIP] 
> Both `worker.terminate()` and `worker.close()` are idempotent operations, meaning you can call them multiple times without any harm.


### Sending messages

#### From main thread to worker

```ts title="main.ts"
worker.postMessage(payload);
```

The `worker.postMessage()` method takes a single argument of any type, which is the payload to be sent to the worker.

You can then listen to messages sent by the main thread in the worker by listening to the `"message"` event listener, which passes in an `event` object with the `data` property, where `event.data` is the payload that the message posted in the first place.

```ts title="worker.ts"
self.addEventListener("message", (event) {
  const data = event.data;
});
```

#### From worker to main thread

It's pretty much the same API to post messages and listen to them, except we use `self.postMessage()` in the worker thread and `worker.onmessage` in the main thread.

```ts title="worker.ts"
self.postMessage(payload);
```

Whatever you pass into the `postMessage()` method gets sent as the `event.data` property in the message listener.

```ts title="main.ts"
worker.addEventListener("message", (event) =>{
  const data = event.data;
});
```

### Worker class

Here is an implementation of a worker class that makes it easier to work with workers.

```ts
// message typing, where we use keys as message strings, and values as the payload
interface Messages {
  terminate: {
    type: "terminate";
    payload: undefined;
  };
  countToACertainNumber: {
    type: "countToACertainNumber";
    payload: number;
  };
}

export class WorkerClass {
  // public access to worker so you can do worker specific things like worker.terminate()
  constructor(public worker: Worker) {}

  onError(callback: (err: ErrorEvent) => void) {
    this.worker.onerror = callback;
  }

  postMessage<T extends keyof Messages>(
    message: T,
    payload: Messages[T]["payload"]
  ) {
    // automatically add "type" property to message we are sending
    this.worker.postMessage({
      type: message,
      payload,
    });
  }

  // listen for a specific message
  onMessage<T extends keyof Messages>(
    message: T,
    // add callback type which takes in payload of the specific message we are listening on
    callback: (payload: Messages[T]["payload"]) => void
  ) {
    this.worker.onmessage = function (event) {
      const data = event.data as Messages[T];

      if (data.type === message) {
        // pass payload into callback
        callback(data.payload);
      }
    };
  }
}
```

We can then use it like this in the main thread:

```ts
// main thread

function countToACertainNumber(num: number) {
  const worker = new WorkerClass(new Worker("./worker.ts"));

  // onError listener
  worker.onError((e) => {
    console.log("error in worker", e);
  });

  // send a message
  worker.postMessage("countToACertainNumber", num);

  // listen for the "terminate" message being sent from the worker
  worker.onMessage("terminate", () => {
    // public access on worker, terminate worker
    worker.worker.terminate();
  });
}

countToACertainNumber(100);
```

And then in the worker thread:

```ts
import { WorkerClass } from "./WorkerClass";

// create worker abstraction from self object
const worker = new WorkerClass(self as unknown as Worker);

// listening to message coming from main thread
worker.onMessage("countToACertainNumber", (num) => {
  // execute code on worker thread
  let count = 0;
  while (count < num) {
    console.log(count++);
  }
  // send back message telling to terminate
  worker.postMessage("terminate", undefined);
});
```

But here is an improved, more type-friendly version of a worker class:

```ts
export class WorkerModel<
  ChannelName extends string,
  PayloadType extends Record<string, any> = {}
> {
  // public access to worker so you can do worker specific things like worker.terminate()
  constructor(public worker: Worker, public channelName: ChannelName) {}

  onError(callback: (err: ErrorEvent) => void) {
    this.worker.addEventListener("error", callback);
  }

  postMessage(payload: PayloadType) {
    // automatically add "type" property to message we are sending
    this.worker.postMessage({
      type: this.channelName,
      payload,
    });
  }

  terminate() {
    this.worker.terminate();
  }

  // listen for a specific message
  onMessage(
    // add callback type which takes in payload of the specific message we are listening on
    callback: (payload: PayloadType) => void
  ) {
    this.worker.addEventListener("message", (event) => {
      const data = event.data as { type: ChannelName; payload: PayloadType };

      if (data.type === this.channelName) {
        // pass payload into callback
        callback(data.payload);
      }
    });
  }
}
```