# 10: DOM

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
window.onbeforeunload = function () {
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
  private cookies: Record<string, string>;
  constructor() {
    this.cookies = this.getCurrentCookies();
  }

  fetchLatestCookies() {
    this.cookies = this.getCurrentCookies();
    return { ...this.cookies };
  }

  private getCurrentCookies(): Record<string, string> {
    if (document.cookie === "") {
      return {};
    }
    const cookiePairs = document.cookie.split("; ");
    return cookiePairs.reduce((accumulator, pair) => {
      const [key, value] = pair.split("=");
      return {
        ...accumulator,
        [key]: value,
      };
    }, {});
  }

  private createExpiration(days: number) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
  }

  toJSON() {
    return JSON.stringify(this.cookies);
  }

  setCookie(key: string, value: string, exdays: number = 30) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie =
      encodeURIComponent(key) +
      "=" +
      encodeURIComponent(value) +
      "; " +
      expires +
      "; " +
      "path=/;";
    this.cookies[key] = value;
  }

  static getCookie(cname: string) {
    let name = encodeURIComponent(cname) + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  deleteCookie(key: string) {
    let expires = "max-age=0";
    document.cookie =
      encodeURIComponent(key) + "=" + "; " + expires + "; " + "path=/;";
    if (CookieManager.getCookie(key)) {
      return false;
    }
    delete this.cookies[key];
    return true;
  }
}

const manager = new CookieManager();
manager.setCookie("dog", "rufus");
const deletedCookie = manager.deleteCookie("dog");
console.log(deletedCookie);
console.log(manager.fetchLatestCookies());
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
const expires = "expires=Tue, 19 Jan 2038 03:14:07 GMT";
const path = `path=/`;
const domain = "google.com";
```

#### Third party cookies

**third party cookies** are cookies that are placed by a domain other than the page the user is visiting. They are used by ad services to track you.

> [!NOTE]
> When a remote script sets a cookie on a webpage, the cookie will belong to that site and under that domain.

The GDPR org requires that companies make sure users verbally agree to allowing them to set third-party cookies that track how users visit different websites, either by accepting a privacy policy or by clicking 'allow all cookies'.

#### `CookieStore`

A new [CookieStore](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore) API makes working with cookies easier and asynchronous, and prevents having to access `document.cookie`. The `cookieStore` object is globally available on `window.cookieStore`.

All these methods are async:

- `cookieStore.set(options)`: sets a cookie
- `cookieStore.delete(options)`: deletes a cookie
- `cookieStore.get(options)`: gets a cookie
- `cookieStore.getAll(options)`: gets all matching cookies
-

```ts
async function setCookie() {
  const day = 24 * 60 * 60 * 1000;

  await cookieStore.set({
    name: "cookie1",
    value: "cookie1-value",
    expires: Date.now() + day,
    domain: "example.com",
  });
}
```

### Window methods

- `window.blur()`: removes focus from the window
- `window.close()`: closes the current window
- `window.open(url)`: opens a new window and creates a tab with the specified URL


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

#### Video Picture in picture

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

Here is a basic class wrapping PIP video functionality:

#### Any Element picture in picture


> [!NOTE] 
> The any element PiP API offers more flexibility on what elements can be made into a picture and picture experience, allowing you to add styling to those elements. But at the same time, you have to manually control the PiP flow yourself.

For this API, the main catch is that you have to manually remove the element from the screen and add it to the PIP window when you want to enter PIP, and manually add the element back to the screen when you want to close PIP. Here is the basic flow:

- **wants to enter PIP**
	- Request PIP window, add styles to element
	- Remove element from main document
	- Add element to body of pip window
- **wants to leave PIP**
	- Close PIP window
	- Add element back to main document

There are also two event listeners that activate when the custom PIP window is closed or opened, and you should listen to these to appropriately handle all logic cases.
##### Typings

Since this is a new API, the typescript types aren't out yet. You'll have to supply your own by putting it in a `.d.ts` file somewhere.

```ts
interface DocumentPictureInPicture {
  // The current Picture-in-Picture window if one is open; otherwise, null.
  readonly window: Window | null;

  // Requests a new Picture-in-Picture window with optional configuration.
  requestWindow(options?: PictureInPictureWindowOptions): Promise<Window>;

  addEventListener(
    type: "enter",
    listener: (event: DocumentPictureInPictureEvent) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
}

interface PictureInPictureWindowOptions {
  // The initial width of the Picture-in-Picture window.
  width?: number;

  // The initial height of the Picture-in-Picture window.
  height?: number;

  // If true, hides the "back to tab" button in the Picture-in-Picture window.
  disallowReturnToOpener?: boolean;

  // If true, opens the Picture-in-Picture window in its default position and size.
  preferInitialWindowPlacement?: boolean;
}

interface Window {
  // The DocumentPictureInPicture object for the current document context.
  readonly documentPictureInPicture: DocumentPictureInPicture;
}

interface DocumentPictureInPictureEvent extends Event {
  // The Picture-in-Picture window associated with the event.
  readonly window: Window;
}
declare var documentPictureInPicture: DocumentPictureInPicture;
```

##### Opening a window

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

##### Closing the PIP window

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

##### accessing pip window

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

#### Classes

```ts
export class AbortControllerManager {
  private controller = new AbortController();

  get signal() {
    return this.controller.signal;
  }

  get isAborted() {
    return this.controller.signal.aborted;
  }

  reset() {
    this.controller = new AbortController();
  }

  abort() {
    this.controller.abort();
  }
}

export class PIPVideo {
  enterPIPAborter = new AbortControllerManager();
  exitPIPAborter = new AbortControllerManager();
  constructor(private video: HTMLVideoElement) {}

  async togglePictureInPicture() {
    try {
      // If the video is not in PiP mode, request PiP
      if (this.video !== document.pictureInPictureElement) {
        const pipWindow = await this.video.requestPictureInPicture();
      } else {
        // If the video is in PiP mode, exit PiP
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error("Error toggling Picture-in-Picture:", error);
    }
  }

  Events = {
    onEnterPictureInPicture: (cb: (event: PictureInPictureEvent) => any) => {
      this.video.addEventListener(
        "enterpictureinpicture",
        cb as EventListener,
        {
          signal: this.enterPIPAborter.signal,
        }
      );
      return cb;
    },
    onLeavePictureInPicture: (cb: (event: Event) => any) => {
      this.video.addEventListener(
        "leavepictureinpicture",
        cb as EventListener,
        {
          signal: this.exitPIPAborter.signal,
        }
      );
      return cb;
    },
    removeEnterPIPListeners: () => {
      this.enterPIPAborter.abort();
      this.enterPIPAborter.reset();
    },
    removeExitPIPListeners: () => {
      this.exitPIPAborter.abort();
      this.exitPIPAborter.reset();
    },
  };
}

export class PIPElement {
  private pipWindow: Window | null = null;
  enterPIPAborter = new AbortControllerManager();
  exitPIPAborter = new AbortControllerManager();
  constructor(
    private pipContainer: HTMLElement,
    private options?: {
      width: number;
      height: number;
    }
  ) {}

  static get isAPIAvailable() {
    return "documentPictureInPicture" in window;
  }

  // closes pip window
  static closePipWindow() {
    window.documentPictureInPicture?.window?.close();
  }

  // checks if pip window is open
  static get pipWindowOpen() {
    return !!window.documentPictureInPicture.window;
  }

  // gets currently active pip window, else returns null
  static get pipWindow() {
    return window.documentPictureInPicture.window;
  }

  // logic for toggling pip
  async togglePictureInPicture({
    onOpen,
    onClose,
  }: {
    onOpen: (window: Window) => void;
    onClose: () => void;
  }) {
    this.Events.resetExitAborter();
    this.Events.resetEnterAborter();
    this.Events.onPIPEnter(onOpen);
    if (PIPElement.pipWindowOpen) {
      PIPElement.closePipWindow();
      onClose();
      return;
    } else {
      await this.openPipWindow();
      this.copyStylesToPipWindow();
      this.Events.onPIPWindowClose(onClose);
    }
  }

  // requests new pip window
  async openPipWindow() {
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: this.options?.width || this.pipContainer.clientWidth,
      height: this.options?.height || this.pipContainer.clientHeight,
    });
    this.pipWindow = pipWindow;
    this.pipWindow.document.body.append(this.pipContainer);
  }

  // manually add styles to pip window when open
  addStylesToPipWindow({ id, styles }: { styles: string; id: string }) {
    if (!this.pipWindow) {
      throw new Error("PIP window is not open");
    }
    const style = document.createElement("style");
    style.id = id;
    style.textContent = styles;
    this.pipWindow.document.head.appendChild(style);
  }

  // copy styles from main document to pip window
  copyStylesToPipWindow() {
    if (!this.pipWindow) {
      throw new Error("PIP window is not open");
    }
    // delete all style tags first
    this.pipWindow.document.querySelectorAll("style").forEach((style) => {
      style.remove();
    });
    [...document.styleSheets].forEach((styleSheet) => {
      const pipWindow = this.pipWindow!;
      try {
        const cssRules = [...styleSheet.cssRules]
          .map((rule) => rule.cssText)
          .join("");
        const style = document.createElement("style");

        style.textContent = cssRules;
        pipWindow.document.head.appendChild(style);
      } catch (e) {
        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.type = styleSheet.type;
        link.href = styleSheet.href || "";
        pipWindow.document.head.appendChild(link);
      }
    });
  }

  Events = {
    // event that is triggered when pip window closes
    onPIPWindowClose: (cb: () => void) => {
      if (!this.pipWindow) {
        throw new Error("PIP window is not open");
      }
      this.pipWindow.addEventListener("pagehide", cb, {
        signal: this.exitPIPAborter.signal,
      });
    },

    // event that is triggered when pip window is opened
    onPIPEnter: (cb: (window: Window) => void) => {
      window.documentPictureInPicture.addEventListener(
        "enter",
        (event: DocumentPictureInPictureEvent) => {
          cb(event.window);
        },
        {
          signal: this.enterPIPAborter.signal,
        }
      );
    },
    resetExitAborter: () => {
      this.exitPIPAborter.abort();
      this.exitPIPAborter.reset();
    },
    resetEnterAborter: () => {
      this.enterPIPAborter.abort();
      this.enterPIPAborter.reset();
    },
  };
}
```

`PipVideo` is used for `<video>` picture in picture elements while `PipElement` is used for custom PiP elements. 

This class extends the PiP functionality to generic HTML elements (not just videos) using the `documentPictureInPicture` API. It allows you to open a PiP window, copy styles, and manage event listeners for PiP-related events.

- **Properties**:
    
    - `pipWindow`: The currently active PiP window, or `null` if no PiP window is open.
        
- **Static Properties**:
    
    - `isAPIAvailable`: Checks if the `documentPictureInPicture` API is supported in the current browser.
        
    - `pipWindowOpen`: Returns `true` if a PiP window is currently open.
        
    - `pipWindow`: Returns the currently active PiP window, or `null` if none is open.
        
- **Methods**:
    
    - `togglePictureInPicture({ onOpen, onClose })`: Toggles the PiP window. If a PiP window is open, it closes it and calls `onClose`. If no PiP window is open, it opens one and calls `onOpen`.
        
    - `openPipWindow()`: Opens a new PiP window with the specified dimensions (or defaults to the container's dimensions).
        
    - `addStylesToPipWindow({ id, styles })`: Adds custom styles to the PiP window using a `<style>` element.
        
    - `copyStylesToPipWindow()`: Copies all styles from the main document to the PiP window, ensuring consistent styling.

- **Events**:
    
    - `onPIPWindowClose(cb)`: Registers a callback to be called when the PiP window closes.
        
    - `onPIPEnter(cb)`: Registers a callback to be called when the PiP window is opened. The callback receives the PiP window as an argument.
        
    - `resetExitAborter()`: Aborts and resets the `exitPIPAborter`, removing all "exit PiP" event listeners.
        
    - `resetEnterAborter()`: Aborts and resets the `enterPIPAborter`, removing all "enter PiP" event listeners.

Here is an example of how to use the custom `PipElement` class:

```ts
async function handlePip() {
  await pipPlayer.togglePictureInPicture({
    onClose: () => {
	    // when closing pip, add back content from pip player to webpage
      sessionTimerSection.innerHTML = "";
      sessionTimerSection.appendChild(timerElement);
      togglePiPButton!.textContent = "Open PiP";
    },
    onOpen: (pipWindow) => {
	    // when opening pip, remove content from webpage
      sessionTimerSection.innerHTML = "Playing in PIP Window";
      togglePiPButton!.textContent = "Close PiP";
    },
  });
}

const timerElement = DOM.$throw("#practice-session-timer > div");
const pipPlayer = new PIPElement(timerElement);

togglePiPButton!.addEventListener("click", handlePip);
```
-
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

### `MutationObserver`

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

Here is the most basic reusable way to use this API by just listening for changes on the `document.body` element:

```ts
function observeChildElement<T extends HTMLElement>(
	selector: string, 
	onMutation: (element : T) => void,
	rootElement : HTMLElement = document.body
) {
	const domObserver = new MutationObserver(() => {
	  const element = document.querySelector(selector);
	
	  if (element) {
	    onMutation(element)
	  }
	});

	return {
		subscribe: () => {
			domObserver.observe(rootElement, { 
				childList: true, 
				subtree: true 
			});
		},
		unsubscribe: () => {
			domObserver.unobserve(rootElement)
		}
	}
}
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

### URL and URLPattern

#### URL

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

#### URLPattern

The `URLPattern` class is used as a way to programmatically test if URLs match a certain schema. It's like a wrapper around regex for URLs.

```ts
// A pattern matching some fixed text
const pattern = new URLPattern({ pathname: "/books" });
console.log(pattern.test("https://example.com/books")); // true
console.log(pattern.exec("https://example.com/books").pathname.groups); // {}
```

```ts
// A pattern matching with a named group
const pattern = new URLPattern({ pathname: "/books/:id" });
console.log(pattern.test("https://example.com/books/123")); // true
console.log(pattern.exec("https://example.com/books/123").pathname.groups); // { id: '123' }
```

You pass an object of options into the constructor:

```ts
const pattern = new URLPattern(options)
```

Here are the options:

- `pathname`: the string matcher for the pathname (everything after the origin, with root being `/`). You can either hardcode the path, use regex, or use route params for matching.
- `protocol`: the string matcher for the protocol you want the URL to be on.
- `hash`: the string matcher for the hash (everything after the `#`)
- `hostname`: the string matcher for the domain name
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
  view-transition-name: image;
}

.image-1-page2 {
  view-transition-name: image;
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

<video src="https://res.cloudinary.com/ddxwdqwkr/video/upload/v1678488008/patterns.dev/toggle-demo.mp4" className="markdown-video" controls autoplay muted></video>

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

### All about navigator

Here are some useful basic instance properties on the `navigator` object:

- `navigator.platform`: returns the OS the user is running on, which is either `"Win32"` or `"MacIntel"`.
- `navigator.userAgent`: returns the current user agent as a string
- `navigator.userAgentData`: returns the user agent as an object with three properties:
  - `brands`: an array of currently used browsers
  - `mobile`: whether or not the user is on a phone right now
  - `platform`: which OS is currently being used.
- `navigator.cookieEnabled`: returns whether or not the user has cookies enabled
- `navigator.hardwareConcurrency`: returns the number of CPU cores on the user's laptop
- `navigator.language`: returns the user's preferred language

#### Internet Connection

The `navigator.connection` property returns a [NetworkInformation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation) object with these properties:

- `navigator.connection.downlink`: returns the bandwidth in mb/s
- `navigator.connection.effectiveType`: returns the network type, like 4g

You can detect a network change like from 4g to 3g like so, by listening to the `"change"` event on the `navigator.connection` object.

```ts
let type = navigator.connection.effectiveType;

function updateConnectionStatus() {
  console.log(
    `Connection type changed from ${type} to ${navigator.connection.effectiveType}`
  );
  type = navigator.connection.effectiveType;
}

navigator.connection.addEventListener("change", updateConnectionStatus);
```

You can also check if the user is online by using the `navigator.onLine` property, which returns true if yes, false if no.

```ts
export class NavigatorConnection {
  static get isOnline() {
    return navigator.onLine;
  }

  static get bandwidth() {
    return navigator.connection.downlink;
  }

  onNetworkChange(callback: (type: "4g" | "3g" | "2g" | "slow-2g") => void) {
    navigator.connection.addEventListener("change", () => {
      callback(navigator.connection.effectiveType);
    });
  }

  onConnectivityChange(callback: (isOnline: boolean) => void) {
    const offlineCb = () => callback(false);
    const onlineCb = () => callback(true);
    window.addEventListener("offline", offlineCb);
    window.addEventListener("online", onlineCb);
    return {
      unsubscribe() {
        window.removeEventListener("offline", offlineCb);
        window.removeEventListener("online", onlineCb);
      },
    };
  }
}
```

### Screen orientation

The `window.screen` object offers a bunch of information about the laptop display.

Here are a few basic properties:

- `window.screen.height`: the height of the display
- `window.screen.width`: the width of the display
- `window.screen.colorDepth`: the number of bits used for color. 24 for laptops, 8 for phones.
- `window.screen.isExtended`: whether or not the display is extended, like an external monitor.

But you can also find the orientation (type, angle, add event listeners) of the screen using `windows.screen.orientation` object:

```ts
export class NavigatorScreenOrientation {
  static get orientation() {
    return window.screen.orientation.type;
  }

  static get isLandscape() {
    return this.orientation.includes("landscape");
  }

  static get isPortrait() {
    return this.orientation.includes("portrait");
  }

  static get angle() {
    return window.screen.orientation.angle;
  }

  static onOrientationChange(callback: (orientation: string) => void) {
    window.screen.orientation.addEventListener("change", () => {
      callback(this.orientation);
    });
  }
}
```

### Dialog and Popover API

#### Dialog

The `<dialog>` element is a basic modal implementation, but it requires javascript to open and close the modal.

> [!TIP]
> Dialog works best for **focus trapping** modals where you want users to focus on the modal and prevent them from accessing the underlying page.

```html
<dialog open>
  <form method="dialog">
    <button type="submit" autofocus>close</button>
  </form>
</dialog>
```

Open a `<dialog>` element by setting the `open="true"` attribute on it. Once a dialog is open, there are three ways to close it:

1. User submits a `<form>` with a `method="dialog"` attribute
2. User presses `esc` key
3. Use javascript to call the `dialog.close()` method, where the dialog element is an instance of the `HTMLDialogElement`.

**Dialog methods**

You have three methods available on the dialog in javascript.

```tsx
dialog.show(); /* opens the dialog */
dialog.showModal(); /* opens the dialog as a modal */
dialog.close(); /* closes the dialog */
```

- `dialog.show()` : opens up the dialog, but without a darkened backdrop.
- `dialog.showModal()` : opens up the dialog with a darkened backdrop which you can style with the `::backdrop` pseudoelement.
- `dialog.close()` : closes the dialog

You also have these properties available on a dialog:

- `dialog.open`: returns whether or not the dialog is currently open

**Closing a dialog**

You can pass in payload values to the `dialog.close(some_string)` method, which you can then access in the `"close"` event listener of a dialog through `event.target.returnValue`.

```ts
dialog.close(123);

dialog.addEventListener("close", (e) => {
  console.log(e.target.returnValue); // 123
});
```

**dialog class**

```ts
class DialogManager {
  constructor(private dialog: HTMLDialogElement) {}

  onClose(cb: (returnValue?: string) => void) {
    this.dialog.addEventListener("close", (e) => {
      const d = e.target as HTMLDialogElement;
      e.target && cb(d.returnValue);
    });
  }

  public get isOpen() {
    return this.dialog.open;
  }

  open() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }
}
```

#### Popover

The popover is 1) simpler and 2) more user friendly. It shows a modal but doesn't prevent interacting with the rest of the page below, as opposed to the dialog API.

> [!TIP]
> Popovers are **soft-dismissible** and work best when you don't want to focus trap the user - you just want to show them a simple notification. This can be used for tooltips and non-essential alerts.

The popover api has two simple steps:

1. Create some content that will act as a modal by putting the `popover` attribute on the modal. Also give that modal an id.

```html
<div id="modal" popover>I am a free Modal</div>
```

2. Create a button with a `popovertarget=` attribute and set it to the id of the popover modal you want to display when the button gets clicked.

```html
<button popovertarget="modal">open popover</button>
```

Once you finish those two steps, the button will be hooked up to display the modal when it gets clicked.

```html
<button popovertarget="modal">open popover</button>
<div id="modal" popover>I am a free Modal</div>
```

Now a modal with backdrop will be displayed, but if you click on the backdrop, it will close the modal, which makes for the best user experience.

**Adding close modal button**

You can also add the `popovertargetaction="close"` attribute on a connected popover button that specifically closes the modal:

```html
<button popovertarget="modal">open popover</button>
<div id="modal" popover>
  I am a free Modal
  <button popovertarget="modal" popovertargetaction="close">close</button>
</div>
```

Popovers also have JavaScript APIs:

- `popoverElement.showPopover()`: opens the popover
- `popoverElement.closePopover()`: closes the popover

**Make popovers like dialogs**

Popovers are **soft-dismissible** by default, but you can prevent that by setting the `popover="manual"` attribute on your popover modal.

```html
<!-- Soft Dismissible -->
<div popover id="myPopover"></div>

<!-- Soft Dismissible -->
<div popover="auto" id="myPopover"></div>

<!-- NOT Soft Dismissible -->
<div popover="manual" id="myPopover"></div>
```

**Popover styling**

By default, popovers use the same backdrop styling as modals, but you can change that like so:

```css
[popover]::backdrop {
  /* unique styling for popover backdrop */
}
```

#### Dialog and Popover animations

Using the new `@starting-style` rule in CSS, we can add exit and entry animations and animate the `display` property of an element:

```css
dialog {
  --duration: 0.34s;

  transition: translate var(--duration) ease-in-out, scale var(--duration) ease-in-out,
    filter var(--duration) ease-in-out, display var(--duration) ease-in-out allow-discrete;

  &[open] {
    /* Post-Entry (Normal) State */
    translate: 0 0;
    scale: 1;
    filter: blur(0);

    /* Pre-Entry State */
    @starting-style {
      translate: 0 8vh;
      scale: 1.15;
      filter: blur(8px);
    }
  }

  /* Exiting State */
  &:not([open]) {
    translate: 0 -8vh;
    scale: 1.15;
    filter: blur(8px);
  }
}
```

### `commandfor` attribute

The `commandfor=` HTML attribute is used on buttons as a way of declaratively creating interaction and onclick listeners for buttons to do things that would otherwise require javascript, like opening popovers and dialogs.

The two important attributes you need to understand are these:

- `commandfor=`: this button attribute should be set to the ID of the element 
- `command=`: the string action that determines the behavior of the onclick. There are built-in ones for opening and closing popovers and modals, but you can also provide custom commands for which you imperatively define their behavior in javascript.

> [!NOTE]
> The main benefit of using the command API instead of manually adding click listeners is that more memory-efficient, automatically targets specific elements without having to do DOM querying bullshittery, and offers a declarative, readable way of creating click listeners.

#### Basic use

**opening and closing a popover**

For opening and closing a popover, you set the `commandfor=` attribute on a button set to the ID of a popover, and then you can supply these two built-in commands:

- `command="toggle-popover"`: the button with this command can toggle open and close popovers.
- `command="hide-popover"`: the button with this command can close popovers once they are open.


```html
<!-- toggle popover action -->
<button commandfor="mypopover" command="toggle-popover">
  Toggle the popover
</button>
<div id="mypopover" popover>
	<!-- close popover action -->
  <button commandfor="mypopover" command="hide-popover">Close</button>
  <p>popover content </p>
</div>
```

**opening and closing a dialog**

For opening and closing a dialog, you set the `commandfor=` attribute on a button set to the ID of a dialog, and then you can supply these two built-in commands:

- `command="show-modal"`: the button with this command can open a dialog
- `command="close"`: the button with this command can close dialogs once they are open.

```html
<button commandfor="mydialog" command="show-modal">Show modal dialog</button>
<dialog id="mydialog">
  <button commandfor="mydialog" command="close">Close</button>
  Dialog Content
</dialog>
```

**commands with javascript**

You can also create custom commands like so and add their functionality through Javascript. This is extremely similar to just doing stuff with dataset attributes, but it's a bit more robust since there's an event listener there:

```html
<button commandfor="my-img" command="--rotate-left">Rotate left</button>
<button commandfor="my-img" command="--rotate-right">Rotate right</button>
<img id="my-img" src="photo.jpg" alt="[add appropriate alt text here]" />
```

- Above, we create custom commands `"--rotate-left"` and `"--rotate-right"` that are tied to the image with id `'my-img'`.

```ts
const myImg = document.getElementById("my-img");

myImg.addEventListener("command", (event) => {
  if (event.command === "--rotate-left") {
    myImg.style.rotate = "-90deg";
  } else if (event.command === "--rotate-right") {
    myImg.style.rotate = "90deg";
  }
});
```

- Above, we listen to the `"command"` event on the image we tied the commands to, and can then get the specific command that was executed through the `event.command` property.

#### Custom class

For HTML that looks like this:

```html
<div>
  <button command="--make-red" commandfor="circle">Make red</button>
  <button command="--make-blue" commandfor="circle">Make blue</button>
</div>

<div id="circle" class="circle"></div>
```

This would be the custom class that is reusable:

```ts
interface CommandEvent extends Event {
  command: string;
}

class DOMCommands<T extends HTMLElement, K extends readonly string[]> {
  private listeners: Partial<Record<K[number], () => void>> = {};
  constructor(public element: T, private commands: K) {}

  onCommand<Command extends K[number]>(command: Command, callback: () => void) {
    this.listeners[command] = callback;
  }

  setupCommandListener() {
    this.element.addEventListener("command", (e) => {
      const commandEvent = e as CommandEvent;
      const listener = this.listeners[commandEvent.command as K[number]];
      if (!listener) {
        throw new Error(
          `command listener for ${commandEvent.command} not implemented`
        );
      }
      listener();
    });
  }
}
```

And this is the implementation of setting up listeners:

```ts

const circleElement = document.getElementById("circle");
if (!circleElement) throw new Error("wtff bro");

const circleCommandsModel = new DOMCommands(circleElement, [
  "--make-red",
  "--make-blue",
] as const);

circleCommandsModel.onCommand("--make-blue", () => {
  circleCommandsModel.element.style.backgroundColor = "blue";
});

circleCommandsModel.onCommand("--make-red", () => {
  circleCommandsModel.element.style.backgroundColor = "red";
});

circleCommandsModel.setupCommandListener();
```

## Various DOM Tips

### Text Fragments

Text fragments are a way of linking on a page to some specific text, and is supported everywhere. It's much better than linking a heading with some id.

The basic syntax is as follows, where the text fragments starts with a `#:~:text=` prefix before supplying the text you want to link to.

```
https://example.com#:~:text=[prefix-,]textStart[,textEnd][,-suffix]
```

Anyway, here's a class to make those URLs:

```ts
export class TextFragmentURLManager {
  static createFragmentURL(url: string, text: string) {
    return `${url}#:~:text=${encodeURIComponent(text)}`;
  }

  static createFragmentURLWithStartAndEnd(
    url: string,
    startText: string,
    endText: string
  ) {
    return `${url}#:~:text=${encodeURIComponent(
      startText
    )},${encodeURIComponent(endText)}`;
  }

  constructor(private url: string) {}

  createFragmentURL(text: string) {
    return TextFragmentURLManager.createFragmentURL(this.url, text);
  }

  createFragmentURLWithStartAndEnd(startText: string, endText: string) {
    return TextFragmentURLManager.createFragmentURLWithStartAndEnd(
      this.url,
      startText,
      endText
    );
  }

  createFragmentLink(text: string) {
    const a = document.createElement("a");
    a.href = this.createFragmentURL(text);
    return a;
  }

  createFragmentLinkWithStartAndEnd(startText: string, endText: string) {
    const a = document.createElement("a");
    a.href = this.createFragmentURLWithStartAndEnd(startText, endText);
    return a;
  }
}
```

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
  document.body.scrollHeight,
  document.documentElement.scrollHeight,
  document.body.offsetHeight,
  document.documentElement.offsetHeight,
  document.body.clientHeight,
  document.documentElement.clientHeight
);
```

### Random HTML Elements

- `<abbr>`: inline element used for abbreviations. No inherent structure.
- `<address>`: block element used for addresses. No inherent structure.
- `<hgroup>`: block element container used to nest heading elements and other content inside it. No inherent structure.
- `<mark>`: inline element that highlights text
- `<samp>`: inline element that styles text like keyboard monospace font
- `<menu>`: semantically same as `<ul>`
- `<sub>`: inline element that styles text as a subscript
- `<sup>`: inline element that styles text as a superscript
- `<meter>`: used to show a progress bar that can change color depending on its current value:

```html
<label for="fuel">Fuel level:</label>

<!-- if value is above 80 then meter turns green, else yellow, below low is red -->
<meter id="fuel" min="0" max="100" low="33" high="66" optimum="80" value="90">
  at 50/100
</meter>
```

![](https://www.webpagescreenshot.info/image-url/ATHmXSTBD)

- `<object>`: element used for embedding data like images, pdfs, etc., and then styling it.

```html
<object
  type="application/pdf"
  data="/media/examples/In-CC0.pdf"
  width="250"
  height="200"
></object>
```



### Convert images using canvas

We can use the Canvas API to process images and even convert them into a different type on the frontend. 

Here are the steps:

1. Create a `FileReader` instance and read a blob as a data url 

```ts
const reader = new FileReader();
reader.readAsDataURL(imageBlob);
```

2. Listen to the `"load"` event on the file reader, which gets triggered when the reader fully loads the image as a data URL, and then create a new `Image` instance and set its src to the data url.

```ts
reader.addEventListener("load", (e) => {
	const dataUrl = e.target.result
	const image = new Image()
	// setting image src will trigger load event on image
	image.src = dataUrl
})
```

3. Once you set the image src, the `"load"` event on the `Image` instance will be triggered. Listen for that event in order to access raw data about the image.

```ts
image.addEventListener("load", () => {
	const originalImageWidth = image.naturalWidth
	const originalImageHeight = image.naturalHeight
})
```

4. You can create a canvas element to draw the image to the canvas, essentially resizing it how you want. You can then call the `canvas.toBlob()` method to convert the current drawing of the canvas to an image blob, supplying the mimetype as the second argument

```ts
image.addEventListener("load", () => {
	const originalImageWidth = image.naturalWidth
	const originalImageHeight = image.naturalHeight
	
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d")!;

	// resize image to half of size
	context.drawImage(image, 0, 0, w / 2, h / 2);

	// convert canvas drawing to blob
	canvas.toBlob((blob) => {
		if (blob) {
			downloadBlob(blob)
		} else {
			throw new Error("no blob")
		}
	})
})
```


```ts
// takes an image, width, height, mimetype, and converts it to the mimetype
// and resizes to specified size
async function convertImage({
  h,
  img,
  mimetype,
  w,
}: {
  img: HTMLImageElement;
  w: number;
  h: number;
  mimetype: string;
}) {
  // 1. create new canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  // 2. draw image
  context.drawImage(img, 0, 0, w, h);

  // 3. asynchronously convert current canvas drawing to blob with mimetype
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      return blob !== null ? resolve(blob) : reject("no blob");
    }, mimetype);
  });
}

// takes in a blob and reads it as a data url, returning HTMLImageElement
function loadImage(blob: Blob) {
  const reader = new FileReader();

  // Read the file
  reader.readAsDataURL(blob);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    reader.addEventListener("load", (e) => {
      const dataUrl = e.target!.result as string;
      const img = new Image();
      img.src = dataUrl;
      resolve(img);
    });

    reader.addEventListener("error", function () {
      reject();
    });
  });
}

// gets the original height and width of image
function getImageDimensions(img: HTMLImageElement) {
  return new Promise<{
    originalWidth: number;
    originalHeight: number;
  }>((resolve, reject) => {
    img.addEventListener("load", () => {
      resolve({
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
      });
    });
  });
}

async function convertImageToWebp(blob: Blob) {
  const img = await loadImage(blob);
  const { originalHeight, originalWidth } = await getImageDimensions(img);
  return await convertImage({
    h: originalHeight,
    w: originalWidth,
    img,
    mimetype: blob.type || "image/webp",
  });
}
```

**what did we learn?**

Here are the properties on an `Image` instance you can access:

- `image.naturalWidth`: the original width of the image
- `image.naturalHeight`: the original height of the image
## iFrames

This is how iframes look like in html:

```html
        <iframe
          title="fretboard-guesser"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          width="100%"
          height="254"
          class="object-contain w-full h-full"
          style="zoom: 0.8"
          id="fretboard-guesser"
          src="https://www.musictheory.net/exercises/fretboard"
        >
        </iframe>
```

- `loading=`: how to load the iframe
- `sandbox=`: security settings for iframe. By default the iframe is least privileged, so you need to explicitly allow unsafe settings like the ones below separated by spaces
	- `allow-scripts`: allows the embedded page to run scripts
	- `allow-same-origin`: allows the embedded page to have iframes that are of its same origin.
	- `allow-forms`: allow forms to be submitted
	- `allow-popups`: allows popups to be shown
	- `allow-popups-to-escape-sandbox`: allows popups to be shown outside of sandbox
- `src=`: the source for the iframe
- `allow=`: a list of web permissions the iframe is allowed to use, like camera, microphone.

### JavaScript

You can also access iframes through javascript:

```ts
class IFrameManager {
  constructor(public iFrame: HTMLIFrameElement) {}

  init() {
    return new Promise<void>((resolve, _) => {
      this.iFrame.onload = () => {
        resolve();
      };
    });
  }

  public get document() {
    return this.iFrame.contentDocument ?? this.window?.document;
  }

  public get window() {
    return this.iFrame.contentWindow;
  }

  sendToMainPage(message: any) {
    console.log("sending message to main page", this.window?.postMessage);
    this.window?.parent.postMessage(message, "*");
  }

  static onIframeMessage(cb: (event: MessageEvent) => void) {
    window.addEventListener("message", (event) => {
      cb(event);
    });
  }

  static onIframeMessageFromOrigin(origin: string, cb: (data: any) => void) {
    window.addEventListener("message", (event) => {
      if (event.origin === origin) {
        cb(event.data);
      }
    });
  }

 // only works if same origin iframe
  public silenceConsole() {
    if (!this.window) return;
    try {
      this.window.console.log = () => {};
      this.window.console.warn = () => {};
      this.window.console.error = () => {};
      const iframes = Array.from(
        this.window.document.getElementsByTagName("iframe")
      );
      for (const item of iframes) {
        if (!item.contentWindow) continue;
        item.contentWindow.console.log = () => {
          /* nop */
        };
        item.contentWindow.console.warn = () => {
          /* nop */
        };
        item.contentWindow.console.error = () => {
          /* nop */
        };
      }
    } catch (e) {
      console.error("security error");
      console.error(e);
    }
  }
}
```

You can access the content of iframes if they are the same origin, otherwise websites will set special headers to prevent XSS attacks. 

- `iframe.contentWindow`: returns the window of the iframe. Always accessible
- `iframe.contentDocument`: returns the document of the iframe, which allows you to access the DOM of the embedded site. 


> [!CAUTION] 
> The `iframe.contentDocument` property is only available if the iframe you are serving is from the same origin as your site. Otherwise you will get a `SecurityError` to prevent XSS attacks. Doing any DOM stuff with an embedded site is prohibited if not served from the same origin.

### Event listeners

Here are the events you can listen for on an iframe element: 

- `"load"`: when the iframe loads its content.
### Message Sending

The only thing you can do is post messages:

- `window.postMessage(data, origin)`: main page sends a message to the origin (iframe)
- `iframe.contentWindow.postMessage(data, origin)`: iframe sends message to specified origin
- `window.addEventListener('message' , e)`: listens to messages from iframes

## Content editable

The `contentEditable` attribute is extremely versatile and allows us to modify the content of elements in the page.

You can visit the `data:text/html, <html contenteditable>` url, which turns the entire webpage into a editable content surface.

## Selections

### Basic Selections

You can get the current selection using `document.getSelection()`, which will return a `Selection` object with a lot of properties, or `null` if there is nothing currently selected.

- To get the text from a selection, just call `selection.toString()`.
- You can listen for text selection by cheating a little and listening for the `"mouseup"` event on the document, and then query for a potentially null `document.getSelection()`.

```ts
export class SelectionManager {
  static getSelection() {
    const selection = document.getSelection();
    if (!selection) return "";
    return selection.toString();
  }

  static clearSelection() {
    document.getSelection()?.removeAllRanges();
  }

  static onSelect(
    callback: (selection: string, selectObject: Selection) => void
  ) {
    document.addEventListener("mouseup", () => {
      const selection = document.getSelection();
      if (!selection) return;
      callback(selection?.toString() || "", selection);
    });
  }
}
```

### Selections and ranges

#### Range basics

A `Range` object is a way of describing a range of the start position of the selection in some element and the end position of the selection in some element.

The start and end positions are determined by the number of elements in the node, also described as **offsets**.

![](https://javascript.info/article/selection-range/range-example-p-0-1.svg)

Ranges can range within the same element or across multiple different elements. Here is the most basic way to create a range:

```ts
const textNode = document.querySelector("p").firstChild;
// 1. create range
const range = new Range();
// 2. set start
range.setStart(textNode, 0);
// 3. set end
range.setEnd(textNode, 1);
```

- You can get the text or html content from a range with `range.toString()`.
- If you want to create a range over actual text content, you'll need to create a range over a text node, like using `element.firstChild` to access the text content if the element has text in it.

Here are the range methods that allows you to deal with content in the range:

- **`deleteContents()`**: Deletes the content within the range
- **`cloneContents()`**: Copies the content and returns them as a `DocumentFragment`
- **`insertNode(node)`**: Inserts a node at the range's start point.

Here are the the range properties:

- `range.commonAncestorContainer`: returns the common ancestor of the start container and end container nodes
- `range.startContainer`: returns the node in which the range starts
- `range.endContainer`: returns the node in which the range begins

Here are other useful range methods:

- `range.cloneRange()`: returns a copy of the range
- `range.isPointInRange(node, offset)`: returns a boolean whether or not the specified point is in the range.
- `range.selectNode(node)`: selects/highlights the entire node
- `range.selectNodContents(node)`: selects/highlights the entire contents of the node

#### Selection basics

Selections are composed of ranges and highlight/select all ranges associated with it. You can get the current selection with `document.getSelection()`.

Here are the instance properties you have on the `Selection` object:

- **`selection.anchorNode`**: The node where the selection starts.
- **`selection.focusNode`**: The node where the selection ends.
- **`selection.anchorOffset`**: The offset in the `anchorNode` where the selection starts.
- **`selection.focusOffset`**: The offset in the `focusNode` where the selection ends.
- **`selection.isCollapsed`**: Boolean indicating whether the selection is collapsed (i.e., no content is selected).
- `selection.direction`: returns the direct of the selection, which can either be let to right or right to left. This changes the focus nodes and anchor nodes.
- `selection.rangeCount`: returns the number of ranges in the selection

Here are the methods:

- **`selection.toString()`**: Returns the text of the current selection.
- **`selection.removeAllRanges()`**: Clears all selections.
  - You can also do `selection.empty()` to do the same thing
- **`selection.addRange(range)`**: Adds a `Range` object to the selection.
- **`selection.getRangeAt(index)`**: Retrieves a `Range` object from the selection.
- `selection.collapse()`: removes the selection, collapsing to just the caret

#### All together

```ts
export class SelectionManager {
  static getSelection() {
    const selection = document.getSelection();
    if (!selection) return "";
    return selection.toString();
  }

  static onSelect(
    callback: (selection: string, selectObject: Selection) => void
  ) {
    document.addEventListener("mouseup", () => {
      const selection = document.getSelection();
      if (!selection) return;
      callback(selection?.toString() || "", selection);
    });
  }

  static clearSelection() {
    document.getSelection()?.removeAllRanges();
  }

  static selectRange(range: Range) {
    document.getSelection()?.removeAllRanges();
    document.getSelection()?.addRange(range);
    return range.toString();
  }

  static createBasicRange(element: HTMLElement, start: number, end: number) {
    const range = new Range();
    range.setStart(element, start);
    range.setEnd(element, end);
    return range;
  }
}

export class RangeModel {
  range = new Range();

  selectElement(element: HTMLElement) {
    this.range.selectNodeContents(element);
  }

  setStart(node: Node, offset: number) {
    this.range.setStart(node, offset);
  }

  setEnd(node: Node, offset: number) {
    this.range.setEnd(node, offset);
  }

  getText() {
    return this.range.toString();
  }

  getContents() {
    return this.range.cloneContents();
  }

  deleteContents() {
    this.range.deleteContents();
  }
}
```

### Highlights

Highlights are a way of adding custom CSS styling to ranges of text and having that persist. It prevents having to manually add spans everywhere.

The main workflow of highlights is as follows:

1. Create ranges you want your highlight to highlight.
2. Create a `Highlight` object that takes in those ranges.
3. Register the highlight to the CSS highlight registry under a specific highlight name.
4. In your CSS, add specific styling for the `::highlight(highlight-name)` pseudoselector.

```ts
export class HighlightManager {
  static createHighlight(ranges: Range[], highlightName: string) {
    if (CSS.highlights.has(highlightName)) return;
    const highlight = new Highlight(...ranges);
    CSS.highlights.set(highlightName, highlight);
    return highlight;
  }

  static clearAllHighlights() {
    CSS.highlights.clear();
  }

  static deleteHighlight(highlightName: string) {
    return CSS.highlights.delete(highlightName);
  }
}
```

`CSS.highlights` is a map of type `<string, Highlight>` that stores all the information about the currently registered highlights in your app. Simply adding a highlight to this map will register your highlight in the highlight registry.

You create a new highlight like so - just pass in a bunch of range objects:

```ts
const highlight = new Highlight(...ranges);
```

Here is an example of highlight styling for the highlight with the name `"search-results"`. Keep in mind that the highlight will become active once registered.

```css
::highlight(search-results) {
  background-color: purple;
  color: white;
}
```
