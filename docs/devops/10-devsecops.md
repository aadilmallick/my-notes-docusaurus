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
- **DevSecOps** integrates security directly into the development pipeline, automating tests and giving developers ownership of security tasks. 

This means developers get real-time feedback within their workflow and can fix issues quickly, while security teams shift to an auditing role. 

The focus is on empowering developers with tools and education to handle security themselves, making security a continuous, fast, and collaborative process.
