## Devops foundations

### What is DevOps and DevSecOps

In development, you usually have three different teams:

- **development**: in charge of making the code, testing it, and deploying it.
- **security**: in charge of making sure the app and code is secure.
- **operations**: in charge of making sure the app works well and consistently

However, development and operations are at odds with each other, because each of them have different objectives, or in other words, work in completely different **silos**:

- **what dev teams want**: to ship the code as fast as possible
	- Main goal is **speed**
- **what ops teams want**: to make sure the app is stable for all versions
	- Main goal is **stability**


![](https://i.imgur.com/Xx8SeOL.jpeg)


DevOps is the intersection of integrating dev with ops teams to attain both speed and stability. It achieves this through denying the **silo model**, where each team works independently to do their part of the application:

- **dev silo**: works independently to make the code
- **ops silo**: works independently to test the code, implement observability.

The problem with this silo model is that it takes too long because the dev team finishes their sprint, hands the code to ops, and then waits until ops hands back the code and tells them to fix it. 

DevOps fixes the silo model by using tools to integrate development with operations at every turn:

- **CI/CD**: creates a automated pipeline with tests that ensure if the code passes the pipeline, it gets automatically deployed with version control history and passes quality assurance of tests
- **observability tools**: developers can implement observability tools in production instances to log important information.

DevSecOps aims to integrate the silo of security into an automated pipeline instead of having a dedicated security team constantly hand back and forth the code with the dev team whenever they find a security vulnerability.

By modifying our code to use these tools, we can integrate each silo together into an automated pipeline that achieves all three core objectives of speed, security, and stability:

- **development tools**: create a CI/CD pipeline to create automated integrations for security and ops teams.
- **security**: add static and dynamic vulnerability analysis tools into the automated pipeline.
- **operations**: add observability and alarms into the pipeline and code.
![](https://i.imgur.com/kbWU75p.jpeg)

Now instead of each team working individually, DevSecOps achieves all three teams working together to achieve their objectives in an automated pipeline.


### CI/CD

- **CI (continuous integration)**: the practice of automating the integration of code changes from multiple contributors into a single software project while maintaining code quality and app stability.
- **CD (continuous delivery)**: the practice of automating the deployment of code changes made via CI and deploying the app to a staging environment
	- After CD, the QA team takes over and stress-tests the app in the staging environment, and then they deploy the app to production

**continuous deployment** differs from continuous delivery in that continuous deployment automatically deploys to production, skipping the QA team and staging and going straight to production.

### Containers vs VMs

A host device uses a hypervisor to manage multiple **virtual machines**, where each virtual machine has their own operating system (ring 0) and then the applications that live on top of that (ring 3)


![](https://i.imgur.com/9o1E6bp.jpeg)

A container differs from a virtual machine by not including an operating system with it. Rather, it uses the container engine's operating system (like Docker Desktop Windows or Mac).

Here are the benefits of this container approach:

- **containers are slim**: Because a container does not ship an entire OS with it, it takes up much less space than a VM.
- **containers boot up quickly**: because containers do not use their own OS, they boot up very quickly because they just use the container engine and container host OS to boot up the containers again and again.


![](https://i.imgur.com/qJBaKAz.jpeg)


### Technical Design Documents (TDDs)

TDDs are high-level documentation pieces on how to implement a feature, talking about the purpose, system architecture, data flow, and data structures involved with the feature at a high level.

WHen writing TDDs, you should always start out describing the problem, its scope, and then get into how to solve it and the various different approaches to solving it.

Here are the four components of the TDD you should write in order:

1. **what problem are we trying to solve**
2. **what is the current process?**: optional, only for internal tools.
3. **what are the requirements?**: what circumstances define the problem as being solved.
4. **how do we solve it?**: feature proposal for solving the problem, which correctly achieves the circumstances needed that define the problem as being solved.


## IaC

### IaC basics

- **IaC (infrastructure as code)**: creating declarative code files that describe what resources you want to provision, what VMs to create, etc.
- **configuration management**: tools intended to help a a fleet of VMs provisioned automatically with IaC get into a desired state, by controlling configuration like delivering software updates to certain VMs, sending commands to them, installing packages, etc.

The benefit of IaC is error-free automated setup and teardown of resources, which saves time and money.


#### Provisioning vs Configuration Management vs Orchestration

- **configuration management**: changing control of system configuration during and after initial provisioning.
	- Examples are ansible, chef, puppet
- **provisioning**: the process of making a server ready for operation, including hardware, OS, system services, and network connectivity.
	- Examples are pulumi and terraform
- **orchestration**: the act of performing coordinated operations across multiple systems while maintaining uptime by intelligently performing operations on services in such a way to avoid disruption of use while they are running.

**configuration management**

We use configuration management tools for granularity to individually or batch apply updates to VM(s) in a fleet of VMs provisioned by IaC.

For example, Ansible is a configuration management tool that uses playbook YAML files to declaratively describe the desired state of the environment and automates the process to achieve it.

#### Declarative vs Imperative

- **Declarative**: You specify _what_ the desired end state of the system should be, and the tool figures out _how_ to achieve and maintain that state. 
	- **Core benefit**: It’s simpler and converges the system over time. Tools like Chef and Puppet use this model.  
	- **Medium**: uses stuff like playbooks or YAML files to describe how a deployment or configuration should be performed, and then you just point at the file to execute the change.
- **Imperative**: You specify _how_ to perform the steps to reach the desired state, giving you full control over the process. 
	- **Core benefit**: This approach is more explicit and better for orchestrating complex changes. Tools like Ansible and Shell scripts follow this model.
	- **Medium**: runs CLI commands to imperatively provision infra of configure changes.

#### Immutable provisioning

**Immutable provisioning** create deployments that are not intended to change the provisioned resources on updates, but instead delete and recreate and redeploy the entire system if needed.

This approach avoids modifying running systems, reducing errors and enabling advanced rollout strategies like blue-green deployments.

#### IaC philosophy

Infrastructure as code is the philosophy of treating the continuous deployment of your infrastructure with software development practices: using your code to deploy the infrastructure and having the state of the infrastructure be dependent on the code. 

The main reason why adhering to infrastructure as code is beneficial is because in DevOps culture you should always treat your servers as cattle rather than pets (because you shouldn't handcraft servers and cater to their unique needs). 

Instead servers should be standardized and be able to be killed and provisioned without a second thought, which is possible through infrastructure as code.

This approach involves:  
  

- Writing your infrastructure setup and configurations as code that is stored in source control, just like application code.
- Automating the creation, configuration, and deployment of servers and services, making them consistent and repeatable.
- Avoiding manual changes on individual servers; instead, you update the code, test it, and redeploy, similar to fixing bugs in software.
- Adopting a cultural shift where infrastructure is treated as disposable and replaceable ("servers as cattle, not pets"), enabling mass production and easy replacement.

This leads to more reliable systems, less firefighting, and smoother operations, which aligns well with modern DevOps and backend development practices.

### CI/CD in IaC

The main purpose of a continuous delivery pipeline for infrastructure as code is to automate the process of taking your infrastructure code from development to production reliably and efficiently. It:  
  

- Isolates changes by building and testing small batches of code, so you know exactly when and where something goes wrong.
- Enables traceability by linking deployments to specific code changes, eliminating manual changes on production servers.
- Ensures your infrastructure is consistent, repeatable, and easier to manage by automating build, test, and deployment steps.

Here is how to effectively use CI/CD in your IaC system:

1. Check in your IaC code into version control
2. Have unit tests that automatically run via CI pipelines to test your infrastructure before it goes through the CD pipeline.
3. In the CD pipeline, deploy your IaC to a cloud provider.

Here are the key components of a CI/CD system for IaC:

- **Reproducible infrastructure:** Ensuring your infrastructure works the same way across development, testing, and production environments reduces bugs and deployment issues.
- **Versioned artifacts:** Package and version your code and infrastructure configurations to keep deployments consistent and traceable.
- **Identical environments:** Strive to make environments as similar as possible to avoid surprises, using tools like Docker or Vagrant to align developer and production setups.
- **Deployment as code:** Automate deployments using code to increase speed, reduce errors, and enable rollbacks or roll-forwards.

Then using these key components, here are the steps to implement a CI/CD pipeline to deploy your IaC:

1. **create versioned artifacts**: Create versioned artifacts for your code and your infrastructure code. 
2. **create an identical environment**: Use that code to make a production-like environment in each phase of the dev cycle. 
3. **deploy each identical environment**: Have a mechanism to deploy it in an identical manner in each of those environments. 

### GitOps

GitOps is a methodology and practice that uses Git repositories as a single source of truth to deliver infrastructure as code. 

The four key characteristics of GitOps according to OpenGitOps are:  

- **Declarative:** The system's desired state is expressed declaratively, meaning that it lives somewhere in code like in YAML files.
- **Versioned and immutable:** The desired state is stored in a way that enforces immutability, versioning, and retains a complete version history.
- **Pulled automatically:** Software agents automatically pull the desired state declarations from the source repository.
- **Continuously reconciled:** Software agents continuously observe the actual system state and attempt to apply the desired state.

### Policies as code

**Policies as code** help prevent risky configurations (like open network ports or missing encryption) before they reach production, using tools such as TFSEC, Chekov, Dry Run Security, and Open Policy Agent.