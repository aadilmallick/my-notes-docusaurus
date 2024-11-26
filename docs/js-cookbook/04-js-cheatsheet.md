# JavaScript Cheatsheet

## String methods

```javascript
// Obtaining portions of a string
s.substring(1, 4); // => "ell": the 2nd, 3rd, and 4th characters.
s.slice(1, 4); // => "ell": same thing
s.slice(-3); // => "rld": last 3 characters
s.split(", "); // => ["Hello", "world"]: split at delimiter string

// Searching a string
s.indexOf("l"); // => 2: position of first letter l
s.indexOf("l", 3); // => 3: position of first "l" at or after 3
s.indexOf("zz"); // => -1: s does not include the substring "zz"
s.lastIndexOf("l"); // => 10: position of last letter l

// Boolean searching functions in ES6 and later
s.startsWith("Hell"); // => true: the string starts with these
s.endsWith("!"); // => false: s does not end with that
s.includes("or"); // => true: s includes substring "or"

// Creating modified versions of a string
s.replace("llo", "ya"); // => "Heya, world"
s.toLowerCase(); // => "hello, world"
s.toUpperCase(); // => "HELLO, WORLD"
s.normalize(); // Unicode NFC normalization: ES6
s.normalize("NFD"); // NFD normalization. Also "NFKC", "NFKD"

// Inspecting individual (16-bit) characters of a string
s.charAt(0); // => "H": the first character

// String padding functions in ES2017
"x".padStart(3); // => "  x": add spaces on the left to a length of 3
"x".padEnd(3); // => "x  ": add spaces on the right to a length of 3
"x".padStart(3, "*"); // => "**x": add stars on the left to a length of 3
"x".padEnd(3, "-"); // => "x--": add dashes on the right to a length of 3

// Space trimming functions. trim() is ES5; others ES2019
" test ".trim(); // => "test": remove spaces at start and end
" test ".trimStart(); // => "test ": remove spaces on left. Also trimLeft
" test ".trimEnd(); // => " test": remove spaces at right. Also trimRight
```

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

