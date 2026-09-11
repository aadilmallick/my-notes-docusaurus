## Teamcity basics

Teamcity is a flexible CI tool that can build artifacts from source code and run pipelines to test them.

Octopus deploy is an extremely flexible continuous deployment tool which deploys code artifacts to a wide variety of environments 

![](https://i.imgur.com/U7Uysbz.jpeg)

### How TeamCity works

TeamCity contains two main components:

- **TeamCity server**: the server that you can self-host on-prem that contains all the CI and config info that you use for your team.
	- It is responsible for project configurations, managing user permissions, scheduling builds, and maintaining build data.
- **TeamCity build agent**: the agent that actually does the building and execution of pipelines.
	- These are dedicated services that execute the actual build tasks. They compile code, run tests, and produce artifacts as part of the CI/CD process.

#### Teamcity server

The TeamCity server is usually installed on a single dedicated machine that manages the entire CI/CD process.

It does not perform any build or test actions directly; it orchestrates the process of using Build Agents to run these tasks.

> [!NOTE]
> You can scale up TeamCity servers via a load balancer, to also assign more build agents in total by adding more servers.

#### Build agents

A **Build Agent** is a service that is installed on separate servers (Windows, Linux, or any Linux-based OS) to carry out various build-related tasks. TeamCity itself does not compile code but relies on Build Agents for this purpose.

The Build Agent service can be installed either on the same server as the TeamCity server or on different servers. 

> [!IMPORTANT]
> However, installing on a separate server is recommended to avoid limitations that can arise if the TeamCity server needs to be reset or if issues occur with the Build Agent.

1. **Configuration**: After installation, the Build Agent must be configured. This includes setting up the necessary tools and SDKs required for building your specific code, such as .NET SDK, JDK, PHP, etc. Essentially, the Build Agent acts as a local environment where all the build and compile processes occur.
    
2. **Execution**: Once agents are set up, TeamCity can assign builds to them. The Build Agents check out the source code, compile it, and produce packages, thereby facilitating continuous integration and continuous delivery (CI/CD) workflows.


> [!NOTE]
> On the free tier, you're only allowed to associate max 3 build agents per TeamCity server.

### Teamcity installation and setup

1. Install from EXE
2. Install TeamCity server, but not the build agent
3. Connect to a remote TeamCity server, put in the one your company gave you


![](https://i.imgur.com/0tZctgz.jpeg)
### TeamCity projects

A project is a container for **templates**, **build configurations**, and **source control** connections.

- **build configuration**: a Kotlin code-as-config file that defines the steps and instructions for building and packaging a project.
- **template**: A kotlin file that is a used as a template to create build configuration files.

All projects inherit from the **root project**


![](https://i.imgur.com/N0W4UwS.jpeg)
In TeamCity, child projects inherit many settings and entities from their parent, such as [connections](https://www.jetbrains.com/help/teamcity/2026.1/configuring-connections.html?Creating%20and%20Editing%20Projects) and [cloud agent profiles](https://www.jetbrains.com/help/teamcity/2026.1/teamcity-integration-with-cloud-solutions.html?Creating%20and%20Editing%20Projects). The Root project lets you take advantage of this concept and define server-wide resources. For example, you can create [AWS cloud profile](https://www.jetbrains.com/help/teamcity/2026.1/setting-up-teamcity-for-amazon-ec2.html?Creating%20and%20Editing%20Projects) that spawns cloud agents accessible to all projects on the server.

> [!NOTE]
> Note that since [user permissions](https://www.jetbrains.com/help/teamcity/2026.1/managing-roles-and-permissions.html?Creating%20and%20Editing%20Projects) are project-based, only Root project administrators can edit its settings.

#### Gitlab to Teamcity

Often you'll have all your TeamCity Kotlin DSL code stored in a GitLab repository. Whenever you push to your GitLab repository, it should automatically push up those build configuration file changes to TeamCity to actually run the pipeline. 

1. To achieve this we should add a Team City dedicated user to the GitLab repository



![](https://i.imgur.com/rhTdRIw.jpeg)

#### Adding build configurations

When trying to add build configurations, you can point to a gitlab repository containing the kotlin template and then the specific kotlin build configuration ID


![](https://i.imgur.com/ZAFWV2v.jpeg)

> [!NOTE]
> Whenever you create a build configuration, TeamCity creates a unique ID for that, which is used internally and which TeamCity recognizes. 

1. Choose the VCS type, which should be git


![](https://i.imgur.com/mimsUdz.jpeg)

2. Specify the VCS root with the teamcity username and password auth from gitlab


![](https://i.imgur.com/xyTWad6.jpeg)


#### Teamcity artifacts

For a build configuration, you have two important settings when it comes to artifacts:

1. **publish artifacts**: when to publish artifacts. You have these options:
	- **even if build fails**: even if build fails, publish artifacts
	- **no publish on fail**: if build fails, don't publish artifacts
2. **artifact paths**: provide Team City-specific syntax for describing the source code artifact path mapping to the Team City build agent runner environment target directory. The syntax is as follows:

```
+:source => target   // to mount source code path to target path
-:source   // to ignore a source code path
```


![](https://i.imgur.com/6A7ZNrq.jpeg)


> [!NOTE]
> All of these settings are configurable in the Kotlin DSL for TeamCity. 

So this below:

```
**/* => target_dir, -: **/folder1 => target_dir
```

maps all files in the source code to the teamcity build runner filesystem but then removes/ignores `folder1`.


#### Adding parameters

If you have many build configurations that are similar or the only difference between them is the repo you're getting the source code from, then use **teamcity parameters** that you define at the project level or root level and then use that to dynamically read from those variables anywhere in the build config.

In teamcity, you can refer to parameters and read their values with the syntax below:

```
%parameter_name%
```

So here's an example where we want to create a dynamic `repository` parameter that we then set in teamcity project config:

1. Create a new VCS root that uses the `repository` variable to dynamically define the Fetch URL of the repository


![](https://i.imgur.com/J0KctYw.jpeg)

2. Set the VCS root for the build configuration to the one we just created.


![](https://i.imgur.com/2Q6Wwgd.jpeg)



3. Add a specific value for the recognized `repository` configuration parameter in the **settings** -> **parameters** for the current build configuration:


![](https://i.imgur.com/fHWeY1F.jpeg)



4. Edit parameter specs if necessary so you are prompted to provide the parameter values when creating the build configuration or running the build.


![](https://i.imgur.com/EOZMbJz.jpeg)


#### Build numbers

Build numbers are useful for versioning artifacts created by TeamCity, which is essential when moving to Octopus Deploy.

> [!NOTE]
> Here's the main idea: add a build counter to create a build number string, then dynamically use that build number to add versioning to the naming convention of your build artifacts produced by Teamcity.


![](https://i.imgur.com/NPuKdRp.jpeg)

1. Add a **build counter** variable, which starts at 1, then automatically increments each time TeamCity runs the build configuration and creates a new build.
2. In the **build number format**, use the build counter variable via the TeamCity-managed `build.counter` param, which reads the build counter variable value for dynamically setting the value of the build number.
3. When creating artifacts in teamcity, it's useful to have these three parameter configurations for dynamic naming:
	- `repository`: a custom param you set to specify the gitlab repo name associated with the current build configuration.
	- `build.number`: a TeamCity-managed param that retrieves the build number formatted string associated with the current build configuration.
	- `teamcity.build.branch`: a TeamCity-managed param that retrieves the branch of the gitlab repo associated with the current build configuration.

## TeamCity CLI

### Basics

#### Installation

**macOS (Homebrew):**

```shell
brew install jetbrains/utils/teamcity
```

**Linux:**

```shell
curl -fsSL https://jb.gg/tc/install | bash
```

**Windows (Winget):**

```powershell
winget install JetBrains.TeamCityCLI
```

**npm:**

```shell
npm install -g @jetbrains/teamcity-cli
```

#### Setup

1. Login

```bash
teamcity auth login
```

#### Read-only mode

To enable read-only mode, set `TEAMCITY_RO=1` as an env var, or run `teamcity config set ro true`:

```bash
teamcity config set ro true
```

### Commands 

#### Reference

Run `teamcity <command> --help` for usage

| Group        | Commands                                                                                                                                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **auth**     | `login`, `logout`, `status`                                                                                                                                                                                                                                                                                     |
| **run**      | `list`, `start`, `view`, `watch`, `log`, `tree`, `changes`, `tests`, `diff`, `cancel`, `download`, `artifacts`, `restart`, `pin`/`unpin`, `tag`/`untag`, `comment`                                                                                                                                              |
| **job**      | `list`, `view`, `create`, `tree`, `pause`/`resume`, `step list`/`view`/`add`/`delete`, `param list`/`get`/`set`/`delete`, `settings list`/`get`/`set`                                                                                                                                                           |
| **project**  | `list`, `view`, `create`, `tree`, `vcs list`/`view`/`create`/`test`/`delete`, `ssh list`/`generate`/`upload`/`delete`, `cloud profile`/`image`/`instance`, `connection list`/`view`/`create github-app`/`create docker`/`authorize`/`delete`, `param`, `token get`/`put`, `settings export`/`status`/`validate` |
| **pipeline** | `list`, `view`, `create`, `validate`, `pull`, `push`, `schema`, `delete`                                                                                                                                                                                                                                        |
| **queue**    | `list`, `approve`, `remove`, `top`                                                                                                                                                                                                                                                                              |
| **agent**    | `list`, `view`, `term`, `exec`, `jobs`, `authorize`/`deauthorize`, `enable`/`disable`, `move`, `reboot`                                                                                                                                                                                                         |
| **pool**     | `list`, `view`, `link`/`unlink`                                                                                                                                                                                                                                                                                 |
| **server**   | `plugin upload` (optionally with `--hot-reload`)                                                                                                                                                                                                                                                                |
| **api**      | Raw REST API access                                                                                                                                                                                                                                                                                             |
| **link**     | Bind this repository to a TeamCity project via `teamcity.toml`                                                                                                                                                                                                                                                  |
| **config**   | `list`, `get`, `set`                                                                                                                                                                                                                                                                                            |
| **alias**    | `set`, `list`, `delete`                                                                                                                                                                                                                                                                                         |
| **skill**    | `list`, `install`, `remove`, `update`                                                                                                                                                                                                                                                                           |
| **update**   | Check for CLI updates                                                                                                                                                                                                                                                                                           |

### AI

The CLI ships with an [Agent Skill](https://agentskills.io/) that teaches coding agents (Claude Code, Cursor, and others) how to drive `teamcity`:

```shell
teamcity skill install           # auto-detects installed agents
teamcity skill install --project # install to current project only
teamcity skill update            # update to the version bundled with teamcity
teamcity skill remove            # uninstall
```

or specifically for **Claude Code:**

```shell
/plugin marketplace add JetBrains/teamcity-cli
/plugin install teamcity-cli@teamcity-cli
```

## Octopus

### How Octopus works

#### Servers, tentacles, calamari

Octopus has these components:

- **octopus deploy server**: stores all CD info and configurations, communicates with the deploy tentacles to perform tasks.
- **octopus deploy tentacle**: manage of execution of deployment pipelines and to deploy the final result to target servers. There are two types of tentacles:
	- **listening tentacle**: long-running process on a cloud server, or running on port 10933 locally if self-hosting, listens for commands from the deploy server and then executes those commands.
	- **polling tentacle**: periodically connects to the Octopus deploy server and polls it for new commands to execute. 
	- **worker tentacle**: performs tasks on behalf of Octopus Deploy
- **calamari**: what does the actual legwork of executing the deploy pipeline, controlled via tentacles. Tentacle can run multiple instances of calamari to perform multiple tasks in parallel. 

> [!NOTE]
> The important thing to understand here is that you'll only use Tentacles mainly and install them on virtual machines if you're hosting on-premises. If you own the virtual machines and infra, then you would need to install Tentacles on those virtual machines. 


![](https://i.imgur.com/Vczxt6h.jpeg)



> [!NOTE]
> You must put your tentacles on your target servers. If there is a server you want to deploy something to, then it must have a tentacle on it. 

#### Environments

Octopus Deploy allows you to create several environments, like Dev, Test, and QA, which allow you to specify target environments to deploy to for the same package. 

#### Spaces

Octopus Deploy offers an analog to folders called **Spaces**, which allows you to organize your deployments into different categories/buckets.

### Adding tentacles

Here are the steps to add a tentacle on a Windows Server VM you own:

1. Choose the deployment target as Windows and choose a listening tentacle type:


![](https://i.imgur.com/aKimkHG.jpeg)
2. Download the powershell script to install the tentacle, SSH into your windows server, and then run the powershell script


![](https://i.imgur.com/IictvLr.jpeg)

3. Specify environment and role
	- **environment**: the environment to deploy on, like Dev or QA
	- **target role**: labels that you can then programmatically reference to target certain tentacles only for deployment.


![](https://i.imgur.com/zVSIZDq.jpeg)
4. Upgrade calamari as a good practice. The first time you deploy a tentacle, you should upgrade calamari


![](https://i.imgur.com/VoAf75j.jpeg)


### Deploying to tentacles

Deployment in Octopus Deploy requires special rules for **packages** (same thing as build artifacts):

1. **file type**: package type should be either a `.zip` file or a `.nupkg` file
2. **naming**: the package name must follow a standard convention including the package name and package version, in this syntax:
	- `package_name`: the package name, alphabetic
	- `package_version`: the package version, in the syntax `<version_number>-<tag-selector>`, like `10.2.1-release` is a valid package version with tag.

```
<package_name>.<package_version>.<file-extension>
```



![](https://i.imgur.com/j79a2FH.jpeg)


A common approach where tags come in handy is when we have different branches and we want to create and deploy packages based on those different branches. We would use the branch name as the tag name, like the below example:

![](https://i.imgur.com/4MUHwO3.jpeg)

### Connecting TeamCity to Octopus

Here's a high level overview of how it works:

1. Whether you're using the TeamCity Kotlin DSL or manually creating a build step in TeamCity to publish to Octopus Deploy, you need to install the Octopus Deploy plugin for TeamCity in order to do any of this. 
2. You then need to add API key from Octopus to the TeamCity project root config so you actually have authorization to publish to Octopus directly via TeamCity. 

Here are the steps in depth

1. Install a plugin on TeamCity so it can connect to Octopus Deploy


![](https://i.imgur.com/nVqrcQa.jpeg)


2. Go to your plugins list and enable the uploaded plugins:


![](https://i.imgur.com/3M2HciX.jpeg)

3. Go to Octopus Deploy and create a new API key. 


![](https://i.imgur.com/XQdON3N.jpeg)

4. In your build configuration, add an extra step whose step type is **OctopusDeploy: Push Packages**, and specify the following info:
	- **Octopus server URL**: Octopus server URL is either going to be on the cloud or some self-hosted IP address. 
	- **API key**: The OctopusDeploy API key you created
	- **Space name**: the name of the space to deploy to on your Octopus Server.
	- **package paths**: the artifact mapping from your source code to the one produced by team city
	- **publish packages as build artifacts**: if checked, uses the package paths configuration as the naming scheme to find packages and publish them.



![](https://i.imgur.com/Z9ormIf.jpeg)

5. From your general settings of your project, remove the artifact paths to avoid overriding the ones you specified with Octopus Deploy:



![](https://i.imgur.com/wXQHeLT.jpeg)


### Octopus and IIS

When creating an octopus project, you can configure the pipeline with prebuilt step recipes, and Octopus offers a prebuilt step for deploying to IIS app pools.


1. Choose the "Deploy to IIS" prebuilt step template:

![](https://i.imgur.com/qy2IRBX.jpeg)


2. Configure the deploy to IIS step by specifying the target environment, which will automatically deploy to the IIS app pools on all tentacles tagged by that target environment.


![](https://i.imgur.com/FdnD2qc.jpeg)
