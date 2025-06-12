

## Basics

A github action is a CI/CD pipeline made from **workflows**, where each workflow can run several **jobs** when **triggers** are triggered:

- **jobs**: The main thing behind CI/CD - you test your code, build, deploy. Each job runs in a new ephemeral VM where you can get access to your codebase and do stuff with it
- **triggers**: These are events that the workflow listens for (like pull request or push to main), and when triggered, the workflow runs all the jobs it has.

### The workflow of workflows

A workflow is a single yaml file in your `.github/workflows` directory. This is what a basic workflow will look like:

All jobs in a workflow run in parallel by default. All the steps inside a job are run sequentially. 

```yaml
name: workflow learning
on: 
	push: ["main"]

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

Each job is made of multiple steps defined in the `steps` key and can either run linux commands on the job's VM or use predefined github actions from **github marketplace** to do stuff.

- `uses`: To use an action in a step, use the `uses` keyword and pass in a github action as the value.
- `with`: When actions need configuration, you provide those configuration steps using the `with` keyword.

```yaml
steps: 
  - name: checkout
    uses: actions/checkout@v3
		with: 
			# some configuration
```**

### triggers

Here are a list of the main triggers, which live under the root level `on` key:

- `push`: triggers when there is a push on one of the branches from the given array of branches
- `pull_request`: triggers when there is a pull request to one of the branches from the given array of branches
- `schedule`: triggers at a specific time based on a string of cron syntax
- ``

#### Cron Scheduling

By listening to the `schedule` workflow trigger, you can pass in a cron event so that your github action runs jobs repeatedly based on a schedule.

```yaml
name: run every day

on:
	schedule: 
		- cron: '0 0 * * *'
```

## Custom containers with docker

## Integrations

### Sending email notifications

## ACT

You can use t