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