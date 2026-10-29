## Gitlab features

### Pull requests

Within pull requests, there are some cool things you can do:

- **add tasks**: markdown todo lists actually create real tasks that are then tracked via DB and shown for all users, creating a nice todo list of tasks to finish on the PR

### Todo list

When you tag something with an `@<username>` mention, it automatically creates a todo item in the **todo list** for their account.

Also, issues assigned to you are also automatically added to your todo list

### Issues

Here is how to create an issue


![](https://i.imgur.com/FwjREIo.jpeg)

A created issue makes a branch behind the scenes, thus you can also create pull requests based on issues and merge issues in.

**labels**

You can also add labels to the issues. 

![](https://i.imgur.com/xOOadAc.jpeg)

You can also subscribe to labels to receive notifications and updates from issues tagged with those labels:


![](https://i.imgur.com/URqfbFd.jpeg)

Based on filtering with labels, you can view them in boards and save those views



![](https://i.imgur.com/YCjnhEO.jpeg)

### SSH 

**Linux**

Here are the steps to set up SSH keys with Gitlab:

1. Create an SSH key pair on your local machine

```sh
ssh-keygen -t ed25519 -C "aadil.mallick@unisonglobal.com"
```

2. THis is what the full process looks like

```
amallick@5DTBSJ4:~$ ssh-keygen -t ed25519 -C "aadil.mallick@unisonglobal.com"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/amallick/.ssh/id_ed25519): gitlab_devsecops
Enter passphrase for "gitlab_devsecops" (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in gitlab_devsecops
Your public key has been saved in gitlab_devsecops.pub
The key fingerprint is:
SHA256:asfalksjfalsda aadil.mallick@unisonglobal.com
The key's randomart image is:
+--[ED25519 256]--+
|                 |
|                 |
afjdaskhfajksfaj
|=XO*o=+          |
+----[SHA256]-----+
amallick@5DTBSJ4:~$
```

3. Paste the public SSH key contents (the file ending in `.pub`) into Gitlab
4. Extract your company's gitlab self-hosted host domain, which you will use for scoping easy SSH authentication configuration for specific hosts.

![](https://i.imgur.com/KqBwPDT.jpeg)

5. For the host, edit your `~/.ssh/config` and point to your private key filepath of the SSH key pair you created for the identity file.

```bash title="~/.ssh/config"
# Personal GitHub Account
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal_aadilmallick

# company gitlab
Host gitlab.compusearch.com
    HostName gitlab.compusearch.com
    User git
    IdentityFile ~/.ssh/gitlab_devsecops

```

**Windows**

On windows, the keys are saved in `%USERPROFILE%\.ssh` — the private key has no extension, the public key ends with `.pub`.

On windows, the only difference is the filepath structure, but the `~/.ssh/config` path and file still works the same and the `ssh` command still works the same:


1. Generate the SSH key pair. Give the public key to GitLab as usual. 
2. In the SSH config point the identity file for your specific self-hosted GitLab host to your private key from the key pair you created. 


```bash
Host gitlab.compusearch.com
  HostName gitlab.compusearch.com
  User git
  IdentityFile 'C:\Users\amallick.ENGINEERS/.ssh/gitlab_devsecops'
  IdentitiesOnly yes
```

3. Test the SSH connection. 

```
PS C:\Users\amallick.ENGINEERS> ssh -T git@gitlab.compusearch.com

Authorized uses only. All activity may be monitored and reported.
Welcome to GitLab, @amallick!
```

### Gitlab pages

Gitlab pages is exactly like github pages.

## Gitlab CI

### Basics

#### Stages vs Jobs

A gitlab pipeline (single `gitlab-ci.yml` file) consists of **stages** and **jobs**:

- **stages**: Parent containers of jobs, where stages either have one job or have many jobs. 
	- Stages run sequentially.
- **jobs**: defines an execution environment for a runner via a docker image, checks out the source code, and runs shell scripts within that job. 
	- Jobs within the same stage run in parallel.

Here are the rules of job failure:

- **all jobs must pass in order for a stage to pass**: Once all jobs within a stage complete execution successfully, then the pipeline moves on to execute the next stage.
- **If a job fails, the stage fails**: If any job in a stage fails, the next stage is not (usually) executed and the pipeline ends early

| Stages                                                          | Jobs                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| Control _when_ things run                                       | Control _what_ runs                                         |
| Run **sequentially**                                            | Run **in parallel** (within a stage)                        |
| Pipeline moves to next stage only if current stage jobs succeed | Each job is a specific task (like “run tests”)              |
| E.g., build → test → deploy                                     | E.g., run Jest tests, check code quality, deploy to staging |

 A typical pipeline might consist of three stages: build, test, and deploy. In fact, these three stages are the default in GitLab.


![](https://i.imgur.com/i2m6Npc.jpeg)

Here's how to define stages in YAML, which you do under the `stages` list:

```yaml
stages:
  - build
  - test
  - deploy
```

And here's how you would create jobs that corresponds to a stage:

```yaml
build_job:
  stage: build
  image: node:latest
  script:
    - mkdir -p public
    - cp -r *.html *.js *.css public/
  artifacts:
    paths:
      - public

test_job:
  stage: test
  image: node:latest
  script:
    - npm install
    - npm test
```

On each job you have the following properties:

- `stage`: the corresponding stage for the job
- `image`: the docker image to use for the runner execution environment when running the job
- `artifacts`: pass corresponding folderpaths and filepaths as artifacts that can be used by other jobs in other stages.
- `dependencies`: specify a list of jobs the current job depends on. This means that this job will run sequentially after all of its dependencies have finished, or will trigger the dependency builds first in order to run afterwards.

#### Pipeline editor

There is a native pipeline editor in the gitlab UI that lets you create pipelines for your repo, which can access by navigating to `Build > Pipeline editor` in your GitLab project.

Rather than editing `.gitlab-ci.yml` directly in a text editor, the Pipeline Editor gives you immediate feedback and visibility — helping you catch problems before they reach your pipeline.

Here are the three key benefits:

- **Live syntax validation** — catches errors as you type, before you commit anything to your repository.
- **Visual pipeline diagram** — shows your stages and jobs laid out graphically so you can verify the flow at a glance.
- **Full configuration tab** — displays the fully merged YAML from all your `include` statements in one place, making it easy to spot errors across files.
#### Deploy jobs, dependencies, GitLab pages

`pages` is a special name for a job in the `deploy` stage that you can configure to publish an artifact with an `index.html` within it to github pages when pushing to the main branch:

```yaml
stages:
  - build
  - deploy

# 1. build job creates public/ artifact
build:
  stage: build
  image: node:latest
  script:
    - mkdir -p public
    - cp -r *.html *.js *.css public/
  artifacts:
    paths:
      - public

# 2. pages job runs in `deploy` stage, depends on `build` job.        
pages:
  stage: deploy
  script:
    - echo "Deploying to GitLab Pages..."
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_REF_NAME == "main"
  dependencies:
    - build
```

Here's a complete example:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: oven/bun:latest
  script:
    - bun install --frozen-lockfile
    - bun test ./tests/transformer.test.ts
    - bun run index.ts
  artifacts:
    paths:
      - public
    expire_in: 1 hour

pages:
  stage: deploy
  image: busybox
  dependencies:
    - build
  script:
    - echo "The site will be deployed to $CI_PAGES_URL"
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

```

Here's another example:

```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:latest
  script:
    - mkdir -p public
    - cp -r *.html *.js *.css public/
  artifacts:
    paths:
      - public

test:
  stage: test
  image: node:latest
  script:
    - npm install
    - npm test

pages:
  stage: deploy
  script:
    - echo "Deploying to GitLab Pages..."
  artifacts:
    paths:
```

### Templates and components

As your development team scales, keeping CI/CD pipelines efficient and consistent becomes harder. Instead of repeating the same pipeline code across multiple projects, GitLab gives you powerful tools to **reuse, organize, and share** configurations.

GitLab lets you split and reuse your pipeline configuration with the `include` keyword to build composable CI/CD pipelines by importing other **templates**.

When you use `include`, GitLab **merges** the external YAML from the imported template or component into your `.gitlab-ci.yml` at runtime.


This helps you:

- Avoid repeating the same logic across files
    
- Share pipeline snippets across projects
    
- Centralize templates for easier maintenance
    

#### `include: local`

The `local` resource allows you to import a **YAML CI template** in the repo codebase to merge that into the CI entrypoint.

A YAML CI template in Gitlab is kind of a building block to the full pipeline YAML that is `.gitlab-ci.yml`, where a YAML CI template doesn't really stand on it's own and is meant to be merged in to a pipeline via `include` directive usage.

Here are the rules of YAML CI templates:

- **no stages**: don't list stages in a template.
- **only jobs**: stages can only have job definitions.

Here is an example:

1. Create the local CI YAML file, which doesn't have to be a full file with stages. It can just contain jobs. 

```yaml title="ci/test-jobs.yml"
test:
  script:
    - echo 'Running tests...'
```

2. In the `.gitlab-ci.yml` use the `include` directive to include it locally, and point to the file using absolute filepaths starting from the runner root  (project root)

```yaml title=".gitlab-ci.yml"
include:
  - local: '/ci/test-jobs.yml'
```

#### `include: project`

This allows you to include YAML files from other GitLab projects on the same instance. This is helpful when you want to share configurations across multiple projects.

1. Create a repo with a YAML file with some CI.

```yaml title="ci/test-jobs.yml"
# committed in repo create-group/ci-config
test:
  script:
    - echo 'Running tests...'
```

2. In another repo, in the `.gitlab-ci.yml`, use the `include` directive with the `project` type to target that specific YAML file in another repo.

```yaml title=".gitlab-ci.yml"
include:
  - project: 'create-group/ci-config'
    ref: main
    file: '/ci/test-jobs.yml'
```

#### `include: remote`

This allows you to include YAML files from remote URLs, instead of just within your GitLab instance. For example:

```yaml
include:
  - remote: 'https://gitlab.com/example-project/-/raw/main/.gitlab-ci.yml'
```

#### Components intro

Components are the equivalent of workflow actions, which are shared, versioned pipeline building blocks anyone on the team can reuse.

Here is an example of using a component, which needs to be imported using the `include` directive:

```yaml
include:
	- component: $CI_SERVER_FQDN/components/markdownlint/markdownlint@2.1.0
```

| Part                    | What it means                                               | Syntax              |
| ----------------------- | ----------------------------------------------------------- | ------------------- |
| $CI_SERVER_FQDN         | Points to our GitLab instance (no need to hardcode the URL) | gitlab instance URL |
| components/markdownlint | The group and project where the component lives             | repo                |
| markdownlint            | The specific component name                                 | component name      |
| @2.1.0                  | The exact version we want to use                            | version             |

For versioning you have these options, since in the end you're just targeting a specific reference (tag or commit) from a repo.

| Reference Type | Example                               | Use Case                                                                          |
| -------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| Commit SHA     | e3262fdd0914fa8...                    | Pin to an exact commit for full stability (great for audits or long-term support) |
| Tag            | @1.0.2                                | Reference a released version—stable, predictable                                  |
| Branch         | main                                  | Track ongoing development (useful for testing or internal work-in-progress)       |
| @~latest       | Always uses the newest stable version | Use _only_ in dev or exploratory contexts where breakage is OK                    |

#### Creating components

Here are the best practices when creating components:

- **single responsibility**: A good component does one thing well, and are all focused and reusable—no sprawling logic or ambiguous purpose.
- **well documented**: has documentation and comments on these 4 things:
	1. purpose and functionality
	2. required and optional inputs
	3. expected outputs
	4. usage examples
- **flexible yet opinionated**: let your components set smart defaults based on team standards but allow customization through inputs, and enforce a common standard for input and output.
- **versioned and testable**: implement semantic versioning, automated tests to verify functionality, and set up a clear release process.

You can create multiple components in a dedicated repo for them, and they must have this structure, with these special files and folders:

- `templates/`: the folder which contains component YAML files
- `.gitlab-ci.yml`: file to test the components

```
├── templates/
│   └── my-component.yml
├── LICENSE.md
├── README.md
└── .gitlab-ci.yml
```

or a more advanced structure:

```
├── templates/
│   ├── my-simple-component.yml
│   └── my-complex-component/
│       ├── template.yml
│       ├── Dockerfile
│       └── test.sh
```

> [!TIP]
> In GitLab 18.0+, you can use the built-in CI/CD Catalog project template to get the `/templates` directory, `README`, and release pipeline pre-scaffolded

##### Component YAML

A component YAML has two top-level sections:

- **The spec section** (metadata and inputs)
- **The implementation section** (the actual job logic)

Here's an example:

```yaml title="templates/my-simple-component.yml"
# Specification section
spec:
  inputs:
    stage:
      description: "Pipeline stage to run the job in"
      type: string
      default: test

    message:
      description: "Custom message to display"
      type: string
      default: "Hello from my component!"

# Separator between spec and implementation
---

# Implementation section
hello-job:
  stage: $[[ inputs.stage ]]
  image: alpine:latest
  script:
    - echo "$[[ inputs.message ]]"
```

Then after creating a component, you can test it in a workflow in the same repo via the `.gitlab-ci.yml`

```yaml title=".gitlab-ci.yml"
include:
  - component: $CI_SERVER_FQDN/$CI_PROJECT_PATH/hello-world@$CI_COMMIT_SHA
    inputs:
      stage: build
      message: "Hello from testing!"

stages: 
  - build
  - test

ensure-job-added:
  stage: test
  image: badouralix/curl-jq
  script:
    - |
      route="${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/pipelines/${CI_PIPELINE_ID}/jobs"
      count=$(curl --silent "$route" | jq 'map(select(.name | contains("hello-job"))) | length')
      if [ "$count" != "1" ]; then
        echo "ERROR: hello-job was not created by the component!"
        exit 1
      else
        echo "SUCCESS: hello-job was successfully created by the component"
      fi

```

##### Publishing a component

In order to publish a component, you must first have at least **maintainer** permissions for the project.

Here are the steps to publish a component:

1. Mark the project as a **CI/CD Catalog project**
2. Add a description to the project, fill out the `README.md`
3. Add a `release` job in the `.gitlab-ci.yml` to automate publishing whenever a new tag is pushed.

```yaml
create-release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script: echo "Creating release $CI_COMMIT_TAG"
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+$/  # Only for semver tags
  release:
    tag_name: $CI_COMMIT_TAG
    description: "Release $CI_COMMIT_TAG of components in $CI_PROJECT_PATH"
```

4. Tag the release and push it

```bash
git tag v1.0.0
git push origin v1.0.0
```
#### Advanced components
##### Components with inputs

```yaml
stages:
  - lint
include:
  - component: $CI_SERVER_FQDN/components/code-quality-oss/codequality-os-scanners-integration/pylint@1.0.7
    inputs:
      stage: lint
      image: python:3.9
```

### Pipeline execution strategy

Pipeline execution policies are a GitLab feature that allows administrators to define mandatory pipeline configurations that are automatically injected into projects. They’re a powerful tool for enforcing organizational standards—like security scans, test coverage, or compliance checks—across all pipelines.

These policies are centrally managed in GitLab’s Policy Project and use reserved stages (like `.pipeline-policy-pre`) to insert jobs at specific points in the pipeline.
### MakeFiles strategy

### Security scanning

GitLab provides a set of security scanners, which allow you to scan your code for security vulnerabilities. There are two types of vulnerability scanners provided by GitLab:

- **Static analysis scanners** run against your applications source code, looking for vulnerable patterns in the code.
    
-  **Dynamic analysis scanners** scan running applications for common vulnerabilities. The goal of a dynamic scanner is to look for vulnerable behavior that only occurs when the application runs.
    



#### Free vs Ultimate

| Capability                                          | Free | Ultimate |
| --------------------------------------------------- | ---- | -------- |
| Basic SAST scanning (open-source analyzers)         | ✅    | ✅        |
| Secret Detection                                    | ✅    | ✅        |
| Downloadable scan reports                           | ✅    | ✅        |
| Advanced SAST (cross-file, cross-function analysis) | ❌    | ✅        |
| Vulnerability Management dashboard                  | ❌    | ✅        |
| Merge Request security findings widget              | ❌    | ✅        |
| Inline security findings in MR changes view         | ❌    | ✅        |
| Advanced Vulnerability Tracking                     | ❌    | ✅        |
| UI-based scanner configuration                      | ❌    | ✅        |
| Ruleset customization                               | ❌    | ✅        |
| GitLab Duo false-positive detection\*               | ❌    | ✅        |
| Automatic AI-generated vulnerability fixes\*        | ❌    | ✅        |
For SAST, Free includes:

- Static Application Security Testing using GitLab-provided analyzers
- Security scanning during CI/CD pipelines
- JSON security reports
- Support for the standard language analyzers (Semgrep and other OSS scanners)

For Secret Detection, Free includes:

- Pipeline-based secret scanning
- Secret Push Protection
- Client-side secret detection in issues and merge requests

This is enough if your goal is simply:

- Detecting vulnerabilities
- Detecting leaked credentials/secrets
- Failing pipelines based on findings
- Reviewing reports manually

Gitlab Ultimate is $99/user/month, but here are the features:

- **advanced SAST engine**: GitLab Advanced SAST performs cross-file and cross-function data flow analysis, which can find vulnerabilities that simple pattern matching misses. Ultimate can trace user input through multiple methods/classes/files before identifying the sink.
- **vulnerability management**: Ultimate turns scan results into a managed vulnerability lifecycle: Track vulnerabilities over time, Assign ownership, Triage findings, Monitor remediation status.
- **merge request integration**: on a PR, security scanning runs as a CI/CD step out of the box.
- **advanced vulnerability tracking**: When code is refactored or moved, Free may treat findings as new findings, while Ultimate can recognize that the vulnerability is the same issue and preserve history.
- **AI-powered security**: automatic merge requests made by AI to fix found vulnerabilities, and AI explanations of merge requests.

#### Security scanning CI basics

Security scanning in Gitlab works by adding it as config to the gitlab CI file, which will then run the security scan on a workflow trigger and result in the following:

1. **built-in security findings**: view security findings in the UI after a workflow trigger
2. **security reports**: In addition to the built in security reports, you can also retrieve downloadable reports from your security scanners, using job artifacts. For security scanners in GitLab, job artifacts are generated during each scan. Typically, they are stored in a JSON format. 
	- For example, the SAST scanner generates a JSON file titled `gl-sast-report.json`. 
	- When you download this report, you will see JSON data outlining vulnerabilities found by the scanner, as well as details about the scan that was run.

Security scanning CI in gitlab pulls from pre-defined CI workflows that gitlab provides for security scanning:

- **`Jobs/SAST.gitlab-ci.yml` template**: jobs template for running SAST on the checked out source code
- **`Jobs/Secret-Detection.gitlab-ci.yml` template**: jobs template for running secret scanning on the checked out source code
- **`Jobs/SAST-IaC.gitlab-ci.yml` template**: jobs template for running IaC scanning on the checked out source code

```yaml
include:
  - template: Jobs/SAST.gitlab-ci.yml # include SAST
  - template: Jobs/Secret-Detection.gitlab-ci.yml
  - template: Jobs/SAST-IaC.gitlab-ci.yml
```

### Gitlab runners

#### How runners work

Gitlab runners are gitlab-managed VMs that execute pipelines for you.

Think of your **`.gitlab-ci.yml`** file as the blueprint. Runners are the machines that carry out the work. 

When a pipeline is triggered, available runners check in with GitLab to pick up jobs that perform various tasks, like running tests, building apps, or deploying changes.

GitLab’s runner system includes:

1. **GitLab Runner** – the actual software installed on a VM
    
2. **runners** – the agents that execute pipeline jobs
    
Each runner runs inside an environment defined by an **executor** like Docker or Shell, and for a pipeline you can target which runner to use for that pipeline via **tags**

In GitLab, there are two ways you can implement runners runners:

- **GitLab-hosted Runners**: Hosted by GitLab. Easy, but expensive
- **Self-Managed Runners**: Hosted by you. Free, but hard to manage.

There are three types of runners, arranged in order of most privileged to least privileged in terms of the projects they can run CI/CD for:

- **instance runners**: Instance runners are shared across every project in a GitLab instance. They are ideal for organizations that want to streamline their CI/CD processes across multiple projects.
- **group runners**: Group runners are available to every project within a specific group. These runners are particularly useful when several related projects share similar build or test requirements.
- **project runner**: Project runners are dedicated to specific projects and must be explicitly enabled in the project’s settings. They are ideal for scenarios where a project requires isolation, such as regulated builds or custom environments.


Here's how the entire flow works:

1. You trigger a configured workflow trigger in the **`.gitlab-ci.yml`** file, which Gitlab recognizes, like pushing to `master` or making a pull request.

2. GitLab starts a pipeline and queues the jobs
    
3. Runners poll GitLab to look for available jobs
    
4. GitLab assigns jobs based on runner tags and availability
    
5. The assigned runner executes the job and returns the result

#### Self-hosted runners vs cloud runners

**Cloud runners**

SaaS runners are enabled by default on GitLab.com projects. When a pipeline runs, GitLab spins up a fresh virtual machine (VM) just for that job. The VM is deleted after the job completes.

Two jobs never run on the same VM, this ensures clean, isolated execution every time.

> [!WARNING]
> **Keep in mind**: SaaS runners consume shared compute minutes, so be mindful of your organization’s quota.

**self-hosted runners**

With **Self-Managed Runners**, you can:

- Run jobs on your own infrastructure
    
- Customize environments (OS, memory, security)
    

If you use a self-managed GitLab instance, you **must** register your own runners. On GitLab.com, self-managed runners are optional, but they give you flexibility.
#### Executors

While a **runner** picks up CI/CD jobs from GitLab, the **executor** determines _how_ and _where_ those jobs are run.

An executor is the method a GitLab runner uses to run the commands of a job. It determines the environment and process for executing the job’s tasks.

Each registered runner must use exactly one executor type, which defines how every job is executed by that runner.


Think of it like this:

- **Runner:** Connects to GitLab, polls for jobs, manages overall execution.

- **Executor:** The method the runner uses to run the job’s commands.

Here are the different types of executors:

- **docker executor:** Each job is run in a docker image of your choice. At the beginning of the pipeline, the source code is checked out, and then in each job a container is created with the source code copied over into the container; all step execution is in the context of the container. 
	- **use case**: The Docker executor creates a new container for each job, ensuring that tasks run in isolated environments. This approach is particularly useful for running frontend build and test jobs, as it minimizes interference between processes.
- **shell executor:** Each job runs directly on the server VM, in a shell of your choice (powershell, bash), but this means that it's the same basically as you SSHing into the VM and running those commands there, but in this case you're just doing it from CI. 
	- **con**: You have to manually clean up after yourself and also it's less secure since you're running shell commands directly on the server
	- **use case**: This executor type is ideal for scenarios where simplicity and direct interaction with the host system are priorities.
- **kubernetes executor**: The Kubernetes executor runs each job in a pod, making it an excellent choice for cloud-based scaling. It is frequently used for mobile build jobs that require high levels of concurrency and resource management.
- **SSH executor**: The SSH executor connects to a remote machine via SSH to execute commands, providing flexibility for managing remote systems.

#### Runner selection in pipelines

When you define jobs in your `.gitlab-ci.yml` file, you can control _which_ runners are eligible to pick up those jobs. This is key for ensuring that jobs run in the right environments—with the right permissions and resources.


Here is why runner selection matters:

1. Some jobs may require specific environments or resources.
    
2. You may want to reserve certain runners for specific job types.
    
3. Security requirements may limit which runners can be used.

You can influence which runner is used in a pipeline using:

- **Runner availability and scope**: filters to only available runners (not currently running a job) and goes down the list in order of highest specificity (project runners first).
    
- **Runner tags**: Tags are labels assigned to runners that describe their capabilities, such as 'android' or 'xcode'. These tags allow you to restrict jobs to specific runners that meet the required criteria, ensuring the right tools and environments are used.
    
- **Protected runners** Protected runners are configured to execute jobs exclusively from protected branches and tags, making them ideal for production workflows. This setup ensures that only trusted code is deployed to critical environments.

**runner scope**

By default, when GitLab processes a pipeline, it prioritizes runners in the following order: 

1. project runners: most specific
2. group runners (including parent groups)
3. instance runners: least specific 

This ensures that project-specific runners are selected first, providing a tailored execution environment for critical tasks

#### Installing self-hosted runners
##### Installing self-hosted gitlab runner (ubuntu)

1. SSH into a linux VM
2. Install the gitlab runner software

```bash
curl -L \
https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh \
| sudo bash

sudo apt install gitlab-runner -y

# verify
gitlab-runner --version
```

3. Install docker

```bash
sudo apt update
sudo apt install docker.io -y

sudo systemctl enable docker
sudo systemctl start docker
```

4. Obtain an instance runner registration token from **Admin ➡️ Settings ➡️ CI/CD ➡️ Runners**
5. In the linux VM, run this command to register the runner

```bash
sudo gitlab-runner register
```

##### Installing self-hosted gitlab runner (rhel)

RHEL with gitlab runner with docker executor is unique because docker isn't very compatible with RHEL.

Here are all the reasons why using docker sucks on RHEL:

So instead we use podman, which has out-of-the-box support with RHEL for linux containers.