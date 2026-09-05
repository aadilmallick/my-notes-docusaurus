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



## CI/CD

```embed
title: "GitHub - LinkedInLearning/continuous-integration-tools-4490242: This is a repository for the LinkedIn Learning course Continuous Integration: Tools"
image: "https://opengraph.githubassets.com/2eeb3fb876f8a761a0f20b9ba67af5e2b158cac4f50448a9008ed28c5bc4d600/LinkedInLearning/continuous-integration-tools-4490242"
description: "This is a repository for the LinkedIn Learning course Continuous Integration: Tools - LinkedInLearning/continuous-integration-tools-4490242"
url: "https://github.com/LinkedInLearning/continuous-integration-tools-4490242"
favicon: ""
aspectRatio: "50"
```


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

## Source control tools

### Subversion 

Subversion (SVN) is a centralized version control system, which means it uses a central repository where all code changes are stored. 

- Developers sync their code with this central location to manage versions. 
- It's an open-source project by the Apache Software Foundation, designed to be safe, simple, and reliable, suitable for projects from small to large corporate operations. 

On Windows, you can use SVN through command line or graphical tools like TortoiseSVN, which integrates into the system for easier use.


#### TortoiseSVN

1. Install

```bash
winget install -e --id TortoiseSVN.TortoiseSVN
```

#### TortoiseGit

TortoiseGit is a windows tool to make using git easier with windows and available in the file explorer by allowing you to open a folder as a repository.


![](https://i.imgur.com/MkZokmH.jpeg)


### Gitlab

