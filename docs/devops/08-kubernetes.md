## Intro

### How kubernetes works

Kubernetes exists because when you're dealing with a container orchestration system where you orchestrate many containers among many different hosts, you have to deal with things like termination, graceful failover, and auto-scaling. Those things are extremely difficult to manually implement because there are so many things that can go wrong when creating your own auto-scaling microservice system between containers. 

Kubernetes fixes exactly that problem, where you declaratively describe the containers and how they should connect to each other and then it just deploys them and does all the scaling up and graceful failover for you. 

Here is what K8S does in the happy path

1. an API request to the K8S cluster arrives at the **master control plane**
2. The master control plane orchestrates the request to be forwarded to a certain node (container host) in the cluster.
3. The individual container host forwards the request to the individual container or containers via load balancing, and the container handles that request.

Here is how K8S orchestrates node failure and recovery

1. The master control plane decides what is the desired state for the cluster
2. The master scheduler is continuously monitoring for failures and scaling requests to process them and notifies the master control plane if there are any changes that must be made to achieve the desired state.

### Terminology

- **node** : a single virtual machine that can deploy and run multiple pods and replicas of those pods. Think of docker desktop being a node.
    - **worker node:** A specific type of node whose sole purpose is to run pods. It can be local (docker desktop) or remote (EC2 instance)
    - **master node:** A single node that is also called the control plane, used to manage all worker nodes.
- **pod**: a system that manages and runs multiple containers, all running on the same IP address. You can think of a pod as a single server that runs each container inside it on a different port. Pods can have replicas, which is where scaling and availability comes into play
- **cluster:** A cluster is a control plane and the worker node(s) it manages. All the scaling up and down of resources happens in the context of a cluster.
- **control plane:** The control plane manages all worker nodes, scaling them up or down. It has 5 components to it:
    - **API server:** a server that uses the **kubelet** tool to communicate with the worker nodes in a cluster.
    - **Scheduler:** used for managing pods and assigning them to run in available nodes.
    - **kube controller manager**: manages worker nodes and ensures that the correct number of pods are being deployed.
    - **cloud controller manager**: just the kube controller manager but retrofitted for each individual cloud provider. Your cloud provider will take care of providing this component.
    - **etcd:** key value store for storing the cluster start

When deploying Kubernetes apps, you deploy a single cluster, which is made from many nodes that can be scaled horizontally to adapt to server traffic. Kubernetes deploys **nodes**, which you can think of as each node being a single virtual machine, and in each node you can have multiple **pods**, where a pod can run multiple containers at once together.

To avoid everything crashing when a single pod in a node fails, you can establish **replica sets** that create several copies of the same pod in order to replace a pod without the system crashing.

### Minikube and Kubectl Setup

Minikube allows you to run a kubernetes cluster on your local computer for practice.

1. Install on WSL


```bash
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64
```

2. Install `kubectl`

```bash
brew install kubectl
kubectl version --client
```

3. Start a cluster with minikube

```bash
minikube start
```

3. View cluster info using `kubectl`

```bash
kubectl cluster-info # view cluster info
kubectl get nodes # view nodes
kubectl get namespaces # view namespaces
kubectl get pods -A # view pods from all namespaces
kubectl get services -A # get all services
```



### `kubectl` basics

#### Declarative vs imperative

You can create resources in kubernetes either imperatively or declaratively:

- **imperative:** running CLI commands to create k8 resources
	-  When you hear about creating resources imperatively, that means using kubectl CLI to create resources
- **declarative**: describing resources in YAML and then creating them with the `kubectl apply -f <yaml-file>` command to create a resource from its YAML description.
	- when you hear about declarative, that means describing resources in yaml files and then using two basic commands to manage their creation and deletion.

Once you describe the outline for a resource in a yaml file, you have these two basic commands to bring them into and out of existence:

- `kubectl apply -f <yaml-file>` : creates the resource from the specified yaml file
- `kubectl delete -f <yaml-file>` : deletes the resource that was created from the yaml specification.

#### Imperative: CLI

The CLI for kubernetes is based on CRUD functionality for deployments, services, namespaces, and pods, making using the CLI extremely predictable. It always follows this syntax:

```bash
kubectl CRUD_METHOD RESOURCE
```

<aside>

Often, you will want to tie resources to a namespace with the `-n` option.

</aside>

The crud methods are as follows:

- CREATE: the `apply` keyword creates a deployment or service
- READ: the `describe` keyword inspects a single resource, or use `get` to list many resources.
- DELETE: the `delete` keyword deletes a resource

> [!NOTE]
> You can get a bird’s eye view of everything running with the `kubectl get all` command.

### Kubectl Config

the`~/.kube/config` file:

### Kustomize

The kustomize tool is a way to combine multiple yaml files describing k8s resources into one so you don’t have to think about individual resources. You simply deploy one kustomize file, and to delete all resources, you simply delete that kustomize file.

You can create a **kustomization** file which must be named `kustomization.yaml` like so, specifying the resources you want to include:


```yaml title="kustomization.yaml"
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: health-dashboard
resources:
  # - secrets.yaml
  # - hsd-namespace.yaml
  - mongo-deployment.yaml
  - server-deployment.yaml
```

Here are the general steps for integrating `kustomize` into your workflow:

1. Run the `kustomize <dir>` command, which looks for a `kustomization.yaml` file in the directory, and if found, outputs the contents of all the yaml files concatenated.
2. Pipe the output of the `kustomize` command into a file.
3. Run that file manually with `kubectl apply -f` to create resources, and to delete resources, use `kubectl delete -f`


You can also just do it the declarative way where by naming the file as `kustomization.yaml` and then using the `-k` option with `kubectl apply`:

- `kubectl apply -k <dir>`: Looks in the specified directory for a `kustomization.yaml`, and if found, creates or updates all k8s resources specified in that file.
- `kubectl delete -k <dir>`: Looks in the specified directory for a `kustomization.yaml`, and if found, deletes all k8s resources specified in that file.

#### Best folder structure for `kustomize`


## Kubectl constructs




### Context

Contexts are a way to refer to the current kubernetes cluster you are running on. You can have a local cluster managed by Docker Desktop, or you can run on a remote cluster and create deployments there.

Here are the commands for the context:

- `kubectl config current-context`: gets the current context
- `kubectl config get-contexts`: lists all contexts
- `kubectl config use-context [contextName]`: set the current context to a different context
- `kubectl config use-context [contextName]`: delete the specified context
### Namespaces

Kubernetes namespaces let you organize and isolate your workloads.

Here is an example YAML resource of a namespace we create that will be named `development`.

```yaml
---
apiVersion: v1
kind: Namespace
	metadata:
		name: development
```

### Nodes

Nodes are individual VMs that run multiple pods at once. Nodes are scaled up and down by the control plane, as you wish. On your local machine, docker desktop provides you only with a single node.

When a node is added to the cluster, these three tools are installed, which are necessary to run pods:

- **kubelet:** manages the pods’ lifecycles
- **container runtime**: supports docker to create and run containers
- **kube-proxy**: manages network traffic

- `kubectl get nodes` : gets all nodes
- `kubectl describe node <nodename>` : describes the node

### Labels and selectors

Labels and selectors within kubernetes are ways to reference resources and even assign them to specific nodes.

We can target resources using the `--selector` option or the `--label` option

```bash
kubectl get pods --selector=myapp
```


#### Labels

On any resource yaml, you define the labels as key-value pairs under the `labels` key like so:

1. Create a label of `app` with value `myapp`
2. Create a label of `type` with value `front-end`

![](https://i.imgur.com/7gEEmHN.jpeg)

#### Selectors

Here are the different selector keys you can have on a resource:

- `selector`: selects a pod based on the label and value pair, searching across all current pod instances to do so.
- `nodeSelector` : selects a node based on the label and value pair, searching across all current node instances to do so.


![](https://i.imgur.com/SpPoH4i.jpeg)



1. We set a label of `disktype=superfast` on Node A
2. When we want to select a node to assign the pod to using the `nodeSelector` key, we select on the `disktype` label and select the node with the value of that `disktype` label being equal to `superfast`, thus selecting Node A.




## Tilt

### Intro

Tilt is a program that simplifies k8 development on your local machine. It provides benefits such as restarting deployments, rebuilding containers, doing everything automatically in watch mode, and much more.

Install tilt like so:

```bash
curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
```


- `tilt version`: prints the version of tilt
- `tilt up`: runs the `TiltFile` file in the current directory, running all the k8 resources you specify in the tiltfile.
- `tilt down`: deletes all the deployments and resources you created when running `tilt up`.

### Basics

A TiltFile code is run in Starlark, which is a simplified dialect of python. It looks like this: 


![](https://i.imgur.com/uYZdEdN.jpeg)

```python
# 1. specify which contexts to allow
allow_k8s_contexts([
  'docker-desktop',
]);

# 2. specify which context to set as current context
k8s_context("docker-desktop")

# 3. builds an image
docker_build(
        "health-dashboard-server",  # tag name
        context="server",  # cwd to run `docker build` in
        
        # dockerfile contents
        dockerfile_contents=""" 
        ARG NODE_VERSION=24.0.2

        ######################################
        # Use node image for base image for all stages.
        FROM node:${NODE_VERSION}-alpine

        # install bash
        RUN apk add --no-cache bash

        # Set working directory for all build stages.
        RUN mkdir -p /usr/src/app
        RUN chown -R node:node /usr/src/app
        USER node
        WORKDIR /usr/src/app


        COPY --chown=node:node package.json ./
        COPY --chown=node:node package-lock.json ./

        RUN npm install

        COPY --chown=node:node . ./

        RUN npm run build

        CMD ["npm", "start"]
        """
)

# runs the k8s yaml files declaratively
k8s_yaml("kustomize/base/local/mongo-deployment.yaml")
k8s_yaml("kustomize/base/local/server-deployment.yaml")
```

Here are functions concerned with the context:

- `allow_k8s_contexts(contexts: [str])`: Allows the specified list of context names to be used as valid contexts for running the kubernetes resources.
- `k8s_context(context: str)`: specify which context to set as current context

And here are other functions:

- `docker_build(image_name: str, **kwargs)` : Builds the image with the image name based on either dockerfile contents you provide or the path to the dockerfile.
- `k8s_yaml(yaml_path : str)` : runs the k8s resource specified in the yaml filepath. It’s basically just calling `kubectl apply -f <yaml-file>`, and it watches for changes to that file.

### Examples

#### Watching files

```python
env_path = "./server/.env"


allow_k8s_contexts([
  'docker-desktop',
  'test-janelia',
])

k8s_context("docker-desktop")

run("export IN_DEV_MODE=true")

# whenever file at env_path changes, run command
local_resource(
    name="env-file",
    cmd="bash scripts/tasks/initk8resources.sh",
    deps=[env_path]
)
watch_file(env_path)

docker_build(
        "health-dashboard-server", 
        context="server", 
        dockerfile="server/Dockerfile.prod",
)

# use kustomize to combine multiple YAML files into one.
combined_yaml_file = kustomize(
  "kustomize/overlay/local",
)

# run kubectl apply -f on the kustomize file
k8s_yaml(combined_yaml_file)

# define port forwarding for a service
k8s_resource(
  workload="health-dashboard-server-deployment",
  port_forwards="30000:3000"
)

k8s_resource(
  workload="mongodb",
  port_forwards="31017:27017"
)
```

- `run(command: str)`: lets you run a linux command that will persist in the shell session.