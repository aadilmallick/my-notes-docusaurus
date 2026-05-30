# Deno Sandbox

## Intro

Deno sandbox is a way to run a VM/sandbox with deno pre-installed, meaning you now have a secure way to run user-inputted deno code.

Deno sandbox is coupled with deno deploy, where you can access sandboxes in production and run code in them.

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

- ``

