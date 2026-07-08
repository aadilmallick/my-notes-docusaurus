## Backend Performance
### Code antipatterns

#### Memory leaks

Memory leaks typically arise from errors in code that manages memory allocation and deallocation. Here are some common scenarios:

- **Unreleased Objects:** Objects are created and allocated memory, but the program loses all references to them before freeing the memory. The garbage collector (in languages that have one) can't reclaim this memory because it still *thinks* the object is in use.
- **Circular References:** Two or more objects hold references to each other, preventing the garbage collector from identifying them as unused, even if no other part of the application references them.
- **Unclosed Resources:** Resources like file handles, network connections, and database connections consume memory. Failing to close these resources after use can lead to memory leaks.
- **Event Listeners:** In languages with event-driven architectures, failing to remove event listeners can keep objects alive longer than necessary, leading to memory leaks.
- **Global Variables:** Overuse of global variables, especially when they store large objects or data structures, can prevent memory from being released.

**mitigations**

- **Avoid using global variables unnecessarily.** Global variables can prevent memory from being released because they are always in scope. Instead, use local variables with limited scope.
- **use object pools**: For frequently created and destroyed objects, consider using object pools. Object pools can reduce memory allocation overhead by reusing existing objects instead of creating new ones.
- **avoid circular references**: Be careful when creating circular references between objects. If possible, avoid circular references altogether. If you must use them, consider using weak references to break the cycle and allow the garbage collector to reclaim the memory.

#### Excessive creating and deletion of objects

**Concept:** "Improper Instantiation" refers to the anti-pattern where an application unnecessarily creates new objects or allocates new resources, often repeatedly, when existing or shared resources could be reused or when the object creation is simply not needed. This includes:

- **Excessive object creation within loops:** Creating a new object inside a loop where it could have been created once outside.
- **Re-creating expensive resources:** Establishing a new database connection, file handle, or network socket for every operation, instead of using connection pools or persistent connections.
- **Unnecessary allocation of temporary objects:** Generating many short-lived objects that immediately become garbage.
- **Not using singletons or factory patterns for expensive-to-create objects:** If an object is costly to initialize and its state can be shared, recreating it multiple times is wasteful.

**Why it's a problem:** Every object creation comes with an overhead:

1. **Memory Allocation:** Memory needs to be found and assigned for the new object.
2. **Initialization:** The object's constructor and initial properties need to be set up.
3. **Garbage Collection Overhead:** When objects are no longer referenced, the garbage collector (GC) needs to identify and reclaim their memory. Excessive object creation means the GC runs more frequently and for longer durations, pausing application threads ("stop-the-world" pauses) and consuming CPU cycles that could be used for application logic.
4. **CPU Cycles:** Both allocation and deallocation consume CPU time.
5. **Cache Thrashing:** Rapidly creating and discarding objects can lead to poor CPU cache utilization, as the cache is constantly filled with new, short-lived data.

This anti-pattern is particularly prevalent in languages with automatic garbage collection (like Java, C#, Python, JavaScript), where developers might become complacent about memory management.**Symptoms:**

- High CPU utilization (due to GC activity).
- Frequent and long GC pauses (visible in profiling tools).
- Rapidly increasing memory usage graphs (sawtooth pattern, where memory climbs then drops sharply after GC).
- Overall application sluggishness.

> [!TIP] > **Key Takeaway for Improper Instantiation:** Be mindful of where and when you create objects, especially within hot code paths (frequently called functions or loops). If an object is stateless, thread-safe, and expensive to create, use a singleton pattern or inject a single instance. If it's a simple temporary object that doesn't need to be recreated, consider if its allocation can be moved out of a loop or avoided altogether.

#### Resource Contention

**Concept:** The "Noisy Neighbor" anti-pattern occurs in shared resource environments (e.g., cloud VMs, containers on the same host, database servers) where the excessive or inefficient resource consumption by one application or component negatively impacts the performance of others sharing the same underlying resources.Imagine living in an apartment building (your server/cloud instance) where one neighbor (your application's component or another co-located app) plays loud music (consumes too much CPU/memory/I/O), disrupting everyone else's peace (slowing down other applications or parts of your own).**Examples of Shared Resources:**

- **CPU:** Multiple processes/containers/threads competing for CPU time on the same core(s).
- **Memory:** Applications consuming too much RAM, leading to swapping (moving data from RAM to disk, which is very slow) or constant GC churn for others.
- **Disk I/O:** Multiple applications trying to read/write to the same physical disk, saturating the I/O bandwidth.
- **Network Bandwidth:** One application sending/receiving massive amounts of data, choking the network for others.
- **Database Connections/Resources:** One application holding too many database connections, running long-running queries, or causing excessive locks, preventing others from accessing the DB.
- **Thread Pools:** If multiple parts of your application or different applications share a single thread pool, one "noisy" operation can starve others.

**Why it's a problem:**

- **Degraded Performance:** The most obvious impact. Applications slow down.
- **Unpredictable Performance:** Performance becomes inconsistent and bursty, making it hard to diagnose.
- **Resource Starvation:** Other applications or components can't get the resources they need to function properly.
- **Cascading Failures:** A noisy neighbor can lead to timeouts, retries (which further increase load), and ultimately failures in other dependent services.
- **Difficulty in Diagnosis:** It's often hard to pinpoint the source of the "noise" as it might be an issue in a completely different part of the system or even another application on the same host.

**Symptoms:**

- Intermittent performance degradation across multiple services/features.
- High utilization of a shared resource (CPU, disk, network) without a clear owner.
- Increased queue depths for shared resources (e.g., database connection queue).
- Timeouts or slow responses from services that are otherwise fine.
- "Random" slowdowns not tied to specific deployments or code changes.

##### Mitigation Strategies for Noisy Neighbor Problems

TDLR:

1. **run in separate containers**: run heavy processes in separate containers and expose their functionality for other containers to use via API
2. **rate limit**: implement rate limiting to avoid a heavy process being used too much

Addressing the Noisy Neighbor anti-pattern requires a combination of architectural, operational, and code-level strategies:

1. **Resource Isolation / Dedicated Resources:**
   - **Concept:** Provide dedicated resources for critical components or different applications to prevent them from interfering with each other.
   - **Strategies:**
     - **Separate VMs/Containers:** Run different services on separate virtual machines or containers (e.g., Docker, Kubernetes Pods) with defined resource limits.
     - **Dedicated Database Instances:** Give each major service its own database instance or schema.
     - **Cloud Services:** Leverage managed cloud services that handle resource allocation and isolation (e.g., AWS RDS for databases, ECS/EKS for containers).
     - **Microservices Architecture:** Encourages isolation by deploying services independently.
   - **Pros:** Strongest isolation, high predictability.
   - **Cons:** Higher infrastructure costs, increased operational overhead.
2. **Resource Throttling / Rate Limiting:**
   - **Concept:** Limit the rate at which a specific component or user can consume a shared resource.
   - **Strategies:**
     - **API Rate Limiting:** Limit the number of requests per second for certain API endpoints.
     - **Concurrency Limits:** Limit the number of concurrent database connections a service can open or the number of concurrent operations in a thread pool.
     - **Queueing:** Put excessive requests into a queue to be processed at a controlled rate, preventing resource saturation.
   - **Pros:** Prevents single components from monopolizing resources.
   - **Cons:** Can lead to rejected requests or increased latency if limits are too low.
3. **Prioritization and Quality of Service (QoS):**
   - **Concept:** Assign higher priority to critical tasks or services, allowing them to access shared resources preferentially.
   - **Strategies:**
     - **Separate Thread Pools:** Use different thread pools for high-priority vs. low-priority tasks.
     - **Weighted Load Balancing:** Route more traffic to healthier or less loaded instances.
     - **Traffic Shaping:** Prioritize certain types of network traffic.
   - **Pros:** Ensures critical functions remain performant.
   - **Cons:** Can starve lower-priority tasks, increasing their latency.
4. **Performance Profiling and Optimization:**
   - **Concept:** Identify the exact source of the "noise" (e.g., a specific slow query, a memory-intensive calculation) and optimize it.
   - **Strategies:**
     - **Code Profiling:** Use tools (e.g., Node.js perf_hooks, v8-profiler) to identify CPU-intensive functions.
     - **Database Query Optimization:** Identify and optimize slow queries (missing indexes, inefficient joins).
     - **Memory Profiling:** Find and fix memory leaks or excessive allocations.
     - **I/O Monitoring:** Pinpoint excessive disk or network I/O operations.
   - **Pros:** Addresses the root cause of the noise.
   - **Cons:** Requires specialized skills and tools.
5. **Monitoring and Alerting:**
   - **Concept:** Continuously monitor shared resource utilization and set up alerts for abnormal behavior.
   - **Strategies:**
     - **Centralized Logging:** Aggregate logs from all services to trace issues.
     - **APM Tools:** Use tools like Prometheus, Grafana, Datadog, New Relic to monitor CPU, memory, I/O, network, and database metrics.
     - **Alerts:** Notify operations teams when resource thresholds are breached.
   - **Pros:** Early detection of noisy neighbor problems.
   - **Cons:** Requires investment in monitoring infrastructure.

By applying these strategies, you can minimize the impact of noisy neighbors and ensure a more predictable and stable performance profile for your applications. It often involves a trade-off between isolation (higher cost, more complexity) and sharing (lower cost, higher risk of contention).

### Retry Storm

#### Intro

**Concept:** The "Retry Storm" (or "Thundering Herd" for retries) anti-pattern occurs when a failing downstream service (e.g., a database, an external API, another microservice) causes a large number of upstream clients to simultaneously and repeatedly retry their requests without any backoff or jitter. This uncontrolled retry behavior can quickly overwhelm the already struggling downstream service, preventing its recovery and potentially causing a cascading failure throughout the system.Imagine a busy restaurant (your service) that depends on a single ingredient supplier (a downstream service). If the supplier temporarily runs out of an ingredient, and every chef immediately calls them back-to-back, repeatedly asking for the same ingredient, the supplier's phone lines get jammed. They can't even process their existing orders or restock, making the problem worse. This is a retry storm.**Why it's a problem:**

1. **Prevents Recovery:** The most critical issue. The flood of retries prevents the overloaded or recovering service from shedding load and stabilizing. It acts as a continuous DDoS attack against your own services.
2. **Cascading Failures:** If the failing service is a dependency for many others, the retry storm can propagate upstream, causing those services to also fail or become overloaded (e.g., exhausting their connection pools, CPU, or memory).
3. **Increased Latency and Throughput Degradation:** Even if services don't fail, they spend valuable resources processing and rejecting retry requests, leading to higher latency and lower overall system throughput.
4. **Resource Exhaustion:** Upstream services executing retries can exhaust their own resources (threads, connections, memory), leading to their failure.

**Common Scenarios Leading to Retry Storms:**

- **Temporary Network Glitches:** A momentary network issue causes a flurry of failed requests, leading to immediate retries.
- **Database Overload:** A database becomes slow or unavailable, and all connected applications immediately retry their queries.
- **Microservice Dependency Failure:** One microservice goes down or is slow, and all client microservices endlessly retry their API calls to it.
- **Improper Configuration:** Default retry mechanisms in libraries or frameworks that lack intelligent backoff.

**Symptoms:**

- **Sawtooth Pattern in Error Rates:** Error rates spike, then drop, then spike again, reflecting retry attempts.
- **High Request Volume to a Struggling Service:** Monitoring shows an unusually high number of requests to a service that's also reporting errors or high latency.
- **Timeouts on Upstream Services:** Services that depend on the failing one start timing out.
- **Resource Saturation on Dependent Services:** CPU, memory, or connection pool utilization spikes on services that are retrying.

#### Mitigation - circuit breaker pattern

The **Circuit Breaker pattern** is a crucial design pattern to prevent the "Retry Storm" anti-pattern and improve the resilience of a distributed system. It provides stability by stopping requests from continuously hitting a failing service, thereby allowing the service to recover and preventing a cascading failure.**Concept:** The Circuit Breaker acts like an electrical circuit breaker. When too many consecutive requests to a downstream service fail (or take too long), the circuit "trips" (opens). Once open, all subsequent requests to that service are immediately rejected by the client without even attempting to call the failing service. After a configurable "sleep window," the circuit goes into a "half-open" state, allowing a single test request to pass through. If that test request succeeds, the circuit closes, and normal operations resume. If it fails, the circuit re-opens.**States of a Circuit Breaker:**

1. **Closed:** (Normal operation) Requests pass through to the downstream service. If a failure threshold is met (e.g., N consecutive failures, or a certain error rate within a time window), the circuit transitions to **Open**.
2. **Open:** (Tripped state) All requests are immediately rejected by the circuit breaker (fail fast). No requests are sent to the downstream service. After a defined **sleep window** (e.g., 5 seconds), it transitions to **Half-Open**.
3. **Half-Open:** (Test state) A single, probationary request is allowed to pass through to the downstream service.
   - If this request succeeds, the circuit transitions back to **Closed**.
   - If this request fails, the circuit immediately transitions back to **Open** for another sleep window.

**Why it's a Solution:**

- **Protects Downstream Service:** Gives the failing service time to recover by diverting traffic away from it.
- **Protects Upstream Service:** Prevents upstream services from wasting resources on doomed requests or from experiencing timeouts due to waiting.
- **Rapid Failure Detection:** Immediately rejects requests once the circuit is open, avoiding long waits.
- **Improved User Experience (with Fallbacks):** When the circuit is open, you can provide immediate fallbacks (e.g., show cached data, a default message, or "service unavailable") instead of making the user wait for a timeout.

#### Mitigation - graceful degradation

**Concept:** "Graceful Degradation" is a design principle where a system maintains core functionality even when some components or external dependencies fail or become degraded. Instead of crashing or becoming completely unavailable, the system intelligently adapts by disabling non-essential features, providing partial results, or displaying informative fallback content.This is fundamentally about anticipating failure and proactively planning for it. It's the opposite of the "all or nothing" approach, where a single component failure brings down the entire application.**Why it's important:**

1. **Improved User Experience:** Users can still perform critical tasks even if some features are temporarily unavailable. This reduces frustration and retains users.
2. **Higher Availability:** The system as a whole remains operational, even if in a degraded state.
3. **Reduced Cascading Failures:** By preventing complete outages, graceful degradation indirectly contributes to overall system stability and prevents domino effects.
4. **Operational Insights:** It can highlight which components are truly critical versus those that can be temporarily sacrificed.

**Common Scenarios for Graceful Degradation:**

- **External Service Outage:** A third-party payment gateway is down. Instead of preventing users from buying, perhaps allow them to choose an alternative payment method, or queue the order for processing later with a "payment pending" status.
- **Recommendation Engine Failure:** A personalized recommendation service goes offline. Instead of an empty section, display popular items, generic suggestions, or simply hide the recommendation section.
- **Search Index Unavailable:** The full-text search engine is down. Fall back to basic database search by product name, or display a message that search is temporarily degraded.
- **Database Read Replica Lag:** If the read replica is lagging, serve slightly stale data from the replica (if acceptable) or route to the primary for critical reads, rather than failing.
- **Image Service Failure:** If an image resizing/hosting service is down, display broken image icons, or low-resolution placeholders, rather than breaking the entire page.

**Implementation Strategies for Graceful Degradation:**

1. **Circuit Breakers (as discussed above):** The primary mechanism. When a circuit opens, its fallback function is the point where graceful degradation logic is implemented.
2. **Timeouts:** Implement strict timeouts for all external calls. If a service doesn't respond within a reasonable time, assume it's degraded and trigger fallback logic.
3. **Fallback Data/Default Values:** Provide static or default data when dynamic data cannot be retrieved.
4. **Feature Toggles/Feature Flags:** Dynamically enable or disable non-critical features. If a component is degraded, its feature flag can be toggled off.
5. **Caches:** Use stale data from a cache as a fallback when the origin is unavailable (e.g., if Redis is down, can you serve from a disk-based cache as a last resort?).
6. **Asynchronous Processing/Queues:** For non-critical operations (e.g., sending emails, analytics updates), queue them up. If the processing service fails, the messages remain in the queue to be processed once the service recovers, preventing immediate user impact.
7. **Resource Prioritization:** Ensure your application prioritizes critical functionalities (e.g., login, checkout) over less critical ones (e.g., user recommendations, analytics collection) by allocating more resources or using separate queues/thread pools.
8. **Informative UI Feedback:** Clearly communicate to the user when a feature is unavailable or degraded (e.g., a banner message, a disabled button, a placeholder). Avoid confusing error messages.

### Database Antipatterns

#### Basic antipatterns

**1) Unoptimized Database Query (Fetching Too Much Data)**

Doing something like fetching all records from a table or collection without a filter is an antipattern because it loads unnecessary data into memory and puts extra strain on both the database and the application.

```ts
// BAD: Fetches all users, then filters in memory
const users = await db.query("SELECT * FROM users");
const active = users.filter((u) => u.active);
```

- **mistake 1**: will load potentially millions of records in memory if the `users` table is big.

**2) no caching**

Frequent, redundant queries slow down your app and your database. For data that doesn't change often and isn't dependent on any dynamic user data or request bodies, you can easily cache that.

```ts
// BAD: Always hits the database
app.get("/products/:id", async (req, res) => {
  const product = await db.getProductById(req.params.id);
  res.json(product);
});
```

> [!NOTE]
> A prime candidate for a route like this is an in-memory LRU cache or redis-implementation of it.

**blocking operations (Synchronous I/O)**

Synchronous code blocks the event loop, making your backend unresponsive to other requests.

```ts
// BAD: Synchronous file read in a Node.js request handler
app.get("/config", (req, res) => {
  const config = fs.readFileSync("config.json", "utf8"); // blocks event loop!
  res.json(JSON.parse(config));
});
```

- **mistake 1**: reading a file synchronously. I/O work should never be done synchronously
- **mistake 2:** using `JSON.parse()` on potentially large amounts of data. Since `JSON.parse()` is synchronous, it will block the event loop even when used in an async method.

To solve these issues, there are these mitigations:

1. Run code asynchronously
2. delegate any synchronous CPU-bound work (like `JSON.parse()`) to a web worker

#### What leads to a slow database?

**Common Causes leading to a slow Database:**

- **Inefficient Queries:** As we'll discuss, SELECT \*, N+1 queries, missing indexes, complex joins without proper optimization.
- **Lack of Caching:** No application-level or database-level caching, forcing every read to hit the disk.
- **High Write Volume:** Too many concurrent write operations on critical tables without proper transaction management.
- **Schema Design Issues:** Non-normalized data, poor data types, lack of primary/foreign keys.
- **Improper Database Configuration:** Suboptimal memory allocation, cache sizes, or concurrency settings.
- **Lack of Archiving/Purging:** Databases grow excessively large with old, unused data, making queries slower.
- **Reporting Queries:** Running complex, analytical queries directly on the production OLTP (Online Transaction Processing) database.

#### Chatty I/O: Reducing Database Round Trips

**Concept:** "Chatty I/O" (or "Chatty Database Interactions") refers to an anti-pattern where an application makes an excessive number of small, inefficient requests to the database to retrieve or update data that could be fetched or manipulated in fewer, larger, and more efficient operations. This is also often referred to as the **"N+1 Query Problem"**.Each database request (round trip) incurs overhead: network latency, connection pool acquisition, query parsing, execution plan generation, and result set transfer. Accumulating many small round trips adds up quickly, severely impacting performance.**Why it's a problem:**

- **Increased Network Latency:** Even if individual queries are fast, the cumulative network delay of N round trips is significant.
- **Higher Database Load:** Each query consumes database resources (CPU for parsing, memory for execution context). N+1 queries multiply this load.
- **Increased Connection Pool Utilization:** Each request might hold a connection for longer, contributing to connection pool exhaustion.
- **Reduced Throughput:** The application spends more time waiting for the database rather than doing useful work.

**Common Manifestations (The N+1 Query Problem):**This is the quintessential example of Chatty I/O. It typically occurs when you fetch a list of "parent" entities, and then, for each parent, you execute a _separate query_ to fetch its related "child" entities.

- **Example 1: Fetching Users and Their Posts:**
  1. Query: SELECT \* FROM users; (fetches 100 users)
  2. Loop through each user:
     - Query: SELECT \* FROM posts WHERE userId = `<user_id>`; (100 separate queries)
  - **Total:** 1 (for users) + N (for each user's posts) = N+1 queries.
- **Example 2: Populating an Object Graph:**An ORM might be configured to lazily load relationships. If you then iterate through a collection and access a lazily loaded related object for each item, it triggers an N+1.

**Symptoms of Chatty I/O / N+1:**

- **Many Small Queries in Logs:** Your database logs show a large number of very similar, but slightly different, queries being executed in quick succession.
- **Increased Network Traffic between App and DB:**
- **Slow Response Times, especially for pages displaying lists with related data.**
- **Database server resource spikes for specific endpoints.**

**mitigations of chatty IO**

- **Batching:** Combine multiple small operations into a single, larger operation.
  - Database: Use IN clauses, bulk inserts/updates.
  - APIs: Design APIs that allow fetching multiple resources in one request.
  - File System: Buffer writes, read whole files/chunks.
- **Buffering:** Accumulate data in memory before performing an I/O operation (e.g., log buffering).
- **Caching:** Store frequently accessed I/O results (e.g., API responses, file contents) in memory.
- **Connection Pooling:** Reuse established connections (database connection pools, HTTP connection pooling).
- **Event-Driven / Long Polling:** For message queues or real-time updates, use event-driven consumers or long-polling instead of frequent short poll

##### Mitigation: Procedures

Stored procedures are precompiled SQL code stored within the database. They can perform multiple operations in a single call, reducing network traffic and improving performance.

```sql
-- Example of a stored procedure to process an order
CREATE PROCEDURE ProcessOrder (
    @customer_id INT,
    @order_id INT
)
AS
BEGIN
    -- Retrieve customer information
    SELECT * FROM customers WHERE id = @customer_id;

    -- Retrieve order details
    SELECT * FROM orders WHERE id = @order_id;

    -- Update inventory
    UPDATE products SET quantity = quantity - 1 WHERE id IN (SELECT product_id FROM order_items WHERE order_id = @order_id);
END;

-- Execute the stored procedure
EXEC ProcessOrder @customer_id = 123, @order_id = 456;
```

#### Benefits of Stored Procedures

- **Reduced Network Traffic:** Only the procedure call and its parameters are sent over the network, rather than multiple SQL statements.
- **Improved Security:** Stored procedures can encapsulate complex logic and restrict direct access to underlying tables.
- **Code Reusability:** Stored procedures can be called from multiple applications, promoting code reuse and consistency.
- **Performance Optimization:** The database server can optimize stored procedures for better performance.`

##### N+1 query

The N+1 query problem is a common performance bottleneck in web applications that interact with databases. It arises when an application executes one query to retrieve a list of records, and then executes additional queries (one for each record) to fetch related data.

This can lead to a significant increase in the number of database queries, especially when dealing with large datasets, severely impacting application performance and scalability. Understanding how to identify and resolve this antipattern is crucial for building efficient and responsive web applications.

Here are the issues the N+1 query problem leads to:

- **Increased Database Load:** The database server has to handle a large number of small queries, which can strain its resources.
- **Network Latency:** Each query involves network communication between the application server and the database server. The overhead of multiple round trips can significantly increase response times.
- **Slow Response Times:** The cumulative effect of increased database load and network latency results in slower response times for the application, leading to a poor user experience.
- **Scalability Issues:** As the number of users and data grows, the N+1 problem becomes more pronounced, making it difficult to scale the application.

Here is an example of the N+1 query in action

```ts
// --- Anti-Pattern: N+1 Query ---
app.get("/posts-chatty", async (req, res) => {
  console.log("\n--- /posts-chatty: Demonstrating N+1 Query Anti-Pattern ---");
  try {
    // Step 1: Fetch all posts
    const posts = await postRepository.find(); // A single query: SELECT * FROM posts

    const results = [];
    // Step 2: For EACH post, fetch its author. This is the N+1 problem.
    for (const post of posts) {
      // This will trigger a separate SELECT for each author if not cached
      const author = await userRepository.findOne({
        where: { id: post.author.id },
      }); // N queries: SELECT * FROM users WHERE id = X
      results.push({
        id: post.id,
        title: post.title,
        content: post.content,
        authorName: author ? author.name : "Unknown",
      });
    }
    res.json(results);
  } catch (error: any) {
    console.error("Error in /posts-chatty:", error.message);
    res.status(500).json({ error: "Failed to fetch posts (chatty)" });
  }
});
```

And here is a mitigation: use batching to do a conditional query fetching multiple children records at a time based on an array of IDs.

```ts
// --- Solution 2: Manual Batching (Less common with ORMs, but good for raw SQL or specific cases) ---
app.get("/posts-batch", async (req, res) => {
  console.log("\n--- /posts-batch: Fixing N+1 with Manual Batching ---");
  try {
    const posts = await postRepository.find();
    if (posts.length === 0) {
      return res.json([]);
    }

    // Extract all unique author IDs
    const authorIds = [...new Set(posts.map((post) => post.author.id))];

    // Fetch all authors in a single query using 'IN' clause
    const authors = await userRepository.findBy({
      id: In(authorIds), // Using TypeORM's In operator for WHERE IN (id1, id2, ...)
    });
    const authorMap = new Map(authors.map((author) => [author.id, author]));

    const results = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      authorName: authorMap.get(post.author.id)?.name || "Unknown",
    }));
    res.json(results);
  } catch (error: any) {
    console.error("Error in /posts-batch:", error.message);
    res.status(500).json({ error: "Failed to fetch posts (batch)" });
  }
});
```

#### `SELECT *` antipattern (fetching all columns)

The `SELECT *` antipattern is a common mistake in database querying that can significantly impact backend performance. It involves retrieving all columns from a table when only a subset of those columns is actually needed. This seemingly small inefficiency can lead to increased I/O, memory consumption, and network traffic, especially when dealing with large tables or complex queries. Understanding and avoiding this antipattern is crucial for building efficient and scalable web applications.

- **Problem:** Fetching all columns from a table (SELECT \*) when you only need a few. This transfers more data over the network, consumes more memory, and potentially makes the database do more work.
- **Solution:** Always specify only the columns you need: SELECT id, name, email FROM users;.
- **TypeORM:** Use the select option in find or findOne:
  ```ts
  // GOOD: only fetch what we need
  const users = await userRepository.find({
    select: ["id", "name", "email"],
  });
  ```

Here are the negatives of the `SELECT *` antipattern:

- **Increased I/O:** When you select all columns, the database server has to read all the data from the disk, even if you only need a few columns. This increases the amount of data transferred between the disk and the server's memory, leading to higher I/O overhead.
- **Increased Memory Consumption:** The database server needs to store the retrieved data in memory before sending it to the client. Selecting unnecessary columns increases the amount of memory required, potentially leading to memory pressure and slower performance.
- **Increased Network Traffic:** The more data you retrieve, the more data needs to be transferred over the network from the database server to the application server. This increases network latency and can slow down the overall response time.
- **Application Code Inefficiency:** Your application receives more data than it needs, requiring it to process and discard the extra information. This adds unnecessary overhead to your application code.
- **Index Inefficiency:** Databases use indexes to speed up queries. When you use `SELECT *`, the database might not be able to use indexes effectively, leading to full table scans. This is because the index might only cover a subset of the columns, and the database needs to read the entire row to retrieve the remaining columns.
- **Security Concerns:** Selecting all columns might expose sensitive data that the application doesn't need, increasing the risk of data breaches.

#### Large offset

**Large Offset/Limit Queries (Pagination):**

- **Problem:** For large tables, queries like SELECT \* FROM products ORDER BY id LIMIT 10 OFFSET 100000; become incredibly slow because the database still has to scan and sort 100,000 records before returning the next 10.
- **Solution:** Use "keyset pagination" (also known as "cursor-based pagination"). Instead of an offset, use the WHERE clause based on the last fetched item's ID or timestamp: SELECT \* FROM products WHERE id > `<last_id>` ORDER BY id LIMIT 10;. This uses indexes much more efficiently.

### Server Antipatterns

#### Chatty API

The "Chatty API" antipattern arises when the communication between a client and a server involves an excessive number of requests and responses to accomplish a single task. Instead of retrieving all necessary data in one go, the client makes multiple small requests, each requiring a separate network round trip. This back-and-forth communication can significantly increase latency, especially in scenarios with high network latency or when dealing with a large number of clients.

This problem arises from having way too granular of an API where clients are not getting the data they need in one request.

Here are two main ways to mitigate the chatty API problem:

1. **Batch API requests**: Batch requests allow the client to send multiple requests to the server in a single HTTP request. The server then processes these requests and returns a single response containing the results of all the individual requests.
2. **Aggregate data**: Data aggregation involves combining related data into a single API response. Instead of forcing the client to make multiple requests to fetch different pieces of information, the server aggregates the data and returns it in a single response.

#### Large Payload antipattern

The "Large Payload" antipattern manifests when an API sends more data than is strictly necessary for the client to perform its intended task. This can happen for several reasons:

- **Over-fetching:** The API returns all available data for a resource, even if the client only needs a subset of the fields.
- **Verbose data formats:** Using inefficient data formats like uncompressed XML or JSON can significantly increase payload size.
- **Redundant data:** The API includes the same data multiple times in the response.
- **Unnecessary data:** The API includes data that the client doesn't need or use.

**mitigations**

- **file compression**: Compress text and files the server sends to the client using GZIP or brotli.

