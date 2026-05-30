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


```ts
await Sandbox.create({
  allowNet: ["api.openai.com", "*.paypal.com"],
  secrets: {
    OPENAI_API_KEY: {
      hosts: ["api.openai.com"],
      value: process.env.OPENAI_API_KEY,
    },
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

You can then pass in the same security properties as you did to `Sandbox.create()`.

### sandbox properties

- `sandbox.url`: returns the deno deploy URL of the sandbox
- `sandbox.id`: returns the deno deploy id of the sandbox

### sandbox namespaces

- `sandbox.fs`: same thing as `Deno.fs`, but executes file operations in context of the sandbox

### sandbox methods

- `sandbox.sh`: a tagged template literal method that runs shell commands in the context of the sandbox.

### deploying sandboxes

Sandboxes can be used to deploy apps on the fly, which is useful if you want to create an app like deno playground or make your own IDE.

