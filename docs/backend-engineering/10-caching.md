## Caching basics

### browser caching

When you visit a website, your web browser downloads various resources: HTML files, CSS stylesheets, JavaScript files, images, fonts, and more.

**Browser caching** is a mechanism where the browser stores copies of these resources on the user's local machine (their hard drive or memory). The next time the user visits the same website (or a different page on the same site that uses the same resources), the browser can retrieve some or all of these resources from its local cache instead of requesting them again from the web server.

This process significantly speeds up page load times, reduces server load, and conserves bandwidth for both the user and the server.

Here is how the process works:

1. **first request**: browser requests resources from servers, and depending on cache control headers the server sends down, controls the caching behavior of those resources. Key headers the server sends down include `Cache-Control`, `Expires`, `ETag`, and `Last-Modified`
2. **Cache Hit:** If the resource is found in the cache and the caching instructions indicate that the cached copy is still valid (e.g., the `Cache-Control` max-age has not expired), the browser uses the cached copy directly. This is known as a "cache hit." The resource is loaded from the local cache, avoiding a network request to the server.
3. **Cache Miss:** If the resource is not found in the cache, or if the caching instructions indicate that the cached copy is no longer valid (e.g., the `Cache-Control` max-age has expired), the browser sends a new request to the server. This is known as a "cache miss." The server responds with the resource (potentially with new caching headers), and the browser updates its cache.
4. **Conditional Requests:** Even if a resource's cache has expired, the browser can make a *conditional request* to the server using the `ETag` or `Last-Modified` headers. The browser sends the `ETag` or `Last-Modified` value it has stored in the `If-None-Match` or `If-Modified-Since` request headers, respectively. If the resource hasn't changed since the last time the browser requested it, the server can respond with an HTTP 304 Not Modified status code, indicating that the browser can use its cached copy. This saves bandwidth because the server doesn't need to send the entire resource again.

There are three types of caches the browser can choose from:

- **Memory Cache:** This is the fastest cache and stores resources in the browser's memory. Resources in the memory cache are typically short-lived and are removed when the browser tab or window is closed.
- **Disk Cache:** This cache stores resources on the user's hard drive. Resources in the disk cache persist across browser sessions and can be used for longer periods.
- **Service Worker Cache:** Service workers are JavaScript files that run in the background and can intercept network requests. They can use the Cache API to store and retrieve resources, providing fine-grained control over caching. This is an advanced topic and outside the scope of this module, but it's important to be aware of its existence.

#### headers

The browser caching behavior is controlled by the `cache-control` header the server sends down. The `cache-control` header accepts these directives, separated by commas.

- **`public`** : Indicates that the response may be cached by any cache, including shared caches (like CDNs).
- **`private`** : Indicates that the response is intended for a single user and should not be stored in a shared cache. It can be cached by the user's browser. Useful for user-specific content.
- **`no-cache`** : Crucially, this does NOT mean "do not cache". It means the cached response must be validated with the origin server before each reuse. The browser will send a conditional request ( If-Modified-Since or If-None-Match ) to the server before using the cached copy.
  - This is useful when you want to ensure that the user always gets the **latest version of a resource**, but you still want to take advantage of caching for performance.
- **`no-store`** : This directive truly means "do not cache". The browser should not store any part of the request or response in any cache. Useful for sensitive information.
- **`max-age=<seconds>`** : Specifies the maximum amount of time (in seconds) that a resource is considered fresh. After this time, the resource becomes stale and requires validation or re-download.
  - **Example:** `Cache-Control: max-age=3600` (resource is fresh for 1 hour)
- **`s-maxage=<seconds>`** : Similar to `max-age`, but specifically for shared caches (like CDNs). Takes precedence over `max-age` for shared caches.
- **`must-revalidate`** : When combined with `max-age` (or `expires`), it means that once the `max-age` expires, the browser must revalidate the resource with the origin server. It cannot use a stale copy, even in the event of a network error.
- **`proxy-revalidate`** : Similar to `must-revalidate`, but applies only to shared caches (proxies).

All in all, we can follow these general rules:

1. **Prioritize `no-store` for sensitive data:** If you need to ensure that sensitive data is never cached, use `no-store` and avoid any other caching directives.
2. **Use `max-age` with `must-revalidate` for dynamic content:** If you want to cache dynamic content for a short period, use `max-age` along with `must-revalidate` to ensure that the browser always revalidates the content with the server.
3. **Use `public` for resources that can be cached by anyone:** Use `public` for resources that don't contain any user-specific data and can be safely cached by shared caches.
4. **Use `private` for resources that are specific to a user:** Use `private` for resources that contain user-specific data and should not be cached by shared caches.

| Type of data                          | Directives to use     | Example                                                                  |
| ------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| user-specific, frequently changing    | `private`, `no-cache` | - `Cache-Control: no-cache, must-revalidate` `ETag: "unique-etag-value"` |
| static files, public, rarely changing | `public`, `max-age=`  | `Cache-Control: public, max-age=31536000`                                |
| sensitive data like API keys          | `no-store`            | `Cache-Control: no-store`                                                |

In express, using the `express.static()` middleware, you can control the caching behavior of statically served assets like so:

```ts
const express = require("express");
const app = express();

// Serve static files from the 'public' directory
app.use(
  express.static("public", {
    maxAge: "31536000", // Cache static assets for one year
    immutable: true, // Indicate that versioned assets are immutable
  })
);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
```

Here is an express app example using this header:

```ts
import express from "express";
import path from "path";

const app = express();
const port = 3000;

// Serve static files with caching headers
// This is typical for assets like CSS, JS, images, fonts
app.use(
  "/static",
  express.static(path.join(__dirname, "public"), {
    // Set Cache-Control for static assets
    // Here, we're saying assets can be cached by public caches (including browser)
    // for 1 year (31,536,000 seconds). After that, they should be revalidated.
    // This is common for assets with versioned filenames (e.g., app.v1.0.0.js)
    // or that rarely change.
    setHeaders: (res, path, stat) => {
      if (
        path.endsWith(".css") ||
        path.endsWith(".js") ||
        path.endsWith(".png")
      ) {
        res.set("Cache-Control", "public, max-age=31536000, immutable");
        // The 'immutable' directive, if supported by the browser, means the
        // cached response will not change, even if the user reloads the page.
        // Useful for versioned assets.
      } else {
        // For other static files (e.g., HTML if served statically)
        // We might want a shorter cache, or no-cache with revalidation
        res.set("Cache-Control", "no-cache"); // Always revalidate, but can use cache
      }
    },
  })
);

// Example for an API endpoint that serves dynamic data
// This data changes frequently, so we don't want to cache it aggressively
app.get("/api/data", (req, res) => {
  // Simulate fetching dynamic data
  const dynamicData = {
    message: "This data changes frequently!",
    timestamp: new Date().toISOString(),
    randomNumber: Math.random(),
  };

  // For dynamic content that changes frequently,
  // we might use no-cache or no-store, or a very short max-age.
  // 'no-cache' forces revalidation with the server.
  res.set("Cache-Control", "no-cache, private"); // Private to this user, always revalidate
  // Or if it's very sensitive and should never be cached:
  // res.set('Cache-Control', 'no-store, private');
  res.json(dynamicData);
});

// Example for an HTML page (often rendered dynamically, but for static page)
app.get("/", (req, res) => {
  // HTML pages typically benefit from no-cache (always revalidate)
  // or a very short max-age, as they are the entry point and
  // their content (links to assets) might change.
  res.set("Cache-Control", "no-cache, public");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
```

**expires header**

The `Expires` header is a legacy header that specifies an absolute date in the future by which the resource cache should be invalidated.

- Example: `Expires: Tue, 01 Jan 2025 10:00:00 GMT`

**etag header**

An ETag (Entity Tag) is a unique identifier for a specific version of a resource. It's typically a hash of the file contents or a timestamp.

> [!NOTE]
> It's used as a strategy for aggressive caching - even if the cache is invalidated, if the etag doesn't change, there is no need to redownload the resource.

When a browser requests a resource and gets an ETag, it stores it along with the resource. On subsequent requests for the _same_ resource, the browser sends the ETag back to the server in an `If-None-Match` header.

The server specifies an etag through the `Etag` header, and the process is as follows:

- Example Request Header: `If-None-Match: "abcdef12345"`
- The server then compares the received ETag with the ETag of its current version of the resource.
  - If they match, the server responds with 304 Not Modified.
  - If they don't match, the server sends the new 200 OK response with the updated resource and a new ETag.

**The `Last-Modified` Header**

The `Last-Modified` header indicates the date and time when the resource was last modified on the server. The browser sends this information back in subsequent requests using the `If-Modified-Since` header. Similar to `ETag`, if the resource hasn't changed since the specified date, the server can respond with a `304 Not Modified` status code.

*Example (Server Response):* `Last-Modified: Tue, 15 Nov 2022 12:45:26 GMT`

*Example (Browser Request):* `If-Modified-Since: Tue, 15 Nov 2022 12:45:26 GMT`

#### Antipatterns

1. **Lack of ETag or Last-Modified for Revalidation:**
   - **Mistake:** Relying solely on max-age and then forcing a full re-download once the max-age expires, even if the content hasn't changed.
   - **How to Avoid:** Ensure your server sends ETag and/or Last-Modified headers for resources where revalidation is appropriate (e.g., static assets after their max-age expires, or resources with no-cache). This allows the browser to perform a 304 Not Modified check, saving bandwidth and improving perceived performance. Many static file servers (like Express's express.static) do this automatically.
2. **Inconsistent Caching Headers Across Different Environments/Servers:**
   - **Mistake:** Different caching policies in development, staging, and production environments, leading to unexpected behavior in production.
   - **How to Avoid:** Standardize your caching policies and configurations. Use configuration management tools or environment variables to ensure consistency. Test caching behavior thoroughly in staging.
3. **Not Understanding the Difference Between no-cache and no-store:**
   - **Mistake:** Using no-cache when you actually want to prevent any caching at all, or vice-versa.
   - **How to Avoid:**
     - `no-cache`: The browser _can_ cache, but _must revalidate_ with the server before using the cached copy.
     - `no-store`: The browser _must not_ cache anything.

### Server-side caching

There are 5 types of server-side caching:

1. **In-Memory Caching:**
   - **Concept:** Data is stored directly in the RAM of the application server or in a dedicated in-memory data store (like Redis or Memcached). This is the fastest form of caching because RAM access is incredibly quick.
   - **Use Cases:** Frequently accessed data (user profiles, product catalogs, configuration settings), session data, API responses.
   - **Pros:** Extremely fast read/write operations.
   - **Cons:** Data is volatile (lost on server restart/crash). Limited by available RAM. Can be challenging to scale across multiple application instances without a distributed cache.
2. **Database Caching (covered in Module 5):**
   - **Concept:** Caching mechanisms built into or layered on top of database systems. This can involve caching query results, frequently accessed tables/rows, or compiled query plans.
   - **Use Cases:** Reducing database load for read-heavy applications.
   - **Pros:** Reduces direct database hits.
   - **Cons:** Can be complex to manage cache invalidation and consistency.
3. **File-Based Caching:**
   - **Concept:** Storing cached data as files on the server's file system (disk).
   - **Use Cases:** Caching rendered HTML pages, generated images, large reports, or any data that is too large for memory but doesn't require extreme speed.
   - **Pros:** Data persists across server restarts. Can store larger amounts of data than in-memory.
   - **Cons:** Slower than in-memory caching due to disk I/O. Can lead to disk space issues if not managed well. File system operations can be contention points.
4. **Object Caching:**
   - **Concept:** Caching specific data structures or objects (e.g., a User object, a Product object) rather than raw query results or HTML fragments. This often involves serialization/deserialization.
   - **Use Cases:** ORM results, complex business objects.
   - **Pros:** Directly works with application data structures.
   - **Cons:** Requires serialization/deserialization overhead.
5. **Page/Fragment Caching:**
   - **Concept:** Caching entire rendered HTML pages or specific parts (fragments) of a page.
   - **Use Cases:** Static or semi-static pages, header/footer components.
   - **Pros:** Reduces rendering time for common parts of the UI.
   - **Cons:** Complex invalidation for dynamic content.

There are also 5 important caching terms you need to know:

- **Cache Hit Ratio:** The percentage of requests served from the cache. A higher ratio indicates more efficient caching.
- **Cache Invalidation:** How do you ensure cached data is up-to-date? This is often the hardest part of caching. We'll cover this extensively in Module 7.
- **Cache Coherency/Consistency:** In a distributed system, how do you ensure all application instances see the same cached data?
- **Cache Eviction Policies:** What happens when the cache fills up? (e.g., Least Recently Used (LRU), Least Frequently Used (LFU), Time-To-Live (TTL)).
- **Cost vs. Benefit:** The overhead of implementing and managing caching should be justified by the performance gains.

#### In-memory cache: redis

In-memory caching involves storing data in a computer's main memory (RAM) to reduce the latency associated with retrieving data from slower storage mediums like hard drives or databases.

> [!NOTE]
> Because RAM offers significantly faster read and write speeds compared to disk, in-memory caching can dramatically improve application responsiveness and reduce database load.

Here are the behaviors of an in-memory cache:

- **Volatility:** Data stored in RAM is volatile, meaning it is lost when the server restarts or the cache service is stopped. This is a crucial consideration when designing your caching strategy. You must ensure that the cached data can be retrieved or regenerated if the cache is lost.
- **Cache Invalidation:** A critical aspect of caching is invalidation – the process of removing or updating stale data in the cache. If the underlying data changes, the cache must be updated to reflect those changes. We will explore different invalidation strategies in a later module, but it's important to keep this in mind as you design your caching implementation.
- **Cache Eviction:** When the cache reaches its capacity, it needs to evict (remove) some data to make room for new entries. Common eviction policies include Least Recently Used (LRU), Least Frequently Used (LFU), and First-In-First-Out (FIFO).

Here are the benefits:

- **Reduced Latency:** Retrieving data from RAM is significantly faster than retrieving it from a database or disk.
- **Increased Throughput:** By serving frequently accessed data from the cache, the application can handle more requests concurrently.
- **Reduced Database Load:** Caching reduces the number of queries to the database, freeing up database resources and improving overall system performance.
- **Improved User Experience:** Faster response times lead to a better user experience.

Here are the drawbacks:

- **Volatility:** Data loss on server restart or cache service failure.
- **Memory Constraints:** RAM is a limited resource, so you need to carefully manage the cache size.
- **Cache Invalidation Complexity:** Ensuring data consistency between the cache and the underlying data source can be challenging.
- **Added Complexity:** Introducing a cache adds complexity to the application architecture.

#### Custom in-memory cache

Here is a custom in memory cache using typescript:

```ts
// src/cache/InMemoryCache.ts
interface CacheEntry<T> {
  value: T;
  expiryTime: number; // Unix timestamp in milliseconds
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private defaultTtl: number; // Default TTL in milliseconds

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    // Default to 5 minutes
    this.defaultTtl = defaultTtlMs;
    this.startCleanup();
  }

  /**
   * Sets a value in the cache.
   * @param key The cache key.
   * @param value The value to store.
   * @param ttlMs Optional: Time-To-Live in milliseconds for this entry. Defaults to the cache's defaultTtl.
   */
  public set<T>(key: string, value: T, ttlMs?: number): void {
    const effectiveTtl = ttlMs !== undefined ? ttlMs : this.defaultTtl;
    const expiryTime = Date.now() + effectiveTtl;
    this.cache.set(key, { value, expiryTime });
    console.log(`Cache: Set key "${key}" with TTL ${effectiveTtl / 1000}s`);
  }

  /**
   * Gets a value from the cache. Returns null if not found, deletes key if expired.
   * @param key The cache key.
   * @returns The cached value or null.
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      console.log(`Cache: Miss for key "${key}" (not found)`);
      return null;
    }

    if (Date.now() >= entry.expiryTime) {
      const value = entry.value;
      this.delete(key); // Remove expired entry
      console.log(`Cache: Miss for key "${key}" (expired)`);
      return value;
    }

    console.log(`Cache: Hit for key "${key}"`);
    return entry.value;
  }

  /**
   * Deletes an entry from the cache.
   * @param key The cache key to delete.
   * @returns True if deleted, false if not found.
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`Cache: Deleted key "${key}"`);
    }
    return deleted;
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
    console.log("Cache: Cleared all entries.");
  }

  /**
   * Returns the current size of the cache.
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Starts a periodic cleanup process to remove expired entries.
   */
  private startCleanup(intervalMs: number = 60 * 1000): void {
    // Run every minute
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (now >= entry.expiryTime) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }
      if (cleanedCount > 0) {
        console.log(`Cache: Cleaned up ${cleanedCount} expired entries.`);
      }
    }, intervalMs);
  }

  /**
   * Stops the periodic cleanup process.
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("Cache: Stopped automatic cleanup.");
    }
  }
}

export default InMemoryCache;
```

Here is an example using this in-memory cache:

```ts
// src/app.ts
import express from "express";
import InMemoryCache from "./cache/InMemoryCache";
import axios from "axios"; // For making external API calls
import rateLimit from "express-rate-limit"; // Good practice with APIs

const app = express();
const port = 3000;

// Initialize cache with a default TTL of 1 minute (60,000 ms)
const apiCache = new InMemoryCache(60 * 1000);

// Basic rate limiting to protect the external API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Middleware for caching API responses
app.get("/cached-posts", apiLimiter, async (req, res) => {
  const cacheKey = "all_posts"; // A simple key for all posts

  // 1. Try to get data from cache
  const cachedPosts = apiCache.get<any[]>(cacheKey);
  if (cachedPosts) {
    console.log("Serving /cached-posts from cache");
    return res.status(200).json({ source: "cache", data: cachedPosts });
  }

  // 2. If not in cache, fetch from external API
  console.log("Fetching /cached-posts from external API");
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    const posts = response.data;

    // 3. Store in cache
    apiCache.set(cacheKey, posts); // Use default TTL (1 minute)

    console.log("Serving /cached-posts from external API and caching it");
    res.status(200).json({ source: "external_api", data: posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// A non-cached endpoint for comparison
app.get("/uncached-posts", apiLimiter, async (req, res) => {
  console.log("Fetching /uncached-posts from external API (no cache)");
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    const posts = response.data;
    res.status(200).json({ source: "external_api_uncached", data: posts });
  } catch (error: any) {
    console.error("Error fetching uncached posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Cached posts endpoint: http://localhost:${port}/cached-posts`);
  console.log(
    `Uncached posts endpoint: http://localhost:${port}/uncached-posts`
  );
});

// Important: Handle graceful shutdown to stop cache cleanup interval
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  apiCache.stopCleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  console.log("\nShutting down server...");
  apiCache.stopCleanup();
  process.exit(0);
});
```

When dealing with an in-memory cache writing to the same source, you'll often have to implement locks to ensure that there is only ever one writer at a time.

```python
import threading

class ThreadSafeInMemoryCache:
    def __init__(self, data_source):
        self.cache = {}
        self.data_source = data_source
        self.lock = threading.Lock() # Create a lock

    def get(self, key):
        with self.lock: # Acquire the lock before accessing the cache
            if key in self.cache:
                print(f"Cache hit for key: {key}")
                return self.cache[key]
            else:
                print(f"Cache miss for key: {key}")
                value = self.data_source(key)
                if value:
                    self.set(key, value)
                return value

    def set(self, key, value):
        with self.lock: # Acquire the lock before modifying the cache
            self.cache[key] = value
            print(f"Added key: {key} to cache")

    def delete(self, key):
        with self.lock: # Acquire the lock before modifying the cache
            if key in self.cache:
                del self.cache[key]
                print(f"Deleted key: {key} from cache")
            else:
                print(f"Key: {key} not found in cache")

```

#### File-based caching

File-based caching involves storing data as files on the server's disk. This is generally slower than in-memory caching but offers advantages in certain scenarios:**When to Use File-Based Caching:**

- **Large Data Volumes:** When the data you need to cache is too large to fit comfortably in RAM (e.g., generated PDF reports, resized images, large JSON datasets).
- **Persistence:** When you need cached data to survive server restarts or application crashes. This is particularly useful for pre-computed reports or artifacts that take a long time to generate.
- **Reduced Memory Footprint:** If your application servers have limited RAM or you want to free up RAM for other processes.
- **Web Server Serving:** If the cached files can be directly served by a web server (like Nginx or Apache) without involving your Node.js application, this can offload significant work.

**Considerations for File-Based Caching:**

- **I/O Overhead:** Reading/writing to disk is slower than memory. This can be a bottleneck for very high-throughput systems.
- **Disk Space Management:** You need a strategy to manage cache size. Our simple FileCache only handles TTL-based expiration. For production, you might need a separate cleanup process (e.g., a cron job) that periodically checks cache directory size and deletes oldest/least used files if it exceeds a threshold.
- **Concurrency:** If multiple processes or requests try to write to the same file simultaneously, you need proper file locking or atomic write operations (e.g., write to a temporary file then rename) to prevent corruption. Our simple example doesn't explicitly handle this, but `fs.writeFile` in Node.js is generally atomic for overwrites.
- **Network File Systems (NFS/SMB):** If your application runs on multiple servers accessing a shared network file system for caching, you'll face distributed caching challenges (coherency, invalidation) similar to those with distributed in-memory caches, but with higher latency.
- **JSON serialization** For objects, you'll need to serialize to JSON before writing and parse after reading. This adds a small overhead.

File-based caching is a practical choice for specific scenarios, especially when dealing with large, pre-calculated, or persistent data that doesn't demand extreme read/write speeds.

Here's a custom file caching class:

```ts
// src/cache/FileCache.ts
import fs from "fs/promises"; // Use promises-based fs
import path from "path";

interface FileCacheEntry {
  expiryTime: number; // Unix timestamp in milliseconds
  // We don't store the value here; it's in the file itself
}

class FileCache {
  private cacheDir: string;
  private defaultTtl: number; // Default TTL in milliseconds

  constructor(cacheDir: string, defaultTtlMs: number = 5 * 60 * 1000) {
    // Default 5 mins
    this.cacheDir = cacheDir;
    this.defaultTtl = defaultTtlMs;
    // Ensure the cache directory exists
    fs.mkdir(this.cacheDir, { recursive: true }).catch(console.error);
  }

  private getCacheFilePath(key: string): string {
    // Simple way to get a safe filename from a key. In production,
    // you might hash the key to ensure valid and unique filenames.
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  private getMetaFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.cacheDir, `${safeKey}.meta.json`);
  }

  /**
   * Sets a value in the file cache.
   * @param key The cache key.
   * @param value The value to store. Must be JSON-serializable.
   * @param ttlMs Optional: Time-To-Live in milliseconds.
   */
  public async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const effectiveTtl = ttlMs !== undefined ? ttlMs : this.defaultTtl;
    const expiryTime = Date.now() + effectiveTtl;
    const cacheFilePath = this.getCacheFilePath(key);
    const metaFilePath = this.getMetaFilePath(key);

    try {
      await fs.writeFile(cacheFilePath, JSON.stringify(value));
      await fs.writeFile(metaFilePath, JSON.stringify({ expiryTime }));
      console.log(
        `FileCache: Set key "${key}" with TTL ${effectiveTtl / 1000}s`
      );
    } catch (error) {
      console.error(`FileCache: Error setting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Gets a value from the file cache. Returns null if not found or expired.
   * @param key The cache key.
   * @returns The cached value or null.
   */
  public async get<T>(key: string): Promise<T | null> {
    const cacheFilePath = this.getCacheFilePath(key);
    const metaFilePath = this.getMetaFilePath(key);

    try {
      // Check if meta file exists and is valid first
      const metaContent = await fs.readFile(metaFilePath, "utf8");
      const meta: FileCacheEntry = JSON.parse(metaContent);

      if (Date.now() >= meta.expiryTime) {
        // Expired, delete both files and return null
        await this.delete(key);
        console.log(`FileCache: Miss for key "${key}" (expired)`);
        return null;
      }

      // If meta is valid, read the data file
      const fileContent = await fs.readFile(cacheFilePath, "utf8");
      console.log(`FileCache: Hit for key "${key}"`);
      return JSON.parse(fileContent);
    } catch (error: any) {
      // If any file operation fails (e.g., file not found, JSON parse error)
      // or if it's an initial cache miss.
      if (error.code === "ENOENT") {
        // File not found
        console.log(`FileCache: Miss for key "${key}" (not found)`);
      } else {
        console.error(`FileCache: Error getting key "${key}":`, error);
        // Clean up potentially corrupted entries
        await this.delete(key).catch(() => {});
      }
      return null;
    }
  }

  /**
   * Deletes an entry from the file cache.
   * @param key The cache key to delete.
   */
  public async delete(key: string): Promise<void> {
    const cacheFilePath = this.getCacheFilePath(key);
    const metaFilePath = this.getMetaFilePath(key);
    try {
      await fs.unlink(cacheFilePath);
      await fs.unlink(metaFilePath);
      console.log(`FileCache: Deleted key "${key}"`);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        // Ignore "file not found" errors on delete
        console.error(`FileCache: Error deleting key "${key}":`, error);
      }
    }
  }

  /**
   * Clears the entire file cache.
   */
  public async clear(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
      console.log("FileCache: Cleared all entries.");
    } catch (error) {
      console.error("FileCache: Error clearing cache:", error);
    }
  }
}

export default FileCache;
```

### Basic caching strategies

#### Cache-aside

The cache-aside strategy is a simple, consistent, up-to-date way that always reads from the cache, but updates the cache whenever you write to the database. 

- **pro**: fast reads, fresh data
- **con**: slowish writes, since you write to database and cache.

**reading**

1. Read from cache. 
	- If cache hit, return data
	- If cache miss, continue
2. Read from database and return that data

**writing**

1. Write to database
2. Write to cache

#### Read-through (cache-first)

1. On cache hit, return data
2. On cache miss, read from DB and write to cache
3. Read from cache and return cached data

#### Write behind (stale while revalidate)

1. Write to cache
2. Immediately return cached data
3. Asynchronously write to database

### cdn

A Content Delivery Network (CDN) is a geographically distributed network of proxy servers and their data centers. The goal of a CDN is to serve content to users with high availability and high performance. Instead of a single origin server hosting all the content, a CDN caches content on multiple servers across the globe. When a user requests content, the CDN server closest to the user's location delivers the content.

> [!NOTE]
> Why a CDN? By serving data at "edge locations" - locations much closer to the end user - you can achieve faster server response speeds because the data travels a much shorter physical distance.

Here are the key components of a cdn:

- **Origin Server:** This is the original server where the website's content resides. The CDN pulls content from the origin server to distribute it across its network.
- **Edge Servers (or Points of Presence - PoPs):** These are the servers in the CDN's network that store cached content and deliver it to users. PoPs are strategically located in various geographical locations to minimize latency.
- **Caching:** The process of storing copies of content on edge servers. This allows the CDN to serve content quickly to users without having to retrieve it from the origin server every time.
- **DNS (Domain Name System):** The system that translates domain names (e.g., [example.com](http://example.com/)) into IP addresses. CDNs use DNS to direct user requests to the appropriate edge server.

**cdn vs web host**

It's important to distinguish between a CDN and a web hosting provider. A web host stores all of your website's files and serves them to users. A CDN, on the other hand, *caches* specific content from your web host and distributes it across multiple servers. Think of your web host as the central library where all the books are stored, and the CDN as a network of smaller libraries that keep copies of the most popular books closer to readers.

**how a cdn works**

This is the 8 step process of what happens behind the scenes when you decide to implement CDN caching:

1. **User Request:** A user enters a website's URL (e.g., `www.example.com`) into their browser.
2. **DNS Resolution:** The browser sends a DNS query to resolve the domain name to an IP address. The DNS server, configured to work with the CDN, directs the request to the CDN's edge server closest to the user.
3. **CDN Edge Server Check:** The edge server checks if it has the requested content cached.
4. **Cache Hit:** If the content is cached (a "cache hit"), the edge server delivers the content directly to the user. This is the fastest scenario.
5. **Cache Miss:** If the content is not cached (a "cache miss"), the edge server requests the content from the origin server.
6. **Origin Server Retrieval:** The origin server sends the requested content to the edge server.
7. **Content Delivery and Caching:** The edge server delivers the content to the user and simultaneously caches a copy of the content for future requests.
8. **Subsequent Requests:** Subsequent requests for the same content from users in the same geographical region will be served directly from the edge server's cache.

Here's a more detailed example:

Let's say a user in London visits `www.example.com`, which uses a CDN. The website contains an image, `logo.png`.

1. The user's browser requests `logo.png`.
2. The DNS server, configured for the CDN, directs the request to the CDN's edge server in London.
3. The London edge server checks its cache.
4. If `logo.png` is not in the cache (a cache miss), the edge server requests it from `www.example.com`'s origin server.
5. The origin server sends `logo.png` to the London edge server.
6. The London edge server delivers `logo.png` to the user and caches a copy.
7. A user in Manchester then requests `logo.png`. The DNS directs the request to the closest edge server, which might also be the London server, or another edge server closer to Manchester.
8. This edge server now has `logo.png` in its cache (a cache hit) and delivers it directly to the user in Manchester, without needing to contact the origin server.

**cdn benefits summary**

- **Compression:** CDNs can compress files (e.g., images, JavaScript, CSS) before delivering them to the user, reducing the file size and download time.
- **HTTP/2 and HTTP/3 Support:** Modern CDNs support the latest HTTP protocols, such as HTTP/2 and HTTP/3, which offer significant performance improvements over HTTP/1.1, including multiplexing (allowing multiple requests to be sent over a single connection) and header compression.
- **Connection Pooling:** CDNs maintain persistent connections to origin servers, reducing the overhead of establishing new connections for each request.
- **TLS/SSL Optimization:** CDNs optimize TLS/SSL handshakes, reducing the time it takes to establish a secure connection.
- **reduced latency**: serving on the edge closer to your user overcomes the physical speed problem of electricity, which can reduce dozens of milliseconds off of the inherent latency.
- **reduced server load**: if you use CDNs, you have less users requesting resources from your server all the time, which leads to less server load and pressure.
- **DDoS Protection:** Many CDNs offer robust protection against Distributed Denial of Service (DDoS) attacks, filtering malicious traffic before it reaches your server.
- **High Availability:** If one CDN edge server goes down, traffic is automatically routed to another healthy server, ensuring continuous service.

**cdns practical**

- **Cache Invalidation:** Plan how you will invalidate CDN caches when you deploy new versions of assets. Most CDNs provide API or dashboard options for this (e.g., "Purge by Path" or "Purge All"). Using versioned filenames (like main.js?v=1.0.1 or main.12345.js) often eliminates the need for manual invalidation for individual assets, as a new file will have a new URL.
- **Dynamic Content:** CDNs are primarily for _static_ or _semi-static_ content. While they can cache dynamic API responses, this requires careful configuration of caching headers and invalidation strategies. For highly dynamic content, directly calling your origin might be better or using advanced CDN features like Edge functions.

#### Dynamic content acceleration

While CDNs are traditionally known for caching static content, they can also be used to accelerate the delivery of dynamic content. This is achieved through techniques such as:

- **Dynamic Site Acceleration (DSA):** Optimizes the routing of dynamic requests and responses between the user and the origin server.
- **Edge Computing:** Allows you to run code on the edge servers, enabling you to personalize content and perform other dynamic operations closer to the user.

> [!NOTE]
> Some CDNs (like Cloudflare Workers, AWS Lambda@Edge) allow running custom JavaScript code at the edge, enabling dynamic routing, A/B testing, authentication, or API gateway functionality directly on the CDN. That is **edge computing**

#### Caching with CDNs in detail

The caching behavior CDNs will have when they try to cache resources is determined by the origin server, specifically the `Cache-control` headers the origin server sets on the resources.

CDN providers also have these two caching actions they can do when dealing with invalidating cache content with the purpose of trying to serve fresh content on the edge.

Sometimes, you need to update content on your website before the cache expires. CDNs provide mechanisms for purging or invalidating cached content.

- **Purging:** Removes the content from the CDN's cache. The next time a user requests the content, the CDN will retrieve it from the origin server and cache it again.
- **Invalidation:** Marks the content as stale. The CDN will revalidate the content with the origin server before serving it to users.

> [!NOTE]
> Many CDNs provide an API endpoint you can request to programmatically purge cached content.

Let's say you have a CSS file, `styles.css`, that you want to cache for one week (604800 seconds) on a CDN. You would configure your origin server to send the following HTTP header with the file:

```
Cache-Control: public, max-age=604800, s-maxage=604800
```

This tells the CDN that it can cache the file and serve it for up to one week without revalidating it with the origin server.

#### Complete CDN walkthrough

**1. On the CDN Provider's Dashboard:**

- **Create a CDN Distribution/Service:**
  - You'll typically create a new "distribution" (CloudFront term) or "service" (Fastly term).
- **Specify Your Origin:**
  - You tell the CDN where your original content lives. This will be the public URL or IP of your web server (e.g., yourserver.com or 123.45.67.89).
  - You might specify specific paths to cache (e.g., /static/\*).
- **Configure Caching Behavior:**
  - **Default TTL/Max-Age:** Set how long the CDN should cache content by default if your origin doesn't specify Cache-Control.
  - **Respect Origin Headers:** Crucially, configure the CDN to respect your origin's Cache-Control and Expires headers. This gives you granular control from your server (as we saw in Module 2).
  - **Query String Handling:** Decide if query strings (e.g., ?v=123) should affect caching. Usually, you want them to be part of the cache key if you're using them for versioning.
- **Custom Domain (CNAME):**
  - This is where you tell the CDN that you want to use a custom subdomain like static.yourdomain.com to point to their service. The CDN will provide you with a target hostname (e.g., d1234.cloudfront.net).

**2. Updating Your DNS Records:**

- Go to your domain registrar or DNS management service (e.g., GoDaddy, Namecheap, Route 53).
- Create a new **CNAME record**:
  - **Host/Name:**static
  - **Type:**CNAME
  - **Value/Target:** The hostname provided by your CDN (e.g., d1234.cloudfront.net).
- Save the record. DNS changes can take a few minutes to several hours to propagate globally.

**3. Updating Your Website's Code (TypeScript/Node.js Context):**This is where you tell your frontend to request assets from the CDN's domain.In your Node.js/Express app, instead of linking to /static/style.css, you'd link to https://static.yourdomain.com/style.css.**Example in a Templating Engine (like EJS or Pug) or JSX (React):\*\*If your Node.js application is rendering HTML, you'd change your asset URLs:

```html
<!-- Before CDN -->
<link rel="stylesheet" href="/css/main.css" />
<img src="/images/logo.png" alt="Logo" />

<!-- After CDN (assuming your CDN is configured for static.yourdomain.com) -->
<link rel="stylesheet" href="https://static.yourdomain.com/css/main.css" />
<img src="https://static.yourdomain.com/images/logo.png" alt="Logo" />
```

**Dynamic CDN URL in TypeScript/Node.js:** You can make this dynamic using environment variables or configuration settings in your Node.js application.

```ts
// config.ts
export const config = {
  cdnBaseUrl:
    process.env.NODE_ENV === "production"
      ? "https://static.yourdomain.com"
      : "", // Or a local URL for dev
  // ... other configs
};

// In your Express app (assuming you're rendering templates or serving HTML)
import { config } from "./config";

app.get("/", (req, res) => {
  // If using a templating engine like EJS
  res.render("index", {
    cssUrl: `${config.cdnBaseUrl}/css/main.css`,
    imageUrl: `${config.cdnBaseUrl}/images/logo.png`,
  });
});

// Or for static serving (you'd manually edit your HTML for now)
// app.use('/static', express.static(path.join(__dirname, 'public')));
// In public/index.html, you'd change the links
```

**For JavaScript Frontends (React, Angular, Vue):** Your build process often handles this. For example, in a Webpack configuration, you might set a publicPath or use a CDN plugin to prepend the CDN URL to your asset paths during the build.

```ts
// Example Webpack config snippet (conceptual)
module.exports = {
  output: {
    // This tells webpack to prepend 'https://static.yourdomain.com' to asset URLs
    publicPath: "https://static.yourdomain.com/",
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  // ... other configs
};
```

After deploying your updated code and waiting for DNS propagation, your users will automatically fetch static assets from the CDN.

### Database caching

Databases are often the bottleneck in web applications. Every time your application needs data, it typically issues a query to the database, which involves disk I/O, CPU cycles for query parsing and execution, and network latency. Database caching aims to reduce these expensive operations by storing frequently accessed data closer to the application or even within the database itself.

**benefits of database caching**

- **Reduced Database Load:** By serving data from a cache, fewer queries hit the primary database. This reduces CPU, memory, and I/O usage on the database server, allowing it to handle more concurrent requests or perform other critical tasks.
- **Faster Response Times:** Retrieving data from a fast cache (often in-memory) is significantly quicker than fetching it from disk storage within the database. This translates directly to faster API response times and quicker page loads for users.
- **Improved Scalability:** Caching allows your application to handle a much higher volume of read requests without needing to scale up your database server as aggressively. It acts as a buffer, absorbing load spikes.
- **Reduced Network Latency:** If your database is on a different server (or even a different region/cloud availability zone) than your application, caching data locally or in a nearby caching layer reduces the network round-trip time for each data request.
- **Cost Savings:** Less load on the database can mean you can run it on smaller, less expensive instances or delay costly horizontal scaling initiatives.

**query caching vs object caching**

When talking about database caching, it is extremely important to understand the difference between query caching and object caching.

**query caching** is creating a database cache (redis, in-memory) of a database query to the data it returns, basically caching the data and avoiding hitting the database if the row results are already cached.

- **when to use**: for frequent, relatively inexpensive READ operations that can be cached, like resources for a user.
- **challenges**: cache invalidation for query caching is extremely difficult and must be done with in-app logic.

**object caching** is like query caching, but you instead of storing a query as the key, you store the object's id as the key, which makes object caching ideal for caching single records by their ID. This also makes invalidation trivial, since you can just invalidate the cache whenever an update to the record with that ID happens.

- **when to use**: for frequent READ access of a resource by its primary key, returning a single record
- **challenges**: Difficult cache invalidation when querying for multiple resources (more than one), and when querying by anything other than a unique key or primary key.

> [!TIP] > **Recommendation:** For most applications, **object caching is generally preferred over query caching** due to its simpler invalidation and more intuitive alignment with object-oriented application design. Query caching is best left to be handled by highly optimized, specific layers (like a CDN for API responses) rather than being manually implemented within your application's database access layer.

#### Query caching

- **Concept:** This involves caching the _results_ of specific database queries. When the exact same query is issued again, the cached result set is returned directly without hitting the database.
- **Where it occurs:**
  - **Within the database engine itself:** Some database systems (like older versions of MySQL) have a built-in query cache. However, many modern databases have removed or deprecated these (e.g., MySQL 8.0 removed its query cache) because they are notoriously difficult to invalidate effectively (a single row change can invalidate many cached queries).
  - **At the ORM/Application level:** You implement logic in your application to cache the results of specific queries (e.g., store the array of Post objects returned by SELECT \* FROM posts WHERE status = 'published').
  - **Using dedicated caching layers:** Tools like Redis or Memcached can store query results, typically as serialized JSON or similar.
- **Pros:** Can provide a significant speedup if the exact same queries are run repeatedly and the underlying data changes infrequently.
- **Cons:**
  - **Strict Matching:** Most query caches require an _exact_ match of the query string, including whitespace and parameter order.
  - **Invalidation Complexity:** The biggest challenge. If _any_ data involved in the query changes, the cached result becomes stale. Invalidating all affected queries can be very complex and resource-intensive, often leading to more performance problems than it solves. This is why database-level query caches are often problematic.
  - **Large Result Sets:** Caching very large query results can consume significant memory.

**benefits**

- **Improved Performance:** Query caching can significantly improve the performance of applications by reducing the number of database queries that need to be executed.
- **Reduced Database Load:** By serving queries from the cache, query caching reduces the load on the database server, freeing up resources for other operations.
- **Increased Scalability:** Query caching can help applications scale more easily by reducing the demand on the database.

**drawbacks**

- **Cache Invalidation Challenges:** Invalidating the cache when data changes can be complex and error-prone. If the cache is not invalidated correctly, the application may return stale data.
- **Memory Overhead:** Query caching consumes memory to store the cached queries and their results. This can be a concern for applications with a large number of unique queries or large result sets.
- **Limited Applicability:** Query caching is most effective for frequently executed, read-heavy queries. It is less effective for queries that are executed infrequently or that involve complex calculations or data transformations.
- **Query Variation Sensitivity:** Even slight variations in a query (e.g., extra whitespace, different capitalization) will result in a cache miss.

#### Object caching

- **Concept:** Instead of caching raw query results, you cache specific _objects_ or _entities_ that represent rows in your database. For example, caching a User object with ID 123 or a Product object with SKU XYZ.
- **Where it occurs:**
  - **ORM Level (1st/2nd Level Cache):** Many Object-Relational Mappers (ORMs) like TypeORM or Sequelize offer a first-level cache (within the current transaction/session) and sometimes a second-level cache (shared across the application).
  - **Application Level with External Cache:** You fetch an object from the database, store it in an external cache (Redis/Memcached) under a key related to its ID (e.g., user:123, product:XYZ), and then retrieve it directly by ID from the cache on subsequent requests.
- **Pros:**
  - **Easier Invalidation:** Invalidation is simpler because you invalidate by object ID. If User 123 changes, you just invalidate user:123 in the cache.
  - **Flexible Access:** You can fetch an object by its ID from the cache, even if it was originally retrieved as part of a different query.
  - **Reduced Serialization:** Often, ORMs work directly with objects, minimizing serialization overhead if cached within the ORM.
- **Cons:**
  - **"N+1 Query" problem mitigation:** Object caching is excellent for preventing N+1 queries for related data (e.g., fetching a user and then iterating to fetch each of their orders individually).
  - **Still need queries for lists/searches:** You still need to query the database (or use query caching) for list pages or search results that return multiple objects based on criteria other than their primary ID.

**Benefits of Object Caching**

- **Improved Performance:** Object caching can significantly improve the performance of applications by reducing the number of database queries that need to be executed.
- **Reduced Database Load:** By serving objects from the cache, object caching reduces the load on the database server, freeing up resources for other operations.
- **Object-Oriented Access:** Object caching provides an object-oriented interface to the data, making it easier for developers to work with the data in their applications.
- **Reduced Data Transformation:** Since the data is already in object form, there is no need to transform the data from a relational format to an object format.

**Drawbacks of Object Caching**

- **Complexity:** Object caching can add complexity to the application, especially when dealing with complex object relationships.
- **Cache Invalidation Challenges:** Invalidating the cache when data changes can be complex and error-prone. If the cache is not invalidated correctly, the application may return stale data. This is similar to query caching, but can be more complex due to object relationships.
- **Memory Overhead:** Object caching consumes memory to store the cached objects. This can be a concern for applications with a large number of objects or large object graphs.
- **ORM Dependency:** Object caching is typically implemented using an ORM, which can introduce a dependency on a specific ORM framework

#### Code examples

This here is a code example of how to use object caching and querying caching in-memory generically, useful for small applications.

```ts
/**
 * A generic class that allows for object caching single database records.
 */

class Cacher<T> {
  protected cache: Map<string, T> = new Map();

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values());
  }
}

export class ObjectCacher<T> extends Cacher<T> {
  async getCacheFirst(
    key: string,
    revalidate: () => Promise<T | null>
  ): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }
    const value = await revalidate();
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }

  async getWithRevalidate(
    key: string,
    revalidate: () => Promise<T | null>
  ): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      const value = await revalidate();
      if (value) {
        this.set(key, value);
        return value;
      } else {
        return cached;
      }
    }
    const value = await revalidate();
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }
}

export class QueryCacher<T> extends Cacher<T> {
  constructor(private exec: (query: string) => Promise<T | null>) {
    super();
  }

  async getCacheFirst(key: string): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }
    const value = await this.exec(key);
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }

  async getWithRevalidate(key: string): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      const value = await this.exec(key);
      if (value) {
        this.set(key, value);
        return value;
      } else {
        return cached;
      }
    }
    const value = await this.exec(key);
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }
}
```

#### Cache Invalidation Strategies for Databases

This is arguably the most challenging aspect of database caching: ensuring cached data is always fresh and consistent with the underlying database. A stale cache can lead to users seeing incorrect information, which is worse than no cache at all.Here are common strategies, many of which TypeORM attempts to handle for you, but it's important to understand them:

1. **Time-To-Live (TTL):**
   - **Concept:** Each cache entry is given a maximum lifespan. After this time expires, the entry is automatically removed or marked as stale. The next request will then fetch fresh data from the database.
   - **Pros:** Simplest to implement. Guarantees eventual consistency.
   - **Cons:** Data can be stale for the duration of the TTL. Not suitable for rapidly changing data or data that needs immediate consistency. This is what `cache: { duration: ... }` uses in TypeORM.
2. **Write-Through / Write-Back:**
   - **Concept:**
     - **Write-Through:** When data is written (updated/deleted) to the database, it's _also_ immediately written to (or deleted from) the cache. The write operation only completes after both operations are successful.
     - **Write-Back:** Data is written only to the cache first. The cache then asynchronously writes the data to the database. Faster writes, but higher risk of data loss on cache crash before persistence. (Less common for primary application caching, more for specialized high-performance systems).
   - **Pros (Write-Through):** Strong consistency. Cache always reflects the latest state of the database.
   - **Cons:** Slower write operations because two operations must complete. More complex to manage errors.
   - TypeORM's automatic invalidation on save/update/delete when cache: true is used for findOne queries is an example of a write-through pattern (it clears/updates the cache immediately on write).
3. **Cache-Aside with Invalidation on Write:** (Most common for application-level caches)
   - **Concept:** (As demonstrated in our in-memory cache and TypeORM setup)
     - On read: Check cache first. If miss, read from DB, then populate cache.
     - On write (update/delete): Write to the database first. _Then, explicitly invalidate (delete) the relevant entry from the cache._ The next read will be a cache miss, forcing a fresh fetch from the database.
   - **Pros:** Simpler to implement than write-through if not directly integrated with ORM. Flexible. Good for consistency if invalidation is handled correctly.
   - **Cons:** Requires careful management of invalidation. If you forget to invalidate, stale data will persist. This is the pattern you'll mostly implement manually if not using ORM's built-in features.
4. **Version-Based / Content Hashing:**
   - **Concept:** Append a version number or a hash of the content to the cache key (e.g., user:123:v1, posts_published:hash123). When content changes, the version/hash changes, effectively creating a new cache key.
   - **Pros:** Guarantees fresh data because the key itself changes. No explicit invalidation needed for old keys.
   - **Cons:** Can lead to rapid cache growth (many old versions remaining until TTL). Requires application logic to manage versions/hashes. Less common for object caching directly within ORMs, but seen in distributed systems for larger objects.
5. **Event-Driven Invalidation (Pub/Sub):**
   - **Concept:** When data changes in the database, the database (via triggers), an ORM hook, or an application service publishes an event (e.g., "Post 123 updated"). Cache listeners subscribe to these events and invalidate specific entries.
   - **Pros:** Highly scalable and decoupled. Enables real-time invalidation across distributed cache instances.
   - **Cons:** More complex to set up (requires a message queue like Kafka, RabbitMQ, or Redis Pub/Sub). Adds an additional point of failure.

### Cache Invalidation Strategies

Cache invalidation is the most difficult thing in computer science just after naming things, but why? Well, for these 4 reasons:

- **Distributed Systems:** In a distributed system, data can be cached in multiple locations (e.g., browser, CDN, server-side cache). Ensuring consistency across all these caches is challenging.
- **Concurrency:** Multiple processes or threads might be accessing and updating the same data concurrently. This can lead to race conditions and inconsistent cache states.
- **Network Latency:** Network delays can make it difficult to determine when data has been updated and when the cache needs to be invalidated.
- **Complexity:** Implementing robust invalidation strategies can add significant complexity to your application.

When implementing cache invalidation strategies, you need to pick the right one. To do so, consider these factors:

- **Data Consistency:** How important is it to ensure that users always see the most up-to-date data?
- **Performance:** How much overhead can you tolerate for invalidation?
- **Complexity:** How much complexity are you willing to add to your application?
- **Cache Size:** How large is your cache?
- **Access Patterns:** How frequently is data accessed and updated?

#### TTL (time to live)

- **Concept:** Each cache entry is given a fixed duration for which it's considered valid. Once this time expires, the entry is automatically marked as stale and will be re-fetched from the origin on the next request.
- **Mechanism:** Usually implemented by storing an expiryTime (timestamp) with each cache entry.
- **Pros:**
  - Simple to implement and manage.
  - Guarantees eventual consistency (data will eventually be fresh).
  - Requires no explicit invalidation logic on writes.
- **Cons:**
  - Data can be stale for the duration of the TTL. If a TTL is 1 hour, updates won't reflect for up to an hour.
  - Choosing the right TTL is crucial: too short, and you lose cache benefits; too long, and data stays stale for too long.
- **Use Cases:**
  - Data that changes infrequently (e.g., daily reports, rarely updated configurations).
  - Data where slight staleness is acceptable (e.g., popular articles, non-critical dashboards).
  - Browser caching max-age is a prime example.

##### Advantages of TTL

- **Simplicity:** TTL is easy to understand and implement.
- **Guaranteed Staleness Bound:** It provides a guaranteed upper bound on how stale the data can be.

##### Disadvantages of TTL

- **Potential for Serving Stale Data:** Data might change before the TTL expires, leading to users seeing outdated information.
- **Difficulty in Choosing the Right TTL Value:** Setting the optimal TTL can be challenging. A short TTL can lead to excessive cache refreshes, while a long TTL can result in serving stale data for extended periods.

##### Choosing the Right TTL Value

The ideal TTL value depends on several factors:

- **Data Volatility:** How frequently does the data change? Highly volatile data requires shorter TTLs.
- **Cache Load:** How much traffic does your cache handle? High traffic might necessitate longer TTLs to reduce database load.
- **Acceptable Staleness:** How much staleness can your application tolerate? For critical data, shorter TTLs are essential.

#### Version Based caching

- **Concept:** When the content of a resource changes, its URL is modified (e.g., by adding a version number, a timestamp, or a content hash as a query parameter or part of the filename).
- **Mechanism:**
  - style.css?v=1.0.0 becomes style.css?v=1.0.1
  - bundle.js becomes bundle.1a2b3c4d.js
- **Pros:**
  - Highly effective for long-lived caches (like browser and CDN caches).
  - No explicit invalidation needed; new URLs are simply new cache entries.
  - Old versions remain cached, which can be useful for users still on old pages.
- **Cons:**
  - Requires a build process or server-side logic to generate unique URLs.
  - Can lead to many old, unused files accumulating on the server if not cleaned up.
- **Use Cases:** Static assets (CSS, JS, images, fonts) served via browser cache or CDN.\*\*\*\*

#### Write through / Write back

- **Concept:** These strategies link cache updates directly to write operations on the origin.
- **Write-Through:** On a write to the database, data is simultaneously written to the cache. Ensures cache and DB are always consistent.
  - _Pros:_ High consistency.
  - _Cons:_ Slower writes, more complex error handling (what if DB succeeds but cache fails?).
- **Write-Back:** Data is written to the cache first, then asynchronously synced to the database.
  - _Pros:_ Faster writes.
  - _Cons:_ Data loss risk on cache failure.
- **Cache-Aside with Invalidation (Most Common):**
  - **Read:** Check cache; if miss, read from DB, then populate cache.
  - **Write:** Write to DB, then **explicitly invalidate (delete) the corresponding item(s) from the cache**.
  - _Pros:_ Clear separation of concerns. Simpler than write-through. Good consistency.
  - _Cons:_ Requires explicit invalidation logic; easy to forget. Potential for a "thundering herd" if many requests hit the cache simultaneously just after invalidation (they all miss and hit the origin at once).
- **Use Cases:** Data that changes frequently and needs to be highly consistent (e.g., product prices, user balances, inventory).

#### Event driven invalidation

Event-based invalidation involves invalidating the cache when a specific event occurs that changes the underlying data.

> [!NOTE] > _Example:_
>
> ---
>
> When a user updates their profile information, an event is triggered to invalidate the cached profile data. This ensures that the next time the user's profile is accessed, the updated information is retrieved from the database.

- **Concept:** The underlying data source or the service responsible for its changes publishes an event when an update occurs. Cache services subscribe to these events and invalidate relevant entries upon receiving an event.
- **Mechanism:** Requires a message queue or publish/subscribe system (e.g., Redis Pub/Sub, Kafka, RabbitMQ).
- **Pros:**
  - Highly scalable for distributed systems.
  - Near real-time invalidation.
  - Decouples the data source from the cache.
  - Provides more immediate invalidation than TTL.
  - Reduces the risk of serving stale data.
- **Cons:**
  - Adds complexity to the architecture (another system to manage).
  - Requires careful design of event granularity and listener logic.
- **Use Cases:** Large-scale microservices architectures, real-time data synchronization across many cache nodes.

> [!TIP]
> This approach is particularly useful in distributed systems where multiple services might be caching the same data.

#### LRU, LFU, FIFO - cache eviction

These are three common in-application **caching eviction strategies** that have different use cases:

- **LRU:** Removes the item that has not been accessed for the longest time. Assumes recently used items are likely to be used again.
- **LFU:** Removes the item that has been accessed the fewest times.
- **FIFO (First-In, First-Out):** Removes the oldest item.

And here are the main takeaways of cache eviction policies:

- **Pros:** Prevents cache from growing indefinitely. Helps keep the most relevant data in cache.
- **Cons:** Doesn't guarantee data freshness; relies on TTL for that.
- **Use Cases:** Any type of cache with a finite size (in-memory, Redis, Memcached).

**LRU cache**

---

LRU is a cache eviction policy that removes the least recently used items from the cache when the cache is full. While not strictly an invalidation strategy, it helps to ensure that the cache contains the most relevant data.

Each time an item is accessed in the cache, its "recency" is updated. When the cache is full and a new item needs to be added, the LRU algorithm identifies the item that hasn't been accessed for the longest time and removes it to make space for the new item

_Pros:_

- Automatically adapts to changing access patterns.
- Simple to implement.

_Cons:_

- Doesn't guarantee data freshness.
- Can be inefficient if access patterns are unpredictable.
- **Overhead:** Maintaining the recency information for each item adds some overhead.
- **Susceptible to "Cache Pollution":** A one-time access to a large number of items can evict frequently used items, a phenomenon known as "cache pollution."

One way to mitigate cache pollution is to use a variant of LRU called **LRU-K**. LRU-K tracks the last K accesses for each item, rather than just the most recent one. This makes the algorithm less susceptible to short bursts of infrequent accesses.

**LFU cache**

---

LFU evicts the least frequently used items from the cache. Unlike LRU, which considers recency, LFU focuses on the overall access frequency.

Each item in the cache maintains a counter that tracks how many times it has been accessed. When the cache is full, the item with the lowest access count is evicted.

_Advantages_

- **Prioritizes Frequently Used Items:** LFU ensures that the most frequently accessed items remain in the cache.

_Cons_

- **Initial Learning Phase:** It takes time for LFU to accurately identify the most frequently used items.
- **Can Retain Unpopular Items:** Items that were frequently accessed in the past but are no longer popular might remain in the cache for a long time.

#### Cache Invalidation Class

```ts
// src/cache/InMemoryCache.ts (modified)
interface CacheEntry<T> {
  value: T;
  expiryTime: number; // Unix timestamp in milliseconds
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private defaultTtl: number; // Default TTL in milliseconds

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    // Default to 5 minutes
    this.defaultTtl = defaultTtlMs;
    this.startCleanup();
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const effectiveTtl = ttlMs !== undefined ? ttlMs : this.defaultTtl;
    const expiryTime = Date.now() + effectiveTtl;
    this.cache.set(key, { value, expiryTime });
    console.log(`[Cache] Set key "${key}" with TTL ${effectiveTtl / 1000}s`);
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      console.log(`[Cache] Miss for key "${key}" (not found)`);
      return null;
    }

    if (Date.now() >= entry.expiryTime) {
      this.delete(key); // Remove expired entry
      console.log(`[Cache] Miss for key "${key}" (expired)`);
      return null;
    }

    console.log(`[Cache] Hit for key "${key}"`);
    return entry.value;
  }

  /**
   * Manually invalidates (deletes) an entry from the cache.
   * This is key for cache-aside invalidation.
   * @param key The cache key to delete.
   * @returns True if deleted, false if not found.
   */
  public invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Cache] Invalidated key "${key}"`);
    } else {
      console.log(`[Cache] No entry found to invalidate for key "${key}"`);
    }
    return deleted;
  }

  /**
   * Manually invalidates all entries that start with a given prefix.
   * Useful for invalidating collections (e.g., all "posts:*").
   * @param prefix The prefix to match for invalidation.
   * @returns The number of entries invalidated.
   */
  public invalidateByPrefix(prefix: string): number {
    let invalidatedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        invalidatedCount++;
        console.log(`[Cache] Invalidated key by prefix: "${key}"`);
      }
    }
    console.log(
      `[Cache] Invalidated ${invalidatedCount} entries with prefix "${prefix}"`
    );
    return invalidatedCount;
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
    console.log("[Cache] Cleared all entries.");
  }

  public size(): number {
    return this.cache.size;
  }

  private startCleanup(intervalMs: number = 60 * 1000): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (now >= entry.expiryTime) {
          this.cache.delete(key);
          cleanedCount++;
        }
      }
      if (cleanedCount > 0) {
        console.log(`[Cache] Cleaned up ${cleanedCount} expired entries.`);
      }
    }, intervalMs);
  }

  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("[Cache] Stopped automatic cleanup.");
    }
  }
}

export default InMemoryCache;
```

#### Important Caching Metrics

- **Cache Hit Ratio:** This is the most important metric. It's the percentage of requests served directly from the cache (hits) versus those that had to go to the origin (misses).
  - Hit Ratio = (Cache Hits / (Cache Hits + Cache Misses)) \* 100
  - A high hit ratio (e.g., 80-95% for static assets, 50-80% for dynamic content) indicates effective caching. A low ratio means your cache is not very useful.
- **Cache Size/Memory Usage:** How much memory or disk space is your cache consuming? Is it within acceptable limits?
- **Eviction Rate:** How often are items being evicted from the cache (due to TTL, LRU, etc.)? A very high eviction rate might indicate your cache is too small or TTLs are too short.
- **Network Latency (to Cache vs. Origin):** Compare the response times when data is served from the cache versus when it has to go to the database or external API.
- **Origin Load Reduction:** Monitor your database or external API's CPU, memory, and query rates. A successful cache should show a noticeable reduction in load on these upstream services.
- **Error Rates:** Are there errors related to cache operations (e.g., connection issues to Redis)?

In depth:

- **Cache Hit Rate:** This is the most fundamental metric. It represents the percentage of requests that are served directly from the cache, without needing to access the origin server or database. A high hit rate indicates that the cache is effectively serving content, reducing latency and load on backend systems.
  - *Example:* If your website receives 1000 requests and 800 are served from the cache, your cache hit rate is 80%.
  - *Importance:* A low hit rate suggests that your cache is not being utilized effectively, possibly due to aggressive invalidation, small cache size, or inappropriate caching strategies.
- **Cache Miss Rate:** This is the inverse of the cache hit rate. It represents the percentage of requests that result in a cache miss, requiring the system to fetch data from the origin server.
  - *Example:* If your website receives 1000 requests and 200 result in a cache miss, your cache miss rate is 20%.
  - *Importance:* A high miss rate can negate the benefits of caching, increasing latency and load on backend systems. Analyzing the reasons for cache misses is crucial for optimizing your caching strategy.
- **Cache Eviction Rate:** This metric indicates how frequently items are being removed from the cache to make room for new data. High eviction rates can suggest that your cache is too small or that your invalidation policy is too aggressive.
  - *Example:* If your cache has a maximum capacity of 1000 items and evicts 100 items per hour, your eviction rate is 10% per hour (relative to the cache size).
  - *Importance:* Monitoring eviction rates helps you understand if your cache size is appropriate for your workload and if your eviction policy (e.g., LRU, TTL) is effective.
- **Cache Latency:** This measures the time it takes to retrieve data from the cache. Low latency is essential for a good user experience.
  - *Example:* The average time to retrieve data from the cache is 2 milliseconds.
  - *Importance:* High cache latency can indicate performance bottlenecks within the caching system itself, such as slow storage media or inefficient data structures.
- **Cache Size/Capacity:** This refers to the total amount of storage available to the cache. Monitoring cache size helps you ensure that you have enough capacity to store frequently accessed data.
  - *Example:* Your Redis cache is configured with a maximum memory limit of 10 GB.
  - *Importance:* If the cache is constantly full, it can lead to high eviction rates and reduced hit rates.
- **Resource Utilization (CPU, Memory, Network):** Monitoring the resources consumed by the caching system itself is important for identifying performance bottlenecks and ensuring that the cache is not negatively impacting other parts of your infrastructure.
  - *Example:* The Redis server is consistently using 80% of available CPU.
  - *Importance:* High resource utilization can indicate that the caching system is overloaded and needs to be scaled up or optimized.

### Best practices for caching

#### General practices

- **Monitor Continuously:** Caching performance can degrade over time as data access patterns change.
- **Adjust TTLs Prudently:** Based on monitoring and business requirements, fine-tune the TTLs of different types of cached data.
- **Regular Review of Invalidation Logic:** As your application evolves, ensure your invalidation logic remains robust. Missing invalidation points is a common source of bugs.
- **Capacity Planning:** Ensure your cache infrastructure (whether in-memory, Redis, or file-based) has enough capacity to handle your data volume and access patterns.
- **Staging Environment Testing:** Test caching behavior thoroughly in a staging environment that closely mirrors production. Simulate high load and data updates.
- **Use Metrics-Driven Decisions:** Don't just guess at caching; use data from your monitoring to inform decisions about what to cache, for how long, and when to invalidate.
- **Consider Cache Warm-up:** For critical caches, you might want a "warm-up" routine that pre-populates the cache with essential data when the application starts or deploys, to avoid initial cache misses.
- **Graceful Degradation/Fallbacks:** What happens if your cache service (e.g., Redis) goes down? Your application should ideally still function, perhaps with higher latency, by directly hitting the origin. Implement circuit breakers or fallback mechanisms.
- **Purging/Flushing:** Understand how to manually purge specific items or the entire cache, as this is often needed for emergency fixes or major deployments.

#### Handling Cache Stampede

A cache stampede occurs when a large number of requests for the same data arrive at the cache simultaneously, and the cache has expired or the data is not present. This can overload the origin server as it tries to handle all the requests at once.

- **Probabilistic Early Expiration:** Instead of having all cached items expire at the same time, introduce a small amount of randomness to the expiration times. This can help to distribute the load on the origin server.
- **Locking/Mutex:** When a cache miss occurs, acquire a lock to prevent multiple requests from trying to fetch the same data from the origin server simultaneously. Only the first request fetches the data, updates the cache, and releases the lock. Subsequent requests wait for the lock to be released and then retrieve the data from the cache.
- **Cache Warming:** Proactively populate the cache with frequently accessed data before it expires. This can be done by running a background job that periodically fetches and caches the data.

#### Adjusting Cache Size

The size of your cache is a critical factor in its performance. If the cache is too small, it will be unable to store frequently accessed data, leading to high eviction rates and low hit rates. If the cache is too large, it can waste resources and potentially impact performance due to increased memory usage.

- **Determining the Optimal Size:** The optimal cache size depends on your workload and the amount of data you need to cache. You can use monitoring data to determine the appropriate size. Start with a reasonable estimate and then gradually increase or decrease the size based on the cache hit rate and eviction rate.
- **Dynamic Cache Sizing:** Some caching systems support dynamic cache sizing, which automatically adjusts the cache size based on the workload. This can be useful for handling fluctuating traffic patterns.

#### Mitigating the thundering herd

The "cache stampede" is a critical performance bottleneck that can cripple web applications. It occurs when a large number of requests hit the cache simultaneously, find that the cached data is expired or missing, and then all attempt to regenerate the data at the same time. This sudden surge of requests overwhelms the backend servers, leading to slow response times, service degradation, or even complete failure. Understanding the causes of cache stampedes and implementing effective mitigation strategies is essential for building resilient and scalable web applications.

We have these mitigation strategies in place:

**lock-based approach**

This approach uses a lock (also known as a mutex) to ensure that only one process or thread can regenerate the cache at a time. When the cache expires, the first request acquires the lock, regenerates the data, updates the cache, and then releases the lock. Subsequent requests that arrive while the lock is held wait for the lock to be released and then retrieve the updated data from the cache.

**Probabilistic Early Expiration (Stale-While-Revalidate)**

Instead of waiting for the TTL to expire, this approach proactively refreshes the cache *before* it expires. Each time a request hits the cache, the system checks if the remaining TTL is below a certain threshold. If it is, the system *asynchronously* regenerates the cache in the background while still serving the stale data to the user. This ensures that the cache is refreshed before it actually expires, reducing the likelihood of a stampede.

**Thundering Herd Prevention**

This strategy involves a single request being allowed to refresh the cache, while all other requests are temporarily held back. Once the cache is refreshed, the held-back requests are then served from the updated cache. This can be implemented using semaphores or similar synchronization primitives.

#### Understand when to cache and how to cache

**when to cache**

- **Frequently Accessed Data:** Data that is accessed frequently but changes infrequently is an ideal candidate for caching. Examples include product catalogs, user profiles, configuration settings, and lookup tables.
- **Expensive Operations:** Operations that are computationally intensive or involve external API calls are good candidates for caching. Examples include complex calculations, image resizing, and data aggregation.
- **Read-Heavy Workloads:** Applications that primarily involve reading data (as opposed to writing data) can benefit greatly from caching. E-commerce websites, content management systems, and news portals are examples of read-heavy applications.

**when not to cache**

- **Infrequently Accessed Data:** Caching data that is rarely accessed provides little benefit and can waste valuable cache space.
- **Frequently Changing Data:** Caching data that changes frequently can lead to stale data being served to users. In such cases, the cache invalidation strategy becomes critical and can add complexity.
- **Data Sensitivity:** Caching sensitive data (e.g., credit card numbers, passwords) can pose security risks if the cache is not properly secured. Consider whether the performance gains outweigh the potential security implications.
- **Small Datasets:** For very small datasets that can be quickly retrieved from the database, the overhead of caching may outweigh the benefits.

**the 4 cache types**

There are 4 different ways you can cache data in your app, each having different use cases:

**Client-Side Caching**

Client-side caching involves storing data in the user's browser or device. This can be achieved using browser caching mechanisms (e.g., HTTP headers) or local storage.

- **Benefits:** Reduces network latency, improves user experience for returning users.
- **Drawbacks:** Limited storage capacity, potential for stale data, security concerns for sensitive data.
- **Use Cases:** Static assets (e.g., images, CSS, JavaScript), infrequently changing data (e.g., user preferences).

**Server-Side Caching**

Server-side caching involves storing data on the backend server. This can be achieved using in-memory caches (e.g., Redis, Memcached) or disk-based caches.

- **Benefits:** Faster data retrieval, reduced load on backend servers, improved scalability.
- **Drawbacks:** Increased memory usage, potential for cache invalidation issues, added complexity.
- **Use Cases:** Frequently accessed data (e.g., product catalogs, user profiles), expensive operations (e.g., complex calculations).

**Database Caching**

Database caching involves storing query results in a cache layer that sits in front of the database. This can be achieved using database caching solutions (e.g., Memcached, Redis) or database-specific caching features.

- **Benefits:** Reduced database load, improved query performance, increased scalability.
- **Drawbacks:** Potential for cache invalidation issues, added complexity, increased memory usage.
- **Use Cases:** Frequently executed queries, read-heavy workloads.

**Content Delivery Network (CDN) Caching**

CDNs cache static content (e.g., images, CSS, JavaScript) on a network of servers distributed around the world. When a user requests content, the CDN serves it from the server closest to the user's location.

- **Benefits:** Reduced latency, improved user experience, reduced load on origin server.
- **Drawbacks:** Cost, potential for stale data, added complexity.
- **Use Cases:** Static assets, large files, geographically distributed users.

### Complete custom caching Utils

```ts
/**
 * A generic class that allows for object caching single database records.
 */

import path from "node:path";
import { FileManager } from "./CLI";

export const ttlMap = {
  n_seconds: (n: number) => 1000 * n,
  n_minutes: (n: number) => 1000 * 60 * n,
  n_hours: (n: number) => 1000 * 60 * 60 * n,
  n_days: (n: number) => 1000 * 60 * 60 * 24 * n,
  n_weeks: (n: number) => 1000 * 60 * 60 * 24 * 7 * n,
  n_months: (n: number) => 1000 * 60 * 60 * 24 * 30 * n,
  n_years: (n: number) => 1000 * 60 * 60 * 24 * 365 * n,
};

class Cacher<T> {
  protected cache: Map<string, T> = new Map();
  protected cacheWithTTL: Map<string, { value: T; expiresAt: Date }> =
    new Map();

  constructor(protected ttl: number = ttlMap.n_days(1)) {}

  setTTL(ttl: number): void {
    this.ttl = ttl;
  }

  getWithTTL(key: string): T | undefined {
    const cached = this.cacheWithTTL.get(key);
    if (cached) {
      if (cached.expiresAt > new Date()) {
        return cached.value;
      } else {
        this.cacheWithTTL.delete(key);
        return cached.value;
      }
    }
    return undefined;
  }

  setWithTTL(key: string, value: T, ttl: number): void {
    this.cacheWithTTL.set(key, {
      value,
      expiresAt: new Date(Date.now() + ttl),
    });
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.cacheWithTTL.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values());
  }

  valuesWithTTL(): { value: T; expiresAt: Date }[] {
    return Array.from(this.cacheWithTTL.values());
  }
}

/**
 * Map should be some arbitrary key to filepath.
 */
export class Base64FileCacher extends Cacher<string> {
  private cacheDirCreated = false;
  private withTTL: boolean = false;
  constructor(private cacheDir: string, ttl: number | undefined) {
    super(ttl);
    if (ttl) {
      this.withTTL = true;
    }
  }

  private getCachePath(value: string): string {
    return path.join(this.cacheDir, value);
  }

  private async upsertCacheDirectory() {
    if (!this.cacheDirCreated) {
      await FileManager.createDirectory(this.cacheDir, { overwrite: false });
      this.cacheDirCreated = true;
    }
  }

  private async getCacheFile(
    key: string,
    options?: { withTTL: boolean }
  ): Promise<string | null> {
    await this.upsertCacheDirectory();
    const value = options?.withTTL ? this.getWithTTL(key) : this.get(key);
    if (!value) {
      return null;
    }
    const cachePath = this.getCachePath(value);
    try {
      const content = await FileManager.readFileAsBase64(cachePath);
      if (!content) {
        return null;
      } else {
        console.log(`Cache hit for ${key}`);
        return content;
      }
    } catch (error) {
      console.error(`Error reading cache file ${cachePath}:`, error);
      return null;
    }
  }

  private async writeCacheFile(
    key: string,
    base64String: string,
    options?: { withTTL: boolean }
  ) {
    await this.upsertCacheDirectory();
    const filename = options?.withTTL ? this.getWithTTL(key) : this.get(key);
    if (!filename) {
      return;
    }
    const cachePath = this.getCachePath(filename);
    await FileManager.createFileFromBase64(cachePath, base64String, {
      overwrite: true,
    });
  }

  async getCacheFirst(
    key: string,
    options?: {
      getBase64Revalidate: () => Promise<{
        filename: string;
        base64String: string;
      } | null>;
    }
  ): Promise<string | null> {
    const cachedBase64 = await this.getCacheFile(key, {
      withTTL: this.withTTL,
    });
    if (cachedBase64) {
      return cachedBase64;
    }
    const data = await options?.getBase64Revalidate();
    if (!data) {
      return null;
    } else {
      this.addFilenameToCache(key, data.filename);
      await this.writeCacheFile(key, data.base64String, {
        withTTL: this.withTTL,
      });
      return data.base64String;
    }
  }

  addFilenameToCache(key: string, filename: string) {
    if (this.withTTL) {
      this.setWithTTL(key, filename, this.ttl);
    } else {
      this.set(key, filename);
    }
  }
}

export class ObjectCacher<T> extends Cacher<T> {
  async getCacheFirst(
    key: string,
    revalidate: () => Promise<T | null>
  ): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }
    const value = await revalidate();
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }

  async getWithRevalidate(
    key: string,
    revalidate: () => Promise<T | null>
  ): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      const value = await revalidate();
      if (value) {
        this.set(key, value);
        return value;
      } else {
        return cached;
      }
    }
    const value = await revalidate();
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }
}

export class QueryCacher<T> extends Cacher<T> {
  constructor(private exec: (query: string) => Promise<T | null>) {
    super();
  }

  async getCacheFirst(key: string): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }
    const value = await this.exec(key);
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }

  async getWithRevalidate(key: string): Promise<T | null> {
    const cached = this.get(key);
    if (cached) {
      const value = await this.exec(key);
      if (value) {
        this.set(key, value);
        return value;
      } else {
        return cached;
      }
    }
    const value = await this.exec(key);
    if (!value) {
      return null;
    } else {
      this.set(key, value);
      return value;
    }
  }
}
```

