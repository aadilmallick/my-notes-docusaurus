## Backend architecture Intro

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

- **pro (resilience)**: distributed services have flexibility in changing the components of the entire system, allowing you to change each individual component quickly and without impacting other parts of the system.
- **pro (targeted scaling)**: different microservices may need more compute resources, and you can target those services directly to give them more resources.
- **pro (faster development)**: easier to add new features since you add features in isolation, not to an entire system. Also easier for CI/CD on large systems.
- **pro (faster deployment)**: As opposed to a monolith, where you have to deploy the entire repo all at once, with microservices, you can deploy each individual service at a time, and they will be compatible with the rest of the services because they communicate via a standard, unchanging API.

Microservices communicate with each other via HTTP REST or messaging queues.

**telling the difference between generic services and microservices**

- **generic service**: If your service does multiple things, like being the backend for the entire application, then it's a generic service.
- **microservices**: if your service does only one thing (like backend routes dealing only with payments) then you have a microservice.

You have a microservice if you have one service per feature. It follows the single-responsiblity principle, where each service does only one thing or implements one feature.


**when to use microservices**

Microservices is absolute overkill if you're not a large company. Once you have a lot of traffic and need to scale, then microservices helps you deploy features quickly and more safely, and scale individual components (auth, database, payments) as traffic needs require.


![](https://i.imgur.com/c03b49m.jpeg)

**how to use microservices**

Microservices need stable environments and have the ability to scale up and down with ease, so the most common way to implement microservices is to run the code in the container and that container will be the host for the service.

By default, it's one container per service, but via targeted scaling, we can create multiple instances of the container and thus multiple replicas of the service and then use a load balancer to distribute traffic across those service replicas.



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

## Microservices

### Why Microservices

The tight coupling in monoliths make scaling hard, but if we divide an app into independent pieces, we can scale those pieces independently.



