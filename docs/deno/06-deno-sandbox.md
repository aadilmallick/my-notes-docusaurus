# Deno Sandbox

## Intro

Deno sandbox is a way to run a cloud VM/sandbox hosted on deno deploy with deno pre-installed, meaning you now have a secure way to run user-inputted deno code.

Deno sandbox is coupled with deno deploy, where you can access sandboxes in production and run code and commands in them.

There are three primary ways to manage sandboxes:

- **deno deploy**: in the deno deploy dashboard, there is a sandboxes tab where you can manage your sandboxes.
- **CLI**: using the `deno sandbox` CLI, you can manage sandboxes
- **SDK**: using the `Deno.sandbox` namespace, you can programatically spin up sandboxes and manage them.

Sandboxes also come with two important features:

- **Volumes**: read-write storage for caches, databases, user data
- **Snapshots**: read-only images for pre-installed toolchains and volume base

### Snapshots

Snapshots in deno sandbox are a way to copy the state of a sandbox, configuration, installations, files, etc. and then duplicate that state to other sandboxes.

Here are the main benefits:

- **instant startup time**: you can skip reinstalling the same things, like python or ffmpeg, because snapshots just let you copy state over
- **reproducibility**: You can reproduce the same versions without having something break on reinstallation.

Run `apt-get install` once, snapshot it, and every future sandbox boots with everything already installed. Create read-write volumes from the snapshots to create a fresh development environment in seconds.



## CLI

### create a new sandbox

```bash
deno sandbox create
```

Here are additional options you can pass in:

- `--ssh`: connects the sandbox immediately with ssh

#### copying files into a sandbox

For development work, you'll often want to copy your project files into the sandbox. The `--copy` option uploads files to the `/app` directory inside the sandbox:


```bash
deno sandbox create --copy ./my-project
```

You can copy multiple directories during creation:


```bash
deno sandbox create --copy ./src --copy ./config
```


#### Specifying sandbox timeout and memory limit

If you need the sandbox to run longer than a single session, specify a timeout with `--timeout`:


```bash
deno sandbox create --timeout 2m
```

You can also create a sandbox with a custom memory limit:


```bash
deno sandbox create --memory 2gib
```

#### sandbox HTTP

To expose HTTP ports for web applications:
```bash
deno sandbox create --expose-http 3000
```

#### sandbox volumes

You can mount persistent volumes to your sandbox using the `--volume` flag:

```bash
deno sandbox create --volume my-volume:/data
```

#### running commands in a sandbox

To create a sandbox and run a command immediately:


```bash
deno sandbox create ls /
```

This is especially useful for building and testing projects. You can copy files and run your build process in one command:


```bash
deno sandbox create --copy ./app --cwd /app "npm i && npm start"
```

For web applications, you can expose ports to access running services:


```bash
deno sandbox create --expose-http 3000 --copy ./web-app --cwd /app "npm i && npm run dev"
```

Complex workflows can be expressed as quoted command chains:

```bash
deno sandbox create --copy ./app --cwd /app "npm install && npm test && npm run build"
```

### Listing sandboxes

Use `deno sandbox list` (or `deno sandbox ls`) to see all sandboxes in your organization

### Running commands in a sandbox

The `deno sandbox exec` command lets you run individual commands in any running sandbox without opening an interactive session. This is perfect for automation, CI/CD pipelines, or quick one-off tasks:


```bash
deno sandbox exec sbx_ord_abc123def456 ls -la
```

Most of the time, you'll want to work in the `/app` directory where your copied files live. Use `--cwd` to set the working directory:


```bash
deno sandbox exec sbx_ord_abc123def456 --cwd /app npm install
```

For scripting or automation, use `--quiet` to suppress command output:


```bash
deno sandbox exec sbx_ord_abc123def456 --quiet --cwd /app npm test
```

You can also run complex command chains by quoting the entire command:


```bash
deno sandbox exec sbx_ord_abc123def456 --cwd /app "npm install && npm test"
```

The exec command works naturally with Unix pipes and standard input/output. You can pipe the output of sandbox commands to local tools:


```bash
deno sandbox exec sbx_ord_abc123def456 'ls -lh /' | wc -l
```

Or pipe local data into sandbox processes for processing:

```bash
cat large-dataset.csv | deno sandbox exec sbx_ord_abc123def456 --cwd /app "deno run -A main.ts"
```

This makes it easy to integrate sandbox processing into larger Unix workflows and data pipelines.

### File transfer

While you can copy files during Deno Sandbox creation, you might need to update or retrieve files later. The `deno sandbox copy` command (also available as `deno sandbox cp`) transfers files in any direction: from your local machine to a Deno Sandbox, from a Deno Sandbox back to your machine, or even between different sandboxes.

Copy files from your local machine to a sandbox:

```bash
deno sandbox copy ./app.js sbx_ord_abc123def456:/app/
```

Retrieve files from a sandbox to your local machine:

```bash
deno sandbox copy sbx_ord_abc123def456:/app/results.json ./output/
```

Copy files between different sandboxes:

```bash
deno sandbox copy sbx_ord_abc123def456:/app/data.csv sbx_ord_xyz789uvw012:/app/input/
```

You can use glob patterns to copy multiple files from Deno Sandbox:

```bash
deno sandbox copy sbx_ord_abc123def456:/app/*.json ./config/
deno sandbox copy sbx_ord_abc123def456:/app/logs/*.log ./logs/
```

You can copy multiple files and directories at once:

```bash
deno sandbox copy ./src/ ./package.json sbx_ord_abc123def456:/app/
```

The target path can be customized to organize files within the sandbox:

```bash
deno sandbox copy ./frontend sbx_ord_abc123def456:/app/web/
```


### Deploying sandboxes 

You can deploy a running sandbox to a Deno Deploy app using the `deno sandbox deploy` command:


```bash
deno sandbox deploy sbx_ord_abc123def456 my-app
```

By default, this deploys to a preview deployment. To deploy directly to production:


```bash
deno sandbox deploy --prod sbx_ord_abc123def456 my-app
```

You can specify a custom working directory and entrypoint:


```bash
deno sandbox deploy --cwd /app --entrypoint main.ts sbx_ord_abc123def456 my-app
```

To pass arguments to the entrypoint script:


```bash
deno sandbox deploy --args --port 8080 sbx_ord_abc123def456 my-app
```

### Managing volumes 

The sandbox system supports persistent volumes for data that needs to survive across sandbox instances. Use the `deno sandbox volumes` command to manage them.

#### Creating volumes

Create a new volume with a specific name, capacity, and region:

```bash
deno sandbox volumes create my-volume --capacity 10gb --region ord
```

#### Listing volumes 

List all volumes in your organization:


```bash
deno sandbox volumes list
```

You can also search for specific volumes:

```bash
deno sandbox volumes list my-volume
```

#### Deleting volumes

Remove a volume when you no longer need it:

```bash
deno sandbox volumes delete my-volume
```

### connecting to a sandbox

To connect to an existing sandbox and enter its shell, run the `deno sandbox ssh` command, which needs one argument: the id of the sandbox you want to connect to.

```bash
deno sandbox ssh <sandbox-id>
```

### Cleanup and termination 

When you're finished with a sandbox, use `deno sandbox kill` (or `deno sandbox rm`) to terminate it and free up resources:

```sh
deno sandbox kill sbx_ord_abc123def456
```

This immediately stops all processes in the sandbox and releases its resources. Be sure to save any important work before terminating a sandbox, as all data inside will be lost.
## SDK


The SDK version of managing deno cloud sandboxes uses the `@deno/sandbox` library from JSR.


```
deno add jsr:@deno/sandbox
```

### Setup


Basic code is like this, where we use the `using` directive to automatically deal with resource disposal of the sandbox:

```ts
import { Sandbox } from "@deno/sandbox";

// 1. create the sandbox and automatically dispose at the end
await using sandbox = await Sandbox.create();

// 2. run sandbox commands
await sandbox.sh`ls -lh /`;
```

The next step to being able to use deno sandbox is to create a **deno deploy token** and then export it to the current environment (or include it in your `.env`) as a `DENO_DEPLOY_TOKEN` variable.

### Managing sandboxes

#### Sandbox configuration

You create a sandbox using the async `Sandbox.create()` method, which optionally takes in an object of options:

- `allowNet`: a `string[]` list of hostnames that are allowed for making network requests to from the sandbox, all other hosts are blocked.
- `secrets`: allows you to configure env vars accessible to the sandbox and which host connections the env vars are allowed to be sent to. 
	- If you are connecting to a host that is not one of the approved hosts in the `hosts` array for a env var, then that env var will not be injected into the network request for that host
	- Unless you are using an env var in context of connecting to one of the allowed hosts for the env var, then the env var will be replaced with a dummy placeholder everywhere you try to use it.
- `region`: Deploy region where the sandbox will be created.
- `memoryMb`: Amount of memory allocated to the sandbox.
- `timeout`: Timeout of the sandbox.
- `labels`: Arbitrary key/value tags to help identify and manage sandboxes
- `env`: key-value map of env vars to their values

#### Creating a sandbox


```ts
await Sandbox.create({
  allowNet: ["api.openai.com", "*.paypal.com"],
  secrets: {
    OPENAI_API_KEY: {
      hosts: ["api.openai.com"],
      value: process.env.OPENAI_API_KEY,
    },
  },
  env: {
    NODE_ENV: "development",
    FEATURE_FLAG: "agents",
  },
});
```


#### connecting to existing sandboxes

You can connect to an existing sandbox through its ID on deno deploy.

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = Sandbox.connect({
	id: 'some_sandbox_id'
})
```

You can then pass in the standard sandbox configuration options.


#### reconnecting to a sandbox

- `sandbox.close()`: async method that closes the sandbox but leaves the VM running.

```ts
const sandbox = await Sandbox.create({ timeout: "10m" });
const id = sandbox.id;
await sandbox.close(); // disconnect but leave VM running

// ...later...
const reconnected = await Sandbox.connect({ id });
```

### sandbox runtime configuration

- `sandbox.env`: object for configuring environment variables in the sandbox during runtime, allowing you dynamically set environment variables.

#### sandbox env vars

You can use the `sandbox.env.set()` method to set environment variables in a sandbox.

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Set environment variables
await sandbox.env.set("API_KEY", "secret-key-123");
await sandbox.env.set("NODE_ENV", "production");

// Use them in a script
const apiKey = await sandbox.sh`echo $API_KEY`.text();
console.log("API_KEY:", apiKey.trim());
```

Setting environment variables through `sandbox.env.set()` keeps configuration and secrets inside the sandbox, so scripts run with the expected context without hardcoding values in source files. That’s helpful when you need per-run configuration (API keys, modes like NODE_ENV) or want to propagate credentials to multiple commands securely. The variables stay scoped to the sandbox session and are available to any command you execute there.


#### sandbox network connection

- `sandbox.exposeHTTP(options)`

### sandbox properties

- `sandbox.url`: returns the deno deploy URL of the sandbox
- `sandbox.id`: returns the deno deploy id of the sandbox


### `sandbox.fs`

#### file transfer

Use the `sandbox.fs` to deal with the sandbox filesystem:

```ts
await sandbox.fs.upload("./local-hello.ts", "./hello.ts");
```

#### managing files

### `sandbox.sh`

Using `sandbox.sh` template literals lets you run shell commands inside the sandbox more safely and ergonomically:

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Variables are automatically escaped
const filename = "file with spaces.txt";
const content = "Hello, world!";
await sandbox.sh`echo ${content} > ${filename}`;

// Arrays are expanded to multiple arguments
const files = ["file1.txt", "file2.txt", "file3.txt"];
await sandbox.sh`rm ${files}`;

// Get JSON output
const data = await sandbox.sh`echo '{"count": 42}'`.json<{ count: number }>();
console.log(data.count); // → 42
```

Variables interpolated into the template literal are auto-escaped, so even awkward values like file names with spaces can be passed without worrying about quoting or injection.

Arrays expand into multiple arguments automatically, making batch operations (e.g., deleting several files) concise without manual join logic. You can also chain helpers such as `.json()` to parse command output directly into typed data structures, eliminating brittle string parsing and keeping results strongly typed.

#### error handling for failed commands

Handling sandbox command failures explicitly gives you predictable recovery paths:

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Commands throw by default on non-zero exit
try {
  await sandbox.sh`exit 1`;
} catch (error) {
  console.log("Command failed:", error);
}

// Use noThrow() to handle errors manually
const result = await sandbox.sh`exit 1`.noThrow();
console.log("Exit code:", result.status.code); // → 1
console.log("Success:", result.status.success); // → false
```

Deno Sandbox commands throw on any non-zero exit, so wrapping them in try/catch lets you surface clean error messages or trigger fallback logic instead of crashing the entire workflow.

When you want to inspect failures without throwing, `.noThrow()` returns the full status object, so you can branch on `status.code` or `status.success`, log diagnostics, or retry specific commands without losing context. This pattern is essential for robust automation where commands might fail due to user input, transient network issues, or missing dependencies.

Catching `SandboxCommandError` lets you differentiate sandbox command failures from other exceptions. When the error is the `SandboxCommandError` class, you can read structured fields such as `error.code` or format `error.message` to decide whether to retry, escalate, or map exit codes to your own domain-specific errors:

```ts
import { Sandbox, SandboxCommandError } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

try {
  await sandbox.sh`exit 42`;
} catch (error) {
  if (error instanceof SandboxCommandError) {
    console.log("Exit code:", error.code); // → 42
    console.log("Error message:", error.message);
  }
}
```

#### aborting commands

Being able to cancel sandbox commands is key when tasks hang or you need to enforce timeouts. You can cancel commands in a sandbox using the `KillController` class.

```ts
import { KillController, Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Start a long-running command
const controller = new KillController();
const cmd = sandbox.sh`sleep 30`.signal(controller.signal);
const promise = cmd.text();

// Cancel after 2 seconds
setTimeout(() => {
  controller.kill(); // Kill the process
}, 2000);

try {
  await promise;
} catch (error) {
  console.log("Command was cancelled:", error);
}
```

`KillController` lets you attach a cancellation signal to any sandbox command, so you can abort long-running processes if they exceed a limit or the user cancels the operation.

After triggering `controller.kill()`, the awaiting call rejects; you can intercept that rejection to log, clean up, or retry as needed.

This pattern keeps sandbox automation responsive and prevents orphaned processes from consuming resources indefinitely.

#### Piping binary data

You can access string and binary output from commands in a sandbox. This example shows how to capture command output in whichever form your workflow needs:

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Get both string and binary data
const result = await sandbox.sh`cat binary-file.png`
  .stdout("piped");
console.log("Binary length:", result.stdout!.length);
console.log("Text length:", result.stdoutText!.length);

// Use the binary data
import fs from "node:fs";
fs.writeFileSync("output.png", result.stdout!);
```

Piping stdout lets you retrieve both the raw binary buffer and a decoded text view from the same command, so you can handle files that mix binary and textual data without re-running the command.

Once you have the binary result, you can pass it directly to APIs such as `fs.writeFileSync` to persist artifacts generated inside the sandbox, making it easy to move data between the sandbox and your host environment

This is useful when sandbox commands produce files (images, archives, etc.) that you need to consume programmatically rather than just printing to the console.

### spawning child processes

```ts
const proc = await sandbox.spawn("deno", {
  args: ["run", "hello.ts"],
  stdout: "piped",
});
for await (const chunk of proc.stdout) {
  console.log(new TextDecoder().decode(chunk));
}
await proc.status;
```

### sandbox running js code

The `sandbox.deno` namespace is used to execute deno to run javascript code, deploy to deno deploy, etc.

#### eval

Use `sandbox.deno.eval(codestr)` to run untrusted js code in the sandbox

```ts
const result = await sandbox.deno.eval(`
  const a = 1;
  const b = 2;
  a + b;
  `);
console.log("result:", result);
```

#### running files

Use the `sandbox.deno.run()` command to run a typescript deno file, passing permissions, entrypoint, etc.

```ts
const server = await sandbox.deno.run({ entrypoint: "server.js" });
```

#### Interactive JS REPL

A REPL (Read–Eval–Print Loop) is an interactive execution session where you type code, the environment reads it, evaluates it, prints the result, and then keeps the session alive so you can continue running more code while preserving state.

The `repl()` method can be used to provide an interactive JavaScript REPL in a sandbox.

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Start a Deno REPL
const repl = await sandbox.deno.repl();

// Execute code interactively, maintaining state
await repl.eval("const x = 42;");
await repl.eval("const y = 8;");
const result = await repl.eval("x + y");
console.log("result:", result); // 50
```

#### run VSCode inside a sandbox

Running `sandbox.exposeVscode()` spins up a full VS Code instance inside an isolated sandboxed environment and exposes its URL so you can open it in a browser. This is handy when you need a lightweight, disposable editor for demos, workshops, or remote debugging: you can provision VS Code on demand without installing anything locally, safely experiment with code inside a contained workspace, and tear it down automatically once you’re done.

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// Start a VSCode instance
const vscode = await sandbox.exposeVscode();

console.log(vscode.url); // print the url of the running instance
await vscode.status; // wait until it exits

```

### Connecting to SSH

SSH access allows you to connect to a sandboxed environment securely over the SSH protocol. The `sandbox.create({ ssh: true })` method can be used to provide SSH access to a sandbox.

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create({ ssh: true });

// Wait for Deploy to provision SSH access information.
const creds = sandbox.ssh ?? await sandbox.exposeSsh();
if (!creds) {
  throw new Error("SSH credentials were not provisioned for this sandbox");
}

const { hostname, username } = creds;
console.log(`ssh ${username}@${hostname}`);

// Keep the process alive by sleeping, otherwise the sandbox will be destroyed
// when the script exits.
await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000)); // 10 minutes
```
### deploying sandbox servers

Sandboxes can be used to deploy apps on the fly, which is useful if you want to create an app like deno playground or make your own IDE.

#### Running a server in a sandbox

This is an example where we use the sandbox to start a containerized server. Here are the steps you must take:

1. Create a new sandbox and expose its HTTP port you want the server process to run on
2. Access the remote sandbox url through the `sandbox.url` property and save it
3. Create a typescript file entrypoint that runs the server code and then start that long running process with deno.

```ts
import { Sandbox } from "@deno/sandbox";

// 1. create a sandbox and expose processes running on port 8000
await using sandbox = await Sandbox.create({ port: 8000 });

// 2. get the remote sandbox url
console.log(sandbox.url); // https://5975b670a7ea467f86dac6b596d32628.sandbox.deno.net

// 3. create the server ts file
await sandbox.fs.writeTextFile(
  "main.ts",
  `
  export default { fetch: () => new Response("Hello from the sandbox!") };
`,
);

// 4. start the server process, running it on port 8000
await sandbox.sh`deno serve --allow-net --watch main.ts`;
```

Here's a more robust version, where we deploy an express app:

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();

// 1) Write package.json and server.js in the sandbox
const PACKAGE_JSON = {
  name: "sandbox-express-demo",
  private: true,
  type: "module",
  dependencies: { express: "^4.19.2" },
};
await sandbox.fs.writeTextFile(
  "package.json",
  JSON.stringify(PACKAGE_JSON, null, 2),
);

await sandbox.fs.writeTextFile(
  "server.js",
  `import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Hello from Express in @deno/sandbox!'));
app.get('/time', (req, res) => res.json({ now: new Date().toISOString() }));
app.listen(3000, () => console.log('listening on :3000'));
`,
);

// 2) Install dependencies
await sandbox.sh`deno install`;

// 3) Start the server
const server = await sandbox.deno.run({ entrypoint: "server.js" });

// 4) Publish to the internet
const publicUrl = await sandbox.exposeHttp({ port: 3000 });
console.log("Public URL:", publicUrl); // e.g. https://<random>.sandbox.deno.net

// Fetch from your local machine to verify
const resp = await fetch(`${publicUrl}/time`);
console.log(await resp.json());

// Keep the process alive as long as you need; when done, closing the sandbox
// will tear it down.

```

- `sandbox.`

#### Deploying a sandbox server to deno deploy

However, since sandboxes are ephemeral, we may want a way to permanently deploy a sandbox running process or code somewhere. We can do that through the `sandbox.deno.deploy()` method:

```ts
import { Client, Sandbox } from "jsr:@deno/sandbox"


export async function deployApp(slug: string, sandboxId: string) {

  // 1. create new deno deploy app with unique slug
  const client = new Client()
  const app = await client.apps.create({ slug })
  
  // 2. connect to a currently running sandbox
  await using sandbox = await Sandbox.connect({
    id: sandboxId,
  })
  
  // 3. deploy sandbox process to production
  const build = await sandbox.deploy(app.slug, {
	  production: true,
	  build: { mode: "non", entrypoint: "main.ts" },
  });

const revision = await build.done;
console.log(revision.url);
  
  // 4. retrieve final build details
  const revision = await build.done
  return revision
}
```

#### deploying nextjs app example

```ts
import { Client, Sandbox } from "@deno/sandbox";

// 1. create new app
const client = new Client();
const app = await client.apps.create();

// 2. connect to sandbox
await using sandbox = await Sandbox.create({ memoryMb: 4096 });
console.log("Created sandbox", sandbox);

// 3. create nextjs app
await sandbox
  .sh`deno -A npm:create-next-app@latest --yes --skip-install my-app`;
await sandbox.sh`cd my-app && deno install`;
await sandbox.sh`cd my-app && deno task build`;
await sandbox.sh`cd my-app && du -sh .`;

// 4. build the nextjs app and deploy it to the app
const build = await sandbox.deno.deploy(app.slug, {
  path: "my-app",
  production: true,
  build: {
    entrypoint: "node_modules/.bin/next",
    args: ["start"],
  },
});

for await (const log of build.logs()) {
  console.log(log.message);
}
```