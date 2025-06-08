## Intro

You can spin up a redis container like so:

```bash
docker run -dit --rm --name=my-redis -p 6379:6379 redis:6.0.8
docker exec -it my-redis redis-cli
```

Using Redis is very simple. They just follow the syntax below:

```sql
SET username "amallick"
GET username
```

- `SET <key> <value>` : sets the key to have the specified value
- `GET <key>` : returns the value of the specified key

**Namespaces**

We need some way to avoid name collisions, so we’ll follow a common pattern for naming our redis keys: separating by colons.

```bash
SET user:aadil:username "amallick"
SET user:dan:username "dantheman"
```

This follows an intuitive pattern that avoids name collisions.

## Commands

- `INCR <key>` : increments specified key by 1
- `DECR <key>` : decrements specified key by 1
- `INCRBY <key> <num>` : increments specified key by specified amount
- `DECRBY <key> <num>` : decrements specified key by specified amount
- `MSET <key1> <val1> <key2> <val2> ...` : the commands to set multiple keys at the same time
- `MGET <key1> <key2> ...` : the commands to get back the values of multiple keys at the same time
- `EXISTS <key>` : returns 1 if the key exists, 0 if it does not
- `DELETE <key>` : deletes the specified key

## Options

We can use command options to be more granular in allowing which operations to succeed and which ones to fail. The basic syntax is as follows:

```bash
COMMAND <key> <value> OPTION
```

Here are the options you are allowed:

- `XX` : when this option is applied, this command will only succeed if the key already exists
- `NX`: when this option is applied, the command will only succeed if the key does not exist

```bash
SET user:aadil:username "amallick" NX # works only if key didn't exist before
```

TTL describes **time to live**, allowing us to control cache expiration for certain keys. We do this with the EX command to describe the cache age in seconds:

```bash
SET bruh "bruh" EX 1
```

```redis
SET fitness:total:btholt 750kj EX 3600
```

## Objects in Redis

### Lists

```redis
RPUSH notifications:btholt "Call your mom" "Feed the dog" "Take out trash"
LRANGE notifications:btholt 0 -1
```

- `RPUSH` can be thought of as a push on a stack. You're adding thing(s) to the end of a list.
- `LRANGE` can be thought of as the `GET` for lists (GET doesn't work on lists). It always requires the indexes you want to get so `0 -1` gets you the whole list. You can give it `1 5` and that will be the 1 index (i.e. the second) element to the 5 index element. Negative numbers count back from the end with -1 being the last element, -2 being the penultimate, etc.

Here are all the modification commands you have access to:

- `RPOP <list-key>`: pops and deletes the last element in the array
- `LPOP <list-key>`: pops and deletes the first element in the array
- `RPUSH <list-key> <value>`: appends the value to the array
- `LPUSH <list-key> <value>`: prepends the value to the array

### Objects

```bash
HMSET btholt:profile title "principal program manager" company "Microsoft" city "Seattle" state "WA"
HGET btholt:profile city
HGETALL btholt:profile
```

## Node + Redis

Redis is extremely easy to use with node. All we do is install the `redis` library, and all the functions have async support.

1. `npm i redis`
    
2. Run your redis database locally on port 6379, and yes the port number matters.
    
3. Create a redis client
    
    ```tsx
    import redis from "redis";
    
    export const client = redis.createClient();
    ```
    
4. Connect the client
    
    ```tsx
    async function init() {
    	await client.connect()
    }
    ```
    

Now you are ready to run redis commands, which are extremely simple and intuitive:

```tsx
const counterExists = await client.exists("counter");
await client.set("counter", 0);
await client.incr("counter");
await client.get("counter")
```

### Complete app

```tsx
// redisclient.ts

import redis from "redis";

export const client = redis.createClient({});

client.on("error", (err) => {
  console.log("Error " + err);
});
```

```tsx
// index.ts

import express from "express";
import { client } from "./redisclient";
const app = express();

app.get("/", async (req, res) => {

	// increment counter and return it
  await client.incr("counter");
  res.send(`Counter: ${await client.get("counter")}`);
});

async function init() {
	// 1. connect to db
  await client.connect();

	// 2. see if key exists. If not, then set it
  const counterExists = await client.exists("counter");
  if (!counterExists) {
    await client.set("counter", 0);
  }

  app.listen(3000, () => {
    console.log("Server is running on port <http://localhost:3000>");
  });
}

init();
```