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

### IaC and Configuration management

- **IaC (infrastructure as code)**: creating declarative code files that describe what resources you want to provision, what VMs to create, etc.
- **configuration management**: tools intended to help a a fleet of VMs provisioned automatically with IaC get into a desired state, by controlling configuration like delivering software updates to certain VMs, sending commands to them, installing packages, etc.

The benefit of IaC is error-free automated setup and teardown of resources, which saves time and money.

We use configuration management tools for granularity to individually or batch apply updates to VM(s) in a fleet of VMs provisioned by IaC.

For example, Ansible is a configuration management tool that uses playbook YAML files to declaratively describe the desired state of the environment and automates the process to achieve it.

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

