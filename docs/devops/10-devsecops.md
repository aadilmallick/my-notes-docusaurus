## DevSecOps foundations

### Agile vs Waterfall

Waterfall was a paradigm in the past where devs would spend months trying to figure out the architecture of the app, then implement that architecture. After a year is over they deploy the production-ready app. 

The main problem with Waterfall was that clients don't know what they want so the finished app would often end up being very bad. 

Agile fixes this by making sure the product updates in 2-3 week sprints and accounting for client feedback, and multiple sprints make a release. 

However, even with Agile, we are still missing essential components that DevOps fixes:

- **waterfall**: development, testing, and operations are all separate teams, so progress is slow and frustrating.
- **agile**: development and testing are intertwined, but operations are left out, so deployment is a headache.
- **devops**: brings development, testing, and operations to work together with ease, simplifying the development and deployment process

> [!NOTE]
>  DevOps is a culture shift that integrates Agile to make both development and release cycle very fast 

![](https://i.imgur.com/QQ5GV1D.jpeg)

### Why devsecops

The old way of security testing was manual and took a long time

![](https://i.imgur.com/ciqgqe0.jpeg)

The DevSecOps approach aims to improve security testing speed via two approaches:

1. **increase speed by automation**: include automation scripts that run code analysis checks
2. **enable developers to participate in security**: developers should be responsible for the security of the code they write. Enable them with security tools for this purpose.


> [!NOTE]
> DevSecOps is the merging of the security team into the DevOps process, to further the goal of giving dev teams more ownership over security by integrating automated security checks into every step of the process.

Here is how DevSecOps differs from traditional security:

- **Traditional security** is often slow and manual, with security teams running scans and reviewing code over weeks, which doesn't fit the fast pace of DevOps.
	- Traditional application security is slow and manual, with security teams working separately from developers, causing delays and bottlenecks.
- **DevSecOps** integrates security directly into the development pipeline, automating tests and giving developers ownership of security tasks. 
	- DevSecOps integrates security directly into the development pipeline, embedding automated security checks early to provide real-time feedback to developers.

This means developers get real-time feedback within their workflow and can fix issues quickly, while security teams shift to an auditing role. 

#### How DevSecOps helps developers

The focus is on empowering developers with tools and education to handle security themselves, making security a continuous, fast, and collaborative process.

We can help devs by integrating into their workflow and building automations they would actually use:

- **security notifications**: automate delivering important security notifications not in cloudwatch logs but in a Slack or Teams channel everyone uses.
- **automate what matters**: don't automate pushing a button. Automate painful workflows for devs and make those easy.

>If you automate a mess, you get an automated mess.

So when you automate security, do it right. Make sure automation helps devs, not frustrates them.


### Shift security to the left

DevSecOps is all about shifting security to the left, meaning having security checking earlier in the agile sprint pipeline.


![](https://i.imgur.com/wOnq7T7.jpeg)
We accomplish this by moving automated security checks like SAST and DAST into the development lifecycle.

### Continuous Improvement and feedback

DevOps is meant to be a continuous loop that builds upon feedback to improve.



![](https://i.imgur.com/MIT8jT5.jpeg)


- **continuous feedback**: each DevOps task should have a feedback loop that notifies developers as to what went wrong or right.
- **continuous improvement**: improving based on feedback

### DevOps tools and methodologies

#### Use APIs

APIs are crucial in DevSecOps security automation because they allow security tools to be controlled remotely and integrated seamlessly into the development pipeline. 

Instead of manual scans, APIs enable automated security testing to run frequently and efficiently without slowing down development. 

- They also help connect security processes with systems like Jira for automatic updates, reducing manual work. 
- This automation makes it easier for developers to incorporate security into their workflow, supporting faster and more continuous security checks aligned with DevSecOps principles.

#### Metrics

Metrics are used to help define the success of a program, and turn goals into measurable outcomes.

There are 3 types of metrics:

- **operational metrics**: metrics for the ops team, ensuring pipeline and infrastructure health
	- MTTR (mean time to recover)
	- MTTD (mean time to delivery)
	- Deployment frequency
	- flow time: detection to resolution
- **vulnerabilities**: number of critical vulnerabilities, and vulnerabilities by type.
- **code metrics**: focus on security and quality assurance of code.
	- **application coverage**: measures test coverage percentage
	- **vulnerability remediation time**: how quickly issues get fixed

> [!NOTE]
> Track metrics that encourage good behaviors and practice, like limiting vulnerabilities.

## Intro to security testing


There are two types of pipelines that a product goes through:

- **build pipeline**: packages certain source code for deployment
- **release pipeline**: pipeline that handles the process of releasing code to a target environment, prod, staging, or preprod.

> [!NOTE]
> The main reason why you would want to separate these two pipelines is so you can run them a different number of times or where you only want to build once but then you want to release to multiple different environments from one single build. 

Here are the two main types of testing:

- **white-box testing**: you have full knowledge of the codebase, so you test internal logic.



![](https://i.imgur.com/adWpCxn.jpeg)

- **black-box testing**: the code is a black box to you - like testing an external API - so you test functional logic
![](https://i.imgur.com/AbfmqJp.jpeg)

You can further subdivide those blanket testing categories into two more categories of testing:

- **static security testing**: analyzes source code for security vulnerabilities. 
	- **con**: It is language specific and can lead to several false positives.
	- **pro**: very quick
- **dynamic security testing**: tests an app while it is currently running to test application flow and discovers vulnerabilities by interacting with the website./
	- **pro**: catches elusive bugs and vulnerabilities
	- **con**: a black-box approach that takes a lot of time to complete

Here are the static security testing techniques:

- **Software composition analysis (SCA)**: analyzes open source packages to see if they are vulnerability-free and up to date
- **Static code analysis (SCA)**: analyzes IaC in an automated manner to check for known vulnerabilities when creating the infra by analyzing code patterns.
	- **Pro**: quick, automated, no need for devs to know intimate security details.
	- **Con**: not 100% effective, may lead to false positives or may not find everything.
- **Static application security testing (SAST)**: a white-box testing method with normal application code testing via unit and integration tests

Here are the dynamic security testing techniques:

- **Dynamic application security testing (DAST)**: black-box testing method that examines an application while it's running to find vulnerabilities, testing the app as it runs.
- **runtime testing**: testing suspicious API calls, networking, commands run on the server, audit trails.


![](https://i.imgur.com/eAwLpai.jpeg)

### Static testing
#### Static code analysis

Static code analysis works by first defining checks or policies based on what your organization wants and then, based on those policies, scanning for common security vulnerabilities, deployment best practices, and coding best practices.

#### Continuous secret scanning

**Secret scanning** is a white-box testing approach that statically searches for exposed secrets in your codebase via Regex or Entropy-based searching (entropy-based is better).

Secret scanning is crucial to prevent accidental exposure of sensitive credentials like AWS keys, passwords, and API tokens, especially in infrastructure as code files.

Here are the best practices: 

- **add pre-commit hooks to block exposed secrets**: implement pre-commit hooks that block commits if secrets are detected, ensuring secrets are caught early in the development process.
- **use automated secret-scanning tools**: Tools like Aikido and TruffleHog can automate secret scanning by integrating with code repositories and CI/CD pipelines, enabling continuous protection as part of your DevSecOps workflow.


![](https://i.imgur.com/GYkfWyu.jpeg)

#### Continuous dependency scanning

**Continuous dependency scanning** uses an automated dependency scanner tool that scans your codebase's third party packages for vulnerabilities or outdated dependencies.


> [!NOTE]
> Automated dependency scanning integrated into your CI/CD pipeline helps quickly identify vulnerable components by comparing dependencies against known vulnerability databases (CVEs).


![](https://i.imgur.com/fITNC1F.jpeg)

#### Continuous container scanning

**Continuous container scanning** scans these three main security focus areas for containerized applications:
  
- **image vulnerabilities:** Identifying known vulnerabilities in the container's base image and its installed libraries and dependencies.
- **Policy Enforcement:** Ensuring containers are built and configured following security best practices, such as those outlined in CIS Benchmarks.
- **Runtime Protection:** Monitoring running containers for suspicious activity and preventing container breakouts.


![](https://i.imgur.com/xNfutGI.jpeg)

#### Continuous IaC scanning

Continuous IaC scanning scans your IaC code with static analysis tools like Checkov that can be fit into CI/CD pipelines to catch misconfigurations with your infra design.



![](https://i.imgur.com/0RXAmF0.jpeg)

> [!NOTE]
> A single misconfiguration in IaC can propagate across all deployments, so integrating security checks early in the development process is crucial to catch issues when they are cheapest to fix.

Security scanning tools like Akido Security and open-source Checkov can analyze IaC for vulnerabilities, providing instant feedback through IDE integration and bug tracking systems.

### Dynamic testing

#### Dynamic code analysis

For DevSecOps, dynamic scans should run asynchronously in CI/CD pipelines to avoid blocking builds, and tools should be fast, accurate, support automation (API/CLI), and integrate with bug trackers

#### IAST

IAST stands for interactive app security testing, and is a combination of DAST with SAST, where it performs testing by integrating into the runtime.

Interactive Application Security Testing (IAST) works by instrumenting the application during runtime, allowing real-time monitoring of data flows and behavior to detect vulnerabilities accurately.

> [!NOTE]
> IAST offers continuous security testing with fewer false positives compared to static or dynamic scanning, making it well-suited for integration into DevSecOps pipelines.


#### Continous application runtime monitoring

Continuous monitoring is essential because new vulnerabilities and threats emerge daily, and traditional periodic scans can't catch everything, especially zero-day vulnerabilities.

Runtime monitoring detects suspicious activities in real time, such as unusual processes, unexpected connections, and unauthorized changes, enabling rapid incident response.

AWS GuardDuty is an example of a runtime monitoring solution that collects logs from various sources (like EC2 and Aurora) to detect suspicious API calls, malware, and misconfigurations, providing comprehensive visibility across your cloud environment.


### Complete pipeline

![](https://i.imgur.com/CwZYfKI.jpeg)

## Checkov

Checkov is a popular static code analysis tool used to scan cloud infrastructure configurations across major cloud providers, used for scanning vulnerabilities in IaC cocdebases.

1. It works by applying pre-built policies that enforce security and compliance best practices, and you can also add custom policies if needed. 
2. In the pipeline you're watching, Checkov is installed and run to scan the entire code directory, generating a report of any security vulnerabilities found. 

This helps catch issues early in the build process, ensuring your infrastructure code follows industry standards and improving overall security and compliance in your deployments.

Here's how to use it generally:

1. Install checkov

```bash
pip3 install checkov
```

2. Scan a directory

```bash
checkov --directory src/ --soft-fail -o junitxml --output-file-path checkovreport.xml
```

Here are the flags on the `checkov` command you can set:

- `--directory / -d`: accepts a folder path to scan all code in
- `--soft-fail`: exits with a 0 exit code no matter what
- `-o <output-style>`: outputs the security testing analysis results in a certain output style, of which you have these possible values:
	- `junitxml`: outputs results in XML
- `--output-file-path <filepath>`: the filepath to publish test results to.


> [!NOTE]
> Checkov always returns a zero exit code by default.


### Skipping checkov checks

You can use comments with Checkov in order to skip checking certain problematic lines of code that you know are not vulnerabilities but Checkov flags them as false positives. 


![](https://i.imgur.com/wzXyNpT.jpeg)
