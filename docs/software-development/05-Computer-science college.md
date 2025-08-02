# The complete computer science college course

## Basic technology literacy

### Standard keyboard shortcuts


| keyboard shortcut (windows)            | keyboard shortcut (mac)                  | description                                                                      |
| -------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| CTRL + (left and right arrows)         | OPTION + (left and right arrows)         | jumps cursor a single word at a time. Useful for quickly moving through text.    |
|                                        | COMMAND + (left and right arrows)        | jumps to the beginning or ending of a line.                                      |
| SHIFT + (left and right arrows)        | SHIFT + (left and right arrows)          | highlights single characters at a time to the left or right                      |
| CTRL + SHIFT + (left and right arrows) | CTRL + OPTION + (left and right arrows)  | highlights words at a time to the left or right, going faster than simple shift. |
|                                        | CTRL + COMMAND + (left and right arrows) | highlights by lines at a time.                                                   |
| CTRL + delete                          | OPTION + delete                          | deletes by a single word at a time. Useful for quick deleting.                   |
|                                        | COMMAND + delete                         | deletes an entire line                                                           |

## Binary

### File size standards

A kilobyte (KB) is 1000 bytes. A kibibyte (KiB) is 1024 bytes. So any acronyms using with an "i" in them are referring to a power of 2.

## Authentication

### email and password auth theory

#### Salts and hashing

How do we keep the unique combination of a user's email and password secure? While we store emails in plain text, we must **hash** passwords.

- **hashing**: A hash is a deterministic, one-way, random garbling of a string which makes it impossible to decrypt a hash.

However, the main problem with just hashing passwords is that they are deterministic. This means that a hacker can figure out the plain-text string that results in the specified hash, time permitting. To solve this issue, we use **salts**.

- **salt**: a random string added to the password before hashing. This salt value is stored alongside the hash value in the database.

Salts serve two purposes:

1. **Prevents Rainbow Table Attacks**: Rainbow tables are precomputed tables of hash values for common passwords. By adding a salt, you make it unlikely that a rainbow table will contain the hash value for a specific password + salt combination.
2. **Makes Hash Values Unique**: Even if two users have the same password, the addition of unique salts ensures their hash values will be different.

Salts ensure that even if two users have the same password, their hash values will be different, making rainbow tables ineffective.

For example, instead of hashing the super common password `"password"`, we will append a special salt string, unique, random, and stored for each user. We would instead hash `"password-salt"` for each user. Because a salt is unique, it completely changes the hash value for any 

Here's why salting prevents rainbow table attacks:

- **Unique Hash Values**: With salts, each password + salt combination produces a unique hash value. This means an attacker would need a separate rainbow table for each unique salt value.
- **Computational Overhead**: Creating a rainbow table for a single salt value would require significant computational resources and time. With bcrypt's slow hashing algorithm, this becomes even more impractical.
- **Storage Requirements**: To store rainbow tables for all possible salt values, an attacker would need an enormous amount of storage space.

Now let's talk about implementation.

**using node crypto**

The basic flow of adding a enw user and hashing their password with node crypto is like so:

1. Create a random 16-byte salt
2. Append the salt to the plain text password
3. Hash the salted plain text password
4. Stored the hashed password, email, and salt for the user in the database.

Here is a reusable model that can convert itself to JSON, be stored along with the user db record, and create itself from JSON in order to authenticate a user with the same hashing specifications:

```ts
import crypto from "node:crypto";

export class CryptoPasswordModel {
  private salt: string;
  private iterations: number;
  private keyLength: number;
  private digest: string;

  constructor(options?: {
    salt?: string;
    iterations?: number;
    keyLength?: number;
    digest?: string;
  }) {
    if (options) {
      this.salt = options.salt || crypto.randomBytes(16).toString("hex");
      this.iterations = options.iterations || 10;
      this.keyLength = options.keyLength || 64;
      this.digest = options.digest || "sha256";
    } else {
      this.salt = crypto.randomBytes(16).toString("hex");
      this.iterations = 10;
      this.keyLength = 64;
      this.digest = "sha256";
    }
  }

  async hash(password: string) {
    const { promise, resolve, reject } = Promise.withResolvers<Buffer>();
    crypto.pbkdf2(
      password,
      this.salt,
      this.iterations,
      this.keyLength,
      this.digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey);
      }
    );
    const hash = await promise;
    return hash.toString("hex");
  }

  toJSON() {
    return {
      salt: this.salt,
      iterations: this.iterations,
      keyLength: this.keyLength,
      digest: this.digest,
    };
  }

  static fromJSON(json: {
    salt: string;
    iterations: number;
    keyLength: number;
    digest: string;
  }) {
    return new CryptoPasswordModel({
      salt: json.salt,
      iterations: json.iterations,
      keyLength: json.keyLength,
      digest: json.digest,
    });
  }

  async verify(password: string, hash: string) {
    const { promise, resolve, reject } = Promise.withResolvers<boolean>();
    crypto.pbkdf2(
      password,
      this.salt,
      this.iterations,
      this.keyLength,
      this.digest,
      (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(derivedKey.toString("hex") === hash);
      }
    );
    const result = await promise;
    return result;
  }
}
```

For example, this would be how signing up works:

```ts
async function signUpUser(email: string, password: string) {
	// 1. if email already exists in DB, throw error

	// 2. hash password
	const model = new CryptoPasswordModel();
	const hashedPassword = await model.hash(password);

	// 3. add to DB, along with salt itself
	const user = await addUserToDB({
		email,
		password: hashedPassword,
		hashingInfo: model.toJSON() 
	})
	return user; // newly created user with id
}
```

To sign in a user and authenticate them, here is the flow:

1. Accept the email and password from the user via form
2. Find the db user record with the same email, if exists. Else throw error.
3. Get the salt from the db user record, and with it, hash the plaintext password.
4. If the newly hashed password and the stored db user record password are equal, then the user is authenticated. Else, user entered incorrect password.

Here is the flow:

```ts
async function signInUser(email: string, password: string) {
	// 1. get the user with same email from db
	const storedUser = await db.findOne({email: email})
	if (!storedUser) throw new Error("email not found, user doesn't exist")

	// 2. get crypto specs
	const model = CryptoPasswordModel.fromJSON(storedUser.hashingInfo)

	// 3. compare hashes. If equal, authenticate user.
	const matches = await model.verify(password, storedUser.password)
	return matches
}
```

**using Bcrypt**

Bcrypt does this automatically for us, where we only have to specify the number of salt rounds.

```ts
const bcrypt = require('bcrypt');

async function signInUser(email: string, password: string) {
	// 1. hash the password with 10 salt rounds
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(password, saltRounds)

	// 2. get the user with same email from db
	const storedUser = await db.findOne({email: email})
	if (!storedUser) throw new Error("email not found, user doesn't exist")

	// 3. compare hashes. If they are equal, user is authenticated.
	let matches = storedUser.password === hashedPassword

	// 3a. or, use bycrypt.compare(plainTextpassword, hashedPassword)
	matches = await bcrypt.compare(password, storedUser.password)
	return matches
}
```

Here's an example of a bcrypt hash string:

Bash

```
$2b$10$nOUIs5kJ7naTuTFkBy1veuJq8Bhn7F6K9eWgQXhja4z8fu48.seedU
```

In this example:

- `$2b$` is the algorithm version
- `10$` is the cost factor
- `nOUIs5kJ7naTuTFkBy1veu` is the salt value (22 characters)
- `Jq8Bhn7F6K9eWgQXhja4z8fu48.seedU` is the hash value

When comparing passwords, bcrypt extracts the salt value (`nOUIs5kJ7naTuTFkBy1veu`) from the stored hash string and uses it to hash the provided password. This ensures that the same salt value is used for both the original hash and the comparison hash, allowing bcrypt to accurately verify the password.

### Auth Types

There are two types of authentication standards:

- **stateful authentication**: Auth based on the client sending cookies to the server and storing auth info about the current user in the cookie, like a session ID. The server then stores the session data.
- **stateless authentication**: Auth that is not based on cookies but rather on encrypted tokens. DB does not store auth state or user info, meaning auth info is stored in the token itself on the client.

> [!NOTE]
> The main difference between stateful authentication and stateless is that in stateless auth, because the server stores all the details about the current session for a logged in user including client ID and expiration time, it can revoke that authentication session at any time. 
>
>Since you're not storing anything server-side in stateless auth, you can't revoke the authentication session - you can only store expiration information in the token when you send it to the client and base application logic off of that.

- **Use stateful authentication when**: + High-security requirements exist (e.g., financial institutions, government agencies). + The application requires fine-grained control over user sessions (e.g., single sign-on, shared device access).
- **Use stateless authentication when**: + Scalability and performance are critical. + Security is not a top priority, but rather convenience and simplicity. + The application has minimal security requirements or can tolerate token-related risks.

| Feature                | Session-Based (Stateful)                                          | Token-Based (Stateless)                                                                          |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Server stores session? | ✅ Yes (e.g., in memory or in database)                            | ❌ No                                                                                             |
| Can revoke?            | ✅ Yes                                                             | ❌ Not easily                                                                                     |
| Scalable?              | ❌ Needs sticky sessions or shared storage                         | ✅ Easily, because nothing is being stored. All it is doing is validating the token info.         |
| Cookie-based?          | ✅ Usually                                                         | Optional                                                                                         |
| performance            | ❌  low performance since you need to validate requests against DB | ✅  High performance, since only operations are creating token and validating token - no storage. |
| Storage requirements   | ❌ Needs to store user credentials AND session data                | ✅  Only needs to store user credentials to authenticate against.                                 |


![](https://i.imgur.com/tk0nSrA.jpeg)

JWT is not recommended for auth because there are more downsides than upsides. To make effective JWTs, you need to implement access tokens and refresh tokens because you cannot revoke the session at all. This also makes JWTs less secure by default if not implemented correctly. The only advantage JWTs have are speed of checking auth status, but that can be easily overcome by using something like redis.
#### session auth


![](https://i.imgur.com/xoLEh9i.jpeg)


1. Client logins with email and password or other credentials, which sends POST request with user credentials to the server
2. If the server accepts the login info as valid, it creates a session which contains a session id, user info, and expiration time, stores the session in a database or in memory.
3. The server can create a cookie on the client which contains the session ID, or the client can also receive the session ID straight up from the server and store it client side in web storage or in a cookie.
4. The client sends the session ID each time to the server every time it makes the request, either manually through headers or request body or implicitly using cookies.
5. The server validates the session ID against the database, and returns the stored session if it exists. If the stored session does not exist, then the user is unauthorized.

Here is another diagram that illustrates this flow:

![](https://i.imgur.com/DG1033N.png)


##### Cookies

If cookies are enabled on the client, we can create cookies on the server and have the browser automatically send those cookies on every request.

1. Client logs in to server on `POST /login`, server processes request
2. The client gets a `Set-Cookie: connect.sid=<session-id-her>` header, which your server should send.
3. The browser sends the cookie on every request it makes to the server.

##### Storing sessions in database

When scaling up, it becomes infeasible to store sessions in server memory. Rather, what we should do is store it one some caching key-value store like Redis, which has built-ins to automatically expire values, which is great for a session use-case.

Here is the flow of creating a session, storing it in the database, and sending the session ID back to the user so they can authenticate themselves automatically on future requests:

1. Create a random session ID.
2. From a user object fetched from DB, create a session object whose ID is the random session ID, and stored that user data. Here is what to store:
	- **user id**
	- **user role**, like admin, normal person, etc.
3. Store session object in redis cache, expire after set amount of time.
4. Set secure, HTTP-only, same-site lax, cookie with key `"session-id"`, and the value being the session ID you created.

**creating the redis client**

```ts
import { Redis } from "@upstash/redis"

export const redisClient = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})
```

**basic global session config**

```ts
export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean
      httpOnly?: boolean
      sameSite?: "strict" | "lax"
      expires?: number
    }
  ) => void
  get: (key: string) => { name: string; value: string } | undefined
  delete: (key: string) => void
}

// Seven days in seconds
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = "session-id"

const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
})

type UserSession = z.infer<typeof sessionSchema>
```

**creating the user and setting the cookie**

```ts


export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, "set">
) {
  const sessionId = crypto.randomBytes(512).toString("hex").normalize()
  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  })

  setCookie(sessionId, cookies)
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  })
}
```

After you complete all these steps, the user verifies themselves by having the browser automatically send the cookie on every request, the server parses the cookie and gets the session ID, validates against the redis cache that the session ID exists and has not expired, and gets the session object that lives in the cache. Then the user is authenticated with that info.


**getting the user**

```ts
export function getUserFromSession(cookies: Pick<Cookies, "get">) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (sessionId == null) return null

  return getUserSessionById(sessionId)
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`)

  const { success, data: user } = sessionSchema.safeParse(rawUser)

  return success ? user : null
}
```

**updating the session**

```ts
export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (sessionId == null) return null

  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  })
}

export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (sessionId == null) return null

  const user = await getUserSessionById(sessionId)
  if (user == null) return

  await redisClient.set(`session:${sessionId}`, user, {
    ex: SESSION_EXPIRATION_SECONDS,
  })
  setCookie(sessionId, cookies)
}
```

**logging out the user**

To log out the user, you simply just delete the cookie, and then delete the session from the redis cache.

```ts
export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value
  if (sessionId == null) return null

  await redisClient.del(`session:${sessionId}`)
  cookies.delete(COOKIE_SESSION_KEY)
}
```

**creating route guards**

This is a useful utility for getting just the user session, the user from the DB, all while acting as a route guard.

```ts
import { cookies } from "next/headers"
import { getUserFromSession } from "../core/session"
import { cache } from "react"
import { redirect } from "next/navigation"
import { db } from "@/drizzle/db"
import { eq } from "drizzle-orm"
import { UserTable } from "@/drizzle/schema"

type FullUser = Exclude<
  Awaited<ReturnType<typeof getUserFromDb>>,
  undefined | null
>

type User = Exclude<
  Awaited<ReturnType<typeof getUserFromSession>>,
  undefined | null
>

function _getCurrentUser(options: {
  withFullUser: true
  redirectIfNotFound: true
}): Promise<FullUser>
function _getCurrentUser(options: {
  withFullUser: true
  redirectIfNotFound?: false
}): Promise<FullUser | null>
function _getCurrentUser(options: {
  withFullUser?: false
  redirectIfNotFound: true
}): Promise<User>
function _getCurrentUser(options?: {
  withFullUser?: false
  redirectIfNotFound?: false
}): Promise<User | null>
async function _getCurrentUser({
  withFullUser = false,
  redirectIfNotFound = false,
} = {}) {
  const user = await getUserFromSession(await cookies())

  if (user == null) {
    if (redirectIfNotFound) return redirect("/sign-in")
    return null
  }

  if (withFullUser) {
    const fullUser = await getUserFromDb(user.id)
    // This should never happen
    if (fullUser == null) throw new Error("User not found in database")
    return fullUser
  }

  return user
}

export const getCurrentUser = cache(_getCurrentUser)

function getUserFromDb(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true, email: true, role: true, name: true },
    where: eq(UserTable.id, id),
  })
}
```

##### Logging out

WHen the user wants to log out, he requests the logout endpoint against the server, passing his session ID, and then the server will delete the corresponding session from the database

```ts
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error');
    res.clearCookie('connect.sid');
    res.send("Logged out");
  });
});

```

##### Complete example

Here's a complete example in express:

```ts
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Setup session middleware
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // should be true in production with HTTPS
}));

// Simulated user database
const users = [
  { id: 1, username: 'alice', passwordHash: bcrypt.hashSync('secret', 10) }
];

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).send('Unauthorized');
  }

  req.session.userId = user.id;
  res.send("Logged in");
});

// Protected Route
app.get('/new-post', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  res.send("Here you go!");
});

// Logout Route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.clearCookie('connect.sid');
    res.send('Logged out');
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));

```

#### Basic auth

![](https://i.imgur.com/CiGsltx.jpeg)

Basic auth is a form of stateless auth that sends user login credentials as a base64 encoded request header. 

1. To access protected routes, client sends requests to server with authorization header set to base64 encoded version of `<email>:<password>` type of syntax.
2. Server checks credentials and validates against database, either returning a 200 OK authorized response or an unauthorized response.
3. If the user requests the endpoint without basic auth header, then the server sends back an unauthorized response with these special headers to prompt the browser for the suer to enter their credentials:

```bash
WWW-Authenticate: 'Basic realm="My app name"'
```


> [!NOTE]
> You see why it's now called basic Auth. This is extremely insecure since anyone can decode it, so make sure to use https.

##### **authorization in depth**

Here is the authorization process in depth. First, the header the client sends will be the `Authorization` header in this form:  `Basic <encoded-credentials>`

```
Authorization: Basic <base64(username:password)>
```

Here is some ts code that manually shows how to do it:

1. Put username and password in a string in format of `<username>:<password>`
2. Encode the string to base 64
3. Prepend the string with `"Basic "`, (yes, space-separated), and use that as the value for the Auth header.

```ts
function getBasicAuthHeader(username: string, password: string) {
  const auth = `${username}:${password}`;
  const base64 = btoa(auth);
  return new Headers({
    Authorization: `Basic ${base64}`,
  });
}

console.log(getBasicAuthHeader("admin", "password"));
```

##### Handling unauthorized

The special thing about basic auth is that if the authorization header is not sent, then a browser alert will pop up prompting the user to enter their credentials, in which if they enter the credentials correctly, they get authorized. 

To enable this prompt behavior, you have to send back special response headers when the authorization header is missing from the request:

```bash
WWW-Authenticate: 'Basic realm="My app name"'
```

Here's the example in express:

```ts
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).send('Authentication required.');
  }
```

##### Full example

```ts
const express = require('express');
const app = express();
const port = 3000;

// Simulated user database
const users = {
  alice: 'secret123',
  bob: 'hunter2'
};

// Middleware to check Basic Auth
function basicAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).send('Authentication required.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  if (users[username] && users[username] === password) {
    req.user = username;
    return next();
  }

  return res.status(401).send('Invalid credentials');
}

// Protected route
app.get('/protected', basicAuth, (req, res) => {
  res.send(`Hello ${req.user}, you are authenticated!`);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

```

#### Token Based Auth


![](https://i.imgur.com/xAjKaQa.jpeg)

Token based auth is the primary form of stateless authentication and has many derivatives, including SWT, JWT, and OAuth. It truly is the industry standard.

Here's how stateless authentication with tokens works

1. A user attempts to log in.
2. The server verifies the username and password and generates an authentication token.
3. The server sends the authentication token to the client.
4. Each subsequent request includes the authentication token or an alternative identifier (e.g., a JWT).
5. The server verifies the token and grants access based on its contents. (e.g., user credentials have match in database, token has not yet expired).
![](https://i.imgur.com/N7pzq28.jpeg)

#### JWT auth


![](https://i.imgur.com/Mmd32cY.jpeg)


JWT auth is a form of token auth, and thus stateless auth. A JSON web token is a secret string encrypted on the server that holds all the auth info of a user (email, password, and name) and metadata about the token, like when it should expire. Here is the basic workflow of using JWT:

1. The client sends the JWT it receives from the server on every request
2. The server decrypts the JWT with a secret key, parses its payload for user auth, and validates if the token is still valid against the token metadata.


This simplified diagram shows how it works at a high level. You don't have to worry about the low level because JWT libraries handle all the creation and validation of the token.

![](https://i.imgur.com/em9iXf3.png)

![](https://i.imgur.com/LafWtcD.png)

#### SSO


![](https://i.imgur.com/wEjmsqC.jpeg)

### OAuth

OAuth is a three step process involving making requests to three endpoints the provider exposes, and since this flow is a standard, you can replicate this flow and abstract it away for any number of providers, the only things changing being the actual URL provider endpoints to request and the user data being returned.

Here are the three URL types you need during OAuth, each representing a step in the OAuth flow.

- `/authorize`: this endpoint type involves redirecting the user to the provider's authorize endpoint.
- `/token`: this endpoint type involves making a request to it and then getting an access token from the provider
- `/profile`: this endpoint type involves sending the access token along with it to a fetch request to get back the user info.

The OAuth flow is as follows:

1. User clicks to sign in with a provider like google
2. We build an OAuth redirect URL based off an `/authorize` type endpoint with specific info, like the client ID and secret, and any scopes we want.
3. We redirect the user to the OAuth redirect URL we created, and they will sign in with the provider
4. Once signed in to the provider, the provider will redirect the user to a specific callback page in our app that we registered and send back a **code**
5. We use the code to request an **access token** from the provider, and we use the access token via API request to get the user info from the provider.
6. We store user info in the DB and authenticate against it.

#### OAuth request

**step 1: make an OAuth request**

In this step, we craft a URL which links to the OAuth provider's page, which is a `/authorize` endpoint.

Here are the query parameters you send along when fetching an OAuth request url:

- `client_id`: the client ID you set up with the provider.
- `client_secret`: the client secret you set up with the provider.
- `response_type="code"`: specifies you want to receive an OAuth code back
- `redirect_uri`: your application URL to redirect to after successful authentication with the provider.
- `scope`: a space separated list of the information scopes you want from the user, like `identify`  to get the user id, and `email` to get the emial 

You also have these optional params that help with OAuth security, explained later:

- `state`: a random string that helps prevent CSRF attacks, optional. We send the random string to the OAuth provider, and the OAuth provider sends back the state. If both strings are equal, then the session is secure. Else, it was tampered with.

We then redirect the user to this URL, they will authenticate, and then get redirected back to our redirect URI, with a special `code=` query parameter tacked on the end, which is our response code.

Here are the query params that will be returned:

- `code=`: the OAuth code
- `state=`: only returned if we previously gave state.

**step 2: get the access token**

From an OAuth code (the one we got from the redirect URI), we can perform a fetch request to the `/token` endpoint.

Here are the query parameters you send along:

- `client_id`: the client ID you set up with the provider.
- `client_secret`: the client secret you set up with the provider.
- `redirect_uri`: your application URL to redirect to after successful authentication with the provider.
- `code`: the OAuth code
- `grant_type="authorization_code"`: Says we want an access token back.

A fetch request to this URL returns JSON with these two properties:

- `access_token`: the access token you can use to fetch user info
- `token_type`: the toklen type, like a bearer token
- `expires_in`: the time in seconds from now when it will expire.
- `refresh_token`: the refresh token
- `scope`: the scopes you requested in the `/authorize` step.

**step 3: fetching user info**

Now using the access token and specific token type, you'll pass that as an `Authorization` header to some `/userinfo` or `/profile` route to get the specific user info back.

```ts
export async function getGitHubProfile(
  accessToken: string,
  tokenType: "Bearer" | "Basic" = "Bearer"
) {
  const response = await fetch("https://api.github.com/user", {
    headers: { authorization: `${tokenType} ${accessToken}` },
  });

  if (!response.ok) {
    response.body?.cancel();
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json() as Promise<GitHubUser>;
}

interface GitHubUser {
  id: number;
  name: string | null;
  login: string;
  email: string;
}

export async function getGoogleProfile(
  accessToken: string,
  tokenType: "Bearer" | "Basic" = "Bearer"
) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { authorization: `${tokenType} ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google user");
  }
  return response.json() as Promise<GoogleUser>;
}

export interface GoogleUser {
  id: string;
  name: string;
  picture: string;
  email: string;
}
```

#### Using OAuth state

A **state** is just a random string used for authentication and verification purposes, providing extra OAuth security.

We send the random string as the `state=` query param to the OAuth provider, and the OAuth provider sends back the state. If both strings are equal, then the session is secure. Else, it was tampered with.

To set state and validate it, we store it in cookies with a short expiration time, (the amount of time it would reasonably take for someone to login). Then when trying to validate the state string that the provider sends back after redirection as the `state=` query param, we look to cookies and see if the value has expired, or been tampered with or not.

All in all, the flow is as follows:

1. Before signing in to a `/authorize` provider route, create a state and save it to a cookie
2. Pass the `state=` query param, setting it to the state, when requesting the `/authorize` provider route.
3. After the user gets redirected after successfully authenticating, parse the `state=` query param the provider appends to the redirect URI. 
4. Validate the `state=` query param against the cookie, and if they are not equal or the cookie expired, then reject the user authentication session.

```ts
import { cookies } from "next/headers";
import crypto from "node:crypto";

export async function createState() {
  const state = crypto.randomBytes(64).toString("hex").normalize();
  const cookieStore = await cookies();
  cookieStore.set("state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax", // so our cookies can be accessed by our provider.
  });
  return state;
}

export async function validateState(state: string) {
  const cookieStore = await cookies();
  const storedState = cookieStore.get("state");
  if (!storedState) {
    throw new Error("State not found");
  }
  return storedState.value === state;
}
```

#### Code challenge verification

Code challenge verification is the exact same concept as OAuth state verification except the OAuth provider handles storing the random string and verifying it on their end. 

Here are the necessary query params to send along to the `/authorize` endpoint when performing code challenge verification.

- `code_challenge_method="S256"`: lets the provider know which hashing algorithm you are using to hash the random string. In this case, sha256.
- `code_challenge`: the random hashed string to send to the provider, converted to a base64 url string. You should hash it with the same algorithm you specified in the `code_challenge_method` query param.

```ts
function createCodeVerifier(
  cookies: Cookies,
  options?: {
    maxAgeInSeconds?: number;
  }
) {
  const codeVerifier = crypto.randomBytes(64).toString("hex").normalize();
  cookies.set("code_verifier", codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: options?.maxAgeInSeconds ?? 60 * 10, // 10 minutes
  });
  return codeVerifier;
}

function getCodeVerifier(cookies: Cookies) {
  const codeVerifier = cookies.get("code_verifier")?.value;
  if (codeVerifier == null) throw new Error("Code verifier not found");
  return codeVerifier;
}
```


#### Complete OAuth flow

1. When user tries to sign in through email, check if they have a registered OAuth type (meaning they signed in through OAuth with the same email). If so, deny access.
2. When user tries to sign in or sign up through OAuth, check if the user already exists, and if they do, if they have a password. If they do have a password, then don't let them sign up through OAuth - they already have an account, so deny access.

Here is the complete way of doing it:

```ts
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { z } from "zod";

export interface GoogleUser {
  id: string;
  name: string;
  picture: string;
  email: string;
}

function createState(
  cookies: Cookies,
  options?: {
    maxAgeInSeconds?: number;
  }
) {
  const state = crypto.randomBytes(64).toString("hex").normalize();
  cookies.set("state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: options?.maxAgeInSeconds ?? 60 * 10, // 10 minutes
    sameSite: "lax",
  });
  return state;
}

function validateState(cookies: Cookies, state: string) {
  const storedState = cookies.get("state");
  if (!storedState) {
    throw new Error("State not found");
  }
  return storedState.value === state;
}

function createCodeVerifier(
  cookies: Cookies,
  options?: {
    maxAgeInSeconds?: number;
  }
) {
  const codeVerifier = crypto.randomBytes(64).toString("hex").normalize();
  cookies.set("code_verifier", codeVerifier, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: options?.maxAgeInSeconds ?? 60 * 10, // 10 minutes
  });
  return codeVerifier;
}

function getCodeVerifier(cookies: Cookies) {
  const codeVerifier = cookies.get("code_verifier")?.value;
  if (codeVerifier == null) throw new Error("Code verifier not found");
  return codeVerifier;
}

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

export async function getCookies(): Promise<Cookies> {
  const cookieStore = await cookies();
  return {
    set: (key, value, options) => {
      cookieStore.set(key, value, options);
    },
    get: (key) => cookieStore.get(key),
    delete: (key) => cookieStore.delete(key),
  };
}

interface Provider {
  type: "github" | "google";
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUrl: string;
  urls: {
    auth: string;
    token: string;
    user: string;
  };
}

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export abstract class OAuthProvider<T, RawData = any> implements Provider {
  protected readonly userInfo: {
    schema: z.ZodSchema<T>;
    parser: (data: T) => { id: string; email: string; name: string };
  };

  constructor(userInfo: {
    schema: z.ZodSchema<T>;
    parser: (data: T) => { id: string; email: string; name: string };
  }) {
    this.userInfo = userInfo;
  }

  parse(data: RawData) {
    const {
      data: parsedData,
      success,
      error,
    } = this.userInfo.schema.safeParse(data);
    if (!success) throw new Error(error.message);
    return parsedData;
  }

  getParser() {
    return this.userInfo.parser;
  }

  abstract type: "github" | "google";
  abstract clientId: string;
  abstract clientSecret: string;
  abstract scopes: string[];
  abstract urls: {
    auth: string;
    token: string;
    user: string;
  };
  abstract redirectUrl: string;
}

export class OAuthClient<T> {
  private readonly provider: OAuthProvider<T>;
  private readonly cookies: Cookies;
  constructor({
    provider,
    cookies,
  }: {
    provider: OAuthProvider<T>;
    cookies: Cookies;
  }) {
    this.provider = provider;
    this.cookies = cookies;
  }

  createBasicAuthUrl() {
    const url = new URL(this.provider.urls.auth);
    url.searchParams.set("client_id", this.provider.clientId);
    url.searchParams.set("redirect_uri", this.provider.redirectUrl.toString());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.provider.scopes.join(" "));
    return url.toString();
  }

  createSecureAuthUrl(
    cookies: Cookies,
    options?: {
      state: {
        maxAgeInSeconds?: number;
      };
      codeVerifier: {
        maxAgeInSeconds?: number;
      };
    }
  ) {
    const state = createState(cookies, options?.state);
    const codeVerifier = createCodeVerifier(cookies, options?.codeVerifier);
    const url = new URL(this.provider.urls.auth);
    url.searchParams.set("client_id", this.provider.clientId);
    url.searchParams.set("redirect_uri", this.provider.redirectUrl.toString());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.provider.scopes.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set(
      "code_challenge",
      crypto.hash("sha256", codeVerifier, "base64url")
    );
    return url.toString();
  }

  async fetchUserWithSecurity(
    code: string,
    securityOptions?: {
      cookies?: Cookies;
      state?: string;
      useCodeVerifier?: boolean;
    }
  ) {
    if (securityOptions?.cookies && securityOptions?.state) {
      const isValidState = validateState(
        securityOptions.cookies,
        securityOptions.state
      );
      if (!isValidState) throw new Error("Invalid state");
    }

    const { accessToken, tokenType } = await this.fetchToken(
      code,
      securityOptions?.useCodeVerifier && securityOptions.cookies
        ? getCodeVerifier(securityOptions.cookies)
        : undefined
    );

    const user = await fetch(this.provider.urls.user, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((rawData) => {
        return this.provider.parse(rawData);
      });

    return this.provider.getParser()(user);
  }

  async fetchUser(code: string) {
    const { accessToken, tokenType } = await this.fetchToken(code);
    const response = await fetch(this.provider.urls.user, {
      headers: { Authorization: `${tokenType} ${accessToken}` },
    });
    const rawData = await response.json();
    console.log("raw user data", rawData);
    const user = this.provider.parse(rawData);
    return this.provider.getParser()(user);
  }

  private async fetchToken(code: string, codeVerifier?: string) {
    const searchParams = new URLSearchParams({
      code,
      redirect_uri: this.provider.redirectUrl.toString(),
      grant_type: "authorization_code",
      client_id: this.provider.clientId,
      client_secret: this.provider.clientSecret,
    });
    if (codeVerifier) {
      searchParams.set("code_verifier", codeVerifier);
    }
    return await fetch(this.provider.urls.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: searchParams,
    })
      .then((res) => res.json())
      .then((rawData) => {
        const { data, success, error } = tokenSchema.safeParse(rawData);
        if (!success) throw new Error(error.message);

        return {
          accessToken: data.access_token,
          tokenType: data.token_type,
        };
      });
  }
}

interface GitHubUser {
  id: number;
  name: string | null;
  login: string;
  email: string;
}

interface RawGithubData {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
  name: string;
  email: string;
}

export class GitHubOAuthProvider extends OAuthProvider<
  GitHubUser,
  RawGithubData
> {
  readonly type = "github";
  urls: { auth: string; token: string; user: string } = {
    auth: "https://github.com/login/oauth/authorize",
    token: "https://github.com/login/oauth/access_token",
    user: "https://api.github.com/user",
  };
  scopes = ["user:email", "read:user"];
  redirectUrl: string;
  clientId: string;
  clientSecret: string;

  constructor({
    clientId,
    clientSecret,
    redirectUrl,
    additionalScopes,
  }: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    additionalScopes?: string[];
  }) {
    const userInfo = {
      schema: z.object({
        id: z.number(),
        name: z.string().nullable(),
        login: z.string(),
        email: z.string().email(),
      }),
      parser: (user: GitHubUser) => ({
        id: user.id.toString(),
        name: user.name ?? user.login,
        email: user.email,
      }),
    };
    super(userInfo);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
    this.scopes = [...this.scopes, ...(additionalScopes ?? [])];
  }
}

export class GoogleOAuthProvider extends OAuthProvider<GoogleUser> {
  readonly type = "google";
  urls: { auth: string; token: string; user: string } = {
    auth: "https://accounts.google.com/o/oauth2/auth",
    token: "https://oauth2.googleapis.com/token",
    user: "https://www.googleapis.com/oauth2/v2/userinfo",
  };
  scopes = ["profile", "email"];
  redirectUrl: string;
  clientId: string;
  clientSecret: string;

  constructor({
    clientId,
    clientSecret,
    redirectUrl,
    additionalScopes,
  }: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
    additionalScopes?: string[];
  }) {
    const userInfo = {
      schema: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
        picture: z.string(),
      }),
      parser: (user: GoogleUser) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }),
    };
    super(userInfo);
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
    this.scopes = [...this.scopes, ...(additionalScopes ?? [])];
  }
}
```

#### GIthub OAuth

To register for a github OAuth application and enable it in your app, follow these steps:

1. Go to github developer settings -> OAuth apps.
2. Enter these settings, and DO NOT enable device flow if you have a server. Device flow is only for clients.


![](https://i.imgur.com/fHSQf9D.jpeg)

**Step 1: signing in**

```ts
import "server-only";
import { cookies } from "next/headers";
import { getCookies, GitHubOAuthProvider, OAuthClient } from "./OAuth";

function validateEnv(envKey: string) {
  const env = process.env[envKey];
  if (!env) throw new Error(`Environment variable ${envKey} is not set`);
  return env;
}

const GITHUB_OAUTH_CLIENT_ID = validateEnv("GITHUB_OAUTH_CLIENT_ID");
const GITHUB_OAUTH_CLIENT_SECRET = validateEnv("GITHUB_OAUTH_CLIENT_SECRET");
const GITHUB_OAUTH_REDIRECT_URI = validateEnv("GITHUB_OAUTH_REDIRECT_URI");

const githubOAuthProvider = new GitHubOAuthProvider({
  clientId: GITHUB_OAUTH_CLIENT_ID,
  clientSecret: GITHUB_OAUTH_CLIENT_SECRET,
  redirectUrl: GITHUB_OAUTH_REDIRECT_URI,
});

export async function getGithubOAuthClient() {
  const githubOAuthClient = new OAuthClient({
    provider: githubOAuthProvider,
    cookies: await getCookies(),
  });
  return githubOAuthClient;
}
```

Then here is the server action you use:

```ts
"use server";

import { getGithubOAuthClient } from "@/services/oauthinit";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const githubOAuthClient = await getGithubOAuthClient();
  const url = githubOAuthClient.createBasicAuthUrl();
  redirect(url);
}
```

```ts
"use client";

import { signInWithGithub } from "@/actions/authActions";
import React from "react";

const GithubButton = () => {
  return (
    <button
      type="button"
      onClick={async () => {
        await signInWithGithub();
      }}
      className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
          clipRule="evenodd"
        />
      </svg>
      Continue with GitHub
    </button>
  );
};

export default GithubButton;
```
### Handling permissions

To handle permissions, we can go down the route of role-based access control, like so:

```ts
export type User = { roles: Role[]; id: string }

type Role = keyof typeof ROLES
type Permission = (typeof ROLES)[Role][number]

const ROLES = {
  admin: [
    "view:comments",
    "create:comments",
    "update:comments",
    "delete:comments",
  ],
  moderator: ["view:comments", "create:comments", "delete:comments"],
  user: ["view:comments", "create:comments"],
} as const

export function hasPermission(user: User, permission: Permission) {
  return user.roles.some(role =>
    (ROLES[role] as readonly Permission[]).includes(permission)
  )
}

// USAGE:
const user: User = { id: "1", roles: ["user"] }

// Can create a comment
hasPermission(user, "create:comments")

// Can view all comments
hasPermission(user, "view:comments")
```

## Caching

### browser caching

When you visit a website, your web browser downloads various resources: HTML files, CSS stylesheets, JavaScript files, images, fonts, and more. 

**Browser caching** is a mechanism where the browser stores copies of these resources on the user's local machine (their hard drive or memory). The next time the user visits the same website (or a different page on the same site that uses the same resources), the browser can retrieve some or all of these resources from its local cache instead of requesting them again from the web server.

This process significantly speeds up page load times, reduces server load, and conserves bandwidth for both the user and the server.

Here is how the process works:

1. **first request**: browser requests resources from servers, and depending on cache control headers the server sends down, controls the caching behavior of those resources. Key headers the server sends down include `Cache-Control`, `Expires`, `ETag`, and `Last-Modified`
2. **Cache Hit:** If the resource is found in the cache and the caching instructions indicate that the cached copy is still valid (e.g., the `Cache-Control` max-age has not expired), the browser uses the cached copy directly. This is known as a "cache hit." The resource is loaded from the local cache, avoiding a network request to the server.
3. **Cache Miss:** If the resource is not found in the cache, or if the caching instructions indicate that the cached copy is no longer valid (e.g., the `Cache-Control` max-age has expired), the browser sends a new request to the server. This is known as a "cache miss." The server responds with the resource (potentially with new caching headers), and the browser updates its cache.
4. **Conditional Requests:** Even if a resource's cache has expired, the browser can make a _conditional request_ to the server using the `ETag` or `Last-Modified` headers. The browser sends the `ETag` or `Last-Modified` value it has stored in the `If-None-Match` or `If-Modified-Since` request headers, respectively. If the resource hasn't changed since the last time the browser requested it, the server can respond with an HTTP 304 Not Modified status code, indicating that the browser can use its cached copy. This saves bandwidth because the server doesn't need to send the entire resource again.

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

| Type of data                          | Directives to use     | Example                                                                       |
| ------------------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| user-specific, frequently changing    | `private`, `no-cache` | - `Cache-Control: no-cache, must-revalidate`<br>- `ETag: "unique-etag-value"` |
| static files, public, rarely changing | `public`, `max-age=`  | `Cache-Control: public, max-age=31536000`                                     |
| sensitive data like API keys          | `no-store`            | `Cache-Control: no-store`                                                     |



In express, using the `express.static()` middleware, you can control the caching behavior of statically served assets like so:

```ts
const express = require('express');
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public', {
  maxAge: '31536000', // Cache static assets for one year
  immutable: true, // Indicate that versioned assets are immutable
}));

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

Here is an express app example using this header:

```ts
import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

// Serve static files with caching headers
// This is typical for assets like CSS, JS, images, fonts
app.use('/static', express.static(path.join(__dirname, 'public'), {
  // Set Cache-Control for static assets
  // Here, we're saying assets can be cached by public caches (including browser)
  // for 1 year (31,536,000 seconds). After that, they should be revalidated.
  // This is common for assets with versioned filenames (e.g., app.v1.0.0.js)
  // or that rarely change.
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css') || path.endsWith('.js') || path.endsWith('.png')) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      // The 'immutable' directive, if supported by the browser, means the
      // cached response will not change, even if the user reloads the page.
      // Useful for versioned assets.
    } else {
      // For other static files (e.g., HTML if served statically)
      // We might want a shorter cache, or no-cache with revalidation
      res.set('Cache-Control', 'no-cache'); // Always revalidate, but can use cache
    }
  },
}));

// Example for an API endpoint that serves dynamic data
// This data changes frequently, so we don't want to cache it aggressively
app.get('/api/data', (req, res) => {
  // Simulate fetching dynamic data
  const dynamicData = {
    message: 'This data changes frequently!',
    timestamp: new Date().toISOString(),
    randomNumber: Math.random(),
  };

  // For dynamic content that changes frequently,
  // we might use no-cache or no-store, or a very short max-age.
  // 'no-cache' forces revalidation with the server.
  res.set('Cache-Control', 'no-cache, private'); // Private to this user, always revalidate
  // Or if it's very sensitive and should never be cached:
  // res.set('Cache-Control', 'no-store, private');
  res.json(dynamicData);
});

// Example for an HTML page (often rendered dynamically, but for static page)
app.get('/', (req, res) => {
  // HTML pages typically benefit from no-cache (always revalidate)
  // or a very short max-age, as they are the entry point and
  // their content (links to assets) might change.
  res.set('Cache-Control', 'no-cache, public');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

_Example (Server Response):_ `Last-Modified: Tue, 15 Nov 2022 12:45:26 GMT`

_Example (Browser Request):_ `If-Modified-Since: Tue, 15 Nov 2022 12:45:26 GMT`


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

  constructor(defaultTtlMs: number = 5 * 60 * 1000) { // Default to 5 minutes
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
      return value
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
    console.log('Cache: Cleared all entries.');
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
  private startCleanup(intervalMs: number = 60 * 1000): void { // Run every minute
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
      console.log('Cache: Stopped automatic cleanup.');
    }
  }
}

export default InMemoryCache;
```

Here is an example using this in-memory cache:

```ts
// src/app.ts
import express from 'express';
import InMemoryCache from './cache/InMemoryCache';
import axios from 'axios'; // For making external API calls
import rateLimit from 'express-rate-limit'; // Good practice with APIs

const app = express();
const port = 3000;

// Initialize cache with a default TTL of 1 minute (60,000 ms)
const apiCache = new InMemoryCache(60 * 1000);

// Basic rate limiting to protect the external API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});


// Middleware for caching API responses
app.get('/cached-posts', apiLimiter, async (req, res) => {
  const cacheKey = 'all_posts'; // A simple key for all posts

  // 1. Try to get data from cache
  const cachedPosts = apiCache.get<any[]>(cacheKey);
  if (cachedPosts) {
    console.log('Serving /cached-posts from cache');
    return res.status(200).json({ source: 'cache', data: cachedPosts });
  }

  // 2. If not in cache, fetch from external API
  console.log('Fetching /cached-posts from external API');
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const posts = response.data;

    // 3. Store in cache
    apiCache.set(cacheKey, posts); // Use default TTL (1 minute)

    console.log('Serving /cached-posts from external API and caching it');
    res.status(200).json({ source: 'external_api', data: posts });
  } catch (error: any) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// A non-cached endpoint for comparison
app.get('/uncached-posts', apiLimiter, async (req, res) => {
  console.log('Fetching /uncached-posts from external API (no cache)');
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const posts = response.data;
    res.status(200).json({ source: 'external_api_uncached', data: posts });
  } catch (error: any) {
    console.error('Error fetching uncached posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Cached posts endpoint: http://localhost:${port}/cached-posts`);
  console.log(`Uncached posts endpoint: http://localhost:${port}/uncached-posts`);
});

// Important: Handle graceful shutdown to stop cache cleanup interval
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  apiCache.stopCleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
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
import fs from 'fs/promises'; // Use promises-based fs
import path from 'path';

interface FileCacheEntry {
  expiryTime: number; // Unix timestamp in milliseconds
  // We don't store the value here; it's in the file itself
}

class FileCache {
  private cacheDir: string;
  private defaultTtl: number; // Default TTL in milliseconds

  constructor(cacheDir: string, defaultTtlMs: number = 5 * 60 * 1000) { // Default 5 mins
    this.cacheDir = cacheDir;
    this.defaultTtl = defaultTtlMs;
    // Ensure the cache directory exists
    fs.mkdir(this.cacheDir, { recursive: true }).catch(console.error);
  }

  private getCacheFilePath(key: string): string {
    // Simple way to get a safe filename from a key. In production,
    // you might hash the key to ensure valid and unique filenames.
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  private getMetaFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
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
      console.log(`FileCache: Set key "${key}" with TTL ${effectiveTtl / 1000}s`);
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
      const metaContent = await fs.readFile(metaFilePath, 'utf8');
      const meta: FileCacheEntry = JSON.parse(metaContent);

      if (Date.now() >= meta.expiryTime) {
        // Expired, delete both files and return null
        await this.delete(key);
        console.log(`FileCache: Miss for key "${key}" (expired)`);
        return null;
      }

      // If meta is valid, read the data file
      const fileContent = await fs.readFile(cacheFilePath, 'utf8');
      console.log(`FileCache: Hit for key "${key}"`);
      return JSON.parse(fileContent);

    } catch (error: any) {
      // If any file operation fails (e.g., file not found, JSON parse error)
      // or if it's an initial cache miss.
      if (error.code === 'ENOENT') { // File not found
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
      if (error.code !== 'ENOENT') { // Ignore "file not found" errors on delete
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
      console.log('FileCache: Cleared all entries.');
    } catch (error) {
      console.error('FileCache: Error clearing cache:', error);
    }
  }
}

export default FileCache;
```

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

It's important to distinguish between a CDN and a web hosting provider. A web host stores all of your website's files and serves them to users. A CDN, on the other hand, _caches_ specific content from your web host and distributes it across multiple servers. Think of your web host as the central library where all the books are stored, and the CDN as a network of smaller libraries that keep copies of the most popular books closer to readers.

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
    - You might specify specific paths to cache (e.g., /static/*).
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

**3. Updating Your Website's Code (TypeScript/Node.js Context):**This is where you tell your frontend to request assets from the CDN's domain.In your Node.js/Express app, instead of linking to /static/style.css, you'd link to https://static.yourdomain.com/style.css.**Example in a Templating Engine (like EJS or Pug) or JSX (React):**If your Node.js application is rendering HTML, you'd change your asset URLs:

```html
<!-- Before CDN -->
<link rel="stylesheet" href="/css/main.css">
<img src="/images/logo.png" alt="Logo">

<!-- After CDN (assuming your CDN is configured for static.yourdomain.com) -->
<link rel="stylesheet" href="https://static.yourdomain.com/css/main.css">
<img src="https://static.yourdomain.com/images/logo.png" alt="Logo">
```

**Dynamic CDN URL in TypeScript/Node.js:** You can make this dynamic using environment variables or configuration settings in your Node.js application.

```ts
// config.ts
export const config = {
  cdnBaseUrl: process.env.NODE_ENV === 'production'
    ? 'https://static.yourdomain.com'
    : '', // Or a local URL for dev
  // ... other configs
};

// In your Express app (assuming you're rendering templates or serving HTML)
import { config } from './config';

app.get('/', (req, res) => {
  // If using a templating engine like EJS
  res.render('index', {
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
    publicPath: 'https://static.yourdomain.com/',
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
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

> [!TIP]
> **Recommendation:** For most applications, **object caching is generally preferred over query caching** due to its simpler invalidation and more intuitive alignment with object-oriented application design. Query caching is best left to be handled by highly optimized, specific layers (like a CDN for API responses) rather than being manually implemented within your application's database access layer.


#### Query caching

- **Concept:** This involves caching the _results_ of specific database queries. When the exact same query is issued again, the cached result set is returned directly without hitting the database.
- **Where it occurs:**
    - **Within the database engine itself:** Some database systems (like older versions of MySQL) have a built-in query cache. However, many modern databases have removed or deprecated these (e.g., MySQL 8.0 removed its query cache) because they are notoriously difficult to invalidate effectively (a single row change can invalidate many cached queries).
    - **At the ORM/Application level:** You implement logic in your application to cache the results of specific queries (e.g., store the array of Post objects returned by SELECT * FROM posts WHERE status = 'published').
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
  protected cache: Map<string, T> = new Map()

  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: T): void {
    this.cache.set(key, value)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  values(): T[] {
    return Array.from(this.cache.values())
  }
}

export class ObjectCacher<T> extends Cacher<T> {
  async getCacheFirst(key: string, revalidate: () => Promise<T | null>): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = await revalidate()
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }

  async getWithRevalidate(key: string, revalidate: () => Promise<T | null>): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      const value = await revalidate()
      if (value) {
        this.set(key, value)
        return value
      }
      else {
        return cached
      }
    }
    const value = await revalidate()
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }
}

export class QueryCacher<T> extends Cacher<T> {
  constructor(private exec: (query: string) => Promise<T | null>) {
    super()
  }

  async getCacheFirst(key: string): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = await this.exec(key)
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }

  async getWithRevalidate(key: string): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      const value = await this.exec(key)
      if (value) {
        this.set(key, value)
        return value
      }
      else {
        return cached
      }
    }
    const value = await this.exec(key)
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }
}
```

#### Cache Invalidation Strategies for Databases

This is arguably the most challenging aspect of database caching: ensuring cached data is always fresh and consistent with the underlying database. A stale cache can lead to users seeing incorrect information, which is worse than no cache at all.Here are common strategies, many of which TypeORM attempts to handle for you, but it's important to understand them:

1. **Time-To-Live (TTL):**
    - **Concept:** Each cache entry is given a maximum lifespan. After this time expires, the entry is automatically removed or marked as stale. The next request will then fetch fresh data from the database.
    - **Pros:** Simplest to implement. Guarantees eventual consistency.
    - **Cons:** Data can be stale for the duration of the TTL. Not suitable for rapidly changing data or data that needs immediate consistency. This is what cache: { duration: ... } uses in TypeORM.
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
- **Use Cases:** Static assets (CSS, JS, images, fonts) served via browser cache or CDN.****

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

> [!NOTE]
> _Example:_
> ****
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
****

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
****
LFU evicts the least frequently used items from the cache. Unlike LRU, which considers recency, LFU focuses on the overall access frequency.


Each item in the cache maintains a counter that tracks how many times it has been accessed. When the cache is full, the item with the lowest access count is evicted.

*Advantages*

- **Prioritizes Frequently Used Items:** LFU ensures that the most frequently accessed items remain in the cache.

*Cons*

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

  constructor(defaultTtlMs: number = 5 * 60 * 1000) { // Default to 5 minutes
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
    console.log(`[Cache] Invalidated ${invalidatedCount} entries with prefix "${prefix}"`);
    return invalidatedCount;
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all entries.');
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
      console.log('[Cache] Stopped automatic cleanup.');
    }
  }
}

export default InMemoryCache;
```

#### Important Caching Metrics

- **Cache Hit Ratio:** This is the most important metric. It's the percentage of requests served directly from the cache (hits) versus those that had to go to the origin (misses).
    - Hit Ratio = (Cache Hits / (Cache Hits + Cache Misses)) * 100
    - A high hit ratio (e.g., 80-95% for static assets, 50-80% for dynamic content) indicates effective caching. A low ratio means your cache is not very useful.
- **Cache Size/Memory Usage:** How much memory or disk space is your cache consuming? Is it within acceptable limits?
- **Eviction Rate:** How often are items being evicted from the cache (due to TTL, LRU, etc.)? A very high eviction rate might indicate your cache is too small or TTLs are too short.
- **Network Latency (to Cache vs. Origin):** Compare the response times when data is served from the cache versus when it has to go to the database or external API.
- **Origin Load Reduction:** Monitor your database or external API's CPU, memory, and query rates. A successful cache should show a noticeable reduction in load on these upstream services.
- **Error Rates:** Are there errors related to cache operations (e.g., connection issues to Redis)?

In depth:

- **Cache Hit Rate:** This is the most fundamental metric. It represents the percentage of requests that are served directly from the cache, without needing to access the origin server or database. A high hit rate indicates that the cache is effectively serving content, reducing latency and load on backend systems.
    
    - _Example:_ If your website receives 1000 requests and 800 are served from the cache, your cache hit rate is 80%.
    - _Importance:_ A low hit rate suggests that your cache is not being utilized effectively, possibly due to aggressive invalidation, small cache size, or inappropriate caching strategies.
- **Cache Miss Rate:** This is the inverse of the cache hit rate. It represents the percentage of requests that result in a cache miss, requiring the system to fetch data from the origin server.
    
    - _Example:_ If your website receives 1000 requests and 200 result in a cache miss, your cache miss rate is 20%.
    - _Importance:_ A high miss rate can negate the benefits of caching, increasing latency and load on backend systems. Analyzing the reasons for cache misses is crucial for optimizing your caching strategy.
- **Cache Eviction Rate:** This metric indicates how frequently items are being removed from the cache to make room for new data. High eviction rates can suggest that your cache is too small or that your invalidation policy is too aggressive.
    
    - _Example:_ If your cache has a maximum capacity of 1000 items and evicts 100 items per hour, your eviction rate is 10% per hour (relative to the cache size).
    - _Importance:_ Monitoring eviction rates helps you understand if your cache size is appropriate for your workload and if your eviction policy (e.g., LRU, TTL) is effective.
- **Cache Latency:** This measures the time it takes to retrieve data from the cache. Low latency is essential for a good user experience.
    
    - _Example:_ The average time to retrieve data from the cache is 2 milliseconds.
    - _Importance:_ High cache latency can indicate performance bottlenecks within the caching system itself, such as slow storage media or inefficient data structures.
- **Cache Size/Capacity:** This refers to the total amount of storage available to the cache. Monitoring cache size helps you ensure that you have enough capacity to store frequently accessed data.
    
    - _Example:_ Your Redis cache is configured with a maximum memory limit of 10 GB.
    - _Importance:_ If the cache is constantly full, it can lead to high eviction rates and reduced hit rates.
- **Resource Utilization (CPU, Memory, Network):** Monitoring the resources consumed by the caching system itself is important for identifying performance bottlenecks and ensuring that the cache is not negatively impacting other parts of your infrastructure.
    
    - _Example:_ The Redis server is consistently using 80% of available CPU.
    - _Importance:_ High resource utilization can indicate that the caching system is overloaded and needs to be scaled up or optimized.

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

Instead of waiting for the TTL to expire, this approach proactively refreshes the cache _before_ it expires. Each time a request hits the cache, the system checks if the remaining TTL is below a certain threshold. If it is, the system _asynchronously_ regenerates the cache in the background while still serving the stale data to the user. This ensures that the cache is refreshed before it actually expires, reducing the likelihood of a stampede.

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

import path from 'node:path'
import { FileManager } from './CLI'

export const ttlMap = {
  n_seconds: (n: number) => 1000 * n,
  n_minutes: (n: number) => 1000 * 60 * n,
  n_hours: (n: number) => 1000 * 60 * 60 * n,
  n_days: (n: number) => 1000 * 60 * 60 * 24 * n,
  n_weeks: (n: number) => 1000 * 60 * 60 * 24 * 7 * n,
  n_months: (n: number) => 1000 * 60 * 60 * 24 * 30 * n,
  n_years: (n: number) => 1000 * 60 * 60 * 24 * 365 * n,
}

class Cacher<T> {
  protected cache: Map<string, T> = new Map()
  protected cacheWithTTL: Map<string, { value: T, expiresAt: Date }> = new Map()

  constructor(protected ttl: number = ttlMap.n_days(1)) {
  }

  setTTL(ttl: number): void {
    this.ttl = ttl
  }

  getWithTTL(key: string): T | undefined {
    const cached = this.cacheWithTTL.get(key)
    if (cached) {
      if (cached.expiresAt > new Date()) {
        return cached.value
      }
      else {
        this.cacheWithTTL.delete(key)
        return cached.value
      }
    }
    return undefined
  }

  setWithTTL(key: string, value: T, ttl: number): void {
    this.cacheWithTTL.set(key, { value, expiresAt: new Date(Date.now() + ttl) })
  }

  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: T): void {
    this.cache.set(key, value)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.cacheWithTTL.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  values(): T[] {
    return Array.from(this.cache.values())
  }

  valuesWithTTL(): { value: T, expiresAt: Date }[] {
    return Array.from(this.cacheWithTTL.values())
  }
}

/**
 * Map should be some arbitrary key to filepath.
 */
export class Base64FileCacher extends Cacher<string> {
  private cacheDirCreated = false
  private withTTL: boolean = false
  constructor(private cacheDir: string, ttl: number | undefined) {
    super(ttl)
    if (ttl) {
      this.withTTL = true
    }
  }

  private getCachePath(value: string): string {
    return path.join(this.cacheDir, value)
  }

  private async upsertCacheDirectory() {
    if (!this.cacheDirCreated) {
      await FileManager.createDirectory(this.cacheDir, { overwrite: false })
      this.cacheDirCreated = true
    }
  }

  private async getCacheFile(key: string, options?: { withTTL: boolean }): Promise<string | null> {
    await this.upsertCacheDirectory()
    const value = options?.withTTL ? this.getWithTTL(key) : this.get(key)
    if (!value) {
      return null
    }
    const cachePath = this.getCachePath(value)
    try {
      const content = await FileManager.readFileAsBase64(cachePath)
      if (!content) {
        return null
      }
      else {
        console.log(`Cache hit for ${key}`)
        return content
      }
    }
    catch (error) {
      console.error(`Error reading cache file ${cachePath}:`, error)
      return null
    }
  }

  private async writeCacheFile(key: string, base64String: string, options?: { withTTL: boolean }) {
    await this.upsertCacheDirectory()
    const filename = options?.withTTL ? this.getWithTTL(key) : this.get(key)
    if (!filename) {
      return
    }
    const cachePath = this.getCachePath(filename)
    await FileManager.createFileFromBase64(cachePath, base64String, { overwrite: true })
  }

  async getCacheFirst(key: string, options?: {
    getBase64Revalidate: () => Promise<{
      filename: string
      base64String: string
    } | null>
  }): Promise<string | null> {
    const cachedBase64 = await this.getCacheFile(key, { withTTL: this.withTTL })
    if (cachedBase64) {
      return cachedBase64
    }
    const data = await options?.getBase64Revalidate()
    if (!data) {
      return null
    }
    else {
      this.addFilenameToCache(key, data.filename)
      await this.writeCacheFile(key, data.base64String, { withTTL: this.withTTL })
      return data.base64String
    }
  }

  addFilenameToCache(key: string, filename: string) {
    if (this.withTTL) {
      this.setWithTTL(key, filename, this.ttl)
    }
    else {
      this.set(key, filename)
    }
  }
}

export class ObjectCacher<T> extends Cacher<T> {
  async getCacheFirst(key: string, revalidate: () => Promise<T | null>): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = await revalidate()
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }

  async getWithRevalidate(key: string, revalidate: () => Promise<T | null>): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      const value = await revalidate()
      if (value) {
        this.set(key, value)
        return value
      }
      else {
        return cached
      }
    }
    const value = await revalidate()
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }
}

export class QueryCacher<T> extends Cacher<T> {
  constructor(private exec: (query: string) => Promise<T | null>) {
    super()
  }

  async getCacheFirst(key: string): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      return cached
    }
    const value = await this.exec(key)
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }

  async getWithRevalidate(key: string): Promise<T | null> {
    const cached = this.get(key)
    if (cached) {
      const value = await this.exec(key)
      if (value) {
        this.set(key, value)
        return value
      }
      else {
        return cached
      }
    }
    const value = await this.exec(key)
    if (!value) {
      return null
    }
    else {
      this.set(key, value)
      return value
    }
  }
}

```

## Backend performance

### Code antipatterns

#### Memory leaks

Memory leaks typically arise from errors in code that manages memory allocation and deallocation. Here are some common scenarios:

- **Unreleased Objects:** Objects are created and allocated memory, but the program loses all references to them before freeing the memory. The garbage collector (in languages that have one) can't reclaim this memory because it still _thinks_ the object is in use.
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

> [!TIP]
> **Key Takeaway for Improper Instantiation:** Be mindful of where and when you create objects, especially within hot code paths (frequently called functions or loops). If an object is stateless, thread-safe, and expensive to create, use a singleton pattern or inject a single instance. If it's a simple temporary object that doesn't need to be recreated, consider if its allocation can be moved out of a loop or avoided altogether.

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
const users = await db.query('SELECT * FROM users');
const active = users.filter(u => u.active);
```

- **mistake 1**: will load potentially millions of records in memory if the `users` table is big.


**2) no caching**

Frequent, redundant queries slow down your app and your database. For data that doesn't change often and isn't dependent on any dynamic user data or request bodies, you can easily cache that.


```ts
// BAD: Always hits the database
app.get('/products/:id', async (req, res) => {
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
app.get('/config', (req, res) => {
  const config = fs.readFileSync('config.json', 'utf8'); // blocks event loop!
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

- **Inefficient Queries:** As we'll discuss, SELECT *, N+1 queries, missing indexes, complex joins without proper optimization.
- **Lack of Caching:** No application-level or database-level caching, forcing every read to hit the disk.
- **High Write Volume:** Too many concurrent write operations on critical tables without proper transaction management.
- **Schema Design Issues:** Non-normalized data, poor data types, lack of primary/foreign keys.
- **Improper Database Configuration:** Suboptimal memory allocation, cache sizes, or concurrency settings.
- **Lack of Archiving/Purging:** Databases grow excessively large with old, unused data, making queries slower.
- **Reporting Queries:** Running complex, analytical queries directly on the production OLTP (Online Transaction Processing) database.

####  Chatty I/O: Reducing Database Round Trips

**Concept:** "Chatty I/O" (or "Chatty Database Interactions") refers to an anti-pattern where an application makes an excessive number of small, inefficient requests to the database to retrieve or update data that could be fetched or manipulated in fewer, larger, and more efficient operations. This is also often referred to as the **"N+1 Query Problem"**.Each database request (round trip) incurs overhead: network latency, connection pool acquisition, query parsing, execution plan generation, and result set transfer. Accumulating many small round trips adds up quickly, severely impacting performance.**Why it's a problem:**

- **Increased Network Latency:** Even if individual queries are fast, the cumulative network delay of N round trips is significant.
- **Higher Database Load:** Each query consumes database resources (CPU for parsing, memory for execution context). N+1 queries multiply this load.
- **Increased Connection Pool Utilization:** Each request might hold a connection for longer, contributing to connection pool exhaustion.
- **Reduced Throughput:** The application spends more time waiting for the database rather than doing useful work.

**Common Manifestations (The N+1 Query Problem):**This is the quintessential example of Chatty I/O. It typically occurs when you fetch a list of "parent" entities, and then, for each parent, you execute a _separate query_ to fetch its related "child" entities.

- **Example 1: Fetching Users and Their Posts:**
    
    1. Query: SELECT * FROM users; (fetches 100 users)
    2. Loop through each user:
        - Query: SELECT * FROM posts WHERE userId = <user_id>; (100 separate queries)
    
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
    app.get('/posts-chatty', async (req, res) => {
      console.log('\n--- /posts-chatty: Demonstrating N+1 Query Anti-Pattern ---');
      try {
        // Step 1: Fetch all posts
        const posts = await postRepository.find(); // A single query: SELECT * FROM posts

        const results = [];
        // Step 2: For EACH post, fetch its author. This is the N+1 problem.
        for (const post of posts) {
          // This will trigger a separate SELECT for each author if not cached
          const author = await userRepository.findOne({ where: { id: post.author.id } }); // N queries: SELECT * FROM users WHERE id = X
          results.push({
            id: post.id,
            title: post.title,
            content: post.content,
            authorName: author ? author.name : 'Unknown',
          });
        }
        res.json(results);
      } catch (error: any) {
        console.error('Error in /posts-chatty:', error.message);
        res.status(500).json({ error: 'Failed to fetch posts (chatty)' });
      }
    });
```

And here is a mitigation: use batching to do a conditional query fetching multiple children records at a time based on an array of IDs.

```ts
    // --- Solution 2: Manual Batching (Less common with ORMs, but good for raw SQL or specific cases) ---
    app.get('/posts-batch', async (req, res) => {
      console.log('\n--- /posts-batch: Fixing N+1 with Manual Batching ---');
      try {
        const posts = await postRepository.find();
        if (posts.length === 0) {
          return res.json([]);
        }

        // Extract all unique author IDs
        const authorIds = [...new Set(posts.map(post => post.author.id))];

        // Fetch all authors in a single query using 'IN' clause
        const authors = await userRepository.findBy({
          id: In(authorIds) // Using TypeORM's In operator for WHERE IN (id1, id2, ...)
        });
        const authorMap = new Map(authors.map(author => [author.id, author]));

        const results = posts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          authorName: authorMap.get(post.author.id)?.name || 'Unknown',
        }));
        res.json(results);
      } catch (error: any) {
        console.error('Error in /posts-batch:', error.message);
        res.status(500).json({ error: 'Failed to fetch posts (batch)' });
      }
    });
```

#### `SELECT *` antipattern (fetching all columns)


The `SELECT *` antipattern is a common mistake in database querying that can significantly impact backend performance. It involves retrieving all columns from a table when only a subset of those columns is actually needed. This seemingly small inefficiency can lead to increased I/O, memory consumption, and network traffic, especially when dealing with large tables or complex queries. Understanding and avoiding this antipattern is crucial for building efficient and scalable web applications.

- **Problem:** Fetching all columns from a table (SELECT *) when you only need a few. This transfers more data over the network, consumes more memory, and potentially makes the database do more work.
- **Solution:** Always specify only the columns you need: SELECT id, name, email FROM users;.
- **TypeORM:** Use the select option in find or findOne:
    
    ```ts
    // GOOD: only fetch what we need
    const users = await userRepository.find({
      select: ['id', 'name', 'email'],
    })
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

- **Problem:** For large tables, queries like SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 100000; become incredibly slow because the database still has to scan and sort 100,000 records before returning the next 10.
- **Solution:** Use "keyset pagination" (also known as "cursor-based pagination"). Instead of an offset, use the WHERE clause based on the last fetched item's ID or timestamp: SELECT * FROM products WHERE id > <last_id> ORDER BY id LIMIT 10;. This uses indexes much more efficiently.

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

## Networking

### What is the internet?

The internet is just a network that lets devices communicate with other devices. It fully distributed and nobody owns the internet.

**packets**

When a client sends a request to a server or a server sends back a response to the client, the method of transporting that data is the same.

Data is broken up into small pieces called **packets**, sent across the network, and then reassembled on the receiving end.

Since there are many different connection paths for packets to travel from beginning to end, the network is **fault tolerant**, meaning there are always backup paths available.

TCP is a protocol that ensures that all packets arrive correctly to their destination - if there are any missing packets, it asks the server to resend those missing packets.

### HTTP

Here's a quick historical overview on the history of HTTP:

| Version  | Year  | Key Features                                        |
| -------- | ----- | --------------------------------------------------- |
| HTTP/0.9 | 1991  | Simple GET request, HTML only, no headers           |
| HTTP/1.0 | 1996  | Headers, media types, status codes                  |
| HTTP/1.1 | 1997  | Persistent connections, pipelining, caching         |
| HTTP/2   | 2015  | Binary framing, multiplexing, header compression    |
| HTTP/3   | 2022+ | Runs on QUIC (UDP), faster and connection-resilient |

#### HTTP 0.9 - 1991

The first documented version of HTTP was [HTTP/0.9](https://www.w3.org/Protocols/HTTP/AsImplemented.html) which was put forward in 1991. It was the simplest protocol ever; having a single method called GET.

This was the most basic connection ever. IN fact, here were the three main limitations:

- No headers
- `GET` was the only allowed method
- Response had to be HTML

#### HTTP/1.0 - 1996

HTTP 1 added response headers, the POST method, and also response body types. 

Here's an example of what an HTTP 1 request would have looked like:

```bash
GET / HTTP/1.0
Host: cs.fyi
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5)
Accept: */*
```

One of the major drawbacks of HTTP/1.0 were you couldn’t have multiple requests per connection, because HTTP 1 still had the behavior of HTTP 0.9 where after a response comes back from the server, the server closes the connection to the client.

This means if you request 20 assets from the server, it means you will have to do an HTTP handshake and connect to the server 20 times to get those 20 asseets.

> [!NOTE]
> A new TCP connection imposes a significant performance penalty because of three-way handshake followed by slow-start. This made serving several assets over HTTP 1 highly unperformant.

To get over this slow handshake issue, some implementations of HTTP/1.0 tried to overcome this issue by introducing a new header called Connection: keep-alive which was meant to tell the server “Hey server, do not close this connection, I need it again”. But still, it wasn’t that widely supported and the problem still persisted.

Also in the same realm of this drawback is the issue that comes from HTTP 1 being stateless - "stateful" data like cookies had to be sent over the wire each time, leading to redundant data transfers, which causes increased bandwidth usage.

To summarize, the main drawback that HTTP 1 and HTTP 0.9 had that will be solved later is the issue of having **only one response per server connection.**

> [!TIP]
> 🧠 **Analogy:** Like calling the kitchen every time you want one ingredient: “Hey, send me lettuce. Now bread. Now mustard…” — Each item comes via a new phone call (connection).

#### HTTP/1.1 - 1997

HTTP 1.1 is the default HTTP standard that developers use to develop their apps. You have to opt into using an HTTP 2 or 3 server with different APIs since those require HTTPS.

Here are the three main improvements http 1.1 added:

1. **added new methods**: New HTTP methods were added, which introduced PUT, PATCH, OPTIONS, DELETE
2. Hostname Identification In HTTP/1.0 Host header wasn’t required but HTTP/1.1 made it required.
3. **added persistent connection**: Solved the main drawback of HTTP 1 by letting a server produce multiple responses to a client from a single connection.
4. **Chunked transfer encoding**: stream data without knowing full length
5. **Caching control headers** (`ETag`, `If-Modified-Since`)

To close the connections, the header Connection: close had to be available on the request. Clients usually send this header in the last request to safely close the connection.

However, you still have one major limitation of HTTP 1.1:

 **❌ Head-of-Line Blocking**

Even though requests are pipelined, **responses must come back in order**. If the first one is slow, all others are blocked. You can have up to 5 requests happening in parallel, but any large one can block any others coming behing it. 

To overcome these shortcomings of HTTP/1.1, the developers started implementing the workarounds, for example use of spritesheets, encoded images in CSS, single humungous CSS/Javascript files, domain sharding etc. - anything to bypass the issue of something blocking the network waterfall.

#### SPDY - 2009

Google went ahead and started experimenting with alternative protocols to make the web faster and improving web security while reducing the latency of web pages. In 2009, they announced SPDY.

the core idea for performance gain behind SPDY was to decrease the latency to increase the network performance.

After many years of successful implementations, SPDY was transformed into HTTP 2

#### HTTP/2 - 2015

HTTP/2 was designed for low latency transport of content. Here are the key features:

- Response data is binary encoded instead of Textual
- Multiplexing - Multiple asynchronous HTTP requests over a single connection in parallel
- Header compression using HPACK
- Server Push - Multiple responses for single request (streaming down to client)
- Request Prioritization
- Security

**frames and streams**

Every HTTP/2 request and response is given a unique stream ID and it is divided into frames. 

- **frame**: binary pieces of data. 
- **Stream**: A collection of frames  

Since there is a many to one relationship of frames to streams, each frame has a stream id that identifies the stream to which it belongs and each frame has a common header.

**aborting requests**

 RST_STREAM is a special frame type that is used to abort some stream i.e. client may send this frame to let the server know that I don’t need this stream anymore. 

This leads us to a major advantage HTTP 2 has over HTTP 1.1, which is the ability to abort requests gracefully and still keep the connection to the server open.
 
 In HTTP/1.1 the only way to make the server stop sending the response to client was closing the connection which resulted in increased latency because a new connection had to be opened for any consecutive requests. While in HTTP/2, client can use RST_STREAM and stop receiving a specific stream while the connection will still be open and the other streams will still be in play.
 
**server push**

Server push is another tremendous feature of HTTP/2 where the server, knowing that the client is going to ask for a certain resource, can push it to the client without even client asking for it. For example, let’s say a browser loads a web page, it parses the whole page to find out the remote content that it has to load from the server and then sends consequent requests to the server to get that content.

Server push allows the server to decrease the roundtrips by pushing the data that it knows that client is going to demand. How it is done is, server sends a special frame called PUSH_PROMISE notifying the client that, “Hey, I am about to send this resource to you! Do not ask me for it.” The PUSH_PROMISE frame is associated with the stream that caused the push to happen and it contains the promised stream ID i.e. the stream on which the server will send the resource to be pushed.


#### HTTP/3 – QUIC Protocol (2022+)

HTTP/3 makes huge performance gains by switching from the TCP protocol to the QUIC protocol. HTTP/3 is HTTP/2 over **QUIC**, a transport protocol built on **UDP** instead of TCP.

The disadvantages that TCP has that QUIC solves are as follows:

- Head-of-line blocking at the transport level
- Connection setup latency (3-way handshake + TLS)
- Bad at handling mobile roaming / IP changes

Here are the key features of the QUIC protocol:

| Feature                   | HTTP/3 Benefit                                |
| ------------------------- | --------------------------------------------- |
| ✅ UDP-based               | Avoids TCP head-of-line blocking              |
| ✅ 0-RTT Connection Resume | Faster handshakes, even on reconnect          |
| ✅ Built-in Encryption     | TLS 1.3 is part of QUIC itself                |
| ✅ Multiplexed Streams     | Independent streams — no blocking             |
| ✅ Improved mobility       | Seamlessly handles IP changes or network hops |
Here are the deployment considerations for HTTP 2 vs HTTP 3:

- **HTTP/2** is widely adopted; most CDNs and browsers support it.
- **HTTP/3** requires QUIC-capable servers and clients (Cloudflare, Google, etc. support it).
- **Fallback needed**: HTTP/3 falls back to HTTP/2 if QUIC is blocked.

### HTTPS

Before we get into HTTPS, we need to talk about two types of encryption:

#### **symmetric key encryption**

Both parties will use the same key for encryption and decryption, meaning anyone who has a copy of the key can decrypt the message.

However, symmetric keys are sensitive info and are hard to distribute discreetly.


#### **public key encryption**

Each party has their own public and private key pair.

Whatever one person encrypts with their public key, only their private key can decrypt that. So here is a clever way of using encryption:

1. Both parties exchange their public keys with each other. 
2. The sending party, party A will use party B's public key ot encrypt the message. 
3. Party A sends the encrypted message to party B
4. Party B receives the encrypted message, and since it was encrypted with its own public key, it can easily decrypt it with its private key.

