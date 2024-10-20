# Fetching remote data

## Fetching binary data with fetch

### Blobs

Blobs are a way of working with file data in the browser. You can convert data from any network URL into a blob, and even create a local URL to use from that blob.

This is how you create a blob:

```javascript
const blob = new Blob(array, options);
```

- `array` : an array of data to put into the blob, like a list of strings
- `options` : the options to configure the blob. The most important is `option.type`, which determines the MIME type of the blob.

```javascript
const blob = new Blob(['<q id="a"><span id="b">hey!</span></q>'], {
  type: "text/html",
});
```

Here are the properties and methods you can access on a blob:

- `blob.size` : the size of the blob in bytes
- `blob.type` : the MIME type of the blob
- `blob.text()` : async method that returns the text of the blob

To create blob URLs for local use in the browser, you should use these two methods:

- `URL.createObjectURL(blob)` : creates a URL for the blob
- `URL.revokeObjectURL(url)` : revokes the URL for the blob, preventing memory leaks

### Array Buffers

Array buffers are a way for which we can write binary data in node and save it to a file.

We can get array buffer versions of binary data like images when we request them by using the `response.arrayBuffer()` async method that lives on the response object.

```javascript
const response = await fetch("https://example.com/image.png");
const buffer = await response.arrayBuffer();
await fs.writeFile("./image.png", imageBuffer);
```

### Fetching image data in the browser

```javascript
async function fetchBlobBrowser(url: string) {
  // 1. fetch image data
  const response = await fetch(url);
  // 2. Convert response to blob
  const blob = await response.blob();
  // 3. Create a local URL for the blob
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
```

Getting usable data from a image URL in the browser is a three step process:

1. Fetch the image data using `fetch(url)`
2. Get the blob data from the response using `response.blob()`, which returns a `Blob` object instance of the binary image data.
3. Create a local URL for the blob using `URL.createObjectURL(blob)`, which returns a string that can be used as a URL in the browser.

This is the complete code in action

```javascript
// this allows us to see which runtime environment we are in
const isRunningInNode = typeof require === "function";

async function fetchBlobBrowser(url: string) {
  if (isRunningInNode) {
    throw new Error("Cannot run in node");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  // check response headers to see file MIME type
  if (!response.headers.get("content-type").startsWith("image")) {
    throw new Error("Response is not an image");
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
```

### Fetching image data in node

```javascript
const isRunningInNode = typeof require === "function";

async function fetchBlobNode(url: string) {
  if (!isRunningInNode) {
    throw new Error("Cannot run in browser");
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  if (!response.headers.get("content-type").startsWith("image")) {
    throw new Error("Response is not an image");
  }
  // get array buffer from response
  const arrayBuffer = await response.arrayBuffer();
  // convert array buffer to buffer
  const imageBuffer = Buffer.from(arrayBuffer);
  // write buffer to file
  await fs.writeFile("./image.png", imageBuffer);
}
```

1. Fetch image data and get back response
2. Get back array buffer of binary data with `response.arrayBuffer()` async method.
3. Convert array buffer to fs-usable buffer with `Buffer.from(arrayBuffer)`
4. Write buffer to file.

## FileReader and Files

If we want to read raw data from files in the browser, we can use the `File` and `FileReader` APIs.

1. Get blob binary data from the network request

   ```javascript
   const response = await fetch(url);
   const blob = await response.blob();
   ```

2. Create a `File` object from the blob.
   - The first argument of the constructor is an array of data to put in as the file contents.
   - The second argument is the file name.
   - The third argument is the options object, which has a `type` property that determines the MIME type of the file.

   ```javascript
   const file = new File([blob], "image.png", { type: blob.type });
   ```

3. Create a `FileReader` object. Listen for the `load` event, which fires when the file is loaded. The file content will be stored on the `event.target.result` property.

   ```javascript
   const fileReader = new FileReader();

   fileReader.readAsDataURL(file); // tells reader to read file as base 64 string
   fileReader.addEventListener("load", (e) => {
     const fileContent = e.target.result; // file content is stored here
   });
   ```

```ts
async function fetchBlobBrowser(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], "image.png", { type: blob.type });

  const fileReader = new FileReader();

  fileReader.readAsDataURL(file); // tells reader to read file as base 64 string
  fileReader.addEventListener("load", (e) => {
    const fileContent = e.target.result;
  });
}
```

### File API

This is the constructor for a `File` object instance:

```javascript
const file = new File(fileContentArray, filename, options);
```

- `fileContentArray` : an array of data to put into the file. This can be a list of strings, or a list of blobs.
- `filename` : the name of the file
- `options` : the options object, which has a `type` property that determines the MIME type of the file.

And here are the properties on a `File` object instance: 
- `file.name`: the file name
- `file.size`: the file size
- `file.type`: the mimetype of the file

### File reader API

We instantiate a `FileReader` object instance like this:

```javascript
const fileReader = new FileReader();
```

The next important thing to do is to actually begin reading the file, and there are several methods which we can use to read the file in different ways, depending on the resulting output we want:

- `fileReader.readAsText(file)` : read the file as text. Only good for text files and other non-binary data
- `fileReader.readAsDataURL(file)` : read the file as a base64 encoded string. Good for binary data like images
- `fileReader.readAsArrayBuffer(file)` : read the file as an array buffer. Returns an array buffer of the file data
- `fileReader.readAsBinaryString(file)` : read the file as a binary string

After you read the file into the specific format you want, you need to listen to the `load` event on the `FileReader` object instance, which fires when the file is loaded. The file content will be stored on the `event.target.result` property.

```javascript
fileReader.addEventListener("load", (e) => {
  const fileContent = e.target.result; // file content is stored here, in whatever format you read file as
});
```

If I used `fileReader.readAsDataURL(file)`, then the `fileContent` variable would be a base64 encoded string.

#### FileReader events

The FileReader API has three events you can listen for: 

- `"load"`: when the file fully loads and is ready to be used
- `"progress"`: fired every 50 ms while the file is loading, giving updates on the progress
- `"error"`: fired if an error occurred during the loading process. 

```ts
fileReader.addEventListener("progress", (e) => {
	if (e.lengthComputable) {
      progress.innerHTML = `${e.loaded}/${e.total}`;
    }
})

fileReader.addEventListener("error", (e) => {
	alert(reader.error.code)
})
```

## Aborting fetch requests

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

## Everything you need to know about CORS

CORS is a way around the SOP (same origin policy) that allows frontend webpages to request different origins in a fetch request in a secure way. 

The basic idea behind CORS is to use custom HTTP headers to allow both the browser and the server to know enough about each other to determine if the request or response should succeed or fail.

To establish a CORS policy so that a webpage can request a server, the server should send back these 4 headers on every response (easily accomplished with express middleware):

- `Access-Control-Allow-Origin`—Same as in simple requests.
- `Access-Control-Allow-Methods`—A comma-separated list of allowed methods.
- `Access-Control-Allow-Headers`—A comma-separated list of headers that the server will allow.
- `Access-Control-Max-Age`—The amount of time in seconds that this preflight request should be cached for.

Here is an example:

```ts
Access-Control-Allow-Origin: https://www.mattfriz.com
Access-Control-Allow-Methods: POST, GET
Access-Control-Allow-Headers: FRIZ
Access-Control-Max-Age: 1728000
```