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

#### Synchronous and Async I/O

Here is how synchronous (blocking) I/O works:

1. **I/O request initiatiation**: A process running code sends an I/O request, like asking OS to read from disk.
2. **CPU context switches**: The CPU reads the I/O request, executes it and waits a certain amount of time (via some scheduling algorithm's predefined timeout) before context switching and moving on to another process if the I/O request takes too long. 
3. **stalled**: While the I/O request takes its sweet time finishing, the CPU has context switched to another process therefore the process that initiated the I/O request is stalled and frozen, because the CPU is no longer executing the code/instructions of the process.
4. **I/O request finishes**: The I/O request that was initiated finishes so the CPU switches back to the stalled process, unblocks it, and continues executing it with the I/O response.
5. **caller and receiver are in sync**: Now the caller and receiver are in sync.

here is how async I/O works:

1. **send I/O request**: Caller sends a I/O request asynchronously
2. **nonblocking execution**: Caller can have the CPU execute its instructions until it gets a response.
3. **check for response**: There are three methods processes can use to check for when the response has completed:
	- **use `epoll` long polling**: check for the response via long polling via the `epoll` system call
	- **receiver calls back**: receiver calls back when it's done via the `io_uring` interrupt
	- **create new synchronous thread for reading the I/O request**: spin up a new thread that synchronously reads the I/O request and then responds back to the main thread with the payload.




