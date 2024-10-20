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

## Fetch

### Request and Response

A basic `Request` is created like so: 

```jsx
const req = new Request(url, options)
```

Here are the important options you can pass in: 
- `method` : the HTTP verb to use
- `body` : the request body, working only for non-GET requests.
- `headers` : any request headers
- `mode` : controls the CORS behavior of your requests. Here are the different values you can provide:
    - `"same-origin"` : only allows requests to the same origin, meaning you can only make local requests to your own app.
    - `'cors"` : allow CORS requests. The default when you create a `Request()` with a header
- `cache` : controls the cache behavior. Here are the different values you can provide
    - `"default"` : default caching behavior, where if data is fresh, return from cache, and if data is stale, make a network request
    - `"no-store"` : **Network first.** never use caching. Always do network requests
    - `"reload"` : **Network first.** Serve network requests, but update cache each time so you can use it as fallback data in case of no internet.
    - `"no-cache"` : **Network first.** always make network request, and only return from cache if network request and cached data are the same.
    - `"force-cache"` : **Cache first.** always return from cache, and if there is nothing in the cache, make network request and add it to the cache.

```jsx
const request = new Request('https://api.example.com/data', {
  method: 'GET',
  headers: new Headers({
    'Authorization': 'Bearer yourToken',
  }),
  body: JSON.stringify({ key: 'value' }), 
});
```

Here are some useful properties and methods of a request object: 

- `request.method`: The HTTP method for the request (e.g., GET, POST, PUT).
- `request.url`: The URL of the request.
- `request.headers`: An object representing the headers of the request.
- `request.destination` : returns the content type of the data you are requesting, like `"audio"` , `"video"`, `"document"`, `"image"` and more.
- `request.clone()`: clones the request and returns that request
- `request.bodyUsed`: whether or not the response body was already read. If this is `true`, then attempting to clone the response with `response.clone()` will throw an error. 

**response**

Here are some useful things on the `Response` object: 

- **`status`**: The HTTP status code of the response (e.g., 200 for a successful request).
- **`headers`**: An object representing the headers of the response.
- `bodyUsed`: whether or not the response body was already read. If this is `true`, then attempting to clone the response with `response.clone()` will throw an error. 
- **`text()`**: A method to read the response body as text.
- **`json()`**: A method to parse the response body as JSON.
- **`blob()`**: A method to get the response body as a Blob.
- **`clone()`**: A method to clone the response, allowing it to be used in multiple places.

### Fetch with Headers

Instead of passing the headers straight in, we can create a `Headers` object and pass that in instead. We can create a `Headers` object like this:

```javascript
const headers = new Headers({
  "Content-Type": "application/json",
});
```

Then we can pass this into the `fetch()` method like this:

```javascript
fetch(url, {
  method: "POST",
  headers,
  body: JSON.stringify(data),
});
```


### Aborting inflight fetch requests

```ts
let abortController = new AbortController();
 
fetch('wikipedia.zip', { signal: abortController.signal })
  .catch(() => console.log('aborted!'));
 
// Abort the fetch after 10ms
setTimeout(() => abortController.abort(), 10);
```
## Other APIs

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

### Lifecycle Methods

You can hook into specific methods in a web component class that get activated throughout the component's lifecycle.

- `connectedCallback()` : triggered when element is added to document. Use this to create the element content and set up event listeners
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

export default abstract class WebComponent<
  T extends readonly string[] = readonly string[]
> extends HTMLElement {
  protected shadow: ShadowRoot;
  protected styles: HTMLStyleElement;
  protected template: HTMLTemplateElement;
  public $: Selector;

	// creates <template> element with HTML content
  static createTemplate(templateId: string, HTMLContent: string) {
    const template = document.createElement("template");
    template.id = templateId;
    template.innerHTML = HTMLContent;
    return template;
  }

	// loads css from file
  async loadExternalCSS(filepath: string) {
    const request = await fetch(filepath);
    const css = await request.text();
    this.styles.textContent = css;
  }

  static register(name: string, _class: CustomElementConstructor): void {
    if (!customElements.get(name)) {
      customElements.define(name, _class);
    }
  }


  constructor(options: {
    templateId: string; // template id
    HTMLContent: string; // html content of template
    cssFileName?: string; // filename of css to apply on template, if provided
    cssContent?: string;  // css content to apply on template, if provided
  }) {
	// 1. always call super()
    super();
    // 2. create shadow DOM and create template
    this.shadow = this.attachShadow({ mode: "open" });
    this.styles = document.createElement("style");
    this.template = WebComponent.createTemplate(
      options.templateId,
      options.HTMLContent
    );
    // create utility selector
    this.$ = this.template.content.querySelector.bind(this.template.content);
    // 3. attach styles
    if (options.cssContent) this.styles.textContent = options.cssContent;
    else if (options.cssFileName) this.loadExternalCSS(options.cssFileName);
  }

  // called when element is inserted to the DOM
  connectedCallback() {
    this.createComponent();
  }
  // create shadow DOM, add event listeners, etc.
  createComponent() {
    const content = this.template.content.cloneNode(true);
    this.shadow.appendChild(this.styles);
    this.shadow.appendChild(content);
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
  //   static get observedAttributes() {
  //     return [] as string[];
  //   }

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

  // listens to changes fo attributes from the observedAttributes
  attributeChangedCallback(
    attrName: T[number],
    oldVal: string,
    newVal: string
  ) {
    console.log("observedAttributes changed");
  }
}
```

#### Constructor

The WebComponent class is abstract but takes in one type parameter. That type parameter is used to give type inference to the `observableAttributes` static getter for any child classes to take advantage of. 

The constructor takes in these required properties: 
- `templateId` : the id of the `<template>` element to create
- `HTMLContent` : the HTML content of the template

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

	static styles = css`
	  .completed {
	    text-decoration-line: line-through;
	    color: #777;
	  }
	`;
	
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