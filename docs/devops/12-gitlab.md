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

- **stages**: Parent containers of jobs, where stages either have one job or have many jobs. Stages run sequentially.
- **jobs**: jobs live inside stages, define the work to do in the stage on the runner, and run in parallel.

Once all jobs within a stage complete execution successfully, then the pipeline moves on to execute the next stage.

If any job in a stage fails, the next stage is not (usually) executed and the pipeline ends early

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

```

#### Pipeline editor

There is a native pipeline editor in the gitlab UI that lets you create pipelines for your repo, which can access by navigating to `Build > Pipeline editor` in your GitLab project.

Rather than editing `.gitlab-ci.yml` directly in a text editor, the Pipeline Editor gives you immediate feedback and visibility — helping you catch problems before they reach your pipeline.

Here are the three key benefits:

- **Live syntax validation** — catches errors as you type, before you commit anything to your repository.
- **Visual pipeline diagram** — shows your stages and jobs laid out graphically so you can verify the flow at a glance.
- **Full configuration tab** — displays the fully merged YAML from all your `include` statements in one place, making it easy to spot errors across files.
### GitLab pages

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

#### Installing self-hosted gitlab runner

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

4. Obtain a registration token from **Project ➡️ Settings ➡️ CI/CD ➡️ Runners**
5. In the linux VM, run this command to register the runner

```bash
sudo gitlab-runner register
```

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