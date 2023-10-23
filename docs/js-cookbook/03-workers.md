# Workers

Check out [worker example](/examples/workers) for a working example.

## Worker basics

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

## Sending messages

### From main thread to worker

```ts
worker.postMessage(payload);
```

The `worker.postMessage()` method takes a single argument of any type, which is the payload to be sent to the worker.

You can then listen to messages sent by the main thread in the worker using the `self.onmessage` event listener, which passes in an `event` object with the `data` property, where `event.data` is the payload that the message posted in the first place.

```ts
self.onmessage = function (event) {
  const data = event.data;
};
```

### From worker to main thread

It's pretty much the same API to post messages and listen to them, except we use `self.postMessage()` in the worker thread and `worker.onmessage` in the main thread.

```ts
self.postMessage(payload);
```

Whatever you pass into the `postMessage()` method gets sent as the `event.data` property in the message listener.

```ts
worker.onmessage = function (event) {
  const data = event.data;
};
```

## Worker class

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

We can then use it like this:

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
