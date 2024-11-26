## Action

- `chrome.action.onClicked.addListener(tab => {})` : this event fires when the user clicks on the action icon. This event will not fire if a popup is defined.

## Alarms

The `alarms` API can be accessed through granting the `"alarms"` permission.

Alarms generally persist until an extension is updated. However, this is not guaranteed, and alarms may be cleared when the browser is restarted. Consequently, consider setting a value in storage when an alarm is created, and then ensure it exists each time your service worker starts up. For example:

```js
const STORAGE_KEY = "user-preference-alarm-enabled";

async function checkAlarmState() {
  const { alarmEnabled } = await chrome.storage.get(STORAGE_KEY);

  if (alarmEnabled) {
    const alarm = await chrome.alarms.get("my-alarm");

    if (!alarm) {
      await chrome.alarms.create({ periodInMinutes: 1 });
    }
  }
}

checkAlarmState();
```

### Creating alarms

This is the basic way to create and handle alarms: 

```js
// 1. create the alarm
  chrome.alarms.create('demo-default-alarm', {
    delayInMinutes: 1,
    periodInMinutes: 1,
    when: new Date("2024-08-01")
  });
  
// 2. listen for the alarm
chrome.alarms.onAlarm.addListener(alarm => {
	// do something here
})
```

An `Alarm` instance looks like this: 

```ts
interface Alarm {
	name: string // alarm name
	periodInMinutes: number // alarm period
	scheduledTime: number // time at which the alarm was scheduled to fire
}
```
### Extra API

- `chrome.alarms.create(name, options)` : creates an alarm with the specified name and options. Here are the keys of the options object you can pass: 
	- `delayInMinutes: number` : the delay in minutes before alarm begins
	- `periodInMinutes: number` : how long an alarm should wait before repeating. This has a minimum value of 30 seconds, or `0.5` in minutes.
	- `when: Date` : when the alarm should trigger.
- `chrome.alarms.onAlarm.addListener(alarm => ...)` : whenever an alarm fires, the callback you provide is triggered. 

And here are the asynchronous methods:

- `chrome.alarms.clear(name)` : clears the alarm with the specified name
- `chrome.alarms.clearAll()` : clears all alarms
- `chrome.alarms.get(name)` : returns an `Alarm` instance representing the alarm with the specified name.
- `chrome.alarms.getAll()` : returns an array of all the `Alarm` instances in your app

### Example

Here is a simple alarm class and a suitable example:

```ts
export class ChromeAlarm {
  private alarmCB?: (alarm: chrome.alarms.Alarm) => void;
  constructor(private alarmName: string) {}

  async createAlarm(alarmInfo: chrome.alarms.AlarmCreateInfo) {
    await chrome.alarms.create(this.alarmName, alarmInfo);
  }

  async upsertAlarm(alarmInfo: chrome.alarms.AlarmCreateInfo) {
    const alarm = await this.getAlarm();
    if (!alarm) {
      await this.createAlarm(alarmInfo);
      return null;
    }
    return alarm;
  }

  async getAlarm() {
    const alarm = await chrome.alarms.get(this.alarmName);
    if (!alarm) {
      return null;
    }
    return alarm;
  }

  onTriggered(callback: () => void) {
    const alarmCB = (alarm: chrome.alarms.Alarm) => {
      if (alarm.name === this.alarmName) {
        callback();
      }
    };
    this.alarmCB = alarmCB;
    chrome.alarms.onAlarm.addListener(alarmCB);
  }

  /**
   *
   * @returns wasCleared: True if the alarm was successfully cleared, false otherwise.
   */
  async clearAlarm() {
    this.alarmCB && chrome.alarms.onAlarm.removeListener(this.alarmCB);
    return await chrome.alarms.clear(this.alarmName);
  }
}
```

```ts
import { ChromeAlarm } from "../utils/api/alarms";
import NotificationModel from "../utils/api/notifications";
import { Runtime } from "../utils/api/runtime";

const installAlarm = new ChromeAlarm("installAlarm");

Runtime.onInstall({
  // runs first time you download the extension
  installCb: async () => {
    console.log("Extension installed");
  },
  // runs every time you update the extension or refresh it
  updateCb: async () => {
    console.log("Extension updated");
    const curAlarm = await installAlarm.upsertAlarm({
      when: Date.now() + 1000,
      periodInMinutes: 0.5,
    });
  },
});

installAlarm.onTriggered(() => {
  console.log("Alarm triggered");
  NotificationModel.showBasicNotification({
    title: "Extension Updated",
    message: "Extension has been updated successfully",
    iconPath: "public/icon.png",
  });
});
```

## Bookmarks

## Commands

The `commands` key in the manifest allows you to register global keyboard shortcuts for your extension. Keyboard shortcuts only work when the browser is in focus.


:::tip
Users can remap the command by going to [chrome extension shortcuts](chrome://extensions/shortcuts)
:::

```json
  "commands": {
    "run-foo": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y"
      },
      "description": "Run \"foo\" on the current page."
    },
    "_execute_action": {
      "suggested_key": {
        "windows": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y",
        "chromeos": "Ctrl+Shift+U",
        "linux": "Ctrl+Shift+J"
      }
    }
  },
```

The `"_execute_action"` command is special because it simulates clicking the action of the extension. 

You can then listen for the keyboard shortcut like so: 

```ts

// if normal keyboard shortcut is hit
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
});

// if _execute_action shortcut is hit
chrome.action.onClicked.addListener((tab) => {
  
});
```

```ts
export default class Commands {
  constructor(private commands: Record<string, () => void>) {}

  addListeners() {
    chrome.commands.onCommand.addListener((command) => {
      if (this.commands[command]) {
        this.commands[command]();
      }
    });
  }

  static onExecuteAction(cb: () => void) {
    chrome.action.onClicked.addListener(cb);
  }

  static async getAllCommands()  {
    return await chrome.commands.getAll();
  }

  static async getActiveCommands() {
    const commands = await Commands.getAllCommands();
    return commands.filter((command) => command.shortcut !== "");
  }
}
```

- `chrome.commands.getAll()` : async method that returns the list of all the command names as a `Command` instance.

The `Command` instance has these properties: 
- `command.name` : the name
- `command.description` : the description
- `command.shortcut` : the keyboard shortcut, and blank if unassigned.

## Context Menus

You can create context menu items easily with the `chrome.contextMenus` API, which needs the `"contextMenus"` permission in the manifest.

You should create context menus at the beginning of the application, on the `runtime.onInstalled` event. 

- `chrome.contextMenus.create(options)` : creates a context menu
- `chrome.contextMenus.remove(menuId)` : deletes the context menu with the specified menu id
- `chrome.contextMenus.removeAll()` : removes all context menus

You can then listen for a context menu click like so: 

```ts
chrome.contextMenus.onClicked.addListener(menu => {
	// do an action based on menu id
})
```

### Class

```ts
// requires the contextMenus API permission

export default class ContextMenu {
  static LIMIT = chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT;
  static menuCount = 0;
  private cb?: (info: chrome.contextMenus.OnClickData) => void;
  constructor(public menuId: string) {}

  create(args: chrome.contextMenus.CreateProperties) {
    if (ContextMenu.menuCount >= ContextMenu.LIMIT) {
      throw new Error(
        `Exceeds the maximum number of top level menu items, which is ${ContextMenu.LIMIT}`
      );
    }
    chrome.contextMenus.create({
      ...args,
      id: this.menuId,
    });
    ContextMenu.menuCount++;
  }

  onClicked(callback: (info: chrome.contextMenus.OnClickData) => void) {
    const cb = (info: chrome.contextMenus.OnClickData) => {
      if (info.menuItemId === this.menuId) {
        callback(info);
      }
    };
    this.cb = cb;
    chrome.contextMenus.onClicked.addListener(this.cb);
  }

  update(args: chrome.contextMenus.UpdateProperties) {
    chrome.contextMenus.update(this.menuId, args);
  }

  remove() {
    chrome.contextMenus.remove(this.menuId);
    if (this.cb) {
      chrome.contextMenus.onClicked.removeListener(this.cb);
    }
    ContextMenu.menuCount--;
  }

  static removeAll() {
    chrome.contextMenus.removeAll();
    ContextMenu.menuCount = 0;
  }
}

```

### Example

```ts
import ContextMenu from "../utils/api/contextMenu";
import NotificationModel from "../utils/api/notifications";
import { Runtime } from "../utils/api/runtime";

const menu = new ContextMenu("test");
const menu2 = new ContextMenu("test2");

Runtime.onInstall({
  // runs first time you download the extension
  installCb: async () => {
    console.log("Extension installed");
  },
  // runs every time you update the extension or refresh it
  updateCb: async () => {
    console.log("Extension updated");
    menu.create({
      title: "Test",
      contexts: ["all"],
    });
    menu2.create({
      title: "Test 2",
      contexts: ["all"],
    });
  },
});

chrome.runtime.onSuspend.addListener(() => {
  menu.remove();
});

menu.onClicked((info) => {
  NotificationModel.showBasicNotification({
    title: "Test",
    message: `on ${info.pageUrl}`,
    iconPath: "public/icon.png",
  });
});

menu2.onClicked((info) => {
  NotificationModel.showBasicNotification({
    title: "Test 2",
    message: `on ${info.pageUrl}`,
    iconPath: "public/icon.png",
  });
});
```

## declarativeContent

The `declarativeContent` api, enabled with the `declarativeContent` manifest permission allows you to automatically enable/disable the extension action.

This is the basic use: 

```ts
// 1. create a rule
let rule2 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostSuffix: '.google.com', schemes: ['https'] },
      css: ["input[type='password']"]
    }),
    new chrome.declarativeContent.PageStateMatcher({
      css: ["video"]
    })
  ],
  actions: [ new chrome.declarativeContent.ShowAction() ]
};

// 2. register the rules
chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  chrome.declarativeContent.onPageChanged.addRules([rule2]);
});
```

Here is the class: 

```ts
export class DeclarativeContent {
  public readonly rules: chrome.events.Rule[] = [];

  addRule(
    pageMatchers: chrome.declarativeContent.PageStateMatcher[],
    options: {
      showAction?: boolean;
    } = {}
  ) {
    const rule: chrome.events.Rule = {
      conditions: pageMatchers,
      actions: [
        options.showAction && new chrome.declarativeContent.ShowAction(),
      ].filter((thing) => Boolean(thing)),
    };
    this.rules.push(rule);
  }

  registerRules() {
    const rules = this.rules;
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
      chrome.declarativeContent.onPageChanged.addRules(rules);
    });
  }
}
```

## declarativeNetRequest

The `declarativeNetRequest` api requires the `declarativeNetRequest` permission and can automatically block up to 300,000 web addresses based on their URL and the type of resource they are. 

You can block either dynamically or statically.

### Static blocking

1. Add the `"declarativeNetRequest"` permission to the manifest
2. Add the `"declarativeNetRequest"` in the key and point to a JSON ruleset you want to enable
```json
"declarative_net_request": {
"rule_resources": [
  {
	"id": "blocklist",
	"enabled": true,
	"path": "blocklist.json"
  }
]
},
```
3. Write the JSON rules as follows. Each object must have a unique id starting at 1.

```ts
[
  {
    "id": 1,
    "priority": 1,
    "action": { "type": "block" },
    "condition": { "urlFilter": "*://*doubleclick.net/*" }
  },
  {
    "id": 2,
    "priority": 1,
    "action": { "type": "block" },
    "condition": { "urlFilter": "*://googleadservices.com/*" }
  },
  {
    "id": 3,
    "priority": 1,
    "action": { "type": "block" },
    "condition": { "urlFilter": "*://googlesyndication.com/*" }
  }
]
```
### Static blocking

### Dynamic blocking

## Extension

The `"extension"` permission and `extension` API provides info about the extension itself. Here are some async methods to use: 

- `chrome.extension.isAllowedIncognitoAccess()` : returns whether or not the extension can run in incognito mode. 
- `chrome.extension.isAllowedFileSchemeAccess()` : returns whether or not the extension can access `file` URI protocol files.

## Identity

Here are the async methods on the identity API: 
- `chrome.identity.getProfileUserInfo({});` : returns an object with a `.id` and a `.email` property of the currently logged in google account. Needs the `"identity.email"` permission
- `chrome.identity.getAuthToken(options)` : returns a token object, and takes in some options.
	- `interactive` : whether or not the token acquiring process is done interactively.
	- `scopes` : a string list of OAuth scopes to request.

Here are the classes: 

```ts
/**
 * requires permissions: "identity.email" in manifest.json
 */
export class IdentityEmail {
  static async getProfile() {
    return await chrome.identity.getProfileUserInfo({});
  }
}

/**
 * requires permissions: "identity" in manifest.json
 */
export class Identity {
  static async getBasicAuthToken() {
    return await chrome.identity.getAuthToken({ interactive: true });
  }
}
```

## Idle

The `idle` API requires the `"idle"` permission and is used like so: 

```ts
type IdleStateCallback = (newState: "active" | "idle" | "locked") => void;

export default class Idle {
  /**
   * triggered when the system changes idle state
   */
  static onStateChanged(cb: IdleStateCallback) {
    chrome.idle.onStateChanged.addListener(cb);
  }

  /**
   * Returns the idle state of the system.
   * @param intervalSeconds must be greater than 15
   * @param cb
   */
  static async queryState(intervalSeconds: number) {
    await chrome.idle.queryState(Math.max(intervalSeconds, 15));
  }
}
```

- `chrome.idle.onStateChanged.addListener(state => {})` : triggered at least every 60 seconds, and only when idle state changes. The state can be either "active", "idle", or "locked"
- `chrome.idle.queryState(numSeconds)` : returns the current state of the system. It's asynchronous.

## Management

The `chrome.management` API requires the `"management"` permission and is used to manage extensions, including other extensions. A simple use case is listening for when an extension is uninstalled, and then creating a tab to beg the user to reinstall.

```ts
interface ExtensionListeners {
  enabledCb: (info: chrome.management.ExtensionInfo) => void;
  disabledCb: (info: chrome.management.ExtensionInfo) => void;
  installedCb: (info: chrome.management.ExtensionInfo) => void;
  uninstalledCb: (extensionId: string) => void;
}

export default class Management {
  /**
   * Returns information about the extension. Does not need any permissions.
   */
  static async getExtensionInfo() {
    return await chrome.management.getSelf();
  }

  listenForExtensionUpdates(cbs: Partial<ExtensionListeners>) {
    cbs.enabledCb && chrome.management.onEnabled.addListener(cbs.enabledCb);
    cbs.disabledCb && chrome.management.onDisabled.addListener(cbs.disabledCb);
    cbs.installedCb &&
      chrome.management.onInstalled.addListener(cbs.installedCb);
    cbs.uninstalledCb &&
      chrome.management.onUninstalled.addListener(cbs.uninstalledCb);
  }
}
```

Here are some basic methods: 

- `chrome.management.getSelf()`: returns an `ExtensionInfo` object with information about the extension, with properties like these: 
	- `extension.name` : the name of the extension
	- `extension.id` : the extension id
	- `extension.permissions` : the array of extension permissions. 

## Notifications

### Showing a basic notification

### Events

- `chrome.notifications.onClicked` : when some notification is clicked. Retrieves that notification in a callback.
- `chrome.notifications.onClosed` : when some notification is closed. Retrieves that notification in a callback.

### Class

```ts
export default class NotificationModel {
  static showBasicNotification({
    title,
    message,
    iconPath,
  }: {
    title: string;
    message: string;
    iconPath: string;
  }) {
    chrome.notifications.create({
      message,
      title: title,
      type: "basic",
      iconUrl: iconPath,
    });
  }

  constructor(private notificationId: string) {}

  showNotification(
    options: chrome.notifications.NotificationOptions<true>,
    cb?: (notificationId: string) => void
  ) {
    chrome.notifications.create(this.notificationId, options, cb);
  }

  clearNotification() {
    chrome.notifications.clear(this.notificationId);
  }
}

export class NotificationAPI {
  static show = chrome.notifications.create.bind(chrome.notifications);

  static onClick = chrome.notifications.onClicked.addListener.bind(
    chrome.notifications.onClicked
  );

  static onClose = chrome.notifications.onClosed.addListener.bind(
    chrome.notifications.onClosed
  );

  static onShowSettings = chrome.notifications.onShowSettings.addListener.bind(
    chrome.notifications.onShowSettings
  );
}
```

## Permissions

The `permissions` API does not need any manifest permissions. It allows you to programmatically define and request optional API permissions and host permissions.

You can declare optional permissions in the manifest like so: 

```ts
{
  "name": "My extension",
  ...
  "optional_permissions": ["tabs"],
  "optional_host_permissions": ["https://www.google.com/"],
  ...
}
```


:::tip
If you want to request hosts that you only discover at runtime, include `https://*/*` in your extension's optional_host_permissions field. This lets you specify any origin in "Permissions.origins" as long as it has a matching scheme.
:::


### Docs

Here is the basic use case: 

```ts
async function requestPermission() {
	const isGranted = await chrome.permissions.request({
	    permissions: ['tabs'],
	    origins: ['https://www.google.com/']
	})
	return isGranted;
}
```

The `permissions` object that you pass into these methods looks like this: 

```ts
interface Permissions {
	permissions: string[]
	origins: string[]
}
```

- `chrome.permissions.request(permissions)` : requests the specified chrome API permissions and host permissions. You can only use this from a UI gesture like clicking a button. Returns a **boolean**.
- `chrome.permissions.contains(permissions)` : returns true if the specified permissions are already granted.
- `chrome.permissions.remove(permissions)` : removes the specified permissions. You should always remove permissions once you are done using them. They will be automatically granted next time.

### Class

Here is a class I made: 

```ts
export default class PermissionsModel {
  constructor(public permissions: chrome.permissions.Permissions) {}

  async request() {
    return await chrome.permissions.request(this.permissions);
  }

  async permissionIsGranted() {
    return await chrome.permissions.contains(this.permissions);
  }

  async remove() {
    return await chrome.permissions.remove(this.permissions);
  }

  static async getAllOptionalPermissions() {
    const permissions = await chrome.permissions.getAll();
    return permissions.permissions;
  }

  static async getAllOptionalHostPermissions() {
    const permissions = await chrome.permissions.getAll();
    return permissions.origins;
  }

  static onPermissionsAdded = chrome.permissions.onAdded.addListener.bind(
    chrome.permissions.onAdded
  );
  static onPermissionsRemoved = chrome.permissions.onRemoved.addListener.bind(
    chrome.permissions.onRemoved
  );
}
```

## ReadingList

### Types

```ts
declare namespace chrome.readingList {
  export function query(
    options: Partial<chrome.readingList.EntryOptions>
  ): Promise<chrome.readingList.ReadingListEntry[]>;

  export function addEntry(
    options: chrome.readingList.EntryOptions
  ): Promise<void>;

  export function removeEntry(options: { url: string }): Promise<void>;

  export function updateEntry(
    options: Partial<chrome.readingList.EntryOptions>
  ): Promise<void>;

  // how you add, search, and update bookmarks
  export interface EntryOptions {
    hasBeenRead: boolean;
    title: string;
    url: string;
  }

  // what an article from the reading list looks like
  export interface ReadingListEntry {
    title: string;
    url: string;
    hasBeenRead: boolean;
    creationTime: number;
    lastUpdateTime: number;
  }
}
```

### API

All methods are async. 

- `chrome.readingList.query(entryOptions)` : gets back all matching articles
- `chrome.readingList.addEntry(entryOptions)` : adds an article to the reading list
- `chrome.readingList.removeEntry({url: string})` : removes an article from the reading list based on its URL
- `chrome.readingList.updateEntry(entryOptions)` : updates an article from the reading list

```ts
export default class ReadingList {
  static async getAll() {
    return await chrome.readingList.query({});
  }

  static async getEntry(options: Partial<chrome.readingList.EntryOptions>) {
    return await chrome.readingList.query(options);
  }

  static async addEntry(entry: chrome.readingList.EntryOptions) {
    await chrome.readingList.addEntry(entry);
  }

  static async removeEntry(url: string) {
    await chrome.readingList.removeEntry({ url });
  }

  static async updateEntry(
    entry: Partial<chrome.readingList.EntryOptions> & { url: string }
  ) {
    await chrome.readingList.updateEntry(entry);
  }
}
```

## Runtime

### Opening a uninstall page

When the user uninstalls the extension, you can use this code to automatically open a new tab begging them to not uninstall your extension. 

You do it with the `chrome.runtime.setUninstallURL(url)` method, which will open the specified URL you pass in once the user deletes your extension.

```ts
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.setUninstallURL('https://example.com/extension-survey');
  }
});
```

### API

Here are the properties: 
- `chrome.runtime.id` : the id of the extension

Here are the methods: 
- `chrome.runtime.getManifest()` : non-async. Returns the manifest as an object

Here are the events: 
- `chrome.runtime.onInstalled` : runs when the extension is first installed, refreshed, or chrome updates.

## scripting

The `scripting` API allows you to dynamically inject scripts and CSS into a web page. Scripting requires both the `scripting` permission, and some other permission that lets you gain sensitive access to a website, like `tabs`, `host_permissions`, or `activeTab`.

When injecting javascript, you can do two thing: 
1. Inject a JS file to run in context of webpage
2. Inject a JS function to run in context of webpage.

```javascript
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content-script.js']
  });
```

Here is a list of the options you pass in:

- `target` : required. AN obejct where we specify the id of the tab to inject the content script into.
- `files` : a list of content script files to inject into the target. Note that we shoudl refer to our compiled javascript here, not typescript if we're using it.
- `func` : a function to inject into the target. In this function, we can use DOM code and anything the content script can access.
- `args` : if injecting content scripts via the function route, this is a list of arguments to pass in to that function.

### Injecting function example

You can inject functions by specifying the `func` and `args` keys in the `chrome.scripting.executeScript()` method options.

```js
// needs one argument
function injectedFunction(color) {
  document.body.style.backgroundColor = color;
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target : {tabId : tab.id},
    func : injectedFunction,
    // specify the arguments with the args array
    args : [ "orange" ],
  });
});
```

You can also handle a result by returning something from the injected function. 

```ts
function getTabId() { ... }
function getTitle() { return document.title; }

chrome.scripting
    .executeScript({
      target : {tabId : getTabId(), allFrames : true},
      func : getTitle,
    })
    .then(injectionResults => {
      for (const {frameId, result} of injectionResults) {
        console.log(`Frame ${frameId} result:`, result);
      }
    });
```

### Full API

```ts
chrome.scripting
  .registerContentScripts([{
    id: "session-script",
    js: ["content.js"],
    persistAcrossSessions: false,
    matches: ["*://example.com/*"],
    runAt: "document_start",
  }])
  .then(() => console.log("registration complete"))
  .catch((err) => console.warn("unexpected error", err))

// update the list of registered content scripts
chrome.scripting
  .updateContentScripts([{
    id: "session-script",
    excludeMatches: ["*://admin.example.com/*"],
  }])
  .then(() => console.log("registration updated"));

// get back the list of registered content scripts
chrome.scripting
  .getRegisteredContentScripts()
  .then(scripts => console.log("registered content scripts", scripts));

// unregister the content scripts
chrome.scripting
  .unregisterContentScripts({ ids: ["session-script"] })
  .then(() => console.log("un-registration complete"));
```


### Class

## Tabs

### Permissions

The `"tabs"` permission in the manifest allows devlopers to access these 4 sensitive properties of any tab: `url`, `pendingUrl`, `title`, and `favIconUrl`. Only use the `tabs` permission if you need these properties. Otherwise, you have full access to the API. 

Host permissions go a bit further, allowing access to sensitive methods like [`tabs.captureVisibleTab()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-captureVisibleTab), [`tabs.executeScript()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-executeScript), [`tabs.insertCSS()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-insertCSS), and [`tabs.removeCSS()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-removeCSS) as well as the 4 sensitive tab properties.

The `activeTab` permission provides temporary host permissions access but without any permission warnings.

All in all, here are the pros and cons of each permission:

| `tabs`                                                                | `hostPermissions`                                                                | `activeTab`                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Provides access to sensitive tab properties. Has permission warnings. | Provides access to sensitive tab properties and methods. Has permission warnings | Acts as having temporary host permissions. Has permission warnings. |
### API

- `chrome.tabs.create(options)` : creates a tab. You can specify the tab position, whether it's pinned, the URL, etc.
- `chrome.tabs.query(options)` : gets back all matching tabs based on the criteria you specify
- `chrome.tabs.getCurrent()` : returns the tab that the script is running from. Only works for things that use or have UI, like popups or content scripts - not service workers.
- `chrome.tabs.get(tabId)` : gets back the tab with the matching tab id
- `chrome.tabs.move(tabId, options)` : moves the tab to specified tab position and optionally window.
- `chrome.tabs.update(tabId, options)` : updates the specified tab, doing stuff like pinning, moving, and muting.
- `chrome.tabs.reload(tabId, options)` : refreshes the tab. You can also specify options to bypass the cache

And here are the event listeners:
- `chrome.tabs.onUpdated`: When the state of some tab is changed/updated. This runs after `onActivated`, when the URL is available
- `chrome.tabs.onCreated`: When a new tab is created.
- `chrome.tabs.onActivated`: When the active tab in a window changes. The `url` property might not be available yet
- `chrome.tabs.onHighlighted`: When the user selects a different tab.
- `chrome.tabs.onMoved` : When a tab is moved to a different permission.
- `chrome.tabs.onAttached` : When a tab is moved to a different window.
- `chrome.tabs.onDetached` : When a tab is moved out of a window.
- `chrome.tabs.onRemoved` : When a tab is closed.
- `chrome.tabs.onReplaced` : When a tab is closed.

This is what a `chrome.tabs.Tab` instance looks like: 

```ts
interface Tab {
	id? : number; 
	
	active: boolean 
	audible: boolean 
	discarded: boolean
	incognito: boolean
	pinned: boolean
	highlighted: boolean
	
	index: number
	windowId: number
	
	faviconUrl: string
	title: string
	url: string
	
}
```

| Properties        | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `tab.id`          | the tab's id                                               |
| `tab.active`      | Whether or not the tab is active                           |
| `tab.audible`     | Whether or not the tab has recently played audio           |
| `tab.discarded`   | Whether or not the tab has been discarded from memory      |
| `tab.faviconUrl`  | The favicon URL of the tab. Requires elevated permissions. |
| `tab.incognito`   | Whether or not the tab is in an incognito window           |
| `tab.index`       | the position of the tab                                    |
| `tab.pinned`      | Whether or not the tab is pinned                           |
| `tab.title`       | The tab's title. Requires elevated permissions.            |
| `tab.url`         | The tab's URL. Requires elevated permissions.              |
| `tab.windowId`    | The id of the tab's containing window                      |
| `tab.highlighted` | Whether or not the tab is currently selected.              |
### Use cases

#### Creating a tab

#### Querying tabs

#### Screenshots

#### Dealing with page zoom

#### Grouping tabs

#### Listening for tab changes

```ts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // tab navigation/reload is complete. do something
  }
});
```

## TabGroups

## userScripts

user scripts are a way to automatically run javascript code on a webpage whenever the user navigates to it. Users can define their own javascript code they want to run that will get around the content security policy.

Each user script has three parts to it: 

- **id**: the unique identifier for the script
- **url matches**: the url blob patterns to match, meaning the script will run on any urls that match one from the list of patterns
- **code**: the script code. This can be a string or a reference to a file.

### Setup

For user scripts to work, host permissions for select match patterns have to be enabled and the user must have their chrome extensions page in developer mode. 

1. Add the `"userScripts"` permission to the manifest
2. Add host permissions for whichever match patterns you are going to have user scripts running on. This can also be optional host permissions you can request at runtime.
3. Check if user scripts exist
```ts
function isUserScriptsAvailable() {
    try {
      // Property access which throws if developer mode is not enabled.
      const thing = chrome.userScripts === undefined;
      if (thing) {
        return false;
      }
      return true;
    } catch {
      // Not available.
      return false;
    }
  }
```
4. Configure user script CSP
```ts
function setWorld() {
    chrome.userScripts.configureWorld({
      csp: "script-src 'self'",
    });
  }
```

For the optional host permissions, any url match you request for the user script must be a subset of the match patterns from the optional host permissions, so it's better to just go as broad as possible: 

```json
{
  "permissions": ["storage", "userScripts", "unlimitedStorage"],
  "optional_host_permissions": ["<all_urls>"],
}
```

You can then ask for permission and then register like so: 

```typescript
    async function registerScript (url: string, code: string) => {
	    // create new script representation
      const currentScript = new UserScripts(crypto.randomUUID());
      const domainUrl = new URL(url).origin;
      // create glob match pattern
      const urlMatch = `${domainUrl}/*`;

		// request glob pattern as optional host permission
      const permissions = new PermissionsModel({
        origins: [urlMatch],
      });
	    // request permission
      const isGranted = await permissions.request();
      if (!isGranted) {
        return;
      }

      await currentScript.registerScript([urlMatch], code);
    }
```
### API

All of these methods are asynchronous. 

- `chrome.userScripts.register(options)`: registers a user script. Throws an error if you try to register an existing script with the same id. Here are the keys of options object:
	- `id`: the script id
	- `matches`: a string array of glob patterns that the script will run on if the current tab url matches one of those patterns
	- `js`: the pieces of code to run. This can be strings or files. 
- `chrome.userScripts.unregister(options)`: unregisters the specified user scripts based on their ids.
- `chrome.userScripts.update(scripts)`: updates the specified user scripts. `scripts` is an array of objects, which each have these keys:
	- `id`: the script id
	- `matches`: a string array of glob patterns that the script will run on if the current tab url matches one of those patterns
	- `js`: the pieces of code to run. This can be strings or files. 

To get a script, use `chrome.userScripts.getScript()` method, which if you pass in nothing, it returns all user scripts, but you can also pass in a filter to filter off all ids. 

```ts
export class UserScripts {
  static isUserScriptsAvailable() {
    try {
      // Property access which throws if developer mode is not enabled.
      const thing = chrome.userScripts === undefined;
      if (thing) {
        return false;
      }
      return true;
    } catch {
      // Not available.
      return false;
    }
  }

  static async getAllScripts() {
    const scripts = await chrome.userScripts.getScripts();
    return scripts;
  }

  static setWorld() {
    chrome.userScripts.configureWorld({
      csp: "script-src 'self'",
    });
  }

  constructor(public readonly id: string) {}

  async registerScript(matchPatterns: string[], js: string) {
    if (await this.getScript()) {
      return;
    }
    console.log("registering script...");
    await chrome.userScripts.register([
      {
        id: this.id,
        matches: matchPatterns,
        js: [{ code: js }],
        world: "USER_SCRIPT",
      },
    ]);
  }

  async getScript() {
    const [script] = await chrome.userScripts.getScripts({
      ids: [this.id],
    });
    if (!script) {
      return null;
    }
    return script;
  }

  async unregisterScript() {
    const script = await this.getScript();
    if (!script) {
      return;
    }
    await chrome.userScripts.unregister({
      ids: [this.id],
    });
  }

  async updateScript(js: string) {
    await chrome.userScripts.update([
      {
        id: this.id,
        js: [{ code: js }],
      },
    ]);
  }
}
```

### The major caveat

User Scripts are all automatically deregistered whenever the extension updates, so it's best to store representations of your user scripts somehow in storage and then re-register them all when the extension updates. 


## webNavigation

Here are the events you can listen to in the `webNavigation` API. 

- `chrome.webNavigation.onCompleted` : when the user finishes navigating to a new tab and the DOM is fully loaded.
- `chrome.webNavigation.onBeforeNavigate` : when the user beings navigating to a new tab

```ts
chrome.webNavigation.onCompleted.addListener(({ url, tabId }) => {
  console.log(`Tab ${tabId} has finished loading ${url}`);
});

chrome.webNavigation.onBeforeNavigate.addListener(({ url, tabId }) => {
  console.log(`Before navigating to ${url} in tab ${tabId}`);
});
```

## Windows

- `chrome.windows.create(options)` : an async function that creates a window given some options, which have the following keys: 
	- `url?` : the array of urls to open as tabs in the new window

```ts
export default class Windows {
  static async createBasicWindow(urls?: string[]) {
    return await chrome.windows.create({
      url: urls,
      focused: true,
      state: "fullscreen",
    });
  }
}
```