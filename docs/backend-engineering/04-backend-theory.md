## Backend communication design patterns

### Request/Response Pattern

#### Request packet anatomy

The anatomy of an HTTP request is as follows:

```
GET /recipes HTTP/1.1
Headers
<CRLF>
BODY
```

- **line 1 (HTTP method)**: defines the HTTP method to a specific route and which HTTP version is being used.
- **line 2 (Headers)**: Defines the request headers
- **line 3 (carriage return)**: separates the packet headers from the payload
- **line 4 (body)**: This is the payload carrying the actual data if it's a POST request or something other than a GET or OPTIONS.

Modern code server libraries like the `node:http` library parses the packets for us and abstracts away that parsing, just giving us the raw payload and headers.


#### Ways to send requests

What if you want to send a 7 gigabyte video to a client? What are the two ways to perform this request/response cycle:

- **method 1, naive way (send everything at once)**: This is simple, but prone to failure and has to be started all over again if it fails. This also runs into bandwidth and performance issues.
- **method 2, resumable way (send in chunks)**: Break up data into multiple HTTP packets and send down the chunked data in a stream. The two main benefits are as follows:
	- **benefit 1 - resumable**: If the stream gets paused or packets are dropped, you can resume where you left off.
	- **benefit 2 - saves bandwidth**: By sending data in chunks, you don't take up all the available bandwidth at once, even when sending down a large file because you just divide that file into smaller chunks.

#### When does request/response fail?

There are three scenarios where a simple stateless request/response architecture simply doesn't work:

1. **notification service**: Clients would have to do long polling to be notified of a notification.
2. **chatting app**: Clients would have to do long polling to be notified of a new chat to always receive realtime data, causing high latency.
3. **very long requests**: HTTP requests that cause a server request handler to execute for a long time (think of a GenAI call) waste valuable bandwidth and resources

> [!NOTE]
> Long polling is a serious performance issue because it takes time to form request packets and parse them and create response packets. So each HTTP request/response cycle carries an inherent fixed cost with forming the request and response, so we want to avoid initiating thousands of request/response cycles.

We can use asynchronous background jobs to mitigate long requests, and we can use websockets to avoid long polling.

### Synchronous vs Asynchronous Execution

- **Synchronous**: tasks are executed in a sequential manner. When a task is initiated (like sending a request), the process waits or blocks until that task is completed before moving on to the next one.
- **asynchronous**: allow tasks to be initiated and then moved on without waiting for them to complete. This means that while one task is being processed, the system can continue executing other tasks.

#### Synchronous I/O

Here is how synchronous (blocking) I/O works:

1. **I/O request initiatiation**: A process running code sends an I/O request, like asking OS to read from disk.
2. **CPU context switches**: The CPU reads the I/O request, executes it and waits a certain amount of time (via some scheduling algorithm's decision for how long to allocate execution time window to a process) before context switching and moving on to another process if the I/O request takes too long. 
3. **stalled**: While the I/O request takes its sweet time finishing, the CPU has context switched to another process therefore the process that initiated the I/O request is stalled and frozen while the I/O request has been taken over by the disk, executing in the background, but the process can't execute any other instructions meanwhile, because the CPU is no longer executing the code/instructions of the process.
	- **I/O request state**: executing in the background, since the CPU just sent it over to the disk for actual execution.
	- **CPU state**: the CPU delegated the I/O request to the disk and waited for a certain period of time in case a response came back quickly, but it saw that the I/O request was taking way too long, so it context-switched to another process to handle instructions for that, stalling the initiating process.
	- **initiating process state**: stalled, since the CPU context switched to another process and is no longer executing program instructions of the process.
4. **I/O request finishes**: The I/O request that was initiated finishes so the CPU switches back to the stalled process, unblocks it, and continues executing it with the I/O response.
5. **caller and receiver are in sync**: Now the caller and receiver are in sync.

Here is an example of Node code that illustrates synchronous I/O requests perfectly:


![](https://i.imgur.com/Gkg2BP6.jpeg)

1. **synchronous instruction work**: synchronous CPU instructions are quick to execute, so it's fine for that stuff to be synchronous
2. **synchronous I/O request**: a sync I/O request blocks and freezes the process until the I/O request finishes, and an I/O request always takes at least 10ms to complete cuz it has to reach out to disk and also wait for the process the CPU context switched to to finish work.
3. **process resumes**: After the I/O request finishes and the program is ready to resume, the CPU context switches back to the process to resume its instruction execution.

#### Async I/O 

here is how async I/O works:

1. **send I/O request**: Caller sends a I/O request asynchronously
2. **nonblocking execution**: Caller can have the CPU execute the rest of its non-I/O synchronous instructions until it gets a response, but how does it check that it got a response?
3. **check for response**: There are three methods processes can use to check for when the response has completed:
	- **use `epoll` long polling**: check for the response via long polling via the `epoll` system call
	- **receiver calls back**: receiver calls back when it's done via the `io_uring` interrupt
	- **create new synchronous thread for reading the I/O request**: spin up a new thread that synchronously reads the I/O request and then responds back to the main thread with the payload.

> [!NOTE]
> NodeJS uses the hack to spin up a synchronous thread to handle an async I/O request, so it appears like async execution while all it does is delegate the synchronous work to someone else.


#### Threads

The number of threads a CPU can handle varies depending on the CPU architecture. Typically, CPUs can handle threads according to their cores and whether hyper-threading is enabled. 

A CPU core can generally handle one or two threads (if hyper-threading is enabled). For instance, a 4-core CPU with hyper-threading can handle 8 threads.

**Threads in NodeJs**
    
By default, Node.js operates on a single-threaded model for processing requests. 

However, it utilizes worker threads for handling asynchronous operations such as I/O tasks, which allows it to perform certain tasks concurrently. 

The default number of worker threads in Node.js is often set to 4, though this can be configured based on the application requirements and the number of CPU cores available.

**Promises and threads**

The number of promises that can be executed in parallel is not directly tied to the number of CPU threads. While a CPU can manage a certain maximum number of threads (for example, 8), Node.js operates differently due to its event-driven, non-blocking architecture.

1. **Node.js Single-Threaded Model**: By default, Node.js runs on a single thread, but it uses an event loop to concurrently handle async requests and responses concurrently. This allows it to manage multiple requests without being limited by the number of threads the CPU can support.
    
2. **Asynchronous Promises**: Promises in Node.js do not occupy CPU threads in the same way that traditional threads do. When you initiate a Promise, it allows for concurrent operations (like I/O tasks) that do not block the main thread. Node.js can efficiently handle many promises because it doesn't require each operation to run in a separate thread.
    
3. **Worker Threads**: If you need to perform CPU-intensive tasks, you can use worker threads that Node.js spawns. The default number of worker threads is typically set to 4 but can be configured based on your CPU cores.
    
4. **Task Handling**: If all worker threads are busy handling tasks, Node.js can still accept new promises and enqueue them to be processed once threads become available. Thus, the number of promises processed simultaneously is not confined to the number of threads the CPU can handle.

In summary, while the number of threads a CPU can manage imposes some limitations on concurrent processing, Node.js utilizes an event-driven approach that allows it to handle many more promises than the strict thread count would suggest.

#### Async/await in NodeJS

`async` and `await` in Node.js provide a way to work with asynchronous code more intuitively, resembling synchronous execution while still being non-blocking under the hood. Here’s a breakdown of how it works:

1. **Async Functions**: When you declare a function as `async`, it will always return a Promise. This allows you to use `await` inside the function to pause execution until the Promise is resolved.
    
2. **How Await Works**: When the code execution reaches `await`, it effectively pauses the execution of the function. The rest of the code inside the `async` function will not proceed until the awaited Promise is resolved:
    - While it appears to block execution in that function, it does **not** block the entire event loop. Other operations and asynchronous tasks can still be processed in the background.

3. **Event Loop**: Node.js maintains an event loop that constantly checks for callbacks or pending tasks. When `await` is encountered, the current function's context is "saved" and a callback (that resumes execution) is registered for when the Promise resolves. This allows the event loop to continue handling other requests and tasks, making Node.js highly efficient.
    
4. **Comparison with Promises**: With traditional Promises, if you call a function that returns a Promise and then immediately proceed to the next line of code, that next line runs without waiting for the Promise to resolve. In contrast, with `async/await`, the execution pauses until the Promise resolves, thus leading to clearer and more readable code.


#### Sync vs Async workloads

When thinking about a client to server request-response cycle, we can think of that cycle as either happening synchronously or asynchronously:

- **sync**: Client sends a request to the server and waits for a response. 
- **async**: Client sends a request to the server, then the server creates a background job and immediately returns the job metadata so the client can now poll for the job status without waiting on the response synchronously. 

Asynchronous backend processing is using a messaging queue to handle long-running requests in a request-response cycle to a server, instead of a client synchronously waiting for a response from a server after processing.


### Push model

A push model is when a server notifies a client unidirectionally without the client making a request. Here's how it works:

1. Client connects to a server
2. Server sends data to the client
3. Client doesn't have to request anything.

A push model connection can be bidirectional or unidirectional, with the most famous push models being RabbitMQ, SSE, and websockets.

> [!NOTE]
> The most important thing that distinguishes a push model from other similar models is that it pushes immediately to the client the moment the event is generated, with no scheduling or delaying.

Here are some examples of push models:

- **immediately broadcasting websocket server**: as soon as someone connects to the server and then sends a message, the websocket server loops through the client list and then broadcasts a message to all connected clients.

**Pros**

- **realtime**: pushes immediately to the client the moment the event is generated

**Cons**

- **client must be online**: You can only push messages to a client that is connected to the server and online.
- **client may not handle load**: since messages are pushed as soon as they are generated, a client may suffer under many messages being frequently pushed and cannot handle the load.
- **requires a bidirectional protocol**

#### Websocket example

Here is the server code:

```ts
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (socket) => {
    console.log('New client connected');

    // Send a welcome message to the new client
    socket.send('Welcome to the WebSocket server!');

    // Listen for messages from the client
    socket.on('message', (message) => {
        console.log(`Received: ${message}`);
        
        // Broadcast the message to all clients
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
```

Here is the client code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket Client</title>
</head>
<body>

<script>
    const socket = new WebSocket('ws://localhost:8080');

    // Connection opened
    socket.addEventListener('open', function (event) {
        console.log('Connected to the WebSocket server');
        socket.send('Hello Server!'); // Sending a message to the server
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log('Message from server:', event.data);
    });
    
    // Handling connection closure
    socket.addEventListener('close', function (event) {
        console.log('Disconnected from WebSocket server');
    });
</script>

</body>
</html>
```

### Short polling

Short polling is an asynchronous workload technique that the client uses to continuously poll for the status of a background job so it can be notified when the job is finished.

Here's how it works:

1. Client sends a request to initiate some long processing work
2. Server delegates the work to a background job via a messaging queue, returns job metadata and identifier to client.
3. Client polls in short intervals to an API route on a server to check the status of the job
	- Polling for the job status is a very quick request-response cycle so this can be handled synchronously.


![](https://i.imgur.com/Cy4yrLF.jpeg)

**pros**

- simple
- good for long running requests that require a lot of processing
- client can disconnect, no need to wait on server.

**cons**

- too chatty, short polling makes many network requests and consumes bandwidth on the server, making it more expensive.
- wasted backend resources

### Long polling

Long polling is a different approach to short polling where the client sends an asynchronous, non-blocking request to the server to check for job status and the server only responds if the job status changed from the previous status.

Basically the server stalls and only responds as necessary to inform the client of any changes, and then the client immediately requests the same job status endpoint again until the job status returns as finished.



![](https://i.imgur.com/CMK2nsq.jpeg)


Here's how it works:

1. Client sends a background job initiation request to the server
2. Server immediately responds with job metadata, kicks off background job
3. Client uses the job handle to check for status at some `/status/:jobId` endpoint, server does not reply until it has the response, either success or failure.


**pros**

- Less chatty and thus saves bandwidth
- Client can still disconnect, since it's asynchronous

**cons**

- Not realtime