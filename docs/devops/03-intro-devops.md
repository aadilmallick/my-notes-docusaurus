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

This is often illustrated through the **wall of confusion**, where devs hand their code to ops, and ops is supposed to figure out how to deploy code they've never seen before.


![](https://i.imgur.com/oWSKHyK.jpeg)


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

#### Silos between business and tech

IT people take forever to get something done, but that's just because there's a silo between business and IT.


### Core guiding principles

#### CAMS

The CAMS model in DevOps stands for **Culture, Automation, Measurement, and Sharing**:  
  

- **Culture** focuses on changing human behaviors and breaking down silos between teams to foster collaboration.
- **Automation** speeds up processes and reduces manual work, helping to improve efficiency and quality.
- **Measurement** involves tracking key metrics to understand system performance and team outcomes.
- **Sharing** promotes transparency and teamwork through open communication and knowledge exchange.

> [!NOTE]
> Automation is the accelerator that helps you unlock the other benefits of Devops. Manual work is a source of many efficiency and quality problems in technology value streams so you want to outsource the manual work to automation as your primary approach to creating solutions.

The CAMS model in devops helps us view our purpose as the following values:

- **culture**: we want to change the behavior of people
- **automation**: use automation to accelerate change
- **measure**: we need to measure what we're doing in order to improve. 
- **sharing**: working together builds better services.


#### The three ways of devops


![](https://i.imgur.com/IwTgBVN.jpeg)

The Three Ways of DevOps are strategic principles to bring DevOps values to life:  
  

- **Systems Thinking and Principles of Flow:** Focus on optimizing the entire system's outcome rather than just individual parts, ensuring smooth flow from concept to delivery.
	- You have to understand the whole system to optimize it well
	- The overall flow from beginning to end is how you actually produce value, not improving one part of the system at the expense of other parts.
- **Amplifying Feedback Loops:** Create and shorten feedback loops between teams to catch issues early and improve efficiency.
	- Effective and fast feeback yields a better and more efficient system.
- **Culture of Continuous Experimentation and Learning:** Foster a work culture that encourages trying new ideas, learning from them, and continuously improving through practice.

#### Devops playbook

The five main practice areas of DevOps covered in the video are:  
  

- **Culture:** Building a stable, safe environment for learning, sharing, experimenting, and collaboration.
- **Process:** Using agile and lean techniques like small batches, feedback loops, and lightweight change approvals.
- **Infrastructure as Code:** Managing infrastructure through software practices for reproducibility and rapid scaling.
- **Continuous Delivery:** Automating testing and deployment to release small changes frequently and reliably.
- **Site Reliability Engineering:** Engineering systems for reliability with observability and automation.

#### Shifting left and software dev lifecycle

- **Software Development Lifecycle (SDLC):** This is the process of planning, creating, testing, and deploying software. In DevOps, SDLC is integrated with continuous practices to make releases faster and more reliable.  
      
    
- **Shifting Left:** This means moving tasks like testing and security earlier in the development process instead of waiting until the end. For example, security checks happen during coding and build stages, helping catch issues sooner and reduce delays.  
      
    
- **Value Streams:** These represent the flow of work from idea through development to delivery to users. In DevOps, optimizing value streams means removing blockers and improving collaboration so software gets to production faster and with higher quality.

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

### Devops Toolchain

- **Devops Tools**: software that helps accelerate your value delivery
- **Devops Toolchain**: a combination of devops tools that helps you automate and manage the process of creating and delivering software

Toolchains often integrate these categories of tools together in a consolidated, ordered pipeline process.

1. **source code management**: Github, Bitbucket
2. **testing**: third-party testing tools that scan your code looking for linting errors or runtime errorsa.
3. **artifact management**: tools that store build artifacts.
4. **security scanning**: tools that scan for security vulnerabilities, using SAST, DAST, IAST, etc.
5. **CI/CD tools**: orchestrate tools together, acting as schedulers at the heart of the pipeline, like Jenkins or CircleCI.
6. **Deployment**: complex deployment routines require dedicated tools like Octopus Deploy
7. **Monitoring**: sentry, datadog
8. **Confirugation management**: Getting infrastructure up and running via Ansible.

### DevSecOps

There's tension between security and devs because they have opposite goals.

- **devs**: ship fast, eat cocaine
- **security**: be super safe, take it slow, ensure high quality

The problem is not that devs don't care about security, it's that they don't know what security wants them to fix. So the secret is automation and shifting security left by using security tools earlier in the development lifecycle.

### Kubernetes and Cloud Native

Kubernetes is useful for the following reasons:

- **built-in management features**: has observability, service discovery, health monitoring, and redundant networking
- **abstracts the infra**: K8S manages all the infra for you

K8S has become the standard for deploying company infra to the cloud, so much so that they invented a term for this:

>**Cloud native** just means adding and using K8S for your deployment solution. Weird name.

### Chaos engineering

Chaos engineering is the discipline of experimenting on a system in order to build confidence in the system's capability to withstand real-world conditions in production. 

In order words, you try to simulate breaking shit and see if the system still hods, and then if not, build the system to stand strong against failures and deliberate adversity against your system.


In chaos engineering, we aim to control the chaos that comes with emulating production failures and heavy load with several techniques:

- **fault injection**: intentionally applying an outage or performance degradation to a live system component.
- **game day**: a coordinated event where your organization plans to respond to a real or simulated incident to learn and improve from it

### MLOps

MLOps, as explained in the course, is the combination of machine learning (ML) and DevOps practices. It focuses on managing not just code and infrastructure, but also the data and machine learning models that are used to find patterns in data. 

Unlike traditional DevOps, MLOps involves collaboration between developers, operations teams, and data scientists, because ML workloads are often run by data scientists who may not have deep systems knowledge.

- It automates versioning and management of large data sets and ML models.
- It requires high-performance computing resources, often using GPUs, for training ML models.
- It includes continuous integration and deployment processes for software, infrastructure, and data/models.
- It involves ongoing monitoring and feedback loops to improve model results over time.

### AIOps and LLMOps

AIOps is using AI to automate IT operations processes, like automatically drafting emails, ingesting data, using ML systems to flag vulnerabilities, etc.
## IaC

### IaC basics

- **IaC (infrastructure as code)**: creating declarative code files that describe what resources you want to provision, what VMs to create, etc.
- **configuration management**: tools intended to help a a fleet of VMs provisioned automatically with IaC get into a desired state, by controlling configuration like delivering software updates to certain VMs, sending commands to them, installing packages, etc.

The benefit of IaC is error-free automated setup and teardown of resources, which saves time and money.


#### Provisioning vs Configuration Management vs Orchestration

- **configuration management**: changing control of system configuration during and after initial provisioning.
	- Examples are ansible, chef, puppet
- **baking**: creating a custom image set up to run everything you need for your app on a server, then deploying as a part of immutable deployment.
- **provisioning**: the process of making a server ready for operation, including hardware, OS, system services, and network connectivity.
	- Examples are pulumi and terraform
- **orchestration**: the act of performing coordinated operations across multiple systems while maintaining uptime by intelligently performing operations on services in such a way to avoid disruption of use while they are running.



#### **configuration management and baking**

We use configuration management tools for granularity to individually or batch apply updates to VM(s) in a fleet of VMs provisioned by IaC.

For example, Ansible is a configuration management tool that uses playbook YAML files to declaratively describe the desired state of the environment and automates the process to achieve it.

In DevOps, "configuring" means setting up and managing servers or systems at runtime using tools like Chef, Puppet, or Ansible. These tools adjust the system's settings dynamically when the server is running. 

On the other hand, "baking" means creating a custom image (like a virtual server image or a container image) that already has everything set up inside it before deployment. This image is then deployed as-is, which is called **immutable deployment**. 

Baking shifts setup work earlier in the development process, reducing risks during deployment but also making changes in production less flexible. Both approaches can be combined depending on your needs.

- **Drift** is when your system changes from its intended and defined state.

#### Declarative vs Imperative

- **Declarative**: You specify _what_ the desired end state of the system should be, and the tool figures out _how_ to achieve and maintain that state. 
	- **Core benefit**: It’s simpler and converges the system over time. Tools like Chef and Puppet use this model.  
	- **Medium**: uses stuff like playbooks or YAML files to describe how a deployment or configuration should be performed, and then you just point at the file to execute the change.
- **Imperative**: You specify _how_ to perform the steps to reach the desired state, giving you full control over the process. 
	- **Core benefit**: This approach is more explicit and better for orchestrating complex changes. Tools like Ansible and Shell scripts follow this model.
	- **Medium**: runs CLI commands to imperatively provision infra of configure changes.

#### Immutable provisioning

Even though IaC became a solved problem, further management of those servers still required configuration management, still creating silos between IaC and configuration management.

With the advent of containers, we now have a way to combine both IaC and configuration management together via adopting an **immutable infrastructure** approach where we treat our servers like disposable cattle and using **immutable provisioning** to launch container services that we don't have to perpetually configure. 

- **immutable infrastructure**: an approach to provisioning and deployment of cloud resources where components are replaced rather than individually SSHed into and changed 
- **Immutable provisioning** create deployments that are not intended to change the provisioned resources on updates, but instead delete and recreate and redeploy the entire system if needed.
- **immutable deployment**: instead of provisioning servers and then configuring your app to run as a service on those servers via configuration management, package your app as a container image, upload it to an image repository, and then servers pull from it to build the images and run them as the main app process.


![](https://i.imgur.com/KDyAz3c.jpeg)

> [!NOTE]
> Kubernetes is an approach to solve immutable infra, provisioning, and deployment all at once with one tool.

> [!NOTE]
> In an immutable provisioning approach, you may still experience drift if you manually change properties on certain cloud resources, but by design, you do not intend to change the infrastructure once it's deployed.

This approach avoids modifying running systems, reducing errors and enabling advanced rollout strategies like blue-green deployments.

Here are the differences between immutable provisioning and configuration management:

- **immutable provisioning**: changes to cloud resources replaces the cloud resources with new ones, rather than updating them.
- **configuration management**: a centralized agent pushes changes to update cloud resources.

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



## CI/CD

```embed
title: "GitHub - LinkedInLearning/continuous-integration-tools-4490242: This is a repository for the LinkedIn Learning course Continuous Integration: Tools"
image: "https://opengraph.githubassets.com/2eeb3fb876f8a761a0f20b9ba67af5e2b158cac4f50448a9008ed28c5bc4d600/LinkedInLearning/continuous-integration-tools-4490242"
description: "This is a repository for the LinkedIn Learning course Continuous Integration: Tools - LinkedInLearning/continuous-integration-tools-4490242"
url: "https://github.com/LinkedInLearning/continuous-integration-tools-4490242"
favicon: ""
aspectRatio: "50"
```

### Basics?

- **CI (continuous integration)**: the practice of automating the integration of code changes from multiple contributors into a single software project while maintaining code quality and app stability.
- **CD (continuous delivery)**: the practice of automating the deployment of code changes made via CI and deploying the app to a staging environment
	- After CD, the QA team takes over and stress-tests the app in the staging environment, and then they deploy the app to production
- **continuous deployment** differs from continuous delivery in that continuous deployment automatically deploys to production, by automatically releasing changes to production after passing tests, enabling multiple deployments per day.

![](https://i.imgur.com/dDbkz3G.jpeg)

#### CI

There are six practices that will help you with continuous integration:

1. **fast builds**: the build should take less time than it takes to get a cup of coffee.
2. **commit small changes**: seek to commit the smallest amount of code per commit, since small commits makes isolating failure points easier and enables easy rollback
3. **don't leave the build broken**: When you leave the build broken, you block delivery
4. **use a trunk-based dev flow**: Devs should frequently merge in dev to make sure they are up to date with the latest changes, which makes merging easier and less likely to cuase a broken build.

![](https://i.imgur.com/UVFIEoo.jpeg)

5. **don't allow flaky automated tests**: Tests should always be deterministic, never failing for random reasons.
6. **the build should return a status, log, and artifact**: Builds must have appropriate observability, which can be achieved via adding these three components:
	- **build log**: a detailed record of all the tests run and the results of the run.
	- **artifact**: installable dist version of the application, should be tagged with the version number.

#### Continuous delivery

>It's not how much you can deliver, but how little.

1. **Build artifacts only once**: built once, then the artifacts are used across all environments, like staging, prod, test, etc.
2. **artifacts should be immutable**: only the CI system should be able to write the artifact, and only the CD system should have read access to the artifact.
3. **Deploy to a pre-production environment**: A pre-prod environment should have all the same settings and cloud resources as a production environment
4. **stop deploys if a previous step fails**: if any point in the build pipeline fails, then need to fail the entire pipeline to prevent a broken build from making it through to the next stage.
5. **deploys should be idempotent**: deployments should be deterministic, never changing with the same inputs.

> [!NOTE]
> Why do we use pre-prod environments? It's because it helps us do the acceptance testing, integration tests, smoke testing, and end-to-end testing that is difficult to fully simulate on dev desktops or build servers. 

#### QA

Automated testing is the main driver that enables CI/CD to be valuable.

Any good QA team must add these tests to an application so that the pipeline can have good test coverage in CI:

- **unit testing**
- **code hygeine**: uses linters and formatters to ensure there is no tech debt and you are using best practices
- **integration testing**
- **acceptance testing**: also known as end to end testing, tests the entire flow of the app as a user would do it.

#### Continuous deployment

Continuous delivery means your code changes are automatically deployed to a test environment and are always ready to be released, but the actual release to production might still need manual approval. 

Continuous deployment takes this further by automatically releasing every change to production as soon as it passes all tests, allowing multiple deployments per day without manual steps. 

> [!NOTE]
> So, continuous deployment is like continuous delivery plus automatic release to production, making the process faster and more automated.

Continuous deployment implementations need an opinionated system that also satisfies these core qualities:

1. **safe**: changes do not break anything in prod. 
2. **reversible**: easy to rollback to different prod versions, no lingering state
3. **no down time**: does not affect users and data in prod.

There are two types of deployment strategies you can do for continuous deployment:

1. **blue-green deployment**: provision infra with the new version of your code and direct the production load balancer to direct traffic towards the infra with the new code.


![](https://i.imgur.com/aO31sI5.jpeg)


2. **canary deployment**: provision some infra with the new version of your code and then distribute a small percentage of production traffic to the infra running the new code.


![](https://i.imgur.com/6Huj60U.jpeg)

3. **A/B deployment**: feature-based rollout where you use feature flags to decide which groups of users to allow them to use the new feature, and then the rest of the users do not get access to the new feature.


![](https://i.imgur.com/NP8BFCN.jpeg)

### Types of CI/CD tools

CI/CD tools fall into four categories: self-hosted, Software as a Service (SaaS), cloud service providers, and code repositories, each with different setup and flexibility levels.

- **self-hosted**: runs on your hardware or company machines or personal cloud VM.
	- Self-hosted tools offer the most control but require more maintenance
- **SaaS**: vendor provides and maintains the tool, and it runs completely in the cloud.
	- SaaS tools are easy to start with
- **code repository**: stores the repo and CI/CD in one place.
	- code repository tools simplify collaboration by combining code and CI/CD management
- **cloud service providers**: AWS, Azure, etc., where you have cloud integration as well as code pipelines.
	- cloud providers integrate well with cloud infrastructure


Choose based on your context: individuals benefit from SaaS or code repository tools, small teams from code repository tools, and enterprises from self-hosted or cloud provider tools.

### Self-hosted tools


![](https://i.imgur.com/fKt3hzr.jpeg)


#### Jenkins

1. Install jenkins
2. Setup plugins
3. Create a `Makefile` for ease of use for running commands (a level of abstraction on top of running raw bash commands)

```make
FUNCTION=undefined
PLATFORM=undefined
URL=undefined
VERSION=undefined
BUILD_NUMBER=undefined
CODE=$(shell ls *.py)

ifneq (,$(findstring -staging,$(FUNCTION)))
	ENVIRONMENT = STAGING
else ifneq (,$(findstring -production,$(FUNCTION)))
	ENVIRONMENT = PRODUCTION
else
	ENVIRONMENT = undefined
endif

hello:
	@echo "Here are the targets for this Makefile:"
	@echo "  requirements   - install the project requirements"
	@echo "  lint           - run linters on the code"
	@echo "  black          - run black to format the code"
	@echo "  test           - run the tests"
	@echo "  build          - build the lambda.zip file"
	@echo "  deploy         - deploy the lambda.zip file to AWS"
	@echo "  testdeployment - test the deployment"
	@echo "  clean          - remove the lambda.zip file"
	@echo "  all            - clean, lint, black, test, build, and deploy"
	@echo
	@echo
	@echo "You must set the FUNCTION variables to use the deploy target."
	@echo "FUNCTION must be set to the name of an existing lambda function to update."
	@echo "For example:"
	@echo
	@echo "  make deploy FUNCTION=sample-application-staging"
	@echo
	@echo "Optional deploy variables are:"
	@echo "  VERSION       - the version of the code being deployed (default: undefined)"
	@echo "  PLATFORM      - the platform being used for the deployment (default: undefined)"
	@echo "  BUILD_NUMBER  - the build number assigned by the deployment platform (default: undefined)"
	@echo "  URL           - the URL to use for testing the deployment (default: undefined)"
	@echo

requirements:
	pip install -U pip
	pip install --requirement requirements.txt

check:
	set
	zip --version
	python --version
	pylint --version
	flake8 --version
	aws --version

lint:
	pylint --exit-zero --errors-only --disable=C0301 --disable=C0326 --disable=R,C $(CODE)
	flake8 --exit-zero --ignore=E501,E231 $(CODE)


black:
	black --diff $(CODE)

test:
	python -m unittest -v index_test

build:
	zip lambda.zip index.py data.json template.html

deploy:
	aws sts get-caller-identity

	aws lambda wait function-active \
		--function-name="$(FUNCTION)"

	aws lambda update-function-configuration \
		--function-name="$(FUNCTION)" \
		--environment "Variables={PLATFORM=$(PLATFORM),VERSION=$(VERSION),BUILD_NUMBER=$(BUILD_NUMBER),ENVIRONMENT=$(ENVIRONMENT)}"

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

	aws lambda update-function-code \
		--function-name="$(FUNCTION)" \
	 	--zip-file=fileb://lambda.zip

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

testdeployment:
	curl -s $(URL) | grep $(VERSION)

clean:
	rm -vf lambda.zip

all: clean lint black test build deploy

.PHONY: test build deploy all clean
```

4. Create a pipeline via a `Jenkinsfile` in your repo:

```hcl
pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID         = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY     = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION        = 'UPDATE_THIS_VALUE'
        STAGING_FUNCTION_NAME     = 'UPDATE_THIS_VALUE'
        STAGING_URL               = 'UPDATE_THIS_VALUE'
        PRODUCTION_FUNCTION_NAME  = 'UPDATE_THIS_VALUE'
        PRODUCTION_URL            = 'UPDATE_THIS_VALUE'
    }

    stages {
        stage('Requirements') {
            steps {
                sh('''
                    #!/bin/bash
                    python3 -m venv local
                    . ./local/bin/activate
                    make requirements
                ''')
            }
        }

        stage('Check') {
            parallel {
                stage('Check:Lint') {
                    steps {
                        sh('''
                            #!/bin/bash
                            . ./local/bin/activate
                            make check lint
                        ''')
                    }
                }

                stage('Check:Test') {
                    steps {
                        sh('''
                            #!/bin/bash
                            . ./local/bin/activate
                            make test
                        ''')
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh('''
                    #!/bin/bash
                    make build
                ''')
            }
        }

        stage('Deploy Staging') {
            steps {
                sh('''
                    #!/bin/bash
                    make deploy \
                        PLATFORM="Jenkins" \
                        FUNCTION=${STAGING_FUNCTION_NAME} \
                        VERSION=${GIT_COMMIT} \
                        BUILD_NUMBER=${BUILD_NUMBER}
                ''')
            }
        }

        stage('Test Staging') {
            steps {
                sh('''
                    #!/bin/bash
                    make testdeployment URL=${STAGING_URL} VERSION=${GIT_COMMIT}
                ''')
            }
        }

        stage('Deploy Production') {
            steps {
                sh('''
                    #!/bin/bash
                    make deploy \
                        PLATFORM="Jenkins" \
                        FUNCTION=${PRODUCTION_FUNCTION_NAME} \
                        VERSION=${GIT_COMMIT} \
                        BUILD_NUMBER=${BUILD_NUMBER}
                ''')
            }
        }

        stage('Test Production') {
            steps {
                sh('''
                    #!/bin/bash
                    make testdeployment URL=${PRODUCTION_URL} VERSION=${GIT_COMMIT}
                ''')
            }
        }
    }
    
    post {
        success {
            // Archive the lambda.zip file as an artifact
            archiveArtifacts artifacts: 'lambda.zip', allowEmptyArchive: false
        }
    }
}
```

#### Bamboo

Bamboo is a paid atlassian CI/CD product that can be self-hosted, but also has remote agents to run the CI/CD pipelines in the cloud.

Bamboo uses Spec files in YAML to create and run a CI/CD pipeline

#### Teamcity

Teamcity is a Jetbrains product meant for CI/CD jobs and has tight integrations with Jetbrains IDE and Visual Studio.

The config files for Teamcity can be written in XML or Kotlin.

- **Install TeamCity:** Begin by installing TeamCity on your server or local machine. TeamCity is a closed-source application but offers a free license with full features for small teams (up to 100 build configurations and 3 build agents).  

      
    
- **Configure Your Project:** You can set up your CI/CD pipeline either through the web interface or by importing configuration files.  
      
    
- **Use Configuration Files:** TeamCity supports XML and Kotlin for pipeline configuration. XML is structured but verbose, while Kotlin is easier to read and allows for code reuse with templates. The course provides Kotlin-based settings files you can import to quickly set up pipelines.  
      
    
- **Set Up Build Steps:** In the web interface, select your build job, then "Edit configuration" and "Build steps" to define each step of your pipeline. Steps can be configured with various runner types; command line runners are common but others are available depending on your technology stack.  
      
    
- **Run Your Pipeline:** Start the build from the TeamCity home page. You can monitor the build status in real-time, view logs, and check detailed output for each step.  
      
    
- **Integrate with IDEs:** If you use JetBrains IDEs like IntelliJ or PyCharm, TeamCity integrates directly, allowing you to trigger builds and view results without leaving your coding environment.  
      
    
- **Monitor and Maintain:** Use the build logs and status summaries to troubleshoot and optimize your CI/CD process.

Here are the general steps to set up a pipeline:

1. Create a `Makefile` as an abstraction over provisioning commands

```make
FUNCTION=undefined
PLATFORM=undefined
URL=undefined
VERSION=undefined
BUILD_NUMBER=undefined
CODE=$(shell ls *.py)

ifneq (,$(findstring -staging,$(FUNCTION)))
	ENVIRONMENT = STAGING
else ifneq (,$(findstring -production,$(FUNCTION)))
	ENVIRONMENT = PRODUCTION
else
	ENVIRONMENT = undefined
endif

hello:
	@echo "Here are the targets for this Makefile:"
	@echo "  requirements   - install the project requirements"
	@echo "  lint           - run linters on the code"
	@echo "  black          - run black to format the code"
	@echo "  test           - run the tests"
	@echo "  build          - build the lambda.zip file"
	@echo "  deploy         - deploy the lambda.zip file to AWS"
	@echo "  testdeployment - test the deployment"
	@echo "  clean          - remove the lambda.zip file"
	@echo "  all            - clean, lint, black, test, build, and deploy"
	@echo
	@echo
	@echo "You must set the FUNCTION variables to use the deploy target."
	@echo "FUNCTION must be set to the name of an existing lambda function to update."
	@echo "For example:"
	@echo
	@echo "  make deploy FUNCTION=sample-application-staging"
	@echo
	@echo "Optional deploy variables are:"
	@echo "  VERSION       - the version of the code being deployed (default: undefined)"
	@echo "  PLATFORM      - the platform being used for the deployment (default: undefined)"
	@echo "  BUILD_NUMBER  - the build number assigned by the deployment platform (default: undefined)"
	@echo "  URL           - the URL to use for testing the deployment (default: undefined)"
	@echo

requirements:
	pip install -U pip
	pip install --requirement requirements.txt

check:
	set
	zip --version
	python --version
	pylint --version
	flake8 --version
	aws --version

lint:
	pylint --exit-zero --errors-only --disable=C0301 --disable=C0326 --disable=R,C $(CODE)
	flake8 --exit-zero --ignore=E501,E231 $(CODE)


black:
	black --diff $(CODE)

test:
	python -m unittest -v index_test

build:
	zip lambda.zip index.py data.json template.html

deploy:
	aws sts get-caller-identity

	aws lambda wait function-active \
		--function-name="$(FUNCTION)"

	aws lambda update-function-configuration \
		--function-name="$(FUNCTION)" \
		--environment "Variables={PLATFORM=$(PLATFORM),VERSION=$(VERSION),BUILD_NUMBER=$(BUILD_NUMBER),ENVIRONMENT=$(ENVIRONMENT)}"

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

	aws lambda update-function-code \
		--function-name="$(FUNCTION)" \
	 	--zip-file=fileb://lambda.zip

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

testdeployment:
	curl -s $(URL) | grep $(VERSION)

clean:
	rm -vf lambda.zip

all: clean lint black test build deploy

.PHONY: test build deploy all clean
```


2. Write a `settings.kts` file that is recognized by TeamCity as the file to use to create a project and set up the pipeline.

```kotlin
import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.buildFeatures.perfmon
import jetbrains.buildServer.configs.kotlin.buildSteps.script
import jetbrains.buildServer.configs.kotlin.projectFeatures.githubIssues
import jetbrains.buildServer.configs.kotlin.triggers.vcs
import jetbrains.buildServer.configs.kotlin.vcs.GitVcsRoot

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

version = "2023.05"

project {
    buildType(Build)
    features {
    }
}

object Build : BuildType({
    name = "Build"
    enablePersonalBuilds = false
    artifactRules = "+:lambda.zip"
    maxRunningBuilds = 1
    publishArtifacts = PublishMode.SUCCESSFUL

    // please configure the parameters manually in the TeamCity UI
    // Select Project -> Edit Project -> Build (Under Build Configurations) -> Parameters
    // Edit each parameter with the values for your deployments
    params {
        password("env.AWS_SECRET_ACCESS_KEY", "reference", display = ParameterDisplay.HIDDEN)
        password("env.AWS_ACCESS_KEY_ID", "reference", display = ParameterDisplay.HIDDEN)
        param("env.AWS_DEFAULT_REGION", "UPDATE_THIS_VALUE")
        param("env.STAGING_FUNCTION_NAME", "UPDATE_THIS_VALUE")
        param("env.STAGING_URL", "UPDATE_THIS_VALUE")
        param("env.PRODUCTION_FUNCTION_NAME", "UPDATE_THIS_VALUE")
        param("env.PRODUCTION_URL", "UPDATE_THIS_VALUE")
    }

    steps {
        script {
            name = "Requirements"
            scriptContent = """
                python3 -m venv local
                . ./local/bin/activate
                make requirements
            """.trimIndent()
        }
        script {
            name = "Check"
            scriptContent = """
                . ./local/bin/activate
                make check lint test
            """.trimIndent()
        }
        script {
            name = "Build"
            scriptContent = "make build"
        }
        script {
            name = "Deploy Staging"
            scriptContent = """
                make deploy \
                	PLATFORM="TeamCity" \
                    FUNCTION=${'$'}{STAGING_FUNCTION_NAME} \
                    VERSION=${'$'}{BUILD_VCS_NUMBER} \
                    BUILD_NUMBER=${'$'}{BUILD_NUMBER}
            """.trimIndent()
        }
        script {
            name = "Test Staging"
            scriptContent = "make testdeployment URL=${'$'}{STAGING_URL} VERSION=${'$'}{BUILD_VCS_NUMBER}"
        }
        script {
            name = "Deploy Production"
            scriptContent = """
                make deploy \
                	PLATFORM="TeamCity" \
                    FUNCTION=${'$'}{PRODUCTION_FUNCTION_NAME} \
                    VERSION=${'$'}{BUILD_VCS_NUMBER} \
                    BUILD_NUMBER=${'$'}{BUILD_NUMBER}
            """.trimIndent()
        }
        script {
            name = "Test Production"
            scriptContent = "make testdeployment URL=${'$'}{PRODUCTION_URL} VERSION=${'$'}{BUILD_VCS_NUMBER}"
        }
    }
})
```

3. Manually run the pipeline or upload your code via a commit and push to trigger the pipeline.

### SaaS CI/CD


![](https://i.imgur.com/R2OYg5z.jpeg)


#### TravisCI

TravisCI reads a `travis.yml` to create the pipeline

```yaml title="travis.yml"
---
# Specify the programming language to be used, in this case, Python.
language: python

# Define the Python version to be used for the build.
python:
  - "3.9"

# Try to speed up builds with caching
cache: pip

# 'install' represents the 'Requirements' stage of the pipeline.
install:
  # Install required Python packages specified in the 'requirements.txt' file.
  - pip install --quiet --upgrade --requirement requirements.txt
  
  # Install AWS CLI
  - pip install --quiet --upgrade awscli

# Each step in the 'script' represents the remaining stages of the pipeline.
script:
  
  # Check: Run the 'check', 'lint', and 'test' targets defined in the Makefile.
  - make check lint test
  
  # Build: Clean previous builds and initiate a new build.
  - make clean build
  
  # Deploy Staging: Deploy to the staging environment using specified parameters.
  - make deploy FUNCTION=${STAGING_FUNCTION_NAME} PLATFORM="Travis CI" VERSION=${TRAVIS_COMMIT} BUILD_NUMBER=${TRAVIS_BUILD_NUMBER}
  
  # Test Staging: Perform deployment testing for the staging environment.
  - make testdeployment URL=${STAGING_URL} VERSION=${TRAVIS_COMMIT}
  
  # Deploy Production: Deploy to the production environment using specified parameters.
  - make deploy FUNCTION=${PRODUCTION_FUNCTION_NAME} PLATFORM="Travis CI" VERSION=${TRAVIS_COMMIT} BUILD_NUMBER=${TRAVIS_BUILD_NUMBER}
  
  # Test Production: Perform deployment testing for the production environment.
  - make testdeployment URL=${PRODUCTION_URL} VERSION=${TRAVIS_COMMIT}
```

#### CircleCI

CircleCI stands out because it supports a wide range of build environments including Ubuntu, Windows, MacOS, and even specialized processors like GPUs and ARM. 

- It also caters to mobile development for iOS and Android. 
- CircleCI uses Docker containers or virtual machines to run your builds, giving flexibility and consistency. 
- Its "orbs" feature allows you to reuse shared configurations easily, saving time. 
- Plus, it offers an intuitive command line tool for testing and debugging locally. 

Here's how to understand what to do:

- **Understand CircleCI's Environment:** CircleCI runs your CI/CD workflows using Docker containers or virtual machines, providing access to Ubuntu, Windows, and MacOS environments. It also supports specialized environments like GPUs and ARM processors, and mobile platforms including iOS and Android.  
      
    
- **Set Up Your Project:** Begin by linking your code repository (e.g., GitHub, GitLab, Bitbucket) to CircleCI. This integration allows CircleCI to trigger builds automatically when you push code.  
      
    
- **Configure Your Pipeline:** Create a `.circleci` directory in your project root and add a `config.yml` file. This YAML file defines all your jobs and workflows, specifying the steps to build, test, and deploy your application.  
      
    
- **Use Orbs for Reusable Configurations:** CircleCI offers "orbs," which are packaged, shareable configurations that save time by reusing common setup patterns. You can find orbs in the CircleCI registry for various tools and services.  
      
    
- **Run and Monitor Builds:** You can start builds by pushing code or manually triggering pipelines via the CircleCI dashboard. Monitor progress in real-time by selecting active steps to view commands and output.  
      
    
- **Analyze Build Trends:** Use the Insights page on CircleCI to track average runtimes, success rates, and failure trends over time, helping you optimize your CI/CD process.  
      
    
- **Consider Pricing:** CircleCI offers three pricing tiers suitable for individuals, teams, and enterprises. Each tier includes free build minutes monthly, with additional minutes available for purchase. Pricing scales based on concurrent jobs and team size.

CircleCI reads a  `config.yaml` to create a pipeline:

```yaml title="config.yaml"
# Use the latest 2.1 version of CircleCI pipeline process engine.
# See: https://circleci.com/docs/configuration-reference
version: 2.1

# Orbs are reusable packages of CircleCI configuration that you may share across projects, enabling you to create encapsulated, parameterized commands, jobs, and executors that can be used across multiple projects.
# See: https://circleci.com/docs/orb-intro/
orbs:
  # The python orb contains a set of prepackaged CircleCI configuration you can use repeatedly in your configuration files
  # Orb commands and jobs help you with common scripting around a language/tool
  # so you dont have to copy and paste it everywhere.
  # See the orb documentation here: https://circleci.com/developer/orbs/orb/circleci/python
  python: circleci/python@1.5.0
  
# Define a job to be invoked later in a workflow.
# See: https://circleci.com/docs/configuration-reference/#jobs
jobs:
  integration: # This is the name of the job
    # These next lines defines a Docker executors: https://circleci.com/docs/executor-types/
    # You can specify an image from Dockerhub or use one of the convenience images from CircleCI's Developer Hub
    # A list of available CircleCI Docker convenience images are available here: https://circleci.com/developer/images/image/cimg/python
    # The executor is the environment in which the steps below will be executed - below will use a python 3.10.2 container
    # Change the version below to your required version of python
    docker:
      - image: cimg/python:3.10.2
    # Checkout the code as the first step. This is a dedicated CircleCI step.
    # The python orb's install-packages step will install the dependencies from a Pipfile via Pipenv by default.
    # Here we're making sure we use just use the system-wide pip. By default it uses the project root's requirements.txt.
    # Then run your tests!
    # CircleCI will report the results back to your VCS provider.
    steps:
      - checkout
      # This step takes care of the requirements
      - python/install-packages:
          pkg-manager: pip
      - run:
          name: install aws CLI
          command: pip install --quiet --upgrade awscli
      - run:
          name: check
          command: make check lint test
  
  build:  # New job for build
    docker:
      - image: cimg/python:3.10.2
    steps:
      - checkout
      - run:
          name: install aws cli
          command: pip install --quiet --upgrade awscli
      - run:
          name: build
          command: make clean build
      - persist_to_workspace:  # Persist the lambda.zip to workspace
          root: .
          paths:
            - lambda.zip

  deploy-test-staging:
    docker:
      - image: cimg/python:3.10.2
    steps:
      - checkout
      - attach_workspace:  # Attach workspace to get the lambda.zip
          at: .
      - run:
          name: install aws cli
          command: pip install --quiet --upgrade awscli
      - run:
          name: deploy
          command: make deploy FUNCTION=${STAGING_FUNCTION_NAME} PLATFORM="CircleCI" VERSION=${CIRCLE_SHA1} BUILD_NUMBER=${CIRCLE_BUILD_NUM}
      - run:
          name: test
          command: make testdeployment URL=${STAGING_URL} VERSION=${CIRCLE_SHA1}
          
  deploy-test-production:
    docker:
      - image: cimg/python:3.10.2
    steps:
      - checkout
      - attach_workspace:  # Attach workspace to get the lambda.zip
          at: .
      - run:
          name: install aws cli
          command: pip install --quiet --upgrade awscli
      - run:
          name: deploy
          command: make deploy FUNCTION=${PRODUCTION_FUNCTION_NAME} PLATFORM="CircleCI" VERSION=${CIRCLE_SHA1} BUILD_NUMBER=${CIRCLE_BUILD_NUM}
      - run:
          name: test
          command: make testdeployment URL=${PRODUCTION_URL} VERSION=${CIRCLE_SHA1}


# Invoke jobs via workflows
# See: https://circleci.com/docs/configuration-reference/#workflows
workflows:
  experimental-pipeline:
    jobs:
      - integration
      - build:  
          requires:
            - integration
      - deploy-test-staging:
          requires:
            - build
      - deploy-test-production:
          requires:
            - deploy-test-staging
```

### Cloud CI/CD


![](https://i.imgur.com/iGn3MjP.jpeg)

### Code repos


![](https://i.imgur.com/XnAHgo4.jpeg)


#### Gitlab

1. Create a `Makefile` as an abstraction over bash commands:

```make
FUNCTION=undefined
PLATFORM=undefined
URL=undefined
VERSION=undefined
BUILD_NUMBER=undefined
CODE=$(shell ls *.py)

ifneq (,$(findstring -staging,$(FUNCTION)))
	ENVIRONMENT = STAGING
else ifneq (,$(findstring -production,$(FUNCTION)))
	ENVIRONMENT = PRODUCTION
else
	ENVIRONMENT = undefined
endif

hello:
	@echo "Here are the targets for this Makefile:"
	@echo "  requirements   - install the project requirements"
	@echo "  lint           - run linters on the code"
	@echo "  black          - run black to format the code"
	@echo "  test           - run the tests"
	@echo "  build          - build the lambda.zip file"
	@echo "  deploy         - deploy the lambda.zip file to AWS"
	@echo "  testdeployment - test the deployment"
	@echo "  clean          - remove the lambda.zip file"
	@echo "  all            - clean, lint, black, test, build, and deploy"
	@echo
	@echo
	@echo "You must set the FUNCTION variables to use the deploy target."
	@echo "FUNCTION must be set to the name of an existing lambda function to update."
	@echo "For example:"
	@echo
	@echo "  make deploy FUNCTION=sample-application-staging"
	@echo
	@echo "Optional deploy variables are:"
	@echo "  VERSION       - the version of the code being deployed (default: undefined)"
	@echo "  PLATFORM      - the platform being used for the deployment (default: undefined)"
	@echo "  BUILD_NUMBER  - the build number assigned by the deployment platform (default: undefined)"
	@echo "  URL           - the URL to use for testing the deployment (default: undefined)"
	@echo

requirements:
	pip install -U pip
	pip install --requirement requirements.txt

check:
	set
	zip --version
	python --version
	pylint --version
	flake8 --version
	aws --version

lint:
	pylint --exit-zero --errors-only --disable=C0301 --disable=C0326 --disable=R,C $(CODE)
	flake8 --exit-zero --ignore=E501,E231 $(CODE)


black:
	black --diff $(CODE)

test:
	python -m unittest -v index_test

build:
	zip lambda.zip index.py data.json template.html

deploy:
	aws sts get-caller-identity

	aws lambda wait function-active \
		--function-name="$(FUNCTION)"

	aws lambda update-function-configuration \
		--function-name="$(FUNCTION)" \
		--environment "Variables={PLATFORM=$(PLATFORM),VERSION=$(VERSION),BUILD_NUMBER=$(BUILD_NUMBER),ENVIRONMENT=$(ENVIRONMENT)}"

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

	aws lambda update-function-code \
		--function-name="$(FUNCTION)" \
	 	--zip-file=fileb://lambda.zip

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

testdeployment:
	curl -s $(URL) | grep $(VERSION)

clean:
	rm -vf lambda.zip

all: clean lint black test build deploy

.PHONY: test build deploy all clean
```

2. Create a `github-ci.yaml` file for the pipeline

```yaml title="github-ci.yaml"
# Use the Python 3.11 image as the base image for this pipeline.
image: python:3.11

# Define the stages of the pipeline in the order they should run.
stages:
  - requirements
  - check
  - test
  - build
  - staging
  - production

# The requirements job sets up the Python virtual environment and installs necessary dependencies.
Requirements:
  stage: requirements
  # Cache the virtual environment to speed up subsequent jobs.
  cache:
    key: venv
    paths:
      - venv
  script:
    - python -m venv venv
    - venv/bin/pip install --upgrade --requirement requirements.txt
    - make requirements

# The check job performs static code analysis and linting.
Check:
  stage: check
  needs: ["Requirements"]
  cache:
    policy: pull  
    key: venv
    paths:
      - venv
  # Setup necessary utilities for the job.
  before_script:
    - apt-get update -y
    - apt-get install -qq zip
  script:
    - source venv/bin/activate
    - make check
    - make lint

# The test job runs the project's tests.
Test:
  stage: test
  needs: ["Check"]
  cache:
    policy: pull  
    key: venv
    paths:
      - venv
  script:
    - source venv/bin/activate
    - make test

# The build job creates the deployable artifact.
Build:
  stage: build
  needs: ["Test"]
  before_script:
    - apt-get update -y
    - apt-get install -qq zip
  script:
    - make build
  # Store the lambda.zip as an artifact to be used in subsequent stages.
  artifacts:
    paths:
      - ./lambda.zip

# The staging job deploys the code to the staging environment.
Staging:
  stage: staging
  environment: Staging
  needs: ["Build"]
  # Define environment variables for AWS and the function name.
  variables:
    AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    FUNCTION: $FUNCTION_NAME
  cache:
    policy: pull  
    key: venv
    paths:
      - venv
  script:
    - source venv/bin/activate
    - make deploy PLATFORM="GitLab CI" FUNCTION=$FUNCTION VERSION=$CI_COMMIT_SHA BUILD_NUMBER=$CI_PIPELINE_ID
    # Test the deployed code in the staging environment.
    - make testdeployment URL=$CI_ENVIRONMENT_URL VERSION=$CI_COMMIT_SHA
  dependencies:
    - Build

# The production job deploys the code to the production environment.
Production:
  stage: production
  environment: Production
  needs: ["Build","Staging"]
  variables:
    AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    FUNCTION: $FUNCTION_NAME
  cache:
    policy: pull  
    key: venv
    paths:
      - venv
  script:
    - source venv/bin/activate
    - make deploy PLATFORM="GitLab CI" FUNCTION=$FUNCTION VERSION=$CI_COMMIT_SHA BUILD_NUMBER=$CI_PIPELINE_ID
    # Test the deployed code in the production environment.
    - make testdeployment URL=$CI_ENVIRONMENT_URL VERSION=$CI_COMMIT_SHA
  dependencies:
    - Build
```


#### BitBucket


1. Create a `Makefile` as an abstraction over bash commands:

```make
FUNCTION=undefined
PLATFORM=undefined
URL=undefined
VERSION=undefined
BUILD_NUMBER=undefined
CODE=$(shell ls *.py)

ifneq (,$(findstring -staging,$(FUNCTION)))
	ENVIRONMENT = STAGING
else ifneq (,$(findstring -production,$(FUNCTION)))
	ENVIRONMENT = PRODUCTION
else
	ENVIRONMENT = undefined
endif

hello:
	@echo "Here are the targets for this Makefile:"
	@echo "  requirements   - install the project requirements"
	@echo "  lint           - run linters on the code"
	@echo "  black          - run black to format the code"
	@echo "  test           - run the tests"
	@echo "  build          - build the lambda.zip file"
	@echo "  deploy         - deploy the lambda.zip file to AWS"
	@echo "  testdeployment - test the deployment"
	@echo "  clean          - remove the lambda.zip file"
	@echo "  all            - clean, lint, black, test, build, and deploy"
	@echo
	@echo
	@echo "You must set the FUNCTION variables to use the deploy target."
	@echo "FUNCTION must be set to the name of an existing lambda function to update."
	@echo "For example:"
	@echo
	@echo "  make deploy FUNCTION=sample-application-staging"
	@echo
	@echo "Optional deploy variables are:"
	@echo "  VERSION       - the version of the code being deployed (default: undefined)"
	@echo "  PLATFORM      - the platform being used for the deployment (default: undefined)"
	@echo "  BUILD_NUMBER  - the build number assigned by the deployment platform (default: undefined)"
	@echo "  URL           - the URL to use for testing the deployment (default: undefined)"
	@echo

requirements:
	pip install -U pip
	pip install --requirement requirements.txt

check:
	set
	zip --version
	python --version
	pylint --version
	flake8 --version
	aws --version

lint:
	pylint --exit-zero --errors-only --disable=C0301 --disable=C0326 --disable=R,C $(CODE)
	flake8 --exit-zero --ignore=E501,E231 $(CODE)


black:
	black --diff $(CODE)

test:
	python -m unittest -v index_test

build:
	zip lambda.zip index.py data.json template.html

deploy:
	aws sts get-caller-identity

	aws lambda wait function-active \
		--function-name="$(FUNCTION)"

	aws lambda update-function-configuration \
		--function-name="$(FUNCTION)" \
		--environment "Variables={PLATFORM=$(PLATFORM),VERSION=$(VERSION),BUILD_NUMBER=$(BUILD_NUMBER),ENVIRONMENT=$(ENVIRONMENT)}"

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

	aws lambda update-function-code \
		--function-name="$(FUNCTION)" \
	 	--zip-file=fileb://lambda.zip

	aws lambda wait function-updated \
		--function-name="$(FUNCTION)"

testdeployment:
	curl -s $(URL) | grep $(VERSION)

clean:
	rm -vf lambda.zip

all: clean lint black test build deploy

.PHONY: test build deploy all clean
```

2. Create a `bitbucket-pipeline.yml` file for the pipeline

```yaml title="bitbucket-pipelines.yml"
# Use the latest version of Python
image: python

pipelines:
  default:

    # Step 1: Prepare the environment by installing all necessary dependencies.
    - step:
        name: Requirements
        caches:
          - pip
        script:
          - make requirements

    # Step 2: In parallel, conduct code checks and run tests to validate the code quality and functionality.
    - parallel:

      # Sub-Step 1: Perform code checks and linting to ensure code quality.
      - step:
          name: Check
          caches:
            - pip
          script:
            - apt-get update -y
            - apt-get install -qq zip
            - make requirements
            - make check
            - make lint

      # Sub-Step 2: Execute tests to confirm that the code works as expected.
      - step:
          name: Test
          caches:
            - pip
          script:
            - make requirements
            - make test

    # Step 3: Build the application and generate a ZIP artifact for deployment.
    - step:
        name: Build
        script:
          - apt-get update -y
          - apt-get install -qq zip
          - make build
        artifacts:
          - lambda.zip

    # Step 4: Deploy the application to the staging environment and validate the deployment.
    - step:
        name: Staging
        deployment: staging
        caches:
          - pip
        script:
          - make requirements
          - make deploy PLATFORM="Bitbucket Pipelines" \
              FUNCTION=$STAGING_FUNCTION_NAME \
              VERSION=$BITBUCKET_COMMIT \
              BUILD_NUMBER=$BITBUCKET_BUILD_NUMBER
          - make testdeployment URL=$STAGING_URL VERSION=$BITBUCKET_COMMIT

    # Step 5: If staging is successful, deploy the application to the production environment and validate the deployment.
    - step:
        name: Production
        deployment: production
        caches:
          - pip
        script:
          - make requirements
          - make deploy PLATFORM="Bitbucket Pipelines" \
              FUNCTION=$PRODUCTION_FUNCTION_NAME \
              VERSION=$BITBUCKET_COMMIT \
              BUILD_NUMBER=$BITBUCKET_BUILD_NUMBER
          - make testdeployment URL=$PRODUCTION_URL VERSION=$BITBUCKET_COMMIT
```

## Observability and monitoring

- **observability**: uncovers both known and unknown problems
- **monitoring**: extracting info targeting known problems

### Observability 

**Observability** is a measure of how well the internal states of a system can be inferred from knowledge of its external output. 

> [!NOTE]
> Good observability is when by looking at the logs and metrics of our system, we can tell what is going on.

There are four pillars of observability:

1. **metrics**: numeric values that provide insights into the characteristics of a system
	- like how CPU usage or memory usage give insight into the performance of an app
2. **logs**: text records that get outputted from either infra or apps, lets devs know what is going on and leaves and audit trail.
3. **traces**: show the lifecycle of a request as it passes through services and infra, show the entire path of a request and how it flows throughout a distributed service
4. **events**: events are emitted when something of note happens or changes within your infrastructure. 

There are 5 areas of observability:

1. **synthetic checks**: health checks that are automated to check if servers and services are running.
2. **system and application metrics**: measuring time series, numerical data like CPU usage or function execution
3. **end user performance**: 
	- **application performance monitoring (APM)**: Instrumentation framework that reports performance at code level how long every function took to run and duration of database queries and I/O calls.
	- **real user monitoring (RUM)**: frontend script and analytics system like Posthog to monitor how users click on your site and what actions they take, and performance in the case of Lighthouse.
	- **tracing**: tracing a service across complex system and the path of a request to see how long it took
4. **system and application logs**: logs should answer these 4 questions:
	1. what happened
	2. when did it happen
	3. where did it happen
	4. what was involved
5. **security**: uses existing logs and metrics but queries them to detect threats. Audits certain paths on endpoints, bad IP requester addresses, and suspicious or unusual behavior.

### Monitoring

Monitoring uses signals to paint a picture of what is happening within the services we track, either by using dashboards, visualizations, or alerting.

There are two main types of monitoring:

- **application-performance monitoring**: monitoring backend performance
- **frontend monitoring**: monitoring frontend performance

### Observability architecture

The observability architecture models how companies usually implement observability. 


![](https://i.imgur.com/kZffcQj.jpeg)


- **instrumentation/configuration**: writing your code in such a way that it can create or export observability **signals** like metrics, logs, traces, or events
- **collection and processing**: an agent or system that collects all observability signals and processes them
- **export**: export the collected signals to a database or backend
- **visualization**: view the signals and processed and aggregated data via dashboards.

There are two types of architecture:

- **vendor-based observability**: using third-party vendors in each stage of the pipeline
- **open-source observability**: using open-source, self-hosted vendors in each stage of the pipeline

#### OpenTelemetry

Open Telemetry is an open source observability framework that provides teams with standardized protocols and tools for collecting and routing telemetry data. 

The main innovation here is that it replaces the need to use custom or different venders in each stage of the observability architecture, and instead OTel makes use of libraries that help with gathering, processing, and exporting data:

- **OTel instrumentation**: language-specific libraries and SDKs that help with gathering, processing, and exporting data.
- **OTel collector**: open source collector that receives data, processes it, and exports it to different backends. Many vendors support this and collect data with OTel collector.
- **OTel exporter**: sends data to the third-party vendor or backend



![](https://i.imgur.com/CfXtIP8.jpeg)

OTel changes the observability architecture by replacing third-party paid vendors with the OTel collector:



![](https://i.imgur.com/QfmpHrU.jpeg)

### Metrics

#### Metric types

- **counters**: simple increment-only metrics that keep track of the number of occurrences of a specific event or activity 
	- **examples**: API requests, error occurrences, system restarts
	- **use case 1**: when you want to record a value that goes up 
	- **use case 2**: when you want to be able to query how fast the value is increasing 
- **gauges**: metrics that provide a snapshot of a particular value at a specific point in time, as numeric time-series data that can fluctuate
	- **examples**: CPU utilization, memory, number of database connections
- **histograms**: measure the distribution and frequency of time durations for specific events, and then group those numeric values into categorical buckets 
	- **example**: classifying a continuous numeric value like request duration into a bucket like fast or slow 

Each of the metrics has a purpose:

- **counters**: used for capacity planning, so you can track load and traffic through counting API requests, error occurences, etc. happen, and then plan for what you recorded.
- **gauges**: used for performance optimization
- **histograms**: used for end users to understand the metrics better

#### Metric aggregation

- **sums**: summing metrics is useful when you want to track the total count or quantity of events over a period. 
- **rates**: rates are useful when you want to measure how something changes over time. 

$$rate = quantity/time$$
- **mean**: averages are useful for finding the central tendency of data, but hide outliers.
	- **example**: you can find the average response time to calculate the typical performance of your website. 
- **percentile**: used to understand the distribution of data and to identify outliers 
	- **example**: for example the 90th percentile of response times can help you understand what 90% of your users experience. 


![](https://i.imgur.com/L7YxxCP.jpeg)


![](https://i.imgur.com/A3Vdg3m.jpeg)


#### Google's four golden signals

Google's four golden signals are a good foundation for defining which metrics you should track in your application. 

- **errors**: rate of unsuccessful events or requests within a service or infra
- **throughput**: How much volume of requests or events being received by a service or infra
- **latency**: the amount of time taken for a request or event to be completed 
- **saturation**: the measure of how a service or infrastructure's limited resources are utilized, like CPU utilization

This is what makes for good metrics. They have these properties:

- **understandable**: perfectly clear and give insight into a characteristic of a specific system
- **actionable**: alerts your team and drives change
- **improvable**: able to be improved upon after action
- **multidimensional**: adds tags to your metrics for more info, like which stage the environment is in.
## Site Reliability Engineering

### Reliability Engineering


SRE is having good engineering practices and designing systems that can tolerate failure through code.

- **Reliability** is the ability of a system to perform its intended function correctly and consistently when it is expected to. 
- **resilience**: the ability of a system to maintain or regain a stable state and continue operations after a major incident occurred 
- **SRE** is the discipline of using a software engineering approach to automate operation processes

Most of SRE comes down to dealing with **integration points**

- **integration points**: An integration point is a single point that connects many services together. It is the number one cause of issues in an architecture.
- **cascading failure**: occurs based on an issue with an integration point

**All systems fail**

All systems eventually fail because changes introduce new modes of failure.

What we're aiming for is not the perfect system, but a system with high resilience:

- **redundancy**: running multiple instance copies of cloud resources for failover
- **automatic scaling and load balancing**
#### Circuit breaker

The circuit breaker is a system design concept that is a mitigation against failing systems, where if it detects high frequency of errors, it stops making requests to those failing systems instead of continuing to bombard them with requests



![](https://i.imgur.com/OjR6owc.jpeg)


#### Configuration

Runtime config that varies by deployment should be separated out from the app code and stored into env vars



### Incident response

Three activities of incident response management:

1. **troubleshooting**: understanding the system enough to know how to fix 
2. **automation**: having the tooling to already speed up and conduct remediation activities 
3. **communication**: communicating to end users and stakeholds what went wrong and how you fixed it.


> [!NOTE]
> If someone makes a mistake and your system goes down, then your system was bad in the first place. Everybody makes mistakes. As an engineer your job is to make the system work anyway. 

#### Postmortems

Here are the core principles behind the mindset you should have when conducting a postmortem:

1. There is no root cause: everything happens as a degradation over time.
2. Postmortems should be blameles
3. Use transparent communication when communicating outages.
## Source control tools

### Subversion 

Subversion (SVN) is a centralized version control system, which means it uses a central repository where all code changes are stored, where developers sync their code with this central location to manage versions. 

> [!NOTE]
> It's an open-source project by the Apache Software Foundation, designed to be safe, simple, and reliable, suitable for projects from small to large corporate operations. 

On Windows, you can use SVN through command line or graphical tools like TortoiseSVN, which integrates into the system for easier use.

Subversion (SVN) and Git are both version control systems but differ mainly in architecture and workflow:  

- **Subversion (SVN)** is a centralized system where all code changes are synced to a central repository. This means you always work with a single source of truth stored on a server.
- **Git** is a distributed system, so every developer has a full copy of the entire repository history locally, allowing for more flexible workflows and offline work.

#### Subversion repositories

Since subversion repos are centralized, that means that they are a single source of truth, and the only way to make changes is to checkout a branch and then push it up to change the centralized version.

To let other developers access the repo, you should put the centralized repo on a virtual machine every developer can SSH into.

In short, here are the different components:

- **centralized repo**: the centralized source of truth for the source code that nobody can change directly.
- **checked out repo**: a local repo branching off of the centralized repo to let you add local changes and push them up.

In a repo, you have three important subfolders which basically control the VCS system for your repo:

- `branches`: subfolder that contains all branches
- `tags`:
- `trunk`: where all source code goes and all TortoiseSVN operations are supposed to be performed on.



#### TortoiseSVN


TortoiseSVN is a tool to create subversion repositories and kickstart the dev process.

1. Install tortoise SVN

```bash
winget install -e --id TortoiseSVN.TortoiseSVN
```

2. On a folder, create a new repository using tortoise SVN


![](https://i.imgur.com/VakqTtP.jpeg)

3. Click on **Create folder structure**


![](https://i.imgur.com/ev6mbOb.jpeg)


4. Create a new folder to checkout the centralized repo by clicking on the **SVN checkout** folder option.


![](https://i.imgur.com/tkpaHp1.jpeg)


5. Finish checkout, which will then create a `branch`, `tags`, and `trunk` subfolder within the local checked out repo.


![](https://i.imgur.com/emdP2bM.jpeg)

##### **Tortoize SVN workflow**

This is how the commit process works:

1. Add a file to the repository


![](https://i.imgur.com/jIPNNZI.jpeg)


2. Click on the **SVN Commit** option to commit a file


![](https://i.imgur.com/mbKT0vd.jpeg)


3. Commit the file or files


![](https://i.imgur.com/escgeZH.jpeg)

##### **View logs**

![](https://i.imgur.com/Ypzu7bh.jpeg)


##### Reverting changes

1. Click on **TortoiseSVN** -> **Update to revision**

![](https://i.imgur.com/whOr91n.jpeg)

2. Click on **show log** to view the list of the commits and choose which commit you want to revert to.


![](https://i.imgur.com/bwsoJrq.jpeg)

3. To see which commit to use, go to a certain commit, right click, and then select **compare with working copy** to view the diff between that commit and the current state of the repo.



![](https://i.imgur.com/OuzJr9K.jpeg)

4. Complete the revision

##### Branches

1. Right click on the `trunk` folder, select **TortoiseSVN**, then click on **Branch/tag** to create a new branch or tag.


![](https://i.imgur.com/EVMsYMW.jpeg)

2. The name of the branch is the same as the name of the subfolder you will create within the `branches` folder



![](https://i.imgur.com/dGnjiGq.jpeg)

3. To switch to a branch, right click on the `trunk` folder, select **TortoiseSVN**, then click on **switch** to create a new branch or tag.


![](https://i.imgur.com/pbsujUJ.jpeg)

4. Select the branch you want to switch to, make sure to select the **fully recursive** option.


![](https://i.imgur.com/GX0gv6g.jpeg)

5. When you add and commit a file, it will now be added to the branch folder:


![](https://i.imgur.com/7q63YuC.jpeg)

##### Merging branches

To merge branches, you need to switch back to the trunk branch and then merge a specific branch into the trunk branch.

1. Switch to the trunk branch


![](https://i.imgur.com/EpCHAUr.jpeg)


![](https://i.imgur.com/djqiO59.jpeg)

2. To merge a branch into `trunk`, right click on the `trunk` folder, select **TortoiseSVN**, then click on **merge**:


![](https://i.imgur.com/ywrbB5L.jpeg)

3. Select the **merge two different trees option**


![](https://i.imgur.com/NHzbzn1.jpeg)


4. I know it sounds counterintuitive but the "From" branch should be trunk and the "To" branch should be the branch you want to merge into trunk (because the idea is that we're moving trunk from an old commit to the new commit on branch). 


![](https://i.imgur.com/l9JTJdh.jpeg)

#### TortoiseGit

TortoiseGit is a windows tool to make using git easier with windows and available in the file explorer by allowing you to open a folder as a repository.


![](https://i.imgur.com/MkZokmH.jpeg)


### Gitlab

#### Pull requests

Within pull requests, there are some cool things you can do:

- **add tasks**: markdown todo lists actually create real tasks that are then tracked via DB and shown for all users, creating a nice todo list of tasks to finish on the PR

#### Todo list

When you tag something with an `@<username>` mention, it automatically creates a todo item in the **todo list** for their account.

Also, issues assigned to you are also automatically added to your todo list

#### Issues

Here is how to create an issue


![](https://i.imgur.com/FwjREIo.jpeg)

A created issue makes a branch behind the scenes, thus you can also create pull requests based on issues and merge issues in.

**labels**

You can also add labels to the issues. 

![](https://i.imgur.com/xOOadAc.jpeg)

You can also subscribe to labels to receive notifications and updates from issues tagged with those labels:


![](https://i.imgur.com/URqfbFd.jpeg)

Based on filtering with labels, you can view them in boards and save those views



![](https://i.imgur.com/YCjnhEO.jpeg)
