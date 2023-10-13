# Command line

## Child processes

The `child_process` module in node allows you to run command line tools from within your nodeJS program, like `cd`, `ls`, and much more.

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
