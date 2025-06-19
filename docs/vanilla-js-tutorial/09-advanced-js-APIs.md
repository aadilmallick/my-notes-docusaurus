# Advanced JS: APIs

## Eyedropper API

The Eyedropper API in chrome is experimental and only works on chrome 95 and above. It allows the user to pick any color from a webscreen. 

### Basic Use

```ts
// 1. create an abort controller
const abortController = new AbortController();

// 2. override default. On ESC press, stop color picker
window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape") {
	this.abortController.abort();
  }
})

if (window.EyeDropper) {
	// 3. create eyedropper instance
	const eyeDropper = new window.EyeDropper();
	// 4. get selected hex color code
	const {sRGBHex} = await eyeDropper.open({
          signal: this.abortController.signal,
	});
}
```

Keep in mind that the async call can fail and throw an error for two reasons: 

1. Popup didn't close fast enough, so it gets mistaken for a user selection cancel. Solution is to close the popup window and use the abort controller.
2. Eyedropper must be triggered by a user gesture, so you can only display it after a user press.

### Class

You need to provide your own type definitions for the API since type support is limited. 

```ts
interface ColorSelectionOptions {
  signal?: AbortSignal;
}

interface ColorSelectionResult {
  sRGBHex: string;
}

interface EyeDropper {
  open: (options?: ColorSelectionOptions) => Promise<ColorSelectionResult>;
}

interface EyeDropperConstructor {
  new (): EyeDropper;
}

interface Window {
  EyeDropper?: EyeDropperConstructor | undefined;
}
```

```ts
export default class EyedropperManager {
  private abortController = new AbortController();
  private cb!: (event: KeyboardEvent) => void;

  async getColor() {
    this.cb = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        this.abortController.abort();
      }
    };
    if (window.EyeDropper) {
      const eyeDropper = new window.EyeDropper();
      window.addEventListener("keydown", this.cb);
      try {
        const result = await eyeDropper.open({
          signal: this.abortController.signal,
        });
        window.removeEventListener("keydown", this.cb);
        return result.sRGBHex;
      } catch (e) {
        window.removeEventListener("keydown", this.cb);
        console.warn("eyedropper error", e);
        return null;
      }
    } else {
      return null;
    }
  }

  static hasAPI() {
    return Boolean(window.EyeDropper);
  }
}
```

## Notification

The `Notification` class allows to us to create notifications and check the permissions. As soon as you instantiate an instance, a notification is created. We can create a notification like this:

```javascript
new Notification("title", options);
```

`options`is an object with the following properties:

- `body`: The body of the notification, **String**.
- `icon`: The URL of the icon to display, **String**.
- `data`: An object you set as a pyload of data to pass along with the notification

```javascript
if (Notification.permission === "granted") { 
	// permission was already granted to display notification 
}

async function displayNotification() {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("title", {
      body: "body text",
    });
  }
}

displayNotification();
```

- `Notification.requestPermission()`: Requests the user to turn on notifications. This returns a promise that resolves to the permission of the notification. This can be one of the following values:
  - `"granted"`: The user has granted permission.
  - `"denied"`: The user has denied permission.
  - `"default"`: The user has not yet made a decision.
- `Notification.permission`: This is the permission of the notification. This can be one of the following values:
  - `"granted"`: The user has granted permission.
  - `"denied"`: The user has denied permission.
  - `"default"`: The user has not yet made a decision.

### Methods

- `notification.close()`: closes the notification.

### Events

We can listen for events that happen to the notification using the `addEventListener()` syntax:

```javascript
notification.addEventListener("click", () => {
  console.log("clicked");
});

notification.addEventListener("closed", () => {
  console.log("closed");
});
```

Here are the events we can listen for:

- `click`: This is fired when the user clicks on the notification.
- `close`: This is fired when the user closes the notification.

## Performance

### Basics

The `performance` object is built into the browser and provides a way to measure the performance of our code. We can use it to measure the time it takes for our code to run.

It has this concept of **entries**, where it automatically adds things loading into the DOM into its entries array and measures its performance, but we can also add our own entries too.

#### Setting up Marks

We can add our own entries by using the `performance.mark(markName)` method. This takes a string as an argument, which is the name of the mark. Then we would run some code, and then create another mark.

```javascript
performance.mark("bubble sort start");
// run bubble sort
performance.mark("bubble sort end");
```

Then we can use the `performance.measure()` method to measure the time elapsed between the two marks. This takes three arguments:

```javascript
performance.measure(measureName, startMark, endMark);
```

- `measureName`: The name of the measure, **String**. This becomes an entry in the performance's entries.
- `startMark`: The name of the mark to start measuring from, **String**.
- `endMark`: The name of the mark to end measuring at, **String**.

To find the duration of the measure, we can use the `performance.getEntriesByName()` method, which takes the name of the entry as an argument and returns an array of entries. We can then get the duration of the measure by accessing the `duration` property of the first entry in the array.

```javascript
const duration = performance.getEntriesByName(measureName)[0].duration;
```

The `performance.getEntriesByName(measureName)` method returns a `PerformanceMeasure[]` type, where each object has the following properties:

- `name`: The name of the measure, **String**.
- `entryType`: The type of entry, **String**. This will always be `"measure"` is we set it ourselves, or `"resource"` if automatically loaded from DOM.
- `startTime`: The time the measure started, **Number**. This is measured in milliseconds since the page started loading.
- `duration`: The duration of the measure, **Number**. This is measured in milliseconds.

#### Entries

You can see all the entries on the performance object by using the `performance.getEntries()` method, which returns an array of all the entries.

There are other ways to get entries, as shown by these methods:

- `performance.getEntriesByType(type)`: This returns an array of entries of a certain type. The type can be one of the following values:
  - `"mark"`: Returns all the marks.
  - `"measure"`: Returns all the measures.
  - `"resource"`: Returns all the resources loaded into the DOM.
- `performance.getEntriesByName(name)`: This returns an array of entries with a certain name.

### DOM performance

To see the loading time of all our images, we first get entries with the type `"resource"`, and then look to the initiator type for `"img"`:

```javascript
// must wait for all images to load
window.addEventListener("load", () => {
  performance
    .getEntriesByType("resource")
    .filter((entry) => entry.initiatorType === "img")
    .forEach(({ name, duration }) => {
      console.log(`The image at this URL: ${name} took ${duration}ms to load`);
    });
});
```

## Web Audio

### Basics

We can create sounds with the web audio API by first creating something called an `AudioContext`. This is the main object that we will use to create and manipulate sounds. We can create an `AudioContext` like this:

```javascript
const audioContext = new AudioContext();
```

Then the actual things that play our sounds are called oscillators, which are simple one-time use sound generators. We can create an oscillator like this:

```javascript
const oscillator = audioContext.createOscillator();
```

We can then configure the oscillator to play sounds by configuring some of its values, which are determined by these properties:

- `oscillator.type`: The type of sound to play. This can be one of the following values:
  - `sine`: A sine wave
  - `square`: A square wave
  - `sawtooth`: A sawtooth wave
  - `triangle`: A triangle wave
- `oscillator.frequency.value`: The frequency of the sound to play, **Number**. This is measured in hertz (Hz), which is the number of cycles per second. The human ear can hear sounds between 20 Hz and 20,000 Hz.

We can then connect the oscillator to the `AudioContext`'s destination, which is the thing that actually plays the sound. We can do this like this:

```javascript
oscillator.connect(audioContext.destination);
oscillator.start();
```

- `oscillator.start()`: This starts the oscillator playing. It will play until we call `oscillator.stop()`.
- `oscillator.stop()`: This stops the oscillator playing.

```javascript
// 1. Create an AudioContext
const audioContext = new AudioContext();
// 2. Create an Oscillator
let oscillator = audioContext.createOscillator();

// 3. Configure the Oscillator
oscillator.type = "sawtooth";
oscillator.frequency.value = 440;

// 4. Connect the Oscillator to the AudioContext's destination
oscillator.connect(audioContext.destination);

// 5. Start the Oscillator
oscillator.start();

setTimeout(() => {
  oscillator.stop();
}, 1000);
```


### Audio Visualization Project

```ts
class AudioContextManager {
  public audioContext: AudioContext;
  private analyzerNode?: AnalyserNode;
  constructor() {
    this.audioContext = new AudioContext();
  }
  static async getStream(options?: { clean: boolean }) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: options?.clean
        ? true
        : {
            autoGainControl: false,
            noiseSuppression: false,
            echoCancellation: false,
            sampleRate: 44100,
          },
    });
    return stream;
  }

  async initAudioContext(options?: { clean: boolean }) {
    const stream = await AudioContextManager.getStream(options);
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyzerNode = new AnalyserNode(this.audioContext, {
      fftSize: 256,
    });
    source.connect(this.audioContext.destination);
    source.connect(this.analyzerNode);
  }

  drawVisualizer(canvas: HTMLCanvasElement) {
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) {
      throw new Error("Canvas context not found");
    }
    const draw = () => {
      if (this.analyzerNode) {
        const bufferLength = this.analyzerNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyzerNode.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        dataArray.forEach((data) => {
          const barHeight = data / 2;
          canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
          canvasCtx.fillRect(
            x,
            canvas.height - barHeight / 2,
            barWidth,
            barHeight
          );
          x += barWidth + 1;
        });
      }
      requestAnimationFrame(draw);
    };
    draw();
  }
}

function createCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.75;
  document.body.appendChild(canvas);
  return canvas;
}

const canvas = createCanvas();
const audioContextManager = new AudioContextManager();
const btn = document.querySelector("button");

btn?.addEventListener("click", async () => {
  await audioContextManager.initAudioContext();
  audioContextManager.drawVisualizer(canvas);
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.75;
});
```

## Other APIs

### Aborting fetch requests

We can use the `AbortController` class to abort fetch requests if they are taking too long.

The main steps are these:

1. Instantiate an abort controller with `new AbortController()`
2. Connect the abort controller to our fetch call by attaching the `signal` property of the abort controller to the `signal` property of the fetch options object.
3. Call `abort()` on the abort controller after a certain amount of time. The previous connection through the `signal` property will cause the fetch request to abort.

```javascript
async function fetchWithTimeout(
  url: string,
  // RequestInit is the interface for the fetch options object
  options: RequestInit = {},
  timeout = -1
) {
  // user has specified they want a timeout for fetch
  if (timeout > 0) {
    let controller = new AbortController();
    // connect controller to our fetch request through the options object and on options.signal
    options.signal = controller.signal;

    setTimeout(() => {
      // this aborts the controller and any connected fetch requests
      controller.abort();
    }, timeout);
  }

  // need to pass options into fetch so that we get signal connection to abort controller
  return fetch(url, options);
}

// fetches google with a timeout of 1 second, aborting the request if it takes any longer
fetchWithTimeout("https://google.com", {}, 1000);
```

Here is a simpler example: 

```ts
let abortController = new AbortController();
 
fetch('wikipedia.zip', { signal: abortController.signal })
  .catch(() => console.log('aborted!'));
 
// Abort the fetch after 10ms
setTimeout(() => abortController.abort(), 10);
```

#### `AbortSignal.any()`

The `AbortSignal.any(signals)` method takes in an array of `AbortSignal[]` and returns a new signal that if any of the provided signals in the array get aborted, the enw signal also gets aborted.

The main use case for this is if you want to automatically abort something conditionally based on the abortion of another signal.

```ts
const { signal: firstSignal } = new AbortController();
fetch("https://example.com/", { signal: firstSignal });

const { signal: secondSignal } = new AbortController();
fetch("https://example.com/", { signal: secondSignal });

// Cancels if either `firstSignal` or `secondSignal` is aborted
const signal = AbortSignal.any([firstSignal, secondSignal]);
await fetch("https://example.com/slow", { signal });
```****

### Web Payments API

Here is how to use the web payments api:

1. Setup a payment method, like google pay
2. Setup products to buy
3. Create a new `PaymentRequest` object instance
4. Initiate payment request by awaiting `paymentRequest.show()`, which returns a payment response
5. Complete the payment request by awaiting `paymentResponse.complete("success")`, which will return the payment success details, which includes card number and shipping address of the customer.

```ts
// 1. create payment methods
const paymentMethods: PaymentMethodData[] = [
  {
    supportedMethods: "https://google.com/pay",
    data: {
      environment: "TEST", // Use 'PRODUCTION' in a live environment
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: [
              "AMEX",
              "DISCOVER",
              "JCB",
              "MASTERCARD",
              "VISA",
            ],
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example", // Replace with your gateway
              gatewayMerchantId: "exampleMerchantId", // Replace with your merchant ID
            },
          },
        },
      ],
      merchantInfo: {
        merchantName: "Example Merchant",
        merchantId: "01234567890123456789", // Replace with your Google Pay merchant ID
      },
    },
  },
];

// 2. create products
const paymentDetails: PaymentDetailsInit = {
  total: {
    label: "Total",
    amount: { currency: "USD", value: "3.00" },
  },
  displayItems: [
    { label: "Item 1", amount: { currency: "USD", value: "1.50" } },
    { label: "Item 2", amount: { currency: "USD", value: "1.50" } },
  ],
};

// 3. create request
const request = new PaymentRequest(paymentMethods, paymentDetails);

async function showRequest() {
  try {
    const canMakePayment = await request.canMakePayment();
    // 4. initiate request
    const paymentResponse = await request.show();
    // 5. complete request
    await paymentResponse.complete("success");
    console.log("Payment successful");
  } catch (error) {
    console.error(error);
  }
}
```

Anyway, here's the whole fucking class:

```ts
export class WebPaymentManager {
  private paymentDetails: PaymentDetailsInit;
  private paymentMethods?: PaymentMethodData[];
  private paymentRequest?: PaymentRequest;
  constructor(items: PaymentItem[]) {
    this.paymentDetails = this._constructCart(items);
  }

  private _constructCart(items: PaymentItem[]) {
    return {
      total: {
        label: "Total",
        amount: {
          currency: "USD",
          value: items
            .reduce((acc, item) => acc + Number(item.amount.value), 0)
            .toString(),
        },
      },
      displayItems: items,
    } as PaymentDetailsInit;
  }

  constructCart(items: PaymentItem[]) {
    this.paymentDetails = this._constructCart(items);
    this.setupPayment();
  }

  async canMakePayment() {
    if (!this.paymentRequest) {
      throw new Error("Payment request not set");
    }
    return await this.paymentRequest.canMakePayment();
  }

  async makePayment() {
    try {
      if (!this.paymentRequest) {
        throw new Error("Payment request not set");
      }
      const canMakePayment = await this.paymentRequest.canMakePayment();
      if (!canMakePayment) {
        throw new Error("Cannot make payment");
      }
      const paymentResponse = await this.paymentRequest.show();
      await paymentResponse.complete("success");
      return paymentResponse;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  setupPayment() {
    if (!this.paymentMethods) {
      throw new Error("Payment methods not set");
    }
    this.paymentRequest = new PaymentRequest(
      this.paymentMethods!,
      this.paymentDetails
    );
  }

  setupPaymentMethod({
    gateway,
    gatewayMerchantId,
    merchantName,
    merchantId,
    environment = "TEST",
  }: {
    environment?: "TEST" | "PRODUCTION";
    gateway: string;
    gatewayMerchantId: string;
    merchantName: string;
    merchantId: string;
  }) {
    this.paymentMethods = [
      {
        supportedMethods: "https://google.com/pay",
        data: {
          environment: environment, // Use 'PRODUCTION' in a live environment
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: "CARD",
              parameters: {
                allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                allowedCardNetworks: [
                  "AMEX",
                  "DISCOVER",
                  "JCB",
                  "MASTERCARD",
                  "VISA",
                ],
              },
              tokenizationSpecification: {
                type: "PAYMENT_GATEWAY",
                parameters: {
                  gateway: gateway || "", // Replace with your gateway
                  gatewayMerchantId: gatewayMerchantId || "", // Replace with your merchant ID
                },
              },
            },
          ],
          merchantInfo: {
            merchantName: merchantName || "",
            merchantId: merchantId || "", // Replace with your Google Pay merchant ID
          },
        },
      },
    ];
  }
}
```

And here's how you'd use it:

```ts
const paymentManager = new WebPaymentManager([
  { label: "Item 1", amount: { currency: "USD", value: "1.50" } },
  { label: "Item 2", amount: { currency: "USD", value: "1.50" } },
]);
paymentManager.setupPaymentMethod({
  gateway: "example",
  gatewayMerchantId: "exampleMerchantId",
  merchantName: "Example Merchant",
  merchantId: "01234567890123456789",
  environment: "TEST",
});
paymentManager.setupPayment();

document.querySelector("#pay").addEventListener("click", async () => {
  const details = await paymentManager.makePayment();
  if (!details) {
    console.error("Payment failed");
    return;
  }
  console.log(details);
});
```
### FileSystem API

The new filesystem API allows you to open and directly read from and write to the user's file system.

Here are the typescript types required:

```ts title="types.d.ts"
// Basic types
type FileSystemPermissionMode = "read" | "readwrite";
type FileSystemHandleKind = "file" | "directory";

interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode;
}

// FileSystemHandle (shared between file and directory)
interface FileSystemHandle {
  readonly kind: FileSystemHandleKind;
  readonly name: string;

  isSameEntry(other: FileSystemHandle): Promise<boolean>;
  queryPermission(
    descriptor?: FileSystemPermissionDescriptor
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemPermissionDescriptor
  ): Promise<PermissionState>;
}

interface FileSystemPermissionDescriptor {
  mode?: "read" | "readwrite";
}

// FileSystemFileHandle
interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: "file";

  getFile(): Promise<File>;
  createWritable(
    options?: FileSystemCreateWritableOptions
  ): Promise<FileSystemWritableFileStream>;
}

// FileSystemDirectoryHandle
interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: "directory";

  getFileHandle(
    name: string,
    options?: GetFileHandleOptions
  ): Promise<FileSystemFileHandle>;
  getDirectoryHandle(
    name: string,
    options?: GetDirectoryHandleOptions
  ): Promise<FileSystemDirectoryHandle>;
  removeEntry(name: string, options?: RemoveEntryOptions): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemHandle>;
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemHandle]>;
}

// Writable stream for saving files
interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string | WriteParams): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
  close(): Promise<void>;
}

interface WriteParams {
  type: "write";
  position?: number;
  data: BufferSource | Blob | string;
}

// Options
interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean;
}

interface GetFileHandleOptions {
  create?: boolean;
}

interface GetDirectoryHandleOptions {
  create?: boolean;
}

interface RemoveEntryOptions {
  recursive?: boolean;
}

// File picker options
interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

type StartInType =
  | "desktop"
  | "documents"
  | "downloads"
  | "pictures"
  | "videos"
  | "music"
  | FileSystemHandle;

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  startIn?: FileSystemHandle | string;
}

interface DirectoryPickerOptions {
  id?: string;
  mode?: FileSystemPermissionMode;
  startIn?: FileSystemHandle | string;
}

// Global functions
declare function showOpenFilePicker(
  options?: OpenFilePickerOptions
): Promise<FileSystemFileHandle[]>;
declare function showSaveFilePicker(
  options?: SaveFilePickerOptions
): Promise<FileSystemFileHandle>;
declare function showDirectoryPicker(
  options?: DirectoryPickerOptions
): Promise<FileSystemDirectoryHandle>;

```

Here is an example of prompting the user to open a file, and then getting the file data off the file handle.

```ts
// opens file you choose and reads
document.querySelector("#open-file").addEventListener("click", async () => {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "Text files",
        accept: {
          "text/*": [".txt", ".md", ".html", ".css", ".json", ".csv"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  });
  const file = await fileHandle.getFile();
  console.log(file);

  document.querySelector("textarea")!.textContent = await file.text();
});

// opens directory you choose and logs out all subfile and subfolder handles
document.querySelector("#open-dir").addEventListener("click", async () => {
  const dirHandle = await window.showDirectoryPicker();
  console.log(dirHandle);
  for await (const entry of dirHandle.values()) {
    console.log(entry);
  }
});

document.querySelector("#save-as").addEventListener("click", async () => {
  const fileHandle = await window.showSaveFilePicker({
    types: [
      {
        description: "Text files",
        accept: {
          "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
        },
      },
    ],
  });
  const writable = await fileHandle.createWritable();
  await writable.write(document.querySelector("textarea")!.textContent);
  await writable.close();
});
```

- `window.showOpenFilePicker(options)`: for opening a file and retrieving info about it. Returns a **file handle**
- `window.showDirectoryPicker(options)`: for opening a folder and retrieving info about it. Returns a **directory handle**

**file handles**

With a file handle, you can do stuff like writing to the file, and reading from it:

```ts
  async function writeData(
    fileHandle: FileSystemFileHandle,
    data: Blob | string
  ) {
	 // create a writable, write to it, close it.
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
```



**directory handles**

With directory handles, you can do stuff like creating file handles and directory handles nested within it, and iterate over all the file handles and directory handles in the folder.

```ts
async function example(dirHandle: FileSystemDirectoryHandle) {
	// 1. create new file handle in directory
	const testHandle = dirHandle.getFileHandle("test.txt", { create: true });
	// 2. delete file handle (deletes files)
	await dirHandle.removeEntry(testHandle)
	// 3. create new folder handle in directory
	const subdirHandle = dirHandle.getDirectoryHandle("subdir", { create: true });

}
```

You can read all file handles from a directory like so:

```ts
async function readDirectoryHandle(dirHandle: FileSystemDirectoryHandle) {
	const values = await Array.fromAsync(dirHandle.values());
	return values; // returns array of file handles
}
```

**basic class**

Here's a basic class:

```ts
type FileAcceptType = {
  description: string;
  accept: Record<string, string[]>; // MIME type to file extension
};

export class FileSystemManager {
  // region READ
  static async openSingleFile(types: FileAcceptType[]) {
    const [fileHandle] = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: false,
    });
    return fileHandle;
  }

  static async openMultipleFiles(types: FileAcceptType[]) {
    const fileHandles = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: true,
    });
    return fileHandles;
  }

  static async openDirectory({
    mode = "read",
    startIn,
  }: {
    mode?: "read" | "readwrite";
    startIn?: StartInType;
  }) {
    const dirHandle = await window.showDirectoryPicker({
      mode: mode,
      startIn: startIn,
    });
    return dirHandle;
  }

  static async readDirectoryHandle(dirHandle: FileSystemDirectoryHandle) {
    const values = await Array.fromAsync(dirHandle.values());
    return values;
  }

  static getFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.getFileHandle(filename, { create: false });
  }

  static async getFileDataFromHandle(
    handle: FileSystemFileHandle,
    options?: { type?: "blobUrl" | "file" | "arrayBuffer" }
  ): Promise<File>;
  static async getFileDataFromHandle(
    handle: FileSystemFileHandle,
    options: { type: "blobUrl" }
  ): Promise<string>;
  static async getFileDataFromHandle(
    handle: FileSystemFileHandle,
    options: { type: "arrayBuffer" }
  ): Promise<ArrayBuffer>;
  static async getFileDataFromHandle(
    handle: FileSystemFileHandle,
    options?: {
      type?: "blobUrl" | "file" | "arrayBuffer";
    }
  ) {
    const file = await handle.getFile();
    if (options?.type === "blobUrl") {
      return URL.createObjectURL(file);
    }
    if (options?.type === "arrayBuffer") {
      return file.arrayBuffer();
    } else {
      return file;
    }
  }

  // region CREATE
  static createFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.getFileHandle(filename, { create: true });
  }

  // region DELETE
  static deleteFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.removeEntry(filename);
  }

  static deleteFolderFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    folderName: string
  ) {
    return dirHandle.removeEntry(folderName, {
      recursive: true,
    });
  }

  // region WRITE

  static async saveTextFile(text: string) {
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "Text files",
          accept: {
            "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
          },
        },
      ],
    });
    await this.writeData(fileHandle, text);
  }

  static FileTypes = {
    getTextFileTypes: () => {
      return {
        description: "Text files",
        accept: {
          "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
        },
      };
    },
    getVideoFileTypes: () => {
      return {
        description: "Video files",
        accept: {
          "video/*": [".mp4", ".avi", ".mkv", ".mov", ".webm"],
        },
      };
    },
    getImageFileTypes: () => {
      return {
        description: "Image files",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
        },
      };
    },
  };

  static async saveFile(options: {
    data: Blob | string;
    types?: FileAcceptType[];
    name?: string;
    startIn?: StartInType;
  }) {
    const fileHandle = await window.showSaveFilePicker({
      types: options.types,
      suggestedName: options.name,
      startIn: options.startIn,
    });
    await this.writeData(fileHandle, options.data);
  }

  private static async writeData(
    fileHandle: FileSystemFileHandle,
    data: Blob | string
  ) {
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
}
```

#### OPFS

Related to the filesystem API is OPFS (origin private file system) which allows the web to access and store local file data in web storage. It's basically a filesystem per origin that is unrelated to the user's filesystem, but you can copy over files from the local filesystem to the OPFS.

The **Origin Private File System** (part of the File System Access API spec) allows web apps to store **persistent files** that live **within the origin's private sandbox**. This is **never visible** to the user directly (i.e., not tied to the local filesystem UI). This is basically the same as web storage and has the same storage capacity as IndexedDB, meaning that it can be cleared at any time from the user.

You can see the amount of storage you have remaining with `navigator.storage.estimate()` method.

> Think of it as the app's internal hard drive that lives in the browser's storage quota.

Here are the benefits of using OPFS:

- efficient storage for large files
- fast local performance with read/write operations
- offline capability
- secure
- No file picker or permission prompt required.
- web workers can access the files stored on OPFS for high-performance operations


> [!NOTE] 
> Notion uses OPFS with read/write access to a local sqlite file on your disk to have fast operations before uploading to a cloud database. 

The OPFS API works the exact same way as the filesystem access API, except that you work with a special directory handle that points to the OPFS of the origin:

We use the `navigator.storage.getDirectory()` method to access this directory handle, and then we can use the same familiar FileSystem API methods we know to work with it.

```ts
const opfsRoot = await navigator.storage.getDirectory();
```


```ts
export class OPFS {
  private root!: FileSystemDirectoryHandle;

  constructor(root?: FileSystemDirectoryHandle) {
    if (root) {
      this.root = root;
    }
  }

  async initOPFS() {
    try {
      this.root = await navigator.storage.getDirectory();
      return true;
    } catch (e) {
      console.error("Error opening directory:", e);
      return false;
    }
  }

  public get directoryHandle() {
    return this.root;
  }

  private validate(): this is { root: FileSystemDirectoryHandle } {
    if (!this.root) {
      throw new Error("Root directory not set");
    }
    return true;
  }

  async getDirectoryContents() {
    this.validate();
    return await FileSystemManager.readDirectoryHandle(this.root);
  }

  async createFileHandle(filename: string) {
    this.validate();
    return await FileSystemManager.createFileFromDirectory(this.root, filename);
  }

  async getFileHandle(filename: string) {
    this.validate();
    return await FileSystemManager.getFileFromDirectory(this.root, filename);
  }

  async deleteFile(filename: string) {
    this.validate();
    await FileSystemManager.deleteFileFromDirectory(this.root, filename);
  }

  async deleteFolder(folderName: string) {
    this.validate();
    await FileSystemManager.deleteFolderFromDirectory(this.root, folderName);
  }

  static async writeToFileHandle(
    file: FileSystemFileHandle,
    data: string | Blob | ArrayBuffer
  ) {
    const writable = await file.createWritable();
    await writable.write(data);
    await writable.close();
  }
}
```

#### All together

```ts
type FileAcceptType = {
  description: string;
  accept: Record<string, string[]>; // MIME type to file extension
};

export class FileSystemManager {
  static async getFileSize(handle: FileSystemFileHandle) {
    const file = await handle.getFile();
    return file.size;
  }
  // region READ
  static async openSingleFile(types: FileAcceptType[]) {
    const [fileHandle] = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: false,
    });
    return fileHandle;
  }

  static async openMultipleFiles(types: FileAcceptType[]) {
    const fileHandles = await window.showOpenFilePicker({
      types,
      excludeAcceptAllOption: true,
      multiple: true,
    });
    return fileHandles;
  }

  static async openDirectory({
    mode = "read",
    startIn,
  }: {
    mode?: "read" | "readwrite";
    startIn?: StartInType;
  }) {
    const dirHandle = await window.showDirectoryPicker({
      mode: mode,
      startIn: startIn,
    });
    return dirHandle;
  }

  static async readDirectoryHandle(dirHandle: FileSystemDirectoryHandle) {
    const values = await Array.fromAsync(dirHandle.values());
    return values;
  }

  static async getDirectoryContentNames(dirHandle: FileSystemDirectoryHandle) {
    const keys = await Array.fromAsync(dirHandle.keys());
    return keys;
  }

  static async getStorageInfo() {
    const estimate = await navigator.storage.estimate();
    if (!estimate.quota || !estimate.usage) {
      throw new Error("Storage estimate not available");
    }
    return {
      storagePercentageUsed: (estimate.usage / estimate.quota) * 100,
      bytesUsed: estimate.usage,
      bytesAvailable: estimate.quota,
    };
  }

  /**
   * Recursively walks through a directory handle and returns all files
   * @param dirHandle The directory handle to walk through
   * @param path The current path (used for recursion)
   * @returns An array of objects containing file handles and their paths
   */
  static async walk(
    dirHandle: FileSystemDirectoryHandle,
    path: string = ""
  ): Promise<Array<{ handle: FileSystemFileHandle; path: string }>> {
    const results: Array<{ handle: FileSystemFileHandle; path: string }> = [];
    const entries = await this.readDirectoryHandle(dirHandle);

    for (const entry of entries) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === "file") {
        results.push({
          handle: entry as FileSystemFileHandle,
          path: entryPath,
        });
      } else if (entry.kind === "directory") {
        // Recursively walk through subdirectories
        const subDirHandle = entry as FileSystemDirectoryHandle;
        const subResults = await this.walk(subDirHandle, entryPath);
        results.push(...subResults);
      }
    }

    return results;
  }

  static getFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.getFileHandle(filename, { create: false });
  }

  static async getFileDataFromHandle(
    handle: FileSystemFileHandle,
    options?: {
      type?: "blobUrl" | "file" | "arrayBuffer";
    }
  ): Promise<File | string | ArrayBuffer> {
    const file = await handle.getFile();

    if (options?.type === "blobUrl") {
      return URL.createObjectURL(file);
    }

    if (options?.type === "arrayBuffer") {
      return file.arrayBuffer();
    }

    // Default return type is File
    return file;
  }

  // region CREATE
  static createFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.getFileHandle(filename, { create: true });
  }

  // region DELETE
  static deleteFileFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filename: string
  ) {
    return dirHandle.removeEntry(filename);
  }

  static deleteFolderFromDirectory(
    dirHandle: FileSystemDirectoryHandle,
    folderName: string
  ) {
    return dirHandle.removeEntry(folderName, {
      recursive: true,
    });
  }

  // region WRITE

  static async saveTextFile(text: string) {
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "Text files",
          accept: {
            "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
          },
        },
      ],
    });
    await this.writeData(fileHandle, text);
  }

  static FileTypes = {
    getTextFileTypes: () => {
      return {
        description: "Text files",
        accept: {
          "text/*": [".txt", ".md", ".html", ".css", ".js", ".json"],
        },
      };
    },
    getVideoFileTypes: () => {
      return {
        description: "Video files",
        accept: {
          "video/*": [".mp4", ".avi", ".mkv", ".mov", ".webm"],
        },
      };
    },
    getImageFileTypes: () => {
      return {
        description: "Image files",
        accept: {
          "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
        },
      };
    },
  };

  static async saveFile(options: {
    data: Blob | string;
    types?: FileAcceptType[];
    name?: string;
    startIn?: StartInType;
  }) {
    const fileHandle = await window.showSaveFilePicker({
      types: options.types,
      suggestedName: options.name,
      startIn: options.startIn,
    });
    await this.writeData(fileHandle, options.data);
  }

  private static async writeData(
    fileHandle: FileSystemFileHandle,
    data: Blob | string
  ) {
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }
}

export class OPFS {
  private root!: FileSystemDirectoryHandle;

  constructor(root?: FileSystemDirectoryHandle) {
    if (root) {
      this.root = root;
    }
  }

  async initOPFS() {
    try {
      this.root = await navigator.storage.getDirectory();
      return true;
    } catch (e) {
      console.error("Error opening directory:", e);
      return false;
    }
  }

  public get directoryHandle() {
    return this.root;
  }

  public get initialized() {
    return !!this.root;
  }

  private validate(): this is { root: FileSystemDirectoryHandle } {
    if (!this.root) {
      throw new Error("Root directory not set");
    }
    return true;
  }

  async getDirectoryContents() {
    this.validate();
    return await FileSystemManager.readDirectoryHandle(this.root);
  }

  async getFilesAndFolders() {
    this.validate();
    const entries = await FileSystemManager.readDirectoryHandle(this.root);
    const files = entries.filter(
      (entry) => entry.kind === "file"
    ) as FileSystemFileHandle[];
    const folders = entries.filter(
      (entry) => entry.kind === "directory"
    ) as FileSystemDirectoryHandle[];
    return {
      files,
      folders,
    };
  }

  async createFileHandle(filename: string) {
    this.validate();
    return await FileSystemManager.createFileFromDirectory(this.root, filename);
  }

  async createDirectory(folderName: string) {
    this.validate();
    const dirHandle = await this.root.getDirectoryHandle(folderName, {
      create: true,
    });
    return new OPFS(dirHandle);
  }

  async getDirectoryContentNames() {
    this.validate();
    return await FileSystemManager.getDirectoryContentNames(this.root);
  }

  async getFileHandle(filename: string) {
    this.validate();
    return await FileSystemManager.getFileFromDirectory(this.root, filename);
  }

  async deleteFile(filename: string) {
    this.validate();
    await FileSystemManager.deleteFileFromDirectory(this.root, filename);
  }

  async deleteFolder(folderName: string) {
    this.validate();
    await FileSystemManager.deleteFolderFromDirectory(this.root, folderName);
  }

  static async writeDataToFileHandle(
    file: FileSystemFileHandle,
    data: string | Blob | ArrayBuffer
  ) {
    const writable = await file.createWritable();
    await writable.write(data);
    await writable.close();
  }
}

export class DirectoryNavigationStack {
  constructor(
    private root: FileSystemDirectoryHandle,
    private stack: FileSystemDirectoryHandle[] = []
  ) {}

  public get isRoot() {
    return this.stack.length === 0;
  }

  public get fsRoot() {
    return this.root;
  }

  public get size() {
    return this.stack.length;
  }

  public push(dirHandle: FileSystemDirectoryHandle) {
    this.stack.push(dirHandle);
  }

  public pop() {
    return this.stack.pop();
  }

  public get currentDirectory() {
    return this.stack.at(-1) || this.root;
  }

  public get currentFolderPath() {
    if (this.isRoot) {
      return "/" + this.root.name;
    }
    return "/" + [this.root.name, ...this.stack.map((d) => d.name)].join("/");
  }

  public get parentFolderPath() {
    if (this.isRoot) {
      return "/" + this.root.name;
    }
    return (
      "/" +
      [this.root.name, ...this.stack.slice(0, -1).map((d) => d.name)].join("/")
    );
  }
}
```

### Navigator share API

The `navigator.share(options)` async method allows sharing media and urls like you can do on your phone. You pass in an object of options which configure the sharing behavior: 

- `title` : the share title
- `text` : the body text
- `url` : the url to share
- `files` : an optional property of `File[]` to share. You can share files this way.

```jsx
async function share() {

  const file = new File(["Hello, world!"], "hello-world.txt", {
    type: "text/plain",
  });

  await navigator.share({
    title: "Web Share API",
    text: "Hello World",
    url: "https://developer.mozilla.org",
    files: [file],
  });
}
```

Before you share with `navigator.share()`, you can see if content is shareable in the first place and prevent errors with `navigator.canShare()`: 

```ts
const data = {
  title: 'Item 1',
  text: 'This is the first item',
  url: 'https://example.com/item1',
};
const canShare = navigator.canShare(data);
canShare && navigator.share(data)
```

Anyway here's a class:

```ts
export class NavigatorShare {
  static async share(data: {
    title: string;
    text: string;
    url: string;
    files?: File[];
  }) {
    try {
      if (!this.canShare(data)) return false;
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error("Error sharing", error);
      return false;
    }
  }

  static canShare(data: {
    title: string;
    text: string;
    url: string;
    files?: File[];
  }) {
    return navigator.canShare(data);
  }
}
```
### Geolocation

The `navigator.geolocation.getCurrentPosition()` method allows us to get the current position of the user. The `navigator.geolocation.watchPosition()` listens for a position change. They both take two arguments:

- **Success method** : a callback function to run if the position was successfully retrieved
- **Error method** : a callback function to run if there was an error retrieving the position

```javascript
// getCurrentPosition gets the current position
navigator.geolocation.getCurrentPosition(displayGeoData, displayError);

// getCurrentPosition runs the passed in methods whenever the position changes
navigator.geolocation.watchPosition(displayGeoData, displayError);

const displayGeoData = (position) => {
  const { latitude, longitude } = position.coords;
  displayArea.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
};

const displayError = (err) => {
  displayArea.textContent = err.message;
};
```

### user media

```javascript
async function getMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const videoElement = document.querySelector("#videoElement");
    videoElement.srcObject = stream;
  } catch (e) {
    console.log("permission denied");
  }
}
```

The async `navigator.mediaDevices.getUserMedia()` method returns a promise that resolves to a `MediaStream` object. This takes an object as an argument, which specifies the type of media to get. This object can have the following properties:

- `audio`: Whether to get audio, **Boolean**.
- `video`: Whether to get video, **Boolean**.
- `screen`: Whether to get the screen, **Boolean**.
- `displaySurface`: The type of display surface to get. This can be one of the following values:
  - `"browser"`: The entire browser window.
  - `"monitor"`: The entire screen.
  - `"window"`: The entire window.
  - `"application"`: The application window.

```javascript
const stream = await navigator.mediaDevices.getUserMedia(options);
```

With this stream, you can then set this stream as the source of some video or audio element in your HTML.

### Intersection Observer

THe intersection observer API is used to asnychronously run some functionality when observed elements are visible in the viewport. Here are some possible use cases:

- lazy loading images
- Running animations on scroll

The main steps are to **create an observer** and then to observe elements by adding them to the entries.

```javascript
const observer = new IntersectionObserver(
  // iterate through the entries
  (entries) => {
    entries.forEach((entry) => {
      entry.isIntersecting
        ? console.log("element IS VISIBLE")
        : console.log("element IS NOT VISIBLE");
    });
  }
);

// observe elements
observer.observe(element);
```

The basic syntax for creating an observer is as follows:

```javascript
const observer = new IntersectionObserver(entriesCallback, options);
```

This observer will have the following methods:

- `observer.observe(element)`: This adds an element to the observer. This takes an element as an argument.
- `observer.unobserve(element)`: This removes an element from the observer. This takes an element as an argument.

Each entry has the following properties:

- `isIntersecting`: Whether the element is intersecting the viewport, **Boolean**.
- `isVisible`: Whether the element is visible in the viewport, **Boolean**.
- `target`: returns The HTML element that is being observed, **Element**.
- `intersectionRatio`: The percentage of the element that is visible in the viewport, **Number**. This is a number between 0 and 1, where 0 is not visible at all, and 1 is completely visible.
- `boundingClientRect`: The bounding client rectangle of the element, **DOMRectReadOnly**.
- `intersectionRect`: The intersection rectangle of the element, **DOMRectReadOnly**.

#### Threshold

`threshold` is the percentage of the element that must be visible in the viewport for it to be considered as _intersecting_. It is a number in between 0 and 1.

You cna also provide an array of values to trigger the callback multiple times, when different percentages of the element are visible.

```javascript
const observer = new IntersectionObserver(
  // iterate through the entries
  (entries) => {
    entries.forEach((entry) => {
      entry.isIntersecting &&
        console.log(`element is ${entry.intersectionRatio * 100}% visible`);
    });
  },
  {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  }
);
```


### Navigation

The navigation API is a new way to do navigation on the web instead of the history and popstate APIs.

```ts
function shouldNotIntercept(navigationEvent) {
  return (
    !navigationEvent.canIntercept ||
    // If this is just a hashChange,
    // just let the browser handle scrolling to the content.
    navigationEvent.hashChange ||
    // If this is a download,
    // let the browser perform the download.
    navigationEvent.downloadRequest ||
    // If this is a form submission,
    // let that go to the server.
    navigationEvent.formData
  );
}

function renderIndexPage() {}  // methods to render HTML for page
function renderCatsPage() {}

navigation.addEventListener('navigate', navigateEvent => {
  // Exit early if this navigation shouldn't be intercepted.
  if (shouldNotIntercept(navigateEvent)) return;

  const url = new URL(navigateEvent.destination.url);

  if (url.pathname === '/') {
    navigateEvent.intercept({handler: renderIndexPage});
  } else if (url.pathname === '/cats/') {
    navigateEvent.intercept({handler: renderCatsPage});
  }
});
```

The `navigateEvent` has these properties: 
- `navigateEvent.destination.url`: the url of where the navigation was trying to go
- `navigateEvent.canIntercept`: whether or not the navigation can be intercepted

And it has these methods: 
- `navigateEvent.preventDefault()`: prevents the navigation from occurring. This will not work if the user prevents the forward or back buttons to escape the site. 
- `navigateEvent.intercept({handler: async () => void})`: runs the specified async callback on page navigation. Basically use this to define your own code to replace the current page with a new page like how SPAs do it.

#### Navigation methods

Use the navigation methods to navigate while also setting state.

- `navigation.navigate(url)`: navigates to the specified url
- `navigation.reload()` : reloads the page

#### Navigation current entry and state

`navigation.currentEntry` provides access to the current entry. This is an object which describes where the user is right now. This entry includes the current URL, metadata that can be used to identify this entry over time, and developer-provided state.

`navigation.currentEntry` is just a special type of **NavigationEntry**, just like how `navigation.destination` is also a navigation entry. They both have the same properties and methods.

- `navigation.currentEntry.url`: the current url
- `navigation.currentEntry.key`: A unique representation of the current state and url

The most important thing about `navigation.currentEntry` is its ability to retrieve state. with the `navigation.currentEntry.getState()` method. However, this returned state is immutable and does not register changes to it. 

To actually change state, you need to do so in the navigation methods.

```ts
navigation.navigate(url, {state: newState});
// Or:
navigation.reload({state: newState});

const state = navigation.currentEntry.getState()
```

In the navigation event, you can also retrieve the state of the navigation's destination.

```ts
navigation.addEventListener('navigate', navigateEvent => {
  console.log(navigateEvent.destination.getState());
});
```


### Local Fonts

You can query for a user's local fonts like so, where you can get the fonts with the `window.queryLocalFonts()` async method. 

```ts
interface FontData {
  postscriptName: string;
  fullName: string;
  family: string;
  style: string;
}

type ChromePermissionName =
  | PermissionName
  | "microphone"
  | "camera"
  | "local-fonts"
  | "clipboard-read"
  | "clipboard-write";
export class NavigatorPermissions {
  static async checkPermission(permissionName: ChromePermissionName) {
    const result = await navigator.permissions.query({
      name: permissionName as PermissionName,
    });
    return result.state;
  }
}

class LocalFontManager {
  public availableFonts: FontData[] = [];

  async requestFonts() {
    try {
      const availableFonts = await window.queryLocalFonts();
      this.availableFonts = [...availableFonts];
    } catch (err) {
      console.error(err.name, err.message);
    }
  }

  async getLocalFontsPermission() {
    return await NavigatorPermissions.checkPermission("local-fonts");
  }
}
```

You can the load fonts locally in CSS by using the `@font-face` CSS rule, which would be associated with `font.family` value in javascript 

```css
@font-face {
  font-family: 'FlamboyantSansSerif';
  src: local('FlamboyantSansSerif');
}
```

You can also set fonts styling dynamically using javascript. 
## Proxies

Proxies in javascript allow you to do reactive programming. They give hooks into common operations concerning data, like getting or setting a property, and allow you to hook into that behavior and define it yourself. 

The use cases are follows: 

- **validating data**: throwing an error when a user tries to set something incorrectly
- **protecting data**: preventing a user from accessing a property they shouldn't have access to.
- **reactivity**: doing something each time a user accesses or sets the property.

### Proxy Essentials
#### Proxying objects

```jsx
const myObj = {
    name: "sally",
    age: 30
}

const handler = {
    get(target, property) {
        return `${target[property]} years old`
    },
    set(target, property, value) {
        console.log(`you modified ${target[property]} to be ${value}`)
    }
}

const myProxy = new Proxy(myObj, handler)
console.log(myProxy.age)
myProxy.age = 40;
```

The below function creates a proxy state that keeps track of one single property from an object.

```ts
export function createReactiveProxy<T extends string, V>(
  key: T,
  value: V,
  onSet: (newValue: V) => void
) {
  const proxy = new Proxy({ [key]: value } as Record<T, V>, {
    set(target, p, newValue, receiver) {
      onSet(newValue);
      return Reflect.set(target, p, newValue, receiver);
    },
  });
  return proxy;
}

export function createReactiveProxyMultipleProps<T extends Record<string, any>>(
  state: T,
  onSet: (state: T, propertyChanged: keyof T, newValue: T[keyof T]) => void
) {
  const proxy = new Proxy(state, {
    set(target, p, newValue, receiver) {
      onSet(target, p as keyof T, newValue as T[keyof T]);
      return Reflect.set(target, p, newValue, receiver);
    },
  });
  return proxy;
}

// for more concise syntax, adding individual listeners
export class StateManager<T extends Record<string, any>> {
  private cbs: Record<keyof T, (newValue: T[keyof T]) => void> = {} as Record<
    keyof T,
    (newValue: T[keyof T]) => void
  >;
  constructor(state: T) {
    this.state = createReactiveProxyMultipleProps(
      state,
      (state, propertyChanged, newValue) => {
        if (this.cbs[propertyChanged]) {
          this.cbs[propertyChanged](newValue);
        }
      }
    );
  }

  onChange<K extends keyof T>(key: K, callback: (newValue: T[K]) => void) {
    this.cbs[key] = callback as (newValue: T[keyof T]) => void;
  }

  state: T;
}

const state = createReactiveProxy("name", "John", (newValue) => {
  console.log("New value is", newValue);
});
```

#### Proxying and dispatching custom events

A common pattern is dispatching a custom event whenever a value changes in a proxy set hook.

```jsx
const reactiveStore = new Proxy(app.store, {
  set: (target, key, value) => {
    target[key] = value;
    switch (key) {
      case "menu":
        window.dispatchEvent(new CustomEvent("menu-updated"));
        break;
      case "cart":
        window.dispatchEvent(new CustomEvent("cart-updated"));
        break;
      default:
        break;
    }
  },
  get: (target, key) => {},
});
```

Here is a function that does exactly that: 

```ts
export class CustomEventManager<T = any> extends EventTarget {
  private listener?: EventListenerOrEventListenerObject;
  constructor(private name: string) {
    super();
  }

  onTriggered(callback: (event: Event & { detail: T }) => void) {
    this.listener = (e) => {
      callback(e as Event & { detail: T });
    };
    this.addEventListener(this.name, this.listener);
  }

  removeListener() {
    if (this.listener) this.removeEventListener(this.name, this.listener);
  }

  dispatch(data: T, eventInitDict?: CustomEventInit<T>) {
    this.dispatchEvent(
      new CustomEvent(this.name, { ...eventInitDict, detail: data })
    );
  }
}

// whenever property is changed, dispatch custom event
export function createReactiveProxyWithEvent<T extends string, V>(
  key: T,
  value: V,
  eventName: string
) {
  const proxyEvent = new CustomEventManager<Record<T, V>>(eventName);
  const proxy = new Proxy({ [key]: value } as Record<T, V>, {
    set(target, p, newValue, receiver) {
      proxyEvent.dispatch(target);
      return Reflect.set(target, p, newValue, receiver);
    },
  });
  return { proxy, proxyEvent };
}

const { proxy, proxyEvent } = createReactiveProxyWithEvent(
  "age",
  12,
  "nameChanged"
);
proxyEvent.onTriggered((e) => {
  alert(e.detail.age);
});

proxy.age = 20;
```
#### Proxying functions

You can also proxy functions, meaning you can access their args list before they get called with the `apply` trap.

```javascript
const handler = {
  apply: function (target, thisArg, argsList) {
    console.log(`Function ${target.name} called with args: ${argsList}`);
    return target.apply(thisArg, argsList);
  },
};

const add = new Proxy((a, b) => a + b, handler);
add(1, 2); // outputs "Function add called with args: [1,2]"
```

Here is a function I made:

```typescript
export function createReactiveFunction<T extends CallableFunction>(
  func: T,
  onCall: (argsList: any[]) => void
) {
  const proxy = new Proxy(func, {
    apply(targetFunc, thisArg, argArray) {
      onCall(argArray);
      return Reflect.apply(targetFunc, thisArg, argArray);
    },
  });
  return proxy;
}

const multiply = createReactiveFunction(
  (a: number, b: number) => a * b,
  (args) => {
    console.log("here are my args", args);
  }
);

console.log(multiply(5, 4));
```


### Proxies in depth

#### Singleton pattern by proxying classes

You can create an automatic singleton pattern by proxying a class constructor to ensure there is only ever one instance of the class. You do this by hooking into the `construct()` handler.

```ts
class Database {
    // ...
}

const DatabaseConnection = (() => {
    let instance;

    // Create a proxy for the class constructor
    const handler = {
        construct(target, args) {
            if (!instance) {
                instance = new Database();
            }
            return instance;
        },
    };

    return new Proxy(function() {}, handler);
})();

const connection = new DatabaseConnection()
```

This is a typescript-friendly version: 

```ts
class Database {
  constructor(public readonly name: string, private password: string) {
    console.log(`Database created! ${this.name}`);
  }
}

type ConstructorArgs<T extends new (...args: any[]) => any> = T extends new (
  ...args: infer A
) => any
  ? A
  : never;

const DB = (() => {
  let instance: Database | null = null;

  return new Proxy(Database, {
    construct(target, args) {
      if (!instance) {
        instance = new Database(...(args as ConstructorArgs<typeof Database>));
      }
      return instance;
    },
  });
})();

const db1 = new DB("db1", "password");
const db2 = new DB("db1", "password");
const db3 = new DB("db1", "password");
```
#### Hooking into has

The `has()` proxy hook allows you to override the `in` keyword functionality related to a proxy. It's super useful for clever things you can do.

```ts
const range = (min: number, max: number) =>
  new Proxy(Object.create(null), {
    has: (target, key: string) => +key >= min && +key <= max,
  });

console.log(3 in range(2, 12)); // true
```

You can take this one step further: 

```ts
function arrayProxy<T extends string | number>(arr: T[]) {
  return new Proxy(
    {
      array: arr,
    },
    {
      has: (target, key: string) => {
        if (typeof arr[0] === "number") {
          return arr.includes(+key as T);
        } else {
          return arr.includes(key as T);
        }
      },
    }
  );
}

const animalsArr = arrayProxy(["dog", "cat", "mouse"]);
console.log("dog" in animalsArr); // true
```


#### Cache proxies

This cache proxy code works by proxying a function and caching the return values.

```ts
function createCacheProxy<T extends any[], V>(
  func: (...args: T) => V,
  expirationTime = 60 * 60 * 1000
) {
  const cache = new Map<
    string,
    {
      data: V;
      timestamp: number;
    }
  >();
  return new Proxy(func, {
    apply: async (target, thisArg, args) => {
      const key = JSON.stringify(args);

      if (
        cache.get(key) &&
        Date.now() - cache.get(key)!.timestamp < expirationTime
      ) {
        console.log("Loading data from cache...");
        return cache.get(key)!.data;
      }

      const data = await target.apply(thisArg, args as T);
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      return data;
    },
  });
}
```

## Web Components

Web components are ways of creating custom HTML components that have their own HTML content, attributes, and styling that you can all change through javascript. 

Each web component is represented as a class that extends from the `HTMLElement` class.

### Basics

Here are the steps to create a web component: 

1. Create a class that extends from `HTMLElement`
    
    ```tsx
    export default class Navbar extends HTMLElement {
      constructor() {
        super();
      }
    }
    ```
    
2. Use the `customElements.define()` method to register the class as a custom component. It takes in two arguments: the element name and then the custom component class. 
    
    ```tsx
    customElements.define("nav-bar", Navbar);
    // will be rendered as <nav-bar>
    ```
    
3. Render the custom element as HTML and pass in any required `data-` attributes. For the web component to actually render anything, it must be first registered with `customElements.define()` method, so make sure to include the javascript code that runs that method call somewhere in your app bundle.
    
    ```tsx
    <nav-bar></nav-bar>
    ```

- `customElements.define(name: string, component: class)` : registers a component. If this is called more than once, you will get an error, so make sure to check if it's already registered.
- `customElements.get(name: string)` : gets the component class from the specified name if the component is registered. Use this in a singleton pattern to check if the component is already registered or not.

There are two types of web components: 

- **autonomous**: inheriting straight from `HTMLElement`
- **customized elements**: Inheriting from a preexisting element like `HTMLButtonElement`.

This is how you render and register an autonomous element: you render it by using its name.

```ts
class MyElement extends HTMLElement {
  constructor() { super(); /* ... */ }
  connectedCallback() { /* ... */ }
  disconnectedCallback() { /* ... */  }
  static get observedAttributes() { return [/* ... */]; }
  attributeChangedCallback(name, oldValue, newValue) { /* ... */ }
  adoptedCallback() { /* ... */ }
 }
customElements.define('my-element', MyElement);
```

```html
<my-element></my-element>
```

This is how you render and register a customized element: you render it by supplying the custom element name to the `is=` attribute on the element you're extending from.

```ts
class MyButton extends HTMLButtonElement { /*...*/ }
customElements.define('my-button', MyElement, {extends: 'button'});
```

```html
<button is="my-button">Click Me</button>
```
### Lifecycle Methods

You can hook into specific methods in a web component class that get activated throughout the component's lifecycle.

- `connectedCallback()` : triggered when element is added to document. Use only this whenever you need to deal with the DOM. 
- `constructor()`: an unimportant method for instantiating the element, but you CANNOT access any DOM stuff here, like attributes, content, etc. The only thing you can access are `data-` attributes, which can be accessed from `this.dataset`.
- `disconnectedCallback()` : triggered when element is removed from document. Use this to perform cleanup
- `attributeChangedCallback()` : triggered whenever one of the attributes from the static getter `observedAttributes` changes. It helps give you realtime updates on the attributes changing.

```ts
class MyElement extends HTMLElement {
	constructor() {
		super()
	}
  connectedCallback() {}     // triggered when element is added to document 
  disconnectedCallback() {}  // triggered when element is removed from document 
  adoptedCallback() {}       // triggered when element is moved to new document

  static get observedAttributes() : string[] {
	  return ["checked"]
  }

  attributeChangedCallback(attrName, oldVal, newVal) {}
}

customElements.define("my-element", MyElement)
```

### Template

We often use `<template>` elements to scaffold the content for the web component, since the DOM ignores those elements. 

```html
<template>
	<!-- content here -->
</template>
```

We can then clone the content from the template to get the content for the custom element: 

```ts
const template = document.getElementById("menu-page");
const content = template.content.cloneNode(true);
```

**Slots**

We can use the `<slot>` element to isnert nested content into the custom element, like children in React. The slot can have fallback content nested inside it. 

- You can have a default slot by just using `<slot>`
- You can have named slots by adding a `name=` to the `<slot>` element.

```html
<script>
customElements.define('user-card', class extends HTMLElement {
  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <div>Name:
        <slot name="username"></slot>
      </div>
      <div>Birthday:
        <slot name="birthday">January 1st 2018<slot>
      </div>
    `;
  }
});
</script>

<user-card>
  <span slot="username">John Smith</span>
  <span slot="birthday">01.01.2001</span>
</user-card>
```


> [!WARNING] 
> Only top level children nested in a custom element can use the `slot=` attribute. 


### Shadow DOM 

Although templates are great, they are affected by external CSS styling. To avoid this behavior, we need to use something called the **shadow DOM.**

In the shadow DOM, all elements you create in there will have separate styling and context from the rest of the elements in your HTML document. 

- The shadow DOM allows isolation for logic for your custom components.

There are a few rules you have to follow when using a shadow DOM

1. In the constructor, you may not add any children to your shadow DOM. 
2. You can start DOM manipulation with your shadow in the `connectedCallback()` callback, which runs after the element is rendered in the DOM. 

**Loading external CSS** 

```jsx
  async loadExternalCSS(file) {
    const request = await fetch(file);
    const css = await request.text();
    this.styles.textContent = css;
  }
```

There is a hacky way to load an external stylesheet as the styles for our template and the shadow DOM. All we have to do is to make a fetch request to our CSS file, get back the response as text, and inject the css text into a `<style>` tag. The steps are as follows: 

1. Fetch the css file, like `fetch("../styles/main.css")` 
2. Get the text using `request.text()` 
3. Create a `<style>` tag, append it to the shadow root DOM, and make it’s `textContent` equal to the parsed css text. 

```ts
export class MenuPage extends HTMLElement {
	// shadow setup
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.styles = document.createElement("style");
    this.loadExternalCSS("./components/MenuPage.css");
  }
  
  // append DOM content to shadow
  connectedCallback() {
    const template = document.getElementById("menu-page");
    const content = template.content.cloneNode(true);
    this.shadow.appendChild(this.styles);
    this.shadow.appendChild(content);
  }
	// fetch CSS logic
  async loadExternalCSS(file) {
    const request = await fetch(file);
    const css = await request.text();
    this.styles.textContent = css;
  }
}

customElements.define("menu-page", MenuPage);
```

**Using CSS Variables**

CSS Variables pierce the shadow DOM, meaning custom elements can access global CSS Variables. 

**Complete Shadow DOM setup**

1. In the constructor, create a shadow DOM
2. Fetch styles
3. In the `connectedCallback()`, get the content from the `<template />` and the Css from the styles you fetched and append them both to the shadow DOM.

### WebComponent Class

```ts
type Selector = {
  <K extends keyof HTMLElementTagNameMap>(selectors: K):
    | HTMLElementTagNameMap[K]
    | null;
  <K extends keyof SVGElementTagNameMap>(selectors: K):
    | SVGElementTagNameMap[K]
    | null;
  <K extends keyof MathMLElementTagNameMap>(selectors: K):
    | MathMLElementTagNameMap[K]
    | null;
  <K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K):
    | HTMLElementDeprecatedTagNameMap[K]
    | null;
  <E extends Element = Element>(selectors: string): E | null;
};

/**
 * Tips for using this class:
 *
 * 1. Always call connectedCallback() and always do super.connectedCallback() in the child class.
 * Always do DOM stuff in connectedCallback() and not in the constructor.
 */

export default abstract class WebComponent<
  T extends readonly string[] = readonly string[]
> extends HTMLElement {
  protected shadow: ShadowRoot;
  protected styles: HTMLStyleElement;
  protected template: HTMLTemplateElement;
  public $: Selector;

  static register(name: string, _class: CustomElementConstructor): void {
    if (!customElements.get(name)) {
      customElements.define(name, _class);
    }
  }

  /**
   * Might be blocked depending on CSP
   * @param str the string to interpolate
   * @param params  the object with the values to interpolate
   * @returns
   */
  static interpolate<V extends Record<string, any>>(str: string, params: V) {
    const names = Object.keys(params);
    const values = Object.values(params);
    return new Function(...names, `return \`${str}\`;`)(...values) as string;
  }

  static createTemplate(templateId: string, HTMLContent: string) {
    const template = document.createElement("template");
    template.id = templateId;
    template.innerHTML = HTMLContent;
    return template;
  }

  async loadExternalCSS(filepath: string) {
    const request = await fetch(filepath);
    const css = await request.text();
    this.styles.textContent = css;
  }

  private templateId: string;
  constructor(options: {
    templateId: string; // template id
    HTMLContent?: string; // html content of template
    cssFileName?: string; // filename of css to apply on template, if provided
    cssContent?: string; // css content to apply on template, if provided
  }) {
    // 1. always call super()
    super();
    this.templateId = options.templateId;
    // 2. create shadow DOM and create template
    this.shadow = this.attachShadow({ mode: "open" });
    this.$ = this.shadow.querySelector.bind(this.shadow);

    this.styles = document.createElement("style");
    this.template = WebComponent.createTemplate(
      options.templateId,
      options.HTMLContent ??
        (this.constructor as typeof WebComponent).HTMLContent
    );

    // 3. attach styles
    if (options.cssContent) this.styles.textContent = options.cssContent;
    else if (options.cssFileName) this.loadExternalCSS(options.cssFileName);
    else
      this.styles.textContent = (
        this.constructor as typeof WebComponent
      ).CSSContent;
  }

  static get HTMLContent() {
    return "";
  }

  static get CSSContent() {
    return "";
  }

  // called when element is inserted to the DOM
  connectedCallback() {
    this.createComponent();
    console.log(`${this.templateId}: connectedCallback finished executing`);
  }

  private createComponent() {
    const content = this.template.content.cloneNode(true);
    this.shadow.appendChild(this.styles);
    this.shadow.appendChild(content);
    // create utility selector
  }

  // triggered when element is removed from document
  disconnectedCallback() {
    console.log("disconnected");
  }

  // triggered when element is moved to new document (only with iframes)
  adoptedCallback() {
    console.log("adopted");
  }

  // region ATTRIBUTES

  // override this getter to specify which attributes to observe
  static get observedAttributes() {
    return [] as readonly string[];
  }

  // gets an attribute from the observedAttributes
  getObservableAttr(attrName: T[number]) {
    const attr = this.attributes.getNamedItem(attrName);
    return attr?.value;
  }

  // sets an attribute from the observedAttributes
  setObservableAttr(attrName: T[number], value: string) {
    this.setAttribute(attrName, value);
  }

  // removes an attribute from the observedAttributes
  removeObservableAttr(attrName: T[number]) {
    this.removeAttribute(attrName);
  }

  // listens to changes of attributes from the observedAttributes
  attributeChangedCallback(
    attrName: T[number],
    oldVal: string,
    newVal: string
  ) {
    console.log("attributeChangedCallback run", attrName, oldVal, newVal);
  }
}
```

#### Constructor

The WebComponent class is abstract but takes in one type parameter. That type parameter is used to give type inference to the `observableAttributes` static getter for any child classes to take advantage of. 

The constructor takes in these required properties: 
- `templateId` : the id of the `<template>` element to create

You can automatically provide the CSS and HTML for the template by overriding the static getters `HTMLContent` and `CSSContent`.

#### Example

Here is a full example, where we appropriately type the `observedAttributes` static getter to provide good type inference.

```ts
import WebComponent from "../WebComponent";
import HTMLContent from "./template.html?raw"; // import HTML string
import CSSContent from "./template.css?raw";   // import CSS string

const observedAttributes = ["dolphin"] as const;

export default class ContentScriptUI extends WebComponent<
  typeof observedAttributes
> {
  static {}
  constructor() {
    super({
      HTMLContent,
      templateId: "content-script-ui",
      cssContent: CSSContent,
    });
    console.log("ContentScriptUI constructed");
  }

  static get observedAttributes() {
    return observedAttributes;
  }

  static registerSelf() {
    WebComponent.register("content-script-ui", ContentScriptUI);
  }
}
```

This is the HTML template and CSS for the web component: 

```html
<div class="container">
  <slot></slot> // for inserting content
</div>
```

```css
.container {
  position: fixed;
  height: 2rem;
  width: 2rem;
  padding: 1rem;
  color: white;
  background-color: red;
  z-index: 1000;
  top: 0;
  right: 0;
}
```

Then this is how we render it in React:

```ts
import ContentScriptUI from "app/utils/vanillajs-utils/web-components/ContentScriptUI/ContentScriptUI";

ContentScriptUI.registerSelf();

export const App = () => {
  return <content-script-ui>App</content-script-ui>;
};
```

### Web components with Lit

Lit is a 5kb framework meant to make working with web components easier. Here is a basic component example: 

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('name-tag')
export class NameTag extends LitElement {

  // css styles
  static styles = css`
	  .completed {
	    text-decoration-line: line-through;
	    color: #777;
	  }
	`;

  // reactive property
  @property()
  name: string = 'Your name here';

  render() {
    return html`
      <p>Hello, ${this.name}</p>
      <input @input=${this.changeName} placeholder="Enter your name">
      <button @click=${this.handleClick}>Click me</button>
    `;
  }
  
  handleClick(event: Event) {
    alert("hello")
  }

  changeName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name = input.value;
  }
}
```

Let's go through the syntax one by one: 

- `@customElement('name-tag')`: gives the custom element a name and registers it using this custom lit decorator.
- `@property()`: whatever class properties are decorated with the `@property` decorator are reactive state, and whenever they change, the component will re-render.
- `render() {}`: the function to render HTML
- `static styles`: a static property you define to create shadow-DOM scoped styles for the element.

Here are the rules all lit components must follow: 
1. They must extend from the `LitElement` class
2. They must have a `@customElement('name-tag')` decorator
3. They must override the `render()` method that returns some HTML