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

The TeamCity server is a central management component that is usually installed on a single dedicated machine that manages all pipelines.

It does not perform any build or test actions directly; it orchestrates the process of using any amount of Build Agents to run these tasks.

> [!NOTE]
> You can scale up TeamCity servers via a load balancer, to also assign more build agents in total by adding more servers.

#### Build agents

A **Build Agent** is a service that is installed on separate servers (Windows, Linux, or any Linux-based OS) to carry out various build-related tasks. TeamCity itself does not compile code but relies on Build Agents for this purpose.

The Build Agent service can be installed either on the same server as the TeamCity server or on different servers, and in any fashion. It basically just has to be a recognizable process running on an exposed port.


![](https://i.imgur.com/CRw7fLu.jpeg)


> [!IMPORTANT]
> However, installing on a separate server is recommended to avoid limitations that can arise if the TeamCity server needs to be reset or if issues occur with the Build Agent.

1. **Installation**: SSH into another VM and run the build agent as a docker container or install it directly on the VM and start it.
2. **Configuration**: After installation, the Build Agent must be configured. This includes setting up the necessary tools and SDKs required for building your specific code, such as .NET SDK, JDK, PHP, etc. Essentially, the Build Agent acts as a local environment where all the build and compile processes occur.
3. **Execution**: Once agents are set up, TeamCity can assign builds to them. The Build Agents check out the source code, compile it, and produce packages, thereby facilitating continuous integration and continuous delivery (CI/CD) workflows.

A very important thing to understand is that TeamCity automatically looks at which build agent to use for which task, depending on the type of software and packages that each build configuration needs. 

For example, a build configuration that uses NPM heavily will only use a build agent that has NPM and Node installed.

TeamCity will understand how to choose that agent automatically by seeing if it has NPM installed via configuration management. 


![](https://i.imgur.com/YYMJWo8.jpeg)



> [!NOTE]
> On the free tier, you're only allowed to associate max 3 build agents per TeamCity server.

### Why Teamcity

TeamCity is the most flexible CI provider ever because it works with any software and source code repository.

It also has these capabilities:

- **build chains**: ability to create dependencies between builds, able to create a graph so jobs/builds run in a predetermined order.
- **configuration as code**: offers a Kotlin DSL that is a configuration as code drop-in for manually creating pipelines.
- **personal builds**: from your local environment, you can create personal builds for a build configuration that only you can see, allowing you to test your builds locally. You can do this via an IntelliJ plugin.

### Teamcity installation and setup

#### Local development to Teamcity server on Cloud

1. Install from EXE
2. Install TeamCity server, but not the build agent
3. Connect to a remote TeamCity server, put in the one your company gave you


![](https://i.imgur.com/0tZctgz.jpeg)
#### Creating cloud build agents

If you want to self-host build agents on the cloud by putting the build agents on EC2 instances so they don't interfere and hog RAM from the Teamcity server, you can do so by following these steps:

1. Create EC2 instances, grab the key pairs
2. In Teamcity, create a new **cloud profile** and fill out the AWS connection settings via your AWS access key


![](https://i.imgur.com/IYOYDRE.jpeg)


3. Specify an EC2 image tempalte ot use for launching new EC2 isntances that will then be used as build agent VMs


![](https://i.imgur.com/v33qNfW.jpeg)


### TeamCity projects

A project is a container for **templates**, **build configurations**, and **source control** connections.

- **build configuration**: a Kotlin code-as-config file that defines the steps and instructions for building and packaging a project.
- **template**: A kotlin file that is a used as a template to create build configuration files.

All projects inherit from the **root project**


![](https://i.imgur.com/N0W4UwS.jpeg)
In TeamCity, child projects inherit many settings and entities from their parent, such as [connections](https://www.jetbrains.com/help/teamcity/2026.1/configuring-connections.html?Creating%20and%20Editing%20Projects) and [cloud agent profiles](https://www.jetbrains.com/help/teamcity/2026.1/teamcity-integration-with-cloud-solutions.html?Creating%20and%20Editing%20Projects). The Root project lets you take advantage of this concept and define server-wide resources. For example, you can create [AWS cloud profile](https://www.jetbrains.com/help/teamcity/2026.1/setting-up-teamcity-for-amazon-ec2.html?Creating%20and%20Editing%20Projects) that spawns cloud agents accessible to all projects on the server.

> [!NOTE]
> Note that since [user permissions](https://www.jetbrains.com/help/teamcity/2026.1/managing-roles-and-permissions.html?Creating%20and%20Editing%20Projects) are project-based, only Root project administrators can edit its settings.

#### Gitlab to Teamcity + Triggers

Often you'll have all your TeamCity Kotlin DSL code stored in a GitLab repository. Whenever you push to your GitLab repository, it should automatically push up those build configuration file changes to TeamCity to actually run the pipeline. 

1. To achieve this we should add a Team City dedicated user to the GitLab repository



![](https://i.imgur.com/rhTdRIw.jpeg)
2. When creating a teamcity project, you should also add a trigger, and choose a VCS trigger:


![](https://i.imgur.com/Sl8Wy13.jpeg)

3. For the VCS trigger, specify the branches that should be listened to for the trigger. By default, all branches trigger the trigger, but you can filter it down to only specific branches like so:


![](https://i.imgur.com/AbuNAHK.jpeg)

> [!TIP]
> For more info on the special syntax and what it means, check out [[#Teamcity artifacts]].

Now Teamcity is configured to receive push trigger request from Gitlab. 


##### How VCS triggers work

How triggers work is through a polling schedule. 

In this specific case, Teamcity checks every 60 seconds if there is a new push to the gitlab repo that should trigger the configured VCS trigger, and if so, then run the project and its build configurations.

You can configure this VCS trigger behavior like so:

- **quiet period**: the polling interval. By default, this is 60 seconds
- **branch filter**: the branches to amtch on for the trigger



![](https://i.imgur.com/ugdlZ4E.jpeg)

You can also add extra advanced trigger rules which include matching on the following:

- **specific VCS root**: you can configure multiple possible VCS roots for a project aand then add different trigger rules for them
- **gitlab username**: trigger or don't trigger depending on the user who pushed the branch
- **comment regex**: trigger or don't trigger depending on the commit message content regex matching.
	- **example use case**: skip build on commit with content `[skip ci]`

![](https://i.imgur.com/YC9rGFL.jpeg)


##### Scheduled triggers

Scheduled triggers let you run builds on a cron schedule. 


![](https://i.imgur.com/mFvCnRO.jpeg)

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

Let's go more in depth into the language:

- `+`: include
- `-`: exclude
- `*`: star glob pattern
- `**`: recursive star glob pattern

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

#### Build features

Build features in a TeamCity project offer additional configuration for the build and let you do important side effects like auto-merging or other shit. I don't know. 

- **auto-merging**: create a rule so that if a build succeeds, merge the source code branch into another branch like `main`
- **commit status publisher**: Create a rule so that you get Team City to automatically build on a pull request, and the pull request can only get merged if the build passes.

> [!NOTE]
> Although build features are powerful, make sure to not overuse them because it will be confusing for other developers when they see build features do such things like change the content of the repository after a push. Only use build features that don't actually change anything in the source code. 

##### Auto-merge

Here's what the below auto-merge thing example does:

1. Watch for all branches except the `rc` (release candidate) branch
2. Choose to perform the merge if the build is successful, specify to create a merge commit for that and with a specific message syntax.
3. Merge the incoming branch into the `rc` branch


![](https://i.imgur.com/1gyouV0.jpeg)


##### commit status publisher

1. Specify the VCS root and the Teamcity Gitlab user that will be the one with access to the gitlab repo and able to do stuff like run pull request actions 

![](https://i.imgur.com/T6jgrsh.jpeg)

### Teamcity + Gitlab SSH keys

> [!NOTE]
> Why should we use SSH keys to connect Team City to a Gitlab VCS root? Because it removes the need for a username and password by having a direct SSH connection, we can avoid credentials being leaked. 

Here's the grand overview for how we'll achieve this:

1. **Create SSH key pair**: give the public key to Gitlab and the private key to Teamcity.
2. **Configure the connection**: edit the VCS root to use SSH instead of standard HTTPS authentication with GitLab. 

SSH keys for connecting to a GitLab repo from Team City live on the project level. For each project it needs its own individual SSH key pair to connect to a certain VCS root or multiple VCS roots. 

Here are the steps:

1. Create the ssh keys in the `.pem` format, which is what TeamCity requires:

```
ssh-keygen -f teamcity -m 'PEM'
```

2. Uplaod the private key to Teamcity


![](https://i.imgur.com/fALJk01.jpeg)

3. Upload the public key to GIthub (should end in `.pub`)


![](https://i.imgur.com/zAQlbmr.jpeg)


4. When editing the VCS root, make sure to change to the SSH `<user>@<host>` syntax for specifying which repo to connect to for the VCS root:


![](https://i.imgur.com/nsBpUMU.jpeg)


5. Change the authentication method to use SSH keys and specify the specific SSH key you set at the project level


![](https://i.imgur.com/DUeYRkH.jpeg)
### Users, groups, and roles

- **users**: represent individual users in a Teamcity server with individual permissions
- **group**: represent groups of permissions just like user groups in AWS, where we can assign permissions to the group, and then users assigned to that group will gain the permissions of the group.
- **roles**: 

#### Roles

Roles are disabled by default.

To enable roles, you must enable the per-project permissions.

Here’s how roles typically function in CI/CD systems like TeamCity:

1. **Role Creation**: Roles are created to group specific permissions. For example, a role may be labeled as "Project Developer," granting access to develop and manage project configurations.
    
2. **Assigning Permissions**: Once a role is created, you can assign various permissions to that role. For instance, you may assign permissions to run builds or manage specific project configurations.
    
3. **User Assignment**: Users or groups can then be assigned a particular role. This means that every user with this role will inherit the permissions it grants.
    
4. **Project Level**: Roles are generally assigned at the project level, allowing you to manage access effectively. For example, one user may be assigned the role of "Developer" for a .NET project while another may have restricted access on a different project.
    

Roles help in maintaining security and appropriateness within project teams, ensuring that users only have access to the areas necessary for their tasks.


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

## Teamcity DSL

If you want to write config as code much like how YAML files are used to create github action workflows, you can do the same thing as Teamcity with XML files that represent build configurations that live in the `.teamcity` folder within a repo, to have automatic gitOps configuration with teamcity when pushing up your repo.

Kotlin DSL for Teamcity compile into these XML files behind the scenes, so that's what we'll use for our config as code.

### Teamcity to gitlab necessary setup

1. Configure a git repo for source control:


![](https://i.imgur.com/TsgQYdF.jpeg)

2. For the version settings of a project make sure to enable these settings. 
	1. **synchronization enabled**: use project settings from VCS root
	2. **VCS root**: specify which repo and which branch to look inside for the `.teamcity` folder of configuration files.
	3. **build start settings**: use the VCS as the source of truth for providing teamcity build configuration settings.
	4. **settings format**: Choose Kotlin to use the Kotlin DSL. 


![](https://i.imgur.com/RhbHFMf.jpeg)

3. Make sure you have a teamcity user on your gitlab repo that has READ/WRITE access to the repo



### `.teamcity` folder structure

After enabling **Versioned Settings** and configuring the synchronization, _TeamCity_ automatically creates a new **.teamcity** folder within your repository. This folder contains the following two initial required files:

- **`pom.xml`**: This file defines the folder as a _Maven_ project, which is necessary for _IntelliJ IDEA_ to properly recognize and provide features like auto-completion for your configuration scripts.
- **`settings.kts`**: This is your primary _Kotlin_ script file where the project's build configuration logic is stored.

#### `settings.kts`

The `settings.kts` is the entrypoint for describing the Teamcity build configuration. A standard Teamcity build configuration will have many objects that compose a pipeline.

A standard, simple configuration file includes several key blocks:

- **Version definition:** At the top, the file specifies the _TeamCity_ server version that generated the script, ensuring compatibility, using the `version` variable

```kotlin
version = "2022.04"
```

- **Project block:** The `project` block defines the scope of your _TeamCity_ project, and you must define several sub blocks and objects here:
	- `buildType(buildConfiguration: BuildType)`: defines a build configuration job that runs multiple steps, associating a `BuildType` object with the project.

```kts
project {
    subProject {
        id("CustomerPortalBuilds")
        name = "Customer Portal Builds"

        buildType(APIBuild)
        buildType(ReactBuild)
    }

    vcsRoot(PortalAppVcsRoot)
    vcsRoot(PortalApiVcsRoot)

    buildType(Publish)
}
```

- **Build types:** Within the project, you define **build types** (equivalent to _build configurations_ in the UI) by instantiating `BuildType` objects that TeamCity DSL recognizes. Here are the different things you can set on an individual build configuration:
	- **VCS Roots (`vcs`)**: The `vcs` block links your project to the repository. 
		- The reference `DslContext.settingsRoot` ensures the project uses the same repository as the configuration file itself

	```kts
	object Build: BuildType({
		name = "build"
		id("build")
	
		vcs {
			root(DslContext.settingsRoot)
		}
	}
	```

	- **Build steps (`steps`)**: This defines the actual work, such as a _Maven_ step with specific goals like `clean test` to run project tests. It can also include runner arguments to control behavior, such as ensuring all tests execute

	```kts
	object Build: BuildType({
		name = "build"
		id("build")
	
		vcs {
			root(DslContext.settingsRoot)
		}
	```
	
	- **Build features**: configuration for the build agent execution runner environment and also third-party stuff like running builds on pull requests, adding minimum CPU and compute constraints, and more.

	```kts
	object Build: BuildType({
		name = "build"
		id("build")
	
		vcs {
			root(DslContext.settingsRoot)
		}
		
		// add features
		features {
			// define build agent VM constraint
			freeDiskSpace {
				requiredSpace = "6gb"
				failBuild = true // fail build if not satisfied
			}
		}
	```

	- **Triggers:** A `triggers` section handles automation. An empty `vcs` trigger configuration defaults to polling the repository for changes every 60 seconds

	```kts
	object Build: BuildType({
		name = "build"
		id("build")
	
		vcs {
			root(DslContext.settingsRoot)
		}
		
		// add triggers
		triggers {
			// confgure VCS trigger that creates trigger from VCS root
	        vcs {
	            quietPeriodMode = VcsTrigger.QuietPeriodMode.USE_CUSTOM
	            quietPeriod = 300
	            branchFilter = ""
	        }
	    }
	```

	- **dependencies**: You can create **build chains** which are the equivalent of job dependencies in github actions to create sequential builds that depend on each other.

```kts
version = "2020.1"

// project configuration lives here
project {
	// 1. Use the build configuration specified by the Build object we created
	buildType(Build)
}

// 2. create a build configuration with the BuildType class
object Build: BuildType({
	name = "build"
	id("build")
	
	vcs {
		root(DslContext.settingsRoot)
	}
	
	steps {
		exec {
            name = "NPM Install"
            workingDir = ""
            path = "npm"
            arguments = "install"
        }

        exec {
            name = "NPM Build"
            workingDir = ""
            path = "npm"
            arguments = "run build"
        }

	}
	
	triggers {
        vcs {
            quietPeriodMode = VcsTrigger.QuietPeriodMode.USE_CUSTOM
            quietPeriod = 300
            branchFilter = ""
        }
    }

})

```




#### `pom.xml`

The `pom.xml` reads settings from the `settings.kts` to define the build configuration

```xml
<?xml version="1.0"?>
<project>
  <modelVersion>4.0.0</modelVersion>
  <name>Corporate_CustomerPortal Config DSL Script</name>
  <groupId>Corporate_CustomerPortal</groupId>
  <artifactId>Corporate_CustomerPortal_dsl</artifactId>
  <version>1.0-SNAPSHOT</version>

  <parent>
    <groupId>org.jetbrains.teamcity</groupId>
    <artifactId>configs-dsl-kotlin-parent</artifactId>
    <version>1.0-SNAPSHOT</version>
  </parent>

  <repositories>
    <repository>
      <id>jetbrains-all</id>
      <url>https://download.jetbrains.com/teamcity-repository</url>
      <snapshots>
        <enabled>true</enabled>
      </snapshots>
    </repository>
    <repository>
      <id>teamcity-server</id>
      <url>http://ci.compusearch.com/app/dsl-plugins-repository</url>
      <snapshots>
        <enabled>true</enabled>
      </snapshots>
    </repository>
  </repositories>

  <pluginRepositories>
    <pluginRepository>
      <id>JetBrains</id>
      <url>https://download.jetbrains.com/teamcity-repository</url>
    </pluginRepository>
  </pluginRepositories>

  <build>
    <sourceDirectory>${basedir}</sourceDirectory>
    <plugins>
      <plugin>
        <artifactId>kotlin-maven-plugin</artifactId>
        <groupId>org.jetbrains.kotlin</groupId>
        <version>${kotlin.version}</version>

        <configuration/>
        <executions>
          <execution>
            <id>compile</id>
            <phase>process-sources</phase>
            <goals>
              <goal>compile</goal>
            </goals>
          </execution>
          <execution>
            <id>test-compile</id>
            <phase>process-test-sources</phase>
            <goals>
              <goal>test-compile</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
      <plugin>
        <groupId>org.jetbrains.teamcity</groupId>
        <artifactId>teamcity-configs-maven-plugin</artifactId>
        <version>${teamcity.dsl.version}</version>
        <configuration>
          <format>kotlin</format>
          <dstDir>target/generated-configs</dstDir>
        </configuration>
      </plugin>
    </plugins>
  </build>

  <dependencies>
    <dependency>
      <groupId>org.jetbrains.teamcity</groupId>
      <artifactId>configs-dsl-kotlin</artifactId>
      <version>${teamcity.dsl.version}</version>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>org.jetbrains.teamcity</groupId>
      <artifactId>configs-dsl-kotlin-plugins</artifactId>
      <version>1.0-SNAPSHOT</version>
      <type>pom</type>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>org.jetbrains.kotlin</groupId>
      <artifactId>kotlin-stdlib-jdk8</artifactId>
      <version>${kotlin.version}</version>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>org.jetbrains.kotlin</groupId>
      <artifactId>kotlin-script-runtime</artifactId>
      <version>${kotlin.version}</version>
      <scope>compile</scope>
    </dependency>
  </dependencies>
</project>
```

### Creating a project


The `settings.kts` should contain a single invocation of the `project` block, which is where all the build configuration, VCS settings, and subproject settings are configured.

`VcsRoot`, `BuildType`, `Template`, and subprojects objects can be registered inside the project using the `vcsRoot()`, `buildType()`, `template()`, and `subProject()` methods respectively:


```kts
project {
    subProject {
        id("CustomerPortalBuilds")
        name = "Customer Portal Builds"

        buildType(APIBuild)
        buildType(ReactBuild)
    }

    vcsRoot(PortalAppVcsRoot)
    vcsRoot(PortalApiVcsRoot)

    buildType(Publish)
}
```

#### creating VCS roots

#### subprojects

#### creating build configuration files with `BuildType`

#### **complete example**

```kts
import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.*
import jetbrains.buildServer.configs.kotlin.v2019_2.vcs.GitVcsRoot
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.VcsTrigger
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

/*
The settings script is an entry point for defining a TeamCity
project hierarchy. The script should contain a single call to the
project() function with a Project instance or an init function as
an argument.

VcsRoots, BuildTypes, Templates, and subprojects can be
registered inside the project using the vcsRoot(), buildType(),
template(), and subProject() methods respectively.

To debug settings scripts in command-line, run the

    mvnDebug org.jetbrains.teamcity:teamcity-configs-maven-plugin:generate

command and attach your debugger to the port 8000.

To debug in IntelliJ Idea, open the 'Maven Projects' tool window (View
-> Tool Windows -> Maven Projects), find the generate task node
(Plugins -> teamcity-configs -> teamcity-configs:generate), the
'Debug' option is available in the context menu for the task.
*/

version = "2022.04"

project {
    subProject {
        id("CustomerPortalBuilds")
        name = "Customer Portal Builds"

        buildType(APIBuild)
        buildType(ReactBuild)
    }

    vcsRoot(PortalAppVcsRoot)
    vcsRoot(PortalApiVcsRoot)

    buildType(Publish)
}

object PortalAppVcsRoot : GitVcsRoot({
    name = "Portal App VCS Root"
    url = "git@gitlab.compusearch.com:corporatecomponents/customerportal/portalapp.git"
    branch = "main"
    authMethod = uploadedKey {
        uploadedKey = "tc_gitlab.id_rsa"
    }
})

object PortalApiVcsRoot : GitVcsRoot({
    name = "Portal API VCS Root"
    url = "git@gitlab.compusearch.com:corporatecomponents/customerportal/portalapi.git"
    branch = "main"
    authMethod = uploadedKey {
        uploadedKey = "tc_gitlab.id_rsa"
    }
})

object Publish : BuildType({
    name = "Publish"
    buildNumberPattern = "2026.4.0.%build.counter%"
    publishArtifacts = PublishMode.SUCCESSFUL

    steps {
        step {
            name = "Publish Package to Server"
            type = "octopus.push.package"
            param("octopus_space_name", "%allprojects.octopus.spacename.prodops%")
            param("octopus_host", "%allprojects.octopus.url%")
            param("octopus_packagepaths", """
                aggregateBuilds/** => COCO.CustomerPortal.%build.number%.zip
                database/sqlserver/** => COCO.CustomerPortalApi.SqlServerDB.%build.number%.zip
                database/oracle/** => COCO.CustomerPortalApi.OracleDB.%build.number%.zip                
            """.trimIndent())
            param("octopus_forcepush", "false")
            param("octopus_publishartifacts", "true")
            param("secure:octopus_apikey", "credentialsJSON:385844c1-18e7-4a4d-b8eb-1b23541a94ef")
        }
        step {
            name = "Create Release"
            type = "octopus.create.release"
            param("octopus_space_name", "%allprojects.octopus.spacename.prodops%")
            param("octopus_channel_name", "%coco.octopus.channel.unified%")
            param("octopus_version", "3.0+")
            param("octopus_host", "%allprojects.octopus.url%")
            param("octopus_project_name", "Customer Portal - IIS")
            param("octopus_forcepush", "IgnoreIfExists")
            param("secure:octopus_apikey", "credentialsJSON:385844c1-18e7-4a4d-b8eb-1b23541a94ef")
            param("octopus_releasenumber", "%build.number%%coco.octopus.unified.prerelease%")
        }
    }

    params {
        param("param.rjs.package", "COCO.CustomerPortalApp.${ReactBuild.depParamRefs.buildNumber}.zip")
        param("param.net.package", "COCO.CustomerPortalApi.${APIBuild.depParamRefs.buildNumber}.zip")
        param("param.dbsql.package", "COCO.CustomerPortalApi.SqlServerDB.${APIBuild.depParamRefs.buildNumber}.zip")
        param("param.dbora.package", "COCO.CustomerPortalApi.OracleDB.${APIBuild.depParamRefs.buildNumber}.zip")
        param("coco.octopus.channel.unified", "Unified")
        param("coco.octopus.unified.prerelease", "%allprojects.octopus.prereleasetag%")
    }

    triggers {
        vcs {
            branchFilter = ""
            watchChangesInDependencies = true
        }
    }

    dependencies {
        dependency(APIBuild) {
            snapshot {
                onDependencyFailure = FailureAction.FAIL_TO_START
            }

            artifacts {
                cleanDestination = true
                artifactRules = """
                    %param.net.package%!** => aggregateBuilds
                    %param.dbsql.package%!** => database/sqlserver
                    %param.dbora.package%!** => database/oracle
                """.trimIndent()

            }
        }
        dependency(ReactBuild) {
            snapshot {
                onDependencyFailure = FailureAction.FAIL_TO_START
            }

            artifacts {
                cleanDestination = true
                artifactRules = "%param.rjs.package%!** => aggregateBuilds/build"
            }
        }
    }
})

object APIBuild : BuildType({
    id("APIBuild")
    name = "API Build"

    artifactRules = """
        CustomerPortalApi\bin\net10.0\publish\** => COCO.CustomerPortalApi.%build.number%.zip
        -: CustomerPortalApi\bin\net10.0\publish\Migrations => COCO.CustomerPortalApi.%build.number%.zip
        CustomerPortalApi\bin\net10.0\publish\Migrations\SqlServer\** => COCO.CustomerPortalApi.SqlServerDB.%build.number%.zip
        CustomerPortalApi\bin\net10.0\publish\Migrations\Oracle\** => COCO.CustomerPortalApi.OracleDB.%build.number%.zip
    """.trimIndent()
    buildNumberPattern = "2026.4.0.%build.counter%"
    publishArtifacts = PublishMode.SUCCESSFUL

    params {
        param("param.solution", "CustomerPortalApi.sln")
        param("system.DeployOnBuild", "true")
        param("system.PublishProfile", "FolderProfile")
    }

    vcs {
        root(PortalApiVcsRoot, "+:. => .", "-: .teamcity", "-: .idea", "-: .gitignore")
    }

    steps {
        powerShell {
            name = "Pull SlowCheetah"
            platform = PowerShellStep.Platform.x64
            scriptMode = script {
                content = """
            %teamcity.tool.NuGet.CommandLine.DEFAULT%\tools\nuget install SlowCheetah -OutputDirectory packages -Source "C:\Program Files (x86)\Microsoft SDKs\NuGetPackages;https://api.nuget.org/v3/index.json"
        """.trimIndent()
            }
        }

        powerShell {
            name = "Run Project Transform Version Update"
            platform = PowerShellStep.Platform.x64
            scriptMode = file {
                path = "%devops.teamcity.tools.dir%/General/Invoke-MsBuildXmlTransform.ps1"
            }
            param("jetbrains_powershell_scriptArguments", "-NuGetRootPath %teamcity.build.workingDir%/packages -BaseFile %teamcity.build.workingDir%/CustomerPortalApi/log4net.config -TransformFile %teamcity.build.workingDir%/CustomerPortalApi/log4net.Release.config -TargetPath %teamcity.build.workingDir%/CustomerPortalApi/log4net.config")
        }

        dotnetRestore {
            name = "Restore Packages"
            projects = "%param.solution%"
            sources = """
                https://nuget.compusearch.com/v3/index.json
                https://api.nuget.org/v3/index.json
            """.trimIndent()
            param("dotNetCoverage.dotCover.home.path", "%teamcity.tool.JetBrains.dotCover.CommandLineTools.DEFAULT%")
        }
        dotnetMsBuild {
            name = "Run Build"
            projects = "%param.solution%"
            version = DotnetMsBuildStep.MSBuildVersion.CrossPlatform
            targets = "Rebuild"
            configuration = "Release"
            param("dotNetCoverage.dotCover.home.path", "%teamcity.tool.JetBrains.dotCover.CommandLineTools.DEFAULT%")
        }
        dotnetPublish {
            name = "DotNet Publish"
            projects = "%param.solution%"
            configuration = "Release"
            skipBuild = true
            args = "/p:PublishProfile=%system.PublishProfile%"
            param("dotNetCoverage.dotCover.home.path", "%teamcity.tool.JetBrains.dotCover.CommandLineTools.DEFAULT%")
        }
        reSharperInspections {
            name = "Run Inspections"
            enabled = false
            solutionPath = "%param.solution%"
            cltPath = "%teamcity.tool.jetbrains.resharper-clt.DEFAULT%"
            cltPlatform = ReSharperInspections.Platform.X64
            customCmdArgs = "-s=WARNING"
        }
        dotnetVsTest {
            name = "Run Tests"
            assemblies = """
                Unison.Corporate.CustomerPortal.Tests\bin\Release\net10.0\Unison.Corporate.CustomerPortal.Tests.dll
            """.trimIndent()
            version = DotnetVsTestStep.VSTestVersion.V15
            filter = testCaseFilter {
                filter = "TestCategory!=Integration"
            }
            platform = DotnetVsTestStep.Platform.Auto
            coverage = dotcover {
                toolPath = "%teamcity.tool.JetBrains.dotCover.CommandLineTools.DEFAULT%"
                assemblyFilters = "-:Unison.Corporate.*.Tests"
            }
        }
    }

    requirements {
        doesNotEqual("system.agent.name", "LXCI01")
    }

    triggers {
        vcs {
            quietPeriodMode = VcsTrigger.QuietPeriodMode.USE_CUSTOM
            quietPeriod = 300
            branchFilter = ""
        }
    }
})

object ReactBuild : BuildType({
    id("ReactBuild")
    name = "React Build"

    artifactRules = """build\** => COCO.CustomerPortalApp.%build.number%.zip"""
    buildNumberPattern = "2026.4.0.%build.counter%"
    publishArtifacts = PublishMode.SUCCESSFUL

    vcs {
        root(PortalAppVcsRoot, "+:. => .", "-: .teamcity", "-: .idea", "-: .gitignore")
    }

    steps {
        exec {
            name = "NPM Install"
            workingDir = ""
            path = "npm"
            arguments = "install"
        }

        exec {
            name = "NPM Build"
            workingDir = ""
            path = "npm"
            arguments = "run build"
        }
    }

    triggers {
        vcs {
            quietPeriodMode = VcsTrigger.QuietPeriodMode.USE_CUSTOM
            quietPeriod = 300
            branchFilter = ""
        }
    }
})

```



### Patches

In _TeamCity_, when your project configuration is stored as _Kotlin DSL_ in version control, the system tries to automatically commit changes made in the web UI back to your code. 

However, **DSL patches** are created when _TeamCity_ cannot automatically map a UI-driven change to your existing _Kotlin_ code structure.

Here's how they work

- **Trigger:** Patches occur when you have customized your _Kotlin_ files in a way that _TeamCity_ cannot parse or reconcile automatically, such as by introducing custom variables or complex logic
- **Mechanism:** When a conflict occurs, _TeamCity_ commits a new folder to your repository named `patches`. Inside, you will find a `build.kts` file representing the change
- **Resolution:** These files are not automatically merged. You must follow these steps:
	1. You must manually review the patch file to understand the required setting change, then update your primary `settings.kts` file to reflect that change
	2. Delete the `patches` folder entirely to apply the fix and resolve the state mismatch 
	3. Commit and push the latest changes

This approach works well because we treat the VCS with the kotlin DSL as the source of truth, and any changes made in the UI as a "nice suggestion" we can choose to include in the code as config or not.




## Octopus Basics

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


### Package to Octopus

#### Adding tentacles

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


#### Deploying to tentacles

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

#### Connecting TeamCity to Octopus

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

## Octopus deployments

### Intro

In Octopus Deploy, the normal design is:

- **Project/process** = how DIS is deployed
- **Environment** = where it is deployed, such as Dev, QA, or Production
- **Release** = a versioned snapshot of the process, packages, and variables that gets promoted through those environments

Here's an overarching mental model:

```
Project
│
├── Deployment process
│   └── Defines WHAT Octopus does
│
├── Channel
│   └── Defines WHICH release lane is used
│
├── Lifecycle
│   └── Defines WHERE and in WHAT ORDER the release goes
│
└── Release
    └── A deployable snapshot of packages, process, and variables
```

A useful shorthand is:

- **Process:** What deployment actions happen?
- **Environment:** Where does the application run?
- **Lifecycle:** In what order may environments receive a release?
- **Channel:** Which release strategy or lane does the release follow?
- **Release:** Which version is being deployed?
### Creating deployments
### Octopus and creating an IIS pipeline

When creating an octopus project, you can configure the pipeline with prebuilt step recipes, and Octopus offers a prebuilt step for deploying to IIS app pools.


1. Choose the "Deploy to IIS" prebuilt step template:

![](https://i.imgur.com/qy2IRBX.jpeg)


2. Configure the deploy to IIS step by specifying the target environment, which will automatically deploy to the IIS app pools on all tentacles tagged by that target environment.


![](https://i.imgur.com/FdnD2qc.jpeg)
3. Select the specific package (artifact) to deploy


![](https://i.imgur.com/mgbIVnN.jpeg)

### Releases

Releases are ways to version packages and have them get ready to be deployed to individual stages.

1. Create a release from a package


![](https://i.imgur.com/EUKxfS5.jpeg)

### Variables

There are two types of variables in Octopus Deploy:

- **system variables**: Variables managed by Octopus, available under the `Octopus` namespace, available system wide or specific ones that inject project-specific values.
- **project variables**: user-created variables that you make available at the project level. You can further constrain the use of these variables by **scoping** them to certain environments, target roles, target servers/tentacles, and specific deployment steps.
	- Scopes allow you to supply different variable values for each scope, namespaced under a single variable.

You can add variables for a project, which lets you use the variable anywhere inside the project.

Once you create variables, you can use them anywhere when configuring Octopus pipelines or releases via template string interpolation, with the `#{}` syntax.

1. Create a project variable


![](https://i.imgur.com/HZ0IaLN.jpeg)
2. You can also scope the variable to restrict its use more and provide conditional, scoped values for the variable.


![](https://i.imgur.com/2mQRdK0.jpeg)



![](https://i.imgur.com/KCZk6EX.jpeg)


3. Use the variable to make build steps in a pipeline more dynamic:


![](https://i.imgur.com/js2N375.jpeg)

#### Extra variable configuration


If you want extra variable configuration, you have these options:

1. Edit an existing variable

![](https://i.imgur.com/DZLlq47.jpeg)
2. Add configuration, like dropdowns, prompts, etc.



![](https://i.imgur.com/iHjwLjK.jpeg)

A caveat here is that if you decide to provide extra configuration for your variable and prompt for its value, then for project scopes you can only scope by environment and nothing else (because that's the only thing known beforehand). 


![](https://i.imgur.com/bKp31vP.jpeg)

#### System variables

Here are the important namespaces:

- `Octopus.Environment`: object with info about the environment being deployed to.
- `Octopus.Action.Package`: object with info about the current package that is trying to be deployed.
- `Octopus.Deployment`: object with info about deployments

### Lifecycles

A **lifecycle** defines the path that a release can take through deployment environments.

Think of it as the project’s promotion roadmap:

```
Development → QADEMO → QA
```

A lifecycle can control:

- The environments available to a release
- The order in which releases move through environments
- Whether an environment or phase is required or optional
- Whether deployment to an environment begins automatically
- How many releases and deployment files are retained

Octopus calls each stage in a lifecycle a **phase**. A phase can contain one environment or multiple environments. A lifecycle can require a successful deployment to an earlier phase before a later phase becomes available.


### Channel

A **channel** is a release lane inside a project.

Channels let one Octopus project support different release strategies without duplicating the project. Every release belongs to a channel, and the channel can determine:

- Which lifecycle the release follows
- Which package versions are allowed
- Which process steps run
- Which variables apply
- Which tenants apply

Each channel can behave differently while still using the same underlying project.

Octopus supports channel-specific lifecycles, process steps, variables, tenants, and package-version rules. Every project has a default channel, and additional channels can be created when genuinely different release behavior is needed.