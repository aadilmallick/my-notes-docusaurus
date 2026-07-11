---
aliases:
---
## Cloud fundamentals

### Basics of Cloud computing

**types of deployments**

There are three types of deployments companies can make with software:

1. **cloud-based deployment**: In a cloud-based deployment model, you have the flexibility to migrate your existing resources to the cloud, design and build new applications within the cloud environment, or use a combination of both.
2. **on-premises deployment**: A company own its own infrastructure and hardware and has to setup things like virtualization and cooling. The only benefit is granular control, ownership of data, and low latency.
3. **hybrid deployment**: In a hybrid deployment, cloud-based resources and on-premises infrastructure work together. This approach is ideal for situations where legacy applications must remain on premises due to maintenance preferences or regulatory requirements.

**client-server model**

The client-server model is the standard way of building applications.

In the client-server model, the client sends requests to the server, which processes the requests and sends back responses. Cloud computing provides scalable server resources that can be accessed over the internet.

### 6 Benefits of cloud computing

There are 6 main benefits of cloud computing:

1. **reliability**: manage the infrastructure for you. Has global reach and many data centers.
2. **agility**: Easy and fast to set up cloud computing services
3. **elasticity**: scale up or down easily depending on your needs.
4. **scalability**: able to scale up to high demand
5. **pay-as-you-go** : only pay for the services you are using
6. **global reach**: provide services for users around the cloud

### Managed vs Unmanaged services

- **managed services**: AWS takes care of the OS and underlying networking and security. This includes services like lambda and S3, where AWS takes care of most of the configuration and security aspects.
- **unmanaged services**: These are when AWS just gives you the infrastructure and its up to you to manage the OS and its software, update it, configure its networking and security, etc.


### VMs in the cloud, cloud security, etc.

#### Hypervisors and virtualization

Cloud providers have **host machines** in a datacenter, where each host machine is a super beefy computer that's always up and running with the sole purpose of hosting VMs (virtual machines).

Each host machine uses its **hypervisor** component to enable virtualization and effectively isolate resources for each VM in the host and manage allocation of hardware profiles like appropriate amounts of RAM, hard disk storage, etc. to the specifications each VM asks for.

The shared responsibility rule here is applied for unmanaged services like VMs:

- **what the developer manages**: firewalls and security settings for a VM and maintaining the OS
- **what the cloud provider manages**: securing the actual hardware the VM runs on and providing the developer with the tool to change network configuration and hardware profile of the VM. Also manage the actual mechanisms behind block storage, encryption, etc.

#### Elasticity

To scale according to incoming traffic amounts, we have access to both vertical and horizontal scaling:

- **vertical scaling**: beefing up the hardware profile of an instance to have more storage, RAM, CPU power, etc. so it can handle incoming requests with more computational power
	- **pro**: the simplest scaling tactic and easiest to manage
	- **con**: can be expensive and no high availability since there is a single point of failure if the single beefed up instance goes down.
- **horizontal scaling**: using a load balancer to distribute incoming traffic across many replicas of the same instance, also ensuring high availability.
	- **pro**: Ensures high availability
	- **con**: difficult to manage a load balancer and requires more setup

A Load balancer is a regional service that distributes many replicas of an instance across many availability zones and distributes traffic amongst all the instances. 

It has high availability because it knows when instances or even entire availability zones go down and then where to reroute as a failover. It has a **listener** component that performs health checks to constantly communicate with instances to know their status, and only distributes incoming traffic to those instances if they pass the health check.

To scale down rather than up, all you do is terminate some replicas and you can create policies to do so to dynamically adjust to changes in traffic or CPU utilization or some threshold like that.


### Networking in the cloud

#### VPCs

VPCs (virtual private clouds) essentially form a LAN for your VMs so that they can have secure and private networking communication and allow you to apply firewall and routing rules.

You can further subdivide instances within a VPC into subnets, which gives you all these capacities:

- **control route tables**: you can control how instances within a subnet route to other instances in other subnets, controlling cross-subnet communication. 
	- The default is that all instances within a VPC can communicate with each other, regardless of subnet
- **control internet access**: You can choose to make subnets public or private to allow or disallow ingress traffic respectively to instances within the VPC.
- **control firewall rules**: You can control layer 3 and 4 stateful firewall access rules via a **security group** for the VPC.

VPCs have these constraints:

- **constrained to an IP address**: VPCs have a public IP address like `10.0.0.0/16`
- **able to subnet**: within a VPC, you can make subnets like `10.0.1.0/24` for which VMs within those subnets get a private IP address from available IP addresses from within that subnet range.

You have two ways to apply firewalls in a VPC

- **microsegmentation**: You can configure layer 3 and 4 stateful firewall rules on individual VM instances in a VPC via microsegmentation, called **security groups** for a VM
- **subnet segmentation**: you can apply layer 3 and layer 4 stateless firewall rules to an entire subnet, which adds another layer of firewall defense on top of microsegmentation for instances.

#### Connecting on-premises data centers to the cloud

If you want to opt for the hybrid approach where you use both cloud providers and physical data centers you own, then there are two ways to connect on-premises to the cloud:

1. **VPN**: use a VPN to encrypt internet traffic from your on-premises data center to the cloud provider services.
2. **Physical connection to cloud provider**: some cloud providers allow you to create a physical WAN connection to their data centers so that you get a fast, secure, and private connection to the cloud without having to go through the internet.

Since the major con of using a VPN is that it's both slow and there is still an attack vector of serving traffic over the internet, if you can get a physical WAN connection to a cloud provider, that's the best option.

AWS offers a physical WAN connection service called Direct Connect

### Shared responsibility Model

For IaaS and PaaS you have different levels of shared responsibility between the cloud provider and developer.

**IaaS shared responsibility model**

- **what you manage**: OS patches, good firewall rules, using encryption and secure networking protocols, securing your application code.
- **what the cloud provider manages**: retiring old hardware, securing hardware, providing customers with the tools for network configuration and encryption.


**PaaS shared responsibility model**

- **what you manage**: securing your application code.
- **what the cloud provider manages**: the infrastructure, OS, networking




### Storage types

There are three types of storage services in cloud computing:

1. **block storage**: attaching a hard drive to a virtual machine or some unmanaged service.
2. **object storage**: storing files in a flat hierarchy in a managed bucket
3. **file system**: A file system hierarchy that multiple devices can share storage for, like a shared volume.

Here's a table comparing all of them


|                  | block storage                                                           | object storage                                                                                                                     | file system                                                                       |
| ---------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| privacy controls | only the VM you attach block storage to has access to the block storage | All objects in a bucket have access control determined by a bucket policy. The entire world can read objects from a public bucket. | Only specific VMs you allow to read from the same file system volume have access. |

#### Data Lake (Object storage)

Data lake in cloud computing is object storage for a lot of unstructured data like machine learning or analytics.


### Backups

We use object storage to store backups of VMs using some kind of backup software and then we put that object storage bucket storing the backups in a physically separate location to the service.

Storing gigabytes worth of backups that you might never need seems way too expensive right? Actually no:

We can use archive object storage solutions like S3 Glacier to store backups, since odds are we never actually need a backup and instant access is not required at all.

### Disaster Recovery

A hybrid solution where most of application traffic goes to on-premises and then we have a routing system in place using something like Route53 to redirect 100% of traffic to on-premises data center, and then when a disaster occurs, we route to the cloud as a failover and start routing traffic to the cloud.

### CDNs

CDNs cache requested data from your server and store them in **edge locations** (data centers around the world with the sole purpose of storing static content) closest to the user who requested the data.

For example, if you have a web server running in the NOVA region, then if someone in India requests static content from your web server, then the latency is high because electricity has to travel dozens of thousands of miles between Virginia and India.

But if there is an edge location close to india, then here is how the logic goes:

1. **initial request**: User in india requests static content from server in Virginia
2. **cache miss**: Edge location in India intercepts request, checks if it has the static content in the cache, it doesn't, so it lets the long route network request from India to Virginia take place.
3. **cache hit**: User in india requests same static content from server in Virginia, Edge location in India intercepts request and sees it's a cache hit, so it immediately returns the cached static content, reducing latency.

Obviously, the CDN caches static data for all people close to the edge location, benefitting everyone in the edge location.

So to recap, here are the main benefits of using a CDN:

- **reduced latency for static content**: Users requesting static content from your web server will get cached content from edge locations, reducing latency.
- **reduced bandwidth and cost**: Because requesting cached static content is taken over by edge locations, it reduces the load on the main server, improving performance and lowering costs at the same time.
- **extra firewall security**: You can have firewall security at edge locations to prevent malicious traffic from reaching the main web server, stopping them at the edge.



### DNS

Here's how normal DNS works:

1. Provide domain registrar with list of nameservers (the authoritative nameservers) that know the mapping of my owned domain name to the IP address associated with the domain name.
2. User issues a DNS query to find the IP address associated with my domain name, DNS request goes up the chain (if cache miss) until the nameservers return the IP.
3. User establishes a secure connection with found IP.

Cloud DNS offers several advantages over normal DNS:

- **more flexibility**: you can point a domain name to a load balancer IP address for automatic scaling or to other IPs.
- **more network security and rules**: You can attach a firewall to cloud DNS to selectively block ingress traffic based on IP addresses, which is a good DDoS mitigation.
- **weighted routing**: You can choose a certain percentage of traffic to get forwarded to one IP and the rest to another, able to selectively distribute percentages of traffic to different servers like a manual load balancer.
- **health checks and server failover**: Cloud DNS performs health checks to see if certain IP addresses are up and responding, and if not, you can configure Cloud DNS to reroute traffic to failover IP addresses like backup instances.

### Automation in the cloud (IaC)

Infrastructure as code (IaC) allows us to declaratively design how our cloud infrastructure and services should be set up, like what instances to run, their specs, what to install on them, networking, etc.

Terraform is an automated IaC tool that allows to simply apply Terraform configuration files to spin up cloud resources in a cloud provider.

## AWS fundamentals

### 6 benefits of AWS

1. **Trade fixed expense for variable expense**: By using the AWS Cloud, businesses can transition from fixed investments to variable costs, or in others, using a "pay-as-you-go" model With variable costs, customer expenses are better aligned with actual usage, thus creating more financial flexibility.
2. **Benefit from massive economies of scale**: Like buying a product in bulk can result in lower prices per unit, the vast global infrastructure of AWS can result in lower costs for customers. This means that AWS can be used by many organizations, from small startups to major corporations. Businesses big and small can access advanced technologies that were previously only accessible to large enterprises.
3. **Stop guessing capacity**: With the pay-as-you-go model, AWS also offers elasticity for companies to scale up and down resources as they please, meaning there are no lost dollars since they don't have to pay for capacity. Customers can dynamically scale AWS Cloud resources up or down based on real-time demand. This means businesses can achieve optimal performance without provisioning more or less infrastructure than they need. With the AWS Cloud, the company can conveniently scale resources up or down based on actual demand, eliminating the need to guess future capacity requirements.
4. **Increase speed and agility**: When you don't have to worry about managing infrastructure, you can just focus on the software. With the cloud, businesses can rapidly deploy applications and services, accelerating time to market and facilitating quicker responses to changing business needs and market conditions.
5. **Stop spending money to run and maintain data centers**: The AWS Cloud eliminates the need for businesses to invest in physical data centers. This means customers aren't required to spend time and money on utilities and ongoing maintenance. With AWS taking care of the physical infrastructure of the cloud, customer resources can be reallocated to more strategic initiatives.
6. **Go global in minutes**: Businesses don't need to set up their own infrastructure to expand internationally. AWS provides a robust global infrastructure that customers can use to deploy applications and services across multiple areas in minutes.

### AWS pricing models

AWS offers three main pricing models

1. **pay on demand**: pay only for the resources you use and have currently running.
2. **save when you commit**: Commit to long-term usage of a service like 1-3 years to get a discount.
3. **Pay less by using more**: estimate your utilization of resources beforehand and commit to paying for that amount so you don't deal with elastic pricing.

### AWS global infrastructure

Global infrastructure typically involves distributing resources across multiple data centers in different geographic locations. By having redundant systems in various locations, global infrastructure enhances fault tolerance. If one component fails, others can take over to minimize downtime and help ensure high availability.

**Regions** and **Availability Zones** are designed to provide low-latency, fault-tolerant access to services for users within a given area.

> [!NOTE]
> Availability zones consist of many data centers that replicate your data for high availability, and then regions replicate availability zones for high reliability.

- **Region:** A geographic location somewhere in the world (e.g., `us-east-1` in N. Virginia, or `eu-west-1` in Ireland). Each region is completely isolated from the others. As a developer, you want to pick a region closest to your users to keep latency low.
- **Availability Zone (AZ):** Inside every Region, there are multiple isolated data centers known as Availability Zones (like `us-east-1a`, `us-east-1b`). They have independent power, cooling, and networking. If a rogue backhoe cuts the power grid to one AZ, your application can automatically switch to another AZ in the same region without dropping a single user request!

This is how the hierarchy goes:

```
regions → availability zones → data centers
```

#### Regions

AWS Regions are physical locations around the world that contain groups of data centers. These groups of data centers are called Availability Zones. Each AWS Region consists of a minimum of three physically separate Availability Zones within a geographic area.

AWS has several regions across the globe. Here are some things you should know about regions:

- These regions include many data centers and are located far away from other regions, separated hundreds of miles apart from other regions.

Also, regions have select services, like some regions will have some services and other regions other services.

AWS services can be either global or regional. Here is what changes when you have a regional service as opposed to a global service.

- **what changes in regional**: 
	- **cost and availability**: different services are either available or unavailable in different regions, as well as pricing of those services. 
	- **latency**: Also, the farther away an end user is to a region a service is running in, then the more latency they will have.
- **what stays the same**:
	- **data access and security**: Anybody around the world can access a service you host in a specific region, and the security stays the same.
	- **amount of data you can store**: You can store the same amount of data, it's just that data sometimes has to stay in the same region and can't be moved around due to security reasons.

#### Availability Zones (AZs)

An Availability Zone consists of one or more data centers with redundant power, networking, and connectivity. AZs are located a few miles apart from each other.

> [!NOTE]
> It's recommended to distribute your resources across multiple AZs. That way, if one AZ encounters an outage, your business applications will continue to operate without interruption. With this approach of redundancy and resource isolation, AWS customers can achieve the benefits of high availability and fault tolerance.


#### Local Zones

Local zones are smaller versions of regions intended to provide ultra-low latency for AWS services close to a large metropolitan city. 

Although regions are too large to be close to a city like New York, there are local zones closer to cities that allow you to use AWS services in those local zones instead of regions to be as close as possible to your end users to provide the lowest latency.

- **pro (low latency)**: using local zones instead of regions when you're closer to a local zone gives you lower latency for AWS services,.
- **con (less services available)**: Since local zones are pretty small, they have a limited set of AWS services available for use.

#### Outposts

Outposts implement the hybrid model for cloud infrastructure, where amazon ships host devices running AWS services to your company, and now you have AWS infrastructure on premises.


#### Wavelength zones

Wavelength zones are AWS services embedded into 5G networks for faster speeds, but it has a limtied set of AWS services available.

### AWS shared responsibility model

Since AWS is  PAAS, the responsibility model shifts for both the company and AWS.


![](https://i.imgur.com/lfcwUg8.jpeg)

The customer is responsible for managing the security configurations and patches for the OS running in the cloud, while AWS is only responsible for securing access to the cloud itself.

> [!NOTE]
> Another way to think of it is that developers are responsible for security "in the cloud" while AWS is responsible for security "of the cloud".

The customer assumes responsibility and management of the guest operating system (including updates and security patches), other associated application software as well as the configuration of the AWS provided security group firewall.

![](https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/product-categories/security-identity-compliance/compliance/approved/images/7a404923-5572-409c-b30e-6d44706bcd89.92c57224d8acd09bf44d94bc25db5c58419a8941.jpeg)
AWS is responsible for protecting the infrastructure that runs all of the services offered in the AWS Cloud. This infrastructure is composed of the hardware, software, networking, and facilities that run AWS Cloud services.


**What AWS is responsible for**

- **physical security of data centers**: This includes measures like access controls, surveillance, and environmental controls so that people can't hack the physical hardware
- **updating AWS services**: Updating software for compute, networking, storage, and database services is also an AWS responsibility.

**What the customer is responsible for**

- **securing app data and OS configuration**: Companies migrating to the cloud still have responsibilities such as security configurations and data within their cloud environments.
- **updating OS security**: the customer must make sure that their OSs are up to date with the latest security patches.
- **client-side encryption and customer data**

### AWS speedups

AWS offers two core services for speeding up traffic to applications and services hosted on AWS:

- **global accelerator**: routes requests to AWS services through the AWS network for faster speed and multi-region routing options.
- **S3 transfer acceleration**: Improves data transfer speed of S3 objects via AWS Edge network.

Both of these speed up services significantly, but also cost more.

## IAM

### Intro

IAM stands for Identity and access management, which are terminology we should learn:

- **identity**: anyone or anything who has the ability to perform some action on your AWS resources or account, which includes **users**, **user groups**, and **roles**.
- **access**: The ability to do specific actions on AWS resources and to the account of the root user. Access is managing the permissions that are granted to the identity, allowing them to perform or not perform certain actions.

> [!NOTE]
> **in a nutshell**
> ***
> Basically, you give an **identity** (some developer you want to give access to your AWS account or an AWS service you want to be able to access other services) **access** so it can perform scoped, least-privilege actions on your AWS resources securely.


Here are the 4 main components of IAM:

- **user**: an individual user you want to grant access to your AWS resources
- **user group**: a group where policies are applied additively to the group as a whole, and you add individual users to the group.
- **policies**: configuration that allows or disallows permissions for certain resources. You apply policies to users, user groups, or roles so they can gain or lose permissions.
- **roles**: policies that can be temporarily assumed by anyone, typically an AWS service.

> [!IMPORTANT]
> All users, user groups, and roles have a maximum of 10 policies you can apply.

### Roles

Roles allow an identity to temporarily assume a set of permissions/policies. By default, no service in AWS can interact with another AWS service (like lambda executing dynamodb), so for that to occur, you need to give AWS services a role so they can gain access to other services.

### Policies

Policies are JSON configurations that can allow or disallow a set of permissions. Identities can have multiple policies, so it's important to understand how the final set of permissions are evaluated when multiple policies dealing with the same AWS service access clash with each other.

- Policies are evaluated additively, meaning permission sets add to each other via union.
- However, if one policy allows while another denies the exact same permissions, then the deny overrides the allowing.

So here is the full logic behind permission evaluation:

1. By default, no permissions are granted to identities
2. Multiple policies are evaluated additively to extend the set of permissions
3. Explicit DENYs override explicit ALLOWs.





## EC2

### Intro

EC2 stands for Amazon Elastic Compute Cloud, and is the raw compute which provisions an OS for you on a machine with specs you configure and then you do whatever you want with it.

EC2 offers the most granular control over compute in the cloud, since you can install whatever you want and run whatever you want on an EC2 instance.

An _unmanaged_ service like Amazon EC2 requires you to perform all of the necessary security configuration and management tasks. When you deploy an EC2 instance, you are responsible for configuring security, managing the guest operating system (OS), applying updates, and setting up firewalls (security groups).

-   **customer responsibility**: The customer is responsible for configuring, securing, and managing the operating system, networking, and applications on their EC2 instances.
- **AWS responsibility**: AWS is responsible for securing the physical infrastructure your EC2 instance lives on.

#### **multi-tenancy**

An EC2 instance is a single virtual machine, which lives on a physical machine called a **host**.

**Multitenancy** is the process of VMs sharing and divvying up compute resources allocated by the host to coexist on the same host while being isolated from other VM instances, which is made possible by the **hypervisor** component of a host..

The **hypervisor** is a physical component of a host that enables virtualization, allowing multiple VMs to coexist and share resources on the same physical machine without affecting each others' data. The hypervisor manages CPU, memory, networking and storage of each individual VM to ensure isolation.

Hypervisors come in two types:

1. **Type 1 (Bare metal)**: Run directly on hardware, like windows hyper-v (virtualization is baked into the hardware itself, not OS).
2. **Type 2 (hosted)**: Runs on an OS, like Ubuntu with VirtualBox (virtualization is made possible by the OS, not the hardware).


#### EC2 is an unmanaged IaaS

Since EC2 just gives you the bare metal and the OS and raw compute resources, it's classified as **IaaS (Infrastructure as a service)** and is thus classified as an **unmanaged service**.

- **unmanaged service**: a service where users are responsible for configuring the OS, applying security patches, updating software, etc., while AWS is responsible only for the physical machine and infrastructure.



### All about EC2

#### EC2 instance types

When creating an EC2 instance, you need to the choose EC2 instance type (how powerful you want it) and the Amazon Machine Image (AMI), which determines the operating system and software for your instance.

The EC2 hierarchy is divided into **instance families**, and then each family has several **instance types**

Here are the instance families:

- **general purpose**: provide a good balance of compute, memory, and networking resources.
	- **use cases**: web servers, code repositories
	- **when to use**: when you don't know what type of workload you'll have ahead of time
- **compute optimized**: Ideal for compute-intensive tasks
	- **use cases**: high performance computing, scientific modeling, machine learning
	- **when to use**: when you will have a lot of CPU-bound work to do
- **memory optimized**: Ideal for memory-intensive tasks, like processing large datasets in memory
	- **use cases**: dataset processing
	- **when to use**: when you have workloads that require you to load lots of data in memory. Memory optimized instances are designed for high-memory workloads and offer the performance needed to handle large volumes of data efficiently, making them the best choice for real-time analytics.
- **storage optimized**: Ideal for workloads that require high performance for locally stored data
	- **use cases**: I/O on files living on the instance. Storage optimized instances are designed for workloads that require high performance for locally stored data, such as large databases, data warehousing, and I/O-intensive applications.
	- **when to use**: when you have workloads that require high speed and performance with I/O reading and writing of files living on the instance disk. Storage optimized instances are designed for workloads that require high-disk throughput and low-latency access to large datasets. This makes them the best choice for data analytics applications.
- **accelerated computing**: they use GPU hardware accelerators for high performance on tasks like floating point number calculations and graphics processing
	- **use cases**: graphics processing, floating point number calculations, machine learning
	- **when to use**: when you have workloads that can be made more efficient using a GPU.


#### EC2 AMIs

An AMI includes the operating system, storage setup, architecture type, permissions for launching, and any extra software that is already installed. You can use one AMI to launch several EC2 instances that all have the same setup.

> [!NOTE]
> You can think of an AMI as a base docker image to build your EC2 instance from.

AMIs can be used in three ways. 

1. **use custom AMIs**: First, you can create your own by building a custom AMI with specific configurations and software tailored to your needs. 
2. **chose AMI presets**: Second, you can use pre-configured AWS AMIs, which are set up for common operating systems and software. 
3. **buy third-party AMIs**: Lastly, you can purchase AMIs from the AWS Marketplace, where third-party vendors offer specialized software designed for specific use cases.

AMIs provide repeatability through a consistent environment for every new instance. Because configurations are identical and deployments automated, development and testing environments are consistent. This helps when scaling, reduces errors, and streamlines managing large-scale environments.

#### Creating EC2 instances

To launch an EC2 instance for a web server, here are the required components:

Here are the required components:

- **AMI**: configure the AMI to define the operating system and software
- **instance type**: select the instance type to allocate CPU, memory, and storage;
- **EBS storage allocation**: set up storage options, including the type and size of the EBS volume to mount to your instance.
- **VPS**: choose the VPS and subnet and hence availability zone your instance will be located in.
- **security group**: create a security group, which is sort of like a firewall managing all traffic to your instance, creating rules for SSH, HTTP, and HTTPS connections to your instance.

Load balancing, permissions, and instance termination behavior are not required when launching a basic Amazon EC2 web server.

Here are some more details on the optional components:

- **User data**: you can specify a startup script for the instance to run when booting up.
- **termination protection**: you can enable termination protection, which puts an extra step and prevents haphazard termination.

#### Elastic IP addresses

When instances terminate and then start up again, they are automatically assigned a random available public IP address. If you don't want this behavior and instead want your instance to have a fixed IP address, you can use the **elastic IP service**, which gives you ownership of a static IP that you can assign to an instance, unchanging.

However, since there are so few public IPv4 addresses in the world, there are some disadvantages to elastic IP:

- **cost**: Amazon charges you for unused IPs to discourage you from taking the valuable fixed IP addresses.
- **scarcity**: Since public IPv4 addresses are so scarce, you can only have a few elastic IPs per region and account.

Instead of using elastic IP, it's better, cheaper, and more robust to attach a DNS record mapping a domain name to your public instance, for which the domain name is unchanging and unaffected by constantly changing IP addresses.

### EC2 pricing


With EC2, you have many different plans for pricing:

- **on-demand**: pay-as-you-go, where you only pay for the hours that the EC2 instance is running. Pay only for the compute capacity you consume with no upfront payments or long-term commitments required.
- **capacity reservations**: With Amazon EC2 Capacity Reservations, you reserve compute capacity in a specific Availability Zone for critical workloads. Reservations are charged at the On-Demand rate, whether used or not. You only pay for the instances you run. This is ideal for strict capacity requirements for current or future business-critical workloads.
	- **use case**: Critical workloads with strict capacity requirements
- **savings plans**: you pay less for EC2 given that you commit to using it (Amazon locks you in). Save up to 72 percent across a variety of instance types and services by committing to a consistent usage level for 1 or 3 years. Payment options include All upfront, Partial upfront, or No upfront.
	- **use case**: predictable workloads where you know the forecasted capacity ahead of time.
- **reserved instances**: Get a savings of up to 75 percent by committing to a 1-year or 3-year term for predictable workloads using specific instance families and AWS Regions. 
	- RIs offer up to 75 percent savings over On-Demand pricing by applying discounts across instance sizes and multiple Availability Zones within a Region. 
	- When you purchase a Reserved Instance (RI), AWS automatically applies the discount to other instance sizes within the same family based on the instance size footprint. 
	- It also applies the discount across multiple Availability Zones for enhanced resource distribution and fault tolerance.
	- **use case**: Steady-state workloads with predictable usage
- **spot instances**: Bid on spare compute capacity at up to 90 percent off the On-Demand price, with the flexibility to be interrupted when AWS reclaims the instance.
	- **use case**: for workloads that can be interrupted and restarted, like cron jobs. Not ideal for web servers or other long-running processes.
- **dedicated hosts**: Reserve an entire physical server for your exclusive use. This option offers full control and is ideal for workloads with strict security or licensing needs.
- **dedicated instances**: Pay for instances running on hardware dedicated solely to your account. This option provides isolation from other AWS customers

#### Dedicated hosts vs dedicated instances

- **dedicated hosts**: when you reserve an entire block of physical machines for your EC2 instances to run on
- **dedicated server**: when you reserve a single physical machine for your EC2 instance to run on.

![](https://i.imgur.com/w3D73pC.jpeg)


The key difference is that Dedicated Instances provide isolation without you choosing which physical server they run on. Dedicated Hosts give you an entire physical server for exclusive use, providing complete control over instance placement and resource allocation.


#### A main gotcha

EC2 is the most expensive service in AWS because you're essentially renting a slice of infrastructure from AWS, infrastructure everybody else wants to use as well.

You only pay for an EC2 instance if it is up and running, but even when you stop an instance, you still pay for the block storage volume attached to the instance.


### VPCs

VPCs (Virtual private clouds) allow you to create a logically isolated section of the AWS cloud where you can launch and manage regional AWS resources in a customized network environment.

- You can define IP address ranges, subnets, route tables, stateful firewalls via **security groups** and stateless firewalls via **NACL**s to protect entire subnets.

> [!NOTE]
> In other words, it's a simple way to group EC2 instances together and then apply the same network settings to all of them. 

VPCs span across multiple availability zones, and then have subnets inside of one where you a subnet can only be attached to one availability zone at a time.

Because subnets are one-to-one with availability zones, you can decide to make a subnet public (allow internet connection) or private (only allow intra-VPC connection).

Here are the core components of a VPC:

- **subnets**: a grouping of instances within a single availability zone. A subnet always has two important networking components that decide routing for ingress and egress traffic:
	- **route table**: a configuration of routing rules that determine cross-subnet communication rules and egress internet traffic rules (if the subnet is public).
	- **NACL**: a stateless firewall that controls ingress and egress traffic rules for the entire subnet.
- **individual instances**: Each individual instance has a security group (stateful firewall) to determine ingress and egress rules for that individual instance.

The largest CIDR address subnet mask a VPC can have is `/16`

#### Subnets


All instances can communicate with all other instances within the same VPC, but to manage stuff like internet connection or communicating with other VPCs, we group instances inside a VPC into **subnets**, either public or private to grant them access to the internet or not.

- **public subnet**: A subnet within a VPC where instances can communicate with the internet by attaching an **internet gateway** to the public subnet.
- **private subnet**: A subnet within a VPC where instances cannot communicate outside the VPC.

An **internet gateway** is a component that enables communication between resources in your VPC and the internet, allowing EC2 instances within a VPC to send stateful ingress and egress traffic to the internet.

To enable an internet gateway for your VPC, you should attach it to a specific subnet, making that subnet public, and then you will be granted a public IP address and the route table will become an edge router for your VPC, taking on the public IP address and making it the default gateway.

Here are general rules of subnets:

- **a way to have private subnets send egress traffic to the internet**: To allow instances within a private subnet to perform egress traffic to make internet traffic (but not allow ingress traffic), you can add a **NAT gateway** so that instances within a private subnet can still make egress internet traffic.
- **all devices within the same VPC can communicate with each other**: Even if devices are in different subnets, they can all communicate with each other if they are in the same VPC, but they have to go through two layers of defense: 1) the route table and 2) the NACL for the subnet


Each subnet will be placed in an availability zone, and you can create multiple subnets and thus have them be assigned to multiple availability zones, ensuring high availability for your instances.


![](https://i.imgur.com/qkF5Eht.jpeg)


For example, if you have two public subnets, you can place them in two different AZs.

- This arrangement allows resources in those subnets to remain operational even if one AZ experiences issues.

#### Security groups and NACLs

When creating EC2 instances, you can assign **security groups**, which creates a **stateful firewall** for the instance and you are able to control inbound and outbound traffic via layer 3 and 4 firewall access control list rules.

NACLs are basically the same thing as security groups but they are a firewall for entire subnets and you write the layer 3 and 4 firewall access control list rules yourself, starting from scratch with a **stateless firewall**.

You must set both security groups and NACLs when configuring a VPC:

- **individual instances**: require a security group to be attached to them
- **subnets**: require a NACL to be applied to them.


However, there are differences between security groups and NACLs:

- **security groups** use a **stateful firewall** (always allows network responses back from an allowed request) while NACLs use a **stateless firewall** (needs explicit rules for both ingress and egress traffic)
- **NACLs** are firewalls for entire subnets (less fine-grained) while security groups are firewalls for individual ec2 instances (more fine-grained)

**NACL in depth**

NACLs are stateless firewalls you can configure with standard layer 3 and 4 security rules, and are applied to entire subnets at a time, applying the firewall settings to the subnet itself rather than the individual instances.

Because NACLs are stateless, you need to define explicit rules for both egress and ingress traffic, which can be annoying to do.

#### VPC peering

VPC peering allows you to connect two VPCs together so devices in different VPCs can communicate with each other. If you need cross-VPC communication across more than 2 VPCs, then you should use **transit gateways**

- **VPC peering**: allows devices in two different VPCs to communicate with each other by connecting two VPCs together.
- **transit gateway**: 

#### AWS privatelink

If you want to securely use other AWS services like S3 in your instance, then instead of having to expose your instances publicly by having them connect to the internet,  you can take advantage of AWS's private WAN across the globe to use VPC endpoints, a way to connect to AWS services without going through the internet.

**AWS privatelink** is the service that intercepts network requests destined for AWS services and replaces those internet requests with AWS private WAN requests by requesting the VPC endpoint for that service instead.


#### Creating a VPC

- **default VPC**: by default, AWS creates a VPC for you in every single region. 
	- This is called the default VPC, but it is not very secure, so don't use it!


### Load balancing

With EC2, you have access to two types of scaling:

- **vertically scaling**: beefing up the specs (RAM, storage) of a VM so your application can handle more load.
- **horizontally scaling**: distributing compute across multiple VM instances so your application can handle more traffic.

We can also use load balancing EC2 instances as a way to horizontally scale our application, which we can do with the help of two services:

1. **EC2 auto scaling**: automatically adds or removes EC2 instances based on certain conditions, like traffic, always scaling to accommodate load.
2. **Elastic Load Balancer**: service used to distribute load evenly across available instances, to make sure no single instance reaches max capacity and fails.

There are two types of load balancers:

- **application load balancer**: allows you to programmatically inspect network traffic and decide how to intercept those requests and distribute them across instances. Ideal for HTTP traffic.
	- **when to use**: for most HTTP-based apps like web servers
- **network load balancer**: A lean, simple load balancer with limited configuration options, and has a fixed IP address. 
	- Ideal for non-HTTP traffic and when you have a fixed number of instances you want to distribute traffic to and you don't want to implement auto-scaling.
	- **when to use**: for most non-HTTP based apps like cron jobs running some process.

Both load balancer types have two important components:

- **target group**: the group of servers to register for traffic distribution, either created by selecting individual instances, selecting by IP range, or other methods.
	- All a target group does is collect instances together to prepare for load balancing. It doesn't do any traffic distribution itself, it only sets up the infrastructure.
- **load balancer**: The actual load balancer component is what distributes traffic equally across the instances and dynamically changes how much traffic gets sent to each subnet/instance  by performing periodic health checks to check the status of instances.
#### Creating a network load balancer

A network load balancer's main use case is to equally distribute traffic across multiple subnets and thus instances within the same VPC, without any auto-scaling.

Here's the basic flow of how a network load balancer works:


![](https://i.imgur.com/Y9D0WmD.jpeg)

1. The network load balancer receives traffic
2. It distributes the traffic equally across the subnets registered with the load balancer
3. Using the network load balancer, the subnets equally distribute traffic across the instances they contain.

The general steps for creating a network load balancer are:

1. Create a target group
2. Create a network load balancer that lives in the same VPC as the target group and chooses the target group you just created as the target group to target for traffic distribution.

**creating the target group**

Here are the general steps:

1. Create at least two instances which are complete copies of each other and are in the same VPC, have the same user data scripts, but live in different availability zones.

![](https://i.imgur.com/7v3YcEo.jpeg)

2. Create a **target group** within the EC2 console and specify that you want to target instances for a certain VPC.


![](https://i.imgur.com/Wa20BP3.jpeg)

3. Select the exact instances in the VPC you want to include in the target group

#### Elasticity, Auto-scaling groups, and load balancers

**Elasticity** refers to the concept of growing or shrinking infrastructure resources dynamically to respond to changes in demand. 

There are three main components to an elasticity service:

- **metric observability**: Elasticity observes a certain metric's level to decide whether to scale in or scale out, such as CPU utilization of an instance.
- **scaling out**: The elastic metric surpassing some threshold level should add more instances to meet performance requirements.
- **scaling in**: The elastic metric dipping below some threshold level should remove instances to reduce costs during times of low usage.


In AWS, an auto-scaling group implements an elastic service and lets you choose a specific EC2 instance template for automatic horizontal scaling and then configuring important components like:

1. **network connectivity details**: Which VPC and subnet to put horizontal scaling instances in.
2. **scaling policy**: criteria threshold for which auto-scaling should kick in after, like a certain amount of CPU utilization for an instance or a certain amount of ingress or egress network traffic threshold is crossed. 
3. **number of instances**: You can choose a minimum and maximum number of instances you want for scaling, and then choose a preferred amount of instances to run for horizontal traffic.

**scaling policy**

The scaling policy lets you define a threshold for your auto-scaling group that if crossed, then new instances are added and if below the threshold, instances are removed to accomodate the current level of the certain metric in comparison to the threshold.

For example, creating a scaling policy where we set the threshold of CPU utilization to 50% for an instance means the following:

- If CPU utilization is above 50%, then scale up.
- If CPU utilization is below 50%, then scale down to normal.

**wiring up an auto-scaling group**

Here are the high-level steps to creating an auto-scaling elastic load balancer architecture:

1. Create an auto-scaling group
2. Create an elastic load balancer and connect it to the auto-scaling group so that new instance replicas are added to the target group. 
3. Create a scaling policy to configure the contract for scaling in and out.


#### Creating an application load balancer with auto-scaling

Here's some terminology:

- **launch template**: a reusable template to create individual EC2 instances or use in an auto-scaling group
- **launch configuration**: a reusable template that can only be used for an auto-scaling group, not for creating individual instances.

Here are the steps to create an auto-scaling group.

1. Create an auto scaling group for your instance. 
2. First create a **launch template** that basically configures the EC2 instance type and specs for the blueprint of the EC2 instances the scaler should add for horizontal scaling. 
3. Then select the launch template.
4. Choose the VPC and within that the subnets the scaling should happen in (which specific VPC and subnet should new automatically scaled instance replicas be added to?)
5. Associate an **elastic load balancer** with the auto-scaling group you just created, so that new instances are automatically added into the load balancer's target group. 

The next steps are to associate an elastic load balancer with the auto-scaling group. In this case, we'll walk through how to create a new elastic load balancer:

6. Choose whether the load balancer should be internet facing (able to handle egress and ingress traffic) or internal (no connection to internet)
7. Create listeners (which port and which protocol to listen for network traffic) that redirect and distribute traffic to an autoscaling group.
8. Create a **scaling policy** that is a criteria threshold for which auto-scaling should kick in after, like a certain amount of CPU utilization for an instance or a certain amount of ingress or egress network traffic threshold is crossed.

**creating the network load balancer**

1. Once you create the target group, go to **actions -> associate with load balancer** to create a load balancer for this target group.


![](https://i.imgur.com/tFV9ihs.jpeg)

2. **Choose load balancer type**: Select whether the load balancer should be internet facing or internal.
	- Choose **internet facing** if you are distributing traffic across web servers that people can make inbound internet traffic to. If your load balancer is internet facing, it must have a public IPV4 address.
	- Choose **internal** if you are making a load balancer for a database.
3. **Choose the VPC the NLB should be placed in.** 
	- This should be the same VPC the instances you're trying to distribute traffic to are located in.
4. **Attach a security group to the load balancer** for stateful firewall security for the load balancer.
	- The most common use case is to use the exact same security group that you use for the instances in the target group so that everything has the same network settings.
5. **Choose a routing action for a target group**: You have the choice to either forward traffic to the routing group, forward traffic to some other URL, or send back a fixed HTTP response you craft.

### Storage on EC2 instances

#### EBS

**EBS (Elastic block storage)** is a volume mount for EC2 that acts as persistent hard drive storage for the instance, allowing instances to store file data across terminations. 

> [!NOTE]
> EBS is the default storage option for most AMIs.

Since EC2 is regional, EBS is also regional, and a volume must always be in the same availability zone as the instance you want to attach it to.

These are the benefits of EBS:

- **data persistence**: Allow an EC2 instance to store file data across terminations, booting up data from the volume mount.
- **encryption and durability**: EBS provides file-encryption for security and snapshots of volume storage so that data can be restored at any time.
- **performance**: EBS is fast.

Here are the core properties of EBS:

- **able to change storage capacity**: You can either change storage capacity manually or even dynamically if needed.
- **snapshots to freeze instance in time**: Like a docker container, you can make snapshots of an EC2 instance to save all downloaded software, configuration, and files on that instance and create new instances from that snapshot.
- **multi-attach**: If multiple instances need to share files between them, then you can share the same EBS volume and mount the volume to all instances so they effectively use the same hard drive.
	- **con 1**: this option is only available for some instance types, not all.
	- **con 2**: you have to write your own file lock logic to prevent two instances from writing over the same file simultaneously.

Since EBS is the actual physical storage on a host device provisioned for VMs via the hypervisor, you have these hardware choices which determine the storage performance of EBS:

- **general purpose SSD (gp3 and gp2)**: Uses an SSD for EBS. This is the best for general purpose storage.
	- Always choose gp3 over gp2, since gp3 is newer, has better performance, and is cheaper.
	- **use case**: general purpose
- **Provisioned IOPS SSD (io1 and io2)**: Uses a high performance SSD that is optimized for even faster reads/writes, it has more IOPS than general purpose SSD. 
	- Although it has more IOPS and is thus faster, it is also more expensive.
	- **use case**: applications that need low latency and high performance.
- **HDD**: uses a hard disk drive, which has more storage but slower performance for reads/writes.
	- **use case**: infrequently accessed archive storage that you want absolutely zero data loss for, but low latency is not a requirement.


> [!NOTE]
> IOPS stands for **inputs and outputs per second**, so the higher the IOPS for a volume type, the faster the read/write operations are for that storage.

#### EC2 instance store

Although EBS is more widely used and is the default block storage option for most AMIs, EC2 instance store is an alternative block storage option, which is the physical hard drive on the host machine that contains the EC2 VM, where storage is managed via virtualization.

So let's recap the difference between EC2 instance store and EBS:

- **EBS**: a physically separate managed block storage volume that you mount to an instance or mount to many instances at once.
	- **pro**: Having the volume be physically separate from a host machine a VM is running in allows you to use EBS for snapshots to restore EC2 instance state and also perform multi-attach operations where several instances can have the same EBS volume attached and thus share the same hard drive effectively.
- **EC2 instance store**: the physical hard drive on the host machine where the VM is running. The shared storage is managed via virtualization so the VM gets only the storage applicable to it.

#### EFS and FSx

EFS (elastic filesystem service) is a pre-formatted filesystem storage that lives in a VPC that multiple different services can use (not just EC2) and is built for scale. 

This means whatever instances and other AWS services you attach an EFS volume to, they will be able to access the same files, sort of like S3 except EFS has filesystem hierarchy, so long as they are in the same VPC.


> [!NOTE] 
> In EFS, multi-attach to multiple different services and instances is the core feature and reason why you would want to use a shared filesystem service like EFS


In summary, here are the key properties of EFS:

- **lives in a VPC**: When creating an EFS volume, you choose which VPC it will live in, meaning only instances and other services that live in that VPC can use the same EFS volume.
- **built for multi-attach**: Multiple different services and instances can share the same mounted EFS volume, which is the point.
- **scale**: EFS automatically scales the filesystem storage size

FSx is the same thing as EFS but specifically purposed towards high performance file access workloads.


## CloudFront and Route53

### Creating DNS records

Route53 allows you to create DNS records where you can buy a domain through route53 or prove that you own one, and then connect that domain via DNS records.

AWS provides a special capability that instead of supplying a target IPv4 address for A records, you can map a domain name to a specific AWS service and provide custom routing instructions.

### CDNs with CloudFront

CDNs cache requested data from your server and store them in **edge locations** (data centers around the world with the sole purpose of storing static content) closest to the user who requested the data.

CloudFront uses AWS's edge locations to decide what resources and requests to cache and which edge locations to store the cached data in. These two control surfaces have specific terminology:

- **content origins**: Content origins are the specific AWS service you want to cache content for, caching requests from a region-based service like Lambda, S3, EC2, or a load balancer and then distributing the cache globally via edge locations.
- **cache policies**: You can create cache policies to decide how content gets cached and connect different caching policies to different distribution patterns.

The great thing about cloudfront is that it works with any AWS service that produces a public IP, like lambda, S3, load balancers, route 53, etc. so you can not only cache bucket objects but also server requests.

#### Creating a cloudfront distribution

1. **select the origin domain or content origin**: The origin domain is syntactic sugar for the specific IP address of an AWS service you want to connect to, like a specific S3 bucket or load balancer. The CDN created will cache data returned from requesting that AWS service.
2. **choose cache policies**

The result is a domain name that cloudfront provides that basically copies requests from the content origin to all edge locations around the world.


#### SSL with cloudfront

You can also enable SSL with cloudfront by using the Amazon Certificate Manager (ACM) service to create a certificate and then using that certificate for SSL encryption with a cloudfront record.

1. Create a certificate with ACM by certifying you own a domain via DNS records
2. Create a cloudfront CDN using the verified domain and attach the SSL certificate in the settings

## S3

### Intro

S3 is a hosted object storage system with 99.999999% durability, which means data loss or corruption is extremely unlikely.

- **object storage**: storage of files with no filesystem, unlimited storage capacity.
- **block storage**: hard disk storage which you can boot up OSs from

Here are the main properties of S3:

- **hosted object storage**: S3 consists of buckets, which is a singular level filesystem, where all files are grouped at the same level. 
	- You can mock a filesystem using **object keys**, which simulate folders, but in reality they are not actual folders. To have a real filesystem, you need block storage.
- **high durability**: S3 has eleven 9s of durability, meaning that for every billion objects you store in S3, only one gets corrupted or lost. This means data loss is extremely improbable.
- **granular access control**: you have control over who can access the bucket and even access to individual objects within the bucket

### Storage classes

AWS offers different storage classes so you can strategically choose your pricing tier according to the file-access patterns you foresee with S3 object storage.

There are three categories of storage classes:

1. **frequent access**: for objects that are frequently accessed every few seconds or minutes, and instant access should be required (no cold starts). This offers the fastest speed but is the most expensive.
2. **infrequent access**: for objects that are accessed infrequently, you can get a discount for objects that you don't use that just sit in your storage but then you pay a retrieval cost for each time you retrieve the item.
3. **archive**: for objects that are almost never accessed, but has to live in storage. In this storage class category, instant access is not always possible, and you may have to wait for a few hours before being able to retrieve the file. The cost savings are high but come with a steep retrieval cost and slow access time.

Basically these are the advantages / disadvantages for each category:


| Storage class category | Description                                                                          | Use case                                        |
| ---------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Frequent access        | highest flexibility but most expensive                                               | For objects that need to be frequently accessed |
| infrequent access      | cost savings but retrieval cost for any objects you retrieve                         | For objects that are infrequently accessed      |
| archive                | The cost savings are high but come with a steep retrieval cost and slow access time. | For objects that are almost never accessed      |

#### Intelligent tiering

Intelligent tiering is a type of storage class that moves an object into the frequent access, infrequent access, or archive storage class category depending on the type of file it is. 

- **pro**: optimizes storage for the type of file and file access pattern.
- **con**: costs more than standard, however.

### Bucket networking

Each S3 bucket has a unique name and thus has a unique DNS name. You can configure network settings for the bucket to expose objects within that bucket to the public or only to authenticated individuals.

#### Public buckets

To make a bucket public and therefore all of its objects publicly accessible, you must do these two steps:

1. Uncheck the "Block all public access" option when creating the bucket.
2. Create a bucket policy that allows anybody to read files in the bucket, which is specified by the `"s3:GetObject"` and `"s3:GetObjectVersion"` permissions.

### Advanced S3 features

#### Versioning

Bucket versioning allows you to store multiple versions of a file so you can do rollbacks
#### Lifecycle management

Allows you to set rules to transition files between storage classes.

For example, you can set a rule to transition a file into an infrequent access storage class if it hasn't been accessed within the last 30 days.

#### Replication

Much like database sharding, you can replicate buckets as a realtime copy of a bucket, ensuring high availability and durability. You can also replicate objects across regions.

#### Object-lock

When you turn on object-lock, it allows you to freeze objects and prevent them from being deleted or modified.

#### Bucket-level encryption

You can encrypt bucket data automatically so that if a bucket somehow gets leaked, the data can't be read without the decryption key


## Databases

### Overview

Database services are regional and most of them have to be scoped into a specific subnet within a specific VPC because they run on EC2 instances behind the scenes.

There are three types of managed cloud database services AWS offers:

1. **RDS**: relational DB for all flavors of SQL. Regional, so you must scope it to a specific subnet.
2. **Elasticache**: caching DB like Redis. It is Regional,  so you must scope it to a specific subnet.
3. **DynamoDB**: AWS custom NoSQL DB that can be regional or global, but the actual database is managed for you behind the scenes so all you control are specific tables, nothing like hardware profile or network connectivity settings.

These managed database services mean that you don't manage the OS nor the database engine. The shared responsibility model applies here:

**what you're responsible for**

Because this a managed service, that means you do not have access to the underlying OS of the instance running the database which means that shell access into the DB is unavailable.

- **database queries**: secure your queries, make sure they are not vulnerable to injection
- **database network access**: do not allow public access to your database by putting it in a private subnet.

**what AWS is responsible for**

- **hardware and OS**: AWS automatically performs OS patches, failure detection, and recovery to make sure the instances running the DBs are healthy and that the DB is always up.
- **database management**: AWS automatically performs backups, database engine updates, and common database administration tasks.

#### Database backups

All databases have automatic backups which you can configure their behavior. AWS also provides a **central backup management** service for controlling the behavior of automatic database backups, with these two key purposes:

1. **create an automatic backup plan**: controls the frequency of automatic backups, the retetion period, etc.
2. **manage resources and backups**: choose which DBs to put into the backup plan for automatic backups and access past backups.

Automated backups are a **volume-level snapshot** which is a snapshot of the entire instance hosting the DB.

- Automatic backups are deleted after 7 day retention period, but you can specify different retention periods.

You can also take manual snapshots and those volumes are stored indefinitely.


#### Multi-AZ databases

These databases also have an option to be replicated across availability zones, where behind the scenes a DNS record routes to a target group of identical databases in different availability zones, and reroutes DB queries to the DB in the working availability zone.


![](https://i.imgur.com/eAKHykF.jpeg)


### RDS 

#### Intro

RDS (relational database service) is a managed service where AWS manages an EC2 instance that runs a relational database to your configuration. You have three main categories of configuration options:

1. **database engine and version**: You can choose which specific flavor of SQL and which version to run
2. **hardware and network configuration**: You can choose the instance type and specs of the instance that will host the database, and then choose to host the database instance in a specific subnet within a VPC and then attach a security group to apply firewall settings for ingress traffic to the database.
3. **database server settings**: You can configure these options:
	- **database connection**: database connection credentials
	- **high availability**: replicate the database across availability zones for high availability.
	- **monitoring**: observability for database events
	- **encryption and backup settings**

#### Database security

Why does your database need to be in a private subnet of a VPC? Because you don't want clients to query your database correctly.

![](https://i.imgur.com/wpGeNe3.jpeg)

Picture a scenario where we have a server running an on EC2 instance and it queries a database. This is how we should structure our VPC:

- **EC2 instance**: since the web server should be publicly accessible, put the EC2 instance in a public subnet by exposing an internet gateway to the subnet that contains it.
- **Database**: put the database in a private subnet so no public internet ingress traffic can reach it, but connect it to the public subnet via a NAT gateway so that the database and the EC2 instance can communicate with each other.
####  Amazon Aurora

Amazon Aurora is a MySQL and PostgreSQL compatible RDS database that offers better performance and higher availability than standard SQL RDS instances.



### Elasticache

Elasticache is a managed cache storage service that uses cache db engines like Redis or Memcached but with the AWS benefits of network security rules, high availability, and scalability.

Here is what you can configure with the Elasticache service:

- **cache engine**: Redis and the version
- **cluster mode**: If enabled, automatically shards the cache for horizontal scaling
- **high availability**: You can choose across how many availability zones you want to replicate the cache service and how many replicas in each availability zone to have.
- **network settings**: the specific VPC and subnet to host the cache DB in.
- **hardware profile**: the instance type and specs of the instance running the cache service behind the scenes.

### DynamoDB

#### Primer


Amazon DynamoDB is a fully managed, serverless NoSQL database service designed for high scalability and ultra-fast performance.

DynamoDB consists of 4 primary components:

- **Tables:** A collection of data records (similar to a collection in Mongo or a table in SQL).
- **Items:** A single record inside the table (analogous to a row). Each item is a collection of key-value attributes.
- **Attributes:** The individual data fields inside an item (like `id`, `email`, `createdAt`).
- **Primary Key:** Unlike other databases where you can query by any column easily out of the box, DynamoDB _forces_ you to define how you will look up your data upfront. Your primary key can be one of two setups:
    1. **Partition Key (PK) only:** A single unique attribute (like `userId`) used to hash and distribute data across physical storage drives.
    2. **Partition Key + Sort Key (SK):** Also known as a _composite primary key_. This lets you group items under the same Partition Key but sort/filter them uniquely by the Sort Key (e.g., `PK: "USER#123"`, `SK: "ORDER#2026-06-12"`).


> [!TIP]
> **when should you use DynamoDB?**
> ***
> DynamoDB is ideal for applications needing high throughput, flexible data models, and minimal operational overhead, such as web apps, mobile apps, and IoT systems. This makes it a powerful choice when your data model is evolving or when you require fast, scalable access to data without the constraints of traditional relational databases.

Besides being performant, DynamoDB offers three useful capacities:

1. **streaming**: realtime updates by subscribing to an item change or other table events.
2. **global tables**: make tables global instead of just regional, replicating data across the entire world for lower latency.
3. **DAX**: an in-memory cache layer on top of DynamoDB that implements query caching behind the scenes to speed up querying.

**table structure**

In DynamoDB, you can have multiple tables, and each table is data storage for multiple items, which can have different attributes.

- **tables must have primary keys**: All tables must have a **primary key**, which is either the partition key or a combination of the partition key and sort key.
- **Attributes can be different on items**: Each item can have different **attributes**, which is a key-value pair on the item, reflecting the NoSQL nature of dynamodb.
	- Each item can be 400kb in size maximum
	- Each item can have different attribute types



#### Partition key + Sort key

DynamoDB is unique in that it allows you to pick one of two setups for how you structure your primary key.

Here is the terminology:

- **partition key**: The partition key is part of the table's primary key. It is a hash value that is used to retrieve items from your table and allocate data across hosts for scalability and availability by literally partitioning the table across multiple load-balanced database instances.
- **sort key**: You can use a sort key as the second part of a table's primary key. The sort key allows you to sort or search among all items sharing the same partition key.

Here are the two setups:

1. **partition key alone**: records are considered unique or not based on the partition key value. No two records can have the same partition key value
2. **partition key + sort key**: uniqueness of records is based on the combination of the partition key and sort key values. No two record can have the same combination of partition key and sort key values.

> [!NOTE]
> The **primary key** is the unique identifier of an item in a table, and is either the partition key or the partition key + sort key combination, depending on your table setup.

When querying with the partition key and sort key combination, it allows for use cases like finding all resources associated with a specific user, like in the example below, we can easily find all the games a single user specified by its userId has played, without doing a JOIN.


![](https://i.imgur.com/1kfPf3D.jpeg)

#### Creating a DynamoDB table

1. **Choose the primary key**: specify a partition key or a partition + sort key combination
2. **Choose the table class**: Either choose between standard DynamoDB (optimized for frequent reads/writes) or archive DynamoDB (costs less, archive storage)
3. **Choose the pricing option**: Either choose on-demand pricing (auto-scales for availability and load balancing) or **provisioned**, where you guess read/write capacity in advance so it costs less.

**performance**

DynamoDB's implementation of having a partition key and sort key makes for easy sharding.

This means the db doesn't slow down as your data grows. A table with 100 entries operates at the exact same speed as a table with 100 million entries, because AWS uses the Partition Key to calculate exactly which physical hard drive your data lives on instantly!

> [!NOTE]
> DynamoDB automatically scales to handle millions of requests per second with low latency, which is harder to achieve with relational databases.


**Flexibility in schemas**

Unlike traditional relational databases that use multiple related tables with foreign keys and complex SQL queries, DynamoDB uses a single table structure without relationships between tables, offering a flexible schema that can easily adapt as your application grows.

DynamoDB supports flexible schemas and stores data as items (rows) with attributes (columns), similar to JSON documents, whereas relational databases require a fixed schema.

**indexing**

It uses primary keys (partition and optional sort keys) and secondary indexes (local and global) to optimize queries, differing from SQL indexes.


#### Streaming



## Lambda

### Basics

A lambda function is made of three main components:

1. **code**: Either code you upload or from a docker container
2. **event**: Some sort of trigger like an HTTP request or an AWS-service-based trigger like uploading a file to a specific S3 bucket.
3. **configuration**: Changing the behavior of the function by specifying things like max memory to load for the VM running the function, max function timeout, roles for which AWS services it has access to, a persistent filesystem like EBS

**lambda pricing**

Lambda is a pay-per-usage service where you only pay for the total amount of function execution time. 

**lambda limits**

Here are the default limits for lambda:

- **1000 concurrent executions per region**: per region, the max number of lambda functions you can have running at the same time is 1000, but you can get this quota increased.

**lambda invocation type**

There are two ways you can design the behavior of your lambda invocation to be:

- **synchronous**: the function will run and stay alive until it completely finishes its workload or until it reaches the maximum timeout of 15 minutes, and then directly returns the result.
- **asynchronous**: the function works in the background for an unlimited amount of time and immediately returns a background job ID because it offloads the result to some messaging queue implementation like SNS or to eventbridge.

**types of lambdas**

- **HTTPS lambdas**: you can create lambdas that are invokeable via an HTTP request by setting up the **function URL** for the lambda and choosing whether to make calling this require IAM authentication or not.
	- **if IAM auth required**: users have to be identified into a user pool via cognito or be an IAM user of the account to trigger this lambda
	- **if no auth required**: this lambda is completely free and public to the world to use.

**extra lambda resources**

- **event source mappings**: A list of events that automatically trigger lambdas. This tab in the console shows which lambdas are set to automatically trigger on the occurrence of a specific event.
- **layers**: reusable pieces of code you can inject into other lambdas, like a custom logging library.
- **replicas**: replicas of your lambdas that you can push to regions or local zones closer to your users to reduce latency, since lambda is a regional service.

## Containers with AWS

### ECS and EKS

ECS and EKS are unmanaged container orchestration systems for scaling applications in clusters with two main differences:

- **ECS**: uses AWS's custom container deployment and orchestration solution
- **EKS**: uses kubernetes for orchestration and deployment

For both ECS and EKS, you manage container hosts (EC2 instances), choosing the hardware, instance type, etc. that the containers will be running on. 

AWS handles and manages the deployment of containers you push to EKR (the AWS container registry) and uses them to deploy the fleet of containers across the container hosts.

1. Upload a container image to a container registry server, ECR in AWS.
2. Use ECS to choose a **container host** EC2 instance to actually run the container image and choose configuration options like cluster size (how many container replicas), etc

EKS (elastic kubernetes service) is a managed service for kubernetes pods.


### Fargate

If you don't want to manage container hosts, choose the managed service version of running containers, Fargate. 

With Fargate, all you manage is the container image and AWS manages the orchestration and container host.

## CloudWatch

CloudWatch is an observability service that can listen for events and metrics of other AWS services and then direct those events to other AWS services like lambda to execute a cloud function or SNS to send an email notification.

Cloudwatch has two main features:

- **observability of logs**: AWS services send logs of their execution to cloudwatch, and then trigger events based on matching logs to a certain pattern
- **observability of metrics**: All AWS services publish their real-time metrics constantly to CloudWatch and then you can choose to trigger events based on those metrics passing a certain threshold. These events are called **cloudwatch alerts**.

There is also a sub-service within Cloudwatch called **Cloudwatch-agent**, which is a generic logging service where you can send logs programmatically via the cloudwatch agent SDK, store logs in there, and then query those logs and base events off of those.

### Cloudwatch alerts

A cloudwatch alert consists of two components:

- **alarm**: An alarm is a combination of a AWS-service metric and a certain threshold of that metric where if it is surpassed or violated, then we say the alarm is triggered.
- **alarm action**: The notification to send if the alarm is triggered, carried out via SNS topic.

Creating cloudwatch alerts requires three core steps:

1. **select a metric to listen for**: For example, the average CPU utilization of a specific EC2 instance
2. **define the metric threshold**: For example, we want to trigger some sort of event when the CPU utilization of the instance is high, like above 90% because that means we're experiencing unusually high load.
3. **define alarm action**: The SNS topic to send once the alarm (combination of metric and metric threshold) is triggered.

The **alarm action** uses SNS topics to notify subscribers to those topics, meaning an alarm action can send notification emails or trigger services defined in an SNS topic.
### Logs

CloudWatch also stores logs that other AWS services emit to it. 

You can configure which services can send logs to CloudWatch, but by default, all of them automatically do.

Logs are stored in **log groups** you create, and you can configure a log group to do one of two things:

- **store application logs**: Using the SDK, you can programmatically send logs to be stored in a log group
- **store AWS service logs**: You can configure a log group to listen for logs from a specific AWS service, like RDS, lambda, etc., and all thsoe logs will appear in this log group.

Once we create a log group, we can store application logs in that log group and even query that log group and create alarms based off the logs in the log group.


### Creating Alarms

Cloudwatch Alarms are ways to trigger events based on metrics of other AWS services or log patterns you emit into a log group. More in depth:

- **metrics of AWS services**: you can set up alarms that listen for stuff like EC2 instance CPU utilization, billing alerts, etc.
- **specific logs**: Once you create a log group that stores logs you programmatically send to cloudwatch, you can trigger events based on those logs and match specific patterns within those logs.  

## CloudTrail

CloudTrail is a service that creates an **audit trail** for the AWS account, storing action logs from the AWS console, CLI, and SDKs.

CloudTrail then stores those logs in an S3 bucket, making it the source of truth for what actions happened in your AWS account and who performed those actions.


> [!NOTE] 
> **In a nutshell**
> ***
> The main job of cloudtrail is to log which IAM user does what on an AWS account, and then you can create a separate S3 bucket called a **trail** to store all those logs or a certain category of actions you want to track.


You can create S3 buckets to store cloudtrail logs. These buckets are called **trails**, and trails are used to store logs/actions of certain types, like a trail for bucket-related actions or another trail for lambda-related actions.


### Creating a cloudtrail

## APIs

### API Gateway

API gateway is a managed server AWS service where AWS manages incoming HTTP and websocket requests for you and all you have to do is provide the workload that gets triggered on a route match and define how you want the request body and search parameters to look like and what the response should look like.

- **example**: using API gateway, you can define a lambda to get triggered on a GET request to the `/posts` route and enforce certain query parameters, and then API gateway will take care of parsing the request body, headers, and ensuring the lambda gets triggered and returns the desired response from the API

**what you manage**

- The actual work to get done upon a route request and the structure of the response and desired status code to return.
- Which route pattern and HTTP method points to which workload.

**what AWS manages**

- staging for APIs, allowing API versioning
- parsing of request body, headers, route parameters, search parameters, and response body.


### AppSync

AppSync is a managed GraphQL API service where you take care of defining the schema, resolvers, and mutations, and AppSync takes care of the rest by setting up the API, supporting web sockets, and optimizing with caching.


## AWS easy ways to deploy apps

### AWS Amplify

AWS amplify is a frontend SDK that manages AWS services on your behalf so you can deploy an app using AWS services without worrying about the underlying infrastructure.


### Elastic Beanstalk

Elastic Beanstalk is an abstraction over EC2, VPCs, and load balancers to give you a managed instance with a programming language of your choice already installed, like nodejs.

Elastic Beanstalk gives you sensible defaults and abstracts away VPCs and load balancers, giving you the option to scale if you want but without having to know anything about networking.

Behind the scenes, Elastic Beanstalk does this for you:

1. **Chooses an EC2 instance**: Provisions an EC2 instance with the Amazon Linux AMI
2. **does networking defaults for web servers**: Uses the default VPC within a region and creates a security group for the instance which only allows ingress HTTP traffic on port 80.
3. **creates an auto-scaling group and load balancer**: Creates an auto-scaling group which is configure to replace an instance if terminated or unavailable.
4. **stores artifacts**: Creates an S3 bucket to store source code, logs, and other artifacts Elastic beanstalk needs to ensure your application is always up and can be brought back after a server crash.
5. **Creates cloudwatch alarms**: Creates two alarms: one to monitor load and another to trigger when traffic for the auto-scaling group is not appropriate.
6. **Creates a domain name**: Creates a domain name that points to the underlying instance running your web server code.

## App integration

Web servers often need external services like a messaging queue or email service or web scraper instance, but there is extra overhead in writing APIs for all of these services and managing the instances and networking settings for those services as well.

AWS offers managed app integration services for those use cases which allow any AWS service to query those app integration services to execute some workload, like sending a notification or queueing a background job.

- **SQS**: simple queue service is a background job messaging queue used to store background job messages which other services can query.
	- **asynchronous processing**
	- **directly triggered in code**
- **SNS**: simple notification service is used to send emails and notifications.
	- **synchronous processing**
	- **directly triggered in code**
- **EventBridge**: stores events and forwards them to other services.
	- **synchronous processing**
	- **indirectly triggered because of events**


### SQS


![](https://i.imgur.com/QSrc9ep.jpeg)

SQS is a managed messaging queue service where AWS services can push messages to the queue and read them.

**programmatic methodology**

When using the SQS SDK, here is the basics behind how this messaging queue service works from code:

1. An application pushes messages to an SQS store 
2. Another application constantly polls for messages from the SQS store by subscribing to it, and if something applies to it, it executes some code based on the message payload, then it marks the message as **processed** via the AWS sdk.
3. processed messages are removed from the queue


### SNS

SNS is a service for notifying subscribed observers, like AWS services that should all be notified when a notification is triggered.


![](https://i.imgur.com/lYvqanS.jpeg)

> [!NOTE]
> The main difference between SNS and SQS is that SQS processes data and runs workloads on them **asynchronously** while SNS requires apps to initiate programmatic subscriptions to notifications where they will then process the notification **synchronously**.

It's a service that decouples **message publishers** from **subscribers** to achieve a seamless notification system:

- **publisher**: Publishers sends messages to an SNS topic.
- **subscribers**: Subscribers subscribe to a specific SNS topic, which provides a unified interface for A2A or A2P messaging:

There are two types of messaging you can do:

- **Application to application (A2A)**: When the publisher is an AWS service and the subscriber is another AWS service like SQS, Lambda, etc.
	- **example**: SQS subscribes to an SNS topic, so when we push a message to an SNS topic, that message gets pushed into SQS.
- **Application to person (A2P)**: When the publisher is an AWS service and the subscriber is a service meant to direct the message to an end consumer like a push notification, email, or SMS.

#### SNS topics

SNS topics are the type of notification to trigger, of which you have several options:

- **HTTP endpoint**: triggers an HTTP request to some specific endpoint
- **SMS**: sends a text message to a desired recipient
- **email**: sends an email to a desired recipient
- **AWS service**: notifies a supported AWS service with a message data payload.

### EventBridge

EventBridge is an event bus service that listens to events and then triggers actions in another service.

You can use event bridges to listen for built-in AWS service events or custom events, and then immediately triggers an action based on those events.

**event bridge rules**

Rules are the basic building block of defining the events to listen to and then what services/actions to trigger based on the event that was captured.

here is some important rule terminology:

- **event**: some sort of event that a rule should listen for
- **task**: an action/service to trigger
- **rule**: the combination of events to listen for and tasks to execute.

Here is what you define to create a rule:

1. **rule type**: whether to run a task based on matching an event to an event pattern or to run a task based on a schedule like a cron job (this is just a special event).
2. **events to listen for**: Choose which events you want to listen for from a specific service or set up your own custom events


### Step functions

Step functions are workflow creators like Upstash workflow where you can group services together to run in a flowchart manner using **state machines**.

Based on the state machine you set up, you can define **states** to be individual AWS resources that execute some functionality, like a lambda function.

Step functions are also IaC and will actually provision the resources you define in the state machine for you, automatically spinning up the lambdas and other services in the flowchart for you.

Here are the main things you can do in a step function:

- **accept inputs**: You can create dynamic, reusable workflows by accepting input variables to change certain parameters when executing the state machine.
- **create states**: You can create lambdas and then define them as states for serverless execution, where those lambdas only get triggered based on the path of the flowchart.

In summary:

- **use case**: For complex, multi-step serverless workflows where you need to combine multiple AWS resources in a logical way, like a sequential execution of lambdas

#### Step functions code

Here is what the flowchart for a hello world example looks like:

![](https://i.imgur.com/eA2YFsM.jpeg)

And here is the corresponding code:

```json
{
  "Comment": "A Hello World example that demonstrates various state types in the Amazon States Language, and showcases data flow and transformations using variables and JSONata expressions. This example consists solely of flow control states, so no additional resources are needed to run it.",
  "QueryLanguage": "JSONata",
  "StartAt": "Set Variables and State Output",
  "States": {
    // state 1
    "Set Variables and State Output": {
      "Type": "Pass",
      "Comment": "A Pass state passes its input to its output, without performing work. They can also generate static JSON output, or transform JSON input using JSONata expressions, and pass the transformed data to the next state. Pass states are useful when constructing and debugging state machines.",
      "Next": "Is Hello World Example?",
      "Output": {
        "IsHelloWorldExample": true,
        "ExecutionWaitTimeInSeconds": 3
      },
      "Assign": {
        "CheckpointCount": 0
      }
    },
    // state 2
    "Is Hello World Example?": {
      "Type": "Choice",
      "Comment": "A Choice state adds branching logic to a state machine. Choice rules use the Condition property to evaluate expressions with custom JSONata logic, allowing for flexible branching.",
      "Default": "Fail the Execution",
      "Choices": [
        {
          "Next": "Wait for X Seconds",
          "Condition": "{% $states.input.IsHelloWorldExample %}"
        }
      ]
    },
    // default state to go after state 2
    "Fail the Execution": {
      "Type": "Fail",
      "Comment": "A Fail state stops the execution of the state machine and marks it as a failure, unless it is caught by a Catch block.",
      "Error": "Not a Hello World Example"
    },
    // state to go if $states.input.IsHelloWorldExample is defined.
    "Wait for X Seconds": {
      "Type": "Wait",
      "Comment": "A Wait state delays the state machine from continuing for a specified time.",
      "Seconds": "{% $states.input.ExecutionWaitTimeInSeconds %}",
      "Next": "Execute in Parallel",
      "Assign": {
        "CheckpointCount": "{% $CheckpointCount + 1 %}"
      }
    },
    // next step after Wait for X seconds step
    "Execute in Parallel": {
      "Type": "Parallel",
      "Comment": "A Parallel state can be used to create parallel branches of execution in your state machine.",
      "Branches": [
        {
          "StartAt": "Format Execution Start Date",
          "States": {
            "Format Execution Start Date": {
              "Type": "Pass",
              "Output": {
                "FormattedExecutionStartDate": "{% $fromMillis($toMillis($states.context.State.EnteredTime), '[M01]/[D01]') %}"
              },
              "End": true
            }
          }
        },
        {
          "StartAt": "Snapshot Execution Elapsed Time",
          "States": {
            "Snapshot Execution Elapsed Time": {
              "Type": "Pass",
              "End": true,
              "Output": {
                "ElapsedTimeToSnapshot": "{% ($toMillis($now()) - $toMillis($states.context.Execution.StartTime)) / 1000 %}"
              }
            }
          }
        }
      ],
      "Next": "Set Checkpoint",
      "Catch": [
        {
          "ErrorEquals": [
            "States.QueryEvaluationError"
          ],
          "Next": "Set Checkpoint",
          "Output": {
            "ElapsedTimeToSnapshot": "Failed to calculate",
            "FormattedExecutionStartDate": "Failed to format"
          }
        }
      ]
    },
    "Set Checkpoint": {
      "Type": "Pass",
      "Next": "Summarize the Execution",
      "Assign": {
        "CheckpointCount": "{% $CheckpointCount + 1 %}"
      }
    },
    "Summarize the Execution": {
      "Type": "Succeed",
      "Comment": "A Succeed state indicates successful completion of the state machine.",
      "Output": {
        "Summary": "{% 'This Hello World execution began on ' & $states.input.FormattedExecutionStartDate & '. The state machine ran for ' & $states.input.ElapsedTimeToSnapshot & ' seconds before the snapshot was taken, passing through ' & $CheckpointCount & ' checkpoints, and has successfully completed.' %}"
      }
    }
  }
}
```

Here are the different state types and what they do:

- **pass**: A Pass state passes its input to its output, without performing work. 
	- They can also generate static JSON output, or transform JSON input using JSONata expressions, and pass the transformed data to the next state. 
	- Pass states are useful when constructing and debugging state machines.
- **choice**: A Choice state adds branching logic to a state machine and offers conditional branching for which are the next states to go to.
	- Choice rules use the `Condition` property to evaluate expressions with custom JSONata logic, allowing for flexible branching.
- **fail**: A Fail state stops the execution of the state machine and marks it as a failure, unless it is caught by a Catch block.
- **succeed:** A Succeed state indicates successful completion of the state machine.
- **parallel**: A Parallel state can be used to create parallel branches of execution in your state machine.
- **wait**: A Wait state delays the state machine from continuing for a specified time.

### SES

SES (simple email service) is a service for programmatically sending emails to end users like Resend.

### Cloudmap

CloudMap is a service that is a registry of assigned resource names, like EC2 or containers, making it a useful service for microservices.

Here are the core benefits:

- **helps with inter-app communication**: referring to services by name via cloudmap helps different services in a microservice architecture communicate with one another. 

## Batch jobs

### AWS batch

AWS batch is a service that lets you execute jobs via commanding a fleet of containers. 

It consists of two main steps:

1. **create job definitions**: define the container image to use along with its configuration of hardware, permissions, user data script, and file systems.
2. **execute jobs**: Determine when to execute a job, either on recurring basis via cron job or at a specific time and how many container instances to spin up.

### Compute Optimizer

The AWS computer optimizer is a service that uses machine learning to analyze cloudwatch metrics of an EC2 instance and resource configurations and recommends improvements and configuration change suggestions to optimize the EC2 hardware and storage profile to fit the amount of demand/traffic you're currently getting.


### Systems Manager

Systems Manager is a service that houses many capabilities to help with managing large fleets of servers and applications.

- **node management**: groups, visualizes, and manages a fleet of servers. Here are the common actions available:
	- lets you connect to individual instances/containers within the fleet.
	- Orchestrate patches and server-wide commands that get applied to all instances in the fleet.
- **operations management**: manage server-wide operations and setup fleet monitoring
- **application management**: manage application parameters in one certain place, like a fleet-wide parameter store. You can easily deploy or roll back configuration changes.
- **change management**: Allows you to manage fleet changes and updates and configure standardized maintenance windows.

Systems Manager helps with managing fleets of EC2 instances and even servers located in customers' own data centers (on-premises; by installing _"SSM Agent"_ on those servers).

But two key features that also help small-scale customers (e.g., start ups or small businesses) are **Parameter Store** and **AppConfig**.

- **parameter store**: fleet-wide way to access environment variables for the app.
- **secrets manager**: fleet-wide way to access sensitive environment variables for the app.
- **app config**: allows rollback of parameter store and secrets manager values by attaching versioning to the environment variables.

### Standardized Service Solutions

- **AWS service catalog**: create templates for creating cloud resources so that your company can create cloud service instances easier.
- **proton**: Service that allows you to create templates for standardized serverless and container deployments.

#### AWS service catalog

AWS service catalog is a template factory service for creating cloud resources easier based on custom templates you create.

An example is creating a template for a VPC that should house a public subnet containing an EC2 instance running a web server, querying from an RDS instance in a private subnet. 

Now you can share this template with all IAM users in your company and they can easily create a VPC just like that instantly


#### Proton

Proton is like AWS service catalog but it is meant for serverless container solutions like an ECS cluster on fargate.

#### AWS Launch Wizard

A service that AWS provides that provides templates for deploying common use cases, like an RDS instance or a lambda using DynamoDB.


## Hybrid Cloud

### Cloud Migration

Migrating to the cloud has several key challenges:

- **workloads must be migrated without interruption**: It's not worth it to move to the cloud if you lose out on 4 weeks of business with the server downtime.
- **expected costs must be estimated**
- **some workloads need to be adjusted for the cloud**

Here are key cloud migration services:

- **migration hub**: A central place to track the overall migration process.
- **application migration service**: An agent software that you install on-premises, and it analyzes your local system and replicates it to the cloud automatically.
- **database migration service**: An automated database migration service that can migrate data from a local database to a cloud database, and is provider-agnostic, being able to migrate across different flavors of SQL.
- **datasync**: Synchronizes on-premises data to cloud data with EFS, S3, or FSx
- **transfer family**: map SFTP or FTP endpoints to S3 or EFS so you can copy files from your local server to the cloud.
- **snow family**: Physical devices that AWS sends to you on-premises like large flash drives, then you put your company data on their, send it back to AWS, and then they do the data migration manually for you.
	- **The main idea**: data replication without direct network transfer to AWS and edge computing

### Hybrid cloud computing services

- **outposts**: AWS infrastructure like hosts that AWS ships to you, and then you can use AWS cloud services through those hosts.
- **snow family**: Edge computing portable devices, usable for data migration or edge computing
- **ECS and EKS anywhere**: A service that provides tooling and APIs for running ECS and EKS on local infrastructure
- **storage gateway**: an interface for enabling on-premises workloads to use cloud storage via S3, as if you were using files locally
- **datasync and transfer family**: like storage gateway, except you have access to use filesystem storage like EFS or FSx to sync files between cloud and on-premises
- **systems manager**: if you install the systems manager agent on your on-premises device, it allows you to also include on-premises instances into the fleet and control both cloud and on-premises servers with the same interface.

### DirectConnect

if you want to use AWS services from your on-premises infrastructure, you have three different connection options:

- **public internet**: access AWS services over the internet. 
	- This is the easiest, cheapest, but also the least secure.
- **VPN**: access AWS services over a VPN. 
	- This is secure, but slow.
- **WAN connection**: use a dedicated WAN connection like a fiber-optic cable to connect to AWS services directly and securely.
	- This is both secure and fast, but is expensive.

AWS direct connect is a dedicated, private WAN connection to the AWS network which AWS physically installs for you, which provides the best combination of the highest security and speed, but comes with the drawback of being expensive. 

## AWS for data science

### Data ingestion 

For data science tasks, ingesting data from different sources and storing that data is of utmost priority, but how we store the data depends on the **ingestion frequency**, or how fast data comes in.

Here is how we match the storage service to the ingestion frequency of data:


| Frequency Type | Example                                          | Storage Solution                                                                   |
| -------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Slow           | Manual data entry or daily cron job storing data | bucket storage or database like S3, RDS, etc.                                      |
| Medium         | SAAS user data and files                         | bucket storage or database like S3, RDS, etc.                                      |
| Fast           | Data stream from sensors and devices             | Data stream solutions like kinesis forwarding data to bucket storage or databases. |

### AWS Kinesis

**Data streams** are high frequency data ingestions that record multiple data points per second or millisecond, so we need dedicated storage services to deal with that kind of incoming, fast data and large amounts of it.

**AWS kinesis** accepts incoming data at a fast rate and forwards it to other services without overwhelming them by buffering them to consumers.

After the buffering, the receiving data storage solutions will be able to safely receive and store packets of incoming data from AWS kinesis without being overwhelmed.

Here are the main services that form AWS kinesis family:

- **kinesis data streams**: a scalable service which captures incoming streaming data
- **kinesis firehose**: forwards stream data into other AWS services by buffering them and then sending them
- **Kinesis Data Analytics**: Perform real-time data stream analytics.

### Data lakes and warehouses

THese are the two main storage solutions for data analytics.

- **data lake**: Storage solution for storing structured and unstructured data in the same place at a flat hierarchy.
	- **example**: bucket storage like S3
	- **use case**: great for machine learning and data discovery tasks where data might come in different shapes
- **data warehouse**: Database that stores structured data intended for data analytics because data warehouse solutions offer built-in data analytics toods.
	- **example**: AWS redshift
	- **use case**: great for business intelligence, reporting, and visualizations.


#### Redshift

Redshift is a data warehouse solution that is SQL-based, meaning you can store structure data in there and also query data in it.

Redshift can also be used to query data stored in other data sources like S3 or another separate RDS instance.

### ETL

ETL stands for **extract, transform, load**, which describes a technology that provides a unified abstraction for an interface for extracting data, cleaning it, and preparing it for consumption in a consumer-agnostic fashion.

AWS offers an ETL service called **AWS Glue** to simplify the process of crawling, parsing, and transforming raw data.

Here are the different things Glue lets you do:

- **data schema creation**: created a structured schema for your data so that cleaning and consumption can take place.
- **data transformation workflows**: create workflows that can take a data source, clean it to the data schema specifications, and then transform it for consumption by various providers.

> [!NOTE]
> Glue is a **serverless ETL** service where you only pay for what you actually use.

### EMR

EMR stands for **elastic map reduce** and is a service that simplifies spinning up big data compute clusters.

EMR is an abstraction over creating a compute environment to store data, and then you use a universal big data framework like apache spark to actually interact with that data.


### Athena 

Athena is a service that lets you query data in other data sources like S3, DynamoDB, or CloudWatch logs via SQL queries by first using Glue to create a schema for objects in those unstructured data stores, and then you can use SQL on that data schema.

> [!NOTE]
> The main benefit of using Athena with Glue is that it removes the copy over data into a dedicated data lake or warehouse for analytics purposes, and instead just query the existing storage solutions and run queries on that data.

### Quicksight

Quicksight is a business intelligence service that builds charts, reports, dashboards, and performs data analytics by pulling data from any number of data sources, like any bucket storage, data warehouse, or data lake.

The main benefit of QuickSight is that it is data-provider agnostic.

### OpenSearch vs CloudSearch

- **OpenSearch**: A managed search service for searching and analyzing data. It's main use case is to make data analytics easier by providing an easy way to search your data.
- **CloudSearch**: A managed search service intended to be a website search solution where end users can search for things on your website, where AWS optimizes search behind the scenes to use math stuff like Markov chains.

> [!NOTE]
> The main difference between these two services is that OpenSearch is intended for data science purposes while CloudSearch is intended for web applications.

## AWS organizations

### How companies use AWS

Companies use the **AWS organizations service** to create a separate sandboxed AWS account for each company developer, but allows a unified interface to control billing and customization for all accounts.

Here are the multiple things you can do:

- **consolidated billing**: see all billing across all AWS accounts in the organization and sum up all billing across all accounts to see the entire sum total bill.
	- Also allows you to get and pay a single bill for multiple accounts.
- **service control policies**: give each AWS account a set of permissions they can use on resources
- **profile backups**: allow to backup AWS account data and profiles

The **control tower service** creates a best-practice multi-account environment for you, like a separate billing account, developer account, IAM account, etc.

- **benefit**: the main benefit here is that it helps you migrate and take an easy first step towards using full-fledged AWS organizations

### Tags

Tags are pieces of metadata that can be added to AWS resources, which helps in the organization of resources.

### Resource Access Manager

Resource Access Manager service allows you to create cloud resources like a VPC and share it across multiple AWS company accounts so that they can all access it.

### AWS config

AWS config is a service that enforces AWS service configurations and permissions across AWS accounts, so it also works for resources shared via the resource access manager.


## Infrastructure as Code and Code Pipelines

### The main code pipeline

The main code development pipeline all teams follow is this:

1. **Write code in an IDE**: You can use the cloud-based IDE from AWS called **Cloud9**
2. **Store code in a repository**: You can use **CodeCommit**, which is AWS' git repository.
3. **build the application and run tests**: You can use AWS' **CodeBuild** to create a pipeline where you run tests and then build the final distributable.
4. **deploy**: You can use AWS' **CodeDeploy** to deploy the code to selected services, like API gateway, lambdas, Fargate, EC2, or an S3 bucket.

However, you can also use the AWS service called **CodePipeline**, which automates steps 2-4 by storing code in a repository, and then with CI/CD to the repo, automatically runs workflows to run pipelines and deploy to services.

**CodeStar** is a simplified version of CodePipeline.

#### Cloud9

Cloud9 is a cloud-based IDE that runs on an EC2 instance under the hood, so you pay for the isntance runtime, not the actual IDE usage.

#### CodeCommit

CodeCommit is a remote git repository which by default, stores code in private repositories.

#### CodeBuild

CodeBuild lets you define the execution environment for a workflow to run on code pulled from a remote git repo, like CodeCommit.

Here are the general steps you take to define the pipeline:

1. **define code source**: specify the remote repo to pull the code from
2. **define execution environment**: choose the hardware profile of the underlying EC2 instance running the workflow, and choose the OS and software to install.
3. **configure workflow variables**: Configure a workflow timeout, environment variables, and more.
4. **Create a BuildSpec**: A `buildspec.yaml` file is basically your workflow file, where you write own the commands to install desired software and packages.
5. **Create an artifacts detail spec**: Define the build output detail

Then you can manually run the pipeline or define triggers that automatically run the pipeline.

#### CodeArtifact

CodeArtifact is a managed repo for private and public application packages, where you can upload public packages from NPM as well as private custom packages you create so you can use CodeArtifact as a substitute for a package manager repository.

- **key benefit**: Increased performance and improved privacy
- **key benefit**: Allows you to upload company internal packages and manage them securely and privately.

#### CodeDeploy

CodeDeploy is a managed deployment service that allows you to configure deployments for EC2, ECS, and lambda functions, and accounts for availability-compliant code deployments like load balancer architectures or container fleets, uploading the code to all instances/containers at once.

- You can manually run deployments or set up triggers for them.
- You can retry or roll back deployments.



### CloudFormation

CloudFormation is a Terraform way for spinning up AWS resources declaratively.

AWS services for deploying multiple services at once use CloudFormation behind the scenes, like Elastic Beanstalk.

### AWS CDK
