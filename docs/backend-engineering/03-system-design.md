# System Design - devops, cloud, backend

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


#### Core app components

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

Here's some terminology

- **reliability**: the ability for a service to consistently function over time.
- **uptime**: percentage of time the service is up
- **downtime**: percentage of time the service is down (has an error)
- **resiliency**: how well your system can handle errors

These are the three attributes that make up the CAP theorem:

- **consistency**: how well you can ensure all clients have the same version of data at all times.
	- A perfectly consistent system means that every node in a system will have the same data at every single point.
	- **Consistency (C):** Every node in the system sees the same data at the same time. If a change is made on one node, it must be immediately reflected across all others
- **availability**: the ratio of uptime to downtime. The higher the availability, the more reliable the service is.
	- A perfectly available system is always up and has zero downtime.
	- **Availability (A):** The system remains operational and responsive to requests at all times, even if some nodes fail or become unreachable
- **partition tolerance**: the system continues to operate even if messages or data gets lost.
	- A system with perfect partition tolerance will always find a way for two nodes in a system to communicate.
	- **Partition Tolerance (P):** The system continues to function correctly despite network communication failures (partitions) between nodes


CAP theorem states the tradeoffs between consistency, availability, and partition tolerance, stating that a distributed system can only have 2 of these simultaneously, leaving the third out.

![](https://i.imgur.com/cjXWxjF.jpeg)

- C + A: having consistency and availability means that you're running on a single server that has reliable uptime and only one veersion of the data because it fetches from only one database, but when your server goes down or there is no internet, then the service is completely down, thus you have no partition tolerance.
- C + P: always show the freshest data but unreliable performance in availability.
- A + P: always responds but might show outdated data.

For example, a banking system typically prioritizes consistency and partition tolerance to ensure financial accuracy, even if it means sacrificing availability during a network issue


##### Availability

Availability is measured in uptime percentage per year.

- A system with 99.99% of availability will have 8.76 hours of downtime per year
- A system with 99.999% of availability will have 5 minutes of downtime per year

![](https://i.imgur.com/dEOWVMm.jpeg)

- **SLO (service level objectives)**: the average availability a company has for a system
- **SLA (service level objectives)**: the minimum level of service a company commits to provide for a system, guaranteeing it with a contract.

#### System quality

Any good system must have all of these 5 attributes:

- **observability**: logging infrastructure in place so you can find out errors and problems.
- **reliability**: a good mix of availability, consistency, and resiliency. A measure of how consistently a system works.
- **fault tolerance**: ensuring there is no single point of failure, which ties into redundancy and availability
- **redundancy**: Ensuring there are copies of nodes so that if one goes down, there is a backup.
- **security**
- **scalability**: Good systems should be able to scale both horizontally and vertically with minimal effort and configuration.
- **adaptability**: the ability to handle changing requirements or user behaviors
- **performance**
	- **low latency**: Since latency is a measure of how quickly a system responds to each user query, we want low latency systems.
	- **high throughput**: Since throughput is a measure of how much data the app can concurrently handle at once, we want a high throughput to account for many concurrent users.

##### **scalability**

> [!NOTE]
> Designing systems to scale both up and down is important because of cost efficiency and resource management. 
> 
> - Running systems at maximum capacity at all times is wasteful and expensive. Many applications experience seasonality, where traffic varies by time of year (like e-commerce during Black Friday versus January). 
> - Cloud computing enables systems to scale up during high-traffic periods and scale down during quieter times, optimizing resource usage and costs.

##### **performance**

**Latency** is how quickly a system responds to a request, while **throughput** is the amount of data a system can handle. 

- Latency is more important for applications like shopping carts where users expect immediate feedback and will abandon slow-loading pages. 
- Throughput is more important for applications handling large amounts of data, such as video streaming (like Netflix using 30% of internet bandwidth), real-time mapping, autonomous cars processing millions of data points, or AI models.



![](https://i.imgur.com/SL3zLSL.jpeg)



There are three different kinds of throughput:

1. **server throughput**: measured in RPS (requests per second)
2. **database throughput**: measured in QPS (queries per seconds)
3. **data throughput**: measured in B/s (bytes per second), used to measure standard network connection throughput.

There is a tradeoff between latency and throughput. 

For example, batching DB query calls increases throughput but also increases latency.


##### Scaling

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

### Workflow

#### Staging vs Production

the **Golden Rule** is to **never debug directly in the production environment**.

- **Production:** This is the live environment where your actual users interact with the application. It contains real data, handles real traffic, and is where your system’s uptime is measured against SLAs
- **Staging:** This is a mirror environment that replicates the production setup as closely as possible, but is isolated from real users. It is used to test new features, configuration changes, or bug fixes before they are rolled out to the public.

**Why Debug and Test in Staging?**

1. **User Safety:** Debugging in production can lead to service interruptions, data corruption, or downtime that directly impacts your customers and revenue
2. **Controlled Environment:** Staging allows you to reproduce bugs in a safe space where you can manipulate data or trigger failure states without affecting real users.
3. **Validation:** It ensures that new code or "hot fixes" work as expected under production-like conditions

Once the bug is verified fixed in staging, a **hotfix** is then rolled out to the production environment, which serves as a quick, tested patch to restore stability

**how to implement staging environments**

At a high level, **staging is a mirror environment** designed to be a final rehearsal for your production deployment. Companies implement it by creating an infrastructure that mimics production as closely as possible to ensure that if code works in staging, it will work in production

Here is how companies typically implement staging:

- **Infrastructure Mirroring:** Using "Infrastructure as Code" (IaC) tools, companies spin up a separate instance of their web servers, load balancers, and network configurations that are identical to their live environment.
- **Environment Configuration:** While the architecture is the same, the **environment variables** are different. Staging will point to its own "sandbox" or test database, rather than the production database, to ensure that testing, data-wiping, or stress testing doesn't corrupt actual user data.
- **Isolation:** The staging environment is typically hosted on a separate URL (e.g., `staging.myapp.com`) or a restricted network, ensuring it is completely isolated from production traffic and real users.

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

#### API design and protocols

Here are the different types of API standards available which use HTTP

- **gRPC**: Go's custom protocol enabling communication between microservices using HTTP/2
	- **pro**: It is performant because it serializes data using protocol buggers, but only works over HTTP/2
	- **pro**: Since it uses HTTP/2, it has features like multiplexing and server push
- **graphQL**: alternative to REST that is useful for fetching only the desired data, fetching by entities rather than predefined endpoints.
	- **pro**: GraphQL can fetch data from multiple sources (like news feeds, pictures, and ads) and make it look like one endpoint, whereas REST would require multiple separate calls to different endpoints.
	- **pro**: achieves data fetching granularity, where you fetch only what you need.
	- **con**: has bad performance with N+1 problem
	- **con**: avoids the best practices for having semantic HTTP methods and error codes, since it always returns a 200 response with JSON.
- **REST**: standard for implementing HTTP-based API routes.
	- **pro**: simplest to implement and is also the most prevalent.
	- **con**: can result in underfetching or overfetching resources if you need something specific that's not defined in an API route. This leads to more requests and less performance.

if you can't use HTTP because you need a persistent, long-lived connection where the client and server subscribe to each other, you have two different paradigms you can use:

- **SSE**: one-direction real-time communication from the server to the frontend.
- **websockets**: bi-directional real-time communication between the server and the front end.
	- **pro**: Lower latency than HTTP, same performance as server sent events
	- **cons**: since it is stateful, it can't be horizontally scaled.

![](https://i.imgur.com/jzL905Z.jpeg)

Here is the complete walkthrough, from requirements to entity modeling to API design:


![](https://i.imgur.com/ozOeueG.jpeg)

### Caching

#### Types of caching

There are four types of caching available:

- **browser caching**: browser-controlled caching via cache headers like a server sending the `Cache-Control` header attached to a resource, delegating caching of the file to the browser.
- **server caching**: storing frequently accessed data server-side in-memory or in Redis with a fallback to querying the database and reading only from the cache.
- **database caching**: using query caching or object caching to reduce the number of READ/WRITE operations to a DB


#### browser caching

#### Server caching

Server caching always reads from the cache first, so all of these caching strategies are based on when and how servers write to the cache:

- **Write-around cache**: A cache-first approach where the server first checks the cache and then returns on a cache hit, and if a cache miss, queries the database and then stores the data in the cache.
	- **Use case**: used when write performance is less critical
- **Write-through cache**: A stale-while-revalidate approach where the server writes to both the cache and the database at the same time on WRITE operations, and on READ operations, reads from the cache.
	- **Pro**: Ensures data consistency
	- **Con**: slower than write-around cache
- **Write-back cache**: A stale-while-revalidate approach where the server first writes to the cache and then during a later time, writes to permanent storage.
	- **Pro**: improves write performance since you only write to cache, 
	- **Con**: Risk of data loss and low consistency since the cache and database may fall out of sync if the system goes down during the time between the cache write and the database write.

#### Database caching

Here is how **query caching** works:

1. Setup an external in-memory cache like Redis to be a key-value store for READ queries and the objects they return.
2. Before querying a database with a READ operation, we go to the cache to see if we have the result of that query cached, and if so, we go to the cache.

#### CDNs

- **origin server**: the host device that is running your original server instance, constrained to a region.
- **edge location**: locations around the world that cache static content sent from the origin server to client so that when clients request that static content again from your origin server, the edge location intercepts that request and immediately sends back the cached content.

CDNs are the system that facilitate edge locations caching static content responses from the origin server and also allows for business logic for rewriting responses like a reverse proxy.

There are two types of CDNs:

- **pull-based**: stale-while-revalidate CDN, where the edge location intercepts the request and goes to cache. If cache-hit, returns the static content, if cache miss, fetches content from origin server and then updates the cache.
	- **use case**: This stale-while-revalidate approach is ideal for READ-heavy applications where data is updated regularly.
- **push-based**: you upload content to the origin server and then the origin server distributes those files to the edge locations.
	- **use case**: Useful when you have large files that are infrequently accessed but you want to cache them.

Here is a final case-by-case basis on when to use a CDN or the origin server to handle specific types of requests:

Use CDN when:

- **cache static assets**: static assets don't change that often so they can be cached.
- **reducing load on origin server**: If requests first go to an edge location, and static asset downloading bandwidth is delegated to the edge locations, that takes the load off the origin server.
- **reduce static asset latency for global users**: Reduces the physical latency of a request to static content because clients request static content from the edge location nearest to a user.

Use origin server when:

- **creating a dynamic request**: When you need dynamic values that are user-specific like request headers, cookies, etc., then that request needs to originate from the origin server.
- **up-to-date data**: Handle requests with the origin server if the data needs to be as up-to-date as possible.
- **difficult business logic**: a CDN is not as powerful as a server, so they can't handle difficult business logic.


#### Standard progression

Each step should be implemented only when the previous approach reaches its limits.

- **level 1 - add the cache**: For read-heavy applications, implement a cache layer like Redis in front of the database to speed up reads.
- **level 2 - vertically scale**: Vertically scale your database instance to have more compute.
- **level 3 - partition**: partition data to gain exponential speedups in CRUD for all data in the database.
- **level 4 - sharding**: Shard the database and add a load balancer that reroutes queries with a shard key to the database instances.
- **level 5 - replication**: Add replicas and use the primary/replica strategy to ensure fast reads and fast writes.

### Proxies

A **proxy** is a request and response forwarder that manages HTTP traffic and sits in between a server and a client.

There are many types of proxies:

- **Forward Proxy:** Sits in front of the client. It intercepts requests from within an internal network and forwards them to the internet. 
	- **use case**: It is commonly used to control internet access, cache frequently visited sites, and hide the client's IP address
- **reverse proxy**: acts as a gatekeeper for servers, intercepting requests from the internet before it hits the server.
	- **use case**: load balancers, rewriting routes, or as a firewall for inbound traffic
- **Open Proxy:** Accessible to any user. It is often used for anonymous browsing and bypassing content restrictions
- **Transparent Proxy:** Passes requests and resources along without modifying them. It is visible to the client and often used for content filtering and caching
- **Anonymous Proxy:** Identifiable as a proxy but keeps the original client IP address hidden
- **Distorting Proxy:** Similar to an anonymous proxy but provides an incorrect IP address to the destination server
- **High Anonymity (Elite) Proxy:** Makes proxy usage very difficult to detect by not sending identifiable headers like `X-Forwarded-For`, ensuring maximum privacy
#### Forward proxies

![](https://i.imgur.com/49jJsLD.jpeg)

Forward proxies forward requests from a client to a server, but replace the sender IP (the client's IP address) with the forward proxy's IP address.

Here is the process:

1. The client initiates a request to a destination server.
2. The forward proxy intercepts the request
3. based on its configuration, the forward proxy decides whether to allow, modify, or block the request to the destination server.
4. After doing what it does to the request, the forward proxy overrides the send IP address to be the forward proxy's own IP address.

Here are some example use cases:

- **instagram proxy**: Forward proxy used to allow for multiple instagram accounts on the same device without triggering restrictions or being flagged for suspicious activity
- **internet use control**: Companies use forward proxies sort of like a firewall to monitor client requests and decide whether to block or allow them.
- **caching**: Forward proxies can cache websites a client requests, speeding up websites

#### Reverse proxy

A reverse proxy is a gate before servers or a list of servers, where a client only interacts with the reverse proxy and doesn't know about the actual server insances the reverse proxy redirects to.

here are some common use cases:

- **load balancers**: the reverse proxy can forward incoming requests to any number of IP addresses in a round robin way, making it ideal for load balancing.
- **CDNs**: CDNs are reverse proxies because they sit between the client and the origin server, only routing to the origin server (if a pull-based CDN) on a cache miss but on a cache hit, immediately returning a response.
- **firewalls**: Since reverse proxies sit before a server, they can control and monitor inbound traffic to the server.
- **SSL offloading**: reverse proxies can take care of performing SSL encryption once with the client instead of reinitiating it each time for multiple server instances if in a load balancer. This takes the load of SSL off the server.

### Load balancers

#### How load balancers work

The load balancer acts as a **reverse proxy server** that forwards traffic to individual server instances

- **health checks**: the **listener** component of the load balancer sends periodic health checks on all of the instances in its target group, so it automatically knows which instances are healthy and are thus available to send traffic to and which instances are not available to send traffic to.
- **redundancy and failover**: If the load balancer server fails, then that is a single point of failure and the individual server instances in the target group can no longer be accessed. To avoid this, we add multiple reverse proxy servers for redundancy so that another reverse proxy can be used as a **failover** in case the main load balancer server goes down.
	- This technique of switching to another reverse proxy failover is called **DNS failover**

![](https://i.imgur.com/y2X3q4P.jpeg)


#### Round robin

The round robin algorithm is where incoming requests are distributed in order to individual instances in a target group in a cyclic fashion, circling around once again to the first instance once all instances have been dished a request.

- **use case**: when the load is able to be uniformly distributed and all servers handle the same type of request and all servers are one for one replicas.

#### Least connection

This load balancer algorithm directs traffic to the server instance with the least active connections.

- **use case**: useful when the server load is not evenly distributed, to make the distribution a bit more equal.

#### Least response time

This load balancer algorithm directs traffic to the server instance with the least active connections AND least response time (lowest latency)

- **use case**: when you want to provide the fastest response time to requests so you choose to direct traffic to the instance that is currently the least burdened with traffic.


#### IP hashing

This load balancer algorithm directs traffic by hashing the client's IP address and based on that hash, it sends it to a specific "bucket" being the target instance to forward the request to.

This not only leads to equal distributions of traffic across all server instances, but also provides a deterministic way for a client to connect to a specific target instance.

- **use case**: when you want the client to always connect to the same server instance, so it's useful for in-memory server connections and storage like session persistence.

#### Load balancer advanced algorithm types

There are three main types of advanced load balancer algorithms:

- **weighted**: directing more traffic to more capable servers, and less traffic to less capable servers.
- **geographic**: directing traffic to server instances that are geographically closest to the user or based on specific regional requirements.
- **consistent hashing**: hashes the client's request header information to deterministically map that to a specific target instance for handling that request.

**weighted algorithms**

By assigning weights to servers based on their hardware profile or performance metrics, we can more adequately assign traffic percentages based on how capable a specific server instance is.

- **high weight case**: more capable servers with higher throughput and better hardware specs will have a higher weight, and thus handle more of the traffic.
- **low weight case**: less capable servers with less CPU and RAM will have a lower weight, and thus handle less of the traffic.

**geographic algorithms**

These algorithms direct traffic to server instances that are geographically closest to the user or based on specific regional requirements.

- **use case**: for reducing latency for clients that are far away from the origin server

**hashing algorithms**

The algorithms hash the client's request header information to deterministically map that to a specific target instance for handling that request.

- **use case**: for being able to provide persistent, in-memory server storage like sessions or an in-memory cache to connect to the same client.

### NoSQL vs SQL

#### ACID

Relational databases are ACID compliant:

- **atomicity**: transactions are all or nothing. You can commit a batch of actions called a **transaction** to complete all at once, or you can roll them back if they fail.
- **consistency**: after a transaction, your database should be in a consistent state. Transactions should either complete all batched actions or complete nothing if errored out.
- **isolation**: One transaction should not affect another. 
- **durability**: once a transaction is committed, the data is there to stay and there is no data loss.

NoSQL databases drop the C from ACID, so they have atomicity, isolation, and durability, but are not consistent.

#### Column Databases

Column databases are optimized for searching and situations where you don't need a strict structure. They store similar data together in columns (like all names in a name column), making queries for specific fields very fast. They can also reduce storage through encoding when there are repeated values, as the repetition can be represented more efficiently.

### Database scaling

#### Database scaling options

You can either scale a database vertically or horizontally.


![](https://i.imgur.com/IDoGDqr.jpeg)

- **vertical scaling a DB**: improving the hardware profile of the instance running the DB
- **horizontal scaling a DB**: using sharding for horizontal scaling and then replication to increase availability and redundancy.
#### partitioning

ACID compliant databases like SQL can only be viertically scaled, because otherwise horizontal scaling breaks ACID compliance.

To get around this problem and horizontally scale the databases, we use **sharding**, but first we have to understand partitioning.


![](https://i.imgur.com/SVj6QuQ.jpeg)

Partitioning is simply splitting a large table into two or more subtables based on some condition. 

Here is the thought process behind why partioning is so effective, using the example above:

1. A table `users` indexed by `id` is large, containing let's say 10000 users, but we can split it into two subtables of equal size by splitting based on the condition `id < 5000`, which we'll call our **partition condition**
2. Now we cut the B-tree representation of the `users` table in half, making linear searches two times faster and achieving exponential speedup when searching by the indexed `id` field.
3. Performing CRUD on the partitioned data is also super easy, since we can find the appropriate subtable that contains the data via the partition condition.


> [!IMPORTANT] 
> Partitioning is simple. It's just creating subtables within the same database - it's not like you removed any data. 
> 
> The main difference between partitioning and sharding is that sharding splits subtables across different machines, leading to horizontal scaling of the databse.

#### Sharding

Sharding is partitioning but putting the subtables across different database instances, which achieves true **horizontal scaling** for databases.

We will have multiple database instances and put a load balancer with a **hashing algorithm** rerouting traffic to them based on a **shard key**, where each database instance has its own unique value for the shard key and thus that's how we know which subtable lives in which database instance.

> [!WARNING]
> A shard key is an arbitrary field used to determine how data is distributed across different sharded databases. 
> 
> - It's critical to choose it carefully because if chosen incorrectly, data may not be evenly distributed, leading to some database clusters being overloaded while others are underutilized. 
> - For example, sharding by first name assumes names are evenly distributed across the alphabet, which may not be true.

Here is how sharding works when performing CRUD on a table record:

1. The loader balancer receives a query request with a shard key
2. The load balancer hashes the **shard key** to determine which database instance the table record belongs to and then forwards the request to that instance.
3. Query the table from that database instance.



![](https://i.imgur.com/hWr1xNZ.jpeg)

> [!NOTE]
> The main difficulty in choosing the shard key is that sharding is most effective when you equally subdivide the data into equally-sized sections, as to take advantage of the exponential speedup that comes with downsizing B-trees to half their size.

> [!TIP]
> Obviously, don't shard if you don't need to. Reach for partitioning first, and then when necessary, shard, since sharding adds additional complexity and overhead compared to partitioning.

Here are the main cons of sharding:

- **complex and easy to mess up**: Sharding adds the overhead and complexity of a load balancer, and you must pick your shard key correctly to equally distribute the data across instances and reap any performance benefits.
- **slower for joins and multi-table queries**: JOIN and any other multi-table statements will require multiple round trips to the load balancer and evaluation of shard keys, leading to slower execution time for complex queries.

#### Sharding strategies

- **range-based sharding**: This strategy involves distributing data across shards based on the value range of a specific key (e.g., storing user IDs 1-1000 on one server and 1001-2000 on another).
	- This is what we just went over.
- **Directory-based sharding:** This approach utilizes a centralized lookup service or "directory" that maps specific data keys to the correct shard. The system consults this service to determine which database server holds the requested data.
- **Geographical (or Location-based) sharding:** Data is split and stored based on the physical or regional location of the data. This is particularly useful for optimizing latency by ensuring data is physically closer to the users accessing it in specific regions.

#### Sharding for NOSQL databases

In NoSQL databases like mongo, sharding automatically happens, which is a huge advantage. This shows that NoSQL tools can be used for scale.


#### Replication

Replication is making copies of your data across multiple servers or locations, which increases fault tolerance (no single point of failure), availability, and read performance (reads work like CDNs).

Replication works by creating multiple database instances that hold the exact same data, but designating them as one of these two functions:

- **primary**: The primary database isntance, handling all write operations. This is the ultimate source of truth.
- **replica**: Database instances that copy whatever write operations happened in the primary. 
	- These are copies of the primary. 
	- Replicas handle all read operations, rerouted from a load balancer choosing which replica to query.


> [!NOTE]
> This separation of concerns, where the primary handles writes and the replicas handle reads allows for increased performance and speed.



![](https://i.imgur.com/axJ909W.jpeg)



**primary / replica**

1. Establish one database instance as the **primary**, which handles all write operations.
2. After each write operation to the primary, each **replica** copies over that written data, getting in sync with the primary. All read operations are load balanced to replicas.
3. If the primary fails, any available replica takes over and becomes the new primary.

> [!NOTE]
> The main advantage is improved performance for read-heavy applications, since the primary database handles all writes without being slowed down by reads, and replicas handle the read operations.

![](https://i.imgur.com/fhRLP0r.jpeg)

> [!WARNING]
> The main con with this architecture is that you are not guaranteed consistency and you can suffer data loss. The latency between writes to the primary and updates to replicas creates this consistency gap.

We can fix this main con by always doing writes to a primary within a transaction of two steps:

1. Write to primary
2. Write to replica

This ACID transaction guarantees consistency, even though some data operations might fail just because of the replica even if writing to the primary succeeds.


**primary/primary**

This architecture is easier to reason about, where all database instances handle read and write operations and are essentially just full, bona-fide copies of each other, horizontally scaling exact copies of each database.


![](https://i.imgur.com/llZHIsc.jpeg)

> [!WARNING]
> The main complexity is handling conflict resolution between servers - determining how to negotiate and reconcile differences when multiple primaries are writing simultaneously. This often requires an intermediary service to rectify the data before posting to full replicas.

#### Replication Strategies

- **transactional replication strategy**
	- **description**: In a transactional replication strategy, a write or update is not considered complete until all copies have the same data and all replicas have confirmed the write. This creates a highly consistent system. 
	- **tradeoff**: The trade-off is reduced performance and availability, as the system must wait for every database to acknowledge the write before responding, making it slower.
- **snapshotting strategy**
	- **description**: Snapshotting just captures the entire database file as it is, serving as a backup. 
	- **advantages**:
		- cheaper because it's not write-heavy (only occurring at periodic intervals)
		- it provides better resiliency by preventing data corruption from spreading
		- guarantees a rollback point to the last known good state. 
		- Snapshots can also be taken at any desired frequency and are easier to distribute around the world since there's no time pressure.
	- **tradeoff**:

#### Sharding and replication

When you replicate after sharding, you need to replicate each sharded database individually. This means the replication strategy must be applied across all shards, adding to the complexity and resource requirements of the system.



### Asynchronous workflows

In the context of system design, asynchronous workflows are ways to set and forget an expensive operation like an LLM call or video processing and notifying the user when the background job is done.

## Software Architecture Patterns

### Intro

There are three types of software architecture patterns:

- **system applications**: architecture patterns that help us create a single application (functionality) for an end user, basically the end product.
	- **Monolith**
	- **N-tier**
	- **Service-oriented**
	- **Microservices**
	- **Serverless**
	- **Peer to peer**
- **Application patterns**: architecture patterns that help build a single executable, and can be part of a larger system.
	- **Layered**
	- **Onion**
	- **Ports and adapters**
	- **Modular monolith**
	- **Microkernel**
	- **CQRS**
	- **event sourcing**
- **UI patterns**: patterns to help build the user interface
	- **Forms and controls**
	- **MVC (model-view-controller)**
	- **MVP (model-view-presenter)**

### System patterns

#### Monolith

A monolith is a single executable application containing all logic, making it simple to understand, implement, test, and deploy.


![](https://i.imgur.com/eD2RWiG.jpeg)


**pros**

- easy to understand, implement, test, and deploy
- ideal for projects with limited scope or for getting started quickly but can lead to tight coupling and difficulty in modifying or extending as the application grows.

**cons**

- **tight coupling**
- **easily leads to complex code**

#### N-tier

N-tier architecture divides an application into multiple tiers ($n$ tiers), each responsible for a specific technical function, such as presentation (UI), business logic, and data storage.

- **pro (independence)**: These tiers can be physically separated and independently developed, deployed, and theoretically scaled.
- **con (tight coupling)**: In practice, changes often affect multiple tiers, called **rippling through tiers**.
	- For example, adding a new form field may require updates in the UI, business logic, and database.

> [!NOTE]
> Each tier can be developed independently but scaled independently, but N-tier approach still has some coupling between the tiers, differing from microservices.

Here's the main difference between N-tier and microservices:


- **N-tier architecture** divides an application into multiple technical tiers such as presentation (UI), business logic, and data storage. These tiers can be on separate machines and developed independently, but they often remain tightly coupled because changes in one tier may require changes in others.  
- **Microservices architecture** breaks down an application into small, independent services that focus on specific business capabilities. Each microservice can be developed, deployed, and scaled independently, offering greater flexibility and scalability compared to N-tier.

#### Service-oriented architecture


![](https://i.imgur.com/oj476FE.jpeg)


**Service-oriented architecture (SOA)** consists of multiple services representing business activities, communicating through a central enterprise service bus (ESB) that standardizes data contracts and handles messaging.


- **loose coupling**: SOA offers flexibility and scalability by decoupling services and centralizing business capabilities, but requires strong centralized governance, which can reduce team autonomy and increase costs.
- **pro (messaging abstraction)**: The ESB manages routing, protocol handling, and business logic for message processing, allowing services to interact without needing to know each other's details, which simplifies integration and maintenance.

#### Microservices

Microservices break an application into multiple independent services, each responsible for specific business functionality and maintained by separate teams.

Services communicate via lightweight protocols like HTTP or message brokers without embedding business logic in the communication layer.

- Microservices improve scalability and team agility but introduce complexity in communication and require automation for testing, deployment, and monitoring.
- To ensure resilience, some data may need to be duplicated across services to avoid cascading failures and for testing purposes.

**pros**

1. **loosely coupled**: each individual service is independent and has no coupling with other services.
2. **easily scalable**: each individual service can be scaled up with targeted scaling.
3. **increased agility**: teams can develop features for a single service faster because they don't have to worry about touching the whole system and deploying the entire app just for a small change in a single part of the app.

**cons**

1. **not easy**: requires skilled engineers
2. **complex communication patterns**

#### Serverless

Serverless architectures come in two main types: backend-as-a-service (BaaS), where you use third-party services for common needs, and function-as-a-service (FaaS), where your code runs in short-lived, stateless functions managed by the cloud.

- **Advantages**: easy scalability, reduced infrastructure management, and rapid experimentation with new features.
- **Challenges**: vendor lock-in, the need for stateless functions, cold start latency, and difficulty in predicting costs.

### Distributed systems

Distributed systems consist of multiple independent applications that together form a single user-facing system, which 

Examples of distributed systems are microservices, service-oriented architecture, etc.

But as we'll see, distributed systems have two main issues:

1. **data duplication**: separate services that read from the same data source (app DB) need to duplicate the data source so they can develop with it independently, as to reap all the benefits of being a truly distributed system.
2. **transactional integrity**: separate services have a harder time guaranteeing data consistency because of data duplication.
#### Transactional integrity

Distributed systems have challenges like maintaining **transactional integrity** across services.

Transactional integrity is the idea that a *database transaction is consistent*, which is true in monoliths (since there is only one DB instance) but not true in distributed systems like microservices since each service will have its own independent database process.


![](https://i.imgur.com/yqcHG2N.jpeg)


To solve this problem in distributed systems, we can use patterns like the **saga pattern** and **transactional outbox** to help manage data consistency by handling compensating actions and ensuring reliable message delivery.


![](https://i.imgur.com/0DzlTLB.jpeg)


- **Saga pattern:** It helps maintain data consistency across multiple services by using **compensating actions**. 
	- If one service fails after others have updated their data, the saga triggers actions to undo or compensate for those changes, effectively rolling back to the previous state without relying on a single database transaction.  
- **Transactional outbox pattern:** This pattern ensures reliable message delivery between services.
	- When a service updates its data, it also stores a message in the same database transaction. 
	- A separate process (a message broker) then regularly sends these stored messages to other services, guaranteeing that messages are eventually delivered even if direct communication fails.
#### Data duplication

#### Messaging
### Peer to Peer

Peer-to-peer applications form a decentralized network where individual applications communicate directly without a central server.

- **pro**: This architecture is cost-effective and easily scalable by simply adding more machines, making it ideal for sharing resources like processing power or storage.
- **con**: However, it has security challenges due to decentralization and is suited only for specific scenarios, so it might not be common in typical back-end development work.

### Application Patterns 1

#### Layered

The layered pattern organizes an application into distinct layers (presentation, application, business, persistence, and database), with calls flowing downward from one layer to the next.

- Each layer has specific responsibilities, such as handling the UI, business logic, or database interactions, which helps structure the code clearly.
- While widely used and easy to understand, layered applications can become tightly coupled and harder to maintain, especially as passing data through layers may add unnecessary complexity.

#### Onion

- At the core is the domain model, containing your business logic and data.
- Surrounding that are domain services, which define interfaces for infrastructure needs like data storage but don't implement them.
- Next are application services that handle business logic spanning multiple domain models and are called by the UI or tests.
- The outermost layer is the infrastructure layer, which implements the interfaces defined in the inner layers, such as database access.

A key principle here is dependency inversion: inner layers define interfaces and are independent of outer layers, which implement those interfaces. 

- This decouples your business logic from infrastructure concerns, making your code easier to test and maintain. 
- Compared to traditional layered architecture, onion architecture reverses the dependency direction, improving modularity and flexibility.

#### Ports and adapters


ports and adapters (hexagonal) architecture:  
  

- The core business logic defines interfaces called ports, and separate modules called adapters implement these ports.
- Primary adapters drive the application (e.g., UI, tests), while secondary adapters are called by the domain (e.g., databases, external services).
- This pattern emphasizes modularity by placing each adapter in its own module, promoting loose coupling and easier testing.
- It requires applying the dependency inversion principle, which helps decouple business logic from infrastructure.


While similar to onion architecture, ports and adapters focus more on modular separation of adapters.

Many industry experts recommend this pattern for building maintainable and flexible software systems.

#### Differences

The main difference lies in how boundaries and modules are defined; onion is more opinionated about the domain structure, while ports and adapters focus on modular separation without prescribing domain details.

### UI patterns


#### Forms and controls

This pattern separates UI definition (like XAML or markup) from the code behind that handles user interactions and events.

- **pro**: It's simple and effective for small or proof-of-concept desktop or mobile apps, allowing quick development.
- **con**: However, as the app grows, the code behind often becomes complex and bloated with business logic, making automated testing difficult and increasing the risk of bugs.

#### MVC

MVC separates an application into three parts: the model (manages data), the view (displays data), and the controller (handles user input and communicates with the model).

- **model**: receives input from the controller and manages the data.
- **controller**: responsible for receiving user input and handing it to the model in a way it will understand.
- **view**: responsible for pulling data from the model and presenting it in the UI.

Here are the pros and cons

- **pro (loose coupling)**: This separation allows developers to work on different components in parallel and makes testing easier since UI and logic are decoupled.


MVC is widely used in web frameworks but is only a UI pattern; You can end up with bloated controllers where a single controller handles data validation, complex logic, etc., then they'll become difficult to manage.


> [!TIP]
> To avoid bloated controllers, it should be combined with other architectural patterns like onion architecture for a cleaner, more maintainable design.

- **The Flow:** User Input → Controller → Model → View. 
- **Key Characteristic:** The Model can notify the View directly (often via an Observer pattern). The Controller handles user input but doesn't strictly mediate every update.

```ts
// --- MODEL ---
// Holds data and business logic. Notifies listeners when data changes.
class CounterModel {
  public count = 0;
  private listeners: (() => void)[] = [];

  public increment() { this.count++; this.notify(); }
  public decrement() { this.count--; this.notify(); }
  
  public onChange(listener: () => void) { this.listeners.push(listener); }
  private notify() { this.listeners.forEach(l => l()); }
}

// --- VIEW ---
// Renders the UI. Listens to the Model for direct updates.
class CounterView {
  constructor(
    private incrementBtn: HTMLButtonElement,
    private decrementBtn: HTMLButtonElement,
    private display: HTMLSpanElement
  ) {}

  public render(count: number) {
    this.display.textContent = count;
  }

  public bindIncrement(handler: () => void) { this.incrementBtn.addEventListener('click', handler); }
  public bindDecrement(handler: () => void) { this.decrementBtn.addEventListener('click', handler); }
}

// --- CONTROLLER ---
// Handles user input, manipulates the model, and wires things together.
class CounterController {
  constructor(model: CounterModel, view: CounterView) {
    // 1. Handle user input
    view.bindIncrement(() => model.increment());
    view.bindDecrement(() => model.decrement());

    // 2. When Model changes, update the View
    model.onChange(() => view.render(model.count));

    // 3. Initial render
    view.render(model.count);
  }
}
```

#### MVP

The Model-view-presenter (MVP) pattern is a UI architectural pattern that separates an application into three parts:  
  

- **Model:** Manages the data and business logic.
- **View:** Handles user interactions and displays data.
- **Presenter:** Acts as an intermediary that receives events from the View, updates the Model, and tells the View what to display.

  
There are two main MVP styles:  
  

- **Passive View:** All UI logic is in the Presenter, making the View very simple.
- **Supervising Controller:** The View handles UI rendering logic, while the Presenter manages more complex logic.

  

> [!NOTE]
> MVP is especially useful for desktop or mobile apps because it cleanly separates concerns, making the app easier to test and maintain. 

The Presenter is designed to be technology-agnostic by interacting with the View through interfaces, which also helps in adapting the UI to different platforms.

Modern development tightly couples UI with logic, so we use the MVP pattern more than MVC now.


- **The Flow:** User Input → View → Presenter → Model → Presenter → View. 
- **Key Characteristic:** The View is completely "Passive" (Dumb). It exposes an interface so the Presenter can update it. 
	- The View has **zero** knowledge of the Model. 
	- This makes MVP incredibly easy to unit test.

```ts
// --- MODEL ---
// Same as MVC, but it doesn't need to notify anyone. The Presenter handles state.
class CounterModel {
  public count = 0;
  public increment() { this.count++; }
  public decrement() { this.count--; }
}

// --- VIEW (Interface) ---
// Defines what the Presenter CAN do to the View, and what the View WILL report.
interface ICounterView {
  setCount(count: number): void;
  onIncrement(): void;
  onDecrement(): void;
}

// --- VIEW (Implementation) ---
// The actual DOM. It implements the interface and delegates events to the Presenter.
class CounterView implements ICounterView {
  private incHandler?: () => void;
  private decHandler?: () => void;

  constructor(
    private incrementBtn: HTMLButtonElement,
    private decrementBtn: HTMLButtonElement,
    private display: HTMLSpanElement
  ) {
    this.incrementBtn.addEventListener('click', () => this.incHandler?.());
    this.decrementBtn.addEventListener('click', () => this.decHandler?.());
  }

  public setCount(count: number) { this.display.textContent = count; }
  
  // The Presenter will call these to subscribe to events
  public onIncrement(handler: () => void) { this.incHandler = handler; }
  public onDecrement(handler: () => void) { this.decHandler = handler; }
}

// --- PRESENTER ---
// The middleman. It takes user actions from the View, updates the Model, 
// and explicitly tells the View to update.
class CounterPresenter {
  constructor(private model: CounterModel, private view: ICounterView) {
    // 1. Subscribe to View events
    view.onIncrement(() => {
      this.model.increment();
      this.view.setCount(this.model.count); // Explicitly update view
    });

    view.onDecrement(() => {
      this.model.decrement();
      this.view.setCount(this.model.count); // Explicitly update view
    });

    // 2. Initial state
    this.view.setCount(this.model.count);
  }
}
```


#### MVVM

The MVVM (Model-View-ViewModel) pattern separates an application into three parts:  
  

- **Model:** Contains the business logic and data.
- **ViewModel:** Acts as an intermediary that interacts with the Model and exposes data and commands to the View.
- **View:** The user interface that binds to the ViewModel using advanced data binding provided by the platform.

This pattern enables two-way data binding, so user actions update the ViewModel, and changes in the ViewModel update the View automatically. 

![](https://i.imgur.com/YPXwiSZ.jpeg)
- It promotes a clean separation of concerns, making the application easier to test and maintain. 
- MVVM is especially useful for desktop and mobile apps that support data binding. 
- However, it can be complex to debug if data binding issues arise, and it might be overkill for simple applications.

Here is a code example:

- **The Flow:** User Input → View → ViewModel → Model → ViewModel (via Data Binding) → View. 
- **Key Characteristic:** Two-way "Data Binding". The View binds to properties on the ViewModel. 
	- The ViewModel has **no idea what the DOM looks like**. 
	- When the ViewModel's state changes, the View automatically reacts.

```ts
// --- MODEL ---
class CounterModel {
  public count = 0;
  public increment() { this.count++; }
  public decrement() { this.count--; }
}

// --- VIEWMODEL ---
// Exposes a reactive state that the View can bind to. 
// Uses a simple manual "binding" pattern since we are in vanilla TS.
class CounterViewModel {
  private _count = 0;
  private countChangeListeners: ((count: number) => void)[] = [];

  // Getter/Setter allows us to trigger UI updates when state changes
  get count() { return this._count; }
  set count(val: number) {
    this._count = val;
    this.countChangeListeners.forEach(cb => cb(this._count));
  }

  constructor(private model: CounterModel) {}

  // The View calls this to "bind" itself to the data
  public bindCount(callback: (count: number) => void) {
    this.countChangeListeners.push(callback);
    callback(this._count); // Trigger initial state
  }

  // The View calls these on user input. No DOM logic here!
  public increment() { this.model.increment(); this.count = this.model.count; }
  public decrement() { this.model.decrement(); this.count = this.model.count; }
}

// --- VIEW ---
// Binds to the ViewModel. It sets up the reactive connection.
class CounterView {
  constructor(
    private viewModel: CounterViewModel,
    private incrementBtn: HTMLButtonElement,
    private decrementBtn: HTMLButtonElement,
    private display: HTMLSpanElement
  ) {
    // 1. DATA BINDING: Tell the ViewModel to update this DOM element whenever count changes
    this.viewModel.bindCount((count) => {
      this.display.textContent = count;
    });

    // 2. COMMAND BINDING: Tell the buttons to execute ViewModel methods
    this.incrementBtn.addEventListener('click', () => this.viewModel.increment());
    this.decrementBtn.addEventListener('click', () => this.viewModel.decrement());
  }
}
```


### MVC, MVP, MVVM

All three patterns aim to decouple the UI from business logic to improve testability and maintainability.

The main differences in these patterns arise from two things: 

1. how data flows
2. which component knows about which other component?

And:

- **which component handles user input?**: MVC uses a controller to handle user interaction, while MVP and MVVM handle it through the view.
- **The amount of code in the UI varies**: MVP views are aware of the presenter, MVC and MVVM views can be mostly markup or UI code.
- **view binds to model?**: In MVC, the view binds directly to the model; in MVP, the view's awareness of the model depends on the style; in MVVM, the view binds to the ViewModel, not the model.
- **data binding level**: Data binding ranges from minimal in MVP (passive view) to advanced two-way binding in MVVM.

![](https://i.imgur.com/3AOpe4F.jpeg)

Here is a summary of the differences:

1. **In MVC**, the `Model` is the boss. It shouts out "I changed!" and the `View` listens to it directly.
2. **In MVP**, the `Presenter` is the boss. The `View` is deaf and dumb; the `Presenter` tells it exactly what to display after every single action. (Notice we used an `interface` for the View—this allows you to pass in a "FakeView" in your unit tests to test the Presenter perfectly).
3. **In MVVM**, the `ViewModel` is the boss. It just holds state and logic. The `View` says "I will watch your `count` property, and I promise to update myself if it changes." (In frameworks like Angular or Vue, the `bindCount` logic is handled automatically under the hood via template syntax like `{{ count }}`).