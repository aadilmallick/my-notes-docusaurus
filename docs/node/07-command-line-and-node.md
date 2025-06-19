# Command line and Node basics

## Command line arguments

You can get all the command line arguments you type in from the `process.argv` array. However, this stores all the command line arguments. 

`node index.js` is itself two command line arguments:
- The first argument will always be the path to the node binary
- The second argument will always be the filepath of the file node is running
- Any additional arguments are ones you pass in.

So to parse any arguments you pass in, you have to start looking from the 2nd element onward in `process.argv`.

## Process and OS


```javascript
process.argv; // An array of command-line arguments.
process.arch; // The CPU architecture: "x64", for example.
process.cwd(); // Returns the current working directory.
process.chdir(); // Sets the current working directory.
process.cpuUsage(); // Reports CPU usage.
process.env; // An object of environment variables.
process.execPath; // The absolute filesystem path to the node executable.
process.exit(); // Terminates the program.
process.exitCode; // An integer code to be reported when the program exits.
process.getuid(); // Return the Unix user id of the current user.
process.hrtime.bigint(); // Return a "high-resolution" nanosecond timestamp.
process.kill(); // Send a signal to another process.
process.memoryUsage(); // Return an object with memory usage details.
process.nextTick(); // Like setImmediate(), invoke a function soon.
process.pid; // The process id of the current process.
process.ppid; // The parent process id.
process.platform; // The OS: "linux", "darwin", or "win32", for example.
process.resourceUsage(); // Return an object with resource usage details.
process.setuid(); // Sets the current user, by id or name.
process.title; // The process name that appears in `ps` listings.
process.umask(); // Set or return the default permissions for new files.
process.uptime(); // Return Node's uptime in seconds.
process.version; // Node's version string.
process.versions; // Version strings for the libraries Node depends on.
```

```javascript
const os = require("os");
os.arch(); // Returns CPU architecture. "x64" or "arm", for example.
os.constants; // Useful constants such as os.constants.signals.SIGINT.
os.cpus(); // Data about system CPU cores, including usage times.
os.endianness(); // The CPU's native endianness "BE" or "LE".
os.EOL; // The OS native line terminator: "\n" or "\r\n".
os.freemem(); // Returns the amount of free RAM in bytes.
os.getPriority(); // Returns the OS scheduling priority of a process.
os.homedir(); // Returns the current user's home directory.
os.hostname(); // Returns the hostname of the computer.
os.loadavg(); // Returns the 1, 5, and 15-minute load averages.
os.networkInterfaces(); // Returns details about available network. connections.
os.platform(); // Returns OS: "linux", "darwin", or "win32", for example.
os.release(); // Returns the version number of the OS.
os.setPriority(); // Attempts to set the scheduling priority for a process.
os.tmpdir(); // Returns the default temporary directory.
os.totalmem(); // Returns the total amount of RAM in bytes.
os.type(); // Returns OS: "Linux", "Darwin", or "Windows_NT", e.g.
os.uptime(); // Returns the system uptime in seconds.
os.userInfo(); // Returns uid, username, home, and shell of current user.
```

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



## File System

### Filepath manipulation

```javascript
// Some important paths
process.cwd(); // Absolute path of the current working directory.
__filename; // Absolute path of the file that holds the current code.
__dirname; // Absolute path of the directory that holds __filename.
os.homedir(); // The user's home directory.

const path = require("path");

path.sep; // Either "/" or "\" depending on your OS

// The path module has simple parsing functions
let p = "src/pkg/test.js"; // An example path
path.basename(p); // => "test.js"
path.extname(p); // => ".js"
path.dirname(p); // => "src/pkg"
path.basename(path.dirname(p)); // => "pkg"
path.dirname(path.dirname(p)); // => "src"

// normalize() cleans up paths:
path.normalize("a/b/c/../d/"); // => "a/b/d/": handles ../ segments
path.normalize("a/./b"); // => "a/b": strips "./" segments
path.normalize("//a//b//"); // => "/a/b/": removes duplicate /

// join() combines path segments, adding separators, then normalizes
path.join("src", "pkg", "t.js"); // => "src/pkg/t.js"

// resolve() takes one or more path segments and returns an absolute
// path. It starts with the last argument and works backward, stopping
// when it has built an absolute path or resolving against process.cwd().
path.resolve(); // => process.cwd()
path.resolve("t.js"); // => path.join(process.cwd(), "t.js")
path.resolve("/tmp", "t.js"); // => "/tmp/t.js"
path.resolve("/a", "/b", "t.js"); // => "/b/t.js"
```

#### Important paths

- `process.cwd()`: Absolute path of the current working directory.
- `__filename`: Absolute path of the file that holds the current code. Right now this is the absolut path of `07-command-line.md`
- `__dirname`: Absolute path of the directory that the current file lives in
- `os.homedir()`: The user's home directory.
- `path.sep`: Either "/" or "\" depending on your OS, used for path separators.

#### Path methods

- `path.basename(filepath)`: Returns the basename (filename) of the path, like json.txt
- `path.extname(filepath)`: Returns the extension of the path, like `.txt`
- `path.dirname(filepath)`: Returns the directory name of the path, like `./src/pkg`
- `path.resolve(filepath)`: Returns the absolute path of the given filepath

### Get file info

The `fs.statSync()` method takes in a filepath and returns information about that file or folder, returning a `stats` object. The `stats` object has the following properties and methods:

- `stats.isFile()`: Returns true if the path is a file
- `stats.isDirectory()`: Returns true if the path is a directory
- `stats.size`: Returns the size of the file in bytes

```javascript
const fs = require("fs");
let stats = fs.statSync("book/ch15.md");
stats.isFile(); // => true: this is an ordinary file
stats.isDirectory(); // => false: it is not a directory
stats.size; // file size in bytes
```

### `__dirname` in es6 modules

When using es6 modules in node by change the `"type"` key in the package json to `"module"`, you no longer have access to the `__dirname` variable. To get the current directory, instead you have to do code like this: 

```js
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// import.meta.url is the URL version of the filepath of the current file
const currentFileURL = import.meta.url;
// 1. convert import.meta.url to a static filepath
// 2. get the directory path of the directory that houses that filepath
const currentDir = dirname(fileURLToPath(currentFileURL));
// you now have access to the current directory as you please
const DB_FILE = join(currentDir, "db.json");
```

## Running CLI commands in Node

The `child_process` module in node allows you to run command line tools from within your nodeJS program, like `cd`, `ls`, and much more.

You can import it like so: 
```ts
import * as child_process from "child_process";
```

### ExecSync

The `child_process.execSync(command, options)` method takes in a string command as its first argument, an an object of options as its second.

This method invokes a unix shell and runs the command in that shell, returning the standard output of the command as a string. If the command fails, it throws an error.

```ts
import * as child_process from "child_process";

async function runLinuxCommandLevel1() {
  try {
    // run the ls -l . command and store stdout in the output variable
    let output = child_process.execSync("ls -l .", {
      encoding: "utf8",
    });
    console.log(output);
  } catch (err) {
    // if the command fails, catch the error and log it
    console.log(err);
  }
}
```

### ExecFileSync

For a more performant way of running linux commands, we can use the `child_process.execFileSync(command, args, options)` method. This method takes in a command as its first argument, an array of arguments and options as its second, and an object of options as its third.

You can also execute scripts you wrote yourself with this. 
- First argument: the file/script or command to run
- Second argument: a list of command line options to pass in
- Third argument: options like encoding

It's more perfomant because it doesn't spawn a shell, but instead runs the command directly.

```ts
async function runLinuxCommandLevel2() {
  try {
    let output = child_process.execFileSync("ls", ["-l", "."], {
      encoding: "utf8",
    });
    console.log(output);
  } catch (err) {
    console.log(err);
  }
}
```

### Spawn

With the `child_process.spawn()` method, we can have a more asynchronous approach where we listen to the stdout and stderr streams from executing a command. 

```ts
const commandListener = spawn(command, [option1, option2, ...], options)
```

Like the other methods, here are the arguments in order: 
- First argument: the file/script or command to run
- Second argument: a list of command line options to pass in
- Third argument: options like encoding

```ts
const { spawn } = require("child_process");
// runs this command: identify -verbose bidengoeshard.png
const identify = spawn("identify", ["-verbose", "bidengoeshard.png"]);

// handles the stdout stream
identify.stdout.on("data", (data: string) => {
  // prints out the output in the command line from running the identify command
  console.log(`stdout:\n ${data}`);
});

// handles the stderr stream
identify.stderr.on("data", (data: string) => {
  // prints out the error in the command line, if any, when running the identify command
  console.log(`stderr:\n ${data}`);
});

identify.on("exit", (code: number) => {
  console.log(`child process exited with code ${code}`);
});
```

### Wrapper CLI class

Here's a wrapper CLI class around all of that:

### Using 3rd party libraries: zx

Install like so:

```bash
npm i zx
npm i -D @types/fs-extra @types/node
```

Just like how you can do bun shell scripting with `$`, you can do the exact same thing with google's `zx` library, which uses tagged template literal functions and escapes and sanitizes all input.

```ts
import { $ } from 'zx';

await $`ls -la`;
const branch = await $`git branch --show-current`;
await $`mkdir -p ${branch}/src`;
```

- `$`: tagged template literal function that runs shell commands asynchronously and returns a `ProcessOptions` object
- `$.sync`: tagged template literal function that runs shell commands synchronously and returns a `ProcessOptions` object

Here is what the `ProcessOptions` object that is returned looks like, and you can just print it out with the `toString()` implementation.

```ts
class ProcessOutput {
  readonly stdout: string
  readonly stderr: string
  readonly signal: string
  readonly exitCode: number

  toString(): string // Combined stdout & stderr.
}
```

#### Not awaiting the promise

The `$` async function doesn't return a normal promise. Rather it returns a wrapper aorund that promise called a `ProcessPromise`, which has extra utilities like seeing the duration of the promise, what stage it is in, and even getting data from the promise without outputting to the command line.

When you don't await the promise, you can do stuff with it:

```ts
const p = $`echo 'foo\nbar'`

await p.text()        // foo\n\bar\n
await p.text('hex')   //  666f6f0a0861720a
await p.buffer()      //  Buffer.from('foo\n\bar\n')
await p.lines()       // ['foo', 'bar']
await $`echo '{"foo": "bar"}'`.json() // {foo: 'bar'}
```

You can even consume it in an async generator fashion with a `for ... await` loop:

```ts
const p = $`echo "Line1\nLine2\nLine3"`
for await (const line of p) {
  console.log()
}
```

You can use them in a stream-like fashion:

```ts
await $`echo "Hello, stdout!"`
  .pipe('/tmp/output.txt') // pipes stream output to a file
```

You can also pipe shell commands together:

```ts
const greeting = await $`printf "hello"`
  .pipe($`awk '{printf $1", world!"}'`)
  .pipe($`tr '[a-z]' '[A-Z]'`)

echo(greeting)
```

#### Advantages and niche features

The zx library offers a couple of niche yet appreciated features that improves DX greatly:

- No need to put anything like double quotes or single quotes, because anything interpolated with the tagged template literals `${...}` is automatically parsed and put in single quotes.
- You can pass in an array of flags instead of joining them with spaces.


```ts
const flags = [
  '--oneline',
  '--decorate',
  '--color',
]
await $`git log ${flags}`
```

Since zx escapes everything by default, you can't use glob syntax. Instead, you have to use this `glob()` function:

```ts
const files = await glob('./**/*.md')
await $`ls ${files}`
```

Since zx escapes everything by default, you can't refer to the home directory with `~`. Rather, you must get it programmatically through something like `os.homedir()` 

```ts
await $`ls ${os.homedir()}/Downloads` // Correct
```

![assembling commands](https://res.cloudinary.com/dsmvtmv8z/image/upload/v1748440241/image-clipboard-assets/cbr8kowzywcys6oawfvi.webp)


## PM2

The `pm2` command line tool which you can install with `npm i -g pm2` allows you to run node programs as **daemon threads**, meaning that the will continue to run in the background perpetually until you yourself tell them to stop executing.

```bash
pm2 start my-node-program.js
```

### PM2 commands

- `pm2 start <file>`: starts the node program as a daemon thread
- `pm2 stop <file>`: stops the node program
- `pm2 restart <file>`: restarts the node program
- `pm2 delete <file>`: deletes the node program from the list of programs that pm2 is managing
- `pm2 list`: lists all the running pm2 programs

### PM2 options

- `-l <logfile>` : outputs logs to the specified log file
- `-o <logfile>`: Log stdout from the script to the specified output file
- `-e <logfile>`: Log stderr from the script to the specified error file
- `--watch`: Watch for changes and restart the application
- `-n <name>`: Set the name of the application in pm2

Here is an example with all these options put together:

```bash
pm2 start  -l forever.log -o out.log -e err.log -n app_name index.js --watch
```
