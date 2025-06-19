
For more resources on PWA, go to these sites: 

- [30 days of PWA](https://microsoft.github.io/win-student-devs/#/30DaysOfPWA/advanced-capabilities/06)
- [offline cookbook](https://web.dev/articles/offline-cookbook)
- 
## JavaScript in the background

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
  window.addEventListener('beforeunload', beforeUnloadListener);
});

// A function that invokes a callback when the page's unsaved changes are resolved.
onAllChangesSaved(() => {
  window.removeEventListener('beforeunload', beforeUnloadListener);
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


**an event driven architecture**

Much like background scripts in manifest v3 for chrome extensions, service workers are not long-lived and are rather event driven. 

This means that any code you have in global scope will be offloaded and is ephemeral. Rather, put all your code inside the event listeners.
#### Service worker lifecycle

The service worker lifecycle follows three stages: 

1. **Registration**: occurs when the client side page registers the service worker
2. **Installation**: occurs when the service worker is first installed. Fires the `"install"` event.
	- It can use this for pre-caching resources (e.g., populate cache with long-lived resources like logos or offline pages).
3. **Activation**: occurs when the service worker has finished installing. Fires the `"activate"` event.
	- This service worker can now do clean up actions (e.g., remove old caches from prior version) and ready itself to handle functional events. If there is an old service worker in play, you can use `self.clients.claim()` to immediately replace the old service worker with your new one.

You also have several other events for service workers: 

- `"fetch"`: This event is triggered each time the website requests a resource over the internet, like HTML, CSS, JS, fonts, images, etc. 
	- The most common use case here is to implement a caching strategy for resources
- `"message"`: This event is triggered when the frontend sends a message to the service worker. Use this event for inter-process communication. 
- `"activate"`: when the new service worker gets activated
- `"install"`: when the new service worker gets installed for the first time


##### **registering a service worker**

You register a service worker with the `navigator.serviceWorker.register(url)` method, which returns a **service worker registration** object.

```ts
const swRegistration = await navigator.serviceWorker.register('/sw.js')
```

There can only ever be one **active** service worker, which leads us into the lifecycle:

Once you register a service worker, it can be in one of three states:

- **installing**: the service worker is installing for the first time, fetched by the `swRegistration.installing` property.
- **waiting**: the service worker is waiting for the old service worker to step down, fetched by the `swRegistration.waiting` property.
- **active**: the service worker is active and completely installed, fetched by the `swRegistration.active` property.

Here are methods to deal with registration lifecycle on the client side:

```ts
export class PWAModel {
  static async registerWorker(url: string) {
    return await navigator.serviceWorker.register(url, {
      type: "module",
      scope: "/",
    });
  }

  static async getCurrentWorker() {
    return await navigator.serviceWorker.ready;
  }

  static async onWorkerChange(cb: (worker: ServiceWorker) => void) {
    navigator.serviceWorker.addEventListener("controllerchange", (event) => {
      cb(event.target as ServiceWorker);
    });
  }
}
```
##### **updating service workers**

Service workers won't update to their newest version by default, so it's important to add this code during development to make sure the service worker always updates itself. 

```ts
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
```

When you're updating a service worker, you'll also often want to delete old caches or at least update the cache. There's more info in the caching section below:

```ts
const cachename = "v1"
sw.addEventListener("activate", (event) => {

  async function cleanCache() {
	    // gets all cache store names
	    const keys = await caches.keys();
	    keys
	      .filter((key) => key !== cachename)
	      .forEach(async (key) => {
	        // deletes cache store with the specified name
	        await caches.delete(key);
	      });
  }

  async function updateServiceWorker() {
    sw.clients.claim();
  }

  async function onActivate() {
	  await cleanCache()
	  await updateServiceWorker()
  }
  
  event.waitUntil(onActivate());
});
```
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

A common pattern is to fetch and cache critical resources for offline usage during installation, like HTML, CSS, and JS, so that the app works offline. You also have to cache network assets you use in your app, like fonts, external scripts, and external CSS like tailwind.

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
    "https://fonts.gstatic.com/s/materialicons/v67/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
  ];
  const cacheAppShell = async () => {
    const appShellCache = await caches.open("pwa-app-shell");
    await appShellCache.addAll(criticalResources);
  };
  event.waitUntil(cacheAppShell());
});
```

If it seems insane to try and think of all the URLs to cache, but luckily in your service worker you can just ping your hosting server through `fetch()` to query the filesystem and find all necessary items to cache, then return that.

##### Cache-first

![](https://i.imgur.com/Jj3MNdU.png)


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

![](https://i.imgur.com/1oIHJyC.png)


1. Fetch from the network 
2. Update the cache
3. If the network request from step 1 failed, return the response from the cache. 


```ts
async function networkFirst(request: Request, cacheStorage: CacheStorageModel) {
	try {
		// 1. fetch from network
	  const response = await fetch(request);
	  if (!response.ok) {
		throw new Error("Network response was not ok");
	  }
	  // 2. udpate cache
	  await cacheStorage.put(request, response.clone());

		// 3. return network response
	  return response;
	} catch (e) {
	// 1a) if network fails, return from cache
	  const cacheResponse = await cacheStorage.match(request);
	  if (cacheResponse) {
		return cacheResponse;
	  }
	  throw e;
	}
}
```


##### Advanced caching architecture + clearing cache


Advanced caching requires also knowing when to invalidate the cache intentionally. You can do this by smartly naming your caches and putting different types of resources into different cache stores. 

> [!NOTE]
> Also use semantic versioning to make invalidating previous caches easier so you can free up space.

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

The `"activate"` event is activated when the previous service worker is relieved of its post and is not using resources anymore. 

> [!NOTE]
> It would be a bad idea to try and clear caches in the `"install"` event when the previous worker is still active, so it's better to do it now in the `"activate"` event



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

Instead of updating the cache for our app all at once, we selectively update the cache based on the request url that is coming in. 

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


#### Service worker development


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

Here's a more in depth boilerplate:

```ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />

import { CacheStrategist } from "./sw-utils/CacheManager";

const sw = self as unknown as ServiceWorkerGlobalScope;

const APP_SHELL = ["/"];

// * change this to update the cache
const version = "v1";
const APP_CACHE_NAME = `app-${version}`;

const cacheManager = new CacheStrategist(APP_CACHE_NAME);

sw.addEventListener("install", (event) => {
  const cacheAppShell = async () => {
    try {
      await cacheManager.cacheAppShell(APP_SHELL);
    } catch (e) {
      console.error(e);
      console.log("failed to cache app shell");
    }
    await sw.skipWaiting();
  };
  event.waitUntil(cacheAppShell());
});

sw.addEventListener("fetch", (event) => {
  function isValidCacheableRequest(request: Request) {
    const booleansThatRepresentInvalidURLStates = [
      event.request.url.startsWith("chrome"),
      event.request.url.startsWith("chrome-extension"),
    ];
    return (
      request.method === "GET" &&
      booleansThatRepresentInvalidURLStates.every((b) => !b)
    );
  }

  // only cache GET requests that are not chrome or chrome-extension
  if (isValidCacheableRequest(event.request)) {
    event.respondWith(cacheManager.staleWhileRevalidate(event.request));
  }
});

sw.addEventListener("activate", (event) => {
  const activate = async () => {
    const deleted = await cacheManager.cacheStorage.deleteOldCaches();
    await sw.clients.claim();
  };
  event.waitUntil(activate());
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

  async deleteOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter((name) => name !== this.cacheName);
    return await Promise.all(oldCaches.map((name) => caches.delete(name)));
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

  async deleteMatching(predicate: (request: Request) => boolean) {
    if (!this.cache) {
      this.cache = await this.openCache();
    }
    const allKeys = await this.cache.keys();
    const keysToDelete = allKeys.filter(predicate);
    return await Promise.all(
      keysToDelete.map((key) => this.cache!.delete(key))
    );
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
  public cacheStorage: CacheStorageModel;
  constructor(public readonly cacheName: string) {
    this.cacheStorage = new CacheStorageModel(cacheName);
  }

  async getOfflinePage(url: string) {
    const response = await this.cacheStorage.match(new Request(url));
    if (response) {
      return response;
    }
    return fetch(url);
  }

  async cacheFirst(request: Request) {
    return CacheStrategist.cacheFirst(request, this.cacheStorage);
  }

  async staleWhileRevalidate(request: Request) {
    return CacheStrategist.staleWhileRevalidate(request, this.cacheStorage);
  }

  async cacheAppShell(appShell: string[]) {
    return CacheStrategist.cacheAppShell(this.cacheStorage, appShell);
  }

  static async cacheAll(cacheStorage: CacheStorageModel, requests: string[]) {
    await cacheStorage.addAll(requests);
  }

  static async cacheAppShell(
    cacheStorage: CacheStorageModel,
    appShell: string[]
  ) {
    await cacheStorage.addAll(appShell);
  }

  static async cacheFirst(request: Request, cacheStorage: CacheStorageModel) {
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

  static async networkFirst(request: Request, cacheStorage: CacheStorageModel) {
    try {
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await cacheStorage.put(request, response.clone());
      return response;
    } catch (e) {
      const cacheResponse = await cacheStorage.match(request);
      if (cacheResponse) {
        return cacheResponse;
      }
      throw e;
    }
  }

  static async staleWhileRevalidate(
    request: Request,
    cacheStorage: CacheStorageModel
  ) {
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
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        await cacheStorage.put(request, response.clone());
        return response;
 
    }
  }
}
```

##### Messaging utilities

You can use this messaging class as a wrapper around creating structured messages. This makes it so that both the client and the service worker will have type safety when messaging each other:

```ts
export class MessageSystem<T extends Record<string, any>> {
  getDispatchMessage<K extends keyof T>(key: K, payload: T[K]) {
    return {
      type: key,
      payload,
    };
  }

  messageIsOfType<K extends keyof T>(
    key: K,
    message: any
  ): message is {
    type: K;
    payload: T[K];
  } {
    if (!message || !message.type) {
      return false;
    }
    return message.type === key;
  }

  getPayload<K extends keyof T>(key: K, message: any) {
    if (!message || !message.type) {
      return null;
    }
    return message.payload as T[K];
  }
}
```

You would then export a message system specific to your app:

```ts
export const appMessageSystem = new MessageSystem<{
  ping: {
    ping: string;
  };
}>();
```
##### Custom Service Worker Class (Client)

```ts
export class PWAServiceWorkerClient {
  static async registerWorker(url: string) {
    return await navigator.serviceWorker.register(url, {
      type: "module",
    });
  }

  static async getCurrentWorker() {
    return await navigator.serviceWorker.ready;
  }

  static async onWorkerChange(cb: (worker: ServiceWorker) => void) {
    navigator.serviceWorker.addEventListener("controllerchange", (event) => {
      cb(event.target as ServiceWorker);
    });
  }

  static postMessage(message: any) {
    navigator.serviceWorker.controller?.postMessage(message);
  }
}
```

##### Custom Service Worker Class

```ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

export class ServiceWorkerModel {
  static onInstall(onInstall: (event: ExtendableEvent) => Promise<void>) {
    sw.addEventListener("install", (event) => {
      event.waitUntil(
        (async () => {
          await onInstall(event);
          await sw.skipWaiting();
        })()
      );
    });
  }

  static onFetch(onRequest: (req: Request) => Promise<Response>) {
    sw.addEventListener("fetch", (event) => {
      event.respondWith(onRequest(event.request));
    });
  }

  static onActivate(onActivate: (event: ExtendableEvent) => Promise<void>) {
    sw.addEventListener("activate", (event) => {
      const activate = async () => {
        await onActivate(event);
        await sw.clients.claim();
      };
      event.waitUntil(activate());
    });
  }

  static onMessage(
    onMessage: (event: ExtendableMessageEvent) => Promise<void>
  ) {
    sw.addEventListener("message", (event) => {
      event.waitUntil(onMessage(event));
    });
  }

  static async notifyClients(cb: (client: WindowClient) => any) {
    const clients = await sw.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    clients.forEach((client) => {
      const message = cb(client);
      client.postMessage(message);
    });
  }

  static isValidCacheableRequest(
    request: Request,
    predicates?: ((request: Request) => boolean)[]
  ) {
    const booleansThatRepresentInvalidURLStates = [
      request.url.startsWith("chrome"),
      request.url.startsWith("chrome-extension"),
    ];
    return (
      request.method === "GET" &&
      booleansThatRepresentInvalidURLStates.every((b) => !b) &&
      (predicates?.every((p) => p(request)) ?? true)
    );
  }
}
```

Here's an example that uses everything together:

```ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />

import { appMessageSystem } from "./frontend/messageHelpers";
import { CacheStrategist } from "./sw-utils/CacheManager";
import { ServiceWorkerModel } from "./sw-utils/ServiceWorkerModel";

const sw = self as unknown as ServiceWorkerGlobalScope;

const APP_SHELL = ["/", "/offline.html"];

// * change this to update the cache
const version = "v2";
const APP_CACHE_NAME = `app-${version}`;

const cacheManager = new CacheStrategist(APP_CACHE_NAME);

ServiceWorkerModel.onInstall(async (event) => {
  await cacheManager.cacheAppShell(APP_SHELL);
  await sw.skipWaiting();
});

ServiceWorkerModel.onFetch(async (request) => {
  if (ServiceWorkerModel.isValidCacheableRequest(request)) {
    try {
      console.log("trying to fetch", request.url);
      const response = cacheManager.staleWhileRevalidate(request);

      // only delete js chunks if online
      if (navigator.onLine) {
        cacheManager.cacheStorage.deleteMatching((r) => {
          // always delete js chunks
          return r.url.includes("_bun") && r.url.includes(".js");
        });
      }
      return response;
    } catch (error) {
      console.error("No network and cache miss!", error);
      return cacheManager.getOfflinePage("/offline.html");
    }
  }
  return fetch(request);
});

ServiceWorkerModel.onActivate(async (event) => {
  const deleted = await cacheManager.cacheStorage.deleteOldCaches();
});

ServiceWorkerModel.onMessage(async (event) => {
  if (appMessageSystem.messageIsOfType("ping", event.data)) {
    console.log("ping received", event.data.payload.ping);
  }
});
```


##### Building on the server

When you are rolling out your own server, there are some things to keep in mind on how to host service workers:

1. You must serve all assets statically on your server, including the service worker JS

```ts
import { $ } from "bun";
import { join } from "path";
import html from "./frontend/index.html";
import offline from "./frontend/offline.html";

await $`rm -rf ${join(__dirname, "dist")}`;

await Bun.build({
  entrypoints: [join(__dirname, "sw.ts")],
  outdir: join(__dirname, "dist"),
  target: "browser",
  format: "esm",
  sourcemap: "inline",
  minify: false,
  naming: "[name].[ext]",
  throw: true,
});

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": html,
    "/sw.js": (req) => {
      return new Response(Bun.file(join(__dirname, "dist", "sw.js")));
    },
    "/offline.html": offline,
  },
  development: true,
});

console.log(`Server is running on ${server.url}`);
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

Since a single service worker oversees all instances of a page, we send messages only to one service worker and it can send messages to multiple clients at a time.

Here's how we can fetch all clients or just specific clients and then send messages to those clients:

```ts
const clients = await self.clients.matchAll()
clients.forEach(client => {
	client.postMessage({ 
		type: 'CACHE_UPDATED', 
		url: event.request.url 
	})
})
```

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

#### Developing with service workers

- You can see all your registered service workers at the `chrome://serviceworker-internals/` link.
- You should also check the **update on reload** checkbox to make sure that your service workers update when you reload them. 
- To bypass the service worker on a reload, you can hold the `shift` key while you try to reload.

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

#### **Summary**

Here is a class that covers all cases:

```ts

export class NavigatorStorageManager {
  async askPersistStorage() {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const isPersistGranted = await navigator.storage.persist();
      return isPersistGranted;
    }
    return isPersisted;
  }

  async getStorageInfo() {
    const info = await FileSystemManager.getStorageInfo();
    return {
      percentUsed: info.storagePercentageUsed,
      bytesUsed: humanFileSize(info.bytesUsed),
      bytesAvailable: humanFileSize(info.bytesAvailable),
    };
  }
}

export function humanFileSize(bytes: number, dp = 1) {
  const thresh = 1000;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
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

To make your app offline capable, you need to add PWA meta tags to your HTML and also specify a manifest:

```html
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>My Awesome App</title>
  <meta name="description" content="My Awesome App description">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <link rel="mask-icon" href="/mask-icon.svg" color="#FFFFFF">
  <meta name="theme-color" content="#ffffff">
</head>
```

Then you can specify a manifest like so:

- The icons are fetched specifically with vite, so instead of `public/icon.png`, it just becomes `/icon.png`.
- We specify what assets to precache through the `workbox.globOptions` key

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "PWA App",
        short_name: "PWA App",
        description: "PWA App",
        theme_color: "#2d73a6",
        background_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // precaches all assets
      },
    }),
  ],
});
```

The final step is to add a `public/robots.txt` file:

```
User-agent: *
Allow: /
```
##### Basics

Inside the `VitePWA` plugin, you have access to these options:

- `registerType`: can be one of two values:
	- `"autoUpdate"`: if set to this, then the service worker will update automatically when it gets modified.
	- `"prompt"`: the default behavior. The user will be prompted if they want to update to a new service worker.
- `devOptions.enabled`: if set to true, you will be able to use the service worker in development as well, which is useful for debugging.

##### Workbox options

IN the `workbox` key you can provide all sorts of caching strategies to assets and routes. It is basically like using workbox without having to write the code yourself. 

- `workbox.globPatterns`: a list of glob patterns to precache as the app shell

```ts
VitePWA({
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // precache all relevant files
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
})
```


#### Vite PWA Assets plugin

Use the vite PWA assets plugin to dynamically generate icons of different sizes for your PWA. 

1. `npm install -D @vite-pwa/assets-generator`
2. `pwa-assets-generator --preset minimal-2023 <icon-file-path>`

```bash
pwa-assets-generator --preset minimal-2023 public/logo.svg
```

#### Creating icons automatically

Go to this great site to create 20+ PWA images just from one image:

```embed
title: "Favicon Generator | Favicon InBrowser.App"
image: "data:image/webp;base64,UklGRqACAABXRUJQVlA4TJMCAAAvC0IVAK/CKpJkJ3P3Hjn8IgAn+Nf0hiSCQSRJTubunhxMUBjBvyVuHESS7Cp94WfABE7wryje/NdBpw5EQAQEERCFRoOiwECa/AYFERAdCo1C4h9+lo2A4BBsFJoGIR8EQYCBBEAQgqB/x5vIt1LlfJ7qaNf3EhEiwrjuIkJmqqNFhGHZ1NH6eVVHK1UiQj+vtutuvx8y07yfIoJCurVNhiTF2LZtta3xrH3/F9OOqD9frqIiIvrvSJIkp8nCg/QA7L0UFPrvv7+wJI7WF6rDBFNa9Y3jRETdbipBlppHcGltkGDLNBExO4RdthcpywRfK9GRnCEA81RUOEGY9y5nlo35rBCIaan38u7OZZdgbL/UTwX3Ytn6d0dA1u8JDpbDV5G0VpLujqBMpW1gyaRNYEmFXROYXcvaRpN2U8zzWkSTdpPlPu2NptmupzK4j0TTpOg8JjQNd9sDq28vHQy8+069120dVV8b9lxvG98a9z95lGNUfW6YPbR6M7NHHllYxV/M7FPTBzN7qvHIC8Bq8X3bWOfazA+uoX2M6ASuwcxe68Slwg+wQeOYTR5bH9uFmBUPCofEQeGP8kHhHFcxMJz7Bvma2C+u6yAYXyv/EdVr5ajFpRgUxGGBBwXZoEArQWFzPijIBpufpfHkoo/64+lG0jmeLiTfGXaEpxPJl8ft4Gm3Z0XV/i3habm349MZVY7NQ3gaFjzylADtXM4qotbkznCNIspcyhZBmkt9+XAIU56QoQRqGyIuCdZU4iMFI7gaVX5TBGzT7BYJ2paj9VFUqD+ZmnCCt5kEm6sxArjxK6YvJa8RyG0kGa59bA8TzOmO97fldH2MoG58XdO9SF2fHWzNEeTN++HZddtP6X8RxQA="
description: "Generate Favicon. Fully runs in your browser. No server-side code."
url: "https://favicon.inbrowser.app/tools/favicon-generator"
favicon: ""
aspectRatio: "16.412213740458014"
```


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

#### adding autocomplete

You can add autocomplete and language support to your `app.webmanifest` or `manifest.json` by adding this schema:

```json
{
  "$schema": "https://json.schemastore.org/web-manifest-combined.json"
}
```

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

#### Richer PWA install UI

To get a cool looking install UI like this one below from squoosh, we have to put additional details in our manifest, which includes screenshots.


![](https://i.imgur.com/41wn7l1.jpeg)


You do this through adding an array of `"screenshots"`

```json
{
	// ...
    "screenshots": [
        {
            "src": "icons/screenshot.png",
            "sizes": "1170x2532",
            "type": "image/png"
        }
    ]
}
```

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

Here's a custom class:

```ts
export class PWABadger {
  static isBadgeSupported() {
    return "setAppBadge" in navigator && "clearAppBadge" in navigator;
  }

  static async setBadge(badge: number) {
    if (navigator.setAppBadge) {
      await navigator.setAppBadge(badge);
    }
  }

  static async clearBadge() {
    if (navigator.clearAppBadge) {
      await navigator.clearAppBadge();
    }
  }
}
```
#### Targeting displays 

You can style different PWA experiences depending on their `"display_mode"` manifest key. Do it using media queries: 

```css
@media (display-mode: standalone) {
	/* code for standalone PWAs here */
}
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

You can also add default values if you are not on an IPhone:

```css
.container {
  padding: env(safe-area-inset-top, 5px) 
          env(safe-area-inset-right, 5px) 
          env(safe-area-inset-bottom, 5px) 
          env(safe-area-inset-left, 5px) !important;
}
```

#### Changing status bar style

You can change the status bar style using a meta tag:

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"
```

This is the difference between `black` and `black-translucent`:


![](https://i.imgur.com/5pmbl0D.jpeg)



#### Check if in PWA

Below is some code for how to detect whether the user is using your PWA as a website or if they installed it and are using it as a PWA.

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

#### Installing the PWA and checking installation

On Apple, the user can only download the PWA from Safari, and custom PWA installation will not work. It is also recommended to have this icon in your main HTML to enable PWA installation.

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

Using the code below, you can attach the behavior of prompting the user to install the PWA to a button click: 

1. We listen for the `"beforeinstallprompt"` event on the `window` and store that event as a global variable called `bipEvent`
2. On a user gesture, we call the `bipEvent.prompt()` async method to bring up the installation prompt. This returns an outcome of `'accepted'` (user installed) or `'dismissed'` (user rejected).


```ts
// 1. create an event variable
let bipEvent: Event | null = null;

// 2. store the event
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  bipEvent = event;
});

// 3. prompt for app installation with bipEvent.prompt()
document.querySelector("#btnInstall")!.addEventListener("click", async (event) => {
  if (bipEvent) {
    await bipEvent.prompt();
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

You can check all your installed PWAs at the chrome://apps/ link.

#### Custom PWA class

Here is a custom PWA class that handles the javascript side of PWA ux:

```ts
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAModel {
  static async registerWorker(url: string) {
    return await navigator.serviceWorker.register(url, {
      type: "module",
      scope: "/",
    });
  }

  static isInPWA() {
    let displayMode = "browser tab";
    if (window.matchMedia("(display-mode: standalone)").matches) {
      displayMode = "standalone";
    }
    return displayMode === "standalone";
  }

  /**
   * runs when the app is installed
   * @param cb callback function to run when the app is installed
   */
  static onAppInstalled(cb: () => void) {
    window.addEventListener("appinstalled", cb);
  }

  static installPWA() {
    let bipEvent: BeforeInstallPromptEvent | null = null;

    return {
      install: async () => {
        if (bipEvent) {
          await bipEvent.prompt();
          const choiceResult = await bipEvent.userChoice;
          console.log(bipEvent);
          return choiceResult.outcome === "accepted";
        } else {
          throw new Error("Install prompt not available");
        }
      },
      setupInstallPrompt: () => {
        // if the app is not in display mode, and the install prompt is available, then we can install
        window.addEventListener("beforeinstallprompt", (event: Event) => {
          //   event.preventDefault();
          bipEvent = event as BeforeInstallPromptEvent;
        });
      },
    };
  }

  static showInstallPromptBanner({
    banner,
    installButton,
    onInstallSuccess,
    onInstallFailure,
    onAlreadyInstalled,
  }: {
    banner: HTMLElement;
    installButton: HTMLButtonElement;
    onInstallSuccess?: () => void;
    onInstallFailure?: () => void;
    onAlreadyInstalled?: () => void;
  }) {
    banner.style.display = "block";
    const { setupInstallPrompt, install } = PWAModel.installPWA();

    // 1. register the install prompt with event listener
    setupInstallPrompt();

    if (!PWAModel.isInPWA()) {
      // 2. add event listener to button for installation, remove banner on success.
      const controller = new AbortController();
      installButton.addEventListener(
        "click",
        async () => {
          const success = await install();
          if (success) {
            banner.remove();
            controller.abort();
            onInstallSuccess?.();
          } else {
            onInstallFailure?.();
          }
        },
        {
          signal: controller.signal,
        }
      );

      // 3. add the banner to the body if it's not already there
      if (!document.body.contains(banner)) {
        document.body.appendChild(banner);
      } else {
        banner.style.display = "block";
      }
    } else {
      onAlreadyInstalled?.();
    }
  }
}
```

You can then install a PWA like this:

```ts
const appBanner = DOM.createDomElement(html`
  <div
    class="fixed bottom-4 left-4 bg-white/75 py-2 px-8 text-center rounded-lg shadow-lg space-y-2 z-50 border-2 border-gray-300"
  >
    <p class="text-sm">Install App?</p>
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
    >
      Install
    </button>
  </div>
`);

const appBanner$throw = DOM.createQuerySelectorWithThrow(appBanner);

PWAModel.showInstallPromptBanner({
  banner: appBanner,
  installButton: appBanner$throw("button")!,
  onAlreadyInstalled: () => {
    Toaster.info("already installed");
  },
  onInstallFailure: () => {
    Toaster.danger("user refused to install");
  },
  onInstallSuccess: () => {
    Toaster.info("user installed our malware successfully!");
  },
});
```


### PWA APIs

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

