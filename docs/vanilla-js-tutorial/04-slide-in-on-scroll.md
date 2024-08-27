# 04: Intersection Observer: slide in on scroll

The Intersection Observer API is used to observe elements, where we see whether they are in the viewport or not.

When observed elements enter and leave the viewport, we can do stuff like add classes, lazy load, and more.

But with the intersection observer API, you can listen for when observed elements enter and exit the viewport.

## Observer basics

### Creating the Observer

```javascript
const observer = new IntersectionObserver((entries) => {
  // code here to run when the element is in the viewport or not
});
```

You create an observer by calling the `IntersectionObserver` constructor, and passing in a callback function.

This callback function accepts an `entries` parameter, which is basically an array of objects called `IntersectionObserverEntry` that contain information about the observed elements.

### `IntersectionObserverEntry`

Here are some of the properties of the `IntersectionObserverEntry` object:

- `isIntersecting`: a boolean that tells us whether the observed element is in the viewport or not
- `target`: the observed element, returns HTMLElement.
- `intersectionRatio`: a number between 0 and 1 that tells us how much of the observed element is in the viewport. 0 means none of the element is in the viewport, and 1 means the entire element is visible in the viewport.

### Observing and Unobserving an Element

The intersection observer will only listen for element-viewport intersections when you tell it to observe an element.

```javascript
observer.observe(element);
```

Similarly, you can stop listening for intersection by calling the `observer.unobserve()` method.

```javascript
observer.unobserve(element);
```

### Basic example

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("slide-in", entry.isIntersecting);
  });
});

const cards = document.querySelectorAll < HTMLDivElement > ".card";

cards.forEach((card) => {
  observer.observe(card);
});
```

## Observation options

There are options we can tweak to make the animations better. By default, the observer triggers as soon as the first pixel of the observed element enters the viewport, which may not be what we want.

We can change how far away from the viewport the observer triggers by passing in an options object as the second parameter to the `IntersectionObserver` constructor.

```javascript
const observer = new IntersectionObserver((entries) => {}, {
  threshold: 0.5,
  rootMargin: "100px",
});
```

- `threshold`: a number between 0 and 1 that tells us how much of the observed element must be in the viewport before the observer triggers. 0 means 0% of the element is in the viewport, like it and 1 means the entire element, 100% of is visible in the viewport.
- `rootMargin`: a string that tells the observer how far away from the viewport to trigger. It can be a px value, or a percentage value. For example, if you set it to 100px, the observer will trigger when the observed element is 100px away from the viewport.
  - This can be useful for lazy loading, since we might want to load stuff a while before the user scrolls down.

## Unobserving example

```javascript
import "./style.scss";

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("slide-in", entry.isIntersecting);
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 1,
  }
);

const cards = document.querySelectorAll < HTMLDivElement > ".card";

cards.forEach((card) => {
  observer.observe(card);
});
```

## Basic example

```ts
const boxes = document.querySelectorAll(".box");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(
    (entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show");
      }
    },
    { threshold: 0.5 }
  );
});

boxes.forEach((box) => {
  observer.observe(box);
});
```