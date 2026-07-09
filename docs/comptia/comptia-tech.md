## Computing devices

All computing devices, regardless of size or function, share the ability to process data received from inputs (like a keyboard or sensor) and generate outputs (like a display or audio), which is essential for performing tasks and interacting with users.

- **general purpose device**: A desktop computer is a general-purpose device because it is designed to perform a wide range of tasks, such as web browsing, word processing, and running software applications, making it more versatile than specialized devices like a digital watch or fitness tracker.

## Hardware and binary

### Data amounts

Data can be measured in two families: bits vs bytes.

- **bit family**: goes in powers of 10 starting from one bit, where a kilobit is 1000 bits, megabit is 1000 kilobits, and so on.
- **byte family**: goes in powers of $2^{10}$ starting from one byte which is 8 bits, where a kilobyte is $2^{10}$ bytes, and a megabyte is $2^{10}$ kilobytes.  

![](https://i.imgur.com/bgjHzSZ.jpeg)

- **throughput/bandwidth**: measures the data transfer per second, basically the amount of bitsone computer can transfer to a router and vice-versa in one second.
	- Bandwidth is measured using the bit family of data amounts, often in megabits per second.

### Hardware components

- **motherboard**: electrical circuit component that houses the CPU, fan, heat sink, and RAM.
- **CPU**: the intructions execution unit.
- **RAM**: temporary memory during the computer's lifetime.
- **hard disk or SSD**: permanent block storage on the computer

#### CPU

A CPU (central processing unit) processes data from RAM at incredible speed, which is classified in **clock speed**.

Clock speed is measured in Hertz (1 cycle per second) and specifically Gigahertz (GHz) which is 1 billion cycles per second.

> [!NOTE]
> The faster the clock speed, the faster the CPU can process memory and execute instructions.

A CPU can have multiple cores which enable parallel processing. Most CPU cores have 8 cores, which means they can work on 8 tasks in parallel.

In summary, there are three things to consider for a CPU that affect a computer's performance:

1. **clock speed**: CPUs with a higher clock speed mean a faster computer.
2. **core number**: CPUs with more cores can do more tasks in parallel
3. **CPU type**: some CPUs are better for gaming while others are better for simple applications like email or work. 

#### AC/DC and charging devices

Most electric devices that connect to the grid like lamps, TVs, etc. use AC (alternating current) for their power.

Computing devices like laptops or phones use DC (direct current) instead, of which only batteries provide DC, so computing devices use batteries.

To charge and provide power to laptops, they use power adapters (computer chargers) that convert AC coming from an electric socket to DC that can charge the battery of a computing device.

Here are the components of a power adapter:

- **prong**: plugs into the electrical socket
- **power brick**: the large brick part of the computer charger that converts AC to DC
- **PSU (power supply unit)**: bigger devices like a PC or monitor use a PSU to provide direct power converting AC to DC because they don't have batteries and thus can't be turned on without being plugged into something.

#### Storage on the computer

There are two types of memory in general for a computing device:

- **volatile memory**: memory that is only stored as long as the computing device is on, and is immediately deallocated and destroyed when the computing device shuts off.
- **non-volatile memory**: memory that is stored across computer startups and shutdowns and is essentially permanent.

In a computing device, there are three physical components that store memory:

- **RAM (random access memory)**: volatile memory that only lives for how long the computer turns on, used to provide memory for applications and processes.
- **ROM (read only memory)**: non-volatile memory stored past the computer's lifetime and used to store essential memory like bootup configuration, permanently stores critical startup instructions and retains data even when the device is powered down.
- **SSD or HDD**: non-volatile block storage meant to store files, software, and information permanently.

Long-term storage or **mass storage** like non-volatile memory implementations are rated based on their storage capacity and speed for accessing that data. Here's how the different mass storage options stack up:

- **HDD (hard disk drive)**: hundreds of gigabytes of storage, normal speed
- **SSD (solid state drive)**: hundreds of gigabytes of storage, very fast
- **cloud storage**: completely external storage, the safest and most likely to persist bar global catastrophes.

HDD and SSD are **internal** block storage options that come with the computer, but for more portability and externality, you can purchase **external** HDD and SSD that you can plug into your laptop sort of like a flash drive that gives you additional storage capabilities for as along as that drive is plugged in.

In summary, here's the difference between internal and external mass storage options:

- **internal (internal HDD or SSD)**: comes with the laptop and is baked into the OS capabilities. If the drive dies, the laptop can't access disk data anymore, so it has a single point of failure.
- **external (external HDD or SSD or cloud storage)**: safer and more durable than internal storage because you can keep it separate from the computer, with cloud being the safest option.



### Device ports and peripherals


#### Types of ports

**ports for connecting to external monitors**

- **HDMI (high-definition media interface)**: transfers both audio and visual data to an external computing device like a computer or TV. It is the most commonly used connector for monitors.
- **VGA**: less used, used for connecting to monitors
- **DVI**: less used, used for connecting to monitors
- **DisplayPort**: similar to HDMI, less used, used for connecting to monitors

**USB**

USB (universal serial ports) are used as a universal interface for connecting all types of peripheral devices.

USB ports come in different versions:

- **USB 3.0**: faster data transfer capabilities, have a blue thing in them.
- **USB 1.0**: the original, slower than USB 3.0, have a black thing in them


![](https://i.imgur.com/v3eV8Mt.jpeg)


#### Installation methods for peripherals

Different peripherals like wired headphones, bluetooth mouses, webcams, and printers all have different ways of installation that fall into these three major categories:

1. **plug and play (PnP)**: plugging in a peripheral device into a port automatically registers the device drivers the peripheral needs, the computer installs them, and lets you immediately start using the peripheral device with the OS.
2. **IP-based installation**: network devices like wireless printers may need network configuration to register the printer on the network and let it be automatically registered as a peripheral for all devices within the same network.



#### Wireless I/O devices

There are two main types of wireless connections meant for I/O that devices can use:

- **bluetooth**: used for stuff like wireless headphones or mouses
- **NFC (near-field communication)**: used for stuff like apple pay and tapping your credit card on a card reader.
- **RF (radio frequency)**: uses radio waves for wireless communication, enabling stuff like automatic car keys, garage keys, controlling drones, etc.

## Operating Systems

### Virtualization

A **hypervisor** is a program that allows a single host machine to run multiple VMs, each with its own operating system and effectively isolate resources like CPU utilization, memory, etc.


## Using your device effectively

### Storage Backups

There are three main mass storage options to backup your HDD or SDD storage so you can use it elsewhere or recover the data:

- **local backups**: copy files into a flash drive or external hard drive for portable non-volatile storage
- **network-attached storage (NAS)**: an external hard drive that lives within a WAN that all devices within the WAN can connect to and save data to that drive. It's essentially like a shared block storage filesystem solution.
- **offsite backups**: use cloud storage for extremely durable and offsite storage

## Networking

### Basics

We can look at two different types of network models:

- **peer to peer networks**: Home networks are often P2P (peer to peer networks), which is a type of LAN where each resource is small, considered equal, and shares resources with each other.
- **client-server model**: A client-server network is one where many clients request the same central device, like a shared office printer.

Here are the different types of network devices:

- **modem**: device that converts analog to digital and vice versa
- **wifi access point**: device that wirelessly connects devices to a switch in a LAN via wifi connection

### Networking speed and types of networks


Here are some networking terms that describe network connection speed and capabilities:

- **mobility**: how far you can travel and still access network resources
- **availability**: the probability that a network system will be functional, increased by network redundancy.
- **reliability**: the quality of the network data received and its fault tolerance capabilities.
- **throughput**: the upload and download speed of network response and request content, like a webpage or file.
- **latency**: connection delay between a network request and a response to that request.
- **concurrent connections**: the number of devices in a LAN that can connect to the internet simultaneously without issues.
- **security**: how secure is the network from malicious ingress traffic?



There are three main internet access options: 

1. **wired (using RJ-45 cables)**: generally offer the best availability, reliability, throughput, latency, number of concurrent connections, and security, but have the least mobility
2. **wireless (WiFi)**: offer better mobility than wired connections, but slower and less secure than wired.
3. **cellular networks**: have the highest mobility since you can even be in the woods and get internet connection.

#### Wired network

When using ethernet cables in a wired network, you get high speed, availability, and security, but different cable connector types result in different network speeds and mobility:


![](https://i.imgur.com/01YNg7W.jpeg)

Both of these connectors are compatible to plugging into a switch via ethernet, but they differ in which cable types they are compatible with, which changes the network performance:

- **RJ45**: standard ethernet cabling connectors that are only effective over small distances and have slower speed since they are meant to be used on electric-based ethernet cables.
- **SFP**: a connector for fiber optic cabling to ethernet networks to allow for higher mobility/range and speed.

## Cybersecurity

### AAA

- **authentication**: verifying user identity before granting access to a software or system.
- **authorization**: granting permissions and capabilities based on a user role.
- **accounting**: tracking and recording user activity through logs, location tracking, and browser history to increase security and flag suspicious activity.

#### **authentication**

There are three categories of information you can use for authentication purposes:

1. **something you have**: a physical key, authenticator app, phone number, or a FOB card
2. **something you know**: a password, security question, a passkey
3. **something you are**: biometrics (face ID, fingerprint)

Authentication also has the property of **non-repudiation**, which is a measure of how strong the authentication is. 

It's basically a measure that if successfully authenticated, how unlikely or even impossible that it wasn't you performing the authentication and that a bad actor authenticated as you.

Some authentication factors have higher non-repudiation than others, when used as single-factor authentication.

| authentication factors              | repudiation level | reasoning                                                                                  |
| ----------------------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| password                            | low               | passwords can be easily stolen                                                             |
| biometrics (fingerprints)           | high              | fingerprints are unique, very hard to fake someone else's fingerprints.                    |
| verification code (phone, auth app) | medium            | better than passwords, but it requires that someone hasn't stolen your email or phone.     |
| passkey                             | high              | Passkeys are stored on devices, so the only way to steal a passkey is to steal the device. |
There are three types of authentication:

- **single factor**: only uses a single authentication factor for authentication
- **multi-factor authentication**: combines several steps of authentication from the three main categories, like combining password, security question, and a passkey to ensure only successful completion of multiple factors guarantees authentication. 
	- Multiple factors increases the likelihood that it is truly you that is authenticating, and thus has the highest non-repudiation.
- **Single sign on (SSO)**: authentication into an organization with multiple services with a single set of credentials, where by signing in you have automatic authenticated access to all services in that organization

### Types of malware

- **spyware**: malware installed on a user's machine that gives attackers access to personal information on the user machine and record I/O that the user performs, like voice, video, mouse movement, and keystrokes.
	- **keyloggers**: records your keystrokes and then uploads your typing history to an attacker's server which lets them find out stuff like passwords, credit card numbers, etc.
- **ransomware**: malware installed on a user's device that then steals all of the user's files or encrypts the hard drive (making it inaccessible) and holds them for "ransom", where the attacker asks for money in exchange for giving back the files.

**malware mitigations**

1. **updating OS with patches**
2. **use antivirus software**


### Perils of public internet

- **negative security**: Assume public computers like library computers have negative security, meaning they monitor your browser history and keystrokes through keylogging, removing your privacy.
	- Never enter passwords into a public computer, since they probably have keylogging software installed.



