# Advanced JS: APIs

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

## Other APIs

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
