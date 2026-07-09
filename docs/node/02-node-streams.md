
## Event Emitter

The event emitter api in node allows you to partake in event-based programming and is extremely simple, just based on a single messaging event.

The basic premise is that an `new EventEmitter()` instance has only two important methods: `emitter.emit()` to trigger events and send a payload, and `emitter.on()` to listen for events and access the payload. 

```ts
const EventEmitter = require("events");

const emitter = new EventEmitter();

// 1. setup listener
emitter.on("redevent", () => console.log("RED EVENT FIRED"));

// 2. emit/trigger event
emitter.emit("redevent");
```

You can extend the event emitter class to create event-based programming easy:

```ts
const EventEmitter = require('events');

class MyCustomEmitter extends EventEmitter {
  constructor() {
    super(); // Call the parent constructor
    this.data = [];
  }

  addItem(item) {
    this.data.push(item);
    this.emit('itemAdded', item); // Emit an event when an item is added
  }

  processData() {
    // Simulate some processing
    console.log('Processing data...');
    this.emit('processingComplete', this.data.length); // Emit event on completion
  }
}

const myObject = new MyCustomEmitter();

myObject.on('itemAdded', (item) => {
  console.log(`New item added: ${item}`);
});

myObject.once('processingComplete', (count) => {
  console.log(`Finished processing ${count} items.`);
});

myObject.addItem('A');
myObject.addItem('B');
myObject.processData();

```

We can take this a step further and make a generic, type safe class wrapper around this:

```ts
import { EventEmitter, on } from "node:events";

type EventsType = Record<string, any>;

export class EventEmitterNode<T extends EventsType> {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  sendEvent<K extends keyof T>(event: K, data: T[K]) {
    this.emitter.emit(event as string, data);
  }

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    this.emitter.on(event as string, callback);
    return {
      removeListener: () => this.off(event, callback),
    };
  }

  once<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    this.emitter.once(event as string, callback);
  }

  async *consumeEventStream<K extends keyof T>(event: K, signal?: AbortSignal) {
    for await (const data of on(this.emitter, event as string, { signal })) {
      yield data as T[K];
    }
  }

  off<K extends keyof T>(event: K, callback: (data: T[K]) => void) {
    this.emitter.off(event as string, callback);
  }
}

```

And here is how you would use this:

```ts
const partyEmitter = new EventEmitterNode<{
  "party-started": { name: string; time: string };
  "party-ended": { bummer: boolean };
}>();

partyEmitter.onEvent("party-started", (data) => {
  console.log(`Party started: ${data.name} at ${data.time}`);
});

partyEmitter.sendEvent("party-started", { name: "Party", time: "2025-05-24" });
```

> [!NOTE]
> Event emitters are synchronous by nature, meaning that an `eventEmitter.emit()` call is blocking until the listener for that event finishes executing.



## Streams in Node

### Why Streams?

In Node.js, garbage collection helps manage memory by cleaning up unused data. There are two types:

- **Scavenge**: This is a quick, lightweight cleanup that handles short-term memory. It runs frequently and cleans up small amounts of memory without stopping the Node.js process, so it has minimal impact on performance.  
- **Mark-sweep**: This is a more thorough cleanup that stops the Node.js process to identify and remove larger amounts of unused memory. Because it pauses the application, it can affect performance more noticeably.

To run a node app with garbage collection information, use the `--trace_gc` flag:

```bash
node --trace_gc app.js
```

In this HTTP server example, we are loading entire files in memory. This causes a **mark-sweep** garbage collection to clean up large objects at a time, thus increasing memory and CPU utilization of the program, which is bad.

```ts
import { createServer } from "node:http"
import fs from "fs/promises"


const server = createServer(async (req, res) => {
	// read large file into memory then send it all at once.
	const data = await fs.readFile("largevideo.mp4")
    res.writeHead(200, { "Content-Type" : "video/mp4" });
    res.end(data)
})

// 4. start the server on a port
server.listen(3000)
```

But when we create a readable stream with the file as the producer using the `fs.createReadStream(filename)` method, and then pipe it to the response, we send back small chunks of data at a time to the client, improving garbage collection tactics resulting in only **scavenge** garbage collection calls.


```ts
import { createServer } from "node:http"
import fs from "fs/promises"


const server = createServer(async (req, res) => {
    res.writeHead(200, { "Content-Type" : "video/mp4" });
    
    // create readable stream from file producer and pipe it to response
    fs.createReadStream('largevideo.mp4').pipe(res)
})

// 4. start the server on a port
server.listen(3000)
```


### Stream basics

Streams are a way of handling data in node in a way that is memory-efficient. It allows you to **stream** data, never having it all in memory. This is useful for handling large files, or large amounts of data.

```javascript
import fs from "fs";
const readableStream = fs.createReadStream("file.txt");
const writableStream = fs.createWriteStream("file2.txt");

readableStream
  .pipe(writableStream)
  .on("finish", () => console.log("Done!"))
  .on("error", (error) => console.log(error.message));
```

The primary benefits of using streams are:

- **Memory Efficiency:** Process large files or data sets in chunks, avoiding the need to load the entire content into memory. This prevents out-of-memory errors and keeps your application lightweight.
- **Time Efficiency:** Start processing data as soon as the first chunk arrives, rather than waiting for the entire resource to be available. This can lead to faster perceived performance.
- **Composability:** Streams are designed to be easily "piped" together, creating a clear and efficient data pipeline. This makes complex data processing workflows more manageable and readable.

There are 4 types of streams;

- **readable streams**: read data in chunks, can pipe to other writable streams
- **writable streams**: For writing data that is accessed from a readable stream.
- **duplex streams**: Streams that are both readable and writable
- **transform streams**: duplex streams that modify data in a pipeline

| Stream Type   | Description                              | Examples                                        |
| ------------- | ---------------------------------------- | ----------------------------------------------- |
| **Readable**  | Emits data (you consume it)              | `fs.createReadStream()`, `http.IncomingMessage` |
| **Writable**  | Accepts data (you write to it)           | `fs.createWriteStream()`, `http.ServerResponse` |
| **Duplex**    | Read + write                             | `net.Socket`                                    |
| **Transform** | Duplex that **modifies** data on the fly | `zlib.createGzip()`                             |

### Readable and writable streams

#### Basics of readable streams

Readable streams inherit from the `EventEmitter` class, so they have 4 events they can listen to:

- `'data'`: Emitted when a chunk of data is available.
- `'end'`: Emitted when there is no more data to consume.
- `'error'`: Emitted if an error occurs while reading.
- `'close'`: Emitted when the underlying resource (e.g., file descriptor) has been closed.

The main use case for using a readable stream is to pipe it to a writable stream, like `process.stdout`

```ts
import fs from "fs";

const readStream = fs.createReadStream("src/streams/roadmaps.json");

// pipe to a writable stream
readStream.pipe(process.stdout);
```

The basic syntax for creating a read stream using the `fs.createReadStream()` method is like so, where we create a readable stream with a specific file as a producer.

```ts
const readableStream = fs.createReadStream(filepath, options)
```

Here are the options you have access to in the `options` object:

- `encoding`: the file encoding, like `"utf8"`
- `highWatermark`: the size of each chunk in the stream, in bytes
- `start`: Starting byte position to read fro
- `end`: Ending byte position to read to

By default, the `highWatermark` property when creating a readable stream reads 64kb chunks at a time. We can make it more memory-efficient by making each chunk smaller, like 1024 bytes only.

```ts
const readable = fs.createReadStream(file, {
    encoding: "utf8",
    highWaterMark: 1024, // 1 KB chunks
  });

  readable.on("data", (chunk) => {
    console.log("Received chunk:", chunk.length);
  });

  readable.on("end", () => {
    console.log("Done reading file");
  });
```

#### **consuming readable streams**

Readable streams operate in two modes:

1. **Flowing mode**: Data is read automatically and provided as quickly as possible
2. **Paused mode**: The `read()` method must be called explicitly to get chunks

There are three ways to consume readable streams in node:

1. **async iteration**: you can consume streams with the `for await` syntax, which activates **flowing mode**.
2. **event listeners**: By setting event listeners on the stream for the `"data"` event, you activate **flowing mode**.
3. **using `readable.read()`**: This imperatively reads chunks at a time and activates **paused mode**.

To manually switch to paused mode, you can use the `readableStream.pause()` method.

```ts
readableStream.pause();
```

You can now use async iteration to consume readable streams in node:

```ts
const fs = require('fs');

async function readFileInChunks() {
  const stream = fs.createReadStream('./bigfile.txt', { encoding: 'utf8' });

  for await (const chunk of stream) {
    console.log('Chunk:', chunk.length);
  }
}
readFileInChunks();
```

Here's an example of where we can pipe to a node script or accept any amount of standard input by consuming the `process.stdin` stream:

```ts
const content = []
process.stdin.on('data', (chunk) => {
    content.push(chunk.toString())
})

process.stdin.on('end', () => {
    console.log('finished stream with ' + content.length + ' chunks.')
})
```

ANd this was what was run:

```bash
echo 'bruh' | deno run -A streams.ts
```
#### Basics of Writable streams

To create a writable stream from a file, you use the `fs.createWriteStream()` method:

```ts
const writable = fs.createWriteStream(filepath, options)
```

Here are the options you have access to in the `options` object:

- `encoding`: the file encoding, like `"utf8"`
- `highWatermark`: the size of each chunk in the stream, in bytes

On a writable stream, you have access to the `writable.write(chunk)` method, which writes a chunk manually to the stream. This method returns a `boolean` that describes the status of the buffer:

- If `writable.write(chunk)` returns **true**, then the buffer is OK and there is no backpressure.
- If `writable.write(chunk)` returns **false**, then the buffer has backpressure and we have to relieve the backpressure.

```ts
const writable = fs.createWriteStream("./src/streams/output.txt", {
	highWaterMark: 1024,
	encoding: "utf8",
});
let isBufferOk = false;

isBufferOk = writable.write("Hello\n");
isBufferOk = writable.write("World\n");
console.log("isBufferOk", isBufferOk);

// setus up event listener for when writable ends.
writable.end(() => {
	console.log("All writes are complete!");
});
```

You then use `writable.end()` to signal you're done writing and to close the writable stream automatically.

**methods**

- `writable.write(chunk)`: writes a chunk to the writable stream and returns a boolean where if true, there is no backpressure, and if false, there is backpressure.
- `writable.end(cb)`: runs a callback when you're done with all your writes, triggering the `'end'` event on the writable stream

**events**

Here are the 4 events you can listen to on a writable stream:

- `'drain'`: Emitted when the internal buffer of the writable stream has been emptied and it's safe to write more data. This is crucial for backpressure handling.
- `'finish'`: Emitted when you invoke `writable.end()` to signal you're done writing and all data has been flushed to the underlying system.
- `'error':` Emitted if an error occurs while writing.
- `'close':` Emitted when the underlying resource has been closed.

**built-in writable streams**

`process.stdout` and `process.stderr` are two built-in writable streams that you can write to.
#### Combining readable and writable streams

**level 1: piping**

The main use case for readable and writable streams is to pipe the contents of a readable stream into a writable stream. The basic syntax is to the use `readable.pipe()` method on a readable stream, and pass a writable stream into that.

```ts
readable.pipe(writable)
```

The rules of piping are as follows:

1. The `.pipe()` method only exists on readable streams, so readable streams are the only ones that can start a pipeline.
2. You can only pipe to transform streams and writable streams

The main problem with piping however, is that if an error occurs, the stream automatically closes and the data flow is broken. The new `pipeline()` function handles these edge cases:

**level 2: pipeline**

The basic syntax for the `pipeline()` function from the `node:stream` library is as follows, where you can pass in an ordered spread arguments of readable, writable, and transform streams and then for the last argument, and error callback.

```ts
await pipeline(...streams, (err) => {})
```

Below is an example of a file read stream piping to a transform stream which then pipes to a writable stream (`process.stdout`), but the pipeline allows for error handling.

```ts
const fs = require('node:fs');
const { Transform, pipeline } = require('node:stream');

let errorCount = 0;
const upper = new Transform({
  transform: function (data, enc, cb) {
    if (errorCount === 10) {
      return cb(new Error('BOOM!'));
    }
    errorCount++;
    this.push(data.toString().toUpperCase());
    cb();
  },
});

const readStream = fs.createReadStream(__filename, { highWaterMark: 1 });
const writeStream = process.stdout;

readStream.on('close', () => {
  console.log('Readable stream closed');
});

upper.on('close', () => {
  console.log('\nTransform stream closed');
});

writeStream.on('close', () => {
  console.log('Writable stream closed');
});

pipeline(readStream, upper, writeStream, err => {
  if (err) {
    return console.error('Pipeline error:', err.message);
  }
  console.log('Pipeline succeeded');
});
```

**level 3: async pipeline**

The asynchronous `pipeline()` function also accepts async generators as transform streams:

```ts
const fs = require('node:fs');
const { pipeline } = require('node:stream/promises');

async function main() {
  await pipeline(
    fs.createReadStream(__filename), // 1. create read stream
    async function* (source) {       // 2. async generator as transform stream
      for await (let chunk of source) {
        yield chunk.toString().toUpperCase();
      }
    },
    process.stdout.  // 3. last in pipeline is writable stream
  );
}

main().catch(console.error);

```
#### Handling backpressure

**Backpressure** is a crucial concept in stream handling. It refers to the mechanism by which a slow consumer (writable stream) tells a fast producer (readable stream) to slow down, preventing the consumer's internal buffer from overflowing.

> [!NOTE]
> Think of streams as a faucet (source) and drain (sink):
> 
> - If the **sink is slow**, and you keep pouring, you’ll overflow.
> - Backpressure is a signal: **"Stop sending data until I’m ready again."**



![](https://i.imgur.com/PZvkkGF.jpeg)

Let's take a deeper look at this analogy to define key terms

- **backpressure**: this is like the water in the hose. If it fills up to the top, then there is backpressure.
- **water mark**: this is how much water the hose can handle flowing through it at once before there is backpressure. This is an attribute you set on the writable stream.
	- A low watermark means backpressure occurs more often and you have to wait for it to drain often.
	- A high watermark means backpressure occurs less often but that means each chunk takes up more memory in the app, sort of defeating the purpose of streams.


> [!NOTE]
> If you use the `readable.pipe(writable)`, the method of piping automatically handles backpressure for you. 

If instead you use the event listeners, you have to manually pause and resume streams like so:

```ts
readable.on('data', chunk => {
  if (!writable.write(chunk)) {
    readable.pause(); // backpressure signal
  }
});

writable.on('drain', () => {
  readable.resume(); // sink is ready again
});
```

To handle backpressure manually, the consumer side must pause the readable if the `writable.write(chunk)` method returns false (signals backpressure), and also listen to the `'drain'` event and resume the readable in the event handler.

To handle backpressure on the producer side, the readable stream has access to these methods:

- `readable.pause()`: Pauses the `'data'` event.
- `readable.resume()`: Resumes the `'data'` event.

**summary**

Backpressure is handled automatically when piping from a producer to a consumer with the `readable.pipe(writable)` method, but if you want to stop backpressure manually, you must follow these steps:

### Custom readable and writable streams

#### Extending readable streams

You can create your own implementations of readable streams by extending from the `Readable` class or creating an instance of it.

The subclass must implement the `_read()` method, intended to push a chunk to the stream, which gets called when consuming the stream either in flowing or paused mode.

The `this.push()` inherited method is what readable stream implementations use behind the scenes to push a chunk of data to the stream.

- **add chunks**: You add chunks to the readable stream through the `this.push(chunk)` method.
- **end stream**: You signify that the stream has ended through the `this.push(null)` method.

The superclass constructor takes in an object of options:

- `encoding`: the type of encoding to use for the data chunks. By default, chunks are binary and are outputted as `Buffer` instances.
- `objectMode`: a boolean configuring whether or not to enable **object mode**, where the stream produces chunks of JavaScript objects and you can consume the objects as is.

```ts
class ReadableImplementation extends Readable {
  constructor() {
    super({
	    encoding: 'utf-8'
    });
  }
}
```


Here's a more fleshed out example.

```ts
const { Readable } = require('stream');

class Counter extends Readable {
  constructor(options) {
    super(options);
    this.count = 0;
    this.maxCount = 10;
  }

  _read() {
    if (this.count < this.maxCount) {
      const chunk = `Number: ${this.count++}\n`;
      // Push the data to the internal buffer
      this.push(chunk);
    } else {
      // Signal that there's no more data
      this.push(null);
    }
  }
}

const counterStream = new Counter();

// consume data in flowing mode through event listeners,
// calls _read() implicitly._
counterStream.on('data', (chunk) => {
  console.log(chunk.toString());
});

counterStream.on('end', () => {
  console.log('Counting finished.');
});

counterStream.on('error', (err) => {
  console.error('Counter stream error:', err);
});
```

On any readable stream, you can manually read chunks of data through the `readable.read()` method.

Here is an example of how we can create our own custom readable streams and consume them:

> [!IMPORTANT]
> Since readable streams are observables, they won't start emitting until you explicitly decide to read them with `stream.read()` or setting up the event listeners.

```ts
import fs from "fs";
import { Writable, Transform, Duplex, Readable, ReadableOptions } from "stream";
import { pipeline } from "node:stream/promises";

class StreamUtils {
  static createTransformStream(transformFunction: (chunk: Buffer) => Buffer) {
    return new Transform({
      transform(chunk, encoding, callback) {
        const transformed = transformFunction(chunk);
        this.push(transformed);
        callback();
      },
    });
  }

  static createDelayStream(delay: number) {
    return new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        setTimeout(() => {
          callback();
        }, delay);
      },
    });
  }
}

class CustomReadable extends Readable {
  constructor(options: ReadableOptions) {
    super(options);
  }

  addBinaryChunk(chunk: Buffer) {
    this.push(chunk);
  }

  addTextChunk(chunk: string) {
    this.push(chunk, "utf-8");
  }

  end() {
    this.push(null);
  }
}

class FileReader extends CustomReadable {
  private stream: fs.ReadStream;

  constructor(file: string, options: ReadableOptions) {
    super(options);
    this.stream = fs.createReadStream(file, options);

    this.stream.on("data", (chunk) => {
      this.addTextChunk(chunk.toString());
    });

    this.stream.on("end", () => {
      this.end();
    });

    this.stream.on("error", (err) => {
      this.emit("error", err);
    });
  }

  _read(size?: number): void {
    // event listeners will handle the reading
  }
}

// 1. create readable of file
  const readable = new FileReader(file, {
    highWaterMark: 256,
    encoding: "utf-8",
  });

// 2. set transform streams
const upperCaseTransform = StreamUtils.createTransformStream((chunk) => {
	return Buffer.from(chunk.toString().toUpperCase());
});
const streamDelayTransform = StreamUtils.createDelayStream(150);

// 3. run pipeline
  await pipeline(
    readable,
    upperCaseTransform,
    streamDelayTransform,
    process.stdout
  );
```

#### Creating custom readable streams

You can create custom readable streams which might be easier than inheriting it. These are the options and methods you provide when creating a `Readable` instance:

- `objectMode`: if true, then you can deal with streaming objects instead of buffers or strings.
- `read()`: this implements `_read()` under the hood, where you have access to `this.push(chunk)` to add data to the stream or `this.push(null)` to end data.

```ts
const createReadableStream = new Readable({
  objectMode: true,
  async read() {
    try {
      const rows = await fetchData(offset, CHUNK_SIZE); 
      if (rows.length) {
        rows.forEach((row) => this.push(row));
        offset += CHUNK_SIZE;
      } else {
        this.push(null); // End of stream
      }
    } catch (err) {
      this.destroy(err);
    }
  },
});

// Log the output from the stream
createReadableStream
  .on("data", console.log)
  .on("end", () => console.log("Stream ended"))
  .on("error", (err) => console.error("Stream error:", err));
```


#### Extending writable streams

You can create your own implementations of writable streams by extending from the `Writable` class or from instantiating it

- The subclass must implement the `_write()`, `_construct()`, and `_destroy()` methods
- You add chunks to the readable stream through the `this.push(chunk)` method.
- You signify that the stream has ended through the `this.push(null)` method.

```ts
const { Writable } = require('stream');

class UppercaseWriter extends Writable {
 constructor(options) {
   // Calls the stream.Writable() constructor
   super(options);
 }

 _write(chunk, encoding, callback) {
   // Convert the chunk to uppercase
   const uppercase = chunk.toString().toUpperCase();

   // Print to the console
   process.stdout.write(uppercase);

   // Call callback to indicate we're ready for the next chunk
   callback();
 }
}

// Create an instance of our custom stream
const uppercaseWriter = new UppercaseWriter();

// Write data to it
uppercaseWriter.write('Hello, ');
uppercaseWriter.write('world!\n');
uppercaseWriter.write('This text will be uppercase.\n');
uppercaseWriter.end();

uppercaseWriter.on('finish', () => {
 console.log('All data has been processed');
});
```

#### Creating custom writable streams

Instantiating the `Writable` class with these options creates a custom writable stream:

- `objectMode`: a boolean, whether or not to enable object mode.
- `write(chunk, encoding, callback)`: calls and overrides the `_write()` method under the hood, which is needed to create a writable. Here are the arguments:
	- `chunk`: the current chunk to consume
	- `encoding`: the encoding of the chunk
	- `callback()`: invoking this method signals that you're ready to process the next chunk.

```ts
import { Writable } from "node:stream";

// Create a writable stream function
const createWritableStream = () => {
  return new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      console.log(chunk);
      callback();
    },
  });
};
```

#### **object mode**
****

**object mode** is when you want to deal with streaming javascript objects, which can be useful for having efficient application logic. You can read and write objects by creating readable and writable streams with the `objectMode` property set to true:

```ts
const { Readable } = require('node:stream');

// creates stream of object
const readable = new Readable({
  objectMode: true,
  read() {
    this.push({ hello: 'world' });
    this.push(null);
  },
});

// consumes streams of objects
const writable = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      console.log(chunk);
      callback();
    },
});

readable.pipe(writable)
```

Here's a wrapper around creating obejct streams:

```ts
class ObjectStreamManager<T extends Record<string, any>> {
  private writable: Writable;
  private readable: Readable;
  constructor({
    addChunks,
    onWriteChunk,
    shouldEndStream,
  }: {
    addChunks: () => T[];
    shouldEndStream: () => boolean;
    onWriteChunk: (chunk: T) => void;
  }) {
    this.readable = new Readable({
      objectMode: true,
      read(size) {
        const chunks = addChunks();
        chunks.forEach((chunk) => this.push(chunk));
        if (shouldEndStream()) {
          this.push(null);
        }
      },
    });

    this.writable = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        onWriteChunk(chunk);
        callback();
      },
    });
  }

  consume() {
    this.readable.pipe(this.writable);
  }
}

function* createDogs(num: number) {
  for (let i = 0; i < num; i++) {
    yield {
      name: `dog ${i}`,
      breed: "golden lab",
    };
  }
}

const objectStream = new ObjectStreamManager({
  addChunks: () => {
    return [...createDogs(20)];
  },
  shouldEndStream: () => true,
  onWriteChunk: (chunk) => {
    console.log(chunk);
  },
});

objectStream.consume();
```
### Transform Streams and duplex streams

#### Duplex streams

**Duplex streams** are middlemen streams that sit between a readable stream and a writable stream on a pipeline, where they are neither producer or consumer, but rather they just access the chunks of data as the flow in.

Here is how a pipeline with a duplex stream works:


```
readable -> duplex -> writable
```

1. Readable stream produces and pipes data to duplex stream
2. Duplex stream does something with each chunk of data as it comes in, either modifying it or reading it
3. Writable stream consumes data, ending the pipeline.

There are two types of duplex streams:

- **duplex streams**: A passthrough stream that simply reads chunks of data as they come in from a producer.
- **transform streams**: A special type of duplex stream that performs transformations on chunks of data as they come in from a producer.

Here's an example of creating a simple duplex stream with a `PassThrough` utility class from the `node:stream` library:

```ts
import { PassThrough } from 'node:stream'

const loggerStream = new PassThrough()
loggerStream.on('data', (chunk) => { 
    console.log(`chunk size: ${chunk.toString().length}`)
})

process.stdin  // readable
		.pipe(loggerStream) // duplex
		.pipe(process.stdout) // writable
```


#### Creating custom duplex streams

You can create custom duplex streams (and even transform streams from this) by extending the `Duplex` class from the `node:stream` library.

This class has three methods that must be overriden:

- `_read()`: the standard `_read()` method to implement for readable streams, where you push chunks of data to the stream with `this.push(chunk)` and end the producer stream with `this.push(null)`
- `_write(chunk, encoding, done)`: The standard `_write()` method to implement for writable streams, where you write chunks of data at a time.
	- You invoke the `done()` callback when you are done writing that specific chunk and then are ready for the next chunk to come.
- `_final(done)`: This method is called after the writable stream portion of the duplex has finished writing all chunks. 
	- You invoke the `done()` callback when you are done with all writes and you are ready to become the producer for the writable stream in the pipeline.

```ts
const { Duplex } = require('stream');

class NumberDuplex extends Duplex {
 constructor(options) {
   super(options);
   this.current = 0;
   this.max = 5;
   this.received = [];
 }

 _read() {
   this.current++;
   if (this.current <= this.max) {
     this.push(`${this.current}\n`);
   } else {
     this.push(null);
   }
 }

 _write(chunk, encoding, callback) {
   this.received.push(chunk.toString().trim());
   callback();
 }

 _final(callback) {
   console.log('Received messages:', this.received);
   callback();
 }
}

const duplex = new NumberDuplex();

// Read side
duplex.on('data', (chunk) => {
 console.log('Read:', chunk.toString());
});

duplex.on('end', () => {
 console.log('Read complete');
});

// Write side
duplex.write('a');
duplex.write('b');
duplex.write('c');
duplex.end();

```

Here are the override methods in a bot more depth

- The **`_write()` method override** handles each chunk of data written to the stream. It processes the chunk (in the video, it pushes the chunk onward) and then calls a callback to signal that writing is complete. In the example, it uses a delay (throttling) before calling the callback to slow down the data flow.  
- The **`_final()` method override** is called when no more data will be written to the stream. It signals the end of the writable side by pushing `null`, which tells the stream pipeline that writing is finished and the stream can close properly.
- You only need to override `_read()` if your stream needs to generate or push data to be read. Since this throttle stream just passes data through without generating new data, `_read()` can remain empty.

```ts
import { PassThrough, Duplex } from 'node:stream'

const loggerStream = new PassThrough()
loggerStream.on('data', (chunk) => { 
    console.log(`chunk size: ${chunk.toString().length}`)
})


class ThrottleDuplex extends Duplex {
    constructor(private ms: number) {
        super()
    }

    _write(chunk, encoding, done) {
        this.push(chunk)
        setTimeout(done, this.ms)
    }

    _read() {}

    _final(done) {
        console.log('done writing all chunks')
        done()
    }
}

const throttle = new ThrottleDuplex(250)
process.stdin
    .pipe(throttle)
    .pipe(loggerStream)
    .pipe(process.stdout)

```


#### Creating transform streams

Transform streams let you hook into readable streams and modify data in the pipeline. If a readable streams pipes to a transform stream, you can perform modifications to each chunk in a memory-efficient way.

To create a transform stream, you create a `Transform` stream instance like so:

1. Override the `transform()` callback on a chunk
2. Use the `this.push(chunk)` method to stream the new transformed chunks
3. Invoke `callback()` to ensure that the modifications on the chunk are finished.

```ts
const transformStream = new Transform({
	transform(chunk, encoding, callback) {
		// perform modifications on chunk
		this.push(transformedChunk)
		callback()
	}
})
```

Then as shown in the example below, all we do is pipe the readable stream to the transform stream (which returns a readable stream), and then pipe that to a writable stream.

```ts
import { Writable, Transform, Duplex } from "stream";

  const readable = fs.createReadStream(file, {
    encoding: "utf8",
    highWaterMark: 1024, // 1 KB chunks
    autoClose: true,
  });

  const upperCase = new Transform({
    transform(chunk, encoding, callback) {
      const transformed = chunk.toString().toUpperCase();
      this.push(transformed);
      callback();
    },
  });

  readable.pipe(upperCase).pipe(process.stdout);
```

You can also create an artificial delay with streams by delaying and invoking the `callback()` in a `setTimeout`:

```ts
const streamDelayTransform = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk);
      setTimeout(() => {
        callback();
      }, 150);
    },
  });
```

Here's a utility class for creating transform streams:

```ts
import fs from "fs";
import { Writable, Transform, Duplex, Readable, ReadableOptions } from "stream";
import { pipeline } from "node:stream/promises";

class StreamUtils {
  static createTransformStream(transformFunction: (chunk: Buffer) => Buffer) {
    return new Transform({
      transform(chunk, encoding, callback) {
        const transformed = transformFunction(chunk);
        this.push(transformed);
        callback();
      },
    });
  }

  static createDelayStream(delay: number) {
    return new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        setTimeout(() => {
          callback();
        }, delay);
      },
    });
  }
}
```
#### Stream compression with GZIP

You can use the `zlib` library which has utility methods for transform streams that compress and decompress streams using the GZIP algorithm.

```ts

import zlib from "zlib";

  const readable = fs.createReadStream(file, {
    encoding: "utf8",
    highWaterMark: 256,
  });

  const compressed = readable.pipe(zlib.createGzip());
  const decompressed = compressed.pipe(zlib.createGunzip());
  decompressed.pipe(process.stdout);
```

- `zlib.createGzip()`: a transform stream that compresses chunks using the GZIP algorithm.
- `zlib.createGunzip()`: a transform stream that decompresses chunks using the GZIP algorithm.

