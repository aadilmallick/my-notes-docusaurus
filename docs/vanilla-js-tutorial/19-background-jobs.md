
## Vanilla Job Queues

```embed
title: "GitHub - WebDevSimplified/job-queue"
image: "https://opengraph.githubassets.com/6c179b9ff3038c13f47d2abf45a290fd15a8b912cbecce30ac45fccb550081f6/WebDevSimplified/job-queue"
description: "Contribute to WebDevSimplified/job-queue development by creating an account on GitHub."
url: "https://github.com/WebDevSimplified/job-queue"
favicon: ""
aspectRatio: "50"
```


```ts
export type JobOptions = {
  delay: number
  priority: number
  retry: {
    totalAttempts: number
    maxAttempts: number
    delay: number
  }
}

export type Job<T> = {
  id: string
  name: string
  data: T
  options: JobOptions
}
```

This is a worker implementation for running jobs based on an abstract queue

```ts
import { Queue } from "./queue"
import { Job } from "./types"

export class Worker<T> {
  private queue: Queue<T>
  private processJob: (job: Job<T>) => Promise<void>
  private concurrency
  private activeJobs: Map<string, Promise<void>> = new Map()

  constructor(
    queue: Queue<T>,
    processJob: (job: Job<T>) => Promise<void>,
    { concurrency = 1 } = {}
  ) {
    this.processJob = processJob
    this.queue = queue
    this.concurrency = concurrency
  }

  async start() {
    while (true) {
      const job = await this.queue.getOrWaitForJob()
      if (job == null) {
        await new Promise(resolve => setTimeout(resolve, 15000))
      } else {
        this.activeJobs.set(
          job.id,
          this.processJob(job)
            .catch(async () => {
              await this.queue.addJob({
                ...job,
                options: {
                  ...job.options,
                  retry: {
                    ...job.options.retry,
                    totalAttempts: job.options.retry.totalAttempts + 1,
                  },
                  delay:
                    job.options.retry.delay *
                    (job.options.retry.totalAttempts + 1) ** 2,
                },
              })
            })
            .finally(() => {
              this.activeJobs.delete(job.id)
            })
        )
      }
      if (this.activeJobs.size >= this.concurrency) {
        await Promise.any(this.activeJobs.values())
      }
    }
  }
}
```

This is an abstract queue:

```ts
import { Job, JobOptions } from "./types"

export type QueueOptions = {
  retryAttempts: number
  retryDelay: number
}

export type OptionalJobOptions = Partial<JobOptions> & {
  retry?: Partial<JobOptions["retry"]>
}

export abstract class Queue<T> {
  protected queueName: string
  protected options: QueueOptions

  constructor(
    queueName: string,
    options: QueueOptions = { retryAttempts: 10, retryDelay: 1000 }
  ) {
    this.queueName = queueName
    this.options = options
  }

  async addJob(
    job: Omit<Job<T>, "id" | "options"> & {
      options?: OptionalJobOptions
      id?: string
    }
  ) {
    const id = job.id ?? crypto.randomUUID()
    if (
      (job.options?.retry?.totalAttempts ?? 0) >=
      (job.options?.retry?.maxAttempts ?? 1)
    ) {
      return id
    }

    await this.push({
      ...job,
      id,
      options: {
        delay: job.options?.delay ?? 0,
        priority: job.options?.priority ?? 0,
        retry: {
          totalAttempts: job.options?.retry?.totalAttempts ?? 0,
          maxAttempts:
            job.options?.retry?.maxAttempts ?? this.options.retryAttempts,
          delay: job.options?.retry?.delay ?? this.options.retryDelay,
        },
      },
    })

    return id
  }

  protected abstract push(
    job: Job<T> & { options: { retry: Required<Job<T>["options"]["retry"]> } }
  ): Promise<unknown>
  abstract getOrWaitForJob(): Promise<
    | (Job<T> & { options: { retry: Required<Job<T>["options"]["retry"]> } })
    | null
  >
  abstract get length(): Promise<number>
}
```

This is a specific adapter for redis:

```ts
import IORedis from "ioredis"
import { Job } from "./types"
import { Queue, QueueOptions } from "./queue"

export class RedisQueue<T> extends Queue<T> {
  private redisBlocking: IORedis
  private redisNonBlocking: IORedis
  private redisSubscriber: IORedis

  constructor(redisUrl: string, queueName: string, options?: QueueOptions) {
    super(queueName, options)

    this.redisBlocking = new IORedis(redisUrl)
    this.redisNonBlocking = new IORedis(redisUrl)
    this.redisSubscriber = new IORedis(redisUrl)

    this.listenForExpiredJobs()
    this.checkForExpiredJobs()
  }

  get length() {
    return this.redisNonBlocking.zcard(this.activeJobsQueue)
  }

  async getOrWaitForJob() {
    const data = await this.redisBlocking.bzpopmin(this.activeJobsQueue, 0)
    return data?.[1] ? JSON.parse(data[1]) : null
  }

  protected async push(job: Job<T>) {
    if (job.options.delay > 0) {
      return await this.redisNonBlocking
        .multi()
        .set(this.expiringJobIdList(job.id), job.id)
        .pexpire(this.expiringJobIdList(job.id), job.options.delay)
        .zadd(this.delayedJobIdsQueue, Date.now() + job.options.delay, job.id)
        .hset(this.delayedJobsList, job.id, JSON.stringify(job))
        .exec()
    } else {
      return await this.addActiveJob(job)
    }
  }

  // Ready to execute jobs sorted by priority
  private get activeJobsQueue() {
    return `${this.queueName}:active`
  }

  // Full job data for delayed jobs
  private get delayedJobsList() {
    return `${this.queueName}:jobs`
  }

  // Delayed job ids sorted by execution date
  private get delayedJobIdsQueue() {
    return `${this.queueName}:delayed`
  }

  // Delayed job ids that will expire after the delay
  private expiringJobIdList(jobId: string) {
    return `${this.queueName}:expiringJobs:${jobId}`
  }

  private async addActiveJob(job: Job<T>) {
    return await this.redisNonBlocking.zadd(
      this.activeJobsQueue,
      (job.options.priority ?? 0) * -1,
      JSON.stringify(job)
    )
  }

  private async moveJobToActive(jobId: string) {
    const job = await this.redisNonBlocking.hget(this.delayedJobsList, jobId)
    if (job == null) return

    await this.addActiveJob(JSON.parse(job))
    await this.redisNonBlocking
      .multi()
      .zrem(this.delayedJobIdsQueue, jobId)
      .hdel(this.delayedJobsList, jobId)
      .exec()
  }

  private async listenForExpiredJobs() {
    await this.redisSubscriber.subscribe("__keyevent@0__:expired")

    this.redisSubscriber.on("message", async (channel, message) => {
      if (channel !== "__keyevent@0__:expired") return
      if (!message.startsWith(this.expiringJobIdList(""))) return

      const jobId = message.split(":").pop()
      if (jobId == null) return

      await this.moveJobToActive(jobId)
    })
  }

  private async checkForExpiredJobs() {
    const expiredJobs = await this.redisNonBlocking.zrangebyscore(
      this.delayedJobIdsQueue,
      0,
      Date.now()
    )

    for (const jobId of expiredJobs) {
      await this.moveJobToActive(jobId)
    }
  }
}
```

FInally, here's how to use it:

```ts
import { RedisQueue } from "./job-queue/redis-adapter"
import { Worker } from "./job-queue/worker"

const queue = new RedisQueue<{ email: string; body: string }>(
  "redis://localhost:6379",
  "test-queue",
  {
    retryAttempts: 3,
    retryDelay: 1000,
  }
)

queue.addJob({
  data: { email: "test@test.com", body: "Hi" },
  name: "1",
  options: {
    priority: 1,
  },
})

queue.addJob({
  data: { email: "test@test.com", body: "Bye" },
  name: "2",
  options: {
    priority: 3,
    delay: 1000,
  },
})

queue.addJob({
  data: { email: "test2@test.com", body: "Hello World" },
  name: "3",
  options: {
    priority: 2,
  },
})

queue.addJob({
  data: { email: "test2@test.com", body: "Error" },
  name: "4",
})

setTimeout(() => {
  queue.addJob({
    data: { email: "test@test.com", body: "High Priority" },
    name: "5",
    options: {
      priority: 5,
    },
  })
}, 2000)

const worker = new Worker(
  queue,
  async job => {
    console.log(`Start: W1 ${job.name}`)
    await sendEmail(job.data.email, job.data.body)
  },
  { concurrency: 3 }
)

worker.start()

function sendEmail(email: string, body: string) {
  if (body === "Error") {
    console.log(`Error sending email to ${email}`)
    throw new Error("Simulated error")
  }
  return new Promise(resolve => setTimeout(resolve, 1000))
}
```
## RabbitMQ
## Inngest

### Basics

1. Run the inngest CLI, which opens up an inngest UI to view jobs on port 8222

```bash
npx inngest-cli@latest dev
```

2. Create an inngest client

```ts title="api/inngest/client.ts"
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "cloudnotes" });
```

3. Create functions

```ts title="api/inngest/functions.ts"
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    rateLimit: {
      limit: 1,
      period: "1s",
      key: "event.data.email",
    },
  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    console.log(event.data);
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

```

4. Serve inggest on route handlers, specifically on the `/api/inngest` route, and yes, it must be named that.

```ts title="api/inngest/route.ts"
import { serve } from "inngest/next";
import { inngest } from "./client";
import { helloWorld } from "./functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    helloWorld,
  ],
});
```


You can then queue background jobs with the `inngest.send()` function, passing in an object of options:

- `name`: the name of the function to trigger.
- `data`: the data to send to the function, which the function can then access through `event.data`.

```ts
import { NextResponse } from "next/server";
import { inngest } from "../../inngest/client";

// Create a simple async Next.js API route handler
export async function GET() {
  // Send your event payload to Inngest
  await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testUser@example.com",
    },
  });

  return NextResponse.json({ message: "Event sent!" });
}
```

### adding steps

Steps in inggest allow to cache functions and retry them, avoiding an all-or-nothing approach when it comes to running background jobs that might error out.

Here is a complete example of setting up a basic messaging system:

```ts
export class InngestMessageSystem<T extends Record<string, any>> {
  getSendMessageObject<K extends keyof T>(key: K, payload: T[K]) {
    return {
      name: key,
      data: payload,
    };
  }

  typePayload<K extends keyof T>(key: K, eventData: any) {
    return eventData as T[K];
  }
}
```

Then you can add steps with the `step.run()` async method:

```ts
import { z } from "zod";
import { inngest, inngestMessageSystem } from "./client";
import { Mailer } from "@/utils/Mailer";

function validateEnv(envKey: string) {
  const envValue = process.env[envKey];
  if (!envValue) {
    throw new Error(`Environment variable ${envKey} is not set`);
  }
  return envValue;
}

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    rateLimit: {
      limit: 1,
      period: "1s",
      key: "event.data.email",
    },
  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // step 1: validate email
    const emailStep = await step.run("email", async () => {
      const eventData = inngestMessageSystem.typePayload(
        "test/hello.world",
        event.data
      );
      const emailString = z.string().email();
      return emailString.safeParse(eventData.email).data;
    });

    if (!emailStep) {
      return {
        success: false,
        message: "Invalid email",
      };
    }

    const sendEmailStep = await step.run("send-email", async () => {
      try {
        const mailer = new Mailer(
          validateEnv("EMAIL_USER"),
          validateEnv("EMAIL_PASSWORD")
        );
        await mailer.sendEmail({
          recipient: emailStep,
          subject: "Hello from Inngest",
          message: "This is a test email",
        });
        return {
          success: true,
          message: `Email sent to ${emailStep}`,
        };
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Failed to send email",
        };
      }
    });

    return sendEmailStep;
  }
);

```

Then finally you would trigger the actual background event by sending an API request to one of your app endpoints, sending data to trigger the background job while immediately returning.

```ts
import { NextResponse } from "next/server";
import { inngest, inngestMessageSystem } from "../../inngest/client";
import z from "zod";

// Create a simple async Next.js API route handler
export async function POST(request: Request) {
  const json = await request.json();
  const { email } = json;
  const emailString = z.string().email();
  const parsedEmail = emailString.safeParse(email);
  if (!parsedEmail.success) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }
  // Send your event payload to Inngest
  await inngest.send(
    inngestMessageSystem.getSendMessageObject("test/hello.world", {
      email: parsedEmail.data,
    })
  );

  return NextResponse.json({ message: "Event sent!" });
}
```

You can wait in between steps using the `step.sleep()` async function:

```ts
await step.sleep("wait-for-a-week", )
```

> [!DANGER]
> Steps cannot be nested inside other steps. Anytime you are doing a nested invocation of a method on the `step` object, you are doing something wrong.

### Function deep dive

The basic syntax to create a function is like so:

```ts
const func = inngest.createFunction(options, type, cb)
```

- `options`: an object of options that configure the execution behavior of the function. Here are some basic options that exist on all types of jobs:
	- `id`: **required**: the job Id.
	- `name`: the name of the function
- `type`: an object that configures the type of background job to create, like a normal background job or a cron job.
- `cb`: an async callback for defining the actual implementation of the job.

#### Normal background jobs

Createing a normal background job is based on specifying that the function is an **event** type, and then passing in the name of the event.

There are additional parameters you can set when creating a background job:

- `rateLimit`: for rate limiting, able to unique identify requests via a key.
	- `limit`: the maximum amount of concurrent requests to let run in the job queue.
	- `period`: the rate limiting delay
	- `key`: the event property to use for uniquely identifying requests.
- 

```ts
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    rateLimit: {
      limit: 1,
      period: "1s",
      key: "event.data.email",
    },
  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
	  // implementation of job here ...
  }
)
```

#### Creating cron jobs

You can create cron jobs by just specifying a `cron` type object:

```ts
export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    rateLimit: {
      limit: 1,
      period: "1s",
      key: "event.data.email",
    },
  },
  { cron: "* * * * *" },
  async ({ step }) => {
	  // implementation of job here ...
  }
)
```

## Upstash
