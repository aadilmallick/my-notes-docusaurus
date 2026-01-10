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

Any good system must have all of these 5 attributes:

- **observability**: logging infrastructure in place so you can find out errors and problems.
- **reliability**: a good mix of availability, consistency, and resiliency
- **security**
- **scalability**: Good systems should be abel to scale both horizontally and vertically with minimal effort and configuration.
- **adaptability**: the ability to handle changing requirements or user behaviors
- **performance**
	- **low latency**: Since latency is a measure of how quickly a system responds to each user query, we want low latency systems.
	- **high throughput**: Since throughput is a measure of how much data the app can concurrently handle at once, we want a high throughput to account for many concurrent users.

**scalability**

> [!NOTE]
> Designing systems to scale both up and down is important because of cost efficiency and resource management. 
> 
> - Running systems at maximum capacity at all times is wasteful and expensive. Many applications experience seasonality, where traffic varies by time of year (like e-commerce during Black Friday versus January). 
> - Cloud computing enables systems to scale up during high-traffic periods and scale down during quieter times, optimizing resource usage and costs.

**performance**

Latency is how quickly a system responds to a request, while throughput is the amount of data a system can handle. 

- Latency is more important for applications like shopping carts where users expect immediate feedback and will abandon slow-loading pages. 
- Throughput is more important for applications handling large amounts of data, such as video streaming (like Netflix using 30% of internet bandwidth), real-time mapping, autonomous cars processing millions of data points, or AI models.


#### Scaling

**vertical scaling**

Vertical scaling is increasing a machine's capability via increasing CPU, GPU, RAM, etc.

- **pros**: simple to implement, no code changes required.
- **cons**: expensive, doesn't increase reliability or resiliency, still has single point of failure.

**horizontal scaling**

Horizontal scaling is scaling via adding more instances of the system.

- **pros**: less expensive, increased reliability, uptime, and resiliency
- **cons**: complex to implement, requires an orchestration system that does automatic scaling in accordance to traffic, requires code changes

**load balancer**

The main issue that comes with horizontal scaling is that you now have several pods running the same system, but all with different DNS addresses. In our application code, how does the client know which pod to talk to?

This is where a **load balancer** comes in. Via DNS, it automatically redirects traffic and distributes it equally across all our pods. In our application code, our "server" is the load balancer DNS, which then reroutes all requests to the actual individual pods.

A reverse proxy, such as Nginx, can perform load balancing along with many other functions including HTTPS termination, route-based routing with deeper inspection, and health checks. 

While dedicated load balancers exist for very high traffic applications (like Amazon Elastic Load Balancer), reverse proxies generally offer more flexibility. In system design discussions, the terms are often used interchangeably unless specific functionality needs to be clarified.

**main strategy**


> [!TIP] 
> Horizontal scaling is typically the best option, and by starting out building with that as the default, there is no need to refactor later down the line, saving you a hassle.


Starting with horizontal scaling from the beginning avoids the need to refactor code later. When moving from vertical to horizontal scaling, code must be refactored because APIs that were previously on the same machine may now be on different machines, which changes latency and requires architectural adjustments to handle distributed components.


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

#### Nonfunctional requirements

Nonfunctional requirements are established by asking questions about how the system should perform, concerning the 5 attributes of good systems, which are reliability, observability, security, scalability, and performance.

1. **scalability**
	- How many users do we expect?
	- How many requests per second do we need to account for?
2. **consistency**
	- How consistent does the system need to be? Is it okay for users to see slightly stale data?
3. **performance**
	- What is the maximum latency?
	- What is the desired throughput? What's the maximum number of concurrent users?
	- What are the constraints on the data?
4. **security**
	- Which data needs to be protected?

Here's an example of the non-functional requirements for a link shortener:

- **performance**
	- Redirects should happen with max latency 500ms
	- short links should be max 1kb, long URLs should be max 3kb
- **scalability**
	- The system should handle 1 million requests per second


### High-level design

Once we have created our requirements, we move on to the high level design, using those requirements as a base.

High level design is done in a series of two steps:

- **entity modeling**: identifying the core components and most important things in the system.
- **API design**: defining the actions and operations of the system most commonly in a rest API.

#### Entity modeling

Entity modeling is designing the database schema at a high level.

For example, a todo app will have these schemas:

- `users`: has id, username, password
- `task`: has id, title, contents, completed boolean, and foreign key to user 
- `list`: has id, title, and list of taskIds

#### API design

Here are the different types of protocols available:

- **gRPC**: Go's custom protocol enabling communication between microservices. 
	- It is performant, but only works over HTTP/2
- **graphQL**: alternative to REST that is useful for fetching only the desired data, fetching by entities rather than predefined endpoints.
	- GraphQL can fetch data from multiple sources (like news feeds, pictures, and ads) and make it look like one endpoint, whereas REST would require multiple separate calls to different endpoints.
- **REST**: standard for implementing HTTP-based API routes.
- **SSE**: one-direction real-time communication from the server to the frontend.
- **websockets**: bi-directional real-time communication between the server and the front end. Lower latency than HTTP

![](https://i.imgur.com/jzL905Z.jpeg)

Here is the complete walkthrough, from requirements to entity modeling to API design:


![](https://i.imgur.com/ozOeueG.jpeg)

