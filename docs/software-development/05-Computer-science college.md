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



### session auth


![](https://i.imgur.com/xoLEh9i.jpeg)


1. Client logins with email and password or other credentials, which sends POST request with user credentials to the server
2. If the server accepts the login info as valid, it creates a session which contains a session id, user info, and expiration time, stores the session in a database or in memory.
3. The server can create a cookie on the client which contains the session ID, or the client can also receive the session ID straight up from the server and store it client side in web storage or in a cookie.
4. The client sends the session ID each time to the server every time it makes the request, either manually through headers or request body or implicitly using cookies.
5. The server validates the session ID against the database, and returns the stored session if it exists. If the stored session does not exist, then the user is unauthorized.

#### Cookies

If cookies are enabled on the client, we can create cookies on the server and have the browser automatically send those cookies on every request.

1. Client logs in to server on `POST /login`, server processes request
2. The client gets a `Set-Cookie: connect.sid=<session-id-her>` header, which your server should send.
3. The browser sends the cookie on every request it makes to the server.

#### Logging out

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

#### Complete example

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

#### **authorization in depth**

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

#### Handling unauthorized

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

#### Full example

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


### SSO


![](https://i.imgur.com/wEjmsqC.jpeg)

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

