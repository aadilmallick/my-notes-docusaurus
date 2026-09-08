## Teamcity + Octopus basics

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

#### Adding build configurations

When trying to add build configurations, you can point to a gitlab repository containing the kotlin template and then the specific kotlin build configuration ID


![](https://i.imgur.com/ZAFWV2v.jpeg)


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

## AI

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