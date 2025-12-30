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

### Inline workers

Here is a neat trick to create a lightweight worker by just defining the code in a string:

```ts
const items = new Array(100).fill(null);

const workerScript = `
  function waitSync(milliseconds) {
    const start = Date.now();
    while (Date.now() - start < milliseconds) {}
  }

  self.onmessage = function(e) {
    waitSync(50);
    self.postMessage('Process complete!');
  }
`;

const blob = new Blob([workerScript], { type: "text/javascipt" });
const worker = new Worker(window.URL.createObjectURL(blob));

for (const i of items) {
  worker.postMessage(items);

  await new Promise((resolve) => {
    worker.onmessage = function (e) {
      loopCount.innerText = Number(loopCount.innerText) + 1;
      resolve();
    };
  });
}
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


### External libraries
#### `greenlet`

THe `greenlet` npm package is an easier abstraction on top of using workers that lets you run a standard async method, but behind the scenes, all it's doing is just spinning up a worker and delegating the work to that worker.

```embed
title: "GitHub - developit/greenlet: 🦎 Move an async function into its own thread."
image: "https://opengraph.githubassets.com/e926daa69d23ecf0fb1eae14e0ee437a56e2d7fc56b5efd44d5a9bf81c6dac9f/developit/greenlet"
description: "🦎 Move an async function into its own thread. Contribute to developit/greenlet development by creating an account on GitHub."
url: "https://github.com/developit/greenlet"
favicon: ""
aspectRatio: "50"
```

#### `workerize`

```embed
title: "GitHub - developit/workerize: 🏗️ Run a module in a Web Worker."
image: "https://opengraph.githubassets.com/9cd4c6624e322392a67b889a47c27ce031aead53cf373f95cdf2f9831ae0ab63/developit/workerize"
description: "🏗️ Run a module in a Web Worker. Contribute to developit/workerize development by creating an account on GitHub."
url: "https://github.com/developit/workerize"
favicon: ""
aspectRatio: "50"
```

`workerize` is a tiny 800 byte package that lets you stringify a module and transform it into a worker:

```ts
let worker = workerize(`
	export function add(a, b) {
		// block for half a second to demonstrate asynchronicity
		let start = Date.now();
		while (Date.now()-start < 500);
		return a + b;
	}
`);

(async () => {
	console.log('3 + 9 = ', await worker.add(3, 9));
	console.log('1 + 2 = ', await worker.add(1, 2));
})();
```

## Dedicated workers use cases

### Prevent blocking the main thread for event listeners

Here, I update the text of a box after performing some sort of presumably heavy calculation. Doing these things in parallel would be pointless (the DOM update necessarily depends on the calculation), so _of course_ I want everything to be synchronous. 

```javascript
const calculateResultsButton = document.getElementById(
  "calculateResultsButton"
);
const openMenuButton = document.getElementById("#openMenuButton");
const resultBox = document.getElementById("resultBox");

calculateResultsButton.addEventListener("click", (e) => {
  // "Why put this into a Worker when I
  // can't update the DOM until it's done anyway?"
  const result = performLongRunningCalculation();
  resultBox.innerText = result;
});

openMenuButton.addEventListener("click", (e) => {
  // Do stuff to open menu.
});
```

> [!NOTE]
> What I didn’t initially understand was that **none of the** _**other**_ **listeners can fire if the thread is blocked**. Meaning: things get janky.

Below is a codepen example of how clicking a button that then kicks off a long running calculation in the event listener (yes, especially if you await it) freezes all other event listeners and prevents them from firing.
