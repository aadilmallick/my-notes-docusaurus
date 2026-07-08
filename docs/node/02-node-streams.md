## Streams

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

Readable streams in nodejs have 4 events they can listen to:

- 'data': Emitted when a chunk of data is available.
- 'end': Emitted when there is no more data to consume.
- 'error': Emitted if an error occurs while reading.
- 'close': Emitted when the underlying resource (e.g., file descriptor) has been closed.

This is the most basic example of using a readable stream:

- The main use case for using a readable stream is to pipe it to a writable stream, like `process.stdout`

```ts
import fs from "fs";

const readStream = fs.createReadStream("src/streams/roadmaps.json");

// pipe to a writable stream
readStream.pipe(process.stdout);
```

The basic syntax for creating a read stream using the `fs.createReadStream()` method is like so:

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

**consuming streams**

Readable streams operate in two modes:

1. **Flowing mode**: Data is read automatically and provided as quickly as possible
2. **Paused mode**: The `read()` method must be called explicitly to get chunks

There are three ways to consume readable streams in node:

- **async iteration**: you can consume streams with the `for await` syntax, which activates **flowing mode**.
- **event listeners**: By setting event listeners on the stream for the `"data"` event, you activate **flowing mode**.
- **using `readable.read()`**: This imperatively reads chunks at a time and activates **paused mode**.

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

#### Basics of Writable streams

To create a writable stream from a file, you use the `fs.createWriteStream()` method:

```ts
const writable = fs.createWriteStream(filepath, options)
```

Here are the options you have access to in the `options` object:

- `encoding`: the file encoding, like `"utf8"`
- `highWatermark`: the size of each chunk in the stream, in bytes

ON a writable stream, you have access to the `writable.write(chunk)` method, which write a chunk manually to the stream. This method returns a boolean that describes the status of the buffer:

- If `writable.write(chunk)` returns true, then the buffer is OK and there is no backpressure.
- If `writable.write(chunk)` returns false, then the buffer is false and we have to relieve the backpressure.

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

- The `.pipe()` method only exists on readable streams, so readable streams are the only ones that can start a pipeline.
- You can only pipe transform streams and writable streams

The main problem with piping however, is that if an error occurs, the stream automatically closes and the data flow is broken. The new `pipeline()` function handles these edge cases:

**level 2: pipeline**

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

Think of streams as a faucet (source) and drain (sink):
- If the **sink is slow**, and you keep pouring, you’ll overflow.
- Backpressure is a signal: **"Stop sending data until I’m ready again."**

If you use the `readable.pipe(writable)`, the method of piping automatically handles backpressure for you. If instead you use the event listeners, you have to manually pause and resume streams like so:

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

To handle backpressure on the producer side, the readable stream has access to these methods:

- `readable.pause()`: Pauses the 'data' event.
- `readable.resume()`: Resumes the 'data' event.

#### Extending readable streams

You can create your own implementations of readable streams by extending from the `Readable` class or creating an instance of it.

- The subclass must implement the `_read()` method, which gets called when consuming the stream either in flowing or paused mode.
- You add chunks to the readable stream through the `this.push(chunk)` method.
- You signify that the stream has ended through the `this.push(null)` method.

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
### Transform Streams

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

