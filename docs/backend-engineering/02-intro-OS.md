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