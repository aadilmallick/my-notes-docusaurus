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

### Microservices

Microservice architecture is the idea of running each component of the application in their own isolated environment and separately deploying them, like having one pod for frontend, one pod for backend, one pod for database, etc.