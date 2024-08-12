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

Here are the keys you can pass for a content script config:
- `"all_frames"` : a boolean value, where if `true`, the content script will run on all frames of the page, like `<iframes>` or blobs.

### Accessing images

Content scripts run in an isolated world, so to access static resources in your extension project from your content script, you have to follow these steps: 

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

## Core API

### Content Filtering with declarativeNetRequest

### Messaging

### Runtime Lifecycle

- `chrome.runtime.onInstalled` : runs when the user installs the extension for the first time, the extension updates, or chrome updates. 

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

### Permissions
