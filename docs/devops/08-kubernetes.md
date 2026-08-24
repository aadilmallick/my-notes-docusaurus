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

`kubectl` is a CLI tool that lets you imperatively control cluster changes using CLI commands, but also lets you declaratively do it through YAML files like so:

```
kubectl apply -f <yaml-file>
```

You can create resources in kubernetes either imperatively or declaratively:

- **imperative:** running CLI commands to create k8 resources
- **declarative**: describing resources in YAML and then creating them with the `kubectl apply -f <yaml-file>` command to create a resource from its YAML description.

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

## Kubectl constructs

### Context

Contexts are a way to refer to the current kubernetes cluster you are running on. You can have a local cluster managed by Docker Desktop, or you can run on a remote cluster and create deployments there.

Here are the commands for the context:

- `kubectl config current-context`: gets the current context
- `kubectl config get-contexts`: lists all contexts
- `kubectl config use-context [contextName]`: set the current context to a different context
- `kubectl config use-context [contextName]`: delete the specifried contex
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

