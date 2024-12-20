
For more resources on PWA, go to these sites: 

- [30 days of PWA](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/06)
- [offline cookbook](https://web.dev/articles/offline-cookbook)
- 
## JavaScript in the background

### Web Storage

### Lifecycle of a web page

In the past, web pages would consume resources infinitely, awake all the time. Now they have a strict lifecycle that they adhere to, where the browsers can cut off resources to the website without the developer knowing. You can hook into these events to prevent your application from getting ruined by the browser unexpectedly discarding your website's memory. 

A web app goes to the background when its tab is either minimized, covered, switched, or closed. 

The behavior of apps executing in a background state differs between browsers: 

- **chrome:** Kills all main thread activity. Timers set in main thread like `setTimeout()` or `setInterval()` will continue to execute, but at a much lower frequency. But service workers and worker threads continue to function in the background at 100% capacity.
- **safari:** Kills all activity, including service workers, timers set in main thread, and worker threads.

Different browsers claiming to save battery are just in reality killing all service worker and worker threads when a web app goes into the background, reducing CPU execution. 

**Mobile behavior** 

Even if you have dozens of apps open, there is only ever one active app - the app you are currently using or are focused on. 

Every other app is put in a **suspended state**, where none of their code is executing. 

- **ios:** Immediately kills all activity in a suspended web app, including service worker and worker threads
- **android:** Waits 5 minutes before killing activity in a suspended web app. Service workers run perpetually

**Lifecycle on web**

The `window` object in javascript can listen to these events to detect changes in the web app’s lifecycle, like when it’s memory is about to get discarded

- `"load"` : app was first loaded
- `"visibilitychange"` : the app changes from background state to active foreground state or goes from active to background
- `"freeze"` : after 5 minutes of being in the background, chrome freezes and suspends the web app execution
- `"resume"` : if the user goes back to the app before 5 minutes are up before the `freeze` event triggers, then the app is back in memory and resumes execution. Also triggers `visibilitychange`
- `"beforeunload"`: if the user tries to exit the app. Use this to ask the user to save their data

A page can fall into these states: 
- **active**: The page is focused and visible
- **passive**: The page is visible, but not focused
- **hidden**: The page is not visible and not focused
- **frozen**: All javascript long-running processes like timers and intervals have been stopped on the page
- **terminated**: All the processes on the webpage have been killed and the memory has been discarded.
- **discarded:** The browser unloads the web app. When doing something that takes up a lot of memory, like recording a video on your phone, the OS can suspend any PWA context and completely discard it. You can check if your PWA was discarded with `document.wasDiscarded` . Then the `load` event will be triggered

> [!WARNING] Do your cleanup sooner rather than later
> The transition to _hidden_ is also often the last state change that's reliably observable by developers. Your app might already be discarded by the time it gets to frozen or terminated, so do all your cleanup and data saving when the app goes in the background into the **hidden** state.



#### Detecting visibility changes

- `document.visibilityState`: returns a string giving information on whether the web app is in the foreground (active, passive) or in the background (hidden). You have two possible values.
	- `"hidden"`: in the background
	- `"visible"`: in the foreground
- `document.hasFocus()`: returns whether or not the page is in the active state.
- `document.hidden`: whether or not the document is hidden


```ts
const getState = () => {
  if (document.visibilityState === 'hidden') {
    return 'hidden';
  }
  if (document.hasFocus()) {
    return 'active';
  }
  return 'passive';
};
```

```ts
// launches whenever the app changes visiblity 
document.addEventListener('visibilitychange', event => {
 if (document.visibilityState = 'hidden') {
 // We are in the background
 // on some devices, last chance to save current state
 } else {
 // We are back in the foreground
 }
});
```

We can detect when a tab is about to frozen and gets its activity suspended by listening to the `freeze` event on the window. 

```jsx
window.addEventListener("freeze", (e) => {
	// when app is about to be frozen, do stuff like save data
})
```


#### Before unload

The `beforeunload` event on the window is resource intensive, so make sure to only conditionally register it, like so: 

```ts
const beforeUnloadListener = (event) => {
  event.preventDefault();
  
  // Legacy support for older browsers.
  return (event.returnValue = true);
};

// A function that invokes a callback when the page has unsaved changes.
onPageHasUnsavedChanges(() => {
  addEventListener('beforeunload', beforeUnloadListener);
});

// A function that invokes a callback when the page's unsaved changes are resolved.
onAllChangesSaved(() => {
  removeEventListener('beforeunload', beforeUnloadListener);
});
```

### Picture in picture

#### Basics

The picture-in-picture API is a simple API that allows you to put any HTML video DOM element in picture in picture mode. 

- `document.pictureInPictureElement` : returns the current element in your page that is in picture-in-picture mode. `null` if nothing.
- `document.exitPictureInPicture()` : makes whatever video is playing picture in picture to exit it.
- `videoEl.requestPictureInPicture()` : makes any video element play picture in picture.

```jsx
document.getElementById("btnPiP").addEventListener("click", (event) => {
  // if we currently have a video playing in picture-in-picture, exit picture-in-picture
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else {
    // otherwise, let's request picture-in-picture
    document.querySelector("video").requestPictureInPicture();
  }
});
```

There are also two events on the `<video>` element you can listen for concerning picture-in-picture events:

- `"enterpictureinpicture"` : video enters pip mode
- `"leavepictureinpicture"` : video exits pip mode

#### Making any element picture in picture

First step is to create the custom PIP element, which is the div with the id `playerContainer`.

```html
<div id="playerContainer">
  <div id="player">
    <video id="video"></video>
  </div>
</div>
<button id="pipButton">Open Picture-in-Picture window</button>
```

Then we bind an event listener to our open PIP button to request picture in picture.

```js
pipButton.addEventListener('click', async () => {
  const player = document.querySelector("#player");

  // Open a Picture-in-Picture window.
  const pipWindow = await documentPictureInPicture.requestWindow();

  // Move the player to the Picture-in-Picture window.
  pipWindow.document.body.append(player);
});
```

You can pass in an object of options to the `documentPictureInPicture.requestWindow()` method, and pass in the `width` and `height` properties to control the size of the PIP window that appears. Here are all the possible properties

- `width`: width of the PIP window
- `height`: height of the PIP window
- `disallowReturnToOpener`: if true, hides the "back to tab" button

```ts
  const player = document.querySelector("#player");

  // Open a Picture-in-Picture window whose size is
  // the same as the player's.
  const pipWindow = await documentPictureInPicture.requestWindow({
    width: player.clientWidth,
    height: player.clientHeight,
    disallowReturnToOpener: true,
  });
```

##### Dealing with closing the player

To deal with closing the player, you have to return the element back to its original position ont he page. You do it by listening to the `"pagehide"` event on the window object.

```ts
pipButton.addEventListener("click", async () => {
  const player = document.querySelector("#player");

  // 1. Open a Picture-in-Picture window.
  const pipWindow = await documentPictureInPicture.requestWindow();

  // 2. Move the custom element to the Picture-in-Picture window.
  pipWindow.document.body.append(player);

  // 3. Move the custom element back when the Picture-in-Picture window closes.
  pipWindow.addEventListener("pagehide", (event) => {
    const playerContainer = document.querySelector("#playerContainer");
    const pipPlayer = event.target.querySelector("#player");
    playerContainer.append(pipPlayer);
  });
});
```

You can close the player programmatically using the `pipWindow.close()` method.

##### pip window

We can get a picture in picture window by executing the async `documentPictureInPicture.requestWindow()` method, which returns that PIP window instance. However, there are multiple ways of retrieving it: 

```ts
// 1. documentPictureInPicture.requestWindow()
async function getNewPIPWindow() {
	return await documentPictureInPicture.requestWindow();
}

// 2. event listener
documentPictureInPicture.addEventListener("enter", (event) => {
  const pipWindow = event.window;
});

// 3. property
const pipWindow = documentPictureInPicture.window;
```

once you have the `pipWindow` object, you can just treat it as a mini-instance of the `window` object. You can add DOM elements to it, remove, add event listeners, etc.

##### Other use cases

**Focusing back on the webpage**

Use the `window.focus()` method to focus the opener window from the Picture-in-Picture window. This method requires a user gesture.

```ts
const returnToTabButton = pipWindow.document.createElement("button");
returnToTabButton.textContent = "Return to opener tab";
returnToTabButton.addEventListener("click", () => {
  window.focus();
});
pipWindow.document.body.append(returnToTabButton);
```

**styling in picture and picture mode**

Use this media query to conditionally style picture in picture elements.

```css
@media all and (display-mode: picture-in-picture) {
  body {
    margin: 0;
  }
  h1 {
    font-size: 0.8em;
  }
}
```


### Service worker

#### The basics

You can think of service workers as a middleware for your app. They intercept every web request the app makes, which allows you to do things like caching requests, assets, and much more.

Service workers typically have a lifetime of 40 seconds where they are running, and then go back to sleep until activated by another event. 

Register a service worker like so: 

```html
<script>
	navigator.serviceWorker.register('sw.js')
</script>
```

**scope**

A service worker has a scope, meaning the routes and files it can access of the web app. If you register the service worker at the root of your app at the `/` route, it’ll have access to everything in the web app. 

You can also register service workers at different url paths for a more narrow scope, like a service worker that can only access things under the `/dog` path. 

- There is only one service worker per scope
- Typically we have one service worker per PWA. 

**register behavior**

By default, PWAs will use the first service worker version that is successfully registered, kind of like caching the service worker. To get rid of this behavior in development, go to devtools, and click on **update on reload** to update and re-register the service worker each time you reload the page.  

**api** 

`self` global variable refers to the service worker, which has a different API than the browser because service workers don’t run in the browser. 

We can then listen to service worker specific events with `self.addEventListener()` 

```tsx
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener("install", (event) => {});
```

**Storage**

With service workers, you will be mainly focusing on caching assets. You have two types of storage to help accomplish an offline experience: 

- **caches API**: used as a key-value pair of Request-Response items. Can be used from the service worker and frontend. 
- **indexedDB**: A large-asynchronous storage that can store any type of JavaScript object. Can be used from the service worker and frontend.  

You cannot use browser-only storage techniques like LocalStorage.
#### Service worker lifecycle

The service worker lifecycle follows three stages: 

1. Registration: occurs when the client side page registers the service worker
2. Installation: occurs when the service worker is first installed. Fires the `"install"` event.
	- It can use this for pre-caching resources (e.g., populate cache with long-lived resources like logos or offline pages).
3. Activation: occurs when the service worker has finished installing. Fires the `"activate"` event.
	- This service worker can now do clean up actions (e.g., remove old caches from prior version) and ready itself to handle functional events. If there is an old service worker in play, you can use `self.clients.claim()` to immediately replace the old service worker with your new one.

Service workers won't update to their newest version by default, so it's important to add this code during development to make sure the service worker always updates itself. 

```ts
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
```

You also have several other events for service workers: 

- `"fetch"`: This event is triggered each time the website requests a resource over the internet, like HTML, CSS, JS, fonts, images, etc. 
	- The most common use case here is to implement a caching strategy for resources
- `"message"`: This event is triggered when the frontend sends a message to the service worker. Use this event for inter-process communication. 

#### Caching

We use the `caches` Web API to cache HTTP responses and return them during the `"fetch"` event of the service worker. 

There are many different caching strategies we can employ: 

- **precaching**: Caching static assets prior to needing them, like HTML, CSS, and JS
- **cache first**: Always reading from the cache first for resources, and if not a cache hit, we fetch the resource and then add it to the cache. 
- **stale while revalidate**: Always read from the cache first for resources, but perform a network request and update the cache in the background. 

##### Cache API

cache storage is a key value store where the keys are requests and the values are web responses. We use this api extensively to cache requests in the service worker.

You can open a cache store by calling `caches.open(cacheName)` , passing in any name you want for the cache store.

This is a completely async API.

- `caches.open(cacheName : string)` : opens and returns a cache store. Creates the cache store if it doesn’t exist. Returns a `cache` object.
- `caches.match(resource)` : returns a web response of the cached resource, if cached. `undefined` otherwise.
- `cache.add(resource)` : adds a resource to the cache. A resource can be a network resource or a local file.
- `cache.addAll(resources: string[])` : adds all resources from the list of resources to the cache. 
- `cache.put(resource, response)` : updates the cache by storing the passed in web response with the associated resource.
- `cache.keys()`: returns all the keys (Requests) from the cache store. 

Instead of storing Requests, you can store resources (local and network), which will be converted to requests automatically and stored. 

```jsx
cache.add("/styles.css")
cache.add(new Request("/styles.css"))
```

**adding to cache**

Adding to cache is a 2 step process:

1. Create a cache store using `caches.open(cacheName)` , which returns a cache object. The cache name can be anything, but make to prefix it to avoid conflicts with cache stores from other apps.
2. Add to the cache using `cache.add(filename)` , which adds the specified file or online resource to the website cache.

```tsx
export async function cacheImage(
  filename: string,
  cacheName: string = "coffeemasters-images"
) {
  const cache = await caches.open(cacheName);
  await cache.add(filename);
}
```

##### App shell caching: Precaching

A common pattern is to fetch and cache critical resources for offline usage during installation, like HTML, CSS, and JS, so that the app works offline.

We listen to the `"install"` event on the service worker, and then add critical resources to the cache.


> [!WARNING] A common caching mistake
> If you notice below, all our app shell resources start with a `/`. That is because we need to cache URLs, not files. So you would refer to `index.html` as `/` instead.


```tsx
sw.addEventListener("install", (event) => {
  const criticalResources = [
    "/",
    "/styles.css",
    "/app.js",
    "/icons/icon-512.png",
    "/icons/icon-1024.png",
    "<https://fonts.gstatic.com/s/materialicons/v67/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2>",
  ];
  const cacheAppShell = async () => {
    const appShellCache = await caches.open("pwa-app-shell");
    await appShellCache.addAll(criticalResources);
  };
  event.waitUntil(cacheAppShell());
});
```

##### Cache-first

The cache-first strategy follows these steps: 

1. Fetch from the cache 
2. If a cache-hit, return the response
3. If a cache-miss, return a network request. Do not update the cache. 

```ts
self.addEventListener('fetch', event => {
  event.respondWith(async () => {
      const cache = await caches.open(CACHE_NAME);

      // match the request to our cache
      const cachedResponse = await cache.match(event.request);

      // check if we got a valid response
      if (cachedResponse !== undefined) {
          // Cache hit, return the resource
          return cachedResponse;
      } else {
        // Otherwise, go to the network
          return fetch(event.request)
      };
  });
});
```

When going to the cache constantly, the data will never be updated unless the service worker itself gets updated. 

> [!WARNING] Stale Data
> The downside of a cache-first approach is that you will always have stale data since you never go to the network to fetch fresh data. A stale while revalidate approach is much better. 

##### Stale while revalidate

1. Fetch from the cache
2. If a cache-hit, make a network request, update the cache, and return the previous cache value. If the network request fails, just return the previous cache value without updating it. 
3. If a cache-miss, make a network request, update the cache, and return the network request.

```ts
sw.addEventListener("fetch", (event) => {
  async function handleCacheNetworkFirst() {
    try {

      // 1. make network request to asset and get back response
      const res = await fetch(event.request);

      // 2. open cache
      const cache = await caches.open("coffee-images");

      // 3. clone response and cache it
      // responses are streams. We must clone them.
      cache.put(event.request, res.clone());
      return res;
    } 
		catch (error) {

      // 4. if network fails, try to get from cache
      const res = await caches.match(event.request);
      return res!;

    }
  }
	// 5. Return response
  event.respondWith(handleCacheNetworkFirst());
});
```


##### Network first

1. Fetch from the network 
2. Update the cache
3. If the network request from step 1 failed, return the response from the cache. 


##### Advanced caching architecture


Advanced caching requires also knowing when to invalidate the cache intentionally. You can do this by smartly naming your caches and putting different types of resources into different cache stores. 

Also use semantic versioning to make invalidating previous caches easier so you can free up space.

**Step 1: create cache names**

```ts
const APP_SHELL = ["/", "/styles.css", "/frontend/index.js"];

const version = "v1:";
const sw_caches = {
  appShell: {
    name: `${version}appShell`,
    keys: new Set<string>(APP_SHELL),
  },
  app: {
    name: `${version}app`,
    keys: new Set<string>(),
  },
};
```

**Step 2: Invalidate old cache versions in "activate" event**

```ts
// Update service worker
sw.addEventListener("activate", (event) => {
  // delete all cache stores with previous versions
  async function cleanCache() {
    // gets all cache store names
    const keys = await caches.keys();
    keys
      .filter((key) => {
        return !key.startsWith(version);
      })
      .forEach(async (key) => {
        // deletes cache store with the specified name
        await caches.delete(key);
      });
  }

  async function updateServiceWorker() {
    sw.clients.claim();
  }
  event.waitUntil(
    (async () => {
      await cleanCache();
      await updateServiceWorker();
    })()
  );
});
```

**Step 3: selectively cache based on resource type**

```ts
sw.addEventListener("fetch", (event) => {
  async function cache() {
    if (sw_caches.appShell.keys.has(event.request.url)) {
      return CacheStrategist.cacheFirst(
        event.request,
        sw_caches.appShell.name
      );
    } else {
      sw_caches.app.keys.add(event.request.url);
      return CacheStrategist.staleWhileRevalidate(
        event.request,
        sw_caches.app.name
      );
    }
  }

  if (event.request.url.startsWith("http")) {
    event.respondWith(cache());
  }
});
```


#### Service worker boilerplate


##### SW boilerplate

```ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />

import { CacheStrategist } from "./backend/CacheStorageModel";

const sw = self as unknown as ServiceWorkerGlobalScope;

const APP_SHELL = ["/", "/styles.css", "/frontend/index.js"];
const APP_CACHE_NAME = "app-v1";

// Implement app shell caching
sw.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(CacheStrategist.cacheAppShell(APP_CACHE_NAME, APP_SHELL));
});

// Update service worker
sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("fetch", (event) => {
  // these are invalid protocols for service workers
  if (
    event.request.url.startsWith("chrome") ||
    event.request.url.startsWith("chrome-extension")
  ) {
    return;
  }
  event.respondWith(
    CacheStrategist.staleWhileRevalidate(event.request, APP_CACHE_NAME)
  );
});

```

##### Custom cache class

```ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/**
 * A class for storing cache data around a single cache name.
 */
export class CacheStorageModel {
  private cache: Cache | null = null;
  constructor(public readonly cacheName: string) {}

  private async openCache() {
    const cache = await caches.open(this.cacheName);
    return cache;
  }

  async addAll(requests: string[]) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    await this.cache.addAll(requests);
  }

  async match(request: Request) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    return this.cache.match(request);
  }

  async matchAll(request: Request) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    return this.cache.matchAll(request);
  }

  async add(request: Request) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    return this.cache.add(request);
  }

  async delete(request: Request) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    return this.cache.delete(request);
  }

  async keys(request: Request) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    return this.cache.keys(request);
  }

  async put(request: Request, response: Response) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    return this.cache.put(request, response);
  }
}

/**
 * A class for implementing caching strategies with service workers
 */
export class CacheStrategist {
  static async cacheAppShell(cacheName: string, appShell: string[]) {
    const appShellStorage = new CacheStorageModel(cacheName);
    await appShellStorage.addAll(appShell);
  }

  static async cacheFirst(request: Request, cacheName: string) {
    const cacheStorage = new CacheStorageModel(cacheName);

    // 1. go to cache
    const cacheResponse = await cacheStorage.match(request);
    // 2. if cache-hit, return response
    if (cacheResponse) {
      return cacheResponse;
    }
    // 3. if cache-miss, go to network and update cache
    else {
      const response = await fetch(request);
      await cacheStorage.put(request, response.clone());
      return response;
    }
  }

  static async staleWhileRevalidate(request: Request, cacheName: string) {
    const cacheStorage = new CacheStorageModel(cacheName);
    const cacheResponse = await cacheStorage.match(request);
    // 1. go to cache
    // 2. if cache-hit, update cache in the background and return cache response
    if (cacheResponse) {
      try {
        fetch(request).then((response) => {
          cacheStorage.put(request, response.clone());
        });
      } catch (e) {
      } finally {
        // 2a. return cache response
        return cacheResponse;
      }
    }
    // 3. if cache-miss, go to network and update cache
    else {
      const response = await fetch(request);
      await cacheStorage.put(request, response.clone());
      return response;
    }
  }
}
```
#### Background sync

Background sync is a way for service workers to resume doing something once the user has internet connectivity again, like syncing local changes to the cloud. 

1. The frontend registers a background sync event with a specific name
```ts
async function registerSyncEvent() {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register("sync-event");
}
```
2. The service worker should listen for the `"sync"` event. Based on the event name, you can provide different methods to execute. 
```ts
sw.addEventListener("sync", (e) => {
  if (e.tag === "sync-event") {
    console.log("Sync event fired");
  }
})
```

#### Background Fetch

The background fetch API is a way to send files and web requests to the service worker and have them do things with those files and requests. 

Even when the web app is closed, these file and fetch transactions will go through. 

1. Get the currently registered service worker with this code: 
    
    ```jsx
    const registration = await navigator.serviceWorker.ready
    ```
    
2. Call on the background fetch API and fetch the URLs you want to send to the service worker, following this: 
    
    ```jsx
    await registration.backgroundFetch.fetch(fetchName, urlsArray, metadata)
    ```
    
    - `fetchName` : a name to give to this background fetch
    - `urlsArray` : an array of urls to fetch and send the requests to the service worker. These coudl be files
    - `metadata` : an object that controls how the file donwload dialog UI looks
3. Listen for the `backgroundfetchsuccess` event on the service worker to access the fetched URLs and files
    
    ```jsx
    sw.addEventListener("backgroundfetchsuccess", async (event) => {
      const downloadedFiles = await event.registration.matchAll();
      // files is an array of objects, each with .request property
    });
    ```
    

```jsx
const currentlyRegisteredServiceWorker = await navigator.serviceWorker.ready;
await currentlyRegisteredServiceWorker.backgroundFetch.fetch(
  "media files",
  ["/media/audio.mp3", "/media/video.mp4"],
  {
    title: "Media Files",
    icons: [
      {
        sizes: "800x800",
        src: "/media/thumb.png",
        type: "image/png",
      },
    ],
  }
);
```

**Events**

These are the events living on the service worker that you can listen to, related to background fetch: 

```jsx
sw.addEventListener("backgroundfetchsuccess", async (event) => {
	// 1. get back array of files with this method
  const downloadedFiles = await event.registration.matchAll();
	// 2. Access the Request instance on each file
  const downloadedRequests = downloadedFiles.map(
    (downloadedFile) => downloadedFile.request
  ) as Request[];
	 
});

sw.addEventListener("backgroundfetchclick", async (event) => {
  console.log("clicked on file download UI dialog");
});

sw.addEventListener("backgroundfetchfailure", async (event) => {
  console.log("download failed");
});
```

- `backgroundfetchsuccess` : triggered when the background fetch was a success. You can access the downloaded files here
- `backgroundfetchclick` : triggered when the user clicked on file download UI dialog
- `backgroundfetchfailure` : triggered when background fetch failed

#### Messaging

##### Frontend to service worker

The frontend can send messages to the service worker to do stuff. 

From the frontend, use the `navigator.serviceWorker.controller.postMessage()` method and pass some kind of object in.

```ts
navigator.serviceWorker.controller.postMessage({ 
   type: `IS_OFFLINE`
   // add more properties if needed
});
```

You can then listen for the message on the service worker through the `"message"` event.

```ts
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'IS_OFFLINE') {
    // take relevant actions
  }
});
```

##### Service worker to frontend

1. Fetch a client using the `self.clients.get()` method
```ts
const client = await self.clients.get(event.clientId);
```
2. Send a message to the frontend using `client.postMessage()` method
```ts
client.postMessage({
	msg: "Hey I just got a fetch from you!",
	url: event.request.url,
});
```
3. Receive the message on the frontend by listening for the `"message"` event on the `navigator.serviceWorker.addEventListener()` method. 
```ts
navigator.serviceWorker.addEventListener("message", (event) => {
  // message data on event.data
});
```

So here is a full example of the service worker sending the message to the frontend.

```ts title="sw.js"
addEventListener("fetch", (event) => {
  event.waitUntil(
    (async () => {
      // Exit early if we don't have access to the client.
      // Eg, if it's cross-origin.
      if (!event.clientId) return;

      // Get the client.
      const client = await self.clients.get(event.clientId);
      // Exit early if we don't get the client.
      // Eg, if it closed.
      if (!client) return;

      // Send a message to the client.
      client.postMessage({
        msg: "Hey I just got a fetch from you!",
        url: event.request.url,
      });
    })(),
  );
});
```

```ts title="index.js"
navigator.serviceWorker.addEventListener("message", (event) => {
  console.log(event.data.msg, event.data.url);
});
```

#### Updating service workers

It's necessary to master updating service workers because otherwise your cached content will always be stale and users will always see the stale version of your website. Follow these steps for a general updating process. 

> [!WARNING] 
> Even if you update your service worker, the cached assets will not be automatically updated. You have to manually update the cache. 

1. In the service worker, whenever you update the version of the service worker, write code to invalidate the previous cache. 
2. Listen for service worker installation on the frontend
```ts
async function detectSWUpdate() {
  const registration = await navigator.serviceWorker.ready;

  registration.addEventListener("updatefound", event => {
    const newSW = registration.installing;
    newSW.addEventListener("statechange", event => {
      if (newSW.state == "installed") {
         // New service worker is installed, but waiting activation
      }
    });
  })
}
```
3. Display a toast message telling a user that a new version of the app can be installed. Then when the user allows the new version to be installed, send a message to the service worker to update the cache and then reload the user's page. 

We can also
#### Developing with service workers

You can see all your registered service workers at the `chrome://serviceworker-internals/` link.

You should also check the **update on reload** checkbox to make sure that your service workers update when you reload them. 

## Web Storage

### Storage permissions

Although databases like indexedDB and cache storage can store gigabytes of data, the browser is free to destroy those data reserves if the system doesn't have much storage left. To prevent this from occurring, you can prompt the user to keep your storage at all cost to prevent the browser from freeing up the data under your origin. 

#### **Asking for persistent storage**

There are two types of storage persistence behavior that storage APIs can have: 

- **best effort:** If hard drive space is running low, the browser will delete data from some origins
- **persistence:** Only if the user wants to delete the data will the data be deleted.

You have these two methods to handle permissions around persistent storage:

- `await navigator.storage.persist()` : asks the browser to allow persistent storage
- `await navigator.storage.persisted()` : returns whether or not the website was allowed to use persistent storage

```tsx
export async function askPersistStorage() {
  const isPersisted = await navigator.storage.persisted();
  if (!isPersisted) {
    const isPersistGranted = await navigator.storage.persist();
	}
}
```

#### **Getting data storage amount**

You can ask for an estimate for the amount of web storage used on your entire device by using the `navigator.storage.estimate()` method, which returns a quota object. 

- `quota.usage` : returns the amount of web storage you have used in bytes
- `quota.quota` : returns the amount of hard disk space you have available to use for web storage in bytes

```tsx
export async function askQuota() {
  const quota = await navigator.storage.estimate();
  if (quota.usage && quota.quota) {
    console.log(
      `Used ${(quota.usage / 1024 / 1024).toFixed(2)}mb of ${(
        quota.quota /
        1024 /
        1024 /
        1024
      ).toFixed(2)}gb`
    );
    const percentUsed = (quota.usage / quota.quota) * 100;
    console.log(`Percent used: ${percentUsed.toFixed(2)}%`);
    return percentUsed;
  }
}
```

### IndexedDB

IndexedDB is a low-level, callback based asynchronous database API that can be used from both the frontend and the service worker. 

Indexed db is split up into a hierarchy like so: **databases → data stores → objects**

You can have multiple databases, and in those databases you can add data stores, and then you can add individual objects into those data stores.

Because indexedDB is so hard to use, we use third party wrappers around them: 

#### LocalForage

The `localforage` library works like local storage but uses IDB under the hood. It is an asynchronous library. 

There is no need to stringify or parse objects, since this library will do that under the hood. 

**Setup**

```tsx
import * as localforage from "localforage";

// must set up database before interacting with it
localforage.config({
  driver: localforage.INDEXEDDB,
  name: "coffeemasters",
  version: 1.0,
  description: "Coffeemasters local storage",
});
```

Before running any database methods, you have to configure the idb database with `localforage.config()` , passing in options to configure the database like the database name and version. 

**API**

You can create object stores with `localforage.createInstance()` , passing in an object of options. The `name` key is the store name. 

```tsx
const store = await localforage.createInstance({
      name: "myStore"
});
```

You then have these methods available, both on localforage and any localforage instances: 

- `localforage.setItem(key, value)` : sets the item
- `localforage.getItem(key)` : gets the item. Returns null otherwise
- `localforage.length()` : returns the number of entries in the database or object store.

**Custom class**

```tsx
export class LocalForage<T = string> {
  private store: globalThis.LocalForage;
  constructor(name: string) {
    this.store = localforage.createInstance({
      name,
    });
  }

  async set(key: string, value: T) {
    await this.store.setItem(key, value);
  }

  async get(key: string) {
    try {
      const val = await this.store.getItem<T>(key);
      return val;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async size() {
    return await this.store.length();
  }
}
```

#### IDB

IDB is a tiny promise wrapper around the normal indexedDB API, and is the closest thing to the normal API. 

**setup** 

You must open the database first and then define the `upgrade()` callback, which is the only place you can initialize object stores and create indices. 

- **object stores:** data stores for individual objects
- **indices:** Like SQL indices where you can speed up performance by sorting across specified fields

```tsx
export const db = await openDB(databaseName, versionNumber, {
  async upgrade(db) {
    // create stores and indices
  },
});
```

**creating stores and indices**

- `db.createObjectStore(storeName)` : creates an returns an object store with the specified name.
- `store.createIndex(indexName, property)` : creates an index in the store around the specified property of the objects in the store, boosting performance around queries involving that property.

**db methods**

All these methods live on the database rather than the store itself, meaning that you have to pass in the store name each time as the first argument so that indexedDB will know which store you want to run database operations on. 

- `db.add(storeName, obj)` : adds the item to the store with the specified name
- `db.put(storeName, key, obj)` : updates the item in the store
- `db.get(storeName, key)` : returns the item from the specified store and specified name

**Example**

```tsx
import { openDB, deleteDB, wrap, unwrap, IDBPObjectStore } from "idb";

// create database
export const db = await openDB("coffeemasters", 1, {
  async upgrade(db) {
    const cartStore = await createStore("cart");
  },
});

async function createStore(name: string) {
  return await db.createObjectStore(name);
}

export class IDBStore {
	// this class stores the storeName as the private variable

  constructor(private storeName: string) {
		// creates store if not created already
    if (!db.objectStoreNames.contains(storeName)) {
      createStore(storeName);
    }
  }

  async set(key: string, value: any) {
    return await db.put(this.storeName, value, key);
  }

  async get(key: string) {
    return await db.get(this.storeName, key);
  }

  async getAll() {
    return await db.getAll(this.storeName);
  }

  deleteStore() {
    db.deleteObjectStore(this.storeName);
  }

  async add(value: any) {
    return await db.add(this.storeName, value);
  }

  async getStoreSize() {
    return await db.count(this.storeName);
  }

  async clear() {
    await db.clear(this.storeName);
  }

  async delete(key: string) {
    await db.delete(this.storeName, key);
  }
}
```
## PWA development

You need two things to create a PWA: a *service worker* and a *manifest.json*. PWAs stand for progressive web apps, and are the bridge between native apps and websites. 


> [!NOTE] Philosophy of the PWA
> A PWA should be offline-capable through the service worker, offer a performant experience by using some caching strategy to cache network requests, and offer a native app experience by moving away from common web standards. 

### PWA tools

#### Vite PWA plugin

Use the vite PWA plugin to easily turn your app into a PWA. 

1. `npm install -D vite-plugin-pwa`
2. Add the plugin to the vite config: 
```ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      }
    })
  ]
})
```

#### Vite PWA Assets plugin

Use the vite PWA assets plugin to dynamically generate icons of different sizes for your PWA. 

1. `npm install -D @vite-pwa/assets-generator`
2. `pwa-assets-generator --preset minimal-2023 <icon-file-path>`


### PWA builder 

The PWA builder organization is funded by microsoft and helps scaffold out boilerplates for PWA development. 

#### PWA CLI

1. Install the PWA builder extension in VS code. 
2. Create a new PWA project with `npx @pwabuilder/cli create`
3. Start the pwa with `pwa start`
4. Build the pwa with `pwa build`

#### Deploying the PWA

To package your PWA, you need to have it first published to the web and then build it. Here are steps for doing so with PWA builder: 

1. Hit in `ctrl-shift-P` in VS Code and search for `PWABuilder Studio: Set App URL`.
2. Select `Yes` if you already have a URL.
3. Provide the URL for your web application.
4. Hit `ctrl-shift-P` and run the command `PWABuilder Studio: Package your PWA`.
5. Select which platform you wish to package your PWA for.
6. Follow the prompts for the platform you selected.
7. Your PWA’s package will be generated!

Go [here](https://docs.pwabuilder.com/#/home/pwa-workshop?id=_7%ef%b8%8f%e2%83%a3-package-your-pwa) to learn more about how to deploy your PWA using PWAbuilder.

Also go [here](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/platforms-practices/03) for more info on how to submit to stores
`
#### Creating icons

You can use the visual studio code extension to automatically create a bunch of icons for the PWA. 

To generate icons:
1. Ensure you have a web manifest. 
2. Hit `ctrl-shift-P` with Code open.
3. Search for and run the command `PWABuilder Studio: Generate Icons`
4. The generate icon panel will open up and ask you to select a base icon. This icon is used to generate all of the correctly-sized icons for your PWA. You can also tweak options such as icon padding and background color.
5. Click `Generate Icons`.
6. Your icons will be automatically added to your web manifest.

#### Creating screenshots

App stores and the browser install prompt will also use Screenshots of your app. The PWABuilder Studio extension can help you generate the correct sized screenshots for your application, using the URL to your deployed app, and add them directly to your manifest.

To generate icons:

1. Ensure you have a web manifest. 
2. Hit `ctrl-shift-P` and run the command `PWABuilder Studio: Generate Screenshots`.
3. The generate screenshot dialogue will open up and ask you to enter the URL to your app.
4. Click `Generate Screenshots`.
5. Your screenshots will be automatically added to your web manifest.
### PWA Manifest

Creating a web manifest is the first step to register your app as a PWA. Create an `app.webmanifest` , which is automatically recognized as JSON. Then link the manifest to your app by adding the `<link rel="manifest"/>` tag to your HTML.

1. Create `app.webmanifest`
2. Link to it in HTML
    ```tsx
    <link rel="manifest" href="app.webmanifest">
    ```
3. Add a meta theme tag to style the title bar for the app
    ```tsx
    <meta name="theme-color" content="green" />
    ```

Here is what a typical PWA manifest looks like: 

```json
  {
  "id": "/",
  "scope": "/",
  "lang": "en-us",
  "name": "Repose intelligent daily mood journal",
  "display": "standalone",
  "start_url": "/",
  "short_name": "Repose",
  "theme_color": "#B6E2D3",
  "description": "Repose is a mental health journal app that serves as your personal mood tracking companion and helps you organize and reflect upon your daily thoughts.",
  "orientation": "any",
  "background_color": "#FAE8E0",
  "dir": "ltr",
  "related_applications": [],
  "prefer_related_applications": false,
  "display_override": ["window-controls-overlay"],
  "icons": [
    {
      "src": "assets/icons/512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "assets/icons/192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "assets/icons/24x24.png",
      "sizes": "24x24",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "assets/screenshots/screen.png",
      "sizes": "1617x1012",
      "type": "image/png"
    }
  ],
  "features": [
    "Cross Platform",
    "fast",
    "simple"
  ],
  "categories": [
    "social"
  ],
  "shortcuts": [
    {
      "name": "New Journal",
      "short_name": "Journal",
      "description": "Write a new journal",
      "url": "/form",
      "icons": [{ "src": "assets/icons/icon_192.png", "sizes": "192x192" }]
    }
  ],
  "widgets": [
    {
      "name": "Starter Widget",
      "tag": "starterWidget",
      "ms_ac_template": "widget/ac.json",
      "data": "widget/data.json",
      "description": "A simple widget example from pwa-starter.",
      "screenshots": [
        {
          "src": "assets/screenshots/widget-screen.png",
          "sizes": "500x500",
          "label": "Widget screenshot"
        }
      ],
      "icons": [
        {
          "src": "assets/icons/48x48.png",
          "sizes": "48x48"
        }
      ]
    }
  ]
}
```

- `name` : the app name. **Required**
- `short_name` : the shortened version of the app name. Keep this to less than 12 characters.
- `start_url` : the start route for the app. Should pretty much always be `./` for the home screen. **Required**
- `description` : the app’s description
- `background_color` : the color for the splash screen, and should be a hex code. **Required**
- `theme_color` : the color for the splash screen and title bar of your app, and should be a hex code.
- `screenshots` : screenshots of your app to have richer preview when prompting an installation of the app on android.
- `categories`: an array of strings. Represents the categories of your app
- `scope`: Changes the navigation scope of the PWA, allowing you to define what is and isn't displayed within the installed app's window. For example, if you link to a page outside of the scope, it will be rendered in an in-app browser instead of within your PWA window. This will not, however, change the scope of your service worker.
- `display` :  a **required** value. It can be one of these values:
    - `"standalone"` : allows your app to stand as a standalone app, meaning it can be downloaded as apk, ios, and more. This is the behavior you want 90% of the time. It also has most browser support.
    - `"fullscreen"` : registers as fullscreen app. Only supported on Android
    - `"minimal-ui"` : halfway between browser and full-fledged PWA. Not supported by IOS

#### Icons

The `"icons"` key in the manifest sets up the icons for your app. It is an array of objects, where each object is info about the icon. You are required to provide three icons: 

1. A 512 x 512 icon
2. A 1024 x 1024 icon
3. A 512 x 512 **maskable** icon, which means that it looks good on any phone OS. 

To create a maskable icon with enough padding, go to the site below: 

[Maskable.app](https://maskable.app/)

While the default `"icons"` key will work for all platforms, you can override the icons for IPhone and provide your own custom ones with these `<link>` tags.

```html
<link rel="apple-touch-icon" href="/icons/ios.png">
```

**180 x 180** is the recommended size for the IPhone icon. 

#### Splash screen

Splash screens on Android use basic values from the manifest to create a default splash screen:

- `theme_color`: the color of the status bar
- `background_color`: the background color of the splash screen

Getting a splash screen to show up on Apple is an entirely different beast. You need to provide a `<meta>` and `<link>` tag, and the splash screen image you use must be EXACTLY the size of the phone screen. 

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-startup-image" href="splash.png">
```

This leads to over 20 different versions of these meta tags just to accommodate for all the different IPhone sizes, so instead use one of these two solutions: 

- [PWCompat](https://github.com/GoogleChromeLabs/pwacompat): a library that automatically generates all splash screens and icons from manifest using JavaScript
- [PWA Assets Generator](https://github.com/elegantapp/pwa-asset-generator): A CLI tool that generates all the different versions of the splash screens.  
#### Shortcuts

Shortcuts are a way to allow deep links into your app from a user friendly prompt. Define them like so, under the `"shortcuts"` key: 

```json
"shortcuts": [
  {
    "name": "News Feed", // the shortcut name
    "short_name": "Feed",
    "url": "/feed",      // the route the shortcut should open
    "description": "Noteworthy news from today.",
    "icons": [        // a custom 96x96 icon. Overrides the default.
      {
        "src": "assets/icons/news.png",
        "type": "image/png",
        "purpose": "any"
      }
    ]
  }
]
```

The `shortcuts` member is an array of `shortcut` objects, which can contain the following members:

- `name`: The display name of the shortcut. **_Required member_**
- `url`: The url that the shortcut will open to. **_Required member_**
- `short_name`: The shortened display name for when display space is limited.
- `description`: A string description of the shortcut.
- `icons`: A set of icons used to represent the shortcut. This array must include a 96x96 icon.

### PWA UX

For a good UX, a PWA should feel as much like a native app as possible. When users install a PWA on their phone, they expect app-like behavior.

Here are also some standard UX design tips for PWAs: 

- Don't use a big header area like websites do for navigation to other pages. Use a menu metaphor instead.
- Don't use a big footer area like websites do for more links and information.
- Use the `system-ui` font to make your content feel more native and load faster.

#### Badging

You can use the `navigator.setAppBadge(count)` method to set the badge for the app, which is useful for alerting the user for unread notifications and stuff like that. 

```ts
const badgeNumber = 10
navigator.setAppBadge(badgeNumber);
```

#### Targeting displays 

You can style different PWA experiences depending on their `"display_mode"` manifest key. Do it using media queries: 

```css
@media (display-mode: standalone) {
	/* code for standalone PWAs here */
}
```

#### Detecting whether user has installed app as PWA

Below is some code for how to detect whether the user is using your PWA as a web app or if they installed it: 

```jsx
window.addEventListener('DOMContentLoaded', () => {
  let displayMode = 'browser tab';
  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone';
  }
  // Log launch display mode to analytics
  console.log('DISPLAY_MODE_LAUNCH:', displayMode);
});
```

#### Disabling text selection

Disable user text selection on UI elements like buttons by using the CSS property `user-select: none`

```css
.elements {
	user-select: none;
}
```

#### Covering the IPhone notch: SafeAreaView

On phones with notches and safe areas like the iPhone 13, you need to request full screen access so that your content can show under the notch. This is how you do it in your HTML:

```html
<meta name="viewport" content="width=device-width,viewport-fit=cover" />
```

However, once you request covering the viewport, you should make sure to pad your content into the safe area view, like so:

```css
.container {
  padding: env(safe-area-inset-top) 
          env(safe-area-inset-right) 
          env(safe-area-inset-bottom) 
          env(safe-area-inset-left) !important;
}
```

### Installing the PWA

On Apple, the user can only download the PWA from Safari, and custom PWA installation will not work. It is also recommended to have this icon in your main HTML: 

```html
<link rel="apple-touch-icon" href="/icons/ios.png">
```

You can check for if the user already installed the PWA by listening to the `"appinstalled"` event on the window. This is useful to remove any custom install buttons. 

```ts
window.addEventListener('appinstalled', () => {
  // If visible, hide the install promotion
  hideInAppInstallPromotion();
  // Log install to analytics
  console.log('INSTALL: Success');
});
```
#### Custom PWA installation

Using the code below, you can attach the behavior of prompting the user to install the PWA to a button click: 

```ts
// 1. create an event variable
let bipEvent: Event | null = null;

// 2. store the event
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  bipEvent = event;
});

// 3. prompt for app installation with bipEvent.prompt()
document.querySelector("#btnInstall")!.addEventListener("click", (event) => {
  if (bipEvent) {
    bipEvent.prompt();
    const {outcome} = await bipEvent.userChoice
    // must reset afterwards
    bipEvent = null

	  if (outcome === 'accepted') {
	    console.log('User accepted the install prompt.');
	  } else if (outcome === 'dismissed') {
	    console.log('User dismissed the install prompt');
	  }
  
  } else {
    // incompatible browser, your PWA is not passing the criteria, the user has already installed the PWA
    alert(
      "To install the app look for Add to Homescreen or Install in your browser's menu"
    );
  }
});
```

### PWA hardware integrations

#### Share API

We can use the web share API with the `navigator.share()` method to have native sharing abilities: 

```jsx
await navigator.share({
  title: "MDN",
  text: "Learn web development on MDN!",
  url: "https://developer.mozilla.org",
})
```

- `url` : the url to be shared
- `text` : the description of what you’re sharing
- `title` : the share title
- `files` : an array of `File` objects to share.