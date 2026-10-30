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
- `image`: the docker image to use for the runner execution environment when running the job. Can be set globally or per-job.
- `artifacts`: pass corresponding folderpaths and filepaths as artifacts that can be used by other jobs in other stages.
- `dependencies`: specify a list of jobs the current job depends on. This means that this job will run sequentially after all of its dependencies have finished, or will trigger the dependency builds first in order to run afterwards.
- `allow_failure`: a boolean value where if `true`, then even if the job fails it does not cause the stage to fail.
- **script commands**: These three script commands run shell commands and accept list of shell command strings to run sequentially:
	- `before_script`: runs setup
	- `script`: runs the actual work
	- `after_script`: shell code that always runs after `script`, even if `script` fails. (good for cleanup)
- **`tags`**: labels used to match a job to specific runners (important once you have multiple runners, e.g. one tagged `docker`, one tagged `macos`).
- **`variables`**: key/value pairs scoped to a job (or global, at the top of the file).

These two sections can either be declared globally (for which then they apply to all jobs) or at the job-level to apply to a specific job

- `image`: docker image for the job environment
- `variables`: become both CI vars and env vars that can then be accessed through shell variable interpolation

These are the global CI variables you have available:

- `CI_COMMIT_BRANCH`: represents the branch the workflow is currently running, like `main`.
- 

#### Pipeline editor

There is a native pipeline editor in the gitlab UI that lets you create pipelines for your repo, which can access by navigating to `Build > Pipeline editor` in your GitLab project.

Rather than editing `.gitlab-ci.yml` directly in a text editor, the Pipeline Editor gives you immediate feedback and visibility — helping you catch problems before they reach your pipeline.

Here are the three key benefits:

- **Live syntax validation** — catches errors as you type, before you commit anything to your repository.
- **Visual pipeline diagram** — shows your stages and jobs laid out graphically so you can verify the flow at a glance.
- **Full configuration tab** — displays the fully merged YAML from all your `include` statements in one place, making it easy to spot errors across files.
#### GitLab pages

`pages` is a special name for a job in the `deploy` stage that you can configure to publish an artifact with an `index.html` within it to github pages when pushing to the main branch.

Here are the CI vars you have access to on the `pages` job:

- `$CI_PAGES_URL`: the pages URL getting deployed to


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

Here's a complete examples with variables:

```yaml
image: busybox:1.36.1

stages:
  - deploy

pages:
  stage: deploy
  environment: 
    name: production
    url: $CI_PAGES_URL
  script:
    - echo "The site will be deployed to $CI_PAGES_URL"
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
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

Here are the steps to publish a component, which involve adding the component YAML and then publishing the project to the gitlab package registry via a release job.

1. Mark the project as a **CI/CD Catalog project**
2. Add a description to the project, fill out the `README.md`
3. Add a `release` job in the `.gitlab-ci.yml` to automate publishing to the **gitlab package registry** whenever a new tag is pushed.

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


##### All together

1. Create a new repo
2. Go to **Settings > General > Visibility, project features, permissions** and then enable **CI/CD Catalog project**
3. Create a component YAML

```yaml title="templates/html-validator.yml"
spec:
  # define inputs as `stage` and `html_path`
  inputs:
    stage:
      description: "Pipeline stage to run HTML validation in"
      type: string
      default: test
    
    html_path:
      description: "Path to HTML files to validate"
      type: string
      default: "public"
---
html-validator:
  stage: $[[ inputs.stage ]]
  image: node:20-alpine
  script:
    - echo "Running HTML validation on $[[ inputs.html_path ]]"
    - npm install -g html-validate
    - find $[[ inputs.html_path ]] -name "*.html" -exec html-validate {} \;
  allow_failure: true
```

4. Create a new pipeline:

```yaml
stages:
  - test
  - release
test-component:
  stage: test
  image: alpine:latest
  script:
    - test -f templates/html-validator.yml || exit 1
    - echo "Component structure validated"
create-release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script: echo "Creating release $CI_COMMIT_TAG"
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/
  release:
    tag_name: $CI_COMMIT_TAG
    description: "Release $CI_COMMIT_TAG of HTML validator component"
```

5. Commit changes, push. Create and push a tag to release your component.

Now you can use this published component in a new project:

```yaml
stages:
  - validate
  - test
  - code_quality
  - deploy
default:
  image: busybox
include:
  - component: gitlab.com/your-username/swag-store-components/html-validator@1.0.0
    inputs:
      stage: validate
      html_path: "public"
  - component: $CI_SERVER_FQDN/components/code-quality-oss/codequality-os-scanners-integration/pylint@1.0.7
    inputs:
      stage: code_quality
test_job:
  stage: test
  script:
    - exit 1 
  allow_failure: true
pages:
  stage: deploy
  environment: production
  script:
    - echo "The site will be deployed to $CI_PAGES_URL"
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```
#### Advanced components
##### Components with inputs

When creating a component, you can define the input variables this component wants to receive via the `spec.inputs` section, and then when using the component via the `include` directive, you define an `inputs` section and supply the value for each input.

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

### Registries

| Term      | Definition                                                      |
| --------- | --------------------------------------------------------------- |
| Registry  | A storage and distribution system for versioned artifacts       |
| Package   | A bundled collection of software and its dependencies           |
| Container | A lightweight, standalone executable software package           |
| Image     | A template for creating containers with specific configurations |
| Tag       | A label used to identify specific versions of artifacts         |

Registries in Gitlab have these properties:

- **CI/CD**: Registries are fully integrated with GitLab CI/CD, enabling you to automate the build, test, and deployment of packages and containers.
- **security**: Access controls ensure that only authorized users can publish or consume artifacts.
- **centralization**: All your artifacts are stored in one place, eliminating the need for external services.
- **versioning**: Easily track and manage different versions of your artifacts.
- **reduced build times**: Caching capabilities decrease build times by reusing previously built artifacts.

There are 4 types of registries in gitlab:

- **package registry**: The GitLab Package Registry serves as a repository for software packages like npm, Maven, PyPI, and more. It simplifies dependency management and provides a centralized location for all your project's packages.
- **container registry**: The GitLab Container Registry is a secure and private registry for Docker images. It allows you to build, store, and distribute container images that can be used in your CI/CD pipelines.
- **terraform module registry**: The Terraform Module Registry provides a secure place to store and version your Terraform modules, making infrastructure as code more manageable.
- **dependency proxy registry**: The Dependency Proxy acts as a local proxy for frequently-used upstream images and packages, improving download times and reducing bandwidth usage.

#### Package registry

The GitLab Package Registry is a built-in repository for storing and distributing software packages across various programming languages and technologies. It provides a secure, centralized location for your project's dependencies, making package management more efficient and reliable.

here are the supported package managers:

- **generic packages**: Works with any language/platform type. Used for binary files, artifacts without a specific package format
- **maven**: Used for Java, common use cases include enterprise applications, Android development, etc.
- **npm**
- **nuget**
- **pypi**

Using the GitLab Package Registry offers several advantages for development teams:

1. **Centralized Management**: Store all project packages in one place, making it easier to find, track, and manage dependencies.
    
2. **Seamless CI/CD Integration**: Automatically publish and consume packages as part of your CI/CD pipelines.
    
3. **Version Control**: Track different versions of your packages, enabling you to maintain backward compatibility while continuing to evolve your codebase.
    
4. **Access Control**: Control who can access and publish packages using GitLab's permission system.
    
5. **Reduced External Dependencies**: Minimize reliance on external package repositories, improving security and reliability.
    
6. **Build Acceleration**: Reduce build times by keeping frequently used packages within your GitLab infrastructure.

The GitLab Package Registry supports storing packages at either the **project** or **group** level. Choosing the right level helps keep responsibilities clear and dependencies clean.

- **project-level package**: Best for **service-specific** utilities, which are larger components only meant to be reused within the project.
- **group-level package**: Ideal for **shared packages** reused across multiple services and projects, like utility functions.
##### Publishing to a package registry

Here is an example of creating a job that publishes a python codebase as a package to the gitlab package registry:

```yaml
  stage: publish
  image: python:3.9-alpine
  script:
    - pip install build twine
    - python -m build
    - TWINE_PASSWORD=${CI_JOB_TOKEN} \
      TWINE_USERNAME=gitlab-ci-token \ 
      python -m twine upload \
      --repository-url ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/pypi dist/*
```

- `CI_JOB_TOKEN` [provides authentication](https://docs.gitlab.com/ci/jobs/ci_job_token/) with the GitLab Package Registry, and is dynamically injected during the lifecycle of the running job.
    
- `gitlab-ci-token` is the required username when using the job token
    
- The twine upload command publishes the package to the registry, using the registry URL constructed from `CI_API_V4_UR`L and `CI_PROJECT_ID` variables


##### Installing packages locally

You can then install the package locally like so:

```bash
# 1. get personal access token for accessing gitlab
$TOKEN="glab..."
# 2. define tagged version you want to install of package
$VERSION=1.0.0

pip install --index-url https://gitlab-ci-token:$TOKEN@gitlab.com/api/v4/projects/12345678/packages/pypi/simple swag-store-utils==1.0.0
```

For a more permanent setup, the developer can configure pip to always use the correct registry by creating a `~/.pip/pip.conf` file (Linux/macOS) or `%APPDATA%\pip\pip.ini` (Windows):

```toml
[global]
index-url = "https://gitlab-ci-token:YOUR_PERSONAL_ACCESS_TOKEN@gitlab.com/api/v4/projects/12345678/packages/pypi/simple"

```

##### Using packages in a CI/CD pipeline

Once you have published a package to a CI/CD registry, you can use it in a CI/CD pipeline like so, just running a shell command to download the package as if you were using it locally.

```yaml
test-checkout-service:
  stage: test
  image: python:3.9-alpine
  script:
    # Install dependencies including the utilities package
    - pip install --index-url https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/pypi/simple swag-store-utils
```

GitLab can **forward package requests** to public registries like PyPI or npm when packages aren’t found locally. This simplifies development—but should be used with caution in production environments.

This is an important distinction to make in terms of security:

- **Development builds** allow request forwarding, helping devs pull from PyPI when testing new tools.
    
- **Production builds** disable forwarding to ensure only approved packages are used.

```yaml
# Production pipeline with request forwarding disabled
prod-build:
  variables:
    PIP_NO_INDEX: "true"  # Prevents fallback to public PyPI
  script:
    - pip install --index-url ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/pypi/simple swag-store-utils
```

#### Container registry

##### Publishing containers

Here's how to publish a Docker image to the container registry:

1. Create a Dockerfile in your repo:

```Dockerfile
# Use lightweight Nginx image as the base
FROM nginx:alpine

# Copy the static website files to the Nginx html directory
COPY public/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
```

2. Configure the CI/CD pipeline:

```yaml title=".gitlab-ci.yml"
build-and-push-image:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  variables:
    DOCKER_TLS_CERTDIR: ""
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG-$CI_COMMIT_SHORT_SHA
  script:
    - echo "Building and pushing Docker image for Swag Store..."
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG
  rules:
    - if: $CI_COMMIT_BRANCH
      changes:
        - Dockerfile
        - public/**/*
```

Let's break down this job:

- **`image: docker:24.0.5`**: Uses the Docker image to run the job
    
- **`services: - docker:24.0.5-dind`**: Enables Docker-in-Docker to build containers within the CI/CD pipeline
    
- **`variables`**: Sets up environment variables:
    
    - `IMAGE_TAG`: Creates a unique tag for the image using the branch/tag name and commit SHA
    - `DOCKER_TLS_CERTDIR`: disables Docker TLS by setting `DOCKER_TLS_CERTDIR` to an empty string, which is required for Docker-in-Docker to function correctly
        
- **`script`**: Contains the commands to build and push the image:
    
    - Logs in to the GitLab Container Registry using CI/CD variables
        
    - Builds the Docker image with the specified tag
        
    - Pushes the image to the registry
        
- **`rules`**: Defines when the job should run:
    
    - Only runs when the Dockerfile or source files change

GitLab automatically provides several [predefined variables(opens in a new tab)](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html) that simplify working with the Container Registry:

| Variable                | Description                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| `$CI_REGISTRY`          | The address of the GitLab Container Registry (e.g., registry.gitlab.com)         |
| `$CI_REGISTRY_USER`     | The username to use for logging in to the registry                               |
| `$CI_REGISTRY_PASSWORD` | The password to use for logging in to the registry                               |
| `$CI_REGISTRY_IMAGE`    | The full address of the registry image (e.g., registry.gitlab.com/group/project) |
##### Tagging strategy

Here is a good tagging strategy for your published containers:

1. **Unique Identifier**: Every image is tagged with the branch name and short commit SHA (main-a1b2c3d) for traceability (already implemented)
    
2. **Semantic Versioning**: Release versions will use semantic versioning tags (v1.2.3)
    
3. **Latest**: The most recent build on the default branch will also be tagged as latest
    
4. **Environment**: Specific images for different environments will be tagged accordingly (staging, production)

##### Using published containers

You can use published containers by pulling them down from the registry.

```yaml
test-image:
  stage: test
  needs: ["build-and-push-image"]
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  variables:
    DOCKER_TLS_CERTDIR: ""
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG-$CI_COMMIT_SHORT_SHA
  script:
    - echo "Testing the Swag Store container image..."
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $IMAGE_TAG
    - |
      # Create a container without running it
      CONTAINER_ID=$(docker create $IMAGE_TAG)
      docker cp $CONTAINER_ID:/usr/share/nginx/html/index.html ./index.html
      grep "DevOps Swag Store" index.html || {
        echo "ERROR: 'DevOps Swag Store' text not found!"
        exit 1
      }
      echo "Test passed!"
      docker rm $CONTAINER_ID
```

There are several ways to authenticate with the GitLab Container Registry:

- **personal access token**: supply a personal access token to non-interactively login to the gitlab container registry locally:

```bash
docker login -u <username> -p <personal_access_token> registry.gitlab.com
```

- **deploy token**: for automated systems or external services. 

```bash
docker login -u <deploy_token_username> -p <deploy_token> registry.gitlab.com
```

- **CI/CD job token**: Automatically available in CI/CD pipelines

```yaml
script:
 - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
```
##### Local development

You can pull down containers from the gitlab registry for local use:

1. Login to the gitlab container registry:

```bash
# Log in to the GitLab Container Registry
docker login registry.gitlab.com
```

2. Pull a specific image:

```bash
# Pull a specific image
docker run registry.gitlab.com/project/group/dev-ops-swag-store-intro-to-reg:container-81c17906
```

#### Terraform module registry

There are several ways to publish to the Module Registry. Teams can use the API, a CI/CD job with the pre-built template (recommended), or create a CI job manually.

The Terraform module registry pre-built template allows you to include a built-in gitlab-managed template that supplies important useful jobs for dealing with Terraform:

- `fmt`: Validates the formatting of the Terraform module
    
- `kics-iac-sast`: Tests the Terraform module for security issues
    
- `deploy`: Publishes the module to the Terraform Module Registry (runs only on tag pipelines)

So when we include the template in the CI/CD pipeline of a repo with terraform code, we get all of those jobs for free

```yaml
include:
  template: Terraform-Module.gitlab-ci.yml

# Optional: Configure variables to override defaults
variables:
  TERRAFORM_MODULE_NAME: aws-static-site  # Defaults to ${CI_PROJECT_NAME}
  TERRAFORM_MODULE_SYSTEM: aws  # Defaults to 'local'
  # TERRAFORM_MODULE_VERSION uses ${CI_COMMIT_TAG} by default
  # TERRAFORM_MODULE_DIR uses ${CI_PROJECT_DIR} by default

```

After publishing, the module can be used in Terraform configurations like this:

```hcl
module "static_website" {
  source  = "gitlab.com/devops-swag-store/terraform-modules/aws-static-site/aws"
  version = "1.0.0"
  
  site_domain = "dev.swagstore.example.com"
  environment = "development"
}

```

#### Dependency proxy

The **GitLab Dependency Proxy** is a built-in caching layer that improves speed, stability, and control by storing frequently used upstream images **within your GitLab instance.**

Here's the basic flow:

1. **first request**: GitLab pulls the image from the upstream registry (e.g., Docker Hub) and caches it locally.
2. **subsequent requests**: GitLab serves the image directly from cache—no external download needed.
3. **cache updates**: GitLab periodically checks if the upstream image has changed (via stale while revalidate strategy) and updates only when needed.

Here is how to use the dependency proxy for caching images:

```yaml
build-frontend:
  stage: build
  image: ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX}/docker:20.10.16
  services:
    - ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX}/docker:20.10.16-dind
```

Here are the variables you have access to:

- `CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX`: For top-level groups
    
- `CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX`: For direct or subgroup paths

### Advanced examples

#### Python package registry and container registry

```yaml
stages:
  - publish
  - consume
  - build
  - test

publish-package:
  stage: publish
  image: python:3.9-alpine
  script:
    - pip install build twine
    - python -m build
    - echo "Publishing package to GitLab Package Registry..."
    - TWINE_PASSWORD=${CI_JOB_TOKEN} TWINE_USERNAME=gitlab-ci-token python -m twine upload --repository-url ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/pypi dist/*
  rules:
    - changes:
        - pyproject.toml
        - swag_store_utils/**/*

consume-package:
  stage: consume
  image: python:3.9-alpine
  script:
    - echo "Testing package consumption from registry..."
    - pip install --index-url https://gitlab-ci-token:${CI_JOB_TOKEN}@${CI_SERVER_HOST}/api/v4/projects/${CI_PROJECT_ID}/packages/pypi/simple swag-store-utils
    - python -c "from swag_store_utils.pricing import format_price, calculate_discount; print(f'20% off $100 = {format_price(calculate_discount(100, 20))}')"

build-and-push-image:
  stage: build
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  variables:
    DOCKER_TLS_CERTDIR: ""
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG-$CI_COMMIT_SHORT_SHA
  script:
    - echo "Building Docker image for Swag Store..."
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG

test-container:
  stage: test
  needs: ["build-and-push-image"]
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  variables:
    DOCKER_TLS_CERTDIR: ""
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG-$CI_COMMIT_SHORT_SHA
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker pull $IMAGE_TAG
    - |
      # Create a container and verify it contains our files
      CONTAINER_ID=$(docker create $IMAGE_TAG)
      docker cp $CONTAINER_ID:/usr/share/nginx/html/index.html ./index.html
      grep "DevOps Swag Store" index.html && echo "✓ Container verified!"
      docker rm $CONTAINER_ID
```
### Security scanning

GitLab provides a set of security scanners, which allow you to scan your code for security vulnerabilities. There are two types of vulnerability scanners provided by GitLab:

- **Static analysis scanners** run against your applications source code, looking for vulnerable patterns in the code.
    
-  **Dynamic analysis scanners** scan running applications for common vulnerabilities. The goal of a dynamic scanner is to look for vulnerable behavior that only occurs when the application runs.
    
Gitlab free vs ultimate has these differences:

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

#### SAST

##### Intro

The SAST scanner can be added to a project through your `.gitlab-ci.yml` file. The SAST scanner is implemented as a component, with a variety of different configuration options.

The SAST scanner uses analyzers to detect vulnerabilities in source code. Currently, there are six officially supported analyzers:

- `gitlab-advanced-sast`:Designed to discover vulnerabilities by performing cross-function and cross-file taint analysis
- `kubesec`: Designed to scan Kubernetes manifests and Helm charts
- `semgrep`: Designed as a standard static scanner for most programming languages
- `spotbugs`: Designed to support Groovy

Security scanning in Gitlab works by adding it as config to the gitlab CI file, which will then run the security scan on a workflow trigger and result in the following:

1. **built-in security findings**: view security findings in the UI after a workflow trigger
2. **security reports**: In addition to the built in security reports, you can also retrieve downloadable reports from your security scanners, using job artifacts. For security scanners in GitLab, job artifacts are generated during each scan. Typically, they are stored in a JSON format. 
	- For example, the SAST scanner generates a JSON file titled `gl-sast-report.json`. 
	- When you download this report, you will see JSON data outlining vulnerabilities found by the scanner, as well as details about the scan that was run.


The most basic security scanning setup involves importing the `gitlab.com/components/sast/sast@main` component, which runs in the `test` stage by default and includes a `semgrep-sast` job to perform basic SAST on your code:

```yaml
stages:
    - test
include:
  - component: gitlab.com/components/sast/sast@main
```


For other forms of security scanning (secret detection, IaC scanning), you have templates available to import:

- **`Jobs/SAST.gitlab-ci.yml` template**: jobs template for running basic SAST on the checked out source code
- **`Jobs/Secret-Detection.gitlab-ci.yml` template**: jobs template for running secret scanning on the checked out source code
- **`Jobs/SAST-IaC.gitlab-ci.yml` template**: jobs template for running IaC scanning on the checked out source code

```yaml
include:
  - template: Jobs/SAST.gitlab-ci.yml # include SAST
  - template: Jobs/Secret-Detection.gitlab-ci.yml
  - template: Jobs/SAST-IaC.gitlab-ci.yml
```

##### Basic SAST

Here are the available inputs on the `gitlab.com/components/sast/sast` component:

- `stage`: This input is ideal for if you want to control when SAST scans occur. Many users will opt to put security scanners in their own stage.
- `image_prefix`: If you or your company have specific requirements for Docker images, these inputs will let you customize the image for the scanner. Most commonly, these inputs are used to use FIPS-enabled images in a scan.
- `excluded_paths`: If there are certain paths in your repository you want to exclude, this input allows you to do so. Often, users will exclude documentation or tests from scanning.
- `run_advanced_sast`: This input can be toggled to `true` to enable advanced SAST
- `run_kubesec_sast`: This input can be toggled to `true` to enable the kubesec-sast job. The kubesec scanner will scan Kubernetes manifest files.

Here's a more advanced example:

```yaml
stages:
  - security
include:
  - component: gitlab.com/components/sast/sast@main
    inputs:
        stage: security
        excluded_paths: "docs,tests,samples,src/components/*,src/components/*,router.jsx"
```


The GitLab Advanced SAST Scanner is a SAST analyzer which is designed to discover vulnerabilities through cross-function and cross-file taint analysis. Currently, the Advanced SAST Scanner supports the following languages:

- C#
- Go
- Java, including JSP
- JavaScript and TypeScript
- Python
- Ruby
- PHP

To enable the advanced SAST scanner in your project, you need to set the advanced_sast input to true in your .gitlab-ci.yml file. Below is an example of a configuration that does this:

> [!NOTE]
> In order to enable the Advanced SAST Scanner, you must be using component version 2.1.0 or later.

```yaml
include:
  - component: gitlab.com/components/sast/sast@2.1.0
    inputs:
      stage: security
      excluded_paths: "docs,tests"
      run_advanced_sast: true
```
##### Secret scanning

When implementing secret scanning, you have three use cases:

- **secret push protection**: Secret push protection will scan commits for secrets when you push changes to GitLab. If a push contains a secret, the push is blocked. The goal of secret push protection is to prevent pushes with secrets from reaching a repository at all.
- **pipeline secret detection**: The next line of defense is pipeline secret detection. This secret detection will scan your GitLab repository for secrets. This allows you to find secrets that have already been committed to your repository.
- **client-side secret detection**: Client-side secret detection will scan descriptions and comments of issues and merge requests for secrets before they are saved to GitLab. This helps prevent secrets from being exposed through GitLab features outside of your source code repository.

Here is how to add secret detection via component:

```yaml
stages:
  - test
include:
  - component: gitlab.com/components/sast/sast@main
  - component: gitlab.com/components/secret-detection/secret-detection@main
```

> [!NOTE]
> After adding secret detection to your project, you will see it appear in the pipeline as the `secret_detection` job. After the scan completes, your results will be visible in your **Vulnerability Report**, with a **Report Type** of **Secret Detection**.


The Secret Detection component allows you to customize functionality in two ways: **inputs** and **variables**. 

- **inputs**: You can use inputs to change the stage and image details of your scanner. 
	- `stage`: the stage to run the scanning in
- **variables**: Variables allow you to customize more of the scanner functionality, and includes the following configuration options:
	- `SECRET_DETECTION_EXCLUDED_PATHS`: Specifies the paths to exclude from the secret detection scanner.
	- `SECRET_DETECTION_HISTORIC_SCAN`: **Boolean**, lets you enable historical secret scans. This will scan your whole Git history to find any exposed secrets.
	- `SECRET_DETECTION_LOG_OPTIONS`: Allows you to configure git log options to define commit ranges for security scan findings.

```yaml
stages:
  - test
  - security

include:
  - component: gitlab.com/components/sast/sast@main
  - component: gitlab.com/components/secret-detection/secret-detection@main
    inputs:
      stage: security

variables:
  SECRET_DETECTION_HISOTRICAL_SCAN: true
```

**secret push protection**

Follow these steps to enable secret push protection:

1. Navigate to the GitLab project they want to enable push protection on.
    
2. Navigate to **Settings > Repository** in the left sidebar.journey.
    
3. In the resulting menu, expand Push rules.
    
4. Ensure that Prevent pushing secret files is checked.

##### Dependency scanning

The goal of Dependency scanners are to allow you to find security vulnerabilities in your application's dependencies. Doing this will help avoid dependency related vulnerabilities from reaching production, letting you avoid being targeted by attacks.

Dependency scanning is a core security feature that can benefit any application that requires third party dependencies, as well as containers. 

You should use dependency scanning to achieve two main objectives:

- **find vulnerabilities**: To determine if vulnerabilities exist in third party dependencies.
    
- **generate SBOM**: To generate an SBOM of all dependencies your project relies on.

> [!NOTE]
> The SBOM, or software bill of materials, shows you an overview of all of the third party dependencies in your project. When you enable dependency scanning, you will also receive an SBOM report.

Here's the basic flow:

1. **scan packages**: The dependency scanner searches for packages that are defined in your package manager files. 
	- For example, if you are using JavaScript, the dependency scanner will examine files such as `package-lock.json`.
2. **check packages against gitlab advisory database**: During this scan, the dependency scanning will determine the dependencies being used in your project, as well as the version of each dependency. This data is compared against a database known as the **GitLab Advisory Database**. 
3. **create vulnerability report**: Any vulnerabilities found in your packages are then added to your vulnerability report, complete with **CVE**, **CVSS**, and **CWE** where available.

There are two ways to add dependency scanning to your CI workflow:

- **template method (stable)**: include this template:

```yaml
stages:
  - test

include:
  - template: Jobs/Dependency-Scanning.gitlab-ci.yml
```

- **component method (beta)**: If you want to use the beta version of the dependency scanning component, you can add dependency scanning as shown in the example below:

```yaml
stages:
  - test

include:
  - component: gitlab.com/components/dependency-scanning/main@main
```

Here is how you can view dependency scanning output in the UI:

- **view dependency scan vulnerability results**: After adding the dependency scanner, you will also now be able to see vulnerabilities associated with dependencies in your project. Vulnerabilities can be found in the Vulnerability report, by selecting **Secure > Vulnerability report** in the left sidebar.
- **view SBOM**: To access the SBOM report, select **Secure > Dependency list** in the left sidebar. In this listing, you will see all of the dependencies that your dependency scanner found. The report will also list which package manager has the dependency, where the package is located, the license for the package, and any vulnerabilities associated with the package.

**continuous vulnerability scanning**

Every day, new vulnerabilities are discovered and disclosed. When you rely on third-party packages, you want to ensure that you receive notice of vulnerabilities discovered in them as soon as possible. 

To help you achieve this, you can utilize Continuous Vulnerability Scanning (CVS). 

Continuous Vulnerability Scanning looks for security vulnerabilities in your project's dependencies by comparing the component names and versions to security advisories. 

- CVS is executed using background jobs rather than the CI pipelines. 
- This means that no security report artifacts are generated as a result of the scan. Instead, vulnerabilities are directly added to the Vulnerability Report.

To enable CVS, you need to generate a CycloneDX SBOM report for your project. If you are using dependency scanning, this is automatically generated as a result of the scan. 

In addition to the SBOM report, you will also need to have security advisories synchronized to your GitLab instance. 

- **gitlab managed**: On GitLab.com, this synchronization is done automatically. 
- **self-hosted**: If you are on a self-hosted instance, you will need to configure this in your admin area.

##### Container scanning

To assist in the process of resolving container vulnerabilities, you can use the container scanner.

Container scanning is able to scan any container image you create as a part of your CI/CD process. Like dependency scanning, container scanning will check dependencies and versions against the GitLab Advisory Database.


> [!IMPORTANT]
> Container scanning does not run against your source code, but instead against the latest container in your container registry. This means that you should build your containers in the stage before you run the container scanner.

Here's an example of how to use the container scanning component to include container scanning capabilities in your CI pipeline:

```yaml
stages:
  - build
  - test

build-and-push-docker-image:
  stage: build
  image: docker:20.10.17
  services:
    - docker:20.10.17-dind
  variables:
    IMAGE: $CI_REGISTRY_IMAGE/$CI_COMMIT_REF_SLUG:$CI_COMMIT_SHA
    DOCKER_TLS_CERTDIR: ""
  script:
    - docker build --tag $IMAGE .
    - docker login --username $CI_REGISTRY_USER --password $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $IMAGE
  
include:
  - component: gitlab.com/components/container-scanning/container-scanning@main
```

Here's the basic flow of what's happening:

1. In the `build` stage, use docker-in-docker image to build a container image from the `Dockerfile` in the root of the repo and then push it to the container registry.
2. In the `test` stage, the container scanning component will run.
3. When the container scanner runs, it will pull down the most recent container that was built, and scan it for vulnerabilities. 
4. After it finishes, the container scanner will show as the `container_scanning` job in your pipeline.

Here are the additional inputs you can set on the container scanner component:

- `stage`: Defines the stage that the scanner runs in
- `analyzer_image`: Defines the container image to use for the analyzer
- `cs_image`: Defines the image to analyze with the scanner
- `dependencies`: Allows you to provide a list of CI jobs that the scanner should depend on

##### IaC scanning

IaC scanning runs against infrastructure configuration files in your GitLab repository. Infrastructure files are scanned by KICS, which is an open source static analysis tool specifically designed for infrastructure as code. 

You can add an IaC scanner to a project using a CI/CD component:

```yaml
stages:
  - test

include:
  - template: Jobs/SAST-IaC.gitlab-ci.yml
```

> [!NOTE]
> The IaC job will show as the `kics-iac-sast` job in your pipeline.

The IaC scanner template can be configured using variables. The following variables are available for this purpose:

- `SAST_EXCLUDED_PATHS`: Sets the paths to exclude from the IaC scanner

In addition to CI/CD variables, IaC scanners also provide a way of overriding and disabling predefined rules and rulesets. This can be done using the following steps:

1. Create a `.gitlab` directory in your project, if one does not already exist
2. Create a ruleset file named `sast-ruleset.toml` in the `.gitlab` directory

#### DAST

DAST allows you to run tests against a running copy of your application. This can potentially find issues that were not present in your static source code, allowing you to have a more complete picture of the security posture of your application.

DAST scanners provide a variety of different configurations and modes you can use. The two main modes available are passive and active scans.

- **passive scan**: A passive scan checks for vulnerabilities in an application by crawling the application. Passive scans aim to interact with the application the same way a normal user would. This means that passive scans do not attempt to simulate adversarial behavior. A passive check is great for highlighting issues in HTTP messages, cookies, storage events, console events, and DOM.
- **active scan**: If you need a more intensive scan, you can opt for an active scan. Active scans will check for vulnerabilities by injecting attack payloads into HTTP requests. The goal of this is to simulate adversarial behavior, attempting to explicitly exploit the application. In order to use active mode, you need to add specific configurations to your application to prove you own the server being scanned. More details on this will be discussed later in the course.

An active DAST scan will determine if an exploit is successful through two methods: **match responses** and **time responses**:

- **match responses**: With this method, the scanner is checking to see if the result received matches the expected result of a successful exploit. For example, if the request was trying to access a password file, a response in the format of a password file is considered successful. 
- **timing response**: Some requests will add sleeps to their payload to see if the application pauses for the specified amount of time. If pauses are seen as a response, it indicates a potentially successful exploit.

##### Basic DAST


DAST can be enabled in your project using the DAST template. The following configuration shows an example of a basic template include for this purpose.

```yaml
stages:
  - dast

include:
  - template: DAST.gitlab-ci.yml
```

Because DAST does not run against your source code, you will need to add configurations to point DAST towards the server you wish to target. This configuration is done using variables. 

At a minimum, you will need to provide a **`DAST_TARGET_URL`**, which represents the URL of the site you are trying to scan.

```yaml
stages:
  - dast

include:
  - template: DAST.gitlab-ci.yml

variables:
  DAST_TARGET_URL: https://testurl
```

In many cases, you will want your scan to be able to authenticate on the web application. This allows you to expand your attack surface, scanning more content. To do this, you can provide variables to instruct the scanner on how to authenticate in your application.

```yaml
stages:
  - dast

include:
  - template: DAST.gitlab-ci.yml

variables:
  DAST_TARGET_URL: https://testurl
  DAST_AUTH_URL: "http://juiceshop:3000/#/login"
  DAST_AUTH_USERNAME: "username_here"
  DAST_AUTH_PASSWORD: "password_here" <i># use protected/masked variables, this is only for demonstration purposes</i>
  DAST_AUTH_USERNAME_FIELD: "css:input[id=email]"
  DAST_AUTH_PASSWORD_FIELD: "css:input[id=password]"
  DAST_AUTH_SUBMIT_FIELD: "css:button[id=loginButton]"
```

To run an active scan against a site, you need to validate that you are in control of the site you are scanning. This is done to prevent malicious scanning of web applications. To prove this, you have three options:

- **text file validation**: You can upload a text file to the site which the scanner can retrieve and validate the contents of
- **header validation**: You can add the Gitlab-On-Demand-DAST header to your target site on HTTP responses. The scanner will check for this header before allowing the scan.
- **meta tag validation**: You can add the `gitlab-dast-validation` meta tag to your site, in the `<head>` section of the HTML.

You have these variables which alter the configuration of the DAST scan:

- `DAST_FULL_SCAN`: When set to true, this will run both passive and active checks.
- `DAST_AUTH_REPORT`: When set to true, this will generate a report detailing steps taken for authentication. This is helpful to enable in cases where you want to verify that authentication completed successfully.
- `DAST_CRAWL_GRAPH`: When set to true, this will generate an SVG graph of the navigation completed during the scan. This is helpful to see a more detailed picture of how the scan was completed.

##### DAST with Docker

One method of enabling DAST is to create a Docker service of your application to scan. This is ideal for situations where you do not have a dedicated server available for testing your application.

The DAST scanner template includes the `dast` job, which runs the DAST on a server or container. We can pass a Docker service into this job to allow it to use the Docker container during the scan job. 

This is done using the `services` keyword, as shown below.

```yaml
stages:
  - dast

include:
  - template: DAST.gitlab-ci.yml

dast:
  services:
    - name: bkimminich/juice-shop:v16.0.0
      alias: juiceshop
```

Here is a full example:

```yaml
stages:
  - dast
include:
  - template: DAST.gitlab-ci.yml
dast:
  services:
    - name: bkimminich/juice-shop:v16.0.0
      alias: juiceshop
  variables:
      DAST_TARGET_URL: "http://juiceshop:3000/"
      DAST_AUTH_URL: "http://juiceshop:3000/#/login"
      DAST_AUTH_USERNAME: "admin@juice-sh.op"
      DAST_AUTH_PASSWORD: "admin123" <i># use protected/masked variables, this is only for demonstration purposes</i>
      DAST_AUTH_USERNAME_FIELD: "css:input[id=email]"
      DAST_AUTH_PASSWORD_FIELD: "css:input[id=password]"
      DAST_AUTH_SUBMIT_FIELD: "css:button[id=loginButton]"
      DAST_SCOPE_EXCLUDE_ELEMENTS: "css:[id=navbarLogoutButton]"
      DAST_FULL_SCAN: "true"
      DAST_AUTH_REPORT: "true"
      DAST_CRAWL_GRAPH: "true"
```

##### API security scanning

If you are writing a web application, it is likely that your application uses an API to retrieve data from your web server. API security scanners are designed to ensure that your API endpoints stay protected from common vulnerabilities such as unauthorized access and malicious inputs.

As a part of the API security scan configuration, you provide details about your API endpoints. There are four supported formats you can use to do this:

1. OpenAPI spec
2. GraphQL schema
3. HTTP archive
4. Postman collection

After you have specified the API format, the API scanner will use the configuration to send requests to your API. These requests are designed to attempt to trigger vulnerabilities in your API functionality. 

- The goal of the scan is to simulate a real-world hacking attempt to see how your API reacts to these types of requests. 
- The scans are language agnostic, as they only rely on the API request definitions to run.

Like DAST, API Security can also be configured in a passive or active mode. 

- A passive scan will search for vulnerabilities by calling the API normally and reviewing the results. 
- An active scan will search with specific vulnerabilities, such as SQL injection.

> [!WARNING]
> It is recommended to only run scans against testing environments to ensure that there is no impact on production from the scans.

You can add API Security scans to your project by including the API security template. The example below shows one way of doing this:

```yaml
stages:
  - dast
include:
    - template: API-Security.gitlab-ci.yml
variables:
  APISEC_POSTMAN_COLLECTION: postman_collection.json
  APISEC_TARGET_URL: http://target:7777
```

Here are the different variables you have access to:

- `APISEC_POSTMAN_COLLECTION`: the JSON file representation of the postman collection representing your API structure
- `APISEC_TARGET_URL`: the server origin to target

One of the main areas of configuration you should consider with API scanning is authentication. Providing authentication will allow for a more robust scan, targeting the full attack surface of the application. 

Here is how to do it with bearer tokens:

If your bearer tokens do not have a set expiry, the process to add them to the API security scanner requires the following steps:

1. Create a new CI/CD variable which contains the token in the format below:

```json
 {"headers":{"Authorization":"Bearer your-token-here"}}.
```
    
2. Add the **`APISEC_OVERRIDES_ENV`** variable to your `.gitlab-ci.yml` file. For its value, set it to the CI/CD variable that contains your token.

```yaml
stages:
  - dast

include:
  - template: API-Security.gitlab-ci.yml

variables:
  APISEC_PROFILE: Quick
  APISEC_OPENAPI: test-api-specification.json
  APISEC_TARGET_URL: http://test-deployment/
  APISEC_OVERRIDES_ENV: $TEST_API_BEARERAUTH
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

## Security policies and control

### Compliance policies

The goal of security policies is to provide you with a level of control over your projects and groups. Policies allow you to enforce requirements on merge requests, enforce security scans, enforce custom CI/CD configurations, and automate vulnerability management workflows. 

GitLab provides four different policies to achieve these goals:

1. **Merge request approval policies**: offer merge protection and force approval of a merge request before it can get merged in.
    
2. **Scan execution policies**: enforce security scanning CI to be run for specific projects and groups, as well as different levels of granular control over how much security scanning should be done for each project.
    
3. **Pipeline execution policies**: enforce common policies for pipelines in a project
    
4. **Vulnerability management policies**: Vulnerability management policies allow you to automatically resolve vulnerabilities found by scanners in your projects

#### Merge request approval policies

Merge request approval policies are designed to help you control what gets merged into your default branch. This level of control is essential, as it ensures the quality and security of code reaching your default and production branches. You should consider merge request approval policies for cases where:

1. You need to prevent code that contains security vulnerabilities from reaching default branches
    
2. You need to control which licenses are added to your code repository

There are two modes you can use for creating and editing merge request approval policies: **Rule mode** and **`.yaml` mode**.

- **rule mode**: Rule mode provides you with GUI inputs for each policy configuration option. The GUI inputs are converted into equivalent YAML configuration values. This provides a simpler interface for configuring policies, while still providing a good level of customization.
- **YAML mode**: Yaml mode allows you to directly write yaml configurations for your policy. Yaml mode provides you with more control, however, it is more complex to setup compared to rule mode.

**scanner types**

There are two types of scanners you can apply the policy to, where when you select a scanner for a policy, the scanner will run when the policy trigger is executed (i.e. when a merge request comes in).

- **security scan**: choose a security scanner and configure it
- **license scan**

Follow these steps to implement attach a security scanner to the policy:

1. When you select **Security Scan**, you will be prompted to select which security scanners you want to consider in your policy. In this dropdown, you can select one or more security scanners. 
2. Next, you select which branches to apply the policy to. You can select the default branch, all protected branches, or specific protected branches. Additionally, you can provide exceptions if some branches should be excluded from the policy.
3. Next, you define which types of security vulnerabilities you want to capture in the policy. You can apply the policy for all vulnerabilities that match a rule, or set a threshold for the number of vulnerabilities until the rule applies.
4. For the Severity, you can apply the policy to all severity levels, or just specific levels of severity. 
5. Finally, you can specify what status you want to consider in your policy. You can apply the policy for new or previously detected vulnerabilities, in the needs triage or dismissed state.

Here's how to implement the license scan option:

1. For the **License Scan** option, you will be prompted for which branches you want to apply your policy to. You can select the default branch, all protected branches, or specific protected branches. Additionally, you can provide exceptions if some branches should be excluded from the policy. 
2. Next, you define which licenses status you want to apply the policy to. You can apply the policy to either newly detected, or pre-existing licenses. 
3. Finally, you can configure an allowlist of licenses to allow in your project. If any licenses are not found in the allowlist, they are excluded from the project.

**policy violation**

When a violation of a policy occurs, you can define a set of actions to take. For merge request approval policies, the action typically involves approval from 1 or more individual users or groups.

In addition to requiring specific actions, by default, policy violations will result in a bot comment on the merge request explaining the issue. 

**advanced settings**

- **protected branch settings**: In the protected branch settings, you can prevent branch modification, pushing, and force pushing for protected branches. This setting will overwrite the existing project settings. Setting this allows you to control protected branch settings at a compliance level rather than relying on project creators to set this configuration options themselves.
- **merge request approval settings**: In the Merge request approval settings, you can prevent approval by the merge request author, prevent approval by the commit author, remove all approvals when a new commit occurs, and require user authentication to approve merge requests. These settings will overwrite the existing project settings for merge request approvals.
- **fallback behavior and edge case settings**: In the Fallback behavior and edge case settings, you can determine the action to take if the policy's criteria cannot be met. You can either fail open, meaning the merge request is allowed to proceed, or fail closed, meaning the merge request is blocked until all criteria are met.

**creating the policy**

Here are the steps to create a merge request approval policy:

1. To create a merge request approval policy, navigate to your project, and in the left sidebar, select **Secure > Policies**. 
2. In the policies window, select **New Policy > Merge request approval policy**.

#### Scan execution policies

Scan execution policies allow you to enforce running specific security scanners for projects and groups. This allows you to create an enforced baseline for security scanning in your projects. 

> [!NOTE]
> You should consider scan execution policies for cases where you need to enforce security scanning on a project or group.

Scan execution policies also allow you to enforce security scans for particular branches at specific times. This allows you to create consistency in how security scans are conducted in your projects. 

Similar to merge request approval policies, there are two modes you can use for creating and editing scan execution policies: Rule mode and `.yaml` mode.

Here is an example of the YAML, which must be in `.gitlab/security-policies/policy.yml`

```yaml
---
scan_execution_policy:
- name: Group security policy
  description: ''
  enabled: true
  rules:
  - type: pipeline
    branch_type: default
  - type: pipeline
    branch_type: target_default
    pipeline_sources:
      including:
      - merge_request_event
  actions:
  - scan: sast
    variables:
      SECURE_ENABLE_LOCAL_CONFIGURATION: 'false'
    template: latest
  skip_ci:
    allowed: true

```

Conditions allow you to configure when the actions from the previous section will run for your project. You can setup a scanner to run with either a trigger or a schedule. 

- **trigger**: A trigger will run your actions every time a pipeline runs for the branches you define. 
	- **use case**: Trigger conditions are ideal for cases where you want to enforce security scanning on every pipeline. For example, if you want every commit or every merge request to result in a security scan, a trigger would be the ideal implementation.
- **schedule**: A schedule will run scans against the specified branches, on a daily or weekly cadence at a specified time.
	- **use case**: Scheduling scanners is ideal for situations where compliance or policy requirements require scans on a regular cadence. For example, compliance requirements like SOC2 often require a minimum of quarterly security scanning. Scheduling allows you to easily meet these compliance requirements

Here's how to create scan execution policies:

1. To create a scan execution policy, navigate to your project, and in the left sidebar, select **Secure > Policies**. 
2. In the policies window, select **New Policy > Scan execution policy**. 


#### Pipeline execution policies

Pipeline execution policies allow you to enforce specific pipeline jobs and pipeline configurations for projects and groups. This allows you to ensure that your CI/CD jobs are run in a consistent way, with consistent configurations. You should consider pipeline execution policies for cases where:

1. You need to ensure specific jobs are always running in your projects or groups
    
2. You need to ensure that specific configurations are used for jobs or security scanners

Here are the steps to create:

1. To create a pipeline execution policy, navigate to your project, and in the left sidebar, select **Secure > Policies**. 
2. In the policies window, select **New Policy > Pipeline execution policy**.

As with our other policies, there are two modes you can use for creating and editing scan execution policies: **Rule mode** and **`yaml` mode**.

Here's the steps for configuring rule mode:

1. start your policy configuration by adding a name and optional description to the policy. 
2. In the Actions section of the configuration, you can create the rules that define how pipelines should run in your project. You can either inject a CI/CD configuration into the project or override the configuration. 
3. After selecting how the CI/CD configuration is applied, you will point the action to the CI/CD configuration you want to apply. You can point to any valid `.gitlab-ci.yml` file in any project you have access to. In the case where the project CI/CD file and the selected CI/CD configuration have conflicting job names, you can provide a job name suffix to ensure job names stay unique.


Here's the difference between injection and overriding:

- **Injection** will merge the CI/CD configuration you select with the existing CI/CD configuration in the project. 
- **Override** will only use the CI/CD configuration you select in the actions. 
#### Vulnerability management policies

Vulnerability management policies allow you to automatically resolve vulnerabilities found by scanners in your projects. If a vulnerability is no longer detected by a scanner, it can be resolved automatically, reducing the amount of time required to manually update security report results. You should consider vulnerability management policies for cases where:

1. Your projects have a large number of security vulnerabilities that would take time to manually close
    
2. You have tracking on security vulnerability counts and want to ensure resolutions are shown accurately as soon as possible.

Here's how to create:

1. To create a vulnerability management policy, navigate to your project, and in the left sidebar, select **Secure > Policies**. 
2. In the policies window, select **New Policy > Vulnerability management policy**.

There are two modes you can use for creating and editing vulnerability management policies: Rule mode and `.yaml` mode.

Here's the steps for rule mode:

1. In Rule mode, you start your policy configuration by adding a name and optional description to the policy. 
2. In the Actions section of the configuration, you can select either **Auto-Resolve** or **Auto-Dismiss**. 
	- Auto-Resolve will automatically set vulnerabilities to resolved if they meet certain conditions. 
	- Auto-Dismiss will automatically dismiss vulnerabilities that meet certain conditions.
## Gitlab Duo

GitLab Duo is GitLab's AI assistant woven into the whole software development lifecycle, from planning to security. It splits into two layers: non-agentic (single-shot AI help) and the agentic **Duo Agent Platform** (autonomous agents and flows that work over multiple steps).

Here are the **Non-agentic features** (chat answers, inline suggestions):

- **Code Suggestions**: AI-powered autocomplete as you type, in your IDE or Web IDE.
- **Duo Chat**: ask questions about code, issues, MRs, pipelines, or GitLab itself, right in the UI or IDE.
- Code explanation, root cause analysis for failed CI jobs, merge request summaries, code review suggestions, vulnerability explanation and resolution, test generation, and more small single-purpose assistants throughout the product.

**GitLab Duo Agent Platform** (the agentic layer, what I'm part of): instead of a single prompt/response, you delegate whole tasks to specialized agents that work asynchronously, often over several CI-backed steps, and can open merge requests, push commits, and comment back with results. Agents I can start for you right now include:

- **developer**: write/change code, resolve an issue, implement a described feature.
- **fix_pipeline**: diagnose and fix a failing CI/CD pipeline.
- **code_review**: read-only review and assessment of an MR's changes.
- **sast_fp_detection** / **secrets_fp_detection**: check whether a SAST or secret-detection vulnerability is a false positive.
- **resolve_sast_vulnerability**: generate a code fix for a SAST finding.
- **catalog_flow**: run a custom flow your project has enabled in the AI Catalog.
- **Planner** (plan/prioritize/track work)
- **Security Analyst** (autonomous vulnerability triage and remediation)



Access depends on your tier: 

- **Duo Core** gives basic agentic chat and code suggestions
- **Duo Pro** adds full chat and some agentic features
- **Duo Enterprise** unlocks everything, including things like the Security Review Flow.