
## Basics

### What is gRPC?

gRPC is an open-source Remote Procedure Call framework that enables you to build APIs.

> [!NOTE]
> The "RPC" part of the name stands for "Remote Procedure Call", which indicates how the communication happens. 

In gRPC, the client communicates with the server by calling its methods as if they were local. 

That's possible by creating a stub (client) with the same methods as the gRPC server. You then use the client to call the server methods.

They exchange data using Protobuf (Protocol buffers), compared to GraphQL, which uses text-based JSON to exchange data, while Protobuf is more of a mechanism that serializes structured data into binary format.

gRPC has a schema-like file, `.proto`, that describes the API service. 

- It specifies the available methods that can be called and their parameters & return types. 
- The default and most common Interface Definition Language (IDL) for writing "proto" files is Protobuf (Protocol buffers).

Here is an example of a Protobuff file:

```proto
syntax = "proto3";

service User {
  rpc GetUser (UserRequest) returns (UserResponse) {}
}

message UserRequest {
  int32 id = 1;
}

message UserResponse {
  string name = 1;
  int32 age = 1;
  string address = 1;
}
```

### Benefits

One benefit of using gRPC is the performance of data exchange. gRPC uses Protobuf to serialize data into binary format, which improves the payload size. As a result, exchanging data is faster and more efficient.

gRPC also uses the HTTP/2 transport protocol, which comes with request and response multiplexing. In HTTP/2, the request/response is split into multiple frames that are sent individually and put together back when they arrive at the destination. That makes it possible to transfer multiple requests and responses in one connection.

Another advantage of using gRPC is that it supports various streaming types. It supports

- Server streaming - the client makes a request, and the server responds with a stream of messages
- Client streaming - the client sends a stream of messages to the server, which responds after the client has finished streaming
- Bidirectional streaming - both the client and server send independent streams of messages to each other

gRPC also supports Unary interactions, where the client sends one request, and the server sends one response back.

Code generation is another benefit. gRPC's `protoc` compiler can use the `.proto` file to generate server and client code in 11 programming languages.


### Drawbacks

1. **limited language support**: One drawback is that Protobuf (Protocol buffers), a core part of gRPC, only supports code generated in 11 languages: C#/.NET, C++, Dart, Go, Java, Kotlin, Node, Objective-C, PHP, Python and Ruby.
2. **protobuf obscurity**: Another drawback is that gRPC uses Protobuf to exchange data. As a result, the messages are not human readable. Reading and inspecting data requires extra steps and tools
3. **Uses HTTP2**: Another difference is that gRPC does not come with browser support because browsers do not support HTTP/2 yet. Since GraphQL uses HTTP/1.1, it does not have this problem.

### GRPC vs GraphQL

| GraphQL                 | gRPC                            |                                   |
| ----------------------- | ------------------------------- | --------------------------------- |
| Data fetching           | Retrieve only the data you want | Might get extra data back         |
| Performance             | Less performant                 | More performant                   |
| Code generation         | Third-party tools required      | Natively supports code generation |
| Browser support         | Supported by all browsers       | Limited to no support             |
| Human readable messages | Yes                             | No                                |
| Community support       | Widely available support        | Limited support                   |
| Message format          | JSON or XML                     | Protobuf (Protocol buffers)       |