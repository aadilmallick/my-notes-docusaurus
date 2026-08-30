## Intro

### Why Operating systems?

Operating systems are a software that hardware boots up to provide a universal interface for **peripherals** (I/O devices like keyboards, mouses, and printers) and programs to work with any device, as long as a device has that specific OS installed.

In the past, you had to create programs for each specific omputer which had a different architecture, and write different code for different peripherals which also had their own architecture.

The two main benefits an OS provides is abstraction and arbitration, which solves the intractibility of coding for each different device.

- **abstraction:** Hides details of different hardware configurations and allows the same code to be written for multiple devices, as long as those devices have the same OS installed.
- **arbitration:** Manages access to shared hardware resources so multiple applications/processes can use the same hardware simultaneously, allowing for multiple programs to run at the same time.

Here are example of abstraction and arbitration use cases:

- **abstraction**
    - **supporting both Intel and AMD processors**
    - **enabling zoom to use different camera devices like webcam or integrated cam:** The OS uses a universal camera device driver to interface between the kernel and different webcam architectures.
- **arbitration**
    - **switching between applications:** A scheduler decides which application a CPU core should focus on and pauses others
    - **separating memory allocated to different applications:** Each application has their own stating virtual memory address and page table so their memory is effectively isolated from other processes’ memories.

#### **abstraction**

Here are the key problems abstraction solves:

- **different peripheral architectures:** Hardware I/O devices manufactured by different manufacturers have different architectures and thus require different low-level instructions to operate.
    - **Before**: 1990s computer games required internal programming for specific video cards and sound cards, hardcoding different paths for all the possible video card and sound card architectures in the wild.
    - Abstraction by the OS gives a common interface to control these peripherals and handle I/O universally, so you only have to write one program as opposed to millions for millions of peripherals.

#### **arbitration**

Here are the key problems aributration solves:

- **managing access to shared resources:** By allocating slices of memory to different applications/processes, we can enable multitasking and allow multipel processes to exist simultaneously on the same computer, without one application taking up all CPU instructions and memories.
- **memory protection:** By keeping each application’s memory separate, they can’t interfere with each other or read each other’s data. If one application’s memory crashes, it doesn’t affect any other application’s memory.

### Operating system components

The basic hardware architecture of a computer is like so:

- **CPU**: executes arithmetic, program instructions, and logical gates for conditionals.
- **peripherals**: I/O devices that send interrupts to pass data to the CPU for execution and interrupt handling
- **memory**: RAM that contains program instructions and stores interrupt vectors.
- **system bus**: facilitates communication between CPU, memory, and peripherals.


![](https://i.imgur.com/8G7zMxa.jpeg)


## Low-level components of a computer

### Logic gates

### ALU

AN ALU consists of two main parts:

- **arithmetic unit:** Boolean logic gates that combine together to form full adder circuits
- **logic unit:** Used for simple boolean logic functions like AND, OR, NOT, and checking if a number is negative or not.

The ALU has 8 inherent boolean circuits for calculating arithmetic, which includes addition and subtraction (but not multiplication or division).

Here’s the high-level process for how the ALU performs computation:

1. The CPU tells the ALU what arithmetic operation to perform via an **operation code** and also passes the ALU the input numbers to add together.
2. The ALU performs the desired arithmetic operation and then produces an output.
3. The ALU also outputs certain flags via three special bits:
    -  **overflow bit:** If set to 1, that means there was an integer overflow
	- **zero bit:** If set to 1, that means the two numbers are equal
    - **negative:** If set to 1, that means that the result was negative


![](https://i.imgur.com/XtLaX17.jpeg)

## Data storage

### Hard Drive Disk 

#### Disk Geometry

**Magnetic disks** are the actual hardware behind how a disk drive works. They are simply metallic or glass platters coated in a magnetic surface.

Here are the main components of what’s in a magnetic disk:

- **Platters & Heads:** A two-faced disk that contains a vertical stack of metallic or glass platters coated with a magnetic substrate that rotates at a fixed, high velocity around a central spindle (typically 5400 to 15000 RPM).
    - Data is read and written by electromagnetic **heads** suspended on a mechanical actuator arm that floats micro-inches above the spinning surfaces.
    - Each platter comes with two heads, one for reading the top of the platter and the other for the bottom.
- **Tracks:** As a platter spins, the head sits over a fixed radius, tracing a continuous circular path called a **Track**. Each head reads from its own distinct track at any given time.
- **Sectors:** Tracks are chopped up into small arc segments called **Sectors**. The sector is the absolute smallest atom of data that can be addressed or read/written by the physical drive hardware.
    - Historically, this was hardcoded to **512 bytes,** but modern computers have increased it to 4kb, the size of a page.
- **Cylinders:** If you project a single track vertically through the entire stack of platters, you get a 3-dimensional hollow tube structure called a **Cylinder**.
    - In other words, Cylinder $X$ is the set of all tracks at radius $X$ across all platter surfaces.



#### Disk latency

Unlike volatile RAM, which boasts near-uniform access times ($\approx 10-100\text{ ns}$), accessing a block on a magnetic disk is bound by the laws of classical mechanics. Total mechanical disk access latency is governed by a strict mathematical sum:

$$  
T_{\text{access}} = T_{\text{seek}} + T_{\text{rotational}} + T_{\text{transfer}}  
$$

1. **Seek Time ($T_{\text{seek}}$):** The time required for the mechanical actuator arm to physically move the read/write head across tracks to the correct radius.
	- This is highly variable, depending on whether the head is moving to an adjacent track or sweeping across the entire disk diameter.
2. **Rotational Delay ($T_{\text{rotational}}$):** Once the head settles onto the correct track, it must wait for the platter to spin until the requested sector passes directly beneath it. On average, this is calculated as the time it takes to complete exactly half a rotation:
    
    $$  
    T_{\text{rotational\_avg}} = \frac{1}{2} \times \frac{60}{\text{RPM}}  
    $$
    
3. **Transfer Time ($T_{\text{transfer}}$):** The time required to actually read the magnetic bits off the medium as they pass under the head and stream them over the bus interface into host memory.

Because $T_{\text{seek}}$ and $T_{\text{rotational}}$ dominate the equation (often taking 4 to 10 milliseconds total), reading data scattered randomly across a disk is several orders of magnitude slower than reading contiguous blocks sequentially. Here’s why:

- **random access:** If randomly accessing, then for each random access, the platter has to spin a lot, increasing $T_{\text{rotational}}$ and the arm has to move a lot, increasing $T_{\text{seek}}$
- **contiguous access:** If contiguous access, then only the first access takes substantial time for the initial platter spin and arm seek, then all subsequent accesses just spin the platter a tiny amount, which makes $T_{\text{rotational}}$ small for all subsequent access and $T_{\text{seek}} = 0$ because you’re still on the same track.

> [!NOTE]
> If $T_{access} = 6ms$, in that same amount of time, a modern 3 GHz CPU execution core can cycle 18,000,000 times. This massive performance gap is exactly why operating systems treat mechanical disk access as a monumental bottleneck.

##### How cylinders affect latency

If you stack three of these platters vertically on top of each other on that central spindle, you have 6 separate recording surfaces (top and bottom of each platter).

If the actuator arm moves the read/write heads to Track #500, **all 6 heads are now sitting over Track #500 on their respective surfaces simultaneously**

- **The Cylinder Definition:** This vertical alignment of Track #500 across all platters forms a virtual, 3-dimensional tube known as **Cylinder #500**.
- **The Engineering Consequence:** When writing a large file that exceeds the capacity of a single track, a smart OS file system will fill up the rest of the tracks in the _same cylinder_ before moving the actuator arm to a new radius.
    - Why? Because switching heads electronically takes nearly zero time, whereas moving the mechanical arm to a new track incurs an expensive seek time penalty ($T_{\text{seek}}$).

##### Mitigations for latency

Historically, this reality forced operating systems to adopt specialized disk scheduling algorithms (like the ELEVATOR/SCAN algorithm) to reorder I/O requests in real-time, minimizing arm movement.

It also motivated **Disk Partitioning**, keeping localized system files in tight physical bands to deliberately clamp down on maximum head travel distances.

> [!NOTE]
> So in summary, the main mitigation to slow disk access times is to minimize arm movement and platter rotation movement.

Two mitigations arose from the principle of minimizing movement:

- **disk scheduling algorithms**: algorithms that seek to optimize data access bounded by the laws of classical mechanics, trying to minimize arm movement.
- **disk partitioning**: partitioning data into different areas on the disk so related data is close together, also minimizing arm movement.

#### Disk attachment

Disks are attached to the motherboard via special types of cables.

To move sectors into main memory, disks attach to the motherboard via physical cables built to match specific structural bus specifications. It is important to separate the **physical bus/wiring layer** from the **logical command protocol**:

- **IDE / PATA (Parallel ATA):** An older standard utilizing massive 40-to-80 conductor ribbon cables to transmit data across parallel channels. Parallel transmission suffered from electrical crosstalk and signal skew at high frequencies, limiting its speed.
- **SCSI (Small Computer System Interface):** Historically a parallel bus, but more importantly, SCSI established a highly robust, advanced **command protocol**. The SCSI command architecture allowed computers to send complex, asynchronous queues of read/write instructions to intelligent storage microcontrollers
- **ATAPI (ATA Packet Interface):** A hybrid protocol created to allow SCSI commands to be packed up and transmitted transparently over inexpensive consumer ATA/IDE hardware connections

Modern variations have evolved into high-speed serial topologies like **SATA** (Serial ATA) and **SAS** (Serial Attached SCSI), which eliminate parallel wiring bottlenecks entirely.