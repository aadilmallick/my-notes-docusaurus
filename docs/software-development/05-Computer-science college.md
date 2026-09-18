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

To reduce confusion, the [International Electrotechnical Commission](https://en.wikipedia.org/wiki/International_Electrotechnical_Commission) (IEC) proposed using prefixes kilo, mega, and giga only for the decimal-based system. For the binary-based system, they introduced new prefixes: **kibi**, **mebi**, and **gibi**. Here, 'bi' stands for binary. 

- So, a kibibyte (KiB) equals 1,024 bytes
- A kilobyte (kB) equals 1,000 bytes.

So any acronyms using with an "i" in them are referring to a power of 2.

|               |            |                   |                |            |                      |
| ------------- | ---------- | ----------------- | -------------- | ---------- | -------------------- |
| **SI metric** | **Symbol** | **Powers of ten** | **IEC metric** | **Symbol** | **Powers of two**    |
| Kilobyte      | kB         | 10^3 B (1000 B)   | Kibibyte       | KiB        | 2^10 B (or 1024 B)   |
| Megabyte      | MB         | 10^6 B (1000 kB)  | Mebibyte       | MiB        | 2^20 B (or 1024 KiB) |
| Gigabyte      | GB         | 10^9 B (1000 MB)  | Gibibyte       | GiB        | 2^30 B (or 1024 MiB) |
| Terabyte      | TB         | 10^12 B (1000 GB) | Tebibyte       | TiB        | 2^40 B (or 1024 GiB) |
| Petabyte      | PB         | 10^15 B (1000 TB) | Pebibyte       | PiB        | 2^50 B (or 1024 TiB) |


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

| Feature                    | HTTP/3 Benefit                                |
| -------------------------- | --------------------------------------------- |
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

#### **public key (asymmetric) encryption**

Each party has their own public and private key pair.

Whatever one person encrypts with their public key, only their private key can decrypt that. So here is a clever way of using encryption:

1. Both parties exchange their public keys with each other.
2. The sending party, party A will use party B's public key ot encrypt the message.
3. Party A sends the encrypted message to party B
4. Party B receives the encrypted message, and since it was encrypted with its own public key, it can easily decrypt it with its private key.

#### HTTPS handshake

While symmetric encryption (where one key handles both encryption and decryption) secures the content, it presents a security flaw: the key itself must be shared over the network, risking exposure