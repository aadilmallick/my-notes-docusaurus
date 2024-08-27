
## Performant DOM

### DOM querying

Here are several tips for making DOM querying more efficient:

1. Attach IDs to elements and query by ID
2. Query from a near parent, not from the document.
3. Simplify your selectors as much as possible, like using classes instead of inheritance and nesting

### DOM manipulation

But besides that, you have to understand the performance difference between different DOM insertion methods: 

- `element.innerHTML` : bad performance
- `element.insertAdjacentHTML()` : bad performance
- `element.insertAdjacentHTML()` : good performance
- `element.appendChild()` : good performance

When inserting multiple elements at once like a list of elements, create a wrapper Document Fragment and then insert them. 

```ts
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.getElementById('myList').appendChild(fragment);
```
### Other Performance Tips

- Use `element.textContent` over `element.innerText`
## Events

### Event Basics

We want to use `addEventListener()` for adding events because it allows multiple handlers to be attached to the same element listening for the same event.

As a third argument, you can specify options to configure the event listener.

```jsx
element.addEventListener("click", (e) => {}, {
	once: true, 
	passive: true
})
```
- `once` : if true, the event will only execute once and then unbind itself. The event handler will be removed automatically after executing once.
- `passive` : if true, executes event listener passively, like async and not blocking the thread

Here are the important properties on the event object. 

- `e.target`: the element the event happened to, like clicking on a button
- `e.currentTarget` : the element the event handler is attached to, like a form with an onSubmit handler.

#### Removing events

You can also use an abort controller to remove events. 

```ts
let controller = new AbortController();
const { signal } = controller;

button.addEventListener('click', () => console.log('clicked!'), { signal });
window.addEventListener('resize', () => console.log('resized!'), { signal });
document.addEventListener('keyup', () => console.log('pressed!'), { signal });

// Remove all listeners at once:
controller.abort();
```

### Custom Events

You can even listen for custom events on any element and pass data when dispatching events. The basic flow is as follows: 

1. Create a `CustomEvent` instance
2. Use an element to dispatch the custom event
3. With the same element, listen for the custom event using `addEventListener()`.

```ts
const myEvent = new CustomEvent('myevent', {
  bubbles: true,
  cancelable: true,
  composed: false,
  detail : {
	  order: "pizza"
  }
})

window.dispatch(myEvent) // dispatch event

window.addEventListener("myevent", (e) => {
	console.log(e.detail.order) // "pizza"
})
```

The first argument to the constructor is the event name, and the second is a list of options with the following properties: 
- `bubbles`: whether or not the event should propagate to the parent element, meaning they can also listen for the same event. `false` by default. 
- `cancelable` : whether or not you can call `e.preventDefault()` on it
- `composed`: Some shadow DOM shit. doesn't matter.
- `detail` : an object of data you want to pass through the event

Here is a class I made that provides such type support: 

```ts
export class CustomEventElementClass<T> {
  private listener?: EventListener;
  constructor(
    private event: CustomEvent<T>,
    private element: HTMLElement | Window = window
  ) {}

  listen(cb: (e: CustomEvent<T>) => void) {
    this.listener = cb as EventListener;
    this.element.addEventListener(this.event.type, cb as EventListener);
  }

  dispatch() {
    this.element.dispatchEvent(this.event);
  }

  removeListener() {
    if (this.listener) {
      this.element.removeEventListener(this.event.type, this.listener);
    }
  }
}
```

#### Scoped to classes

You can scope custom events to classes by just creating a class that extends from `EventTarget`. Useful if you don't want to deal with elements, but instead just the logic. 

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
```


## DOM APIs

### Fullscreen

An element can become fullscreen by doing the `element.requestFullscreen()` method every DOM element has

You can get the current element in fullscreen with `document.fullscreenElement` , which returns that element

You can exit fullscreen with `document.exitFullscreen()` method

You can listen for changes by listening to the `"fullscreenchange"` event on the document, like so: 

```jsx
document.addEventListener("fullscreenchange", (e) => {

})
```

### Picture in Picture

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

- `enterpictureinpicture` : video enters pip mode
- `leavepictureinpicture` : video exits pip mode

### ResizeObserver

The window resize event is slow and costly, while the `ResizeObserver` class lets you observe resizing on any element and is more performant. 

Here is how to do it: 

```jsx
// 1. create an observer
const observer = new ResizeObserver((entries) => {
	entries.forEach(entry => {
		const target = entry.target
		const [box] = entry.borderBoxSize
		if (box.blockSize < 150 && box.inlineSize < 150) {
			// do something
		}
	})
})

// 2. observe elements
observer.observe(document.querySelector(".rect"))
```

- `entries` : an array of entries
- `entry.target` : the element being resized
- `entry.borderBoxSize` : a one-element array that represents the element’s new dimensions. A single object from this array has these properties:
    - `box.blockSize` : the vertical size in pixels of the element
    - `box.inlineSize` : the horizontal size in pixels of the element

### MutationObserver
## DOM Tips

### Waiting for page to load

To prevent a flash of unstyled content, we can use the code below. Just follow these steps: 

1. Set inline style of `visiblity: hidden` on the `body` tag.
2. Use the code below to set up a dom loaded event listener and change the visiblity back to visible once ready.

```ts
let domReady = (cb: () => void) => {
  document.readyState === "interactive" || document.readyState === "complete"
    ? cb()
    : document.addEventListener("DOMContentLoaded", cb);
};

domReady(() => {
  // Display body when DOM is loaded
  document.body.style.visibility = "visible";
});
```