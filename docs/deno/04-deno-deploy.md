
## Preparing for deployment

### Including gitignored files

The `.gitignore` is taken into account for the `deno publish` command. In Deno 1.41.2+, you can opt-out of excluded files ignored in the _.gitignore_ by using a negated exclude glob:


```bash title=".gitignore"
dist/
.env
```

And in the `deno.json`:


```json title="deno.json"
{
  "publish": {
    "exclude": [
      // include the .gitignored dist folder
      "!dist/"
    ]
  }
}
```

Alternatively, explicitly specifying the gitignored paths in an `"include"` works as well:

```json
{
  "publish": {
    "include": [
      "dist/",
      "README.md",
      "deno.json"
    ]
  }
}
```

### Databases


Once you've assigned a database to your app, connecting to it from your code is simple. Deno Deploy automatically handles connection details, credentials, and environment variables for you, meaning deno handles the switch between production, git branch, and development databases all via injecting different database URLs for the db connection env var for different environments.

There are two ways to add a database instance to your Deno Deploy organization:

- **Link Database**: Connect an existing external database instance (for example, a PostgreSQL server you run or a managed instance from a cloud provider).
- **Provision Database**: Create and attach a managed data store from Deno Deploy (Deno KV or Prisma Postgres).

#### Deno KV

For Deno KV, you can use the built-in `Deno.openKv()` API to connect to your assigned Deno KV instance. No additional configuration is needed - Deno Deploy automatically connects your app to the correct Deno KV instance based on the current environment.

```typescript
// No arguments needed - Deno Deploy handles this automatically
const kv = await Deno.openKv();

Deno.serve(async () => {
  // Use the Deno KV instance
  await kv.set(["user", "123"], { name: "Alice", age: 30 });
  const user = await kv.get(["user", "123"]);

  return new Response(JSON.stringify(user.value), {
    headers: { "content-type": "application/json" },
  });
});
```

#### PostgreSQL

For PostgreSQL databases (both external and provisioned), Deno Deploy automatically injects standard database environment variables into your app's runtime environment:

- `DATABASE_URL`: A full connection string for the current environment, in the format `postgresql://username:password@hostname:port/database`.
- `PGHOST`: The database server hostname.
- `PGPORT`: The database server port.
- `PGDATABASE`: The database name for the current environment.
- `PGUSER`: The database username.
- `PGPASSWORD`: The database password.

If your database requires a custom SSL/TLS certificate, Deno Deploy also injects that certificate into the default certificate store, so that all SSL connections work automatically.

You can use your favorite PostgreSQL client library (such as `pg` from npm) to connect to your database using these environment variables. Most libraries automatically detect and use these standard environment variables without any configuration.

As an example, here's how to connect to PostgreSQL in your Deno Deploy app:

```typescript
import { Pool } from "npm:pg";

// No arguments needed - the library reads connection details from environment variables automatically
const pool = new Pool();

Deno.serve(async () => {
  // Use the database
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [123]);

  return new Response(JSON.stringify(result.rows), {
    headers: { "content-type": "application/json" },
  });
});
```

#### Running migrations

Since each environment has its own isolated database, you will often have many separate databases to manage in every app. It is not practical to manually run migrations or insert seed data into each database individually every time you deploy a new revision.

To streamline this process, Deno Deploy allows you to configure an automated pre-deploy command that runs every time a revision is rolled out to a timeline, before the deployment starts serving traffic.

To set up an automated migration command, head to the Settings page of your app, and go to the App Config section. There you can edit the app configuration to set a pre-deploy command in the "Pre-Deploy Command" field (for example, `deno task migrate` or `npm run migrate`).

You can see the detailed logs of the pre-deploy command execution in the revision build logs, in the "Deployment" section.

As an example, you could set up a migration script using [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate):

1. Add a task to your `deno.json`:
    
    ```json
    {
      "tasks": {
        "migrate": "deno run --allow-net --allow-env --allow-read --allow-write npm:node-pg-migrate up"
      }
    }
    ```
    
2. Create a migrations directory and add migration files. For example, `migrations/1234567890_create-users-table.js`:
    
    ```javascript
    exports.up = (pgm) => {
      pgm.createTable("users", {
        id: "id",
        name: { type: "varchar(100)", notNull: true },
        email: { type: "varchar(100)", notNull: true },
        created_at: {
          type: "timestamp",
          notNull: true,
          default: pgm.func("current_timestamp"),
        },
      });
    };
    exports.down = (pgm) => {
      pgm.dropTable("users");
    };
    ```
    
3. Set your pre-deploy command to `deno task migrate` in the app settings.

Deno Deploy will automatically run this command before each deployment, ensuring all your environment-specific databases stay up to date.

## `deployctl`

To use deno deploy, you can install the deployctl tool first off:

```bash
deno install -gArf jsr:@deno/deployctl
```

Then deploying a deno app is as easy as one command:

```bash
deployctl deploy
```

After running the deploy command, deno will add build configuration settings to the `deno.json`. There are also command line options that will be useful here:

- `--env-file`: Points to the env file to load for deployment. `--env-file=.env` will load all env variables from the `.env` file into the deployment build.
- `--include`: file and folders in glob path syntax to include
- `--entrypoint`: the main deno file to run. This will often be just a server listening initialization.

Here is an example deno deploy command that works for fullstack deno projects

```json
{
  "tasks": {
    "dev": "deno run -A --env-file=.env.local --watch main.ts",
    "build:node": "cd frontend && npm run build", // build frontend
    "start": "deno run build:node && deno run -A --env-file=.env.local main.ts",
    "deploy": "deno run build:node && deployctl deploy --env-file=.env.local --entrypoint=main.ts"
  },
  "imports": {
    "@std/assert": "jsr:@std/assert@1"
  },
  "deploy": {
    "project": "a226342a-e14a-4684-8070-86ed781ce36e",
    "exclude": [
      "**/node_modules"
    ],
    "include": [],
    "entrypoint": "main.ts"
  }
}
```

### `deno.json` deploy config

All deno deploy config is stored under the `"deploy"` key in the `deno.json`

- `deploy.framework` (required unless `deploy.runtime` is set): The framework preset to use, such as `nextjs` or `fresh`. Setting this option automatically configures defaults for the framework. Available presets are listed in the [framework integrations docs](https://docs.deno.com/deploy/reference/frameworks/).
- `deploy.install` (optional): Shell command to install dependencies.
- `deploy.build` (optional): Shell command to build the project.
- `deploy.predeploy` (optional): Shell command to run after the build is complete but before deployment, typically for tasks like database migrations.
- `deploy.runtime` (required unless `deploy.framework` is set): Configuration for how the app serves traffic. The app can either be static or dynamic, as defined below:
    - For dynamic apps:
        - `deploy.runtime.type`: Must be set to `"dynamic"`, or omitted (dynamic is the default).
        - `deploy.runtime.entrypoint`: The JavaScript or TypeScript file to execute.
        - `deploy.runtime.args` (optional): Command-line arguments to pass to the application.
        - `deploy.runtime.cwd` (optional): The working directory for the application at runtime.
        - `deploy.runtime.memory_limit` (optional): The maximum amount of memory the application can use at runtime. Defaults to 768 MB, can be increased to 4 GB on the Pro plan.
    - For static apps:
        - `deploy.runtime.type`: Must be set to `"static"`.
        - `deploy.runtime.cwd`: Folder containing static assets (e.g., `dist`, `.output`).
        - `deploy.runtime.spa` (optional): If `true`, serves `index.html` for paths that don't match static files instead of returning 404 errors.
    - For apps using a framework preset:
        - `deploy.runtime.memory_limit` (optional): The maximum amount of memory the application can use at runtime. Defaults to 768 MB, can be increased to 4 GB on the Pro plan.

#### basic server config example

```json
{
  "deploy": {
    "install": "npm install",
    "build": "npm run build",
    "predeploy": "deno run --allow-net --allow-env migrate.ts",
    "runtime": {
      "type": "dynamic",
      "entrypoint": "./app/server.js",
      "args": ["--port", "8080"],
      "cwd": "./app"
    }
  }
}

```

#### basic static app config example

```json
{
  "deploy": {
    "install": "npm install",
    "build": "npm run build",
    "runtime": {
      "type": "static",
      "cwd": "./public",
      "spa": true
    }
  }
}

```

### Seeing logs

You can see the logs of your deployment in the command line by running this command:

```bash
deployctl logs
```

### Listing deployments

This command lists all the deployments of the project you have made so far.

```bash
deployctl deployments list
```

### Dealing with projects

All deployments are based on automatically created projects, configured within your `deno.json` and created automatically if you choose if to deploy before doing any config steps.

- `deployctl projects create`: creates a new project
- `deployctl projects show`: shows more info about a specific project
- `deployctl projects list`: lists all projects you own
- `deployctl projects rename`: renames a project
- `deployctl projects delete`: deletes a project

#### Creating projects

Before deploying, you should create an empty project like so, which simplifies config.

```bash
deployctl projects create <project-name>
```

#### Showing projects

Run the `deployctl projects show` command to see more info on a specific project.

```bash
deployctl projects show <project-name>
```


#### Deleting projects

Run the `deployctl projects delete` command to delete a project by its name

```bash
deployctl projects delete <project-name>
```

#### Listing projects

Run the `deployctl projects list` command to list all the projects you own.

```bash
deployctl projects list
```
#### Renaming projects

You can rename a project with the `deployctl projects rename` command, running it from within the root of the project.

```shell
deployctl projects rename <new-name>
```

## Development to deploy workflow

### Tunneling

**tunneling** is a way to preview your local development server on a production URL, and with deno tunneling, you can preview it as close as possible to a production environment with a temporary deno deploy URL and using environment variables from deno deploy.

Here are the steps to enable tunneling for your app:

1. Deploy your app to deno deploy at least once
2. Run `deno run --tunnel dev` to run tunneling while in dev mode

### github actions

```yaml
on:
  repository_dispatch:
    types: [deno_deploy.build.routed] # Listen for successful builds

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Test the preview_url
        run: |
          echo "The Deno Deploy app is available at ${{ github.event.client_payload.revision.preview_url }}"
          curl -I ${{ github.event.client_payload.revision.preview_url }}
```