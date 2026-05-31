# Deno Sandbox

## Intro

Deno sandbox is a way to run a cloud VM/sandbox hosted on deno deploy with deno pre-installed, meaning you now have a secure way to run user-inputted deno code.

Deno sandbox is coupled with deno deploy, where you can access sandboxes in production and run code and commands in them.

There are three primary ways to manage sandboxes:

- **deno deploy**: in the deno deploy dashboard, there is a sandboxes tab where you can manage your sandboxes.
- **CLI**: using the `deno sandbox` CLI, you can manage sandboxes
- **SDK**: using the `Deno.sandbox` namespace, you can programatically spin up sandboxes and manage them.

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

#### Creating new sandboxes

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

```ts
```

#### connecting to existing sandboxes

You can connect to an existing sandbox through its ID on deno deploy.

```ts
import { Sandbox } from "@deno/sandbox";

await using sandbox = Sandbox.connect({
	id: 'some_sandbox_id'
})
```

You can then pass in the same security properties as you did to `Sandbox.create()`.


#### reconnecting to a sandbox

- `sandbox.close()`: async method that closes the sandbox but leaves the VM running.

```ts
const sandbox = await Sandbox.create({ timeout: "10m" });
const id = sandbox.id;
await sandbox.close(); // disconnect but leave VM running

// ...later...
const reconnected = await Sandbox.connect({ id });
```

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
### sandbox shell utilities

#### running commands

- `sandbox.sh`: a tagged template literal method that runs shell commands in the context of the sandbox.

#### spawning child processes

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

### deploying sandboxes

Sandboxes can be used to deploy apps on the fly, which is useful if you want to create an app like deno playground or make your own IDE.

#### Basic deploying

```ts
import { Client, Sandbox } from "jsr:@deno/sandbox"
const sandboxId = "sbx_ord_yzsd4n6ps2t362qjyga0"

const client = new Client()

export async function deployApp(slug: string) {
  const app = await client.apps.create({ slug })
  await using sandbox = await Sandbox.connect({
    id: sandboxId,
  })
  const build = await sandbox.deno.deploy(app.slug, {
    production: true
  })
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