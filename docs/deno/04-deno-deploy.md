
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