
## Resources

[![GoogleChrome/chrome-extensions-samples - GitHub](https://gh-card.dev/repos/GoogleChrome/chrome-extensions-samples.svg)](https://github.com/GoogleChrome/chrome-extensions-samples)

- Go here for [functional samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples)
- Go here for [basic API samples](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples)

## Manifest

Here is an example of a basic manifest: 

```json
{
  "name": "Youtube Bookmarker",
  "description": "A bookmark extension for your videos",
  "version": "1.0.0",
  "manifest_version": 3,
  "icons": {
    "16": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  },
  // declare popup
  "action": {
    "default_popup": "popup.html",
    "default_title": "React Extension",
    "default_icon": "icon.png"
  },
  "permissions": ["storage"],
  "host_permissions": ["https://*.youtube.com/*"],
  "optional_permissions": ["tabs"],
  "optional_host_permissions": ["https://www.google.com/"],
  // declare options page
  "options_page": "options.html",
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://*.youtube.com/*"],
      "js": ["contentScript.js"]
    }
  ]
}
```

- `name` : the name of the extension
- `version` : the version of the extension
- `manifest_version` : the numebr api of manifest to use.
- `description` : the description of the extension
- `permissions` : an array of chrome apis that you request permission to use.
- `host_permissions` : a list of sites that your extension can receive cors requests from. Also a list of urls where you are given permission to use the sensitive `tabs` permission, and extract the url
- `optional_permissions` : a list of optional permissions
- `optional_host_permissions` : a list of optional host permissions, so a list of urls that you can optionally give `tab` permission access to.
- `background`
  - `service_worker` : the file that will be the background service file, which deals with chrome api events.
- `content_scripts` : a list of scripts that you can use for the chrome extension.
- `action`
  - `default_icon` : an object of filepaths that decide the icon for the chrome extension
  - `icon` : an object of filepaths that decide the icon for the chrome extension
  - `default_title` : default title of the chrome extension
  - `default_popup` : file to render for the popup.
- `"minimum_chrome_version"` : the minimum chrome version users should have in order for your extension  to work

### Code completion

You can add code completion to the manifest by adding this key at the top level of the `manifest.json`:

```json
  "$schema": "https://json.schemastore.org/chrome-manifest"
```
### Tab Permissions

When we want to extract the title of url of a tab or dynamically inject content scripts into some site, that is sensitive information, so we need extra permissions.
- `tabs` : the permission allows us to read sensitive data on all tabs.
- `activeTab` : the permission allows us to read sensitive data on any tab where the user actively clicks the popup. This has less dangerous permissions than `tabs`.
- `hostPermissions` : this permission allows us to read sensitive data only on the urls we specify. As such, this is preferred if you only need to extract the url on specific sites. Also allows us to use `fetch()` on those sites.
- `<all_urls>` : allows tab and scripting access to all urls

```javascript
"permissions": ["storage"],
"host_permissions": ["https://*.youtube.com/*"],
```

## Pages

### Popup

To declare a popup file, set the `action` key in the manifest: 

```json
  "action": {
    "default_popup": "popup.html",
    "default_title": "React Extension",
    "default_icon": "icon.png"
  },
```

- `action`
  - `default_icon` : an object of filepaths that decide the icon for the chrome extension
  - `icon` : an object of filepaths that decide the icon for the chrome extension
  - `default_title` : default title of the chrome extension
  - `default_popup` : file to render for the popup.

A popup can access all chrome APIs and is just another extension process. However, as opposed to service workers, a popup can also access all standard browser APIs like LocalStorage as `window` is defined on it.

:::warning
Events in the popup are not long lived and are only listening for as long as the popup page is active. It is best register events in the background script.
:::

### Options Page

You can specify an options page by going into the `manifest.json` and specifying a file in the `options_page` key.

``` javascript
{
  "name": "My extension",
  ...
  "options_page": "options.html",
  ...
}
```

Use the `chrome.runtime.openOptionsPage()` method to open the options page programattically.

### Override page

Just add an html file in the manifest:

```json
  "chrome_url_overrides": {
    "newtab": "blank.html"
  },
```

In the `"chrome_url_overrides"` key, there are three pages you can override:

- `"newtab"` : the new tab page
- `"bookmarks"` : the bookmarks page
- `"history"` : the chrome history page


### Offscreen Documents

If you want to do background work with a service worker and need access to DOM APIs like clipboard or canvas, you need to do it with **offscreen documents**. Offscreen documents don't need a webpage to run DOM API methods, which is ideal for extension service workers.


> [!IMPORTANT] 
> You need the `"offscreen"` manifest permission to use offscreen documents. 

**creating offscreen documents**

Here is an example of registering an offscreen document, and you can only register one offscreen document per chrome extension. 

```ts
chrome.offscreen.createDocument({
  url: 'off_screen.html',
  reasons: ['CLIPBOARD'],
  justification: 'reason for needing the document',
});
```

Here are the properties you should pass to the `chrome.offscreen.createDocument(options)` method: 
- `url` : the static extension page to act as the offscreen document
- `reasons` : used to determine what the document is used for and the lifetime of the document.

**using offscreen documents**

Once you create an offscreen document, you can use basic chrome runtime messaging to communicate with it and send data to it so it can perform DOM tasks with that data. 


> [!IMPORTANT] 
> Offscreen documents only have access to the `chrome.runtime` API and no other APIs. 

**closing offscreen documents**

You can then deregister the document using the `chrome.offscreen.closeDocument()` async method. 

You can also close the document from the offscreen context itself by doing `window.close()` from within the offscreen context

```ts
// requires "offscreen" permission in manifest.json

export default class Offscreen {
  private static creating: Promise<null | undefined | void> | null; // A global promise to avoid concurrency issues
  static reasons = {
    DOM_PARSER: chrome.offscreen.Reason.DOM_PARSER, // access to the DOMParser API
    CLIPBOARD: chrome.offscreen.Reason.CLIPBOARD, // access to the clipboard API
    TESTING: chrome.offscreen.Reason.TESTING, // used for testing purposes
    BLOBS: chrome.offscreen.Reason.BLOBS, // access to the Blob API and creating blobs
    LOCAL_STORAGE: chrome.offscreen.Reason.LOCAL_STORAGE, // access to the localStorage API
    GEOLOCATION: chrome.offscreen.Reason.GEOLOCATION, // access to the geolocation API
    USER_MEDIA: chrome.offscreen.Reason.USER_MEDIA, // access to the getUserMedia API
    DISPLAY_MEDIA:
      chrome.offscreen.Reason
        .DISPLAY_MEDIA /** The offscreen document needs to interact with 
        media streams from display media (e.g. getDisplayMedia()). */,
  };
  static getReasons(reasons: (keyof (typeof Offscreen)["reasons"])[]) {
    return reasons as chrome.offscreen.Reason[];
  }

  static async getOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({});

    const offscreenDocument = existingContexts.find(
      (c) => c.contextType === "OFFSCREEN_DOCUMENT"
    );
    return offscreenDocument;
  }

  static async setupOffscreenDocument({
    url,
    justification,
    reasons,
  }: chrome.offscreen.CreateParameters) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path

    if (await Offscreen.hasDocument(url)) return;

    // create offscreen document
    if (Offscreen.creating) {
      await Offscreen.creating;
    } else {
      Offscreen.creating = chrome.offscreen.createDocument({
        url,
        justification,
        reasons,
      });
      await Offscreen.creating;
      Offscreen.creating = null;
    }
  }

  static async closeDocument() {
    await chrome.offscreen.closeDocument();
  }

  private static async hasDocument(path: string) {
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [offscreenUrl],
    });
    return existingContexts.length > 0;
  }
}
```


## Match Patterns

Match patterns and globs are way of matching URLs. Globs are more flexible than match patterns.

**globs**

Globs have these rules to them:

1. `*` stands for any number of characters, like `.*` in regex. Essentially a wildcard representing an infinite number of characters.
2. `?` stands for a any single character, like `.` in regex.

**Match patterns**

There are three parts to a match pattern:

1. **Scheme** : Like http, https, file, etc.
2. **host** : the domain name, like `www.google.com` or `*.google.com`
3. **path** : the route

Here is the basic syntax:

```
<url-pattern> := <scheme>://<host><path>
```

- `<scheme>` : matches `'*' | 'http' | 'https' | 'file' | 'ftp' | 'urn'`
- `<host>` : matches `'*' | '*.'`
- `<path>` : matches `/*`

The meaning of the `*` depends on whether you're in the scheme, host, or path.
- If you're in the scheme, the `*` refers to all the protocols you can match.
- If you're in the path, the `*` refers to any number of any characters

Here are some examples: 
- `https://*/*` : matches every URL that uses https
- `https://*/foo*` : matches every https URL, as long as its route starts with `foo`
- `<all_urls>` : matches every single URL
- `https://*.google.com/*` : matches all google related websites, like docs.google or slides.google
## Content Scripts

Content scripts run in the context of the webpage a user is currently on. You are allowed only limited access to the chrome extension API (runtime, storage), and you can't use local resources from your extension project as is. 

There are two main processes you can run on: 

- **MAIN**: As if adding another script tag to the webpage. You have access to all global variables from other scripts, and the webpage can do the same for you.
	- You share the same window object.
- **ISOLATED**: You have access to the same document, but different globals. Isolated worlds have different `window` objects.

Content scripts run in an isolated world, meaning that they don't have any access to other scripts on the webpage. If you set a content script to run in the `MAIN` world, it will no longer have access to the extension APIs like `chrome.runtime` and `chrome.storage`.



> [!NOTE] Content Security Policy
> Content scripts are also subject to the CSP of a website, meaning that if a website disallows fetching resources from it using the `fetch()` API, you can get around it by telling the background script to do the fetching, which it has full access to do since it is not bound the CSP of a website. 

### Creating a content script

Here is how you can statically register a content script: 

```ts
"contentScripts" : [{
	 "matches": ["https://*.example.com/*"],
     "css": ["my-styles.css"],
     "js": ["content-script.js"],
     "exclude_matches": ["*://*/*foo*"],
     "include_globs": ["*example.com/???s/*"],
     "exclude_globs": ["*bar*"],  
} ] 
```

Statically registered content scripts are automatically run on any matching URLs. To dynamically run a content script, use the `scripting` API.

Here are the keys you can pass for a content script config:
- `"all_frames"` : a boolean value, where if `true`, the content script will run on all frames of the page, like `<iframes>` or blobs.

### Accessing images

Content scripts run in an isolated world, so to access static resources in your extension project from your content script or download them with `fetch()`, you have to follow these steps: 

1. Specify which resources to make available for the content script through the `"web_accessible_resources"` key in the manifest
```json
{
  ...
  "web_accessible_resources": [
    {
      "resources": [ "images/*.png" ],
      "matches": [ "https://example.com/*" ]
    }
  ],
  ...
}
```
2. Use the `chrome.runtime.getURL(filepath)` method to get a chrome URL to the extension file that you can use in the content script.
```js
let image = chrome.runtime.getURL("images/my_image.png")
```

### Dynamic scripting

You can use the `chrome.scripting` to execute content scripts and normal scripts dynamically. However, you do not have access to any chrome APIs when dynamically doing so. 

Here is an example of how you can import the raw path to a js file and then execute it:

```ts
import scriptPath from "../contentScript/dynamicscript?script"; // imports path

function executeScript(tabId: number) {
	chrome.scripting.executeScript({
		target: {tabId},
		files: [scriptPath]
	})
}
```

### Web Components

It is not possible to register web components in a content script because `customElements` is set to null for security reasons.

Instead of rendering custom elements, you can just manually build them like so:

```ts
import { css, CSSVariablesManager, DOM, html } from "../Dom";
import WebComponent from "./WebComponent";

interface StaticProps {
  "data-iframe-url": string;
}

const observableAttributes = [] as readonly string[];
export class ContentScriptUI extends WebComponent {
  static tagName = "content-script-ui" as const;
  static cameraId = "ez-screen-recorder-camera" as const;
  static elementContainerName = "camera-iframe-container" as const;

  constructor() {
    super({
      templateId: ContentScriptUI.tagName,
    });
  }

  static override get CSSContent() {
    return css`
      #camera-iframe-container {
        width: 200px;
        height: 200px;
        position: fixed;
        bottom: 0;
        right: 0;
        border-radius: 9999px;
        border: 4px solid rebeccapurple;
        z-index: 5000;
        cursor: grab;
        resize: both;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.25);
      }

      #camera-iframe-container .draggable-handle {
        background-color: #fff;
        border: 2px solid gray;
        width: 3rem;
        height: 1.5rem;
        border-radius: 1rem;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        display: block;
        z-index: -1;
        cursor: grab;
      }

      #camera-iframe-container .iframe-container {
        overflow: hidden;
        background-color: black;
        width: 100%;
        height: 100%;
        border-radius: 9999px;
      }

      #camera-iframe-container iframe {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border: none;
        pointer-events: none;
      }

      #placeholder {
        visibility: hidden;
        position: absolute;
        transform: translate(-600%, -600%);
      }
    `;
  }

  static registerSelf() {
    if (!customElements.get(this.tagName)) {
      WebComponent.register(this.tagName, this);
    }
  }

  static override get HTMLContent() {
    return html`
      <div class="shit-another-container">
        <div id="placeholder"></div>
        <div id="camera-iframe-container">
          <!-- <div class="draggable-handle"></div> -->
          <div class="iframe-container">
            <iframe
              allow="camera; microphone; fullscreen; display-capture; autoplay; encrypted-media; picture-in-picture;"
              width="200"
              height="200"
              id="${this.cameraId}"
            ></iframe>
          </div>
        </div>
      </div>
    `;
  }

  static manualCreation(iframeSrc: string) {
    // 1) add css
    const styles = document.createElement("style");
    styles.textContent = this.CSSContent;
    styles.id = `${this.tagName}-camera-iframe-styles`;

    console.log("styles", styles);
    document.head.appendChild(styles);

    // 2) add iframe
    const videoFrame = DOM.createDomElement(this.HTMLContent);
    console.log("videoFrame", videoFrame);
    videoFrame.querySelector("iframe").src = iframeSrc;
    document.body.appendChild(videoFrame);

    return videoFrame;
  }

  static manualDestruction() {
    const styles = DOM.$(`#${this.tagName}-camera-iframe-styles`);
    if (styles) {
      styles.remove();
    }

    const videoFrame = DOM.$(".shit-another-container");
    console.log("content script: videoFrame to remove", videoFrame);
    if (videoFrame) {
      videoFrame.remove();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const iframeSrc = this.getAttribute("data-iframe-url");
    if (!iframeSrc) {
      throw new Error("data-iframe-url attribute is required");
    }
    this.$throw("iframe").src = iframeSrc;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [ContentScriptUI.tagName]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & StaticProps,
        HTMLElement
      >;
    }
  }
}
```
## Core API

### Event filters

[Go here](https://developer.chrome.com/docs/extensions/reference/api/events) for docs

### Messaging

You can send messages between extension processes using these two methods:

- `chrome.runtime.sendMessage(payload)` : an async method. Use this for when the content script wants to send a message to some other extension process, or an extension process wants to send a message to another extension process. 
	- Returns the response you get back from the listener.
- `chrome.tabs.sendMessage(tabId, payload)` : an async method. Use this for when an extension process wants to send a message to the content script.

You can then listen for the message using the `chrome.runtime.onMessage.addListener()` method, available everywhere.


```ts
// send message
const response = await chrome.runtime.sendMessage({ action: "greet" });

// listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "greet") {
    console.log("Hello from background");
    sendResponse({ message: "Hello from background" });
  }
});

// example for sending message to content script on current tab
async function sendMessageToContentScript() {
	const [tab] = chrome.tabs.query({active: true, currentWindow: true})
	await chrome.tabs.sendMessage(tab.id, {action: "received"})
}
```

#### A common error 

> [!DANGER] Message listeners not registering
> You will eventually run into the nefarious "Uncaught error: message listener does not exist" or something like that. This is common and can be solved easily.


Whenever you get this messaging error, it means one process sent a message without a listener being registered on the other side. It's okay to register a listener without someone sending, but never okay to send a message without someone listening. 

This error crops up most commonly when a background script is sending a message to the content script. It can occur for two reasons: 

- The content script was not injected onto the page the background script sent the message to.
	- **Solution**: Check the `matches` key in the content script. Ensure you are only sending messages to pages where the content script is registered to run.
- The content script has not loaded fully yet.
	- **Solution**: Establish a pinging method with the background script, where you keep catching the `chrome.runtime.LastError` error and keep retrying sending messages to the content script until it responds back.

Here is the pinging solution wrapped up in a reusable class: 

```ts
export class MessagesModel {

	// for extension to keep repeatedly pinging content script until
	// it loads
  private static pingContentScript(
    tabId: number,
    maxRetries = 10,
    interval = 500
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      function sendPing() {
        attempts++;
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
          if (chrome.runtime.lastError) {
            if (attempts < maxRetries) {
              setTimeout(sendPing, interval); // Retry after a delay
            } else {
              reject("Content script not responding.");
            }
          } else if (response && response.status === "PONG") {
            resolve("Content script is ready.");
          } else {
            reject("Unexpected response from content script.");
          }
        });
      }

      sendPing();
    });
  }

	// the listener to register on content script
  static receivePingFromBackground() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "PING") {
        sendResponse({ status: "PONG" });
      }
    });
  }
}
```

The way this works is two fold:

1. Establish a pinging listener on the content script with the `receivePingFromBackground()` method.
2. Send messages with pinging with the `pingContentScript()` method. 

Here is the best way to use messages:

```ts
type Listener = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;
export class MessagesOneWay<PayloadType, ResponseType> {
  private listener: Listener | null = null;
  static channels: string[] = [];
  constructor(private channel: string) {
    if (MessagesOneWay.channels.includes(channel)) {
      throw new Error(`Channel ${channel} already exists`);
    }
    MessagesOneWay.channels.push(channel);
  }

  /**
   * for sending message from process to another process
   *
   */
  sendP2P(payload: PayloadType) {
    chrome.runtime.sendMessage({ type: this.channel, ...payload });
  }

  /**
   * for sending message from a content script to another process
   *
   */
  sendC2P(payload: PayloadType) {
    chrome.runtime.sendMessage({ type: this.channel, ...payload });
  }

  /**
   * for sending message from a process to a content script
   */
  sendP2C(tabId: number, payload: PayloadType) {
    chrome.tabs.sendMessage(tabId, { type: this.channel, ...payload });
  }

  /**
   * for sending message from a process to a content script, waiting for content script to load
   */
  sendP2CWithPing(tabId: number, payload: PayloadType) {
    MessagesModel.waitForContentScript(tabId, () => {
      chrome.tabs.sendMessage(tabId, { type: this.channel, ...payload });
    });
  }

  /**
   * for sending message from process to another process
   *
   */
  async sendP2PAsync(payload: PayloadType) {
    return (await chrome.runtime.sendMessage({
      type: this.channel,
      ...payload,
    })) as ResponseType;
  }

  /**
   * for sending message from a content script to another process
   *
   */
  async sendC2PAsync(payload: PayloadType) {
    return (await chrome.runtime.sendMessage({
      type: this.channel,
      ...payload,
    })) as ResponseType;
  }

  /**
   * for sending message from a process to a content script async
   */
  async sendP2CAsync(tabId: number, payload: PayloadType) {
    return (await chrome.tabs.sendMessage(tabId, {
      type: this.channel,
      ...payload,
    })) as ResponseType;
  }

  async sendP2CAsyncWithPing(tabId: number, payload: PayloadType) {
    const response = await MessagesModel.waitForContentScript(
      tabId,
      async () => {
        return (await chrome.tabs.sendMessage(tabId, {
          type: this.channel,
          ...payload,
        })) as ResponseType;
      }
    );
    return response;
  }

  listen(callback: (payload: PayloadType) => void) {
    const listener: Listener = (
      message: PayloadType & { type: string },
      sender: any,
      sendResponse: any
    ) => {
      if (message.type === this.channel) {
        callback(message);
      }
    };
    this.listener = listener;
    chrome.runtime.onMessage.addListener(this.listener);
  }

  static listenToMessages(
    callback: (
      message: any,
      sender?: any,
      sendResponse?: (t: any) => void
    ) => void
  ) {
    chrome.runtime.onMessage.addListener(callback);
    return callback;
  }

  listenAsync(callback: (payload: PayloadType) => Promise<ResponseType>) {
    const listener: Listener = async (
      message: PayloadType & { type: string },
      sender: any,
      sendResponse: any
    ) => {
      if (message.type === this.channel) {
        const response = await callback(message);
        sendResponse(response);
        return true;
      }
      return true;
    };
    this.listener = listener;
    chrome.runtime.onMessage.addListener(this.listener);
  }

  removeListener() {
    if (this.listener) {
      chrome.runtime.onMessage.removeListener(this.listener);
    }
  }

  parseMessage(message: any) {
    if (!message.type) {
      return { messageBelongsToChannel: false, payload: undefined };
    }
    if (message.type === this.channel) {
      return {
        messageBelongsToChannel: true,
        payload: message as PayloadType & { type: string },
      };
    } else {
      return { messageBelongsToChannel: false, payload: undefined };
    }
  }
}

export class MessagesModel {
  private static pingContentScript(
    tabId: number,
    maxRetries = 10,
    interval = 500
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      function sendPing() {
        attempts++;
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
          if (chrome.runtime.lastError) {
            if (attempts < maxRetries) {
              setTimeout(sendPing, interval); // Retry after a delay
            } else {
              reject(
                "Content script not responding. Make sure you are invoking MessagesModel.receivePingFromBackground() in the content script."
              );
            }
          } else if (response && response.status === "PONG") {
            resolve("Content script is ready.");
          } else {
            reject("Unexpected response from content script.");
          }
        });
      }

      sendPing();
    });
  }

  static receivePingFromBackground() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "PING") {
        sendResponse({ status: "PONG" });
      }
    });
  }

  static async waitForContentScript<T = void>(
    tabId: number,
    cb: () => T | Promise<T>
  ): Promise<T>;
  static async waitForContentScript<T = void>(
    tabId: number,
    {
      successCb,
      errorCb,
    }: {
      successCb: (message?: string) => void;
      errorCb?: () => void;
    }
  ): Promise<T>;

  static async waitForContentScript<T = void>(
    tabId: number,
    optionsOrCb:
      | {
          successCb: (message?: string) => T | Promise<T>;
          errorCb?: () => void;
        }
      | (() => void | Promise<void>)
  ) {
    try {
      const message = await this.pingContentScript(tabId);
      if (typeof optionsOrCb === "function") {
        return await optionsOrCb();
      }
      return await optionsOrCb.successCb(message);
    } catch (error) {
      console.error("Error pinging content script", error);
      if (typeof optionsOrCb === "function") {
        return;
      }
      optionsOrCb.errorCb?.();
    }
  }
}
```


### Runtime Lifecycle

- `chrome.runtime.onInstalled` : runs when the user installs the extension for the first time, the extension updates, or chrome updates. 
- `chrome.runtime.onSuspended` : runs when the service worker goes to sleep. It is the perfect time for cleanup

```ts
chrome.runtime.onInstalled.addListener((details) => {
  if(details.reason !== "install" && details.reason !== "update") return;
  chrome.contextMenus.create({
    "id": "sampleContextMenu",
    "title": "Sample Context Menu",
    "contexts": ["selection"]
  });
});
```

### Storage

#### Intro

Chrome storage is an API with key-value storage much like localstorage, where each key is independent from the other. You can modify certain values in storage without modifying others.

There are 4 types of chrome storage. 

- **sync storage**: Synced across devices. Each key can hold 8kb, and max storage is 100kb.
- **local storage**: Local to the device. Max storage is 5mb.

#### API

Storage is completely asynchronous. All instances of storage extend from the `chrome.storage.StorageArea` abstract class.

When setting and getting values, you can store anything as long as it is serializable.

- `storage.set({[key: string] : any})` : sets the object in storage. You can specify as many key-value pairs as you want
- `storage.get({[key: string] : any})` : gets the specified keys from storage. Returns as an object. If a key is not defined, the value returned is null.

#### Storage listener

The `chrome.storage.onChanged` listener can be used for realtime storage updates, like it is for this react hook.

The function is as follows, with the following params.

```ts
   chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local") {
        // do stuff pertaining to local storage canges
      }
    });
```

- `changes` : the dictionary of changes to storage. A `changes[key]` returns an object with the newValue and oldValue properties.
- `areaName` : which storage the change is from.


```ts
export function useChromeStorage<
  T extends Record<string, any>,
  K extends keyof T
>(storage: ChromeStorage<T>, key: K) {
  const [value, setValue] = React.useState<T[K] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function getValue() {
      setLoading(true);
      const data = await storage.get(key);
      setValue(data);
      setLoading(false);
    }

    getValue();
  }, []);

  React.useEffect(() => {
    const handleChange = async (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      let keys = storage.getKeys();
      if (keys.length === 0) {
        keys = await storage.getAllKeys();
      }
      if (keys.includes(key)) {
        const thing = changes[key as string];
        if (!thing) return;
        setValue(thing.newValue);
      }
    };
    // Set up listener for changes
    chrome.storage.onChanged.addListener(handleChange);

    // Clean up listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, []);

  async function setValueAndStore(newValue: T[K]) {
    setLoading(true);
    await storage.set(key, newValue);
    setValue(newValue);
    setLoading(false);
  }

  return { data: value, loading, setValueAndStore };
}
```

### Optional Permissions

To avoid certain permission warnings, you can request optional permissions by specifying the `optional_permissions` key in the manifest. 

You can then request them during runtime using the `chrome.permissions` API:

```ts
export default class PermissionsModel {
  constructor(public permissions: chrome.permissions.Permissions) {}

  async request() : Promise<boolean> {
    return await chrome.permissions.request(this.permissions);
  }

  async requestAndExecuteCallback(cb: (granted: boolean) => void) {
    const isGranted = await chrome.permissions.request(this.permissions);
    cb(isGranted);
  }
	
  async permissionIsGranted() : Promise<boolean> {
    return await chrome.permissions.contains(this.permissions);
  }

  async remove() {
    return await chrome.permissions.remove(this.permissions);
  }
}
```


> [!WARNING] Title
> Keep in mind that any optional permissions you request if not granted will be undefined. If `chrome.alarms` is requested as an optional permission, beware that 

Here is an example of setting up optional permissions knowing that they could be undefined at runtime: 

```ts
chrome.permissions.onAdded.addListener((permissions) => {
  console.log("Permissions added", permissions);
  setupAlarmListener();
});

// Function to set up the alarm listener if the API is available
function setupAlarmListener() {
  if (chrome.alarms) {
    console.log("chrome.alarms API is available.");
    reminderAlarm.onTriggered(() => {
      console.log("Alarm triggered");
      NotificationModel.showBasicNotification({
        title: "Daily Reminder",
        message: "Don't forget to finish your todos for today!",
        iconPath: "/icon.png",
      });
    });
  } else {
    console.warn("chrome.alarms API is not available.");
  }
}
```

