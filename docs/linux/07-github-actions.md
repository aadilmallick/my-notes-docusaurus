

## Basics

A github action is a CI/CD pipeline made from **workflows**, where each workflow can run several **jobs** when **triggers** are triggered:

- **jobs**: The main thing behind CI/CD - you test your code, build, deploy. Each job runs in a new ephemeral VM where you can get access to your codebase and do stuff with it
- **triggers**: These are events that the workflow listens for (like pull request or push to main), and when triggered, the workflow runs all the jobs it has.

### The workflow of workflows

A workflow is a single yaml file in your `.github/workflows` directory. 

There are three very important rules to keep in mind about the behavior of a workflow:

1. All jobs in a workflow run in parallel by default. 
2. All the steps inside a job are run sequentially. 
3. Each job runs on its own VM and when it clones your repo, it sets the current working directory of the VM to the root of the project.

This is what a basic workflow will look like.

```yaml
name: workflow learning
on: 
	push: 
		branches: ["main"]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      GH_ACCESS_TOKEN: ${{ secrets.GH_ACCESS_TOKEN }}
    steps:
	  # 1. copy repo code into vm
      - uses: actions/checkout@v4
      # 2. install node
      - uses: actions/setup-node@v4
        with:
          node-version: 20
	  # 3. install dependencies
      - name: install
	    run: npm ci
	  # 4. build
      - name: build
	    run: npm run build
	  # 5. test
      - name: test
	    run: npm run test
```

**anatomy of a job**

All jobs live under the `job` key and must de initialized with a job name:

```yaml
jobs:
	<job-name-1>:
		# steps, etc.
	<job-name-2>:
		# steps, etc.
	<job-name-3>:
		# steps, etc.
```

At the `jobs.<job-name>` level, you have several important keys:

- `runs-on`: The OS VM to use for the job. `ubuntu-latest` is a good choice because it's linux.
- `env`: any environment variables to set
- `steps`: the steps of the job

**anatomy of steps**

Each job is made of multiple steps defined in the `steps` key and can either run linux commands on the job's VM or use predefined github actions from **github marketplace** to do stuff.

- `uses`: To use an action in a step, use the `uses` keyword and pass in a github action as the value.
- `with`: When actions need configuration, you provide those configuration steps using the `with` keyword.

```yaml
steps: 
  - name: checkout
    uses: actions/checkout@v3
		with: 
			# some configuration
```

### Jobs and steps in depth

#### Running jobs sequentially

#### Setting runner defaults

The `defaults` root level key lets you set default settings and configurations for your workflow. For example, the `defaults.run` key allows you to configure the default settings for all runners:

You can set the default working directory in your repo for which your jobs run using this code. This is useful for monorepos where you want to do the bulk of the work in a subfolder.

- `defaults.run`: configurations for runners
	- `working-directory`: sets the current working directory for all runners after they check out your code
	- `shell`: sets the shell language for the VM. Just set this to `bash`.

```yaml
# define triggers...

defaults:
	run:
		working-directory: ./server # will run all code with cwd = ./server
		shell: bash

# define jobs...
```

#### Variables in workflows (ENV, secrets, context)

You can evaluate variables inside a `${{ }}` expression.

**contexts**

Contexts are a way to access information about workflow runs, variables, runner environments, jobs, and steps. Each context is an object that contains properties, which can be strings or other objects.

Here are the different types of global context objects you have access to:

- **`github`**: Information about the workflow run and GitHub event that triggered the workflow. This is one of the most commonly used contexts.
- **`env`**: Access to environment variables defined in the workflow, repository, or organization.
- **`job`**: Information about the current job being executed.
- **`steps`**: Information about the steps within a job, including outputs and results.
- **`secrets`**: Access to secrets stored in the repository or organization.
- **`strategy`**: Information about the matrix strategy used for parallel job execution.
- **`matrix`**: Information about the current matrix configuration in a matrix strategy.
- **`needs`**: Information about the status and outputs of jobs that are dependencies of the current job.
- **`vars`**: Access to custom variables defined at the repository, organization, or environment levels.

This is what the `github` context object looks like:

```json
{
  "event": {
    "repository": {
      "default_branch": "master"
    }
  },
  "event_path": "/var/run/act/workflow/event.json",
  "workflow": "practice.yaml",
  "run_attempt": "1",
  "run_id": "1",
  "run_number": "1",
  "actor": "nektos/act",
  "repository": "HHMI-HQ/SCT-health-dashboard",
  "event_name": "workflow_dispatch",
  "sha": "603f3a431b5a272f82075192b7318e105591598d",
  "ref": "refs/heads/k8-express-mongo-setup",
  "ref_name": "k8-express-mongo-setup",
  "ref_type": "branch",
  "head_ref": "",
  "base_ref": "",
  "token": "",
  "workspace": "/Users/mallicka/Documents/aadildev/work/health-dashboard",
  "action": "",
  "action_path": "",
  "action_ref": "",
  "action_repository": "",
  "job": "learn-variables",
  "job_name": "",
  "repository_owner": "HHMI-HQ",
  "retention_days": "0",
  "runner_perflog": "/dev/null",
  "runner_tracking_id": "",
  "server_url": "https://github.com",
  "api_url": "https://api.github.com",
  "graphql_url": "https://api.github.com/graphql"
}"
```

- `github.event_name`: The name of the event that triggered the workflow (e.g., `push`, `pull_request`, `schedule`).
- `github.sha`: The commit SHA that triggered the workflow.
- `github.ref`: The branch or tag that triggered the workflow (e.g., `refs/heads/main`, `refs/tags/v1.0.0`).
- `github.repository`: The owner and repository name (e.g., `octocat/Spoon-Knife`).
- `github.event`: The full event payload that triggered the workflow. This is a complex object that contains a lot of information specific to the event type.
- `github.workflow`: The name of the workflow file.
- `github.run_id`: A unique ID for the workflow run.
- `github.run_number`: A sequential number for the workflow run.
- `github.actor`: The username of the person or app that initiated the workflow run.
- `github.head_ref`: The branch name for pull request events.
- `github.base_ref`: The base branch name for pull request events.

**functions**

And here are global functions available for you to invoke:

- `toJSON(variable)` : a function that can you can pass a context or any other variable into, and it will convert that object into a readable JSON string format.
- `hashFiles(globPath)`: a function that takes in a glob pattern to match filepaths and hashes those files and returns a hash string.

```yaml
```


**env variables**

You can define environment variables using the `env` key, and you can define it either at the **workflow level, job level,** or **step level:**

- **workflow level:** The environment variables are shared across jobs
    
    ```yaml
    name: "Deploy"
    on: [push]
    
    # environment variables shared across jobs
    env:
      NODE_ENV: production
    
    jobs:
    	# ...
    ```
    
- **job level:** The environment variables are local to each job
    
    ```yaml
    name: "Deploy"
    on: [push]
    
    jobs:
    	build: 
    		# environment variables specific to build job
    		env:
    		  NODE_ENV: production
    ```
    
- **step level:** The environment variable is local to that step
    
    ```yaml
    name: "Deploy"
    on: push
    
    jobs:
    	build:
    		runs-on: ubuntu-latest
    		steps:
    			- name: "Say hello"
    				env:
    					FIRST_NAME: "Aadil"
    				run: echo "Hello, my name is $FIRST_NAME"
    ```

You can also set repo-wide environment variables in your repo settings.

You can then access those environment variables on the `env` context object and through github expression syntax:

```yaml
jobs:
	build: 
		env:
		  NODE_ENV: production
		steps: 
			- runs: echo "${{ env.NODE_ENV }}"
```

There are built in environment variables that workflow runners have access to, but since they are loaded in the shell environment rather than set through the `env` key, you have to access them with bash variable interpolation using the `$`:

- `GITHUB_SHA`: the sha commit that is currently being used in the workflow

```yaml
env:
  MY_VARIABLE: "Hello, World!"

jobs:
  print_env:
    runs-on: ubuntu-latest
    env:
      JOB_VARIABLE: "This is a job-level variable"
    steps:
      - name: Print Environment Variables
        env:
          STEP_VARIABLE: "This is a step-level variable"
        # Accessing system environment variable through $GITHUB_SHA
        run: |
          echo "Workflow Variable: ${{ env.MY_VARIABLE }}"
          echo "Job Variable: ${{ env.JOB_VARIABLE }}"
          echo "Step Variable: ${{ env.STEP_VARIABLE }}"
          echo "System Variable: $GITHUB_SHA" 
          
```

**secrets + environments**

You can access secrets you set on a github repo through the `secrets` context object:

```yaml
jobs:
  example-job:
    runs-on: ubuntu-latest
    steps:
      - name: Retrieve secret
        env:
          super_secret: ${{ secrets.SUPERSECRET }}
        run: |
          example-command "$super_secret"
```

If you want to have different values for your secret environment variables depending on whether you’re in a dev, testing, or production environment, you can do that with environment secrets:

1. Go to repository settings, and then to **environments**
2. Create a new environment, and note the name for later. Add environment secrets
3. For a job in workflow, you can specify the environment in your repo to use using the `environment` key at the `jobs.<job-name>` level.
4. You can then access secrets specific to that environment through the `secrets` context object.
    
    ```yaml
    jobs:
      test:
        runs-on: ubuntu-latest
	# use the environment named "testing" we created
	# automatically we get all the environment secrets from that environment
        environment: testing
    		steps:
          - name: "display testing environment"
            run: echo "${{ secrets.NODE_ENV }}"
    ```

> [!NOTE]
> The main use case for using environments is to have different env vars and secrets for development and production builds.

#### Job outputs

**Job outputs** are single values that jobs output much like artifacts, but can then be used by other jobs. This is used for more programmatic purposes.

```yaml
build:
	# this key specifies all outputs for a job
  outputs:
		# create a job output named `name`
    name: 
			description: "username of the person running this workflow"
			value: ${{ steps.aadilmallick.outputs.output-var }}
  steps:
    - name: create job output
      id: aadilmallick
# we redirect the key-value pair into github output to set an output value
      run: echo 'output-var="aadil mallick bruh"' >> $GITHUB_OUTPUT ';'
```

1. To create a job output, first we need to set a value for it using the echo key-value pair syntax where in a step, we redirect the echo command into the `$GITHUB_OUTPUT` variable
    
    ```yaml
    run: echo 'myvarname="some value"' >> $GITHUB_OUTPUT ';'
    ```
    
2. Set an `id` on the step where you create the value and redirect it. This will be used later to access the step
    
3. At the `job.<job-name>` level, create an `outputs` key and specify the name of the job output(s) you want to create. Use github expression syntax to access the specified step, and then set its output value through the `steps.<step-id>.outputs.<output-name>` syntax
    
    ```yaml
    jobs:
		job_name:
	       outputs:
		        output_name: ${{ steps.aadilmallick.outputs.output-var }}
    ```
    

**Using job outputs in other jobs**

You can access other jobs through the `needs` context object on a job, which is an object of all the jobs that this job is dependent on. You refer to a specific job through the `needs.<job-name>` property, which returns a `job` context object.

You can get the all the outputs from the `needs.<job-name>.outputs` syntax:

```yaml
deploy:
    needs: build
    steps:
      - name: get job output
				# access the "name" job output from the build job
        run: echo ${{ needs.build.outputs.name }}
```

#### step outputs

Step outputs are just like job outputs except they are stored at the steps level, meaning only steps within the same job can access those step outputs.

To create a step output, you need to echo a key-value pair to the `$GITHUB_OUTPUT` runner environment variable. The basic syntax is as follows:


```yaml
echo "VAR_NAME=VALUE" >> $GITHUB_OUTPUT
```

To access the step as a variable, you must assign an `id` property to the step so you can refer to it programmatically through `steps.<step-id>` syntax.

```yaml
- name: Step that sets an output
  id: example_step
  run: echo "greeting=hello" >> $GITHUB_OUTPUT
```

Then you would interpolate the step output by accessing steps through this sort of syntax:

```
steps.<step-id>.outputs.<output-name>
```

```yaml
- name: Use the output
  run: echo "${{ steps.example_step.outputs.greeting }}"
```

And here's a complete example:

```yaml
jobs:
  demo:
    runs-on: ubuntu-latest
    steps:
      - name: Set an output
        id: set_output
        run: echo "color=blue" >> $GITHUB_OUTPUT

      - name: Use output
        run: echo "Chosen color is ${{ steps.set_output.outputs.color }}"
```
#### Matrix

The `strategy` key lives at the `job.<job-name>` level and lets you define strategies for the job. The most important strategy here is the **matrix** strategy, which creates permutations of variables and the job will be rerun for each permutation.

A basic example is as follows:

- We define the `os` variable as a matrix variable, meaning that it will take a value from the array you pass in.
- We can refer to matrix variables through the `matrix.variableName` syntax, and use variable interpolation to extract the value.

```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-18.04]
```

The example above demonstrates how we will run the job for each value in the `matrix.os` array, and since we interpolate `${{ matrix.os }}` for the `runs-on` key, we will run through the different OSs:

- The 1st job will run on mac
- The 2nd job will run on windows
- The 3rd job will run on ubuntu

```yaml
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        node-version: [8.x, 10.x, 12.x]
        os: [macos-latest, windows-latest, ubuntu-18.04]
    steps:
    - uses: actions/checkout@v1
    # install node through versions 8, 10, 12.
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: npm install, build, and test
      run: |
        npm ci
        npm run build --if-present
        npm test
      env:
        CI: true
```

#### Conditionally running steps

The default behavior of a workflow is that if one steps fails, that entire job is aborted and so are any other jobs dependent on that job.

We can use the `if` conditional key to bypass this and skip steps or run steps. If the condition in an `if` block is true, then the step runs. If the conditional is false, then the step fails.

Now we can conditionally run jobs and steps and even ignore errors and continue running a job.

**special conditional functions**

We use these special conditional functions to run steps conditionally even if another step failed. These functions override the default behavior of the workflow aborting when a step fails.

- `failure()` : returns true when any previous step or job in the workflow failed
- `success()` : returns true when all previous steps or jobs in the workflow passed
- `cancelled()` : returns true when user manually cancels workflow
- `always()` : always returns true, meaning that any conditional statement using this function will always run, even if the workflow was cancelled or failed.

**running a step if another step failed**

We can run steps conditionally by using these two concepts:

1. Refer to other steps by supplying them with an `id` property
2. Use `if` key for conditionals and you MUST use one of the 4 special conditional functions in your if condition.
3. You also have access to the basic conditional operators `==`, `!=`, `&&`, `||`.

The `steps` context object has additional properties for dealing with conditionals:

- `steps.<step-id>.outcome` : returns the outcome of the step, whether it succeeded, failed, or was skipped.
- `steps.<step-id>.conclusion` : returns the outcome of the step, whether it succeeded, failed, or was skipped.

The two above conditional properties have the same output values:

- `'failure'`: the specified step failed
- `'success'`: the specified step succeeded
- `'skip'`: the specified step was skipped (it wasn't run or)

```yaml
steps:
  - name: test
    run: npm run test
    id: test-step  # identifier for specific step. 

  - name: failed test
	# run if workflow up to this point failed and test-step step failed
    if: failure() && steps.test-step.outcome == 'failure'
    run: echo "test failed"
```

> [!IMPORTANT]
> The most important thing to understand here is that a step will only run if a job fails if it includes the `failure()` conditional function invocation in its conditional.

You can use the `continue-on-error` boolean property on the step level, which allows you to continue the workflow even if the specified step fails. This overrides the need for a conditional.

```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
	  # if this step fails, the workflow will continue
      - name: This might fail
        run: exit 1
        continue-on-error: true
      # this step will always run
      - name: This will still run
        run: echo "The previous step failed, but workflow continues."
```
#### Conditionally running jobs

We can use the `if` key at the job level to create conditional jobs. But since jobs are run in parallel, if we’re listening for failure, we need to depend on other jobs first so we only run the failing conditional job if the jobs we depend on actually fail.

```yaml
jobs: 
	# ... jobs: lint, test, deploy
	run-if-any-other-job-fails: 
		needs: [lint, test, deploy]
		# run job only if any of the jobs in `needs` fail first.
		if: failure()
		steps:
			# define steps ...
```

You can also use the `continue-on-error` property at the job level to specify to continue running the job even if other jobs fail. This is especially useful for matrix strategies:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [14, 16, 18]
    runs-on: ubuntu-latest
    continue-on-error: ${{ matrix.node == 14 }}  # only node 14 can fail without failing the workflow
    steps:
      - run: node --version
```

Here's the summary of how to use `continue-on-error`:

| Level | Syntax Example            | Behavior                          |
| ----- | ------------------------- | --------------------------------- |
| Step  | `continue-on-error: true` | Step failure doesn’t stop job     |
| Job   | `continue-on-error: true` | Job failure doesn’t stop workflow |
#### Caching

Just use the code below to cache node modules. It uses the `actions/cache@v4` action to cache dependencies and only invalidate the cache if any of the arguments to the `hashFiles()` global function changes.

- In this case, we cache based on the `package-lock.json`. If that changes, the cache is invalidated. If it doesn't change, then we fetch from cache.

```yaml
  steps:
	  # 1. use action to cache ~/.npm unless package-lock.json changes
    - name: Cache dependencies
      id: cache
      uses: actions/cache@v4
      with:
        path: ~/.npm
        key: deps-node-modules-${{ hashFiles('**/package-lock.json') }}
    - name: Install dependencies
    
	    # 2. conditional step to run installation, only if not cache hit
      if: steps.cache.outputs.cache-hit != 'true'
      run: npm ci
```

There's an even easier shorthand for caching now: just use the `setup-node@v4` official action, and specify that you want to cache dependencies using with `with.cache` configuration and setting that to `"npm"`. 

This evens let you skip all the song and dance of conditionally running the install step on a cache miss.

```yaml
jobs:
	job_name:
		steps:
			# checkout ...
	      - name: Set up Node.js
	        uses: actions/setup-node@v4
	        with:
	          node-version: "24"
	          cache: "npm"
		  - run: npm ci
```

#### Creating jobs from containers

The advantage of using containers is that you get to customize your environment more than you can with the runners. You can choose which OS to use and which software to download, giving you complete control over your code execution environment.

Using containers in a workflow is just having a base image to build off of if you want more control over your environment, but it doesn’t mean the source code gets copied. You can only do that with custom actions.

The `container` key is a job level key that determines the public dockerhub image to use to build the runner from. It replaces the `runs-on` job level key since the docker image will automatically specify the OS. All the subsequent commands will be run in the container. 

```yaml
jobs:
	test:
		container:
			image: <dockerhub-image-name>
```

### triggers

The most basic way to include triggers on your workflow is to refer to them in an array of triggers that you then pass to the `on` key.

```yaml
on: [push]
```

Simply setting the value of `on` to an array of trigger names is the most basic way of including a trigger, and works in the broadest number of situations. 

However, you can do extra config for a trigger, which helps you filter by event filters and activity types:

- **event filters**: scopes the event down to be triggered on specific resources, like certain branches for pushes and pull requests. These are specified on the `on.<event>.types` key.
- **activity types**: scopes the event down to certain lifecycles in the event, like reopening or closing a pull request instead of just the generic event.

Here is an example of both:

```yaml
on:
  label:
	# event filters for event "label"
    types:
      - created
  push:
    # activity types for event "push"
    branches:
      - main
```

Whenever we do extra configuration for a trigger, we have to add the triggers on multiple lines below instead of smushing it into one array.

```yaml
on:
	push:
		branches: [main]
```

Here are a list of the main triggers, which live under the root level `on` key:

- `push`: The push triggers when there is a push on a specified branch
- `pull_request`: triggers when there is a pull request to a specified branch
- `schedule`: triggers at a specific time based on a string of cron syntax

Every single trigger has different event filters and activity types, so you should specify them accordingly.

#### How to skip triggering workflows

In order to skip triggering workflows on a commit or push, you can use these tactics:

If you want to make commits on your code and push them up without triggering a workflow, you can add special text to your commit workflow to do so:

Adding in `[skip ci]` or `[skip actions]` verbatim inside your commit message will prevent running a workflow on the code you push.

```bash
git commit -m "just added some bullshit don't run workflow [skip actions]"
```

#### Push trigger


**event filters**

Here are the event filters for the push trigger:

- `branches`: a list of branches to listen for pushes to
	- `paths-ignore`: a list of filepaths to ignore when pushing to a branch. This means that if those ignored files change during the new push, they won't trigger the workflow.
- `tags`: a list of tags to listen for pushes to
- `branches-ignore`: a list of branches to ignore pushes to
- `tags-ignore`: a list of tags to ignore pushes to

In all of these event filters, you can use glob syntax to refer to the branches or tags, meaning that something like `dev-*` would refer to all branches starting with `dev-` prefix.

**pushing to certain branches example**

Here is an example of configuing the push trigger to only execute on certain branches:

- Only listen to pushes on the `main` branch.
- `paths-ignore` event filter takes in an array of filepaths to ignore, meaning that the push event will not be triggered even if you make changes to those ignored files

```yaml
on:
  push:
    branches: [main]
		paths-ignore: ["README.md", "LICENSE"]
```

**pushing to tags example**

```yaml
on:
  push:
    tags: ["*"]
```

#### Cron Scheduling

By listening to the `schedule` workflow trigger, you can pass in a cron event so that your github action runs jobs repeatedly based on a schedule.

```yaml
name: run every day

on:
	schedule: 
		- cron: '0 0 * * *'
```

## Artifacts

When a workflow outputs some asset like an app binary or executable, that is called a **job artifact**.

- We specify the filepaths we want to upload as artifacts, and then those files and folders get zipped up and ready to download on github.
- We can then download those job artifacts or use those in other jobs.

### Creating artifacts

Here is what an upload artifact step looks like:

1. Use the `actions/upload-artifact@v4` action
2. Configure the custom action with the `with` key.
    - `name` : the artifact name. This will be an important identifier used to download the same artifact
    - `path` : the folder or file as a filepath to the content you want to upload as an artifact, relative to the current working directory

```yaml
- name: upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: vite-website
    path: dist
```

By using the `|` operator on the first line, you can write multi-line code and even upload multiple paths into one zip as a single artifact

```yaml
- name: upload artifact
  uses: actions/upload-artifact@v3 	# use upload artifact actions
  with:
    name: vite-website	# artifact identifier/name
		# upload both dist and README.md as one artifact zip file
    path: |  		
			dist
			README.md
```

### Downloading artifacts

You can use the `actions/download-artifact@v4` action to download an artifact that was uploaded previously. You can only download artifacts that were uploaded during the same workflow run. When you download a file, you can reference it by its uploaded artifact name. 

> [!NOTE]
> downloading the artifact through the action automatically unzips the artifact as well.

Here are the properties we can configure while using that action through the `with` key:

- `name` : specifies which artifact we want to download by the artifact name we specify earlier when we uploaded them. **Required**
- `path`: the directory path relative to the cwd inside the runner we want to unzip the artifact to. If the directory doesn't exist, it gets created. By default, the `download-artifact` action downloads artifacts to the workspace directory that the step is executing in. You can use the `path` input parameter to specify a different download directory.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # ... build steps ...
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: ./output/

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: ./output/
      # ... test steps using the build artifact ...
```

Here's another basic example where the `vite-website` artifact gets unzipped, and all the files pop into the root directory:

```yaml
deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: get artifact
        uses: actions/download-artifact@v4
        with:
					# downloads the artifact with the vite-website identifier
          name: vite-website
```
## Releases

### Running jobs with containers

To run multiple-container apps in actions (why would you tho), you can use the `services` key on a job, which lets you pull down a docker image and run it:

```yaml
jobs:
  container-job:
    runs-on: ubuntu-latest
    container: node:20-bookworm-slim
    services:
      postgres:
        image: postgres
    steps:
      - name: Check out repository code
        uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Connect to PostgreSQL
        run: node client.js
        env:
          POSTGRES_HOST: postgres
          POSTGRES_PORT: 5432
```

## Reusable Workflows

**Reusable workflows** are workflows that other workflows can use in their jobs. You define this reusable workflow in its separate YAML file, and then the other workflows have jobs that make calls to that workflow.

Here are the main important things to realize about reusable workflows:

- Yaml files that listen to the `workflow_call` trigger become reusable workflows.
- A reusable workflow is just like a normal workflow (except for the trigger), so they can have multiple jobs, use job outputs, etc.

If a job uses a reusable workflow, it can't have any other steps or use any other jobs. The reusable workflow is essentially just a straight up replacement.

### basics

1. Create a yaml workflow file and listen to the `workflow_call` trigger. This makes it a reusable workflow
    
    ```yaml
    # reusable-workflow.yaml
    name: reusable
    on: workflow_call
    jobs:
      confirm_deploy:
        runs-on: ubuntu-latest
        steps:
          - name: confirm
            run: echo "Deploying confirmed! you did it!"
    ```
    
2. In the jobs that use this workflow, use the `uses` keyword and pass in the path to the reusable workflow yaml file. It should be a relative path relative to the project root, since that is the CWD of the runner.
    
    ```yaml
    jobs:
    	deploy:
    	    needs: build
    	    uses: ./.github/workflows/reusable.yaml
    ```

### Accepting inputs to a reusable workflow

Reusable workflows are very similar to actions. We can pass in inputs and dynamic variables using the `with` keyword just like how we configure actions. 

But there are necessary steps to accept input into the reusable workflow first:

1. Specify the `inputs` key under the `workflow_call` trigger in the reusable workflow. This allows us to create and describe parameters for the reusable workflow
    
    ```yaml title="reusable.yaml"
    # define inputs
    
    name: reusable
    on:
      workflow_call:
        # specify inputs to reusable workflow, specified by the `with` key
        inputs:
          # list of all parameters and how to configure them
          username:
    				# we made inputs.username an optional string parameter
            description: "name of the person running the workflow"
            required: false
            type: string
            default: "just that guy, you know?"
    ```
    
2. Now all the input parameters live on the `inputs` context object. Use that dynamically in our reusable workflow by using github expressions
    
    ```yaml title="reusable.yaml"
    # reusable workflow jobs
    
    jobs:
      confirm_deploy:
        runs-on: ubuntu-latest
        steps:
          - name: confirm
          
            # parameters can be accessed from inputs context object
            run: echo "Deploying confirmed, ${{ inputs.username }}! you did it!"
    ```
    
3. In the job that uses the reusable workflow, make sure to pass the values for the input parameters by using the `with` keyword:
    
    ```yaml title="mainworkflow.yaml"
    deploy:
        needs: build
        uses: ./.github/workflows/reusable.yaml
        with:
          username: "Aadil Mallick is just that guy"
    ```

### Creating reusable workflow outputs

Reusable workflows are like substitutions for an entire job, so we can access their output by using the jobs context through the `needs` object.
    
1. Define the `outputs` key at the job level. Assign a value for the output by redirecting to `$GITHUB_OUTPUT`
    
    ```yaml title="reusable.yaml"
    # .github/reusable-workflows/reusable.yaml
    name: reusable
    on: workflow_call
    
    jobs:
    	deploy:
    		outputs:
    			my-output: ${{ steps.set-result.outputs.my-output }}
    		runs-on: ubuntu-latest
    		steps:
    			- uses: actions/checkout@v4
    			- name: Set job output
    				# 1. set id for step
    				id: set-result
    				# 2. set value for job output
    				run: echo "my-output=deployed" >> $GITHUB_OUTPUT
    			
    ```
    
2. Access the reusable workflow’s output by accessing the `needs.<job-name>.outputs.<output-name>` syntax.
    
    ```yaml title="main.yaml"
    
    jobs:
    	# 1. job that uses reusable workflow
    	deploy:
    		uses: ./.github/reusable-workflows/reusable.yaml
    	post-deploy:
    		needs: deploy
    		steps:
    			- name: "print deploy output"
    				run: "Deploy output is ${{ needs.deploy.outputs.my-output }}"
    ```

## Custom actions

There are three different types of custom actions:

- **javascript actions:** Runs a javascript file of your choice. Basically just writing JS
- **docker actions:** Runs a Docker image you specify
- **composite actions:** Similar to reusable workflows where you combine multiple `runs` and `uses` commands to create reusable actions

Custom actions are `action.yaml` files that you can use in your workflow code. Each custom action file needs these three root level keys:

- `name`: the name of the action. Think of it like a short description
- `description`: the action description
- `runs`: the configuration for the action
	- `using`:  specifies the type of custom action the action will be. 
		- `'composite'` for composite
		- `'docker'` for docker
		- `'node18'`: for node 18 actions

Here's basic decision making for when to use each:

| Type      | Runs on             | Language/Env | Use Case                         |
| --------- | ------------------- | ------------ | -------------------------------- |
| JS/TS     | Node.js runner      | JS/TS        | GitHub API, logic, quick scripts |
| Docker    | Any (via container) | Any          | Custom tools, non-Node languages |
| Composite | Runner shell        | Shell, YAML  | Orchestration, chaining actions  |

### Composite actions

Composite actions can be used to make certain workflow steps reusable, or they can be shoved into their own repository and then published on the github marketplace. 

> [!NOTE]
> You should think of a composite action as just copying and pasting steps from the custom action into the actual workflow, which means you can skip common steps like checking out. They can be truly reusable.

Here are the steps to follow when creating a local composite action:

1. In the `.github` folder, create another folder that will house all of your actions. The folder name doesn’t matter, but just name it `actions`
2. In the `.github/actions` folder, create another folder, which will house your custom action. Then create a yaml file, which **must** be called `action.yaml` . This is your custom action.
3. You can use the custom action by just using the `uses` keyword and passing the path to the custom action, relative to the project root folder.

> [!IMPORTANT]
> You need to checkout the code before calling any custom actions because the code you checkout includes getting the actions that live `.github` folder (you use the custom action by referring to its filepath within your project code), so you can’t call the action that lives in your code unless: 
> 
> a) you checked out the code first 
> b) the action lives online in the github marketplace

#### Basics

This is a composite action since the `runs.using` key is set to `"composite"` and we specify actions steps through `run.steps`.


```yaml title="action.yaml"
# ./.github/actions/install-deps/action.yaml

name: "Get + cache dependencies"
description: "Get and cache dependencies for faster builds"

# required key. Basically what steps to run in the actions
runs:
  using: "composite"  # required to define as composite action
  steps:
    - name: Cache dependencies
      id: cache
      uses: actions/cache@v4
      with:
        path: ~/.npm
        key: deps-node-modules-${{ hashFiles('**/package-lock.json') }}
    - name: Install dependencies
      if: steps.cache.outputs.cache-hit != 'true'
      run: npm ci
      shell: bash  # shell: bash required when using `runs` command
```

You can use the custom action by just using the `uses` keyword and passing the path to the custom action, relative to the project root folder.

If a custom action lives under the `.github/actions` folder and has a name of `myaction.yaml`, then the path you would refer to would be `/.github/actions/myaction`

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
			# must check out code in workflow. Cannot be extracted to custom action
      - name: Get code
        uses: actions/checkout@v3
      - name: Install + Cache
				# path must be relative to project root
        uses: ./.github/actions/install-deps
```

#### inputs

Inputs to custom actions are specified by the `with` key when using the action. We define what configuration we allow with the `inputs` key in our custom action:

1. Describe input variables with the `inputs` key in our custom action, then use them somewhere in our code for dynamic ability
    
    ```yaml title="action.yaml"
    name: "Get + cache dependencies"
    description: "Get and cache dependencies for faster builds"
    # key to describe all inputs
    inputs:
     should-use-cache:
    	# not required, with a default of "true"
       description: "whether or not to use the cache"
       required: false
       default: "true"
    
    runs:
      using: "composite"
      steps:
        - name: Cache dependencies
          id: cache
          uses: actions/cache@v3
          with:
            path: node_modules
            key: deps-node-modules-${{ hashFiles('**/package-lock.json') }}
        - name: Install dependencies
          id: install
    			# if user does not want to cache, then just install
          if: inputs.should-use-cache == 'false'
          run: npm ci
          shell: bash
    ```
    
2. To use inputs in the custom action, use the `with` key to configure the input variables you pass into the custom action
    
    ```yaml title="main.yaml"
    jobs:
      lint:
        runs-on: ubuntu-latest
        steps:
          - name: Get code
            uses: actions/checkout@v3
          - name: Install + Cache
            uses: ./.github/actions/install-deps
            id: custom-action
    				# use the with key to specify which input variable to configure
            with:
              should-use-cache: true
    ```
#### outputs

1. You can specify any outputs for the custom action with the `outputs` root level key.
2. Set a value for the output by echoing a key value pair into `$GITHUB_OUTPUT`

```yaml title="action.yaml"
name: "Get + cache dependencies"
description: "Get and cache dependencies for faster builds"
outputs:
	# 1. specify outputs.cache-was-used
  cache-was-used:
    description: "whether or not the cache was used"
    value: ${{steps.install.outputs.cache-used}}

runs:
  using: "composite"
  steps:
    - name: Cache dependencies
      id: cache
      uses: actions/cache@v3
      with:
        path: node_modules
        key: deps-node-modules-${{ hashFiles('**/package-lock.json') }}
    - name: Install dependencies
      id: install
      if: steps.cache.outputs.cache-hit != 'true'
	  # 2. redirect the cache-was-used=false pair into github output
      run: npm ci && echo "cache-was-used='false'" >> $GITHUB_OUTPUT
      shell: bash
```

This is how we would access the output from the custom action, as normal.

```yaml title="main.yaml"
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Get code  
        uses: actions/checkout@v3
      - name: Install + Cache
        uses: ./.github/actions/install-deps
        
				# need id so we can grab step with steps.<id>.outputs syntax
        id: custom-action

      - name: Confirm cache
        run: echo 'Cache used? ${{ steps.custom-action.outputs.cache-was-used }}''
```

### Custom actions with docker

### Custom actions with javascript

JavaScript actions point to a javascript file, and will run the code in that file as the action.

Similar to building a composite action, this is how to register a JavaScript action:

1. Create an `action.yaml` somewhere in your `.github` directory that is not in the workflows folder.
    
2. Use the `main` key to specify the local filepath to the main javascript file you will run for the action:
    
    ```yaml
    name: "JS action"
    description: "My first JavaScript action"
    runs: 
    	using: "node18"  # which version of node to run on
    	main: "main.js" # points to main.js in the same folder for running action
    ```

#### javascript actions api

This is what the API looks like for javascript actions:

```ts
const core = require('@actions/core');
console.log('Hello from JS Action!');
core.setOutput('greeting', 'Hello from JS Action!');
```

## Integrations

### Sending email notifications

## ACT

You can use the `act` CLI tool easily to test your github actions locally. You can choose to download a medium-size version of the docker image.

### basic usage

Running the `act` command in your project looks for workflow files from the root level and runs all workflows locally.

```bash
act
```

If running on a mac, you may need to specify to use linux architecture to avoid issues:

```bash
act --container-architecture linux/amd64
```

### With specific triggers

You can choose to run only specific triggers with the `act <trigger>` command

```bash
act <trigger>
```

For example, the `act workflow_dispatch` command would run only the workflows with a `workflow_dispatch` trigger.