# Fetching remote data

## Fetch basics

### Request and Response

A basic `Request` is created like so: 

```jsx
const req = new Request(url, options)
```

Here are the important options you can pass in: 
- `method` : the HTTP verb to use
- `body` : the request body, working only for non-GET requests.
- `headers` : any request headers
- `mode` : controls the CORS behavior of your requests. Here are the different values you can provide:
    - `"same-origin"` : only allows requests to the same origin, meaning you can only make local requests to your own app.
    - `'cors"` : allow CORS requests. The default when you create a `Request()` with a header
- `cache` : controls the cache behavior. Here are the different values you can provide
    - `"default"` : default caching behavior, where if data is fresh, return from cache, and if data is stale, make a network request
    - `"no-store"` : **Network first.** never use caching. Always do network requests
    - `"reload"` : **Network first.** Serve network requests, but update cache each time so you can use it as fallback data in case of no internet.
    - `"no-cache"` : **Network first.** always make network request, and only return from cache if network request and cached data are the same.
    - `"force-cache"` : **Cache first.** always return from cache, and if there is nothing in the cache, make network request and add it to the cache.

```jsx
const request = new Request('https://api.example.com/data', {
  method: 'GET',
  headers: new Headers({
    'Authorization': 'Bearer yourToken',
  }),
  body: JSON.stringify({ key: 'value' }), 
});
```

Here are some useful properties and methods of a request object: 

- `request.method`: The HTTP method for the request (e.g., GET, POST, PUT).
- `request.url`: The URL of the request.
- `request.headers`: An object representing the headers of the request.
- `request.destination` : returns the content type of the data you are requesting, like `"audio"` , `"video"`, `"document"`, `"image"` and more.
- `request.clone()`: clones the request and returns that request
- `request.bodyUsed`: whether or not the response body was already read. If this is `true`, then attempting to clone the response with `response.clone()` will throw an error. 

**response**

Here are some useful things on the `Response` object: 

- **`status`**: The HTTP status code of the response (e.g., 200 for a successful request).
- **`headers`**: An object representing the headers of the response.
- `bodyUsed`: whether or not the response body was already read. If this is `true`, then attempting to clone the response with `response.clone()` will throw an error. 
- **`text()`**: A method to read the response body as text.
- **`json()`**: A method to parse the response body as JSON.
- **`blob()`**: A method to get the response body as a Blob.
- **`clone()`**: A method to clone the response, allowing it to be used in multiple places.

### Fetch with Headers

Instead of passing the headers straight in, we can create a `Headers` object and pass that in instead. We can create a `Headers` object like this:

```javascript
const headers = new Headers({
  "Content-Type": "application/json",
});
```

Then we can pass this into the `fetch()` method like this:

```javascript
fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(data),
});
```


### Aborting inflight fetch requests

```ts
let abortController = new AbortController();
 
fetch('wikipedia.zip', { signal: abortController.signal })
  .catch(() => console.log('aborted!'));
 
// Abort the fetch after 10ms
setTimeout(() => abortController.abort(), 10);
```


## Fetching binary data with fetch

### Blobs

Blobs are a way of working with file data in the browser. You can convert data from any network URL into a blob, and even create a local URL to use from that blob.

This is how you create a blob:

```javascript
const blob = new Blob(array, options);
```

- `array` : an array of data to put into the blob, like a list of strings
- `options` : the options to configure the blob. The most important is `option.type`, which determines the MIME type of the blob.

```javascript
const blob = new Blob(['<q id="a"><span id="b">hey!</span></q>'], {
  type: "text/html",
});
```

Here are the properties and methods you can access on a blob:

- `blob.size` : the size of the blob in bytes
- `blob.type` : the MIME type of the blob
- `blob.text()` : async method that returns the text of the blob

To create blob URLs for local use in the browser, you should use these two methods:

- `URL.createObjectURL(blob)` : creates a URL for the blob
- `URL.revokeObjectURL(url)` : revokes the URL for the blob, preventing memory leaks

### Array Buffers

Array buffers are a way for which we can write binary data in node and save it to a file.

We can get array buffer versions of binary data like images when we request them by using the `response.arrayBuffer()` async method that lives on the response object.

```javascript
const response = await fetch("https://example.com/image.png");
const buffer = await response.arrayBuffer();
await fs.writeFile("./image.png", imageBuffer);
```

### Fetching image data in the browser

```javascript
async function fetchBlobBrowser(url: string) {
  // 1. fetch image data
  const response = await fetch(url);
  // 2. Convert response to blob
  const blob = await response.blob();
  // 3. Create a local URL for the blob
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
```

Getting usable data from a image URL in the browser is a three step process:

1. Fetch the image data using `fetch(url)`
2. Get the blob data from the response using `response.blob()`, which returns a `Blob` object instance of the binary image data.
3. Create a local URL for the blob using `URL.createObjectURL(blob)`, which returns a string that can be used as a URL in the browser.

This is the complete code in action

```javascript
// this allows us to see which runtime environment we are in
const isRunningInNode = typeof require === "function";

async function fetchBlobBrowser(url: string) {
  if (isRunningInNode) {
    throw new Error("Cannot run in node");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  // check response headers to see file MIME type
  if (!response.headers.get("content-type").startsWith("image")) {
    throw new Error("Response is not an image");
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
```

### Fetching image data in node

```javascript
const isRunningInNode = typeof require === "function";

async function fetchBlobNode(url: string) {
  if (!isRunningInNode) {
    throw new Error("Cannot run in browser");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  if (!response.headers.get("content-type").startsWith("image")) {
    throw new Error("Response is not an image");
  }
  // get array buffer from response
  const arrayBuffer = await response.arrayBuffer();
  // convert array buffer to buffer
  const imageBuffer = Buffer.from(arrayBuffer);
  // write buffer to file
  await fs.writeFile("./image.png", imageBuffer);
}
```

1. Fetch image data and get back response
2. Get back array buffer of binary data with `response.arrayBuffer()` async method.
3. Convert array buffer to fs-usable buffer with `Buffer.from(arrayBuffer)`
4. Write buffer to file.

## FileReader and Files

If we want to read raw data from files in the browser, we can use the `File` and `FileReader` APIs.

1. Get blob binary data from the network request

   ```javascript
   const response = await fetch(url);
   const blob = await response.blob();
   ```

2. Create a `File` object from the blob.
   - The first argument of the constructor is an array of data to put in as the file contents.
   - The second argument is the file name.
   - The third argument is the options object, which has a `type` property that determines the MIME type of the file.

   ```javascript
   const file = new File([blob], "image.png", { type: blob.type });
   ```

3. Create a `FileReader` object. Listen for the `load` event, which fires when the file is loaded. The file content will be stored on the `event.target.result` property.

   ```javascript
   const fileReader = new FileReader();

   fileReader.readAsDataURL(file); // tells reader to read file as base 64 string
   fileReader.addEventListener("load", (e) => {
     const fileContent = e.target.result; // file content is stored here
   });
   ```

```ts
async function fetchBlobBrowser(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], "image.png", { type: blob.type });

  const fileReader = new FileReader();

  fileReader.readAsDataURL(file); // tells reader to read file as base 64 string
  fileReader.addEventListener("load", (e) => {
    const fileContent = e.target.result;
  });
}
```

### File API

This is the constructor for a `File` object instance:

```javascript
const file = new File(fileContentArray, filename, options);
```

- `fileContentArray` : an array of data to put into the file. This can be a list of strings, or a list of blobs.
- `filename` : the name of the file
- `options` : the options object, which has a `type` property that determines the MIME type of the file.

And here are the properties on a `File` object instance: 
- `file.name`: the file name
- `file.size`: the file size
- `file.type`: the mimetype of the file

### File reader API

We instantiate a `FileReader` object instance like this:

```javascript
const fileReader = new FileReader();
```

The next important thing to do is to actually begin reading the file, and there are several methods which we can use to read the file in different ways, depending on the resulting output we want:

- `fileReader.readAsText(file)` : read the file as text. Only good for text files and other non-binary data
- `fileReader.readAsDataURL(file)` : read the file as a base64 encoded string. Good for binary data like images
- `fileReader.readAsArrayBuffer(file)` : read the file as an array buffer. Returns an array buffer of the file data
- `fileReader.readAsBinaryString(file)` : read the file as a binary string

After you read the file into the specific format you want, you need to listen to the `load` event on the `FileReader` object instance, which fires when the file is loaded. The file content will be stored on the `event.target.result` property.

```javascript
fileReader.addEventListener("load", (e) => {
  const fileContent = e.target.result; // file content is stored here, in whatever format you read file as
});
```

If I used `fileReader.readAsDataURL(file)`, then the `fileContent` variable would be a base64 encoded string.

#### FileReader events

The FileReader API has three events you can listen for: 

- `"load"`: when the file fully loads and is ready to be used
- `"progress"`: fired every 50 ms while the file is loading, giving updates on the progress
- `"error"`: fired if an error occurred during the loading process. 

```ts
fileReader.addEventListener("progress", (e) => {
	if (e.lengthComputable) {
      progress.innerHTML = `${e.loaded}/${e.total}`;
    }
})

fileReader.addEventListener("error", (e) => {
	alert(reader.error.code)
})
```


## Streams and binary data



### Readable Streams

Readable streams stream data in chunks as to avoid large file overhead. You can only read a stream once, but there is a concept called **teeing** that allows you to copy a stream and therefore read it twice. 

The `response.body` from a `fetch()` call is a `ReadableStream` object, which allows us to do some stuff.

```ts
fetch("./tortoise.png")
  // Retrieve its body as ReadableStream
  .then((response) => {
    const reader = response.body.getReader();
    return new ReadableStream({
      start(controller) {
        return pump();
        function pump() {
          return reader.read().then(({ done, value }) => {
            // When no more data needs to be consumed, close the stream
            if (done) {
              controller.close();
              return;
            }
            // Enqueue the next data chunk into our target stream
            controller.enqueue(value);
            return pump();
          });
        }
      },
    });
  })
  // Create a new response out of the stream
  .then((stream) => new Response(stream))
  // Create an object URL for the response
  .then((response) => response.blob())
  .then((blob) => URL.createObjectURL(blob))
  // Update image
  .then((url) => console.log((image.src = url)))
  .catch((err) => console.error(err));
```

You can also use asynchronous iteration using the `for ... await` syntax to asynchronously consume each chunk:

```ts
async function readData(url) {
  const response = await fetch(url);
  for await (const chunk of response.body) {
    // Do something with each "chunk"
  }
  // Exit when done
}

```

You can also craft a response from a readable stream, by passing it into the constructor like `Response(readableStream)` which is useful for accessing response methods to get usable data like `response.blob()`, `response.arrayBuffer()`, etc.

```ts
async function streamToResponse(stream: ReadableStream) {
    return new Response(stream);
}
```

Here are some useful methods on a stream: 

- `stream1.pipeThrough(stream2)`: basically writes the contents from stream1 to stream2, copying stream1 to stream2.
- `stream.tee()`: returns a two copies of the same unconsumed stream.

Teeing a stream is especially useful if you need multiple consumers of the same stream. A stream can only be consumed once, so `stream.tee()` makes copies of the unconsumed stream.

```ts
const [stream1, stream2] = this.stream.tee();
```

When reading from streams, keep in mind to support canceling fetch requests and backpressure:


> [!NOTE] 
> **Backpressure**, a commonly overlooked aspect of streams, refers to the phenomenon where data is produced at a faster rate than it can be consumed. Ignoring backpressure can result in high memory consumption leading to decreased application performance.



### Writable streams

```ts
class WritableStreamManager<T extends Uint8Array<ArrayBufferLike>> {
  writer: WritableStreamDefaultWriter<T>;
  constructor(public stream: WritableStream<T>) {
    this.writer = stream.getWriter();
  }

  async writeChunk(data: T) {
    await this.writer.write(data);
  }

  async writeTextChunk(text: string) {
    const dataChunk = new TextEncoder().encode(text);
    await this.writer.write(dataChunk as T);
  }
}
```
### Stream Compression API

The `CompressionStream` and `DecompressionStream` classes are used to create compressed and decompressed streams respectively.

```ts
const compressionStream = new CompressionStream("gzip")
compressionStream.readable // readable stream
compressionStream.writable // writable stream
```


```ts
const decompressionStream = new DecompressionStream("gzip")
decompressionStream.readable // readable stream
decompressionStream.writable // writable stream
```

Here are both ways to respectively compress and decompress the same readable stream:

```ts
  async function getCompressedStream(stream: ReadableStream) {
    const compressedReadableStream = stream.pipeThrough(
      new CompressionStream("gzip")
    );
    return compressedReadableStream;
  }

  async function getDecompressedStream(stream: ReadableStream) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = stream.pipeThrough(ds);
    return decompressedStream;
  }

const response = await fetch("bruh.png")
// get back readable stream that is compressed
const compressedStream = await getCompressedStream(response.body)
// get back decompressed readable stream
const decompressedStream = await getDecompressedStream(compressedStream)
```
### Text encoding

Binary data is easy to work with, but text needs encoding and decoding. 

Here is how to use the `TextEncoder()` and `TextDecoder()` classes:

```ts
async function encodeText (text: string) {
	const encoder = new TextEncoder();
	return encoder.encode(text); // returns UINTARRAy
}

async function decodeText (data: Uint8Array) {
	const decoer = new TextDecoder();
	return decoder.decode(data); // returns string
}
```

### ArrayBuffers

ArrayBuffers are references to fixed-length arrays of contiguous memory. You can't modify or read from an array buffer. Instead we use **Typed arrays** to access and modify ArrayBuffer data.

```ts
// create array buffer of 16 bytes
let arrayBuffer = new ArrayBuffer(16);
```

You can create a new array buffer using the `ArrayBuffer()` constructor, and the only argument it takes in is the size in bytes of the buffer. 

Here are some properties you can access on it: 

- `arrayBuffer.byteLength`: the size in bytes of the array buffer

To manipulate a buffer, we can use these *view* objects, which we can iterate over and modify (but we can't remove or add elements).

- **`Uint8Array`** – treats each byte in `ArrayBuffer` as a separate number, with possible values from 0 to 255 (a byte is 8-bit, so it can hold only that much). Such value is called a “8-bit unsigned integer”.
- **`Uint16Array`** – treats every 2 bytes as an integer, with possible values from 0 to 65535. That’s called a “16-bit unsigned integer”.
- **`Uint32Array`** – treats every 4 bytes as an integer, with possible values from 0 to 4294967295. That’s called a “32-bit unsigned integer”.
- **`Float64Array`** – treats every 8 bytes as a floating point number with possible values from `5.0x10-324` to `1.8x10308`.

Each typed array has these properties:

- `typedArray.buffer`: returns the underlying arraybuffer
- `typedArray.byteLength`: returns the size in bytes of the arraybuffer.



### All together

```ts
class ReadableStreamManager<T extends Uint8Array<ArrayBufferLike>> {
  constructor(public stream: ReadableStream<T>) {}

  // consuming stream methods with async for loop
  async consumeStream() {
    const chunks = [] as T[];
    for await (const chunk of this.stream) {
      chunks.push(chunk);
    }
    return chunks;
  }

  async consumeStreamAsBlob(type: string) {
    const chunks = await this.consumeStream();
    return this.typedArrayToBlob(chunks, type);
  }

  async onConsumeStream(cb: (chunk: T) => Promise<void>) {
    for await (const chunk of this.stream) {
      await cb(chunk);
    }
  }

  typedArrayToBlob(typedArrayData: T[], type: string) {
    return new Blob(typedArrayData, { type });
  }

  // dealing with compression and decompression
  async getCompressedStream() {
    return await ReadableStreamManager.getCompressedStream(this.stream);
  }

  static async getCompressedTextStream(text: string) {
    const encoder = new TextEncodingManager();
    const encodedText = encoder.encodeText(text);
    const compressedStream = new CompressionStream("gzip");
    const writer = compressedStream.writable.getWriter();

    // Write data to the compression stream
    await writer.write(encodedText);
    await writer.close();
    return compressedStream.readable;
  }

  static async getCompressedStream(stream: ReadableStream) {
    const compressedReadableStream = stream.pipeThrough(
      new CompressionStream("gzip")
    );
    return compressedReadableStream;
  }

  static async getDecompressedStream(stream: ReadableStream) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = stream.pipeThrough(ds);
    return decompressedStream;
  }

  async decompressStream() {
    return await ReadableStreamManager.decompressStream(this.stream);
  }

  static async decompressStream(stream: ReadableStream) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = stream.pipeThrough(ds);
    return await new Response(decompressedStream).blob();
  }

  static async decompressBlob(blob: Blob) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    return await new Response(decompressedStream).blob();
  }

  static async streamToResponse(stream: ReadableStream) {
    return new Response(stream);
  }
}

export class TextEncodingManager {
  encoder = new TextEncoder();
  decoder = new TextDecoder();

  encodeText(text: string) {
    return this.encoder.encode(text);
  }

  decodeText(data: Uint8Array) {
    return this.decoder.decode(data);
  }
}
```
## Aborting fetch requests

We can use the `AbortController` class to abort fetch requests if they are taking too long.

The main steps are these:

1. Instantiate an abort controller with `new AbortController()`
2. Connect the abort controller to our fetch call by attaching the `signal` property of the abort controller to the `signal` property of the fetch options object.
3. Call `abort()` on the abort controller after a certain amount of time. The previous connection through the `signal` property will cause the fetch request to abort.

```javascript
async function fetchWithTimeout(
  url: string,
  // RequestInit is the interface for the fetch options object
  options: RequestInit = {},
  timeout = -1
) {
  // user has specified they want a timeout for fetch
  if (timeout > 0) {
    let controller = new AbortController();
    // connect controller to our fetch request through the options object and on options.signal
    options.signal = controller.signal;

    setTimeout(() => {
      // this aborts the controller and any connected fetch requests
      controller.abort();
    }, timeout);
  }

  // need to pass options into fetch so that we get signal connection to abort controller
  return fetch(url, options);
}

// fetches google with a timeout of 1 second, aborting the request if it takes any longer
fetchWithTimeout("https://google.com", {}, 1000);
```

Here is a simpler example: 

```ts
let abortController = new AbortController();
 
fetch('wikipedia.zip', { signal: abortController.signal })
  .catch(() => console.log('aborted!'));
 
// Abort the fetch after 10ms
setTimeout(() => abortController.abort(), 10);
```

## Everything you need to know about CORS

CORS is a way around the SOP (same origin policy) that allows frontend webpages to request different origins in a fetch request in a secure way. 

What’s to prevent a malicious website from requesting APIs with credentials and using it for malicious purposes? Well you have two policies that protect websites:

- **SOP:** same origin policy states that no other website can access or request resources belonging to another website using AJAX.
- **CORS:** cross origin resource sharing is a relaxation on SOP that allows servers to define rules for which websites are allowed to bypass the SOP and request the website’s resources with AJAX. If CORS is not enabled, then only SOP is in effect.

The basic idea behind CORS is to use custom HTTP headers to allow both the browser and the server to know enough about each other to determine if the request or response should succeed or fail.

**deciding to fetch or not**

Browsers have to decide whether they are allowed to make specific AJAX calls to certain websites or not. They do this with a **preflight request**, which makes an `OPTION` request to the requested website and retrieves the server's CORS policy.

Browsers do not send preflight requests and instead allow AJAX calls by default (**safe requests**) in these two scenarios:

1. Making a simple GET request without any custom headers (fetching images, simple APIs, etc.), and the `Content-type` header is one of these three: `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain`.
2. Making a simple POST request without any custom headers or non plain-text content type (form submission) and the `Content-type` header is one of these three: `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain`.

These are called **safe requests**, and will be carried out successfully if the origin requesting the resource is of the allowed origins in the `Access-Control-Allow-Origin` header set by the server.

![](https://javascript.info/article/fetch-crossorigin/xhr-another-domain.svg)

In some cases, a request will send custom headers that are considered unsafe, like "Authorization" or "Api-key", and in that case the request will be denoted as an **unsafe request**.

When an AJAX unsafe request call is made, the browser first performs a preflight check which works as follows: 

A preflight request sends an `OPTIONS` request to the server, with no body and three headers:
- `Access-Control-Request-Method` : the method of the unsafe request.
- `Access-Control-Request-Headers` : comma-separated list of its unsafe HTTP-headers.
- `Origin` : the origin from where the request came. (such as `https://javascript.info`)

Then the server should respond with status 200 and these three headers:
- `Access-Control-Allow-Methods` with a list of allowed methods,
- `Access-Control-Allow-Headers` with a list of allowed headers,
- `Access-Control-Max-Age` with a number of seconds to cache the permissions.

If all of these are allowed by the server's CORS policy, then the request will be made. 

![](https://javascript.info/article/fetch-crossorigin/xhr-preflight.svg)



**deciding to perform the AJAX request or not**

If the browser performs the AJAX request, it then has to decide if it should allow the Javascript code to access the response. The browser will retrieve the CORS policy from the response, and see if the AJAX request conforms to the CORS policy.

If it does, then the Javascript code will have access to the response. If not, the Javascript code will not access the response and an error message is displayed in the Javascript console.

To summarize, the browser checks the CORS policy in 2 cases:

1. Before sending a non standard HTTP requests.
2. Before deciding whether to allow access to the response.

**Creating a cors policy**

To establish a CORS policy so that a webpage can request a server, the server should send back these 4 headers on every response (easily accomplished with express middleware):

- `Access-Control-Allow-Origin`— Determines whether or not the requesting website should be allowed to access the server’s resources. If the string is set to the origin of the requesting website, then it is allowed. Otherwise not.
- `Access-Control-Allow-Methods`—A comma-separated list of allowed methods. If the AJAX request requests the website with an HTTP verb other than from the allowed list, the request is rejected.
- `Access-Control-Allow-Headers`—A comma-separated list of allowed custom headers the AJAX request can have. If the AJAX request has a custom header not in the list, then the request is rejected.
- `Access-Control-Max-Age`—The amount of time in seconds that this preflight request should be cached for.
- `Access-Control-Allow-Credentials`: A boolean that determines whether or not cookies from the requested website should be sent over with the AJAX request. This can lead to a bunch of security exploits, however, like masquerading as another user.

Here is an example:

```ts
Access-Control-Allow-Origin: https://www.mattfriz.com
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: FRIZ
Access-Control-Max-Age: 1728000
Access-Control-Allow-Credentials: false
```

**Security caveats**

The most damaging security aspect of CORS is the ability for hackers to masquerade as authenticated users. They can do this by making an AJAX request **with credentials**, meaning that the requested website sends along all its cookies and gives the AJAX request access to all of them.

For example, the below fetch call will gain access to all the cookies of the website it requests, letting it masquerade as a user and then send the request.

```tsx
fetch(url,{
   method:'post',
   credentials: "include"
});
```

Then sending credentials will only work if the server has the `Access-Control-Allow-Credentials: true` header. 

This is only a problem if authentication is done via cookies, but having authorization be done via HTTP headers like bearer token on requests with the `Authorization` header is much better.

## Requesting data from a server

There are three basic ways of doing several back-and-forth requests between a client and server: 

### Long Polling

For 99% of server and client communication, the client always makes a request to the server. However, there are some occasions where the server needs to notify the client of something. 

When this happens, the client needs to send requests to the server at a constant interval, like every 10 seconds, so that on one of those requests the server can send something back to the client. 

What's the issue? This is extremely inefficient. 

Instead we make use of something called **long polling**, which is where the client sends a request to the server once and leaves the communication hanging until the server responds back with a message. If the request times out, then the client just tries again and hangs. 

![](https://javascript.info/article/long-polling/long-polling.svg)

```ts
async function subscribe() {
  let response = await fetch("/subscribe");

  if (response.status == 502) {
    // Status 502 is a connection timeout error,
    // may happen when the connection was pending for too long,
    // and the remote server or a proxy closed it
    // let's reconnect
    await subscribe();
  } else if (response.status != 200) {
    // An error - let's show it
    showMessage(response.statusText);
    // Reconnect in one second
    await new Promise(resolve => setTimeout(resolve, 1000));
    await subscribe();
  } else {
    // Get and show the message
    let message = await response.text();
    showMessage(message);
    // Call subscribe() again to get the next message
    await subscribe();
  }
}

subscribe();
```


> [!TIP] 
> Long polling works great in situations when messages are rare. Otherwise if messages from the server to client are frequent, then it's better to use websockets. 


### Websockets

Websockets are done by connecting to the secure `wss` or the insecure `ws` protocol.

You can connect to a websocket URL by instantiating the `WebSocket` class:

```ts
let socket = new WebSocket("wss://javascript.info/article/websocket/demo/hello")
```

And then the websocket has access to 4 total events:

```ts
let socket = new WebSocket("wss://javascript.info/article/websocket/demo/hello");

socket.onopen = function(e) {
  alert("[open] Connection established");
  alert("Sending to server");
  socket.send("My name is John");
};

socket.onmessage = function(event) {
  alert(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    alert('[close] Connection died');
  }
};

socket.onerror = function(error) {
  alert(`[error]`);
};
```

#### Sending Messages

Use `socket.send(data)` to send a message. You can send either a string or binary data, which will get encoded into a Blob. 

On the receiving end, the `socket.onmessage()`'s event object will have access to the `event.data` property which is the data sent by `socket.send()`.

#### Closing a socket

The `socket.close(code, message)` method closes the socket connection.  

You can receive the close action with the `socket.onclose` event handler, and access the code through `event.code` and the message through `event.reason`.

```ts
// closing party:
socket.close(1000, "Work complete");

// the other party
socket.onclose = event => {
  // event.code === 1000
  // event.reason === "Work complete"
  // event.wasClean === true (clean close)
};
```

### Server Sent Events

Server sent events are like websockets except the connections are one-way for the server sending data to the client, it's HTTP based, and data is always sent as plain text. 

All data sent from the server to the client will be in the form `data: <some-string>`, and we basically just parse the string that comes after the `data: ` prefix. We can get clever and just send JSON as some string. 

1. Instantiate an `new EventSource(url)` object that connects to your server route that specifically sends back a 200 status response and must send back the `Content-Type: text/event-stream` on this route. 

```ts
const eventSource = new EventSource("/events/subscribe");
```

2. Listen for messages from the `"message"` event on the event source:

```ts
eventSource.addEventListener("message", (e) => {
	const data = e.data
})
```

You can close the connection with `eventSource.close()`. Whenever you want to reconnect, you need to instantiate a fresh object. 

There are three events you can add listeners for on the event source object: 

- `message` – a message received, available as `event.data`.
- `open` – the connection is open.
- `error` – the connection could not be established, e.g. the server returned HTTP 500 status.

