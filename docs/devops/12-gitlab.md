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
- `allow_failure`: a boolean value where if `true`, then even if the job fails it does not cause the stage to fail.

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