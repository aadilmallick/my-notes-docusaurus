# Hover effects with GSAP

## Basic hover

```javascript
const button = document.querySelector("button")!;

const tween = gsap.to("button", {
  scale: 2,
  duration: 1,
  x: 200,
  paused: true,
});

button.addEventListener("mouseenter", () => {
  tween.play();
});

button.addEventListener("mouseleave", () => {
  tween.reverse();
});
```

There are three steps to creating hover animations with GSAP:

1. Create your tween or timeline in an initial paused state
2. Add an event listener for the `mouseenter` event, and play the animation with the `play()` method
3. Add an event listener for the `mouseleave` event, and reverse the animation with the `reverse()` method

## Scale effects

When doing animations with scale, we need to keep in mind that scaling up an element will make it pixelated, so we need to make a few optimizations to take care of that issue:

- Use the `willChange` css property for better performance
- Make sure to scale up to the original size. Initially scale down the element, and then scale it back up with `scale(1)`, back to the original size to avoid pixelation.
- Set the `transformOrigin` to the center of the element, so that it scales from the center.

### willChange

The `willChange` css property allows for optimizations with performance by telling the browser that the selected elements will be animated, so prepare for it.

This helps avoid things like text jitters.

```scss
.element {
  will-change: transform;
  transition: ; //..
}
```

## Remove flash of unstyled content

In your css, set the `visibility` of the elements you want to animate to be `hidden`. And then toggle back the visibility to `visible` in your javascript.

```scss
.element {
  visibility: hidden;
}
```

YOu could also set the `autoAlpha` property in your GSAP tweens, which toggles the visibility back to `visible` and sets the starting opacity.

- `autoAlpha: 0` : sets `visibility: visible` and animates opacity from 0 to 1

```javascript
gsap.timeline(".element", {
  autoAlpha: 0,
  // ...
});
```
