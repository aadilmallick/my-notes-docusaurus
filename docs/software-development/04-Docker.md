
## Docker Basics

### The absolute basics

One thing to keep in mind is this concept of _layer caching_. Docker will attempt to avoid repeating as many steps as possible, so if we install dependencies before adding the code to copy our application code, the install dependencies step will be cached.

- No matter how much we change our application code, since the install step ran beforehand, it will be unaffected in the cache.
- The only time we have to reinstall dependencies is when the contents of our `package.json` changes.

```dockerfile
# install node lts version on alpine linux distro, which is only 5mb in size
FROM node:lts-alpine
# create app folder in our docker container, which will contain all application code
# /app acts as root.
WORKDIR /app

# copy package.json for install caching. Only reinstall if the file changes.
COPY package.json ./
# install all dependencies but omit dev dependencies
RUN npm install --only=production

# copy every single folder and file from root directory into the workdir, app.
COPY . .

RUN npm run build --prefix client

# prevent hackers from hacking into our container and running commands as root
USER node

# run this command when the container starts, in exec form (safer)
CMD ["npm", "start", "--prefix", "server"]

# set environment variable
ENV PORT=8000

# expose port 8000 to the outside world
EXPOSE 8000
```

- `ENV` sets environment variables that will be available during the container process
- `RUN` runs shell commands.
- `EXPOSE` just serves as documentation for the port that the container process will be running on, but is overrided by port forwarding
- `CMD` is the main command you want to run. This is the actual command that starts the docker file. There can only be one of these per Dockerfile, and for good reason.

> [!NOTE]
> The `CMD` command will not be executed when an image is built, but rather when a container is built from the image and spins up.

**Dockerignore**

To avoid copying over or including files and folders you don’t want, docker has a similar concept to git called a `.dockerignore` file. You’ll often put `node_modules` and `.git` in there.

```docker
node_modules
.git
```

**Building docker images**

The `docker build` command looks for a dockerfile and builds a docker image from that.

- `docker build .` : builds a docker image by finding the dockerfile in the current directory and building a docker image from that
- `docker build . -t <IMAGE_NAME>:<TAG>` : builds a docker image from the dockerfile in the current directory and allows you to name the image and specify a tag for a version.

When deciding with OS docker image to build off on, think, “what can I do to capture this moment and make sure it doesn’t break in the future?”

Using the `--tag` option or the shorthand `-t` option, you can name and tag your docker builds like so:

```bash
docker build --tag <image-name>:<tag-number> .
```

- The `image-name` will be the name of your image, and the `tag-number` will be the specific docker tag versioning to fetch a specific container version.
- The tag number doesn’t really have to be a number, but it’s recommended. In fact, it’s “latest” by default.

**Running docker images**

To run a specific docker image, we need to refer the image by its name, which you should have specified when you created the docker image

```bash
docker run -it -p <LOCAL_PORT>:<CONTAINER_PORT> <IMAGE_NAME>
```

The `docker run` command runs the container based on the instructions in the dockerfile. You can then use the `docker ps` command to look at all your currently running containers

- The `-p` command specifies which port mapping behavior we define for running the docker image.
    - In the docker image, we expose a port for public use. Our application code running in the docker image will use that to create a server.
    - The `-p` syntax is like `-p <LOCAL_PORT>:<CONTAINER_PORT>` , so if we do a mapping of `3000:8000`, it shows that we want to map the container’s exposed 8000 port to our localhost:3000.
    - Keep in mind, it only makes sense to map publicly exposed ports in our container.
- The `-it` command puts you in an interactive container, meaning it gives you some visual feedback.

### DockerFile

#### Variables

**environment variables**
****

You can specify environment variables with the `ENV` command and then provide a key value pair, like so:

![](https://i.imgur.com/XDF9Obb.png)

**args**

The `ARGS` command in docker allows you to define variables in your dockerfile and then use template string interpolation with `${...}` to access those variables.

![](https://i.imgur.com/GWwjPMO.png)




#### Making secure containers

When creating the docker file, remember that the default user is root.

If you run a docker container with `docker run` and then override the main command with `whoami`, you’ll the see that the root user is active.

```dockerfile
FROM node:18-alpine

# security practice: run as non-root user, prevent root user access
# runs as the node user
USER node

# this becomes the new root folder for the rest of the commands
WORKDIR /home/node/app

COPY --chown=node:node index.js index.js

CMD ["node", "index.js"]
```

- `FROM <image>` : starts our container by building off another docker image from dockerhub. Here we use node 18 running on alpine linux
- `USER <user>` : switches to the specified user, often done to prevent root access
- `WORKDIR <path>` : creates the specified path and cd’s into it. The current working directory becomes that path in the container. It becomes the “root folder” for the rest of all the commands in the docker file.
- `CMD <command>` : defines the main command for a container. The command is written in exec mode.

We want the policy of least power for best security practices, so we’ll change the user:
1. The node image gives us another user called `node` with limited privileges. Switch to this user using the `USER node` command.
2. Supply cli-specific commands like `COPY` with `--chown=node:node` as the first argument to make the user the owner or executor of the action.
    
```dockerfile
COPY --chown=node:node index.js index.js
```

#### Examples

**example 1: secure vite app**
****
This first example shows how to correctly use user and user groups for maximum security within a container process. You can pretty much just copy this from project to project:

```bash
FROM node:20-alpine

# 1. for security, run as non-root user
RUN addgroup app && adduser -S -G app app
USER app

# 2. set the working directory to /app
WORKDIR /app

# 3. copy package jsons for docker cache
COPY package*.json ./

# 3a. deal with weird ownership issues
USER root
RUN chown -R app:app .
USER app

# 4. install dependencies
RUN npm install

# 5. copy the rest of the files to the working directory
COPY . .

# 6. expose port 
EXPOSE 5173

# 7. run app
ENTRYPOINT npm run dev
```

**example 2: node server**
****
For the docker image to handle dependencies in a node app, this is how the dockerfile should be:

```dockerfile
FROM node:18-alpine
USER node

# we need to own this folder so we can run npm install in it
RUN mkdir /home/node/app
WORKDIR /home/node/app

# copy package and package lock json for layer caching
COPY --chown=node:node package*.json ./

# install all dependencies with npm ci
RUN npm ci

COPY --chown=node:node . .

ENV PORT=3000

CMD ["npm", "start"]
```

The most important part here is dependencies. Before copying over any files, we follow these steps:

1. Put `node_modules` in the `.dockerignore`
2. Copy over the package and package-lock JSON files.
3. Run the `npm ci` command for a clean install, which looks towards the more accurate `package-lock.json` to install libraries. It also automatically deletes `node_modules` before reinstalling.

Doing the install early on ensures container caching and faster rebuilding as long as we don’t modify the contents of the package JSON.
### Running containers

#### Supplying environment variables

You can supply pairs of environment variables when running a container with the `--env` flag. This is useful for dynamically supplying environment variables instead of statically establishing them in the Dockerfile.

The basic syntax for using the flag is `--env KEY=VALUE` or you can use the shorthand `-e`.

```bash
docker run --env PORT=3000 --env APP_NAME=docker <container>
```

#### Automatically deleting containers

You can automatically delete a container after you stop its process with the `--rm` flag. This is useful to avoid extra steps for cleanup afterwards.

```
docker run --rm <container> 
```


#### detached vs interactive mode

Containers by default run in **detached mode**, meaning that they run in daemon process in the background. If that's not what you want, then you can switch to **interactive mode**, which is a blocking process in the CLI and shows the container output.

Here are the two options for explicit specifying detached or interactive mode:

- `-d`: running a container with `docker run -d <image>` runs it in detached mode.
- `-it`: running a container with `docker run -it <image>` runs it in interactive mode.

You can also switch between detached and interactive mode with these CLI commands:

- `docker attach <container>`: reattaches to the process of a detached container
- `docker detach <container>`: detaches from the process of a running container

**interactive shell mode**
****
If you want to write some commands to do some testing from within the container's environment, then you have to go into *interactive shell mode*, which you can do like so:

![](https://i.imgur.com/dOvhWj5.png)

#### Running commands on a container

The basic syntax for running a docker container and overriding the `CMD` with your own command is as follows:

```bash
docker run <image> <cmd>
docker run -it <image> <cmd> # for interactive
docker run --rm <image> <cmd> # for cleanup after process exit
```

You specify the image to run, and then an optional command at the end called the `cmd`, which is the main command a docker image runs as soon as it spins up.

> [!NOTE]
> Every container has a main command specified by `CMD`, and passing in your own command as the last argument of `docker run <container>` will override that main command and run it.

- So `docker run alpine:3.10 ls` spins up alpine linux v3.10, and then runs the `ls` command in the root directory instead of just dropping you into a linux shell.


### Copying files to containers

You can copy files and folders into and out from a running docker container using the `docker cp` command.

- The basic usage is `docker cp <src> <destination>` , where the src and destination are filepaths either located on your local machine or on the container.
- To refer to a remote container path, the syntax is `<container-name>:<path>` . For example, the path `boring_guy:/data` refers to the `/data` folder in the `boring_guy` container.

```bash
docker cp <src> <destination>
# copy everything in the data folder to the fluffy waffle container 
# at the /app/data path
docker cp data/. fluffy_waffle:/app/data
```

> [!TIP]
> Doing this is a poor man's version of a bind mount, so just use that instead.



### CLI reference

#### Containers

**container lifecycle**

- `docker stop <container-id-or-name>` : stops the specified container
- `docker start <container-id-or-name>` : starts the specified stopped container
- `docker rm <container-id-or-name>` : deletes the specified container if its stopped
- `docker rm -f <the-container-id>` : stops and force deletes the specified container
- `docker container prune`: deletes all unused containers

**container info**

- `docker logs <container-id-or-name>` : views the logs of the specified container
- `docker container ls`: lists all containers
- `docker ps -a`: lists all containers
- `docker ps -q`: lists all curently running containers

#### Images

- `docker image ls` : lists all images
- `docker image prune` : deletes all dangling images
- `docker rm <image>`: deletes the image
- `docker image inspect <image:tag>`: inspects the specified image and its version

### The container registry
### Volumes and Bind mounts

You can think of both bind mounts and volumes as a way of maintaining state and persisting data throughout container builds and runs.

- **Bind mounts** are you exposing a folder from your file system to a container through a symbolic link, meaning changes to that folder will also be reflected in the container.
- **Volumes** are creating a folder on your container that also writes to local data on your filesystem, abstracted under Docker Desktop.

> [!NOTE]
> Bind mounts are more performant since they're a direct portal to your filesystem, but that also makes them less secure. Volumes are a higher abstraction and are more secure.

![](https://i.imgur.com/ReFlpJO.png)

Let's also learn some basic terminology:

- **ephemeral**: an adjective used for referring to data or systems that that maintain persistent state. An example is container by default - as soon as you delete them, they lose everything that ever happened in it.
- **snowflake server**: A snowflake server is when you have a server that uses ephemeral data sources or services, making losing all your data a real possibility.
	- If your server crashes and you were running an ephemeral, local data store like SQLite on it, then you lose all your data and the database resets back to the original state before the server crash.

#### Volumes vs bind mounts: final verdict

There is one key difference to understand between bind mounts and volumes: the key difference from bind mounts is that Docker is in control of the volume's location and lifecycle on the host.

- **bind mounts**: container gains complete unobscured access to the mounted folder from your local filesystem
- **volumes**: Docker controls where the volume's data lives on your local host filesystem, which is obscured from the user. Has more control over that data.

> [!IMPORTANT]
> They key here is this: bind mounts are file systems managed the host. They're just normal files in your host being mounted into a container. Volumes are different because they're a new file system that Docker manages that are mounted into your container. These Docker-managed file systems are not visible to the host system (they can be found but it's designed not to be.)

(Yes, I know I said "key" a lot).

You specify a bind mount or volume you want to attach to your container with the `--mount` option, and they have two different syntaxes:

- **Named volume**: `type=volume,src=my-volume,target=/usr/local/data`
- **Bind mount**: `type=bind,src=/path/to/data,target=/usr/local/data`

**When to Choose Volumes**
****
 If it would be annoying to have container processes reflect changes on your local filesystem, it's better to use volumes.

- For databases and other stateful applications.
- When data portability and ease of backup/migration are important.
- When you want Docker to manage the data's lifecycle and location.
- When security is a significant concern, as volumes offer better isolation.

**When to Choose Bind Mounts**
****
Basically only use case is for copying over dotfiles and developing in a container.

- During local development for iterating on code or configurations quickly.
- When you need to provide existing configuration files from the host.
- When performance in a development context outweighs the benefits of volume management.

#### Bind Mounts

They are like portals to your host computer, providing a container direct access to your filesystem. Whatever code you change in a mounted folder will be immediately reflected in the container without having to rebuild.

Here is the basic syntax for specifying a bind mount:

```bash
docker run --mount type=bind,source=$LOCAL_DIR_SOURCE,target=$TARGET_CONTAINER_DIR
```

You specify a mount with the `--mount` option, and then when passing in the mount options, you specify a bind mount with the `type=bind` option. In fact, there are three key value pairs you have to care about:

- **`source`:** Path on the host machine to create a bind mount from
- **`target`:** Path inside the container where the host source path should be mounted
- **`type`:** Set to `bind` for bind mounts.
- **`consistency`:** Optional. `cached` can improve performance.

Here is a complete example:

```bash
docker run --mount \\ type=bind,source=/path/to/your/host/directory,target=/path/in/container your_image_name

docker run --mount type=bind,source="$(pwd)"/build,target=/usr/share/nginx/html 
-p 8080:80 nginx
```

A shorthand syntax for creating a bind mount is to use the `-v` option, which is less explicit. The syntax is like so, where you specify the local filepath to the container filepath mapping:

```bash
docker run -v <local-filepath>:<container-filepath> <your_image_name>
```

**bind mount security**
****
Because of the security risk with bind mounts, it is crucial that you give the container access to folders mindfully and with unprivileged permissions. For example, you can make bind mounts readonly in the mount option, preventing the container from changing your mounted content remotely:

- This is how you do it with the `--mount` option:
    
    ```bash
    docker run --mount \\
    type=bind,source=/localpath,target=/containerpath,readonly your_image_name
    ```
    
- This is how you do it with the `-v` option:
    
    ```bash
    docker run -v \\
    /path/to/your/host/directory:/path/in/container:ro your_image_name
    ```

#### Volumes

Volumes are a way of saving a container file on your local filesystem thereby having the changes persist across container runs. The actual local path of where the container data lives is abstracted away, as opposed to bind mounts.

Here are the key characteristics of volumes in docker:

- **Docker-Managed**: Docker handles the creation, location, and lifecycle of volumes.
- **Persistent Data:** Data stored in volumes persists even after the container that created or used it is stopped or removed.
- **Portability**: Volumes are more portable than bind mounts. Because Docker manages the volume's location, you can move a volume between hosts more easily (though this requires specific tools or methods).
- **Abstraction**: Volumes provide an abstraction layer over the host's filesystem, making them less dependent on the host's specific directory structure.
- **Data Isolation**: Data in volumes is typically stored in an area managed by Docker, making it more isolated from the host's general filesystem.
- **Backup and Migration**: Docker provides commands and APIs for backing up and migrating volumes.

Two major use cases for using docker volumes are for a persistent database and for sharing volumes between containers. Even when the container is deleted, the volume isn't - persistence achieved.

There are two ways to use volumes:

**method 1) unnamed volume mount**

---

The below command using `-v` and only supplying the path to the directory you want to volume mount will automatically create an anonymous volume in Docker.

```bash
docker run -v /app/data your_image_name
```

> [!WARNING]
> However, be warned - the volume name will be some random obfuscated id.

**method 2) named volume mount**

---

1. Create a volume with the `docker volume create <volume-name>` command
    
2. Run the container with the volume attached using the command. Use the `--mount` flag, and then specify these three keys: **type, src, target.**
    
    - `type=volume` : specifies that we are mounting a volume
    - `src=<volume-name>` : the volume to mount
    - `target=<path>` : where in the container filesystem to mount the volume
    
    ```bash
    docker run -dp 127.0.0.1:3000:3000 --mount 
    type=volume,src=todo-db,target=/etc/todos getting-started
    ```
    

You can also use the `-v` flag, which is the shorthand for mounting, and in this case, volume mounting:

```bash
docker run -v <volume-name>:<container_path> <image_name>
```

**docker volume reference**

Here is a reference for the volumes commands:

- `docker volume ls`: lists all volumes
- `docker volume create <volume_name>` : creates a volume with the specified name
- `docker volume inspect <volume_name>` : gets detailed info about the specified volume.
- `docker volume rm <volume_name>` : deletes the specified volume.
- `docker volume rm <volume_name>` : deletes the specified volume.

**volume examples**
****

The below example runs a postgres container and automatically creates a volume called `postgres_data`.

```bash
docker run -d --name my-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  --mount type=volume,source=postgres_data,target=/var/lib/postgresql/data \
  postgres:latest
```


### Networks

Networks are a useful way of connecting containers to each other via a shared network without needlessly exposing ports running SQL or mongo to the real world.

> [!NOTE]
> The main benefit is that they enable containers to talk to each other without exposing their ports directly to the host or the outside world.



Here are 4 benefits of working with docker networks in multi-container applications:

- **Container Communication**: Enable containers to talk to each other without exposing their ports directly to the host or the outside world.
- I**solation**: Network isolation prevents containers from accessing networks or resources they shouldn't have access to.
- **Service Discovery**: Allows containers to find and connect to other containers by their name or alias within the same network.
- **Portability**: Networking configurations are defined as part of the container or service definition, making them more portable.

**creating networks**

---

You can create networks with the `docker network create` command, also specifying the driver:

```bash
# create the network
docker network create --driver=bridge <network-name>
```

The `--driver` flag is used to specify what server you want managing the network. If you want the network to be available on your local machine but not accessible by host ports, then Docker Desktop provides the `bridge` default.

In fact, there are 4 special drivers you can specify:

- `bridge`: the default driver managed by Docker Desktop
- `host` : runs the network on the local machine, but not hiding the ports from the host machine. Has full access to the host network, with no network isolation
- `none`: no connection to the network, no external network connectivity.

**running stuff on networks**

You can then start running something on the network with `docker run`, but by specifying in which network you want to run the container with the `--network` flag:

```bash
# start the mongodb server, expose port 27017 from container to local machine
docker run -d --network=app-net -p 5432:27017 --name=db --rm mongo:7
```

Let’s dissect the above command:

- `--network=app-net` : runs the container in the network
- `-p 5432:27017` : port forwards the container’s 27017 port to the host machine port on 5432.

Since you can run multiple containers on the same network, all those containers have exposable ports they can each interact with. Here are the steps to understand working with networks in docker:

1. You list each port a container runs on with the `EXPOSE <PORT_NUMBER>` command in a dockerfile.
2. When you run multiple different containers in the same network, they can all access each other through the exposed container ports, which are not accessible by host machine
3. You can make individual containers accessible to the host by using port forwarding with `-p <HOST_PORT>:<CONTAINER_PORT>`.

```bash
# 1. Create the network
docker network create my_custom_bridge

# 1. run the database in the network
docker run -d --name db_container --network my_custom_bridge postgres:latest

# 2. run the app in the network so it can access db
	#. also port forward it so host machine can access.
docker run -d --name app_container --network my_custom_bridge -p 8080:3000 \\
	my_app_image
	
```

Here's an english high-level equivalent of what we did in the above example:
1. In the above example, we'll first create a network. 
2. Then we'll create a postgres container in that network that runs on port 5432 in the network. 
3. Then we'll create a container for our nodejs server that runs in the network, and have it run on port 3000. In our application code, it can access the postgres database through port 5432 because both containers run in the same network.
4. Then we can do port forwarding to expose our app's container port 3000 to the host machine port of 8080 to see our app on `http://localhost:8080`

**network reference**

---

- `docker network ls`: List all Docker networks
- `docker network inspect <network-name>`: Get detailed information about a specific network, including connected containers, subnet information, and gateway
- `docker network create --driver <network-name>` : Create a new custom network
- `docker network rm <network-name>`: Remove a custom network (only if no containers are connected)
- `docker network connect <network-name>` : Connect an existing container to a network
- `docker network disconnect <network-name>` : Disconnect a container from a network



## Dev containers

Dev containers allow you to launch your VSCode workspace using a dockerfile or other images so you don't have to install things locally on your end. They allow for seamless development in collaboration. 

Under the hood, VS code uses bind mounts to take your current project, copy it into the container, and run a clean install with dependencies, but the dev container workflow with VS code is much better.

Here are some use cases:

- Ensuring everyone has the same VSCode extensions installed in the workspace
- Ensuring everyone has the same VSCode settings enabled in the workspace
- Ensuring everyone has the same binaries and images installed, like being able to use Deno, Bun, or FFMpeg.

### Creating dev containers

All dev container configuration will live inside a `.devcontainer` folder, specifically pointing to a `.devcontainer/devcontainer.json`. Here is a basic example of the `devcontainer.json`:


```json
{
  "name": "first dev container",
  "dockerFile": "Dockerfile",
  "remoteEnv": { "NODE_ENV": "development" },
  "build": {
    "options": ["--platform=linux/amd64"]
  },
  "features": {
    "ghcr.io/devcontainers/features/common-utils:2": {
      "installZsh": "true",
      "username": "node",
      "upgradePackages": "true"
    }
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "sdras.fortnite-vscode-theme",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "workbench.colorTheme": "Fortnite",
        "terminal.integrated.shell.linux": "/bin/bash"
      }
    }
  },
  "postCreateCommand": "npm install"
}
```

Here are the important keys:

- `name` : the dev container’s name
- `dockerFile` : the path to the docker file that accompanies this. 
	- Only use this key if you're not using a base image for the devcontainer with the `image` key.
- `image`: the base image name to pull from docker hub. 
	- Only use this key if you're not using a custom Dockerfile with the `dockerFile` key.
- `appPort` : the ports on the docker container to expose
- `forwardPorts`: a list of exposed ports from the container to map to the host machine ports.
- `postCreateCommand` : the command to run after the dockerfile in the devcontainer finishes building.
	- think doing something like installing dependencies with `npm install` here
- `postStartCommand` : the command to run after the complete dock
	- think doing something like starting a process with `npm run dev` here
- `customization.vscode`: any customization settings to apply for the new environment
	- `settings` : any vscode settings to apply once inside the devcontainer environment
	- `extensions` : any vscode extensions to install once inside the devcontainer environment
- `features`: a list of additional tools to install (useful if not using custom dockerfile to install those things)
- `build.options`: a list of command-line options to pass when building the container, such as `--platform` to specify which paltform the container should be made for.

Now let's dive deep into the heart of building a dev container: choosing the image to base it off of. There are three ways to do so, but you can only choose one per dev container.

- **prebuilt image**: Use an image with the `image` key like `node:24` or a special microsoft image specifically for dev containers.
- **custom dockerfile**: point to the custom image you want to use through the `"dockerFile"` key.
- **docker compose**: point to the compose yaml file you want with through the `"dockerComposeFile"` key, but you must also specify the name of the service to spin up through the `"service"` key.

### Rebuilding dev containers

Whenever you make a change to your `devcontainer.json` or to the `Dockerfile` it points to, you should rebuild and reopen the devcontainer through the command palette.

### Variables in Dev containers

Globally available variables supplied by VSCode as well as environment variables from your host machine can be referenced and interpolated with `${VARIABLE_NAME}` syntax. 

#### Environment Variables

In your devcontainer, you can reference environment variables using the same template string interpolation syntax, but you have to specify which environment variables you want to read from: your local env vars or the ones from your base image/dockerfile:

- `${localEnv:VARIABLE_NAME}`: reads the value of `VARIABLE_NAME` from your local environment variables
- `${containerEnv:VARIABLE_NAME}`: reads the value of `VARIABLE_NAME` from the environment variables set in the base image or dockerfileor docker compose file

#### Built-in variables

Here are some built in variables you can reference:
- `${localWorkspaceFolder}`: the local absolute filepath on your host machine that represents the current workspace.
- `${containerWorkspaceFolder}`: the remote absolute filepath on the container that corresponds to the workspace in the container (mounted from your local one).

### Adding Bind mounts

You can use bind mounts to add in stuff like dotfiles, aliases, or other important files from your local laptop into the container. It essentially creates a link, where modifying the same file in either the devcontainer or on your local machine actually changes the file in both environments, so it's not just a simple copy - it's a view to a folder. 

```json title=".devcontainers/devcontainer.json"
{
  "mounts": ["source=${localWorkspaceFolder}/data,target=/container/data,type=bind,consistency=cached"]
}
```

In the `"mounts"` key, you provide a list of bind mounts you would like to mount in the devcontainer environment, and each bind mount follows a certain syntax of 4 key-value pairs you need to provide to describe the bind mount behavior:

- **`source`:** Path on the host machine. `${localWorkspaceFolder}` is a variable representing your project folder.
- **`target`:** Path inside the container where the host path should be mounted.
- **`type`:** Set to `bind` for bind mounts.
- **`consistency`:** Optional. `cached` can improve performance.

### Dev container CLI

The `devcontainer` CLI tool offers ways to control devcontainers for your workspace from the CLI:

```
  devcontainer open [path]          Open a dev container in VS Code
  devcontainer up                   Create and run dev container
  devcontainer set-up               Set up an existing container as a dev container
  devcontainer build [path]         Build a dev container image
  devcontainer run-user-commands    Run user commands
  devcontainer read-configuration   Read configuration
  devcontainer outdated             Show current and available versions
  devcontainer upgrade              Upgrade lockfile
  devcontainer features             Features commands
  devcontainer templates            Templates commands
  devcontainer exec <cmd> [args..]  Execute a command on a running dev container
```

## Docker Compose

### Intro, compose vs kubernetes

Docker compose is useful for development purposes where you need multiple processes/containers talking to each other, like a server, frontend, and database.

- **Docker compose** handles multiple container interactions with one host
- **Kubernetes** handles multiple container interactions with multiple hosts, so it’s good for scaling

### Compose yaml

Docker compose easily handles networking between containers, meaning exposing database and server ports is as easy as telling which port each container should expose.

It networks different _services_ together, which are the containers docker compose builds for you, which you can specify from an image off of dockerhub or a local Dockerfile from which to build the image.

All docker compose behavior is written in the `docker-compose.yml` file:

```yaml
version: "3"
services:
  web:
    build: . # build image from folder path to dockerfile
    ports:   # export and map port 3000
      - "${LOCAL_PORT}:${CONTAINER_PORT}"
    volumes:
      # mount everything in this folder into the container at /home/node/app path
      - .:/home/node/app
			# you need this to persist node modules
      - /home/node/app/node_modules
      
    links: # create network connection to the db container
      - db # db is dependency. Wait until it is built
      
		# define any environment variables
    environment:
      - MONGO_URI="mongodb://db:27017"
      - CONTAINER_PORT=3000
      - LOCAL_PORT=3000
  db:
    image: mongo:latest
    ports:
      - "27017:27017"
```

The `services` key specifies the different containers to build as subkeys. Here we are making a `web` container from our dockerfile and and a `db` container from the mongo image from dockerhub.

For each service, you can define the behavior of how to manage that container. Here are the most important keys

- `build` : the folder in which the `Dockerfile` is located. Use this if building a container from a dockerfile.
- `ports` : the port forwarding list, in port string form where it’s `"<local-port>:<container-port>"`
- `volumes` : any volumes you want to attach
- `image` : use this key to specify a dockerhub image to build from. You cannot use this if `build` is already specified.
- `links` : this key establishes network connections to other containers via docker neetworks. It also specifies dependency, meaning that the `web` container will not run until the `db` container builds first
- `environment` : defines any environment variables.
- `command`: overrides the `CMD` of the container. This should be an array of strings, each string representing a single word.

#### Reading environment variables

You can define key value pairs either from the `environment` key or get environment variables from an `.env` file with the `env_file` key. You can use both at the same time.

```yaml
services:
  app:
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/mydatabase
      - API_KEY=${MY_API_KEY} # Read from host environment variable
    env_file:              # Load environment variables from a file
      - .env
```

#### Volumes and bind mounts

You can specify volumes to use in docker compose, and the main advantage of docker compose with volumes is that you can create volumes on the fly, share volumes between services, and attach them easily.

Here are the three ways you refer to bind mount and volumes with docker compose:

- **Named Volumes**: `volume_name:/path/in/container`
- **Bind Mounts**: `/path/on/host:/path/in/container`
- **Bind Mount with Options**: `/path/on/host:/path/in/container:ro` (read-only)

```yml
services:
  db:
    volumes:
      - db_data:/var/lib/postgresql/data # Use a named volume
  app:
    volumes:
      - ./app:/usr/src/app              # Bind mount local source code
      - /var/log/app_logs:/app/logs     # Bind mount host directory for logs
```

#### `depends_on`

You can specify that a service needs another service to run before it before starting using the `depends_on` key. The main use case for this is a web app that needs the database to be up and running first.

```yaml
services:
  app:
    depends_on:
      - db
  web:
    depends_on:
      - app
```

#### restart policy

the `restart` key configures the container's restart policy, which controls the restarting behavior of a container after it gets killed. Here are the different values you can pass:

- `no`: Do not automatically restart.
- `on-failure`: Restart only if the container exits with a non-zero exit code.
- `always`: Always restart, even if the container exits cleanly.
- `unless-stopped`: Always restart unless the container is stopped manually.

```yaml
services:
  app:
	command: ["sh", "exit"]
    restart: unless-stopped
```

### Docker compose CLI

You run docker compose with `docker compose up`, which finds the yaml file and runs the specifications.

- The first time you run docker compose, the images will be built or fetched to create the containers, but after that those images are completely cached.
- To rebuild the images so you can get fresh containers, use the `--build` flag in `docker compose up --build` .

Here's the compose reference:

- `docker compose up`: builds and starts the containers
- `docker compose down`: stops all running containers
- `docker compose ps`: lists all containers belonging to the current compose project
- `docker compose logs`: shows the logs for all the running compose services

You also have commands to run individual services instead of doing all at once, a great use case for testing out services instead of doing the whole shebang.

- `docker compose run <service_name>`: runs the individual service
- `docker compose run <service_name> <command>`: runs the individual service and overrides the `CMD` with the specified command.
- `docker compose ps <service_name>`: provides detailed info about the specified service.

![](https://i.imgur.com/Hx2ay5g.png)

![](https://i.imgur.com/du6cBrf.png)

### Watch mode with docker compose

We can create a docker compose yaml file that has a new watch mode, specifying two actions to take with folderpaths or filepaths in our code:

- `sync`: uses bind mounts to make sure we don't have to rebuild our containers. Whatever folder we point to for syncing, it gets bind mounted.
- `rebuild`: whatever file(s) this action points to, it will rebuild the service automatically when those containers change.

And here are the steps we can take:

1. Have a `develop` key, which specifies what actions to take when certain files in your codebase changes, like rebuilding when the package json changes and then using volumes to sync changes for the rest of the front end code.
2. Run the `docker compose watch` command.

```yaml
# specify the version of docker-compose
version: "3.8"

# define the services/containers to be run
services:
  # define the frontend service
  # we can use any name for the service.
  frontend:
    # we use depends_on to specify that service depends on another service
    # in this case, we specify that the web depends on the api service
    build: .
    ports:
      - 5173:5173
    # specify the environment variables for the web service
    # these environment variables will be available inside the container
    environment:
      VITE_API_URL: <http://localhost:8000>
    # volumes:
    #   - .:/app
    #   - /app/node_modules
    command: npm run dev --host
    # this is for docker compose watch mode
    # anything mentioned under develop will be watched for changes by docker compose watch
    # and it will perform the action mentioned
    develop:
      # we specify the files to watch for changes
      watch:
        # it'll watch for changes in package.json and package-lock.json
        #cand rebuild the container if there are any changes
        - path: ./package.json
          action: rebuild
        - path: ./package-lock.json
          action: rebuild
          # needs target as well (container filesystem)
        - path: ./
          target: /app
          action: sync

```

### Compose examples

#### Server with postgres

The first step is to create the docker file for the server

```Dockerfile
FROM denoland/deno:2.3.3

# Prefer not to run as root.
USER deno

WORKDIR /app

COPY --chown=deno:deno deno.lock ./
# Copy the rest of the source files into the image.
COPY . .

# Run the application.
CMD ["deno", "run", "-A", "main.ts"]
```

The second step is to create the compose yaml:

- We fetch environment variables from the `.env` key, as specified by the `env_file` key. We read the `PORT` environment variable and use that in our port forwarding scheme to make the server accessible through localhost.
- We only start the server service once the `db` service starts, specified by `depends_on`
- We use secrets by specifying a  global `secrets` key, and creating a secret that reads from a text file. We then refer to the secrets we want to use specifically for the service through the service specific `secrets` key.
- We create volumes using the global `volumes` key, and then we can specify a `<volume>:<container-path>` mapping on the specific service `volumes` key.

```yaml
services:
  server:
    build:
      context: .
    # environment:
    #   - PORT=3000
    env_file:
      - .env
    ports:
      - "${PORT}:${PORT}"
    # The commented out section below is an example of how to define a PostgreSQL
    # database that your application can use. `depends_on` tells Docker Compose to
    # start the database before your application. The `db-data` volume persists the
    # database data between container restarts. The `db-password` secret is used
    # to set the database password. You must create `db/password.txt` and add
    # a password of your choosing to it before running `docker-compose up`.
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres
    restart: always
    user: postgres
    secrets:
      - db-password
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=example
      - POSTGRES_PASSWORD_FILE=/run/secrets/db-password
      - POSTGRES_USER=postgres
    expose:
      - 5432
    healthcheck:
      test: ["CMD", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5
volumes:
  db-data:
secrets:
  db-password:
    file: db/password.txt
```

The third step is to correctly access those environment variables through our code:

```ts
import postgres from "https://deno.land/x/postgresjs/mod.js";

// const constants = new Constants();

const sql = postgres({
  host: Deno.env.get("PGHOST") || "localhost",
  port: Deno.env.get("PGPORT") ? parseInt(Deno.env.get("PGPORT")!) : 5432,
  user: Deno.env.get("PGUSER") || "postgres",
  password: Deno.env.get("PGPASSWORD") || undefined,
  database: Deno.env.get("PGDATABASE") || "example",
});

await sql`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
)`;
```