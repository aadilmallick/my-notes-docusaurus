
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

## Clustering

Node.js runs on a single thread by default, which means it can only use one CPU core at a time. This limits how much work it can do simultaneously, especially on machines with multiple cores.  
  
The `node:cluster` module helps solve this by creating multiple worker processes—think of these as separate mini-applications—that can run on different CPU cores. There's one master process that manages these workers.  
  
Here's how it works:  
  
- The master process starts first and then forks (creates) a worker process for each CPU core available, except one core reserved for the master.
- Each worker runs the main application code independently.
- Node.js uses IPC to distribute incoming requests evenly among the workers, like a traffic controller directing cars to different lanes.
- If a worker crashes, the master detects this and automatically starts a new worker to keep things running smoothly.

This setup allows your app to handle more requests at the same time, improving performance.



> [!NOTE]
> Clustering in a nutshell
> ***
> The main process uses the `fork()` and `exec()` system calls to create child processes and via the `node:cluster` module, you have the ability to run logic either in the main parent process (called **master process**) or in the spawned process  (called **child process**) you create via `cluster.fork()`.

Here is the basic way to use the cluster module:

```ts
import cluster from 'node:cluster'
import os from 'node:os'
import process from 'node:process'

const isMasterProcess = cluster.isMaster
const numCPUs = os.cpus().length

// if main parent process
if (cluster.isMaster) {
	console.log(`Master process with PID=${process.pid} is running`)
	
	// 1. then create as many child processes as CPU cores
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork()
	}
	
	// 2. then handle exited child processes and refork them
	cluster.on('exit', (worker) => {
		console.log(`worker with PID=${worker.process.pid} just died`)
		cluster.fork()
	})
}

// if child process, then run work that can be designated to other threads
else {
	// do stuff like connect to DB, connect to cache, establish cron jobs, etc.
}
```

You can only spawn as many child processes via the `cluster.fork()` method as there are CPU cores on your laptop.

The great thing about the cluster module is now you can delegate work to child processes but you still have access to the memory and variables of that child process, so no need for message passing like you do for workers.

## PM2

### Intro

PM2 is a powerful process manager that can also handle deployment for smaller projects, simplifying the process of pushing updates to a server.

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
