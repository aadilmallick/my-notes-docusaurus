## Performant DOM

### Efficient DOM querying

Here are several tips for making DOM querying more efficient:

1. Attach IDs to elements and query by ID
2. Query from a near parent, not from the document.
3. Simplify your selectors as much as possible, like using classes instead of inheritance and nesting

### Efficient DOM manipulation

But besides that, you have to understand the performance difference between different DOM insertion methods:

- `element.innerHTML` : bad performance
- `element.insertAdjacentHTML()` : bad performance
- `element.insertAdjacentHTML()` : good performance
- `element.appendChild()` : good performance

When inserting multiple elements at once like a list of elements, create a wrapper Document Fragment and then insert them.

```ts
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
document.getElementById("myList").appendChild(fragment);
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
  passive: true,
});
```

- `once` : if true, the event will only execute once and then unbind itself. The event handler will be removed automatically after executing once.
- `passive` : if true, executes event listener passively, like async and not blocking the thread

Here are the important properties on the event object.

- `e.target`: the element the event happened to, like clicking on a button
- `e.currentTarget` : the element the event handler is attached to, like a form with an onSubmit handler.

#### Event Capturing, Bubbling, and Progagation

First, an event is generated at the root element, the `document`. Then it travels down to the target element, which is called **event capturing**.

After activating on the target element, it bubbles up through all the parent elements, and activates the event handler on each of those ones, called **event bubbling**.

#### Event Delegation

Event delegation is an optimization that is about attaching an event handler to the parent and handling specific children clicks with `e.target` instead of attaching event handlers to each children.

> [!NOTE] A sidenote on efficiency
> Imagine if each list item in a list thousands of items long had its own event listener. That would take up a lot of memory and resources, so event delegation _delegates_ the event to list, and then inside the event listener, the you can find out which list item was clicked on by using `e.target`.

The advantage of event delegation is that we can attach a single event listener to a parent instead of an event listener on every child.

```ts
document.querySelector("ul").addEventListener("click", (e) => {
  const target = e.target;
  // see if e.target is a <li> element
  if (target.matches("li")) {
    alert("you clicked the list item");
  }
});
```

#### Removing events

You can also use an abort controller to remove events.

```ts
let controller = new AbortController();
const { signal } = controller;

button.addEventListener("click", () => console.log("clicked!"), { signal });
window.addEventListener("resize", () => console.log("resized!"), { signal });
document.addEventListener("keyup", () => console.log("pressed!"), { signal });

// Remove all listeners at once:
controller.abort();
```

### Custom Events

You can even listen for custom events on any element and pass data when dispatching events. The basic flow is as follows:

1. Create a `CustomEvent` instance
2. Use an element to dispatch the custom event
3. With the same element, listen for the custom event using `addEventListener()`.

```ts
const myEvent = new CustomEvent("myevent", {
  bubbles: true,
  cancelable: true,
  composed: false,
  detail: {
    order: "pizza",
  },
});

window.dispatch(myEvent); // dispatch event

window.addEventListener("myevent", (e) => {
  console.log(e.detail.order); // "pizza"
});
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

### Type of events

#### window

The window object has these event listeners on it:

- `"load"`: fired when the entire page has been loaded, which includes all javascript files, images, and CSS.
- `"scroll"`: fired when user scrolls the page
- `"unload"`: when the user closes the page. The main use case for this is to send beacons with `navigator.sendBeacon()`.
- `"onbeforeunload"`: just when before the user tries to exit the page. The main use case for this is to intervene and prevent the user from leaving. 

This is how you can prevent a user from leaving with the `"onbeforeunload"` event:

```ts
window.onbeforeunload = function() {
  // prompts the user with this message with popup alert confirmation
  event.returnValue = "There are unsaved changes. Leave now?";
};
```

#### Focus

These are the events related to focusing on elements:

- `"focus"`: fired when the element receives focus
- `"blur"`: fired when the element loses focus

#### Mouse events

For all mouse events, the `e.clientX` and `e.clientY` give the coordinates of the current location of the mouse cursor.

## Elements

### Basic dom manipulation

#### DOM Traversal

Here are all the DOM traversal properties an element has:

- `element.nextSibling`: returns the adjacent next sibling of the element
- `element.previousSibling`: returns the adjacent previous sibling of the element
- `element.parentNode`: returns the direct parent of the element
- `element.children`: returns all the children of the element
- `element.firstElementChild` : gets first child of the element
- `element.lastElementChild` : gets last child of the element
- `element.previousElementSibling` : gets the immediate previous sibling of the element.
- `element.nextElementSibling` : gets the immediate next sibling of the element.

Here are all the methods that an element has on it:

- `parentElement.contains(childElement)`: returns true if the parent element contains the child element as a descendant.

```ts
const isDescendant = parent.contains(child);
```

#### DOM Manipulation methods

Basic methods:

- `element.prepend(element)` : the element that calls this method will prepend the passed-in element as its first child.
- `element.append(element)` : the element that calls this method will appendthe passed-in element as its last child.
- `element.before(element)` : the element that calls this method will insert the passed-in element before it as its new preceding sibling.
- `element.after(element)` : the element that calls this method will insert the passed-in element after it as its new succeeding sibling.

##### Replacing children elements with `element.replaceChild()`

`element.replaceChild(newEle, oldEle)`: for the child of an element, replaces the old child with the specified new child

##### Adding elements with `element.insertAdjacentHTML()`

```ts
element.insertAdjacentHTML(position, text);
```

- **`position`**: A string representing where to insert the HTML. It can be one of the following values:
  - `"beforebegin"`: Before the element itself (adds new content as a sibling).
  - `"afterbegin"`: Just inside the element, before its first child (adds new content as a first child).
  - `"beforeend"`: Just inside the element, after its last child (appends new content as the last child).
  - `"afterend"`: After the element itself (adds new content as a sibling).
- **`text`**: The HTML string you want to insert.

```ts
const myDiv = document.getElementById("myDiv");

// Insert HTML before the opening tag of #myDiv
myDiv.insertAdjacentHTML("beforebegin", "<p>Before the div</p>");

// Insert HTML at the start of #myDiv (before "Hello, ")
myDiv.insertAdjacentHTML("afterbegin", "<span>World! </span>");

// Insert HTML at the end of #myDiv (after "Hello, ")
myDiv.insertAdjacentHTML("beforeend", "<span>Goodbye! </span>");

// Insert HTML after the closing tag of #myDiv
myDiv.insertAdjacentHTML("afterend", "<p>After the div</p>");
```

##### Adding elements with `element.insertBefore()`

The `insertBefore` method allows you to insert a new node before a reference node as a child of a specified parent node. This method is used when you have a reference to both the parent and the reference node.

```ts
parentNode.insertBefore(newNode, referenceNode);
```

- **`parentNode`**: The node that will contain the new node.
- **`newNode`**: The node to be inserted.
- **`referenceNode`**: The child node of `parentNode` before which `newNode` is inserted. If `referenceNode` is `null`, `newNode` is inserted at the end of `parentNode`.

##### Removing children with `element.removeChild()`

The `parentNode.removeChild(childNode)` method removes the specified child element from the parent element.

When removing children of some sort of container element, it's not advisable to use the classic `element.innerHTML = ""` because that also removes all the event listeners of the children, which will cause memory leaks.

Instead, opt for a more manual yet safe approach:

```ts
while (node.firstChild) {
  node.removeChild(node.firstChild);
  // remove any event listeners here
}
```

##### Cloning nodes with `element.cloneNode()`

The `element.cloneNode(copyAll: boolean)` method returns a copy of the element that calls the method. The method takes in one boolean parameter:

- `true`: if the value is true, the entire subtree is cloned meaning the element is copied along with all of its children.
- `false`: if the value is false, only the element is cloned, and it's children don't come along for the ride.

```ts
const original = document.getElementById("original");

// Clone the node without children
const shallowClone = original.cloneNode(false);

// Clone the node with all its children
const deepClone = original.cloneNode(true);
```

#### Setting attributes

- `element.getAttribute(name)`: returns the value of the specified attribute on the element
- `element.setAttribute(name, value)`: sets the value of the specified attribute on the element
- `element.removeAttribute(name)`: removes the specified attribute on the element

```ts
// Get the `title` attribute of a link element
const title = link.getAttribute("title");

// Set the width and height of an image
image.setAttribute("width", "100px");
image.setAttribute("height", "120px");

// Remove the `title` attribute
ele.removeAttribute("title");
```

### Focusing elements

You can make any element focusable by either setting `autofocus="true"` or setting a `tabindex` attribute on it to make it tabbable.

- The `tabindex` attribute specifies which element will be focused next when the user hits tab. It accepts a number value, which is the tab order.
  - `tabindex="0"` : first to get tabbed
  - Any negative tab index will not be tabbable, but it can be focused on.

#### Preventing scrolling to focused element

Go to [Phoc nguyen's HTML focus element article](https://phuoc.ng/collection/html-dom/prevent-the-page-from-scrolling-to-an-element-when-it-is-focused/)

To focus on an element, you can set the `autofocus="true"` attribute on it, or call `element.focus()`. However, this always scrolls the element into view which may not be what you want.

An example where you do not want to scroll an element into view is with an autofocusing element in a modal - focusing on the element will scroll the user all the way back up the page unnecessarily, which we want to avoid.

There are two ways we can go about this:

**Method 1: prevent autoscrolling**

```ts
element.focus({
  preventScroll: true,
});
```

**Method 2: scroll back to previous position**

```ts
function scrollToElement(element: HTMLElement, shouldScroll = false) {
  const x = window.scrollX;
  const y = window.scrollY;
  element.focus();

  // Scroll to the previous location
  shouldScroll && window.scrollTo(x, y);
}
```

#### Getting element with focus

The `document.activeElement` property returns the element that currently has focus.

```ts
const hasFocus = ele === document.activeElement;
```

### Scrolling

#### Basic scrolling

You can use the `window.scrollTo(x, y)` to scroll to a specific coordinate on the page.

- `window.scrollTo(0, 0)`: scrolls to the top of the page
- `window.scrollBy(0, 10)`: scrolls down by 10px relative to current position.

#### Scrolling elements into view

Use the `element.scrollIntoView()` to scroll the element into view. You can also enable smooth scrolling.

```ts
element.scrollIntoView();

element.scrollIntoView({
  behavior: "smooth",
});
```

#### Scroll class

```ts
export class ScrollManager {
  public get totalWindowHeight(): number {
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    return scrollHeight;
  }
  public get totalWindowWidth(): number {
    const scrollWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    );
    return scrollWidth;
  }
  public get windowHeight(): number {
    return document.documentElement.clientHeight;
  }
  public get scrollY(): number {
    return window.scrollY;
  }
  public get scrollX(): number {
    return window.scrollX;
  }
  public scrollToTop() {
    window.scrollTo(0, 0);
  }
  public scrollToBottom() {
    window.scrollTo(0, this.totalWindowHeight);
  }
  public scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: "smooth" });
  }
  public scrollToPosition(position: number) {
    window.scrollTo(0, position);
  }
  public scrollDownBy(position: number) {
    window.scrollBy(0, position);
  }
}
```

### Changing the Style of Elements

You can get the modifiable style object of elements by using the `getComputedStyle(element)` function, and then passing in the element you want to get the style of.

```ts
// getting styles
const div = document.querySelector("div");
const backgroundColor = getComputedStyle(div).backgroundColor;

// setting styles
div.style.backgroundColor = "red";
```

#### ClassList

- `element.classlist` : returns list of classes of elements
- `element.classlist.add("class_name")` : adds a class
- `element.classlist.remove("class_name")` : removes a class
- `element.classlist.toggle("class_name")` : toggles a class. It will remove the class if the element currently has the class, and will add the class if it is not there.
- `element.classlist.contains("class_name")` : returns a boolean value based on whether the specified class is in the element or note.

#### CSS Variables

- `element.style.setProperty(name, value)`: sets the CSS variable with the specified value for the element.
- `element.style.getPropertyValue(name)`: returns the current value of the specified CSS Variable the element has.

You can get and modify any global styles you set on the `:root` selector like so:

```ts
const root = document.documentElement;

const primaryColor = getComputedStyle(root).getPropertyValue("--primary-color");
```

```ts
export class CSSVariablesManager<T = Record<string, string>> {
  constructor(private element: HTMLElement) {}

  private formatName(name: string) {
    if (name.startsWith("--")) {
      return name;
    }
    return `--${name}`;
  }

  set(name: keyof T, value: string) {
    this.element.style.setProperty(this.formatName(name as string), value);
  }

  get(name: keyof T) {
    return this.element.style.getPropertyValue(this.formatName(name as string));
  }
}
```

### Element bounding box

You can get the element of a coordinate with the `getBoundingClientRect()` element method. This method call returns an obejct like this:

```json
{
  "x": 8,
  "y": 21.4375,
  "width": 1520,
  "height": 37.60000228881836,
  "top": 21.4375,
  "right": 1528,
  "bottom": 59.03750228881836,
  "left": 8
}
```

- `x` : this property is the horizontal distance between the element and the left side of the visible screen. Changes as you scroll.
- `y` : this property is the vertical distance between the element and the top side of the visible screen. Changes as you scroll.
- `width` : returns the width of the element.
- `height` : returns the height of the element.
- `top`: the vertical distance between the element and the very top of the screen. Stays the same.
- `left`: the horizontal distance between the element and the very left of the screen. Stays the same.
- `bottom`: the vertical distance between the element and the very bottom of the screen. Stays the same.
- `right`: the horizontal distance between the element and the very right of the screen. Stays the same.

You also have inherent properties on the element that let you get the dimensions of the element.

- `element.clientHeight` : the height of the element including padding, excluding border
- `element.clientWidth` : the width of the element including padding, excluding border
- `element.offsetWidth` : the width of the element including padding and border
- `element.offsetHeight` : the height of the element including padding and border

```ts
// The size include padding
const clientHeight = ele.clientHeight;
const clientWidth = ele.clientWidth;

// The size include padding and border
const offsetHeight = ele.offsetHeight;
const offsetWidth = ele.offsetWidth;
```

### Finding element from a point

If you have a set of `(x, y)` coordinates, you can find the element that has that point within its bounding box using the `document.elementFromPoint(x, y)` method.

```javascript
// finds the element that has the point (120, 16) within its bounding box
const el = document.elementFromPoint(120, 16);
console.log(el);
```

#### Getting mouse position relative to element

```ts
ele.addEventListener("mousedown", function (e) {
  // Get the target
  const target = e.target;

  // Get the bounding rectangle of target
  const rect = target.getBoundingClientRect();

  // Mouse position
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
});
```

#### Seeing whether an element is visible in a scrollable container

We compare the bounds of the scrollable container and its child element to see if the child element is visible in the scrollable container.

```ts
const isVisible = function (ele, container) {
  const eleTop = ele.offsetTop;
  const eleBottom = eleTop + ele.clientHeight;

  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  // The element is fully visible in the container
  return (
    (eleTop >= containerTop && eleBottom <= containerBottom) ||
    // Some part of the element is visible in the container
    (eleTop < containerTop && containerTop < eleBottom) ||
    (eleTop < containerBottom && containerBottom < eleBottom)
  );
};
```

#### Checking whether element is scrollable

```ts
const isScrollable = function (ele) {
  // Compare the height to see if the element has scrollable content
  const hasScrollableContent = ele.scrollHeight > ele.clientHeight;

  // It's not enough because the element's `overflow-y` style can be set as
  // * `hidden`
  // * `hidden !important`
  // In those cases, the scrollbar isn't shown
  const overflowYStyle = window.getComputedStyle(ele).overflowY;
  const isOverflowHidden = overflowYStyle.indexOf("hidden") !== -1;

  return hasScrollableContent && !isOverflowHidden;
};
```

### Images

#### Getting an image's dimensions

We have two different methods of fetching an image's dimensions. We can do one when the image is already loaded, and we have to do the other one if the image is not yet loaded.

**method 1: image already loaded**

```ts
const image = document.querySelector(...);

// Get the original size
const naturalWidth = image.naturalWidth;
const naturalHeight = image.naturalHeight;

// Get the scaled size
const width = image.width;
const height = image.height;
```

**method 2: image not loaded yet**

Here we promisify loading for the image by listening for the `"load"` event.

```ts
const calculateSize = function (url) {
  return new Promise(function (resolve, reject) {
    const image = document.createElement("img");
    image.addEventListener("load", function (e) {
      resolve({
        width: e.target.width,
        height: e.target.height,
      });
    });

    image.addEventListener("error", function () {
      reject();
    });

    image.src = url;
  });
};

calculateSize("/path/to/image.png").then((data) => {
  const width = data.width;
  const height = data.height;
});
```

## DOM APIs

### Cookies

Cookies are origin-specific, just like local storage. 

```ts
class CookieManager {
  private cookies : Record<string, string>
  constructor() {
    this.cookies = this.getCurrentCookies()
  }

  fetchLatestCookies() {
    this.cookies = this.getCurrentCookies()
    return { ...this.cookies }
  }

  private getCurrentCookies() : Record<string, string> {
    if (document.cookie === "") {
      return {}
    }
    const cookiePairs = document.cookie.split('; ')
    return cookiePairs.reduce((accumulator, pair) => {
      const [key, value] = pair.split('=')
      return {
        ...accumulator,
        [key]: value
      }
    }, {})
  }

  private createExpiration(days: number) {
      const d = new Date();
      d.setTime(d.getTime() + (days*24*60*60*1000));
      let expires = "expires="+ d.toUTCString();
  }

  toJSON() {
    return JSON.stringify(this.cookies)
  }

  setCookie(key : string, value: string, exdays : number = 30) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "; " + expires + "; " + "path=/;"
    this.cookies[key] = value
  }

  static getCookie(cname : string) {
    let name = encodeURIComponent(cname) + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  deleteCookie(key : string) {
    let expires = "max-age=0"
    document.cookie = encodeURIComponent(key) + "=" + "; " + expires + "; " + "path=/;"
    if (CookieManager.getCookie(key)) {
      return false
    }
    delete this.cookies[key]
    return true
  }
}

const manager = new CookieManager()
manager.setCookie("dog", "rufus")
const deletedCookie = manager.deleteCookie("dog")
console.log(deletedCookie)
console.log(manager.fetchLatestCookies())
```

The `document.cookie` is a special string that allows you read, update, add, and delete cookies. Here are the rules: 

1. When using `document.cookie` as a getter, it returns all the cookies as a string, where each cookie is a key-value pair in the syntax of `key=value`, and each cookie is separated with a `; `.
2. To add or update a cookie, just use `document.cookie` as a setter and specify the cookie name and value. It won't override the other cookies. 
3. To delete a cookie just use `document.cookie` as a setter and specify the cookie name without the value. Set the expiration date to some date in the past using `max-age=` or `expires=`.

#### Setting cookies

We set cookies by setting the `document.cookie = "key=value"` syntax. Here are the caveats: 

1. We can only set one cookie at a time. 
2. We need to use `encodeURIComponent()` for the cookie name and value if they have spaces in them. 
3. The total number of cookies per domain is limited to 20. 

**Special cookies values**

When setting cookies, we have access to add these special cookie values that define the behavior of the cookie when we set it, but when we try to fetch the cookies, we only get back the key and value. 

- `domain=`: the defines the domain where the cookie is accessible. The default is the same domain from which the cookie was set. 
- `path=`: the absolute path for which cookies are allowed to be accessed by. By default, it's the current route from which the cookie was set, but a better one is to do `path=/` so that all routes on the site can access the cookie. 
- `max-age=`: the semi-equivalent of `expires=`. This value is set in number of seconds, after which the cookie will expire. 
	- `max-age=3600`: cookie will expire in an hour.
	- `max-age=0`: cookie expires now. 
- `expires=`: the `Date` string for which the cookie should expire. 
- `secure`: If set to true, then the cookie is only accessible via HTTPS. By default, if this is not set, then cookies are accessible on both HTTP and HTTPS. 
	- So if a cookie has sensitive content that should never be sent over unencrypted HTTP, the `secure` flag is the right thing.
- `samesite=`: used to prevent XSRF attacks by allowing cookies to be accessible only when actions are initiated from the domain the cookies were created from.
	- `samesite=strict`: this cookie cannot be sent if a request was initiated from a site other than the domain this cookie was created from. 
	- `samesite=lax`: follows the strict behavior but allows cookies to be sent if the url requested is requested with a GET method.

```ts
const expires = "expires=Tue, 19 Jan 2038 03:14:07 GMT"
const path = `path=/`
const domain = "google.com"
```

#### Third party cookies

**third party cookies** are cookies that are placed by a domain other than the page the user is visiting. They are used by ad services to track you. 

> [!NOTE]
> When a remote script sets a cookie on a webpage, the cookie will belong to that site and under that domain. 

The GDPR org requires that companies make sure users verbally agree to allowing them to set third-party cookies that track how users visit different websites, either by accepting a privacy policy or by clicking 'allow all cookies'.
### Window methods

- `window.blur()`: removes focus from the window
- `window.close()`: closes the current window
- `window.open(url)`: opens a new window and creates a tab with the specified URL

### Navigator

- `navigator.platform`: returns the OS the user is running on, which is either `"Win32"` or `"MacIntel"`.

#### Screen Recording

The `navigator.mediaDevices.getDisplayMedia()` method prompts the user to record either tab, window, or desktop. 

```ts
const startRecordingButton = document.getElementById(
  "record-start"
) as HTMLButtonElement;
const stopRecordingButton = document.getElementById(
  "record-stop"
) as HTMLButtonElement;

let stream: MediaStream;
let recorder: MediaRecorder;

async function startRecording() {
  // has audio and video default enabled. 
  stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });
  recorder = new MediaRecorder(stream);

  // Start recording.
  recorder.start();
  recorder.addEventListener("dataavailable", async (event) => {
    let recordedBlob = event.data;
    let url = URL.createObjectURL(recordedBlob);

    let a = document.createElement("a");

    a.style.display = "none";
    a.href = url;
    a.download = "screen-recording.webm";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });
}

async function stopRecording() {
  stream.getTracks().forEach((track) => track.stop());
  recorder.stop();
}

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
```

### Match media

The `window.matchMedia()` function lets us harness the power of CSS media queries in JavaScript and lets us execute code accordingly. The method takes in a string representing the media query to query.

#### Check if user is on phone screen

```ts
const isMobile = function () {
  const match = window.matchMedia("(pointer:coarse)");
  return match && match.matches;
};
```

#### Check if user has system dark mode

```ts
const isDarkMode =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;
```

### Fullscreen

An element can become fullscreen by doing the `element.requestFullscreen()` method every DOM element has.

You can get the current element in fullscreen with `document.fullscreenElement` , which returns that element

You can exit fullscreen with `document.exitFullscreen()` method

You can listen for changes by listening to the `"fullscreenchange"` event on the document, like so:

```jsx
document.addEventListener("fullscreenchange", (e) => {
  if (document.fullscreenElement) {
    // in fullscreen
  } else {
    // not in fullscreen
  }
});
```

Here is a class I made:

```ts
export default class FullscreenModel {
  constructor(private element: HTMLElement) {}

  async enterFullscreen() {
    if (this.isFullscreenEnabled) {
      await this.element.requestFullscreen();
    }
  }

  async exitFullscreen() {
    await document.exitFullscreen();
  }

  onFullscreenChange(callback: (isFullScreen: boolean) => void) {
    document.addEventListener("fullscreenchange", () => {
      callback(
        this.fullScreenElement !== null || this.fullScreenElement !== undefined
      );
    });
  }

  get fullScreenElement() {
    return document.fullscreenElement;
  }

  get isFullscreenEnabled() {
    return document.fullscreenEnabled;
  }
}
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
  entries.forEach((entry) => {
    const target = entry.target;
    const [box] = entry.borderBoxSize;
    if (box.blockSize < 150 && box.inlineSize < 150) {
      // do something
    }
  });
});

// 2. observe elements
observer.observe(document.querySelector(".rect"));
```

The `entries` parameter is an array of entries, where each `entry` object has the following properties:

- `entry.target` : the element being resized
- `entry.contentRect` : returns the dimensions of the element which is the **bounding box** you would get from the `element.getBoundingBox()` method.
- `entry.borderBoxSize` : a one-element array that represents the element’s new dimensions. A single object from this array has these properties:
  - `box.blockSize` : the vertical size in pixels of the element
  - `box.inlineSize` : the horizontal size in pixels of the element

And here are the methods you have on the `observer` object:

- `observer.observe(element)`: adds an element to its list of observers
- `observer.unobserve(element)`: removes an element from its list of observers
- `observer.disconnect()`: stops the observations and removes all observers

Here is a wrapper for the API:

```ts
class ResizeObserverAPI {
  observer?: ResizeObserver;
  createObserver(
    cb: (height: number, width: number, element: HTMLElement) => void
  ) {
    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const [box] = entry.borderBoxSize;
        cb(box.blockSize, box.inlineSize, target as HTMLElement);
      });
    });
  }

  observe(element: HTMLElement) {
    this.observer?.observe(element);
  }

  unobserve(element: HTMLElement) {
    this.observer?.unobserve(element);
  }

  disconnect() {
    this.observer?.disconnect();
  }
}

class ResizeObserverModel {
  observer: ResizeObserver;
  static instanceStore: ResizeObserverModel[] = [];

  static handleSingleton() {
    if (ResizeObserverModel.instanceStore.length) {
      ResizeObserverModel.instanceStore.forEach((instance) => {
        instance.observer.unobserve(instance.element);
        instance.observer.disconnect();
      });
      ResizeObserverModel.instanceStore = [];
    }
  }

  constructor(
    private element: HTMLElement,
    cb: (height: number, width: number, element: HTMLElement) => void
  ) {
    ResizeObserverModel.handleSingleton();
    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const [box] = entry.borderBoxSize;
        cb(box.blockSize, box.inlineSize, this.element);
      });
    });
    this.observer.observe(this.element);
    ResizeObserverModel.instanceStore.push(this);
  }
}
```

### MutationObserver

#### Executing code once an element is mounted

We can use the `MutationObserver` class to continuously check for the existence of an element, and if that element is defined, we can then execute some code.

1. We create an observer on the `document.body`, and make sure we listen for all changes in the DOM by including the `childList: true` to listen for mutations on direct children of the `<body>` tag and `subtree: true` to listen for mutations on any descendants of the `<body>` tag.
2. Keep querying for the target element by using something like `document.querySelector`
3. If the queried element is defined, you can stop tracking for changes by calling `observer.disconnect()`, and now you can do stuff with the element.

```js
const observer = new MutationObserver((mutations) => {
    const targetElement = document.getElementById('my-element');

    // Check if the target element has been added to the DOM
    if (targetElement)) {
        // Stop tracking
        observer.disconnect();

        // The target element is available, do something with it
        console.log('Element is now available');
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
```

#### Basics

Here are the methods you have on the `observer` object:

- `observer.observe(element, options)`: adds an element to its list of observers. You must specify at least one of these properties in the options object:
  - `childList`: if true, observes changes to the element's direct children (getting added or removed)
  - `subtree`: if true, observes changes to all descendants of the element.
  - `attributes`: if true, observes changes to attributes being set or removed on the element
  - `attributeOldValue`: if true, also gives the old attribute value info whenever the attributes of the element change.
  - `attributeFilter`: the list of attributes to observe. This should be of type `string[]`.
  - `characterData`: if true, observes changes to the text content of the element
  - `characterDataOldValue`: if true, also gives the old text content value whenever the text content of the element changes.
- `observer.unobserve(element)`: removes an element from its list of observers
- `observer.disconnect()`: stops the observations and removes all observers

#### using with character data

To observe changes to element text content with the `"characterData"` attribute, you have to observe the child node of the text element, since text is a node in HTML.

### URL

```ts
let url = new URL("https://example.com:8000/path/name?q=term#fragment");

console.log(url.href); // => "https://example.com:8000/path/name?q=term#fragment"
console.log(url.origin); // => "https://example.com:8000"
url.protocol; // => "https:"
url.host; // => "example.com:8000"
url.hostname; // => "example.com"
url.port; // => "8000"
url.pathname; // => "/path/name"
url.search; // => "?q=term"
url.hash; // => "#fragment"
```


### View Transitions

You can do a view transitions between changing pages (frontend version) by using the `document.startViewTransition(cb)` method.

```tsx
function changePage() {
	// render new page...
}

document.startViewTransition(() => changePage());
```

You can customize the animations with CSS:

- `::view-transition-old(name)` : CSS selector for the beginning view transition for a specific view transition name. `root` means entire page.
- `::view-transition-new(name)` : CSS selector for the end view transition for a specific view transition name. `root` means entire page.

```tsx
// makes animation take 1 second long
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 1s;
}
```

You can further customize like so:

```tsx
@keyframes fade-in {
    from { opacity: 0; }
  }
  
  @keyframes fade-out {
    to { opacity: 0; }
  }
  
  @keyframes slide-from-right {
    from { transform: translateX(60px); }
  }
  
  @keyframes slide-to-left {
    to { transform: translateX(-60px); }
  }
  
  ::view-transition-old(root) {
    animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }
  
  ::view-transition-new(root) {
    animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }
```

#### View Transitions for anything

We can take advantage of view transitions to morph elements across page transitions for cool effects.

We do this by giving the same elements on different pages the same _view transition name_, and we can then style them accordingly.

```css
.image-1-page1 {
	view-transition-name: image
}

.image-1-page2 {
	view-transition-name: image
}
```

**`view-transition-name`** must be unique. If two rendered elements have the same **`view-transition-name`** at the same time, the transition will be skipped, which is what you want for morphing elements into each other.

You then style those elements using the `::view-transition(name)` pseudoselector.

```css
::view-transition-old(full-embed),
::view-transition-new(full-embed) {
  /* Prevent the default animation,
  so both views remain opacity:1 throughout the transition */
  animation: none;
  /* Use normal blending,
  so the new view sits on top and obscures the old view */
  mix-blend-mode: normal;
  /* Make the height the same as the group,
  meaning the view size might not match its aspect-ratio. */
  height: 100%;
  /* Clip any overflow of the view */
  overflow: clip;
}

/* The old view is the thumbnail */
::view-transition-old(full-embed) {
  /* Maintain the aspect ratio of the view,
  by shrinking it to fit within the bounds of the element */
  object-fit: contain;
}

/* The new view is the full image */
::view-transition-new(full-embed) {
  /* Maintain the aspect ratio of the view,
  by growing it to cover the bounds of the element */
  object-fit: cover;
}

```

#### Animating anything

You can actually animate any element using view transitions since the animation is just extrapolating between snapshots of a document. 

```ts
if (document.startViewTransition) {
  // (check for browser support)
  document.addEventListener("click", function (event) {
    if (event.target.matches("summary")) {
      event.preventDefault(); // (we'll toggle the element ourselves)
      const details = event.target.closest("details");
      document.startViewTransition(() => details.toggleAttribute("open"));
    }
  });
```

<video src="https://res.cloudinary.com/ddxwdqwkr/video/upload/v1678488008/patterns.dev/toggle-demo.mp4" style="aspect-ratio: 16/9; max-width: 100%" controls autoplay muted></video>



### Clipboard

#### Reading text

Read copied text from the clipboard using the async `navigator.clipboard.readText()` method, which returns the text from the clipboard.

Reading text requires permission that the user grants at runtime. If this permission is denied. then the method will throw an error.

```ts
async function readText() {
  try {
    return await navigator.clipboard.readText();
  } catch (err) {
    return null;
  }
}
```

#### Writing text

Writing text to the clipboard is super easy and does not require any permissions. Just use the `navigator.clipboard.writeText()` method and pass in the string you want to copy to the clipboard.

```ts
await navigator.clipboard.writeText("bruh copied");
```

#### Reading any type of data from clipboard

Use the async `navigator.clipboard.read()` method that reads any type of clipboard data from the user. This returns an array of one element, which is a `ClipboardItem`.

```ts
const [clipboardItem] = await navigator.clipboard.read();
```

Instances of this class have these properties and methods:

- `clipboardItem.types`: returns the array of mimetypes that describes the clipboard data. Clipboard data can have multiple mime types, so it's often beneficial to just act on one.
- `clipboardItem.getType(mimeType: string)`: returns the blob of clipboard data for the given mimetype.

Here is a full example of doing something different for different mime types of clipboard data.

```ts
copyTextBtn.addEventListener("click", async () => {
  const [clipboardItem] = await navigator.clipboard.read();

  // if HTML, parse as HTML
  if (clipboardItem.types.includes("text/html")) {
    let blob = await clipboardItem.getType("text/html");
    let html = await blob.text();
    document.body.innerHTML = html;
  }

  // If plain text, parse as plain text
  if (clipboardItem.types.includes("text/plain")) {
    let blob = await clipboardItem.getType("text/plain");
    let text = await blob.text();
    alert(text);
  }

  // If image, create URL from blob to display image
  if (clipboardItem.types.includes("image/png")) {
    const pngImage = new Image();
    pngImage.alt = "PNG image from clipboard";
    const blob = await clipboardItem.getType("image/png");
    const blobUrl = URL.createObjectURL(blob);
    console.log(blobUrl);
    pngImage.src = blobUrl;
    document.body.appendChild(pngImage);
  }
});
```

#### Writing any data to clipboard

Use the async `navigator.clipboard.write()` method, which takes in an array of `ClipboardItem` instances to write to the clipboard. Follow these steps in general:

1. Create a blob

```ts
const blob = new Blob(["hello world"], { type: "text/plain" });
```

2. Create a `ClipboardItem` instance from the blob

```ts
const clipboardItem = new ClipboardItem({ "text/plain": blob });
```

3. Write to the clipboard

```ts
await navigator.clipboard.write([clipboardItem]);
```

Below is a complete example of creating a blob, creating a clipboard item from the blob, and then writing it to the clipboard.

```ts
copyImagebutton.addEventListener("click", async () => {
  const type = "image/png";
  const response = await fetch(imageToCopy.src);
  const imageBlob = await response.blob();
  const blob = new Blob([imageBlob], { type });
  const data = [new ClipboardItem({ [type]: blob })];
  await navigator.clipboard.write(data);
});
```

> [!WARNING] Limited Mime Types to write
> When writing and reading to and from the clipboard, you only are allowed to use clipboard data with these three mime types: `text/html`, `text/plain`, and `image/png`

#### Custom clipboard class

```ts
export default class ClipboardModel {
  static async readText() {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      return null;
    }
  }

  static async readClipboardDataAsText() {
    if (await ClipboardModel.hasTextCopied()) {
      const [clipboardItem] = await navigator.clipboard.read();
      let blob = await clipboardItem.getType("text/plain");
      return blob.text();
    }
    return null;
  }

  static async readClipboardDataAsHTML() {
    if (await ClipboardModel.hasTextCopied()) {
      const [clipboardItem] = await navigator.clipboard.read();
      let blob = await clipboardItem.getType("text/html");
      return blob.text();
    }
    return null;
  }

  static async readClipboardDataAsPNG() {
    if (await ClipboardModel.hasImageCopied()) {
      const [clipboardItem] = await navigator.clipboard.read();
      const blob = await clipboardItem.getType("image/png");
      const blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    }
    return null;
  }

  static async hasTextCopied() {
    const [clipboardItem] = await navigator.clipboard.read();
    const typeMapping = clipboardItem.types.map((type) => type.split("/")[0]);
    return typeMapping.includes("text");
  }

  static async copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  static async hasImageCopied() {
    const [clipboardItem] = await navigator.clipboard.read();
    const typeMapping = clipboardItem.types.map((type) => type.split("/")[0]);
    return typeMapping.includes("image");
  }

  static async copyImage(path: string, mimeType: `image/${string}`) {
    if (mimeType === "image/png") {
      const response = await fetch(path);
      const imageBlob = await response.blob();
      await ClipboardModel.copyBlobToClipboard(imageBlob, mimeType);
    } else {
      const imageBlob = await ClipboardModel.setCanvasImage(path);
      await ClipboardModel.copyBlobToClipboard(imageBlob, mimeType);
    }
  }

  private static async copyBlobToClipboard(blob: Blob, mimeType: string) {
    const data = [ClipboardModel.createClipboardItem(blob, mimeType)];
    await navigator.clipboard.write(data);
  }

  private static createClipboardItem(blob: Blob, mimeType: string) {
    const _blob = new Blob([blob], { type: mimeType });
    return new ClipboardItem({ [mimeType]: _blob });
  }

  private static setCanvasImage(path: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const c = document.createElement("canvas");
      const ctx = c.getContext("2d")!;

      img.onload = function () {
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        c.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };
      img.src = path;
    });
  }
}
```

#### Managing clipboard permission

The clipboard API is sensitive, so the user needs to grant permission first.

Clipboard permissions are split into two:

- `clipboard-read` allows for a page to read the contents of the clipboard. This permission must be explicitly granted by the user.
- `clipboard-write` allows for a page to write content *into* the clipboard. This write permission is granted automatically to pages when they are the active tab.

Use the `navigator.permissions` API to query these permissions:

```ts
async function isClipboardWriteAllowed() {
  const result = await navigator.permissions.query({ name: "clipboard-write" });
  return result.state === "granted";
}

async function isClipboardReadAllowed() {
  const result = await navigator.permissions.query({ name: "clipboard-read" });
  return result.state === "granted";
}
```

> [!WARNING]
> However, it's not possible to do anything with the clipboard while the page is out of focus, so keep that in mind.

#### Clipboard events

There are the `"cut"`, `"copy"`, and `"paste"` events you can listen for on the `document` object.

```ts
document.addEventListener("copy", async () => {
  const data = e.clipboardData;
  console.log("Copied text:", await navigator.clipboard.readText());
});
```

The clipboard data from all these events is stored in `e.clipboardData` property on the event object.

## Various DOM Tips

### Enable spellcheck

You can use the `spellcheck` attribute with `<input>` elements, content-editable elements, and `<textarea>` elements to enable or disable spell-checking by the browser.

```html
<input type="text" spellcheck="true" />
```

### Downloading files

The easy way to initiate a file download is by setting the `download=` attribute on the `<a>` tag. Whatever `href=` attribute you set should point to the desired filepath to download.

- The `href=` can be either a filepath, online resource, or blob URL

You can also initiate downloads programmatically by using this hacky way of creating a download link, clicking on it, and then immediately removing it.

```ts
// Create a new link
const link = document.createElement("a");
link.download = "file name";
link.href = "/path/to/file";

// Append to the document
document.body.appendChild(link);

// Trigger the click event
link.click();

// Remove the element
document.body.removeChild(link);
```

### Hide or show password

The basic theory between a hide and show password toggle is simply changing the `input` type attribute from `type="text"` and `type="password"`, and toggling that whenever the eye button is clicked.

```ts
function showPassword(element) {
  element.setAttribute("type", "text");
}

function hidePassword(element) {
  element.setAttribute("type", "password");
}
```

```ts
// Query the elements
const passwordEle = document.getElementById("password");
const toggleEle = document.getElementById("toggle");

toggleEle.addEventListener("click", function () {
  const type = passwordEle.getAttribute("type");

  passwordEle.setAttribute(
    "type",
    // Switch it to a text field if it's a password field
    // currently, and vice versa
    type === "password" ? "text" : "password"
  );
});
```

### Replace broken images with a default image

The `"error"` event for an image is triggered if its src is invalid. You can use this at the beginning of your JS code to listen for broken images and replace them with a different default image.

```ts
function replaceBrokenImages(defaultPath: string) {
  const images = [...document.querySelectorAll("img")] as HTMLImageElement[];

  images.forEach((img) => {
    img.addEventListener("error", function (e) {
      img.src = "/path/to/404/image.png";
    });
  });
}
```

### Sanitize HTML

We can sanitize HTML by following these steps:

1. Create an element that does not immediately run HTML, like `<textarea>` or `<template>`
2. Set the innerHTML of the newly created element to HTML string you want to sanitize.
3. Return the text content of the newly created element, which should just be the HTML except sanitized.

```ts
function sanitizeHTML(html: string) {
  const ele = document.createElement("template");
  ele.innerHTML = html;
  return ele.content.textContent || "";
}
```

You can also use the `DOMParser()` class:

```ts
const htmlString = '<script>alert("Hello, world!");</script><p>Some text</p>';
const parser = new DOMParser();
const doc = parser.parseFromString(htmlString, "text/html");
```

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

We can also promisify this:

```ts
function documentIsReady() {
  return new Promise<boolean>((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => resolve(true));
    } else {
      resolve(true);
    }
  });
}

async function main() {
  await documentIsReady();
  console.log("Document is ready");
}

main();
```

The `DOMContentLoaded` event will wait for any non-async `<script>` tags to run before finally executing. 


### HTML String code coloring

To get HTML or CSS string code coloring, you have to follow these steps:

1. Install the es6-html-string and es6-css-string extensions.
2. Create tagged template `html()` and `css()` methods. 

```ts
export function html(strings: TemplateStringsArray, ...values: any[]) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
}

export function css(strings: TemplateStringsArray, ...values: any[]) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (values[i] || "");
  });
  return str;
}
```

```ts
const HTMLContent = html`
  <section>
    <h1 class="text-2xl font-bold">Screen Recorder</h1>
    <button class="bg-black text-white px-4 py-2 rounded-lg" id="start">
      Start Recording
    </button>
    <button class="bg-black text-white px-4 py-2 rounded-lg" id="stop">
      Stop Recording
    </button>
  </section>
`;
```

### Get window size

- `document.documentElement.clientHeight`: the available height of the window viewport (excluding scrollbar)
- `document.documentElement.clientWidth`: the available width of the window viewport (excluding scrollbar)

We can get the full window height and width that you can get via scrolling with these calculations:

```ts
let scrollHeight = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight
);
```
## Content editable

The `contentEditable` attribute is extremely versatile and allows us to modify the content of elements in the page.

You can visit the `data:text/html, <html contenteditable>` url, which turns the entire webpage into a editable content surface.
