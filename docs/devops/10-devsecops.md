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
- **code metrics**: focus on security and quality assurance of code.
	- **application coverage**: measures test coverage percentage
	- **vulnerability remediation time**: how quickly issues get fixed

> [!NOTE]
> Track metrics that encourage good behaviors and practice, like limiting vulnerabilities.

