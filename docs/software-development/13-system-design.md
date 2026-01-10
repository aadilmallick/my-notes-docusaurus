# System Design - devops, cloud, backend

## Complete Devops guide

### Technical Design Documents (TDDs)

TDDs are high-level documentation pieces on how to implement a feature, talking about the purpose, system architecture, data flow, and data structures involved with the feature at a high level.

WHen writing TDDs, you should always start out describing the problem, its scope, and then get into how to solve it and the various different approaches to solving it.

Here are the four components of the TDD you should write in order:

1. **what problem are we trying to solve**
2. **what is the current process?**: optional, only for internal tools.
3. **what are the requirements?**: what circumstances define the problem as being solved.
4. **how do we solve it?**: feature proposal for solving the problem, which correctly achieves the circumstances needed that define the problem as being solved.

## Backend architecture

### Monoliths

Monoliths tightly couple all functionalities of the application.

- **pro - can iterate quickly**: working in a monolithic architecture helps you move fast.
- **pro - simple, easy to deploy**:
- **pro - vertical scaling is easy**: With one server handling everything, you can vertically scale it by giving it more resources and RAM.
- **cons - horizontal scaling is hard**: Since the frontend and backend are coupled together, this makes scaling any individual part of the application difficult, if not possible.
- **con - lack of flexibility**

![](https://i.imgur.com/JTzQNQH.jpeg)


Here are the use cases of monoliths:

- **small-scale applications**: suitable for startups where you need to move fast and not scale.

### Generic services


Generic services is the idea of running each component of the application in their own isolated environment and separately deploying them, like having one pod for frontend, one pod for backend, one pod for database, etc.


![](https://i.imgur.com/ejyRBSL.jpeg)


The benefits of this architecture are as follows:

- **easy horizontal scaling of individual components**: You can scale the frontend, backend, or database, or any other service horizontally as much as you want to account for different needs.

### Microservices

Microservices is like generic services except that each pod runs an isntance of the entire system, meaning each isolated component would have its own database, server, etc.

- **pro**: distributed services have flexibility in changing the components of the entire system, allowing you to change each individual component quickly and without impacting other parts of the system.
- **pro**: easier to add new features since you add features in isolation, not to an entire system. Also easier for CI/CD on large systems.

Microservices communicate with each other via HTTP REST or messaging queues.

**telling the difference between generic services and microservices**

- **generic service**: If your service does multiple things, like being the backend for the entire application, then it's a generic service.
- **microservices**: if your service does only one thing (like backend routes dealing only with payments) then you have a microservice.

You have a microservice if you have one service per feature. It follows the single-responsiblity principle, where each service does only one thing or implements one feature.


**when to use microservices**

Microservices is absolute overkill if you're not a large company. Once you have a lot of traffic and need to scale, then microservices helps you deploy features quickly and more safely, and scale individual components (auth, database, payments) as traffic needs require.


![](https://i.imgur.com/c03b49m.jpeg)

### Serverless

Serverless architectures are the most simple out of all of these since you don't manage the backend yoruself. You either delegate all the backend work to a BAAS or a FAAS:

- **BAAS (backend as a service)**: something like supabase or firebase, where you have the database, auth, functions, and storage all running in the cloud and infinitely scalable.
- **FAAS (backend as a service)**: something like vercel or lambda, where you write the backend code but instead you host the server as isolated API routes as serverless function, which have infinite scaling capabilities.

Here are the pros:

- **pay for usage only**: As opposed to servers which are running 24/7, serverless functions are only invoked when you programmatically invoke them, leading to less uptime and less consumption of resources.
- **infinitely scalable**: You no longer have to worry about and manage the uptime of the server. The BAAS of FAAS does that for you.
- **no server management required**: great for solo developers who want to move fast

Here are the cons:

- **DDoS susceptibility**: with automated infinite scaling, comes the bad experience of being DDoSed and paying $100,000


![](https://i.imgur.com/JknQeGR.jpeg)

## System Design

### Basics

Here are the basic components of any app

![](https://i.imgur.com/0yZiKe2.jpeg)

Here are the three core steps to creating effective system design of any app:

1. Translate business requirements into technologies
2. Design the API and architecture, map data flow of the app
3. Understand the tradeoffs between different technologies

Here is the main approach to creating a system-design high level solution:

1. **scope the problem**: Establish what and who your app is meant for, the planned level of traffic, and the user base.
2. **design the high level architecture**:
3. **Address key challenges and tradeoffs**:

#### CAP theorem

- **reliability**: the ability for a service to consistently function over time.
- **uptime**: percentage of time the service is up
- **downtime**: percentage of time the service is down (has an error)
- **availability**: the ratio of uptime to downtime. The higher the availability, the more reliable the service is.
- **resiliency**: how well your system can handle errors
- **consistency**: how well you can ensure all clients have the same version of data at all times.
- **partition tolerance**: the system continues to operate even if messages are delayed or lost.

CAP theorem states the tradeoffs between consistency, availability, and partition tolerance, stating that a distributed system can only have 2 of these simultaneously, leaving the third out.

- C + A: having consistency and availability means that you're running on a single server that has reliable uptime and only one veersion of the data because it fetches from only one database, but when your server goes down or there is no internet, then the service is completely down, thus you have no partition tolerance.
- C + P: always show the freshest data but unreliable performance in availability.
- A + P: always responds but might show outdated data.

#### System quality

Any good system must have all of these attributes:

- **observability**: logging infrastructure in place so you can find out errors and problems.
- **reliability**: a good mix of availability, consistency, and resiliency
- **security**
- **scalability**
- **adaptability**: the ability to handle changin

### Requirements

Listing the functional and nonfunctional requirements of the app helps you understand the problem and how to solve it.

- **functional requirements**: describe what the system should do (features, functionality)
- **nonfunctional requirements**: describe how the system should perform (the speed of features, which tradeoffs you're willing to make)

#### Functional requirements

Here are the core questions you should ask in order to discover the functional requirements of your app:

1. what are the core features? Are there different features for paid and free users?
2. Who are the users? Who is the app meant for?
3. What type of app is this? web, mobile, etc.
4. Are there any edge cases or constraints to consider.

Here's an example of what the functional requirements are for a link-shortener app:

- **features**
	- users should be able to convert long URLs into short ones
	- Once authenticated, users can perform CRUD on short links, ensuring short links must be unique.
	- free users are limited to 50 short links, while paid users get unlimited links
	- free users' links expire after 6 months, while paid users have permanent links


