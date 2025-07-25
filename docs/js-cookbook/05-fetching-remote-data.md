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

#### Basics

Readable streams can be created through the `ReadableStream()` constructor, which accepts an object of methods you need to implement:

- `start(controller)`: Called when the stream is created. It allows you to initialize the stream and start the data source.
	- **This method is called only once.**
	-  Inside this method, you should include code that sets up the stream functionality, e.g., beginning generation of data or otherwise getting access to the source.
- `pull(controller)`: Called repeatedly when the stream needs more data, when iterating through the stream. 
	- **This method is called every time a new chunk is consumed**
	- This is where you fetch or generate the next chunk of data and enqueue it using `controller.enqueue(chunk)`.
- `cancel(reason)`: Called when the stream is cancelled via an abort controller or with `stream.cancel()`. This allows you to clean up any resources associated with the stream.

```ts
const readable = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  },
  pull(controller) {
    // Called when consumer wants more data
  },
  cancel(reason) {
    // Called if consumer aborts
  }
});

// consume in for-wait loop
for await (const chunk of readable) {
  console.log(chunk);
}
```

**controller**

The controller is the same for all writable, readable, and transform stream creations. It has these methods:

- `controller.enqueue(chunk)`: writes a chunk to the stream
- `controller.close()`: closes the streaming of data, prevents any more chunks in the data flow.
- `controller.error(err)`: errors out.

**consuming a stream**

To consume a readable stream, you have two methods:

- **async iteration**: You can iterate over it like an async generator.
- **getting the reader**: A readable stream exposes a `readable.reader` object whihc lets you manually read the stream.

**async iteration**

**getting the reader**

You can get a reader using the `readableStream.getReader()` method:

```ts
const reader = readableStream.getReader()
```

You then have access to these methods on the reader, all of which are async.

- `reader.read()`: an iterator method that returns an object with the two proeprties `value` and `done`, just like an `iterator.next()` call.
- `reader.cancel()`: cancels the readable stream consumption and triggers the `cancel()` method override when creating a readable stream.
- `reader.closed`: a promise that if you await for it, blocks the thread until the stream is successfully closed.

```ts
const reader = readable.getReader()
await reader.read()
await reader.cancel()
await reader.closed
```

The basic syntax of consuming a stream through a reader uses an infinite loop:

```ts
async function readData(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // Do something with last chunk of data then exit reader
      return;
    }
    // Otherwise do something here to process current chunk
  }
}
```

Here's an example that shows how to iterate through a reader in a `while` loop, breaking when there is no more data left to read:

```ts
// Create the readable stream
const movieStream = createReadableStream();

// Function to process and log the output from the stream
const processStream = async () => {
  const reader = movieStream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream ended");
      break;
    }
    console.log(value);
  }
};
```

**locked streams**

Only one reader can read a stream at a time; when a reader is created and starts reading a stream (an **active reader**), we say it is **locked** to it. If you want another reader to start reading your stream, you typically need to cancel the first reader before you do anything else.

You can manually release a lock that a `reader` object using the `reader.releaseLock()` method:

```ts
reader.releaseLock()
```
#### Fetching

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

#### Teeing

The issue of streams being locked by one consumer leads us to **teeing**, which duplicates a stream and lets you consume the copy.

- `stream.tee()`: returns a two copies of the same unconsumed stream as a tuple of streams.

Teeing a stream is especially useful if you need multiple consumers of the same stream. A stream can only be consumed once, so `stream.tee()` makes copies of the unconsumed stream.

```ts
const [stream1, stream2] = this.stream.tee();
```

When reading from streams, keep in mind to support canceling fetch requests and backpressure:


> [!NOTE] 
> **Backpressure**, a commonly overlooked aspect of streams, refers to the phenomenon where data is produced at a faster rate than it can be consumed. Ignoring backpressure can result in high memory consumption leading to decreased application performance.



### Writable streams

#### Basics

Writable streams are created through instantiating the `WritableStream` class with an object of options. These are the 4 methods you can override:

- `start(controller)`: Called when the stream is created. It allows you to initialize the stream and prepare the sink.
	- **this method is only called once**.
- `write(chunk, controller)`: Called when a new chunk of data is available. This is where you write the chunk to the sink.
	- **this method is called every time the writable stream writes data, implicitly or manually**
- `close(controller)`: Called when the stream is closed. This allows you to finalize the writing process and clean up any resources.
- `abort(reason)`: Called when the stream is aborted. This allows you to handle errors and clean up resources.

```ts
const writableStream = new WritableStream({
  start(controller) {
    // Initialize the stream (e.g., open a file)
    console.log("Writable stream started");
  },
  async write(chunk, controller) {
    // Write the chunk to the sink (e.g., write to a file)
    console.log("Writing chunk:", chunk);
    // Simulate an asynchronous write operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
  close(controller) {
    // Finalize the writing process (e.g., close the file)
    console.log("Writable stream closed");
  },
  abort(reason) {
    // Handle errors (e.g., delete the partially written file)
    console.error("Writable stream aborted:", reason);
  },
});
```

Here is an example of creating a writable that writes data with a delay:

```ts

const squareTransform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk * chunk);
  },
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// create a writable that streams data.
function createStreamingWritable(ms: number) {
  const writable = new WritableStream({
    async write(chunk, controller) {
      await delay(ms);
      console.log(chunk);
    },
    close() {
      console.log("Stream closed");
    },
    abort(err) {
      console.error("Stream aborted", err);
    },
    start(controller) {
      console.log("stream started");
    },
  });
  return writable;
}

let stream = getNumberStream(1, 10);
const delayStream = createStreamingWritable(1000);
stream
	.pipeThrough(squareTransform) // apply transform
	.pipeTo(delayStream); // apply writable.
``` 

**locking**

When a writer is created and starts writing to a stream (an **active writer**), it is said to be **locked** to it. Only one writer can write to a writable stream at one time. If you want another writer to start writing to your stream, you typically need to abort it before you then attach another writer to it.

You can do this through the `writer.abort()` method.

#### writable stream methods

You can get a manual writer from a writable stream using the `writable.getWriter()` method, which is the second method of writing a writable stream if you don't pipe a readable stream to a writable stream.

```ts
const writer = writable.getWriter();
```

And here are the methods you have on a writer:

```ts
const writer = writable.getWriter();
await writer.ready;

await writer.write('Hello');
await writer.write('World');
await writer.close();
await writer.abort();
```

- `writer.ready`: an asynchronous promise if you resolve, it will wait until the writable is ready.
- `writer.write(chunk)`: manually writes a chunk
- `writer.close()`: closes the writable stream, stops writing.
- `writer.abort()`: aborts the writable stream, releasing the lock.

#### Queuing strategies and backpressure

the chunks in a stream that have not yet been processed and finished with are kept track of by an internal queue.

- In the case of readable streams, these are the chunks that have been enqueued but not yet read
- In the case of writable streams, these are chunks that have been written but not yet processed by the underlying sink.

Internal queues employ a **queuing strategy**, which dictates how to signal backpressure based on the **internal queue state.**

The calculation performed is like so, where **high water mark** is the maximum size in bytes a chunk can be.

```
highWaterMark - total size of chunks in queue = desired size
```

The **desired size** is the number of chunks the stream can still accept to keep the stream flowing but below the high water mark in size. Here is the effect desired size has on backpressure:

- If the desired size is above 0, then that means we are writing faster than we are reading, and there is no backpressure
- If the desired size is below 0, then that means it means that chunks are being generated faster than the stream can cope with, which results n backpressure.
#### Custom class

And here is a class that abstracts over writing chunks of data to a writable stream:

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

### Transform stream

You can create a transform stream by instantiating the `TransformStream` class, whose constructor accepts an object of options. You should override these methods:

- `transform(chunk, controller)`: how you should transform the chunk that's coming from a readable stream, and enqueue that with a controller.

```ts
const squareTransform = new TransformStream({
  transform(chunk: number, controller) {
    controller.enqueue(chunk * chunk);
  },
});
```

A transform stream gets applied to a readable stream through this syntax, as you'll see in the pipeline section:

```ts
const transformedReadableStream = readableStream.pipeThrough(transformStream)
```
#### Built in transform streams

JS offers some built in transform streams that inherit from the `TransformStream` class:

- `TextDecoderStream`: a transform stream that decodes uint8arrays into plain text.
- `TextEncoderStream`: a transform stream that encodes text into uint8arrays
- `CompressionStream`: a transform stream that compresses a stream based on the GZIP algorithm
- `DecompressionStream`: a transform stream that compresses a stream based on the GZIP algorithm

#### Stream Compression API

The `CompressionStream` and `DecompressionStream` classes are used to create compressed and decompressed streams respectively, which are both transform streams.

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
    const decompressedReadbleStream = stream.pipeThrough(ds);
    return decompressedReadableStream;
  }

const response = await fetch("bruh.png")
// get back readable stream that is compressed
const compressedStream = await getCompressedStream(response.body)
// get back decompressed readable stream
const decompressedStream = await getDecompressedStream(compressedStream)
```


### Pipeline

Now that we know how to make transform streams, we can put readable streams, transform streams, and writable streams in a pipeline together:

```ts
const upperCase = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});

const readable = new ReadableStream({
  start(controller) {
    controller.enqueue('hello');
    controller.enqueue('world');
    controller.close();
  }
});

const writable = new WritableStream({
  write(chunk) {
    console.log('Transformed:', chunk);
  }
});

readable
  .pipeThrough(upperCase) // pipeThrough() applies transform stream
  .pipeTo(writable);  // pipeTo() finishes pipeline, piping to readable
```

To form a pipeline, you use these methods on a readable stream: `readable.pipeThrough()` and `readable.pipeTo()`

- To apply transform streams, you use the `readable.pipeThrough()` method and pass in a transform stream, and you can chain as many of these as you want.
- To finish the pipeline, you use the `readable.pipeTo()` method and pass in a writable stream. You can have only one of these per pipeline.

Here are the differences between these two methods:

- `readable.pipeThrough(transformStream)`: accepts a transform stream, applies it, and returns a `ReadableStream`
- `readable.pipeTo(writableStream)`: accepts a writable stream and pipes to it fully, returning nothing and fully consuming the readable stream

### Text encoding and decoding

Binary data is easy to work with, but text needs encoding and decoding. 

Here is how to use the `TextEncoder()` and `TextDecoder()` classes, both of which encode and decode `utf8` by default.

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

#### Encoders

You can create a text encoder through the `TextEncoder` class, optionally passing in a text encoding type, which defaults to `"utf-8"`.

```ts
const encoder = new TextEncoder(); // Defaults to UTF-8
// Or, specify an encoding:
const encoder = new TextEncoder('ISO-8859-1'); // Latin-1
const encoder = new TextEncoder('UTF-16LE'); // UTF-16 Little Endian
```

The encoder has two available methods for encoding strings and returning them as binary data represented by an `UInt8Array` instance:

- `encoder.encode(str)`: encodes the string to a uint8array
- `encoder.stream(str)`: encodes the string to a `ReadableStream` that streams chunks of the uint8array.

#### Decoders

You can create a text decoder that decodes uint8arrays to strings through the `TextDecoder` class, optionally passing in a text encoding type, which defaults to `"utf-8"`.

```ts
const decoder = new TextDecoder(); // Defaults to UTF-8
// Or, specify an encoding:
const decoder = new TextDecoder('ISO-8859-1'); // Latin-1
const decoder = new TextDecoder('UTF-16LE'); // UTF-16 Little Endian
```

The decoder has two available methods for decoding the uint8arrays and returning them as strings.

- `decoder.decode(unit8array)`: decodes the array to a string
- `decoder.stream(uint8array)`: decodes the array to a `ReadableStream` that streams chunks of the string.

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

## Requesting realtime data from a server

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

#### The thundering herd

The worst case scenario is what we called the thundering herd. I've discussed this previously in my databases courses when talking about caches and how you can overwhelm your servers when your cache misses and every user directly hits your server. This is a similar problem we can cause with polling where we have an error in our polling so every user immediately makes another request to try to recover.

To avoid making requests all at once and retrying all at once, you can implement **backoff**, which waits a certain period of time before requesting the API route to your server again. 

```ts
function longPoll( onFetch: () => Promise<boolean>, options?: {
	backoff? : number,
	maxFailedTries?: number,
	onMaxFailedTriesReached?: () => void
} ) {
	let timeToMakeNextRequest = 0;
	let failedTries = 0;
	const BACKOFF = options?.backoff || 5000
	async function rafTimer(time) {
	  // failed more times than we alotted
	  if (failedTries > maxFailedTries) {
		  options?.onMaxFailedTriesReached?.()
	  }

	  if (timeToMakeNextRequest <= time) {
	    const failed = await onFetch();
	    failedTries = failed ? (failedTries + 1) : 0
	    timeToMakeNextRequest = time + INTERVAL + failedTries * BACKOFF;
	  }
	  requestAnimationFrame(rafTimer);
	}

	let animationId : number | undefined;

	return {
		startPolling: () => {
			animationId = requestAnimationFrame(rafTimer);
		},
		stopPolling: () => {
			animationId && clearAnimationFrame(animationId)
		}
	}
}
```

Here's an example of how we would implement it:

```ts
// function with try catch
async function getNewMsgs() {
  try {
    const res = await fetch("/poll");
    const json = await res.json();

    if (res.status >= 400) {
      throw new Error("request did not succeed: " + res.status);
    }

    allChat = json.msg;
    render();
    return true // succeeded
  } catch (e) {
    // back off
    toast("hhmmmm something isn't working rn ... hold tight")
    return false // failed
  }
}

const {startPolling, stopPolling} = longPoll(getNewMsgs, {
	maxFailedTries: 5,
	onMaxFailedTries: () => {
		stopPolling()
		console.log("WTFF U FAILED")
	}
})
```

### HTTP 2

You can use HTTP 2 **server push** technique to stream a unidirectional data flow to the client. The client chooses how to consume the continuous flow of data.

### Websockets

Websockets are done by connecting to the secure `wss` or the insecure `ws` protocol. They start in 4 stages:

- **Handshake:** Starts as an HTTP request, then upgrades to WebSocket.
- **Open Connection:** Client and server can now send messages independently.
- **Message Exchange:** Messages are exchanged in real time.
- **Close:** Either side can close the connection.

Let's go through the first step, which is the handshake. 

**handshake**
****
The first thing that needs to happen is the client sends an HTTP request to the server with these headers, asking the server to pretty please switch to a websockets protocol.

This is done through javascript using the native `WebSocket` class, where the client tries to request an upgrade to the websocket protocol at the server route URL you pass in.

```ts
const webSocket = new WebSocket("ws://localhost:8000/websocket")
```

Since we instantiated a `WebSocket` instance at `ws://localhost:8000/websocket`, that makes an HTTP request with a **websocket upgrade request** to `http://localhost:8000/websocket`.

Here is what the request constructed behind the scenes would look like:

![](https://i.imgur.com/eGJohYL.png)

For example, the complete request would look like this:

```http
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

The server gets to choose how to respond, either agreeing to upgrade the websocket connection or by refusing to upgrade. 

If the server agrees, it will send back a response with these headers:

![](https://i.imgur.com/Qnq3LZq.png)

The complete response would look like this:

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

Additionally, the server can decide on extension/subprotocol requests here; see [Miscellaneous](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#miscellaneous) for details. The `Sec-WebSocket-Accept` header is important in that the server must derive it from the [`Sec-WebSocket-Key`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-WebSocket-Key) that the client sent to it. To get it, concatenate the client's `Sec-WebSocket-Key` and the string `"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"` together (it's a "[magic string](https://en.wikipedia.org/wiki/Magic_string)"), take the [SHA-1 hash](https://en.wikipedia.org/wiki/SHA-1) of the result, and return the [base64](https://en.wikipedia.org/wiki/Base64) encoding of that hash.

After the correct values are sent over, the handshake is complete.

**keeping track of clients**

This doesn't directly relate to the WebSocket protocol, but it's worth mentioning here: your server must keep track of clients' sockets so you don't keep handshaking again with clients who have already completed the handshake. The same client IP address can try to connect multiple times. However, the server can deny them if they attempt too many connections in order to save itself from DDOS attacks.
#### Creating client connection

You can connect to a websocket URL by instantiating the `WebSocket` class:

```ts
let socket = new WebSocket("wss://javascript.info/article/websocket/demo/hello")
```

And then the websocket has access to 4 total events, which can all also be translated to their event listener flavor if you desire to manage multiple event listeners instead of just one true one.

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

- `socket.onopen`: Triggered when the socket connection is successfully open
- `socket.onmessage`: Triggered on a message to the client
- `socket.onclose`: Triggered when the socket connection is closed.
- `socket.onerror`: Triggered on a connection error.
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

#### Client class

This is a fully type-safe abstraction over using websockets in the client:

```ts
type Payloads<
  SendPayload extends Record<string, unknown>,
  ReceivePayload extends Record<string, unknown>
> = {
  sendMessagePayload: SendPayload;
  receiveMessagePayload: ReceivePayload;
};

// WebSocket client for real-time communication
class WebSocketClient<T extends Record<string, Payloads<any, any>>> {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private handleMessageListeners: Record<
    keyof T,
    (payload: T[keyof T]["receiveMessagePayload"]) => void
  > = {} as Record<
    keyof T,
    (payload: T[keyof T]["receiveMessagePayload"]) => void
  >;

  constructor(private url: string) {}

  public get connected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  async connect() {
    try {
      this.socket = new WebSocket(this.url);
      await this.setupEventListeners();
    } catch (error) {
      console.error("Failed to connect to WebSocket server:", error);
      await this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    return new Promise<void>((resolve, reject) => {
      this.socket!.onopen = () => {
        console.log("Connected to WebSocket server");
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        resolve();
      };

      this.socket!.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as {
            type: keyof T;
            payload: T[keyof T]["receiveMessagePayload"];
          };
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          reject(error);
        }
      };

      this.socket!.onclose = () => {
        console.log("Disconnected from WebSocket server");
        this.#connected = false;
        this.handleReconnect();
        reject(new Error("WebSocket connection closed"));
      };

      this.socket!.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    });
  }

  private handleMessage(data: {
    type: keyof T;
    payload: T[keyof T]["receiveMessagePayload"];
  }) {
    this.handleMessageListeners[data.type](data.payload);
  }

  onMessage<K extends keyof T>(
    key: K,
    listener: (payload: T[K]["receiveMessagePayload"]) => void
  ) {
    this.handleMessageListeners[key] = listener;
  }

  private async handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts)
      ); // Exponential backoff

      await this.connect();
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page."
      );
    }
  }

  sendMessage<K extends keyof T>(key: K, message: T[K]["sendMessagePayload"]) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: key, payload: message }));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

```

And here's how you would use it:

```ts
// Initialize the WebSocket client when the page loads

const wsClient = new WebSocketClient<{
  MESSAGE_TYPE1: {
    sendMessagePayload: { message: string };
    receiveMessagePayload: { message: string };
  };
}>("ws://localhost:8000/websocket");
wsClient
  .connect()
  .then(() => {
    wsClient.onMessage("MESSAGE_TYPE1", (payload) => {
      console.log(payload);
    });
    wsClient.sendMessage("MESSAGE_TYPE1", { message: "Hello, world!" });
  })
  .catch((error) => {
    console.error(error);
  });
```


#### Websockets on the server: express + WS

The `ws` package offers primitives for creating a websocket server:

```ts
const WebSocket = require('ws');

// setup a new WebSocket Server
const wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log('Server is running');
});

// setup connection and message listeners
wss.on('connection', ws => {
    ws.on('message', message => {
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });
});
```


Here is an example of an express app that uses websockets, combining with the `ws` package

```ts
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });


wss.on('connection', (client) => {
  console.log('Client connected');

  client.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Echo or broadcast the message
	client.send(`Server received: ${message}`);
  });

  client.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });

  client.on('error', (err) => {
    console.error('WebSocket error', err);
  });
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running.');
});

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
```

You can access all connected clients through the `wss.clients` property, and broadcoast messages to all clients like so:

```ts
wss.clients.forEach((client) => {
	if (client.readyState === WebSocket.OPEN) {
		client.send(msg);
	}
});
```

### Server Sent Events

Server sent events are like websockets except the connections are one-way for the server sending data to the client, it's HTTP based, and data is always sent as plain text. 

> [!WARNING]
>  When **not used over HTTP/2**, SSE suffers from a limitation to the maximum number of open connections, which can be especially painful when opening multiple tabs, as the limit is _per browser_ and is set to a very low number (6).

All data sent from the server to the client will be in the form `data: <some-string>`, and we basically just parse the string that comes after the `data: ` prefix. We can get clever and just send JSON as some string. 

1. Instantiate an `new EventSource(url)` object that connects to your server route that specifically sends back a 200 status response and must send back the `Content-Type: text/event-stream` on this route. 

```ts
const eventSource = new EventSource("/events/subscribe", {
	withCredentials: true
});
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

#### Server side

Here is a full example of sending server-sent data from a server to a client. 

The **server side** must comply with these rules:

1. Must send back a `ReadableStream` as a response
2. Must send back these headers, with a `text/event-stream` content type.

```ts
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
```

Here is a basic, reusable example that lets you create a readable stream and not worry about formatting the data:

```ts
const getControllerHelpers = (
  controller: ReadableStreamDefaultController<any>
) => {
  return {
    addTextStreamData(data: Record<string, any>) {
      const rawEventStreamMessage = `data: ${JSON.stringify(data)}\n\n`;
      // const encodedMessage
      controller.enqueue(rawEventStreamMessage);
    },
    close() {
      controller.close();
    },
  };
};

function createTextEventStream(options: {
  onStart: (helpers: ReturnType<typeof getControllerHelpers>) => Promise<void>;
  onPull?: (helpers: ReturnType<typeof getControllerHelpers>) => Promise<void>
}) {
  const textEncoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await options.onStart(getControllerHelpers(controller));
    },
    async pull(controller) {
      await options.onPull?.(getControllerHelpers(controller));
    },
    cancel() {
      stream.cancel();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

And here's a complete example:

```ts
app.get("/realtime/:id", async (_req, info, params) => {
  const shortCode = info?.pathname.groups["id"] as string;
  const response = await fetch("/public/bruh.png");
  const stream = response.body?.getReader();
  if (!stream) {
    return app.text("Stream not found", 404);
  }
  // Create stream response body
  const body = new ReadableStream({
    async start(controller) {
      // Fetch initial data if needed
      // const initialData = await getShortLink(shortCode);
      // controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ clickCount: initialData.clickCount })}\n\n`));

      while (true) {
        const { done, value } = await stream.read();
        if (done) {
          return;
        }
        const bits = value?.length;

		// this is how we keep adding to the stream
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              bits,
            })}\n\n`
          )
        );
        console.log("Stream updated");
      }
    },
    cancel() {
      stream.cancel();
    },
  });

	// exact headers required to start event stream
  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});
```

#### Consuming from frontend

And this is how you would consume from the frontend:

```ts
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('realtime script loaded')
    const pathParts = window.location.pathname.split('/');
    const shortCode = pathParts[pathParts.length - 1]; 

	// 1. create event source listening to route on current origin
    const eventSource = new EventSource('/realtime/' + shortCode);

	// 2.  create handle message handler
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        document.getElementById('clickCount').innerText = data.clickCount
    };

	// 3. create handle error handler
    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
    };
});
```

#### COmplete example:

send from server like so:

```ts
const getControllerHelpers = (
  controller: ReadableStreamDefaultController<any>
) => {
  return {
    addTextStreamData(data: Record<string, any>) {
      const rawEventStreamMessage = `data: ${JSON.stringify(data)}\n\n`;
      // const encodedMessage
      controller.enqueue(rawEventStreamMessage);
    },
    close() {
      controller.close();
    },
  };
};

function createTextEventStream(options: {
  onStart: (helpers: ReturnType<typeof getControllerHelpers>) => Promise<void>;
  onPull?: (helpers: ReturnType<typeof getControllerHelpers>) => Promise<void>;
}) {
  const textEncoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await options.onStart(getControllerHelpers(controller));
    },
    async pull(controller) {
      await options.onPull?.(getControllerHelpers(controller));
    },
    cancel() {
      stream.cancel();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

const server = Bun.serve({
  port: 3000, // Optional; defaults to process.env.PORT || 3000
  routes: {
    "/": appHTML,
    "/event-stream": (req) => {
      const eventResponse = createTextEventStream({
        onStart: async ({ addTextStreamData, close }) => {
          addTextStreamData({ dog: "bruh" });
          addTextStreamData({ dog: "bruh2" });
          addTextStreamData({ dog: "bruh3" });
          close();
        },
      });
      return eventResponse;
    },
  },
})
```

COnsume like so:

```ts
const eventSource = new EventSource("/event-stream");

// 2.  create handle message handler
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("data from stream", data);
};

// 3. create handle error handler
eventSource.onerror = (error) => {
  console.error("EventSource failed:", error);
  eventSource.close();
};
```