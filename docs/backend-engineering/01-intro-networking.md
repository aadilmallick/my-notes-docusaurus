
## OSI model

### Intro

**why OSI?**

the OSI model is crucial for anyone working with networks, as it provides a common language and reference point for discussing network functionality, troubleshooting issues, and designing network architectures.

It helps to visualize the flow of data and the protocols involved at each stage, making network behavior more predictable and manageable.



![](https://i.imgur.com/VOV6lwW.jpeg)


**application layer**

The upper layers are layers 7 to 5, and are concerned with software and data preparation.

- **Layer 7: Application Layer** 🌐 – The layer closest to you. It includes network-connected applications like web browsers using **HTTP**.
- **Layer 6: Presentation Layer** 🔏 – Translates data into a readable format, handling things like encryption, decryption, and data compression.
- **Layer 5: Session Layer** 🤝 – Manages the dialogue between two devices, opening, maintaining, and closing the connection session

**network layer**

The lower layers are layers 4 to 1, concerned with the actual transmission of data and connection of devices, moving information from point A to point B.

- **Layer 4: Transport Layer** 📦 – Manages end-to-end communication and data reliability. It chops up large data into smaller pieces (segmentation) using protocols like **TCP** (reliable) and **UDP** (fast).
    - **Core idea**: Uses TCP or UDP and port numbers to specify data flow and process destination.
- **Layer 3: Network Layer** 🗺️ – Handles routing across different networks. This layer uses **IP addresses** to guide data to its final destination across the internet.
    - **Core idea**: Establishes source and destination IP addresses, sending data from the default gateway (your router’s IP address) to the destination IP
    - **core component:** router
- **Layer 2: Data Link Layer** ✉️ – Handles local node-to-node communication. It uses hardware-based **MAC addresses** to deliver data to the correct device on your immediate, local network.
    - **Core idea**: Establishes source and destination MAC addresses, sending data from the NIC to the router.
    - **core component:** switch and NIC
- **Layer 1: Physical Layer** 🔌 – The actual hardware layer. It deals with cables (like Cat 6), Wi-Fi radios, and transmitting raw data bits as electrical or light signals.

Here is the flow going from top to bottom

1. **layer 5,6,7:** YouTube and your IP address open an HTTP session.
2. **layer 4:** you send data packets via port 80 using TCP
3. **layer 3:** You want to send data from your default gateway (the source IP, which is the IP of your router) to the destination IP (YouTube)
4. **Layer 2:** The NIC sends ethernet frames to the switch with the destination being the **default gateway**, which is just the router of the LAN.

**what is OSI?**

The OSI (open systems interface) model has 7 layers, where data flows from bottom (last layer) to the top (first layer)

1. **physical devices**: The Physical Layer is responsible for the physical transmission of data over a communication channel. It defines the physical characteristics of the network, such as the voltage levels, data rates, and physical connectors.
    - Examples: Devices that transfer binary data to a network, which includes physical cables, and switches. Wireless wifi signals live at this level
2. **data link layer**: Responsible for creating reliable connections between devices on a network. Organizes and breaks down packets that come from the third layer into smaller pieces called frames
    - MAC addresses are a unique layer 2 address given to every NIC.
3. **network layer**: Deals with addressing and routing (the router is a layer 3 device), and tries to find the best path for packets to travel, which is called **routing**
4. **transport layer**: Deals with packet transfer and formatting data into packets, ensuring that packets are transported reliably and does error handling to ensure packets are delivered in the correct order
    - protocols like TCP and UDP live on this layer
5. **session layer**: Responsible for opening, maintaining, and closing a connection between two or more devices. Think of SSH.
    - This level establishes a session tag for those byte streams. This way, we know who is sending data to our server through that **session tag**. For example, if multiple requests come through, we know that the data belongs to a specific session.
    - Examples: SQL, cookies + sessions, RPC (remote procedure control)
6. **presentation layer**: Responsible for transforming digital data into data computers can read, using techniques such as decryption and decompression to achieve that. The presentation layer is responsible for translating, encrypting, and compressing data. It ensures that data is presented in a format that both the sending and receiving applications can understand.
	- Examples: SSL/TLS, Data compression like GZIP, Text format conversion

**example**

Here is an example of the full OSI flow:

1. _Application Layer:_ You open your web browser and type in a URL (e.g., `www.example.com`). The HTTP protocol at the application layer initiates a request to the web server.
2. _Presentation Layer:_ The presentation layer encrypts the data using SSL/TLS to ensure secure communication between your browser and the web server.
3. _Session Layer:_ The session layer establishes a connection with the web server, managing the session and ensuring that data is properly synchronized.
4. _Transport Layer:_ The transport layer (using TCP) segments the HTTP request into packets, adds sequence numbers, and ensures reliable delivery to the web server.
5. _Network Layer:_ The network layer adds IP addresses to the packets, routing them across the internet to the web server.
6. _Data Link Layer:_ The data link layer adds MAC addresses to the frames, transmitting them over the local network to the next hop (e.g., your router).
7. _Physical Layer:_ The physical layer transmits the data as electrical signals over the network cable or as radio waves over Wi-Fi.

**OSI layer purposes and headers**

Before even sending a request, all the layers work together to tack on metadata that will be sent as request network headers on the individual packets being transmitted.

Here is how the request content is formed, going in order:

1. **layer 5,6,7:** The actual payload content gets added to the request
    - **layer 7 header added:** which application layer protocol to use
2. **TCP/IP** **(layer 3, 4):** Deals with describing the data flow between the source IP and destination IP and mapping out the path to reach the destination IP address.
    - **layer 4 header added:** Based on the layer 7 protocol defined, either uses TCP or UDP. Also decides which port to use.
    - **layer 3 header added:** defines source IP address (IP address of default gateway) and destination IP address
3. **layer 2:** Deals with routing the source MAC address to the default gateway and how the router of the destination IP directs the connection to the destination MAC address.
    - **layer 2 header added:** source MAC address and destination MAC address
4. **layer 1:** The physical connections in the source LAN and the destination LAN.

### Layer 2

**Layer 2 (Data Link Layer)** uses **MAC addresses** to deliver the data received from layer 3 to the correct physical device (like your local router) on your immediate, local network.

Layer 2 includes these components:

- MAC addresses of NIC interface
- Switch
- Router

Layer 3 includes these protocols:

- ARP

**communication in depth**

1. The NIC sends ethernet frames to the switch with the destination being the **default gateway**, which is just the router of the LAN.
2. The router receives the data and prepares for layer 3 communication


### Layer 3

**Layer 3 (Network Layer)** uses **IP addresses** to route your data across different networks and guide it across the internet to its final destination, which is the public-facing IP address of the LAN in which your device is connected to.

**communication in depth**

1. You want to send some data to a specific IP address, so first you send that data via packets (layer 4 functionality) from the source IP address to the **default gateway,** which is the router of your LAN (layer 2 functionality)
    1. To send data from the source IP address to the default gateway, the layer 2 ARP broadcast executes to resolve the source IP to its associated MAC address
    2. Then it resolves the default gateway to the router’s MAC address and then sends ethernet frames of the layer 4 data packets from the source MAC to the destination MAC
2. The router decides what hops to do and routes traffic through the hop list until it reaches the destination IP.

## Protocols

### Intro

A protocol is a system that allows two parties to communicate, and designed with a set of standard properties.

> [!NOTE]
> The core idea to understand is that protocols are designed to solve a problem, and then people adopt them as a universal standard for universal compatibility. 
> 
> TCP was designed to solve a problem, but it's not enough today for our massive needs, so that's why we designed new protocols.

These are the core components behind protocols:

- **data format**: whether the data will be text-based like JSON or XML or binary like protobuf or HTTP2.
- **transfer mode**: whether the data will be sent via messages like in UDP or HTTP, or as a stream like TCP or WebRTC.
- **addressing system**: how to address source and destination to know where to send data to. Components include DNS, IP, and MAC address
- **directionality**: whether it's bidirectional, unidirectional.
- **state**: whether it's stateful like gRPC or TCP, or stateless like UDP or HTTP

> [!NOTE]
> The main problem behind TCP is that it's sent as a stream while HTTP is message-based. Since HTTP uses TCP it has to constantly parse the stream to find where a message starts and ends, which is part of the overhead of TCP being used with HTTP.
> 

