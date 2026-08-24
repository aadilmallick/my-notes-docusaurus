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
- **declarative**: describing resources in YAML and then creating them with the `kubectl apply -f <yaml-file>` command to create a resource from its YAML description.


> [!NOTE]
> **Declarative vs Imperative**
> ***
> - **imperative**: using kubectl CLI to create resources
> - **declarative**: configuring resources in yaml files and then using two basic commands to manage their creation and deletion.

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

> [!NOTE]
> Once belonging to a namespace, if the namespace gets deleted, all resources belonging to that namespace also get deleted, which is good for cleanup purposes.

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

### Deployments and Pods

A deployment is a single deployment unit of a microservice, which creates all the pods necessary for that microservice.

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

A pod resource is declared in yaml through the `Pod` kind of resource. The main key to specify when creating a pod resource is the `containers` key, where you specify all the containers that will run in a pod. Here are the options in each container:

- `image`: the image to build the container from. By default, it pulls from dockerhub or any other external registry, but if you want to build a container from your local image, you need to also include the `imagePullPolicy: never` key.
- `imagePullPolicy`: describes the pulling behavior of images. You can supply these values:
    - `always` : pull the image from an external registry
    - `never`: pull the image from your local images
- `ports` : runs the container on the specified port. You have these keys to supply:
    - `containerPort`: required, the port number to run the container on.
    - `protocol` : the protocol to run on, TCP or UDP, if it even matters
- `command` : a string array of the split string command to override the main container’s entrypoint. Useful for debugging.
- `env` : provides key value pairs of environment variables to load into the container.

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

Each of these probes has a suitable, appropriate test you can configure, which can be of these three types:

1. `ExecAction`: running a command in a container
2. `TCPSocketAction`: continuously pinging and checking if a container is listening on a port via the TCP protocol
3. `HTTPGetAction`: fetching a route with HTTP

- `startupProbe`: Usually, running a command through the exec test is a good indicator for a container being started.
	- **test type**: use `ExecAction`
- `readinessProbe`: the readiness probe test should try seeing if a container is listening/running on a certain port before declaring that the container is ready to receive network traffic
	- **test type**: use `TCPSocketAction`
- `livenessProbe`: the liveness probe test runs a continuous test to see if the container is still running.
	- **test type**: use `HTTPGetAction`

#### Imperative deployments

Here is the basic crud:

- `kubectl get deployments` : gets all deployments
- `kubectl describe deployment <deployment-name>` : gives more info on the specified deployment
- `kubectl delete deployment <deployment-name>` : deletes the specified deployment

**create deployments**

Deployments are a grouping of pods, and in deployments you describe how to create the pods through a yaml file, but you can also create them imperatively (not recommended)

```bash
kubectl create deployment <deployment-name> \
--image=<image-name> \ # image to create container (1-container pod)
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


#### Imperative pods

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

When dealing with multi container pods, you often have to specify the cdesired container you want to work with using the `-c <container-name>` option:

```bash
kubectl logs <podname> -c <container_name> # get logs from container
```

And this is how you can get inside the shell of the specified container running inside the specified pod:

```bash
kubectl exec -it <podname> -c <container_name> -- /bin/sh
```


![](https://i.imgur.com/nPy3mm5.jpeg)

### Services

Services are resources that have persistent DNS names and IP addresses which are designed for creating stable networking for pods and between pods.

Pods have ephemeral IP addresses, meaning that if you want to connect to another pod in your application logic or through your local machine, you must use a service to have stable port forwarding.

Let’s go over some basic use cases:

- **connecting to [localhost](http://localhost):** you have a pod runnign a server and you want a service that forwards that pod’s IP address to localhost on your laptop.
- **inter-pod communication**: You have one server pod and one database pod, and you want to expose the database pod on a service for a persistent communication so that the server pod can access the database.


> [!NOTE]
> For a pod to communicate with another pod, they have to go through a service with port forwarding and DNS forwarding, because each pod has 1 IP address.

**using services declaratively**

There are three types of services you can have:

- `ClusterIP` : the default, which gives the service an IP address that is accessible only from within the cluster. (only other pods within the cliuster can communicate with the service, not from localhost).
- `LoadBalancer` : load balances requests from the service to all matching pods it has from its `selector` property. It operates at **layer 4**, meaning it uses the TCP protocol.
- `Ingress`: a load balancer but operates at the **layer 7** level, meaning it uses intelligent protocols like HTTP and SMTP and can make intelligent load balancing decisions based on the contents of the web packets.
- `NodePort` : exposes the service’s IP address to the local machine on localhost.

#### ClusterIP

Gives a private IP address for the pod within the cluster, all pods within the same cluster run as if on the same LAN.

![](https://i.imgur.com/u2OHbNk.jpeg)

- `ports`: the ports to expose
    - `port`: the port that the server will expose
    - `targetPort`: the port that the selected pod is listening on.
- `selector`: selects the pods to do networking for in the service.

#### NodePort

The `NodePort` runs the pod as a process rather than giving it its own IP address, and then exposing it on a port.


![](https://i.imgur.com/2hcFQhF.jpeg)

- `ports`: the ports to expose
    - `port`: the port that the selected pod is listening on
    - `targetPort`: the port that the selected pod is listening on. This value is not applied if the service type is `NodePort`, so you can just omit this.
    - `nodePort`: the port to map to on your localhost. This must be a large value between 30000 - 32767, as to not interfere with important ports.
- `selector`: selects the pods to do networking for in the service.
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