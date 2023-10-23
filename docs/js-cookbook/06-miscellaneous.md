# Web applications with JavaScript

## Location

The `window.location` global object is of type `Location`, and has these following useful properties and methods:

- `window.location.href` : the full URL of the page
- `window.location.assign(url)` : navigates to the given URL, preserve browser history
- `window.location.replace(url)` : navigates to the given URL, replacing browser history. Disables the ability to go back to previous page
- `window.location.reload()` : reloads the page

For navigation relative to the website, you can use the `document.location` variable.

- `document.location = "#top"` : navigates to the top of the page
- `document.location = "page2.html"` : navigates to page2.html, just as an example

## Script tag behavior

There are three important attributes that you should know when dealing with script tags: `async`, `defer`, and `type`.

- `async` : the script will be downloaded asynchronously, and executed as soon as it is available. The HTML parsing will not wait for the script to be downloaded and executed.
- `defer` : the script will be downloaded asynchronously, and executed only after the entire web page has loaded
- `type: "module"`: makes this script a module type, allowing you to import and export variables, but also makes the script behave as if it had a `defer` attribute, downloading script asynchronously and executing it after the entire web page has loaded.

## Buffers

Buffers are a sequence of bytes used in file I/O operations. They are useful for reading and writing binary data.

You can encode strings as buffers, and decode buffers back into strings. Here are the supported encoding algorithms buffers use:

- `ascii` : for 7-bit ASCII data only. This encoding is fast and will strip the high bit if set.
- `utf8` : Default encoding with unicode support
- `base64` : Base64 encoding

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

## Document and viewport

### Element bounding box

We can get the dimensions and coordinate position of an element using the `element.getBoundingClientRect()` method. It returns an object with the following properties:

- `x` : the x coordinate of the element relative to the viewport
- `y` : the y coordinate of the element relative to the viewport
- `width` : the width of the element
- `height` : the height of the element
- `top` : the y coordinate of the upper left corner of the element
- `left` : the x coordinate of the upper left corner of the element
- `right` : the x coordinate of the lower right corner of the element
- `bottom` : the y coordinate of the lower right corner of the element

```javascript
const heading = document.querySelector("h2");
const bounds = heading.getBoundingClientRect();
```

### Finding element from a point

If you have a set of `(x, y)` coordinates, you can find the element that has that point within its bounding box using the `document.elementFromPoint(x, y)` method.

```javascript
// finds the element that has the point (120, 16) within its bounding box
const el = document.elementFromPoint(120, 16);
console.log(el);
```

### Scroll

The code below scrolls so that the bottom of the document is in view. The scroll coordinates of `window.scrollTo(start, end)` are based on the upper left y coordinate of the document.

- 0 represents the top of the document
- `document.documentElement.offsetHeight - window.innerHeight` represents the bottom of the document (top of the viewport at the bottom of the document)

```javascript
let documentHeight = document.documentElement.offsetHeight;
let viewportHeight = window.innerHeight;
// scrolls to the bottom of the document
window.scrollTo(0, documentHeight - viewportHeight);
```

You can also scroll like this with `window.scrollTo(options)`:

```javascript
window.scrollTo({
  left: 0,
  top: documentHeight - viewportHeight,
  behavior: "smooth",
});
```

- `left` : the x coordinate to scroll to. Keep this 0 to prevent horizontal scrolling
- `top` : the y coordinate to scroll to
- `behavior` : the scroll behavior, `smooth` for smooth scrolling
