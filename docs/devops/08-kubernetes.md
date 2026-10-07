## Intro

### The history of application deployments

- **1990s and 2000s - single physical host**: in the early days people used to hire a sysadmin to take the application code from the developers and then upload it to a physical host machine they owned. 
	- Since there was no virtualization back then, the server could only run one single server-facing process so you had one tiny application running on a physical server that probably cost $20,000. 
	- It was a complete waste of resources and very time-consuming. 
- **2000s - 2013 - VMs**: with the innovation of virtualization came virtual machines, which allowed you to run multiple guest operating systems on one single physical host server. This meant you could take advantage of all the CPU and resources of a single giant host machine and also deploy more applications (since each VM was secured in its own way to prevent application memory in one VM leaking over to another VM)
- **2013 - now (containers)**: containers are sort of like virtual machines except they don't need a guest operating system or a hypervisor to run their code, making it very lightweight since they just use the underlying container engine operating system, like Docker desktop on Mac, Windows, or Linux.
	- Containers allow for creating lightweight microservices, and are more lightweight than VMs.

> [!NOTE]
> The combination of distributed computing systems and packing containers on a host makes for the most efficient use of computer CPU and memory. 

Because containers are the most efficient way to use a computer's CPU and memory, it's the de facto way to deploy microservices today. 


### Why Kubernetes

Before Docker Swarm, Docker was only able to deploy and manage containers on one server at a time.

Kubernetes is a good container orchestration tool, that's why.

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
    - **Cloud Controller Manager**: Connects a Kubernetes cluster to a cloud provider's API, managing cloud-specific resources and ensuring proper integration with the underlying infrastructure
	- **etcd**: A key-value store that saves all data about the state of the cluster; only the kube-apiserver can communicate directly with etcd
	- **kube-apiserver**: The kube-apiserver is a key component of Kubernetes that exposes the Kubernetes API, handles most requests, and manages interactions with the cluster by processing and validating API requests, making it essential for the cluster's operation
	- **kube-controller-manager**: Monitors the Kubernetes cluster's state, running processes to ensure the current state matches the desired state
	- **kube-scheduler**: Identifies a newly created pod that has not been assigned a worker node and assigns it to a specific node

> [!NOTE]
> K8S in a nutshell
> ***
> When deploying Kubernetes apps, you deploy a single cluster, which is made from many nodes that can be scaled horizontally to adapt to server traffic. 
> 
> Kubernetes deploys **nodes**, which you can think of as each node being a single virtual machine, and in each node you can have multiple **pods**, where a pod can run multiple containers at once together.


### K8S architecture

The control plane is what handles the orchestration of pods across worker nodes and other things like networking between nodes.





#### The control plane

Think of the Kubernetes control plane as kind of an air traffic controller that determines and directs where pods are created on different worker nodes. 


![](https://i.imgur.com/CuBhJQ1.jpeg)

Here are the different control plane components:

- **API server:** a server that exposes a REST API to control K8S resources
- **etcd**: Highly-available key value store that lives in the control plane to store all data about the current state of the cluster.
- **kube scheduler**: runs in a loop, identifies newly created pods which have not been assigned a worker node and then assigns them a node for the pod to run on.
- **kube controller manager**: manages worker nodes and ensures that they are up and running and deploys self-healing operations to keep them up.
- **cloud controller manager**: just the kube controller manager but retrofitted for each individual cloud provider so you can use kubernetes on cloud infrastructure. Your cloud provider will take care of providing this component.

> [!NOTE]
> Think of the API server as the only component that's actually doing any action, while the other components (like the cube scheduler and the cube controller manager) all they do is watch for changes and intelligently request the API server to create resources and allocate them to specific nodes. 

All components of the control plane run as containerized pods within the cluster, which live in the `kube-system` built-in namespace.

You can see all control plane components running as pods with this command:

```bash
kubectl -n kube-system get pods
```

##### API server

All K8S resources like pods, deployments, and horizontal pod autoscaler have API endpoints.

The **API server** component on K8S exposes a REST API interface to control all of these resources, and CLI tools like `kubectl` use the API server REST API under the hood to control k8s resources via HTTP requests.

To see all the K8S resources that have available API endpoints to control their provisioning, run this command:

```bash
kubectl api-resources
```

##### etcd

Highly-available key value store that lives in the control plane to store all data about the current state of the cluster.

> [!NOTE]
> Only the Kube API server can communicate directly with etcd.

##### Kube controller manager

A component that runs in a loop and continuously checks the status of the cluster to see what the desired state is, to make sure things are running properly.

For example if a worker node gets broken, then through its continuous checks it will see that and then queue up an operation to replace the broken worker node with a newly working one. 

##### Cloud controller manager

This component offers a provider-agnostic way to connect your cluster to a cloud provider like AWS, GCP, or any other platform that supports kubernetes
#### worker nodes

All K8S clusters run with a minimum of three worker nodes to be highly available.

Each worker node has three components:

1. **kubelet**: this is an agent that runs on every worker node and it makes sure that containers in a pod are running and healthy. It communicates directly with the API server component in the control plane to monitor newly created pods.
2. **container runtime**: Once kubelet verifies a new pod is ready to go, it builds and starts the containers in the pod spec using the **Container runtime interface** (CRI), which enables the Kubelet to create containers with supported container engines.
	- Pulls container images, creates and manages containers, and ensures they run properly and securely as directed by the Kubernetes control plane
3. **kube proxy**: offers a proxy between pods and services running in a worker node to the API server in the control plane so that pods and services within the same cluster can communicate with each other.
	- A network proxy that runs on each node in a Kubernetes cluster, maintaining network rules and enabling communication between pods and services within the node and the control plane, while also communicating directly with the kube-apiserver
##### Kubelet

Kubelet is an agent that runs on each node in a Kubernetes cluster, ensuring containers in a pod are running and healthy while communicating with the API server in the control plane to maintain the desired state of the node.


##### Container Runtime

The container runtime uses a container engine to run containers within a pod, and the kubelet communicates with the CRI (container runtime interface) to control the container runtime and request container management operations to be executed.

##### Kube proxy

The kube-proxy component is a network proxy on each node. It maintains network rules to allow communication to your pods, which is the basis of the service resource in Kubernetes. 


#### Core objects

- **Pod**: a pod is the smallest and most fundamental deployable unit, which represents a single instance of a running process. 
	- A pod encapsulates one or more tightly coupled containers that share storage and network resources. 
	- The most common pattern is one container per pod.
- **replica set**: its purpose is to ensure that a specified number of identical pods, called replicas, are running at any given time. 
- **deployment**: a deployment is an abstraction over replica sets, making it a higher-level object that manages replica sets and their life cycles:
	- Provides declarative updates to pods
	- Handles rolling updates and rollbacks
	- Deployments are the standard way to manage stateless applications. 
- **service**: a service provides a stable endpoint to access a logical set of pods, which means it can target pods via a label or selector and then provide a stable DNS name that they can refer to statically without the fragility of IP addresses changing. 
	- Since pods are ephemeral and their IP addresses change, we use services to provide a stable endpoint to forward traffic to those pods. 
	- Services provide a stable virtual IP address called a cluster IP and also a DNS name that is static and unchanging. 
	- Traffic to a service is automatically load-balanced to the backend pods. 
- **namespace**: namespaces provide a mechanism for isolating groups of resources within a single cluster. 
	- They are a way to divide cluster resources between multiple namespaces, ensuring that resource names must be unique within a namespace but not across them because resources are always sectioned into the namespace that they are in 


#### The full flow


![](https://i.imgur.com/MFLuZ0x.jpeg)

1. **create kubernetes resources**: You either imperatively or declaratively, create Kubernetes resources, which then make a request to the API server component in the control plane. 
2. **save state**: the API server receives the request, creates the resources, and saves the new state of the cluster in etcd. 
3. **controller-manager checks for changes**: the controller manager component continuously checks for changes to see if it should add a new worker node.
4. **scheduler gets triggered**: because a new deployment was created the scheduler gets triggered and pings the API server to ask if there are any unassigned, newly created pods.
5. **API server notifies scheduler**: the API server notifies the scheduler that there are newly created unassigned pods.
6. **scheduler chooses node for a pod**: the scheduler chooses a node for the pod and sends its request to the API server to place the newly created pods within those specific nodes.
7. **API server saves state**: API server saves state of cluster in etcd
8. **kubelet in worker node checks for newly assigned pod**: kubelet inside the worker node that got the newly created pod assigned to it wakes up and pings API server to receive the pod spec.
9. **API server sends pod spec**: the API server sends the pod spec to kubelet in the worker node.
10. **kubelet triggers container runtime**: Kubelet receives the pod spec, triggers container runtime to create container and start it
11. **kubelet monitors pod status and sends to API server**
12. **API server saves state to etcd**

#### Built-in namespaces

In a K8S cluster you have several namespaces that come built-in default to k8s, which contain important resources used to control the cluster:

- `kube-system`: contains pods of the control plane.

## Minikube basics

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

### Minikube management

- `minikube start`: creates a local cluster you can use
- `minikube tunnel`: proxies internet traffic from your locally running minikube cluster to your local machine on `localhost`, making services able to run on `localhost`.
- `minikube delete`: deletes the cluster.

#### starting and deleting clusters

You can start a cluster with the `minikube start` command or even name your cluster with the `-p` flag like so to easily identify it later:

```bash
minikube start -p [clusterName]
```

You can delete the default cluster with the `minikube delete` command or delete a specific named cluster via the `-p` flag:

```bash
minikube delete -p [clusterName]
```
## `kubectl` basics

### Declarative vs imperative

You can create resources in kubernetes either imperatively or declaratively:

- **imperative:** running CLI commands to create k8 resources
- **declarative**: describing resources in YAML and then creating them with the `kubectl apply -f <yaml-file>` command to create a resource from its YAML description.


> [!NOTE]
> **Declarative vs Imperative**
> ***
> - **imperative**: using kubectl CLI to create resources
> - **declarative**: configuring resources in yaml files and then using two basic commands to manage their creation and deletion.


#### Declarative: YAML

When using K8S declaratively, you create **manifest** YAML files that have the **spec** for describing how a resource should be created:



![](https://i.imgur.com/kZgj3Ia.jpeg)


Once you describe the outline for a resource in a yaml file, you have these two basic commands to bring them into and out of existence:

- `kubectl apply -f <yaml-file>` : creates the resource from the specified yaml file by making a request to the API server
- `kubectl delete -f <yaml-file>` : deletes the resource that was created from the yaml specification a request to the API server



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

### kubectl YAML basics

All k8s YAML files must have these two keys:

- `apiVersion`: should be set to v1
- `kind`: the type of resource this YAML is

Basides that, you have these rules:

- **can have multiple resources in one YAML**: it's possible to have multiple resources defined in one YAML by separating the resources with a `---` fence.

### Kubectl Config

The `~/.kube/config` file contains configuration about all the k8s clusters and contexts available that you can connect to:


```yaml
# metadata defining config file
apiVersion: v1
kind: Config

# metadata that applies to currently connected cluster
current-context: docker-desktop
preferences: {}

# lists all clusters
clusters:
- cluster:
    certificate-authority-data: some-bullshit
    server: https://127.0.0.1:6443
  name: docker-desktop
- cluster:
    server: https://rancher-test.hhmi.org/k8s/clusters/c-m-bf8pt7pg
  name: test-janelia
  
# lists all contexts
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
- context:
    cluster: test-janelia
    user: test-janelia
  name: test-janelia

# lists all the users
users:
- name: docker-desktop
  user:
    client-certificate-data: some-bullshit
    client-key-data: some-bullshit
- name: test-janelia
  user:
    token: some-bullshit

```



## Networking in Kubernetes basics

### Intro

You can consider a Kubernetes cluster as its own LAN network with private IP addresses that it assigns to pods, services, and nodes. 

Kubernetes networking model has four main requirements:

1. **intra-pod communication**: Containers must be able to communicate with other containers in the same pod. 
	- Achieved by creating a docker network within the pod
2. **inter-pod communication**: Pods must be able to communicate with other pods, whether within the same node or in different nodes.
	- Achieved by giving each pod within a node its own private IP address
3. **intra-cluster communication**: Pods must be able to communicate with services. 
4. **internet communication**: There must be a way for traffic from the internet to communicate with services inside a Kubernetes cluster. 

Since a node represents a physical machine, you can think of a node as a subnet within an LAN and a cluster, which consists of many nodes, as the LAN itself. Here are the analogies:

- **cluster**: consider this like a LAN with its cluster IP being a default gateway being some private IP address, but via a local cloud controller manager like `minikube`, we can make the default gateway's public IP address forwarding to `127.0.0.1`.
- **node**: consider this as a subnet, where a node has its own private IP address that the cluster can connect to, but clusters can't connect to the pods within the nodes.
- **pod**: consider this as an individual machine within a subnet, having its own private IP address within th enode.

The first three requirements are satisfied by different cluster components assigning IP addresses to pods, nodes, and services:

- **How CNIs solve inter-pod communication within the same node**: CNIs (cloud network interfaces) assign unique private IP addresses to pods so that they can communicate with each other in the same node, satisfying inter-pod communication.
- **How kubeapi solves intra-cluster communication**: the kubeapi component assigns services unique, private IP addresses
- **How kube controller manager solves inter-pod communication**: The kubcontroller manager component in the control plane assigns unique, private IP addresses the node.

#### Inter-pod communication

Kubernetes is designed so that every pod can communicate with every other pod by default, regardless of which node they are running on. This is achieved through its default flat networking model, which has several key principles:

All pods and nodes are assigned unique IP addresses within a single, flat network. This means there is no need for Network Address Translation (NAT) between pods, and each pod’s IP is visible to all other pods.

This leads to three core consequences:
    
1. **Pod-to-Pod Communication**: The network is set up so that any pod can reach any other pod directly using its IP address. This is handled by Kubernetes networking plugins (like Kubenet or Azure CNI), which manage routing and ensure connectivity across nodes.
    
2. **No NAT Between Pods**: Since all pods are on the same network, there’s no translation of addresses. The IP a pod sees itself as is the same IP others use to reach it.
    
3. **Node-to-Pod Communication**: Nodes can also communicate with any pod, and vice versa, without NAT.

> [!NOTE]
> Pods can have one or more containers, but all containers in a pod share the same network namespace (same IP and ports).

#### Intra-pod communication

Multi-container pods have inter-container communication within a pod very trivially through communication via localhost.

Containers within a multi-container pod can communicate with each other through localhost targeting the exposed ports of each container, since Containers only run on ports, and the pod is what has the IP address.
### CNI and CNI plugins

**CNI plugins** in Kubernetes are software packages that set up and manage the cluster's network. They create a private network that allows containers within the same pod to communicate, pods to talk to each other, pods to connect with services, and external traffic to reach services inside the cluster. 

Essentially, CNIs assign unique IP addresses to pods and ensure smooth network communication within Kubernetes. 

> [!NOTE]
> This pluggable design lets Kubernetes support different networking solutions depending on the cluster's needs.

Because CNIs are so pluggable and only have to implement the 4 requirements of the Kubernetes Network Model, there are many third party CNI providers.

> [!NOTE]
> All CNIs must implement the 4 parts of the Kubernetes Network Model, but some CNIs add additional features.

#### Calico CNI plugin

1. Delete any previous clusters you have

```
minikube delete
```

2. Recreate the minikube cluster with the CNI set to calico:

```bash
minikube start --network-plugin=cni --cni=calico
```

### Network policies

A network policy in K8S is a set of rules that allow you to control traffic flow at the IP address or port level for a pod, basically like a stateless firewall for a pod.

> [!NOTE]
>  By default, all pods can freely communicate, but network policies let you restrict this traffic to enforce security principles like least privilege and zero trust.

When no network policy is in place, all pods within the same node are able to communicate with each other via inter-pod communication and if services are live, intra-cluster communication as well, without any filtering or checking. This violates the principle of least privilege and zero trust.=

To use network policies, your cluster must have a CNI plugin that supports them, such as Calico

**How network policies work**

They specify whether to allow or deny ingress (incoming) or egress (outgoing) traffic based on pod selectors, namespaces, IP addresses, and ports.

When defining a network policy for a pod, for each firewall rule you need to define two components:

- **ingress or egress**: whether the traffic type the rule applies to is ingress traffic or egress traffic.
- **allow or deny**: whether to allow to deny the traffic of the specific network type.

#### **creating network policies**

There is a special `NetworkPolicy` resource in K8S that allows you to define a network policy for a pod or for multiple pods via the `spec.podSelector` object:

**ingress example**

For example, what the below network policy is saying is that for the pod with selector `app: echo-server`, only allow ingress traffic to that pod from the pod with selector `app: learning-resources` and on port 80.

```yaml
---
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-from-learning-resources
spec:
  podSelector:
    matchLabels:
      app: echo-server
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: learning-resources
      ports:
        - port: 80
```

**egress example**

The example below allows egress traffic from the pod with selector `app: frontend-ui` to the subnet `172.11.0.0/20`, which is probably a node and all the pods within it.

```yaml
---
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-egress
  namespace: frontend
spec:
  podSelector:
    matchLabels:
      app: frontend-ui
  egress:
    - to:
        - ipBlock:
            cidr: 172.11.0.0/20
```
#### Deny-all policy

This deny all policy basically blocks all traffic from one pod to another pod:

```yaml
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

#### Fetching network policies


### Ingress for cluster

By default, pods can only respond to requests that come from other pods within the same cluster, meaning that by default, the highest amount of networking power is **intra-cluster communication**.

If you want external internet traffic to be able to request resources in your cluster like pods via a DNS or IP address, then you need to add **ingress** to the cluster.

We do that by adding an **Ingress** and an **Ingress controller** K8S object:

- **Ingress**: A Kubernetes ingress object is a resource that defines rules for routing external HTTP or HTTPS traffic to services within your cluster. It essentially specifies how requests should be directed based on hostnames or paths.
- **Ingress Controller**: The ingress controller, on the other hand, is the software that enforces these rules. It acts as a reverse proxy and load balancer, receiving incoming traffic and routing it according to the ingress object’s rules. 

> [!NOTE]
> While ingress objects are built into Kubernetes, ingress controllers are separate, pluggable components that you need to install (like Ingress-Nginx or Traefik).

> [!NOTE]
> So, the ingress object sets the rules, and the ingress controller makes those rules happen by managing the traffic flow into your cluster.

Here's how an ingress request to your cluster works:

1. An external HTTP request sends ingress traffic to a cluster IP address the **Ingress** object made.
2. The ingress object sends that traffic to the ingress controller.
3. The ingress controller checks the list of rules that you set up on your ingress, and routes traffic to the appropriate pod.

#### Creating an ingress and ingress controller

The `Ingress` object in kubernetes allows you to define the ingress rules as well as the specific third-party ingress controller to use for the reverse proxy functionality of the ingress controller.

1. Use the NGINX ingress controller
2. Define the available DNS host for ingress as `lil-microservices.com`
3. On HTTP requests, accept all `/*` matching routes and redirect that to the `frontend-ui` service.

```yaml
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  rules:
    - host: lil-microservices.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-ui
                port:
                  number: 8080
```

### Service meshes

A service mesh in Kubernetes is software you install in your cluster that manages all internal service-to-service communication. 

- It handles service discovery, encrypts traffic between pods for security, and provides authentication and authorization options. 
- Additionally, it offers observability tools to monitor the health of your microservices.

While it simplifies managing complex microservices architectures by taking over network management tasks, it also introduces a new system you need to learn and manage. 

Popular service meshes include Istio, Linkerd, and HashiCorp Consul. 

## Kubectl constructs




### Context

Contexts are a way to refer to the current kubernetes cluster you are running on. You can have a local cluster managed by Docker Desktop, or you can run on a remote cluster and create deployments there.

Here are the commands for the context:

- `kubectl config current-context`: gets the current context
- `kubectl config get-contexts`: lists all contexts
- `kubectl config use-context [contextName]`: set the current context to a different context
- `kubectl config use-context [contextName]`: delete the specified context
### Namespaces

Kubernetes namespaces let you organize and isolate your workloads and also offers granular RBAC for accessing resources scoped to a namespace.

> [!NOTE]
> Once belonging to a namespace, if the namespace gets deleted, all resources belonging to that namespace also get deleted, which is good for cleanup purposes.

Using namespaces in Kubernetes offers several benefits:

1. Organization: Namespaces help organize resources by grouping related pods, services, and other objects together. This makes it easier to manage and locate resources, especially in large clusters.
    
2. Conflict Reduction: Namespaces prevent naming conflicts. Resources only need to have unique names within their own namespace, not across the entire cluster. This is useful when multiple teams or projects use the same cluster.
    
3. Access Control: Namespaces allow you to apply role-based access control (RBAC) to restrict user access to specific resources within a namespace, improving security and management.
    
4. Environment Separation: You can use namespaces to separate environments (like development, testing, and production) within the same cluster, reducing the risk of accidental interference.
    
5. Easier Management: With namespaces, you can list, monitor, and manage resources for a specific team or application without affecting others.
#### Creating namespaces

Here is the declarative way to create a namespace

1. Create the YAML to make a namespace called "development"

```yaml title="namespace-development.yaml"
---
apiVersion: v1
kind: Namespace
	metadata:
		name: development
```

2. Apply the YAML to make it a live k8s resource:

```bash
kubectl apply -f namespace-development.yaml
```

#### Namespace management

The `namespace` resource (shorthand `ns`) is used for controlling namespaces via CLI

- `kubectl create namespace <namespace-name>`: creates a namespace
- `kubectl delete namespace <namespace-name>`: deletes a namespace
- `kubectl get namespaces` : returns all namespaces in the current context


![](https://i.imgur.com/GG9W8l3.jpeg)


#### Tying resources to a namespace

You can tie resources to namespaces in two different ways:

- **imperatively:** Use the `-n <namespace-name>` option to refer to a namespace. Without the `-n` option, all the commands for creating resources will be run in the default namespace.
- **declaratively:** After creating a namespace either declaratively (with yaml) or imperatively (with CLI), you can specify that namespace in other yaml files’ `metadata` key like the example below to tie resources to a namespace. 
	- Otherwise, those resources will be created in the default namespace.


![](https://i.imgur.com/bMww1br.jpeg)

The default namespace is named `default` by default, but you can change that.

If you’re tired of using `-n` all the time, you can change the default namespace for the current context, like so:

```bash
kubectl config set-context --current --namespace <namespace-name>
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


## K8S Resources

### Pods


Pods are a shell around a grouping of containers, essentially a single server with a single IP address that runs each container inside the pod on its dedicated port. Here are the advantages of working with pods:

- **shared data:** All pods in a container can access the same volumes
- **shared network**: All pods in a container live on the same server and thus the same network, allowing for simple inter-container communication without having their traffic be exposed to the real world.
- **replicable**: pods are the main scalable unit in kubernetes, allowing you to deploy multiple copies of the same pod and run them on a worker node.

Pods can be in one of 6 lifecycle states:

- **pending**: pending for creation
- **running**: running within a node
- **succeeded**: ran and exited with status 0
- **failed**: all containers within the pod exit and at least one exited with a non-zero exit status code.
- **unknown**
- **CrashLoopBackOff**: started, crashed, again and again.

#### Declarative POD YAML

A pod resource is declared in yaml through the `Pod` kind of resource. 

##### **specifying container behavior**

The main key to specify when creating a pod resource is the `containers` key, where you specify all the containers that will run in a pod. Here are the options in each container:

- `image`: the image to build the container from. By default, it pulls from dockerhub or any other external registry, but if you want to build a container from your local image, you need to also include the `imagePullPolicy: never` key.
- `imagePullPolicy`: describes the pulling behavior of images. You can supply these values:
    - `always` : always pull the image from an external registry, always pulling on pod creation.
    - `never`: pull the image from your local images only.
    - `IfNotPresent`: pull the image only if you don't have it
- `ports` : runs the container on the specified port. You have these keys to supply:
    - `containerPort`: required, the port number to run the container on.
    - `protocol` : the layer 4 protocol to run on, TCP or UDP
    - `name`: the layer 7 protocol, like http, https, etc.
- `command` : a string array of the split string command to override the main container’s entrypoint. Useful for debugging.
- `env` : provides key value pairs of environment variables to load into the container.


```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
    type: front-end
spec:
  containers:
  - name: nginx-container
    image: nginx
    ports:
    - containerPort: 80
      name: http
      protocol: TCP
    env:
    - name: DBCON
      value: connectionstring
    command: ["/bin/sh", "-c"]
    args: ["echo ${DBCON}"]
```


##### **compute request**

You can specify the amount of compute (memory and CPU) a container within a pod gets under the `spec.containers.resources` key, specifying both **requests** and **resources**

- `spec.containers.resources.requests`: the requests for the minimum amount of compute that should be available for use.
- `spec.containers.resources.limits`: the requests for the maximum amount of compute that a container can use up.

For both 

```yaml
--- 
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
    type: front-end
spec:
  containers:
  - name: pod-info-container
	image: kimschles/pod-info-app:latest
	resources:
	  requests:
		memory: "64Mi"
		cpu: "250m"
	  limits:
		memory: "128Mi"
		cpu: "500m"
	securityContext:
	  allowPrivilegeEscalation: false
	  runAsNonRoot: true
	  capabilities:
		drop:
		  - ALL
	  readOnlyRootFilesystem: true
	ports:
	- containerPort: 3000
	env:
	  - name: POD_NAME
		valueFrom:
		  fieldRef:
			fieldPath: metadata.name
	  - name: POD_NAMESPACE
		valueFrom:
		  fieldRef:
			fieldPath: metadata.namespace
	  - name: POD_IP
		valueFrom:
		  fieldRef:
			fieldPath: status.podIP
```

#### Multi-container pods

A pod can deploy multiple containers, which has the main advantage of letting all containers within that pod access the same shared resources like if they were on the same physical machine, leading to two key benefits:

- **intra-pod communication:** containers within the same pod can communicate with each other through localhost.
	- Each pod runs on its own individual IP address, and thus each container in a pod runs on a separate process and thus separate port. 
- **shared volumes:** Volumes are declared at the pod level, thus containers within the same pod can share volumes.



> [!NOTE]
> Containers in the same pod are processes running on the same IP address and can communicate with each other through `localhost`, therefore.




![](https://i.imgur.com/zg4JlR2.jpeg)


For example, this would be the mongo URI to use when dealing with a multi-container setup with an express app in one container and a mongodb database running on port 27017 in another container:

```bash
PORT=3000
MONGO_INITDB_ROOT_USERNAME=mongo
MONGO_INITDB_ROOT_PASSWORD=mongo
MONGO_INITDB_DATABASE=db
SERVICE_NAME=localhost 

MONGO_URI="mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@$SERVICE_NAME:27017?authSource=admin"
```



#### Pod observability

You can perform wellness checks on your pods to see if they are responding correctly, which is good for making sure certain pods are up and running before trying to communicate with them. 

These checks are called probes and there are three of them:

1. **startup probe**: to know when a container has started
2. **readiness probe**: to know when a container is ready to accept traffic.
	- A failing readiness probe will stop the application from receiving traffic.
3. **liveness probe**: indicates whether the code is running or not
	- A failing liveness probe will restart the container.

##### Probes

Each of these probes has a suitable, appropriate test you can configure, which can be of these three types:

1. `ExecAction`: running a command in a container


![](https://i.imgur.com/fabItCS.jpeg)


2. `TCPSocketAction`: continuously pinging and checking if a container is listening on a port via the TCP protocol


![](https://i.imgur.com/tN55If0.jpeg)


3. `HTTPGetAction`: fetching a route with HTTP


![](https://i.imgur.com/yDGoI7c.jpeg)


Are here are the recommended test types for each different type of probe:

- `startupProbe`: Usually, running a command through the exec test is a good indicator for a container being started.
	- **test type**: use `ExecAction`
	- **function**: used for custom logic to check if a pod is in a correct state to start doing its intended purpose.
- `readinessProbe`: the readiness probe test should try seeing if a container is listening/running on a certain port before declaring that the container is ready to receive network traffic
	- **test type**: use `TCPSocketAction`
	- **function**: Used to check when a pod is ready to handle traffic. Readiness probes set the pod's ready condition. Service only send traffic to ready pods.
- `livenessProbe`: the liveness probe test runs a continuous test to see if the container is still running.
	- **test type**: use `HTTPGetAction`
	- **function**: detects when a pod enters a broken state with the purpose of alerting Kubernetes about it. Kubernetes will restart the pod for you if a pod is broken.

Each probe has these same properties that influence the frequency of the probe and when to declare failure:

- `failureThreshold`: the amount of attempts the probe is allowed to fail before declaring failure on the probe and thus giving up.
- `periodSeconds`: the amount of time to wait before reattempting the probe.
- `initialDelaySeconds`: the number of seconds to wait before starting the probe test.

There are different behaviors that K8 takes whenever you fail one of the probes:

- **failing readinessProbe**: if you fail a readiness probe, the container stops accepting traffic.
- **failing startupProbe**: if you fail a startup probe, the entire pod restarts.

> [!IMPORTANT]
> All container probes must pass for the pod to pass.

Probes are declared at the container level.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: goproxy
  labels:
    app: goproxy
spec:
  containers:
  - name: goproxy
    image: k8s.gcr.io/goproxy:0.1
    ports:
    - containerPort: 8080
    readinessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
    livenessProbe:
      tcpSocket:
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 20
    startupProbe:
      httpGet:
        path: /healthz
        port: 80
      failureThreshold: 3
      periodSeconds: 10
```

```yaml
apiVersion: apps/v1 # apps API group
kind: Pod
metadata:
    name: data-tier
	spec: # Pod spec
	  containers:
	  - name: redis
		image: redis:latest
		imagePullPolicy: IfNotPresent
		ports:
		  - containerPort: 6379
			name: redis
		livenessProbe:
		  tcpSocket:
			port: redis # named port
		  initialDelaySeconds: 15
		readinessProbe:
		  exec:
			command:
			- redis-cli
			- ping
		  initialDelaySeconds: 5
```

```yaml
livenessProbe:
  httpGet:
	path: /probe/liveness
	port: server
  initialDelaySeconds: 5
readinessProbe:
  httpGet:
	path: /probe/readiness
	port: server
  initialDelaySeconds: 3
```
##### init containers

Init containers are containers that run every time a pod is registered for creation, before its containers are created via containerd.

Init containers are a way to spin up containers and deal with dependencies, like checking database connection is ready before starting your express app.

You specify your init containers under the `initContainers` key at the same level as `containers`, and specify them the same way. There’s only a few differences:

- If an init container fails, it restarts repeatedly until it succeeds, unless `restartPolicy: never` is set on these containers.
- Probes like `livenessProbe`, `readinessProbe`, and `startupProbe` are not supported on init containers.

Here are the rules of init containers:

1. Pods can declare any number of init containers
2. If an init container fails, the default behavior is that it restarts repeatedly until it succeeds, but you can change that through the `restartPolicy` property on an init container.
3. Init containers run sequentially in the order they are defined in the YAML
4. As soon as all the init containers finish, the normal containers specified under `containers` are allowed to run.
5. init containers cannot contain probes, since init containers are ephemeral, meant to be deleted after they successfully run once.



![](https://i.imgur.com/AYmIHuM.jpeg)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-tier
  labels:
    app: microservices
    tier: app
spec:
  replicas: 1
  selector:
    matchLabels:
      tier: app
  template:
    metadata:
      labels:
        app: microservices
        tier: app
    spec:
      containers:
	      - name: server
	        image: lrakai/microservices:server-v1
	        ports:
	          - containerPort: 8080
	            name: server
      initContainers:
        - name: await-redis
          image: lrakai/microservices:server-v1
          env:
          - name: REDIS_URL
            value: redis://$(DATA_TIER_SERVICE_HOST):$(DATA_TIER_SERVICE_PORT_REDIS)
          command:
            - npm
            - run-script
            - await-redis
```
#### Imperative pods

##### Pod management

**create pods**

---

You can create pods imperatively with the `kubectl run` command:

```bash
kubectl run <podname> --image=<imagename>
```

**fetching pods**

You can get pods with `kubectl get pod` command, making sure to specify a namespace if your pods are in a deployment that belongs to a namespace.

```bash
kubectl describe pod # gets all pods in default namespace
kubectl describe pod -o wide # get more info on pods
```

You can then get info about a single pod with the `kubectl describe pod` command, specifying the namespace if necessary.

```bash
kubectl describe pod POD_NAME # describes the pod by pod name
kubectl describe pod nginx-deployment-d556bf558-5jtpv -n "nginx"
```




**deleting pods**

```bash
kubectl delete pod $POD
kubectl delete pod $POD -n $NAMESPACE
```

##### Pod-container interaction

**interactive mode**

You can check out the logs of a pod or execute commands in it interactively with this command, to go into its shell:

```bash
kubectl exec -it <podname> -- sh
```

**checking logs**

You can get the logs of a pod with the `kubectl logs` command:

```bash
kubectl logs <podname>
```

**multi-container pods**

When dealing with multi container pods, you often have to specify the desired container you want to work with using the `-c <container-name>` option:

```bash
kubectl logs <podname> -c <container_name> # get logs from container
```

And this is how you can get inside the shell of the specified container running inside the specified pod:

```bash
kubectl exec -it <podname> -c <container_name> -- /bin/sh
```


![](https://i.imgur.com/nPy3mm5.jpeg)


### Workloads

Workloads are an abstraction over controlling how a pod runs and its lifecycle behavior or execution behavior.

There are 5 types of workloads:

- **replica set**: maintain a set of pod copies and provide self-healing capabilities to replace crashing pods with healthy replicas.
- **deployments**: An abstraction over replica sets that allow you to manage a single pod template and also updates and rollbacks to pods and any replica sets

#### Deployments and replica sets


ReplicaSets are workloads that manage pod replicas and provide self-healing capabilities to replace crashing pods with healthy replicas.

> [!NOTE]
> Obviously pods in a replica set will have different IP address since the rule is one IP address per pod.

Their main job is to always ensure the desired number of pods are always running.

> [!NOTE]
> You can create replica sets imperatively or declaratively through the `rs` resource, but it’s recommended use deployments instead, since they are abstractions over replica sets.

- `kubectl get rs`: list replica sets
- `kubectl describe rs <rs-name>`: get info of a specific replica set
- `kubectl delete rs <rs-name>`: delete a specific replica set


Deployments manage a single pod template and can also manage replica sets, abstracting that resource away. They manage updates and rollbacks to pods and any replica sets



![](https://i.imgur.com/m9yoJeB.jpeg)


Here is how you can declaratively define replica set behavior:


- `replicas` : the number of pod replicas to manage in a replica set
- `revisionHistoryLimit` : sets the number of previous iterations to keep
- `strategy` : the type of behavior for determining how updates and rollbacks work in the deployment. You have these two types you can pass:
    - `RollingUpdate` : cycle through updating pods. The default for the below strategies are 25%.
        - `maxSurge` : the number of additional pods to have as backup in addition to the desirecd number of pods. This is an expressed as a percentage from 0 to 1.
        - `maxUnavailable` : the number of pods that are allowed to unavailable from the desired number of pods. This is expressed as a percentage between 0 and 1.
    - `Recreate` : kills all existing pods before creating new ones
- `template` : you create the pod declaratively here, specifying the containers to run, the env variables, the volumes, etc. It’s just a `pod.yaml` essentially.

#### Deployment scaling

##### Deployment imperative scaling

As long as pods are stateless (don't have anything stateful like websockets), you can scale them horizontally via replicas.

You can scale an individual deployment by adding more replicas, via the `kubectl scale deployment` command:

```
kubectl scale deployment <deployment-name> --replicas=<n>

kubectl scale --namespace <namespace> deployment <deployment-name> --replicas=<n>
```

Let's create deployments:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: data-tier
  labels:
    app: microservices
spec:
  ports:
  - port: 6379
    protocol: TCP # default 
    name: redis # optional when only 1 port
  selector:
    tier: data 
  type: ClusterIP # default
---
apiVersion: apps/v1 # apps API group
kind: Deployment
metadata:
  name: data-tier
  labels:
    app: microservices
    tier: data
spec:
  replicas: 1
  selector:
    matchLabels:
      tier: data
  template:
    metadata:
      labels:
        app: microservices
        tier: data
    spec: # Pod spec
      containers:
      - name: redis
        image: redis:latest
        imagePullPolicy: IfNotPresent
        ports:
          - containerPort: 6379
```


We can scale this deployment as much as we want, since a server is stateless.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-tier
  labels:
    app: microservices
spec:
  ports:
  - port: 8080
  selector:
    tier: app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-tier
  labels:
    app: microservices
    tier: app
spec:
  replicas: 1
  selector:
    matchLabels:
      tier: app
  template:
    metadata:
      labels:
        app: microservices
        tier: app
    spec:
      containers:
      - name: server
        image: lrakai/microservices:server-v1
        ports:
          - containerPort: 8080
        env:
          - name: REDIS_URL
            # Environment variable service discovery
            # Naming pattern:
            #   IP address: <all_caps_service_name>_SERVICE_HOST
            #   Port: <all_caps_service_name>_SERVICE_PORT
            #   Named Port: <all_caps_service_name>_SERVICE_PORT_<all_caps_port_name>
            value: redis://$(DATA_TIER_SERVICE_HOST):$(DATA_TIER_SERVICE_PORT_REDIS)
            # In multi-container example value was
            # value: redis://localhost:6379 
```

##### Autoscaling

Autoscaling adjusts the number of deployment replicas based on CPU usage or custom metrics, with specified minimum and maximum limits for the number of replicas that you can configure.

Here is an example of setting the limit with CPU utilization:

1. **set metric threshold**: Set target threshold CPU utilization to 70%
2. **set replica bounds**: set minimum and maximum number of replicas to maintain
	- minimum replicas should be 1
	- minimum replicas should be 5

Now if the CPU utilization threshold of 70% is breached on any of the pods in the deployment, the number of replicas increases up to the maximum 5 replicas gradually.

Here is the example declaratively using the `HorizontalPodAutoscaler` resource:

```yaml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: app-tier
  labels:
    app: microservices
    tier: app
spec:
  # 1. threshold and bounds
  maxReplicas: 5
  minReplicas: 1
  targetCPUUtilizationPercentage: 70
  
  # 2. define what deployment to autoscale for
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-tier
```

You can also do this imperatively:

```bash
kubectl autoscale deployment app-tier --max=5 --min=1 --cpu-percent=70
```

#### Deployment rollouts and rollbacks

- **rollout**: updating a deployment and its infra to a new version
- **rollback**: rolling back a deployment and its infra to a previous version

A rollout in Kubernetes is the process of updating or replacing replicas in a deployment with new replicas that match an updated deployment template. 

This can involve changes to configurations, such as environment variables or labels, or code changes like updating the image version.

Any change to the deployment’s template triggers a rollout, and there are different rollout strategies you can set on the deployment:

- **rolling update strategy**: replicas are updated in groups rather than all at once, allowing the service to remain available during the update process. 
	- This is the default.
- **recreate strategy**: kills all old deployments and then immediately creates the new version, incurring brief downtime but ensuring only the newest version of the app is running at any one time.

##### `kubectl rollout` CLI

You can roll back deployments imperatively like so:


![](https://i.imgur.com/RS9CGVk.jpeg)


- **check status of rollout**: since rollouts are triggered automatically on a deployment template update, we can check a rollout's live status with the `kubectl rollout status deployment` CLI

```bash
kubectl rollout status deployment <deployment-name>
```

- **pause rollout**: You can pause a rollout with the `kubectl rollout pause deployment` command, whereby afterwards deployments will not be automatically updated, meaning no new replicas will be created after a paused rollout

```bash
kubectl rollout pause deployment <deployment-name>
```

- **resume rollout**: You can resume a paused rollout with the `kubectl rollout resume deployment` command

```bash
kubectl rollout resume deployment <deployment-name>
```

These next commands deal with rollbacks, where you can rollback to the immediately previous deployment revision, or look at the deployment history to get a list of all deployment revision history for a specific deployment.

- **rollback**: You can roll back to the previous deployment state with the `kubectl rollout undo deployment` command.
- **history**: You can get the history of all deployment revisions with the `kubectl rollout history deployment` command.
##### rollouts with `RollingUpdate` strategy

 By default, Kubernetes uses a rolling update strategy, where replicas are updated in groups rather than all at once, allowing the service to remain available during the update process.
 
- **pro**: Keeps application available while gradually rolling out new version of the deployment in groups.
- **con**: since both old and new versions of the deployment will be running simultaneously for a brief period of time, you need to gracefully handle different application versions in your codebase.


Here is the spec for a rolling update strategy on a deployment:

- `strategy.rollingUpdate.maxSurge`: This defines how many extra pods (above the desired number of replicas) can be created during a rollout. 
	- For example, if you have 10 replicas and maxSurge is set to 25%, up to 2 or 3 extra pods can be created temporarily while updating. 
	- This helps ensure new pods are ready before old ones are removed, minimizing downtime.
	
- `strategy.rollingUpdate.maxUnavailable`: This specifies how many pods can be unavailable during the update. 
	- If set to 25%, up to 2 or 3 pods can be taken down at once while new ones are being created. 
	- This setting helps balance availability and rollout speed.

```yaml
apiVersion: apps/v1 # apps API group
kind: Deployment
metadata:
  name: data-tier
  labels:
    app: microservices
    tier: data
spec:
  replicas: 1
  selector:
    matchLabels:
      tier: data
  # override RollingUpdate strategy
  strategy:
	  type: RollingUpdate
	  rollingUpdate:
		  maxSurge: 25%
		  maxUnavailable: 25%
  template:
    metadata:
      labels:
        app: microservices
        tier: data
    spec: # Pod spec
      containers:
      - name: redis
        image: redis:latest
        imagePullPolicy: IfNotPresent
        ports:
          - containerPort: 6379
            name: redis
```

Going more in depth into the rolling update strategy, let’s paint a picture of having a replica set of 3 pods, and the following stretegy values:

- **max surge = 33%**: have one additional pod as backup ready to substitute in at any time.
- **max unavailable 66%**: Allow two pods (2/3 = 66%) out of the desired 3 pods to be killed or unavailable before you ask for the rolling update feature to trigger.






#### DaemonSet

A DaemonSet workload is used to ensure all nodes run exactly one instance of a pod, basically ensuring maximum replicability and availability.

It makes sure that as new nodes are added to the cluster, specified pods are automatically replicated and added to those nodes and run.

Here are the rules:

- **one pod per node**: daemonsets place one pod per node for all nodes in a cluster,
	- **EXAMPLE**: if you have four nodes then the daemonset will produce four pods, placing one pod in each node. 
- **run containers as background processes**: runs containers in the pod spec of a daemon set as background processes.

> [!NOTE]
> DaemonSets allow you to run one pod per node, which works well for running pods implementing background processes such as agents.

Here is how to declare a DaemonSet declaratively:


![](https://i.imgur.com/4rfq53y.jpeg)

- `spec.tolerations` : any specified nodes that you do not want to run the pods on, like the master node or control plane
- `spec.containers`: the containers that will make up the pod belonging to a daemon set.

##### Imperative DaemonSet control

You can also create DaemonSets imperatively through the `ds` resource:

- `kubectl get ds`: lists all daemonsets
- `kubectl describe ds <daemonset-name>`: get info of a specific daemonset
- `kubectl delete ds <daemonset-name>`: delete a specific daemonset

#### StatefulSet

Containers are stateless by design, but StatefulSets offer stateful approaches

A StatefulSet workload is like a deployment that maintains the ids for each pod, making them have the same persistent reference/identifier even across runs.

> [!NOTE]
> A statefulSet is an object that lets an updated Kubernetes application communicate with the same volume as the previous pod.

Here are the rules:

- If a pod dies, it is replaced with a new one with the exact same identifier and IP address.
- Pods are added in sequence, and deletes pods in sequence
- New pods after old ones die will share the same attached volumes, meaning data persists across pod deaths.




##### Imperative stateful set control

Here are the CLI commands to create stateful sets imperatively using the `sts` resource:


- `kubectl get sts`: lists all stateful sets
- `kubectl describe sts <sts-name>`: get info of a specific stateful set
- `kubectl delete sts <sts-name>`: delete a specific stateful set
#### Job

Jobs are workloads for short-lived tasks that run pods, get a termination status, and then cleanup themselves. Think of them like jobs from github actions - just there to do some task and then end. 

- **job success criteria**: You control the metrics for whether the job should succeed or fail.
- **job execution behavior**: Jobs are run sequentially by default. You have to specify parallelism.


![](https://i.imgur.com/T83tTzB.jpeg)

Here are the important keys concerned with declaratively creating a job:

- `restartPolicy`: since jobs are one-time short-lived tasks, you should always set the restart policy to `never` for a job resource.
- `parallelism`: if this key is specified, you need to provide the number of containers in the pod you want to run in parallel.
- `completions`: The number of pods that should successfully run and exit in order for a job to be considered successfully completed.
- `template.spec`: the pod template that should be run in a job, where you define your short-lived containers that do some command and then exit.

##### Imperative job control

This is how you create and use jobs imperatively using the `job` resource:

- `kubectl create job <jobName> --image=<docker-image>`: create a job
- `kubectl get job`: list jobs
- `kubectl describe job <jobName>`: print out info of a specific job
- `kubectl delete job <jobName>`: delete a specific job
#### CronJob

CronJobs are just Job workloads that run on a schedule using the cron syntax, and specify cron syntax for the `spec.schedule` property.


![](https://i.imgur.com/rPvYWhA.jpeg)


Here is how you can use cron jobs imperatively using the `cj` resource.


![](https://i.imgur.com/memEiIa.jpeg)

### Services

Services are resources that have persistent DNS names and IP addresses which are designed for facilitating inter-pod communication and even extra-cluster communication.

Pods have ephemeral IP addresses, meaning that if you want to connect to another pod in your application logic or through your local machine, you must use a service to have stable port forwarding.

Let’s go over some basic use cases:

- **connecting to [localhost](http://localhost):** you have a pod runnign a server and you want a service that forwards that pod’s IP address to localhost on your laptop.
- **inter-pod communication**: You have one server pod and one database pod, and you want to expose the database pod on a service for a persistent communication so that the server pod can access the database.


> [!NOTE]
> For a pod to communicate with another pod, they have to go through a service with port forwarding and DNS forwarding, because each pod has 1 IP address.



There are four types of services you can have:

- `ClusterIP` : the default, which gives the service an IP address that is accessible only from within the cluster. (only other pods within the cluster can communicate with the service, but not from localhost).
- `LoadBalancer` : load balances requests from the service to all matching pods it has from its `selector` property. It operates at **layer 4**, meaning it uses the TCP protocol.
- `Ingress`: a load balancer but operates at the **layer 7** level, meaning it uses intelligent protocols like HTTP and SMTP and can make intelligent load balancing decisions based on the contents of the web packets.
- `NodePort` : exposes the service’s IP address to the local machine on localhost.

Here's a table comparing all these services:


| Service Type   | Forwards traffic to internet?                                                            | Has private cluster IP? |
| -------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| `ClusterIP`    | No, only accessible within cluster.                                                      | Yes                     |
| `LoadBalancer` | Yes, also creates external IP address using cloud provider to provision a load balancer. | Yes                     |
| `NodePort`     | Yes, forwards traffic directly to `localhost` on the machine.                            | Yes                     |


#### Creating services basics

A basic service YAML is like so:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: demo-service
  namespace: development
spec:
  selector:
    app: pod-info
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

Each service should have a selector that points to a corresponding label on a pod so the service targets the pod for directing traffic to it.

1. On a pod resource YAML, provide a value for `metadata.labels.app`
2. On a service YAML, use that same pod label value on `spec.selector.app`

Here are the spec properties:

- `ports`: the ports to expose
    - `port`: the port that the selected pod is listening on
    - `targetPort`: the port that the selected pod is listening on. This value is not applied if the service type is `NodePort`, so you can just omit this.
    - `nodePort`: the port to map to on your localhost. This must be a large value between 30000 - 32767, as to not interfere with important ports.
    - `protocol`: the layer 4 protocol to use, either TCP or UDP

#### ClusterIP

Gives a private fixed IP address for the pod within the cluster, enabling **intra-cluster** communication between pods in different nodes.

> [!NOTE]
> This is the base service that all other service types inherit from and add onto.

> [!NOTE]
> Since the cluster IP is the most basic service and all it does is enable intra-cluster communication between pods and different nodes, it gives an IP address to the pod that is only available within the cluster (meaning that, by default, no internet traffic can reach the cluster IP). 
> 
> To expose traffic to the internet, you look towards other services. 

![](https://i.imgur.com/u2OHbNk.jpeg)

- `ports`: the ports to expose
    - `port`: the port that the server will expose
    - `targetPort`: the port that the selected pod is listening on.

#### NodePort

The `NodePort` extends the `ClusterIP` service.

Here's how it works behind the scenes:

1. **node port assignment**: When you create a NodePort service, Kubernetes allocates a static port (from a range, usually 30,000–32,767) on every node in the cluster.
2. **NodePort service translation**: Any request sent to any node’s IP address on the allocated port will be forwarded to the service, which then routes the request to one of the target pods.

For example, if your webserver pod is exposed via a NodePort service on port 31000, you can access it by sending a request to any node’s IP at port 31000. 

> [!NOTE]
> Kubernetes automatically manages the mapping between the NodePort and the pods, even if pods are added or removed.

![](https://i.imgur.com/2hcFQhF.jpeg)




#### Loadbalancer

The load balancer service calls upon a cloud provider the cluster is hosted on to provision a real load balancer to handle external internet traffic being directed to the target pod.

The load balancer service tries to acquire an external IP address for the provisioned load balancer, allowing it to accept internet traffic immediately.

- If using a local cluster management service like `minikube`, you can use `minikube tunnel` command to actually expose the external IP address as being an origin on `localhost` IP address.
- If using a cloud provider like Google Cloud, Google Cloud will actually provision a load balancer for you and attach to it an external IP address immediately available on the internet. 

> [!NOTE]
> Behind the scenes if you use a load balancer service, a cloud provider like Google Cloud or AWS EKS will actually create a load balancer for you and provision that resource for you with the IP, the port, and traffic rules that you decide on. 

1. Run `minikube tunnel` to expose your kubernetes cluster to localhost internet
2. Create this yaml of a service, targeting the specific pod you want to proxy traffic to via `spec.selector.<selector-tag>` property.

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: demo-service
  namespace: development
spec:
  selector:
    app: pod-info
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```
3. Create the associated pod and apply the service
4. Visit `localhost:80` to see your pod running via a service

#### ExternalName

The `ExternalName` type service redirects traffic from a target pod to an external DNS address that's typically outside your server. 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: database-service
  namespace: prod
spec:
  externalName: ://database.com
  type: ExternalName

```

#### Connecting to services

The main advantage of services is that they're sort of like NGINX in that they can create static DNS names for IP addresses so you request the DNS created by a service rather than an ephemeral, changing pod IP.

Here is the basic syntax for how to form a request to a service DNS origin:

```
http://<service-name>.<namespace>.svc.cluster.local
```

- `service-name`: the name of the service
- `namespace`: the namespace the service belongs to
- `svc.cluster.local`: represents a service being created in a local cluster.
#### CLI

Services help expose your containers to the outer world via port forwarding, doing either forwarding to your localhost or to a DNS mapping to a registered domain name.

- `kubectl get services`: lists all services
- `kubectl delete service <service-name>` : deletes the specified service
- `kubectl describe service <service-name>` : gets detailed info about the specified service.

**port forwarding**

---

You can do port forwarding from a service to a port on your laptop if you didn’t already do `nodePort` forwarding on your service:

```bash
kubectl port-forward service/<service-name> <nodeport>:<serviceport>
```

- `service-name`: the name of the service to port forward
- `nodeport`: the port number on your local machine you want to forward to
- `serviceport` : the port on the service that is currently being exposed and that you want to forward.


### Deployments in depth

A deployment is a single deployment unit of a microservice, which creates all the pods necessary for that microservice.

#### Declarative deployments


In this example below, we create a deployment named `pod-info-deployment` in the namespace `development` which contains one pod built from the `aadilmallick/pod-info-app:latest` docker image.

```yaml
--- 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-info-deployment
  namespace: development
  labels:
    app: pod-info
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pod-info
  template:
    metadata:
      labels:
        app: pod-info
    spec:
      containers:
      - name: pod-info-container
        image: aadilmallick/pod-info-app:latest
        ports:
        - containerPort: 3000
        env:
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name # pod-info-deployment
          - name: POD_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace  # development
          - name: POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP # resolved at runtime
```


#### Imperative deployments

Here is the basic crud:

- `kubectl get deployments` : gets all deployments
- `kubectl describe deployment <deployment-name>` : gives more info on the specified deployment
- `kubectl delete deployment <deployment-name>` : deletes the specified deployment

**create deployments**

Deployments are a grouping of pods, and in deployments you describe how to create the pods through a yaml file, but you can also create them imperatively (not recommended)

```bash

kubectl create deployment <deployment-name> \
--image=<image-name> \  # image to create container (1-container pod)
--replicas=3 \    # the number of pods in the replica set
--port=80         # the port to run the container on
```

**fetching deployments**

You can get deployments with the `kubectl get deployment` command, which by default will look in the default namespace. To specify the namespace to search in, use the `-n` command:

```bash
kubectl get deployment # gets all deployments in the default namespace
kubectl get deployment -n "nginx" # gets deployments in the "nginx" namespace
```

Once you get a deployment, you can describe it with the `kubectl describe deployment` command, making sure to specify the namespace if the deployment belongs to a namespace

```bash
kubectl describe deployment DEPLOYMENT_NAME_HERE
```

**deleting deployments**

To delete a deployment, use the `kubectl delete deployment` command, which will automatically delete and stop all pods within that deployment. This command also needs to be namespaced if the deployment is tied to a namespace.

```bash
kubectl delete deployment DEPLOYMENT_NAME_HERE
```

### Volumes

There are three types of volume resources that are used in kubernetes:

- **volumes**: these are normal pod-specific volumes that are tied to a pod and their lifecycle, meant for storing data across containers within a pod and surviving pod and container restarts.
- **PersistentVolumes**: volumes that are available throughout the cluster and can be attached to any pod but only through a Persistent Volume Claim.
- **PersistentVolumeClaims**: PVCs for short, these are one-to-one mappings of PersistentVolumes to filepaths on a container. Pods use PVCs in order to use a volume in their container(s).

#### Volumes

Volumes are attached to a single pod and are intended as persistent data storage for all containers within the same pod.

Once a pod is deleted, the volume also gets deleted.

These are the available volume types:

- `emptyDir`: the default. This creates an empty directory on the node the pod lives in, and all data is persisted to that folder on the node.
	- **con**: data gets lost if pod is rescheduled to a different node.

#### Persistent volumes

Persistent volumes are independent of a pod's lifetime.

PersistentVolumes are the actual volume resources you have to create before you can use PVCs to actually claim storage from those volumes and use them in your pods.

There are two ways to create/user persistent volumes:

- Static provisioning for Persistent Volumes (PVs) means that a cluster administrator manually creates and configures the storage resources ahead of time.
- Dynamic provisioning, on the other hand, allows Kubernetes to automatically create a new PV when a PVC is made, if there isn’t already a suitable PV available.
##### Declarative



![](https://i.imgur.com/B70o7lT.jpeg)



Here are the possible keys you have in the yaml definition:

- `accessModes`: determines the behavior of the pods reading and writing to the volume: **This must match the PVC access mode behavior.**
    - `ReadWriteMany`: the volume can be mounted by many pods, and all of them have read and write access to the volume
    - `ReadMany`: the volume can be mounted by many pods, and all of them have read-only access to the volume
    - `ReadWriteOnce`: the volume can be mounted by many pods, but only one of them will have read and write access to the volume while the rest will have read-only access.
- `persistentVolumeReclaimPolicy`: determines the behavior of what happens to the data
- `storageClassName`: how the data will be stored. `ssd` is for local storage.

Then you have these different volume types:

- **node volume storage**: persisting data to the node's filesystem (the node that the pod lives in)
	- `hostPath`: allows you to host the volume in your local laptop through docker desktop, although this will nto work in production, and instead you should use a cloud-provided storage plugin.

#### PVCs

Besides just being a way for pods to use PersistentVolumes, PVCs are claims on certain amounts and thresholds of storage, and can be released.

PVCs describe a pod's request for a persistent volume storage, which includes details like storage amount, type of storage, and access mode.

There are 4 possible states a PVC can be in related to the PV it wants to claim (via labels):

- **`Available`**: the volume is not yet bound to a claim
- **`Bound`**: the volume is bound to a claim
- **`Released`**: the claim is deleted, but the resource is not yet reclaimed by the cluster
- **`Failed`**: PV has failed its automatic reclamation

> [!NOTE]
> If dynamic provisioning isn’t enabled and no suitable static PV exists, the PVC will remain in a pending state until a matching PV is available.

There are all policies for what happens to the volume data mounted in a pod when a PVC is released

- **delete:** deletes the data from the pod once the PVC is released. This is the default, so be careful.
- **retain**: this retains the data in the pod even if the PVC is released.

Here is how to use PVCs declaratively:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-health-dashboard-pvc
  namespace: health-dashboard
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: nfs-local-path
  resources:
    requests:
      storage: 1Gi
```

- `accessModes`: determines the behavior of the pods reading and writing to the underlying volume of the claim:
    - `ReadWriteMany`: the volume can be mounted by many pods, and all of them have read and write access to the volume
    - `ReadMany`: the volume can be mounted by many pods, and all of them have read-only access to the volume
    - `ReadWriteOnce`: the volume can be mounted by many pods, but only one of them will have read and write access to the volume while the rest will have read-only access.
- `storageClassName`: the storage class name (if exists) to bind the PVC to

##### Connecting Pods to PVC

Once you create a PVC, a PVC is useless without allowing pods to access that PVC and by extension the underlying PV the PVC has claimed. Once pods gain access to a PVC, the containers within those pods will be able to use the underlying volume for storage.

To attach a persistent volume for use to a pod, follow these steps:

1. Create a PV with static provisioning or dynamic provisioning
2. Create a PVC that targets a PV for use


![](https://i.imgur.com/aVHGVHa.jpeg)



3. To connect a PVC to a pod so its containers can use the volume, add the `volumes` key on the pod spec so you get this flow:

```
POD uses PVC uses PV
```


![](https://i.imgur.com/XgaMpPn.jpeg)


In summary, here are the steps to allow pods to access a PVC:

1. Create a persistent volume claim with a unique name
2. In the pod template in your deployment, create a `volumes` key, where you can specify volumes based on two keys:
    - `name`: the name of the volume you are going to create.
    - `persistentVolumeClaim`: takes in a `claimName` property, which should be set to the name of the PVC you want to use.
3. In the `containers` specification, you can mount volumes in each container through the `volumeMounts` property, which takes in these two keys to mount a volume:
    - `name`: the volume name to use, defined in the `volumes` key in a deployment.
    - `mountPath`: where to mount the volume in the container’s filesystem.

Here's the YAML:

1. Create a persistent volume

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: data-tier-volume
spec:
  capacity:
    storage: 1Gi # 1 gibibyte
  accessModes:
    - ReadWriteOnce
  awsElasticBlockStore: 
    volumeID: INSERT_VOLUME_ID # replace with actual ID
```

2. Create a persistent volume claim for that volume

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-tier-volume-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 128Mi # 128 mebibytes 
```

3. Create a deployment whose pods request that PVC for use

```yaml
apiVersion: apps/v1 # apps API group
kind: Deployment
metadata:
  name: data-tier
  labels:
    app: microservices
    tier: data
spec:
  replicas: 1
  selector:
    matchLabels:
      tier: data
  template:
    metadata:
      labels:
        app: microservices
        tier: data
    spec: # Pod spec
      containers:
      - name: redis
        image: redis:latest
        imagePullPolicy: IfNotPresent
        ports:
          - containerPort: 6379
            name: redis
        # 2. mount volume from pod to /data on container
        volumeMounts:
          - mountPath: /data
            name: data-tier-volume
      # 1. attach PVC to pod
      volumes:
      - name: data-tier-volume
        persistentVolumeClaim:
          claimName: data-tier-volume-claim
```

#### Storage classes

Storage classes are things that your admin or cloud provider creates that are abstractions over persistent volumes, allowing you to connect your PVC to a storage class rather than creating a PersistentVolume, provisioning a certain amount of data, and connecting to that PV.

Here is the basic flow of using storage classes with PVCs instead of PVs with PVCs:

1. Define a storage class or use one created by your provider
2. In your PVC definition, use `storageClassName` to request storage from the storage class rather than the PV.
3. Use the PVC as normal in your pods.


![](https://i.imgur.com/cqcDgxi.jpeg)

##### Declarative storage classes


![](https://i.imgur.com/7yS9DBX.jpeg)


##### Imperative storage classes

You can also imperatively manage storage classes through the `sc` resource:

### Config maps, secrets, environment variables

Instead of hard coding environment variables inside each of your deployments, it is best practice to separate configuration from implementation. For these purposes we have **configMaps** and **secrets** resources in kubernetes:

- **configMaps**: store non-sensitive data that can be referenced in pods to extract the the data into environment variables that can be used in containers in a pod.
- **secrets**: store sensitive data that can be referenced in pods to extract the the secret data into environment variables that can be used in containers in a pod. The secrets can be encrypted on the server side, or obfuscated at the very least.

#### Config maps

You specify all key-value pairs under the `data` key in a config map

![](https://i.imgur.com/FIq2Qom.jpeg)



In a pod, you can extract data from a specified config map by going into the `env` key on a container, and using the `valueFrom` key to specify that you want to extract the environment variable from another K8 resource. 

You specify `configMapKeyRef` as telling you want to pull from a config map, which needs two properties:

- `name`: the name of the config map resource you want to pull from
- `key`: the name of the specific key from the key-value pairs in the config map that you want to pull the value of.

#### Secrets


![](https://i.imgur.com/JQbek7Y.jpeg)

## K8S practice

### Level 1 - Basic microservices

#### Create the deployments

1. Create a deployment that has a web server pod running on port 3000, and a service that proxies the traffic for that pod forwarding port 3000 on that pod to port 80 on the cluster IP address, via the `ClusterIP` service type./

```yaml
--- 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: learning-resources
  labels:
    app: learning-resources
spec:
  replicas: 3
  selector:
    matchLabels:
      app: learning-resources
  template:
    metadata:
      labels:
        app: learning-resources
    spec:
      containers:
      - name: learning-resources-container
        image: kimschles/learning-resources:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: POD_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          - name: POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
---
apiVersion: v1
kind: Service
metadata:
  name: learning-service
  labels:
    app: learning-resources
spec:
  selector:
    app: learning-resources
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

2. Create deployment that has a long running pod running on port 80,  and a `NodePort` service that proxies traffic for the pod, and forwards traffic from port 80 on the pod to port 30076 on your `localhost`.

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echo-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: echo-server
  template:
    metadata:
      labels:
        app: echo-server
    spec:
      containers:
      - image: kimschles/echo-server:latest
        imagePullPolicy: Always
        name: echo-server
        ports:
        - containerPort: 80
        env:
        - name: PORT
          value: "80"
---
apiVersion: v1
kind: Service
metadata:
  name: echo-service
spec:
  selector:
    app: echo-server
  type: NodePort
  ports:
    - name: echo
      port: 80
      targetPort: 80
      nodePort: 30076
      protocol: TCP
```

3. Create a deployment that runs a VITE frontend app on port 4173 across a replica set of pods and creates a `LoadBalancer` service that distributes traffic equally to those pods and forwards traffic on those pods from port 4173 to port 80 on the Cluster IP.

```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: frontend
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: frontend
  labels:
    app: frontend-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend-ui
  template:
    metadata:
      labels:
        app: frontend-ui
    spec:
      containers:
      - name: frontend-container
        image: kimschles/frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 4173
        env:
        - name: PUBLIC_K8S_SERVICE_URL
          value: "http://learning-service.default.svc.cluster.local"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: frontend
spec:
  selector:
    app: frontend-ui
  ports:
    - port: 80
      targetPort: 4173
  type: LoadBalancer 
```

#### Create the services

**ClusterIP example**

For a `ClusterIP` service like this:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: learning-service
  labels:
    app: learning-resources
spec:
  selector:
    app: learning-resources
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

This is how you connect to it:

1. **Create a BusyBox Pod:** Deploy a BusyBox pod in your Kubernetes cluster. This pod will be used to run commands inside the cluster.
2. **Verify Pod is Running:** Use `kubectl get pods` to ensure the BusyBox pod is up and running.
3. **Access the BusyBox Pod:** Run `kubectl exec -it <busybox-pod-name> -- sh` to open an interactive shell inside the BusyBox pod.
4. **Find Pod IP Addresses:** In another terminal tab, run `kubectl get pods -o wide` to list pods and their IP addresses.
5. **Make HTTP GET Request to a Pod:** Inside the BusyBox shell, use `wget -O- http://<pod-ip>:<port>` to make a GET request directly to a pod's IP and port.
6. **Get Service Information:** Run `kubectl get services` to see the available services and their ClusterIP addresses.
7. **Make HTTP GET Request to Service Name:** Inside BusyBox, use `wget -O- http://<service-name>` to make a request to the service by its name.
8. **Make HTTP GET Request to Service DNS Name:** Use the full DNS name pattern `http://<service-name>.<namespace>.svc.cluster.local` with wget inside BusyBox to access the service.

**NodePort example**

1. Create a pod that has a container running on port 80 and exposes it 
2. Create a node port service that targets the pod definition and reroutes traffic from port 80 on that pod to port 30076 on localhost. 

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echo-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: echo-server
  template:
    metadata:
      labels:
        app: echo-server
    spec:
      containers:
      - image: kimschles/echo-server:latest
        imagePullPolicy: Always
        name: echo-server
        ports:
        - containerPort: 80
        env:
        - name: PORT
          value: "80"
---
apiVersion: v1
kind: Service
metadata:
  name: echo-service
spec:
  selector:
    app: echo-server
  type: NodePort
  ports:
    - name: echo
      port: 80
      targetPort: 80
      nodePort: 30076
      protocol: TCP
```

1. **Create a BusyBox Pod:** Deploy a BusyBox pod in your Kubernetes cluster to run commands inside the cluster.
2. **Verify Pod is Running:** Use `kubectl get pods` to ensure the BusyBox pod is up and running.
3. **Access the BusyBox Pod:** Run `kubectl exec -it <busybox-pod-name> -- sh` to open an interactive shell inside the BusyBox pod.
4. **Find Pod IP Addresses:** In another terminal tab, run `kubectl get pods -o wide` to list pods and their IP addresses.
5. **Make HTTP GET Request to a Pod:** Inside the BusyBox shell, use `wget -O- http://<pod-ip>:<port>` to make a GET request directly to a pod's IP and port.
6. **Get Node IP Addresses:** Run `kubectl get nodes -o wide` to find the IP addresses of your Kubernetes nodes.
7. **Make HTTP GET Request to Node IP with NodePort:** Use `wget -O- http://<node-ip>:<nodeport>` to access the service exposed via NodePort.
8. **Get Service Information:** Run `kubectl get services` to see the available services and their types.
9. **Make HTTP GET Request to Service Name:** Inside BusyBox, use `wget -O- http://<service-name>` to make a request to the service by its name.
10. **Make HTTP GET Request to Service DNS Name:** Use the full DNS name pattern `http://<service-name>.<namespace>.svc.cluster.local` with wget inside BusyBox to access the service.

**load balancer service**

Here are the generic steps to replicate the process shown in the video for learning how to deploy and test a LoadBalancer service in Kubernetes:  

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: frontend
spec:
  selector:
    app: frontend-ui
  ports:
    - port: 80
      targetPort: 4173
  type: LoadBalancer 
```
  

1. **Create a Namespace:** Define and apply a YAML file to create a new namespace for your service.
2. **Deploy Backend Pods:** Create a deployment YAML to spin up your backend pods with the appropriate container image.
3. **Deploy Frontend Pods:** Similarly, create and apply a deployment YAML for your frontend pods.
4. **Create a LoadBalancer Service:** Define a service YAML of type LoadBalancer that fronts the frontend pods by matching their labels.
5. **Apply All Configurations:** Use `kubectl apply -f <filename.yaml>` to deploy the namespace, deployments, and service.
6. **Verify Service Creation:** Run `kubectl get services -n <namespace>` to check the service status and note the ClusterIP and External IP (which may be pending in local clusters).
7. **Create a BusyBox Pod in the Same Namespace:** Deploy a BusyBox pod to use as a client for testing service connectivity.
8. **Exec into BusyBox Pod:** Use `kubectl exec -n <namespace> -it <busybox-pod-name> -- sh` to open a shell inside the pod.
9. **Test Service Connectivity:** Use commands like `wget -O- http://<service-name>` or the full DNS name `http://<service-name>.<namespace>.svc.cluster.local` to query the service and verify it returns expected data.
10. **Port Forward to Access Service Externally:** Find a pod name with `kubectl get pods -n <namespace>`, then run `kubectl port-forward -n <namespace> <pod-name> <local-port>:<container-port>` to forward a local port to the pod.
11. **Open Browser to Localhost:** Access the service via `http://localhost:<local-port>` to see the combined frontend and backend response.


### Kubernetes + Google Cloud

#### Enabling google cloud kubernetes API

1. Go to google cloud and go to **APIs + services**
2. Enable the **Kubernetes engine API** service, which requires a billing account
3. Activate the cloud shell in the browser, which gives you a terminal with the `gcloud` CLI already installed.

#### Creating the cluster

Once you have enabled the Google Cloud Kubernetes Engine API service, you will now be able to use and create Kubernetes clusters with the `gcloud` CLI on your account. 

1. Create the cluster with the `gcloud` CLI, picking the geographical zone with the `--zone` flag.

```bash
gcloud container clusters create [clusterName] --zone us-east4-a
```

2. Get the credentials to remotely connect to your cluster:

```bash
gcloud container clusters get-credentials [clusterName] --zone us-east4-a
```

3. Get info about the context:

```bash
kubectl config current-context
```

4. Create a K8S deployment that deploys a pod  with a running container process on a certain exposed port and a `LoadBalancer` service that forwards traffic from port 80 to that pod on the specified exposed port.
5. Once the service and deployment are running, grab the external IP of the created load balancer and then view it on the internet.

## Kustomize and advanced K8S Yaml

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

### Best folder structure for `kustomize`

TODO: add tree, auth with github

All yaml should be in a top-level folder called `kustomize`, and that should have two subfolders:

- `kustomize/base`: stores YAML that defines core resources like pods
- `kustomize/overlay`: The `overlay` directory contains environment-specific configurations that build upon the `base` configurations.

The `overlay` folder should be divided into local and prod environments with two subfolders:

- `overlay/local`
- `overlay/prod`


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

## Helm

Helm is a tool used in Kubernetes to package, configure, and deploy applications using "charts," which are collections of Kubernetes resource definitions. It simplifies managing complex deployments by letting you define your app and its dependencies in reusable, versioned packages.

## Kubernetes admin

Kubernetes admin refers to installing a Kubernetes cluster and managing it on a generic Linux device or VM. 

Because Kubernetes is pretty heavy, each machine that runs a Kubernetes cluster must have these prerequisites:

- 2 GB RAM per machine
- 2 vCPUs for the control-plane node

## Kubernetes security

### Basic tips

#### Tip 1 - use `securityContext`

In terms of pods running containers, there is a huge attack surface on how the containers are running themselves, usually on two fronts:

- **root access**: any container that allows root access means that it can be compromised since root can basically do anything. 
- **write filesystem**: allowing the container to have its file system written to and having the user be root means that root can basically delete the entire container. We want to prevent writing on the container file system, even if we're root. 

So here is how we do that on YAML via the `spec.containers.securityContext` object, which has these boolean flags.

- `allowPrivilegeEscalation`: allow users to use `sudo` to assume root access.
- `runAsNonRoot`: if set to `true`, does not allow running container as a root user to start off with.
- `readOnlyRootFilesystem`: if set to `true`, the root user can only read files in the container filesystem, not being able to write anything.

```yaml
--- 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-info-deployment
  namespace: development
  labels:
    app: pod-info
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pod-info
  template:
    metadata:
      labels:
        app: pod-info
    spec:
      containers:
      - name: pod-info-container
        image: kimschles/pod-info-app:latest
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          capabilities:
            drop:
              - ALL
          readOnlyRootFilesystem: true
        ports:
        - containerPort: 3000
```

#### Tip 2 - use `snyk` CLI

`snyk` is a static vulnerability analysis tool that also offers a CLI that lets you find out any vulnerabilities of code files.

```
snyk iac test <k8s-yaml-file>
```