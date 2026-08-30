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

### How RAM works

#### Remembering a bit

What does it mean to have memory? Well, you have to remember something.

Forget remembering 32gb of RAM, how do you remember even a single bit? 

Use logic gates.

To remember 1s and 0s you can feed the output bit of a boolean logic gate back into itself as an input bit.

- **remember a 1:** This is an example of a circuit using a OR gate that remembers a 1, because once the output reaches 1 it can’t be undone.

![](https://i.imgur.com/c15dXgP.jpeg)

- **remember a 0:** This is an example of a circuit using a AND gate that remembers a 0, because once the output reaches 0 it can’t be undone.

![](https://i.imgur.com/5TKMa9H.jpeg)

##### AND-OR Latch

An AND-OR latch is a combination of these permanent remember 0s and 1s gates, where you have two input bits that when inputted into the circuit, have meaningful controls:

- **set bit:** If set to 1, then it sets the stored output to 1, else does nothing.
- **reset bit:** If turned on to 1, the reset essentially resets the output to 0.


![](https://i.imgur.com/ysJHCpS.jpeg)

If both the set and reset bits are 0, then it just outputs whatever was the previously stored output. 

> [!NOTE]
> In other words, it remembers a bit of information, hence memory.


##### Gated latch

The gated latch circuit is an improvement to the AND-OR latch and is the backbone of modern memory.

This gate takes in two inputs and has an output that is the stored, remembered bit. Here are the components for this gated latch circuit:

- **DATA IN bit:** The bit value to write to storage, where writing a 0 stores 0, writing a 1 stores 1.
- **WRITE ENABLE bit:** A boolean flag where if turned on to 1, it allows writing to storage, but if turned off to 0, then no writing is allowed and the stored bit cannot be overwritten.

![](https://i.imgur.com/01dzPGG.jpeg)


#### Registers

Just remembering one bit isn’t that useful, but by combining multiple gated latches together, we can store multiple bits of information.

A grouping of gated latches working together to store a single binary number is what’s called a **register**, where the number of bits the register can remember (number of gated latches there are) is called the **width** of the register

We can enable writing to a register by running one wire across all the WRITE ENABLE bits for each gated latch, being able to control all the read/write permissions for all the gated latches simultaneously.


![](https://i.imgur.com/jq3N11u.jpeg)

Building a register via making a circuit of gated latches together works okay for a small register width, but quickly becomes intractable when trying to make many registers, each with large widths, because of the amount of wires you have to set up:

For a register with width $n$, here is how many wires we would need in this naive model:

- **data in wires: $n$ wires**
- **data out wires: $n$ wires**
- **write enable wires:** 1 wire.

So in total, for a register with width $n$, we would need $2n + 1$ wires.

> [!NOTE]
> If we wanted to store a 64 bit number (8 bytes), we would need 129 wires.

The solution is a latch matrix, where we arrange a bunch of latches into a grid. This gives us neat properties:

1. **less wires:** A register with width $n$ now only needs $n$ wires
2. **individual bit writing:** Rather than writing to all bits at once as we did for the previous model, we can choose individual bits in the register to read and write to one at a time.

This 16 x 16 latch matrix below is an example of creating a $256$ bit register with only 256 wires, halving the number of wires needed from the previous model.


![](https://i.imgur.com/Kaqt8Hb.jpeg)

To activate any one latch (write/read a bit) we have to send electricity through a corresponding row and columnn wire turning them on by sending a 1 bit down both the row and column wires, where at their intersection they wire into the desired gated latch.

The desired behavior is to activate the gated latch at the intersection of the row and column wire we send electricity down, and to leave all other gated latches inactive.

How do we get this behavior? Here’s the process:

1. Send a 1 down a row wire and 1 down a column wire.
    
2. The gated latch at the wire intersection should have a preliminary AND gate which tests if the gated latch is being selected.


![](https://i.imgur.com/FCztVX6.jpeg)


3. Based on the value of the AND gate, reading and writing to the latch gate is either enabled or disabled.
    
    1. If the result of the AND gate is 0, then both read/write are disabled.
    2. If the result of the AND gate is 1 (only when row and column wires are both set to 1) and we set WRITE ENABLE to 1, then writing is enabled.
    3. If the result of the AND gate is 1 (only when row and column wires are both set to 1) and we set READ ENABLE to 1, then reading is enabled.

This matrix can target individual bits to read and write to by identifying the row and column gated latch to target. If we have a $n \times n$ matrix, then there are $n$ possible rows and columns, and thus we use $\log_2 n$ bits to uniquely identify a row and $\log_2 n$ bits to uniquely identify a column.

Then the address for a specific latch just concatenates the row identifier binary number and the column identifier binary number together.

- **multiplexer**: In a 16 x 16 matrix, row 12 corresponds to binary number 1100, and column 8 corresponds to binary number 1000, so the address of the gated latch within the 256 bit register storing a specific bit is 11001000

To convert between a gated latch address to actually sending 1s down the associated row and column wires, we use the **multiplexer** component, which is a fancy name for something that does something really simple: it just converts a binary number $b$ to its decimal version $d$ and chooses the $d$th row or column.

We need one multiplexer for the column and one multiplexer for the row.

Here is the final abstraction for 256 bits:


![](https://i.imgur.com/GM4Kd09.jpeg)


Using a 16 x 16 latch matrix for our memory, here is the microarchitecture:

- **input 8-bit address:** The 8-bit address used to select the desired gated latch
- **data:** A single bit of data to pass into the selected gated latch’s DATA IN wire
- **WRITE ENABLE:** A single bit of data to pass into the selected gated latch’s WRITE ENABLE wire
- **READ ENABLE:** A single bit of data to pass into the selected gated latch’s READ ENABLE wire

#### RAM

Rather than just writing one bit at a time, it’s much more convenient to write bytes of data at a time, where we can store 256 bytes at 256 different addresses



![](https://i.imgur.com/hhfclUC.jpeg)

This is basically a single building block of RAM because we can randomly access any byte of data in any order (by giving a gated latch address).

We can combine these RAM blocks together and make larger matrices (and larger gated latch addresses) to make RAM that’s a gigabyte or more.

### CPU

#### Intro

The CPUs main purpose is to execute two types of instructions:

1. **arithmetic instructions:** Hands off arithmetic instruction operations to the ALU, giving the data from the registers as needed.
2. **memory instructions:** Reads from RAM and registers to execute instructions requiring memory.

The CPU requires these special components to work properly:

- **list of registers:** Available registers for holding variable data
- **instruction address register:** The address of the current CPU instruction in RAM is stored here, so the CPU fetches this address from RAM to get the actual instruction operation code from that address.
- **instruction register:** A register used for storing the current instruction operation code the CPU should execute.

Here is a high-level overview of the phases the CPU goes through to complete a single instruction:

1. **fetch phase:** Fetches the instruction code from RAM which lives under the instruction address stored in the instruction address register
2. **decode phase:** Decodes the fetched instruction code into an OPCODE and payload, and then runs the OPCODE through several circuits to discover which instruction it corresponds to.
3. **execute phase:** Once the specific instruction is discerned, CPU can read/write to RAM and also write data to registers.
4. **repeat:** The CPU increments the instruction address stored in the instruction address register so it can repeat the cycle with a new instruction.

To continuously run the CPU through loops of these phases, called a **cycle**, CPUs have a **clock**, and the speed at which a CPU can complete an entire cycle is called **clock speed**, measured in hertz.

- 1 Hz = 1 cycle per second, meaning this would be a CPU that could only execute one instruction per second.
- Modern computers have over 4 GHz of clock speed.
- To much overclocking (speeding up your clock beyond the hardware capacities) will overburden your computer.

#### Fetch phase

Fetch phase is all about initializing the CPU with the instruction it has to do.


![](https://i.imgur.com/kvOHZfw.jpeg)

1. When the computer boots up, all registers are initialized to 0.
2. The CPU reads the instruction address from the instruction address register, which has the decimal value of 0 (since all registers were initialized to 0).
3. The CPU then takes the instruction address of 0, fetches that address in RAM, and gets back the instruction code from that.
4. The CPU stores the instruction code in the instruction register.

#### Decode phase

The decode phase is all about using logic gates to actually decode the instruction code currently loaded in the instruction register.


![](https://i.imgur.com/BoXfMyn.jpeg)

There are two components to the instruction code we fetched from RAM:

1. **OPCODE:** The first half of the binary number is the OPCODE, or the actual CPU instruction that should be run.
2. **payload:** The second half of the binary number is the payload to use in the CPU instruction. In this case, since the opcode is 0010, the payload is the 4-bit RAM address to fetch from RAM.


![](https://i.imgur.com/bvUkR0G.jpeg)

During the decoding phase, we need to find out which instruction the OPCODE corresponds to, which we can do via a different logic gate circuit for each specific type of instruction.


![](https://i.imgur.com/DVSkUJq.jpeg)

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