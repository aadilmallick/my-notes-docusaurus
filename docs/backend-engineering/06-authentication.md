
## Authentication and authorization

Let's use an analogy to outline their differences. Imagine someone asked their friend to pick up a parcel from the post office and take it to this person's house. The friend will need:

- a key (authentication). The lock on the door will grant them access to the house, it is like a password.
    
- permissions (authorization). Once inside, the friend has permission to access the living room and put the parcel on the table. But the friend may not have permission to go into the kitchen to take some food from the fridge.
    

Authentication and authorization work together in this example. The friend has the right to enter the house (authentication), and once there, there he gets access to certain areas of the house (authorization).

|                                   |                                                       |                                               |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| **Authentication**                | **Authorization**                                     |                                               |
| **What does it do?**              | Verifies credentials                                  | Grants or denies permission                   |
| **How does it work?**             | Through passwords, biometrics, one-time pins, or apps | Through settings maintained by security teams |
| **Is it visible to the user?**    | Yes                                                   | No                                            |
| **Is it changeable by the user?** | Partially                                             | No                                            |
| **How does data move?**           | Through ID tokens                                     | Through access tokens                         |

## Authentication

## Core Auth Types

There are two types of authentication standards:

- **stateful authentication**: Auth based on the client sending cookies to the server and storing auth info about the current user in the cookie, like a session ID. The server then stores the session data.
- **stateless authentication**: Auth that is not based on cookies but rather on encrypted tokens. DB does not store auth state or user info, meaning auth info is stored in the token itself on the client.

> [!NOTE]
> The main difference between stateful authentication and stateless is that in stateless auth, because the server stores all the details about the current session for a logged in user including client ID and expiration time, it can revoke that authentication session at any time.
>
> Since you're not storing anything server-side in stateless auth, you can't revoke the authentication session - you can only store expiration information in the token when you send it to the client and base application logic off of that.

- **Use stateful authentication when**: + High-security requirements exist (e.g., financial institutions, government agencies). + The application requires fine-grained control over user sessions (e.g., single sign-on, shared device access).
- **Use stateless authentication when**: + Scalability and performance are critical. + Security is not a top priority, but rather convenience and simplicity. + The application has minimal security requirements or can tolerate token-related risks.

| Feature                | Session-Based (Stateful)                                          | Token-Based (Stateless)                                                                          |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Server stores session? | ✅ Yes (e.g., in memory or in database)                           | ❌ No                                                                                            |
| Can revoke?            | ✅ Yes                                                            | ❌ Not easily                                                                                    |
| Scalable?              | ❌ Needs sticky sessions or shared storage                        | ✅ Easily, because nothing is being stored. All it is doing is validating the token info.        |
| Cookie-based?          | ✅ Usually                                                        | Optional                                                                                         |
| performance            | ❌ low performance since you need to validate requests against DB | ✅ High performance, since only operations are creating token and validating token - no storage. |
| Storage requirements   | ❌ Needs to store user credentials AND session data               | ✅ Only needs to store user credentials to authenticate against.                                 |

![](https://i.imgur.com/tk0nSrA.jpeg)

JWT is not recommended for auth because there are more downsides than upsides. To make effective JWTs, you need to implement access tokens and refresh tokens because you cannot revoke the session at all. This also makes JWTs less secure by default if not implemented correctly. The only advantage JWTs have are speed of checking auth status, but that can be easily overcome by using something like redis.

### session auth

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
import { Redis } from "@upstash/redis";

export const redisClient = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});
```

**basic global session config**

```ts
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

// Seven days in seconds
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = "session-id";

const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

type UserSession = z.infer<typeof sessionSchema>;
```

**creating the user and setting the cookie**

```ts
export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, "set">
) {
  const sessionId = crypto.randomBytes(512).toString("hex").normalize();
  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });

  setCookie(sessionId, cookies);
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  });
}
```

After you complete all these steps, the user verifies themselves by having the browser automatically send the cookie on every request, the server parses the cookie and gets the session ID, validates against the redis cache that the session ID exists and has not expired, and gets the session object that lives in the cache. Then the user is authenticated with that info.

**getting the user**

```ts
export function getUserFromSession(cookies: Pick<Cookies, "get">) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  return getUserSessionById(sessionId);
}

async function getUserSessionById(sessionId: string) {
  const rawUser = await redisClient.get(`session:${sessionId}`);

  const { success, data: user } = sessionSchema.safeParse(rawUser);

  return success ? user : null;
}
```

**updating the session**

```ts
export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  await redisClient.set(`session:${sessionId}`, sessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECONDS,
  });
}

export async function updateUserSessionExpiration(
  cookies: Pick<Cookies, "get" | "set">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  const user = await getUserSessionById(sessionId);
  if (user == null) return;

  await redisClient.set(`session:${sessionId}`, user, {
    ex: SESSION_EXPIRATION_SECONDS,
  });
  setCookie(sessionId, cookies);
}
```

**logging out the user**

To log out the user, you simply just delete the cookie, and then delete the session from the redis cache.

```ts
export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  await redisClient.del(`session:${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}
```

**creating route guards**

This is a useful utility for getting just the user session, the user from the DB, all while acting as a route guard.

```ts
import { cookies } from "next/headers";
import { getUserFromSession } from "../core/session";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { UserTable } from "@/drizzle/schema";

type FullUser = Exclude<
  Awaited<ReturnType<typeof getUserFromDb>>,
  undefined | null
>;

type User = Exclude<
  Awaited<ReturnType<typeof getUserFromSession>>,
  undefined | null
>;

function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound: true;
}): Promise<FullUser>;
function _getCurrentUser(options: {
  withFullUser: true;
  redirectIfNotFound?: false;
}): Promise<FullUser | null>;
function _getCurrentUser(options: {
  withFullUser?: false;
  redirectIfNotFound: true;
}): Promise<User>;
function _getCurrentUser(options?: {
  withFullUser?: false;
  redirectIfNotFound?: false;
}): Promise<User | null>;
async function _getCurrentUser({
  withFullUser = false,
  redirectIfNotFound = false,
} = {}) {
  const user = await getUserFromSession(await cookies());

  if (user == null) {
    if (redirectIfNotFound) return redirect("/sign-in");
    return null;
  }

  if (withFullUser) {
    const fullUser = await getUserFromDb(user.id);
    // This should never happen
    if (fullUser == null) throw new Error("User not found in database");
    return fullUser;
  }

  return user;
}

export const getCurrentUser = cache(_getCurrentUser);

function getUserFromDb(id: string) {
  return db.query.UserTable.findFirst({
    columns: { id: true, email: true, role: true, name: true },
    where: eq(UserTable.id, id),
  });
}
```

##### Logging out

WHen the user wants to log out, he requests the logout endpoint against the server, passing his session ID, and then the server will delete the corresponding session from the database

```ts
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error");
    res.clearCookie("connect.sid");
    res.send("Logged out");
  });
});
```

##### Complete example

Here's a complete example in express:

```ts
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

// Setup session middleware
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // should be true in production with HTTPS
  })
);

// Simulated user database
const users = [
  { id: 1, username: "alice", passwordHash: bcrypt.hashSync("secret", 10) },
];

// Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).send("Unauthorized");
  }

  req.session.userId = user.id;
  res.send("Logged in");
});

// Protected Route
app.get("/new-post", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send("Unauthorized");
  }

  res.send("Here you go!");
});

// Logout Route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.clearCookie("connect.sid");
    res.send("Logged out");
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

### Basic auth

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

Here is the authorization process in depth. First, the header the client sends will be the `Authorization` header in this form: `Basic <encoded-credentials>`

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
const authHeader = req.headers["authorization"];

if (!authHeader || !authHeader.startsWith("Basic ")) {
  res.set("WWW-Authenticate", 'Basic realm="Secure Area"');
  return res.status(401).send("Authentication required.");
}
```

##### Full example

```ts
const express = require("express");
const app = express();
const port = 3000;

// Simulated user database
const users = {
  alice: "secret123",
  bob: "hunter2",
};

// Middleware to check Basic Auth
function basicAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="Secure Area"');
    return res.status(401).send("Authentication required.");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");

  if (users[username] && users[username] === password) {
    req.user = username;
    return next();
  }

  return res.status(401).send("Invalid credentials");
}

// Protected route
app.get("/protected", basicAuth, (req, res) => {
  res.send(`Hello ${req.user}, you are authenticated!`);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

### Token Based Auth

![](https://i.imgur.com/xAjKaQa.jpeg)

Token based auth is the primary form of stateless authentication and has many derivatives, including SWT, JWT, and OAuth. It truly is the industry standard.

Here's how stateless authentication with tokens works

1. A user attempts to log in.
2. The server verifies the username and password and generates an authentication token.
3. The server sends the authentication token to the client.
4. Each subsequent request includes the authentication token or an alternative identifier (e.g., a JWT).
5. The server verifies the token and grants access based on its contents. (e.g., user credentials have match in database, token has not yet expired).
   ![](https://i.imgur.com/N7pzq28.jpeg)

### JWT auth

![](https://i.imgur.com/Mmd32cY.jpeg)

JWT auth is a form of token auth, and thus stateless auth. A JSON web token is a secret string encrypted on the server that holds all the auth info of a user (email, password, and name) and metadata about the token, like when it should expire. Here is the basic workflow of using JWT:

1. The client sends the JWT it receives from the server on every request
2. The server decrypts the JWT with a secret key, parses its payload for user auth, and validates if the token is still valid against the token metadata.

This simplified diagram shows how it works at a high level. You don't have to worry about the low level because JWT libraries handle all the creation and validation of the token.

![](https://i.imgur.com/em9iXf3.png)

![](https://i.imgur.com/LafWtcD.png)

## SSO

### Intro SSO

**Single Sign-On (SSO)** is a streamlined authentication process allowing users to access multiple applications or websites using one set of login credentials. This approach offers numerous benefits in the digital landscape.

![](https://ucarecdn.com/d2d047d6-2f7a-45f3-9e52-1bd9e63a3ce6/)

SSO enhances user convenience by reducing the number of passwords they need to remember, thereby simplifying their access to various services. 

- From a security standpoint, it minimizes password fatigue, encouraging better password practices and allowing centralized control of authentication policies.
- Additionally, SSO is beneficial for IT management, providing a unified platform to enforce security measures. It also plays a crucial role in reducing the risk of phishing attacks by limiting the frequency of login prompts.


![](https://i.imgur.com/wEjmsqC.jpeg)

## OAuth

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

### OAuth request

**step 1: make an OAuth request**

In this step, we craft a URL which links to the OAuth provider's page, which is a `/authorize` endpoint.

Here are the query parameters you send along when fetching an OAuth request url:

- `client_id`: the client ID you set up with the provider.
- `client_secret`: the client secret you set up with the provider.
- `response_type="code"`: specifies you want to receive an OAuth code back
- `redirect_uri`: your application URL to redirect to after successful authentication with the provider.
- `scope`: a space separated list of the information scopes you want from the user, like `identify` to get the user id, and `email` to get the emial

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

### Using OAuth state

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

### Code challenge verification

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

### Complete OAuth flow

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

### GIthub OAuth

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

### Which Auth Provider to choose

**Verdict (2026):**

- **Best for DX & Speed:** **Clerk** (Expensive at scale, but fastest to ship).
- **Best Value Managed:** **Firebase** (Unbeatable free tier, very cheap scaling, but harder to implement).
- **Best Middle Ground:** **Kinde** (Cheaper than Clerk, better DX than Firebase, includes billing/feature flags).
- **Best Self-Hosted:** **Better Auth** (Free, modern, type-safe; superior to "rawdogging" it manually). 

---

**1. Pricing Comparison at a Glance**

|Feature|**Clerk**|**Kinde**|**Firebase (Identity Platform)**|**Better Auth / Self-Hosted**|
|---|---|---|---|---|
|**Free Tier (MAUs)**|10,000|10,500|**50,000**|**Unlimited** (You pay infra)|
|**Monthly Base Cost**|$0 (Free) / $25 (Pro)|$0 (Free) / $25 (Pro)|$0|$0 (Open Source)|
|**Cost per extra MAU**|~$0.02|~$0.0175|**~$0.0025** (after 50k)|$0 (Your DB costs)|
|**B2B / Orgs**|100 free, then ~$1/org|5 free, then ~$0.50/org|Custom impl. required|Included (Plugin)|
|**Enterprise SSO**|+$100/mo add-on|Included in Scale ($250+)|~$0.015 per user|Included (Plugin)|

---

**2. Detailed Breakdown**

**Clerk: The "Apple" of Auth**

- **Pricing Model:** Generous start, expensive scaling.
- **Sweet Spot:** Solo founders, B2B startups needing complex multi-tenancy immediately.
- **The Cost:** Free for 10k monthly active users (MAUs). Once you grow, you pay **$25/mo** base + **$0.02 per user**.
- **The "Gotcha":**
    - **MFA & SSO:** Advanced security features (SAML, etc.) are often locked behind a **$100/mo** add-on.
    - **B2B Scaling:** If you have many small organizations (e.g., a freemium B2B app), the **$1/organization** fee after the first 100 can balloon your bill faster than user growth. 

**Kinde: The "All-in-One" Alternative** 

- **Pricing Model:** Flat tiers with cheaper overage.
- **Sweet Spot:** Startups who want Auth + Feature Flags + Billing in one SDK.
- **The Cost:** Similar to Clerk ($25/mo base), but overage is slightly cheaper (**$0.0175/user**).
- **The Benefit:** Unlike Clerk, Kinde doesn't charge massive add-ons for essential features. It bundles **user management, feature flags, and billing** (payment connection) into the platform.
- **The "Gotcha":** The free tier only allows **5 active organizations** (B2B tenants). You must upgrade to Pro ($25/mo) to get 50 orgs, then pay ~$0.50 per extra org. 

**Firebase Auth: The "Budget" Powerhouse**

- **Pricing Model:** Loss leader for Google Cloud.
- **Sweet Spot:** Consumer apps (B2C) with high volume (e.g., 100k+ users) or mobile-first apps.
- **The Cost:** **Free for 50,000 MAUs.** After that, it is roughly **10x cheaper** than Clerk/Kinde ($0.0025 vs $0.02).
- **The "Gotcha":**
    - **SMS Costs:** There is **no free tier for SMS/Phone auth**. You pay carrier rates immediately (e.g., $0.01 in US, $0.06+ globally), which can get very expensive.
    - **DX:** No pre-built "User Profile" or "Organization Switcher" components. You build all UI yourself. 

**Better Auth: The Modern "Self-Hosted"** 

- **Pricing Model:** Free software, pay for your own infrastructure.
- **Sweet Spot:** Developers who want data ownership without the pain of writing auth from scratch.
- **The Cost:** **$0** for the software. You pay for your database (Postgres/MySQL) and hosting (Vercel/[AWS](https://aws.amazon.com/)).
- **Why it wins vs. Rawdogging:** "Rawdogging" auth requires you to manually handle session invalidation, CSRF tokens, and OAuth flows (Google, Apple callbacks). **Better Auth** provides these as a library (like NextAuth but typesafe and plugin-based) with support for Passkeys, 2FA, and Multi-tenancy out of the box.
- **The "Gotcha":** You are responsible for security patches and database uptime. If your DB goes down, nobody can log in. 

**Rawdogging OAuth + DB**

- **Pricing:** $0 + Infinite Developer Tears.
- **Reality:** Only do this for learning. Security risks (session fixation, token leakage) are high. Maintaining OAuth integrations (e.g., "Sign in with Apple" changes) is a long-term maintenance burden that libraries like Better Auth handle for you. 

**Recommendation**

1. **Start with Clerk** if you have budget and want to launch _today_. The $25/mo is negligible compared to the engineering hours saved on UI.
2. **Switch to Better Auth** if you are bootstrapping with $0 budget or strictly require self-hosting/data ownership.
3. **Use [Firebase](https://firebase.google.com/)** if you are building a B2C mobile app expecting 100k+ users (e.g., a social network). 

These pages offer a comparative analysis of pricing models for Clerk, Kinde, Firebase Auth, and self-hosted authentication options:

## Authorization

### Handling permissions

To handle permissions, we can go down the route of role-based access control, like so:

```ts
export type User = { roles: Role[]; id: string };

type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  admin: [
    "view:comments",
    "create:comments",
    "update:comments",
    "delete:comments",
  ],
  moderator: ["view:comments", "create:comments", "delete:comments"],
  user: ["view:comments", "create:comments"],
} as const;

export function hasPermission(user: User, permission: Permission) {
  return user.roles.some((role) =>
    (ROLES[role] as readonly Permission[]).includes(permission)
  );
}

// USAGE:
const user: User = { id: "1", roles: ["user"] };

// Can create a comment
hasPermission(user, "create:comments");

// Can view all comments
hasPermission(user, "view:comments");
```

