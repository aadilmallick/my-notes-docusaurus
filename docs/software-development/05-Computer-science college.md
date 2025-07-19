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

