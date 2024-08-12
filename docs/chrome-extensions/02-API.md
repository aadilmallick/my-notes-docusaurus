## Action

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

##