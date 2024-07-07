# Animations

## Practical Web Animations

### Button Background Swipe

These animations involve using the `::before` psuedoselector to create an element that will slide over the button on hover.

We variate how the overlay is shaped, and where it spawns.

#### Normal

1. Set `overflow: hidden` : this is essential to hide the before psuedoelement that we translate out of view with `transform: translateX(-100%)`
2. Create psuedoelement: Create this pseudelement that is the same size as the button, and translate it out of view

**On Hover:**

Create transition for `transform` and `color` properties

- Translate psuedoelement back into view with `transform: translateX(0)`
- Change text color of button

```scss
$button-bg-color: #3ba6d8;
$button-text-color: white;

.bg-swipe {
  // 1. apply basic button styles
  padding: 0.75rem 2rem;
  cursor: pointer;
  border: none;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 0.5rem;
  background-color: $button-bg-color;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  color: $button-text-color;

  // 2. Set relative positioning and set z-index to 1
  position: relative;
  z-index: 1;
  transition: color 0.5s ease;

  // 3. Essential: set overflow hidden to hide before psuedoelement
  overflow: hidden;

  // 4. Create before psuedoelement that starts outside of view
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $button-text-color;
    z-index: -1;
    transition: transform 0.5s ease;
    transform: translateX(-100%);
  }

  &:hover::before {
    transform: translateX(0);
  }

  &:hover {
    color: $button-bg-color;
  }
}
```

#### From center

The important thing from when creating a bg swipe from center is to realize that we must horizontally center the psuedoelement and change transform origin.

1. Center Element: this can be achieved by setting `left: 50%` and then keeping the `transform: translateX(-50%)`property. This will center the psuedoelement
2. Transform Origin: set transform origin to center.

Then we simply transition over the horizontal scale, from `scaleX(0)` to `scaleX(1)`

```scss
.bg-swipe-center {
  &::before {
    top: 0;
    left: 50%;
    transform-origin: center center;
    // top 0, left 50%, and translateX(-50%) will center the element horizontally
    transform: translateX(-50%) scaleX(0);
  }
  &:hover::before {
    transform: translateX(-50%) scaleX(1);
  }
}
```

#### Skew from center

Same exact idea as center but we also `skewX(-30deg)` for an even cooler animation.

```scss
.bg-swipe-skew {
  &::before {
    top: 0;
    left: 50%;
    transform-origin: center center;

    transform: translateX(-50%) scaleX(0) skewX(-30deg);
  }

  &:hover::before {
    transform: translateX(-50%) scaleX(1.5) skewX(-30deg);
  }
}
```

### Button Scroll

### Image Animations

All of these image animation require an image container. What all of these effects have in common is setting `overflow: hidden` and animating opacity or transform.

#### Image Overlay

We make a hidden before psuedoelement that has a semi-transparent black background to act as an overlay.

1. Set overflow to hidden and translate overlay out of view to hide the overlay
2. On hover, translate the overlay from left to right

```html
<div class="overlay">
  <img src="gojo.png" alt="" id="gojo" />
</div>
```

```scss
.overlay {
  // essential properties
  position: relative;
  overflow: hidden;

  // 1. create overlay
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    // 2. translate out of view
    transition: transform 0.5s ease;
    transform: translateX(-100%);
  }
  // 3. translate into view on hover
  &:hover::before {
    transform: translateX(0);
  }
}
```

#### Image Zoom

We set overflow to hidden on image container, and on hover, we scale the image nested inside up to create this zoom effect

```html
<div class="zoom">
  <img src="gojo.png" alt="" id="gojo" />
</div>
```

```scss
.zoom {
  overflow: hidden;
  &:hover img {
    transform: scale(1.1);
  }

  img {
    transition: transform 0.5s ease;
  }
}
```

#### Image Tinit

1. Add a background color to the image container
2. On hover, reduce image opacity so some the background color bleeds on top of image, creating tint effect.

```html
<div class="tint">
  <img src="gojo.png" alt="" id="gojo" />
</div>
```

```scss
.tint {
  overflow: hidden;
  background-color: royalblue;
  &:hover img {
    opacity: 0.8;
  }

  img {
    transition: opacity 0.5s ease;
  }
}
```

### Hamburger menu animation

## Web Animations API

The new JavaScript Web Animations API is a way of programatically using CSS animations and transitions with stuff like keyframes

### Keyframes and basic animation

You can animate an element with the `HTMLElement.animate()` method. This method takes two arguments: an array of keyframes as `Keyframes[]` and an options object of `KeyframeAnimationOptions`.

```js
element.animate(keyframes, options);
```

```ts
// 1. Provide keyframes. Split percentage evenly between number of objects
const keyframes: Keyframe[] = [
  { transform: "translateX(15rem)" },
  { transform: "translateX(-15rem)" },
];

// 2. Provide animation options
const animationOptions: KeyframeAnimationOptions = {
  duration: 5000,
  iterations: Infinity,
  easing: "ease-in-out",
  direction: "alternate",
  fill: "both",
  delay: 1000,
  playbackRate: 3,
};

const animation = ball.animate(keyframes, animationOptions);
```

But besides this basic way, there are three other ways of doing Keyframe animations:

#### 1. Using `offset`

```ts
const keyframes: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(15rem)", offset: 0.25 },
  { transform: "translateX(-15rem)", offset: 0.5 },
  { transform: "translateX(0)" },
];
```

The default behavior of the `HTMLElement.animate()` method is to evenly distribute the keyframes across the animation duration. But you can use the `offset` property to specify the exact percentage point of each keyframe.

#### 2. Specifying properties instead

```ts
const keyframes: PropertyIndexedKeyframes = {
  opacity: [1, 0.5, 1],
  transform: [
    "translateX(0)",
    "translateX(15rem)",
    "translateX(-15rem)",
    "translateX(0)",
  ],
};
```

In this approach, we use the `PropertyIndexedKeyframes` type, which is an object where the keys are the properties to animate, and the values are the keyframes for that property, spread evenly.

#### 3. Implicit to

If you supply only one keyframe, JS will recognize that as the desired ending state of your animation, or the properties that will be animated _to_.

```ts
// animation to fade out right.
const animation = toast.element.animate(
  [{ opacity: 0, transform: "translateX(250px)" }],
  {
    duration: 250,
  }
);
```

### Controlling animation playback

The `Element.animate()` method returns an `Animation` object instance, which can be used to control the playback of the animation.

Here are useful methods:

- `Animation.play()` : Starts or resumes the animation sequence playback
- `Animation.pause()` : Pauses the animation sequence playback
- `Animation.reverse()` : Reverses the animation sequence playback
- `Animation.finish()` : Jumps to the end of the animation sequence
- `Animation.cancel()` : Cancels the animation sequence
- `Animation.updatePlaybackRate(n)` : Updates the playback rate of the animation sequence to the passed in number, where 1 is normal speed. Negative numbers will reverse the animation.

And here are some useful properties:

- `Animation.playState` : Returns the current playback state of an animation
- `Animation.currentTime` : Gets or sets the current time value of an animation
- `Animation.startTime` : Gets or sets the start time value of an animation
- `Animation.playbackRate` : Gets or sets the playback rate of an animation. 1 is normal speed. Negative numbers will reverse the animation.

Here are some events you can listen to on the animation using the `addEventListener()` method:

- `"cancel"` : Fired when the animation is cancelled
- `"finish"` : Fired when the animation finishes

### Better fill mode

There are some problems with the `animation-fill-mode` property, where it is not only inefficient and expensive to use, but also confusing because of CSS cascading.

The `Animation.commitStyles()` method can be used to apply the styles of the animation to the element before the animation runs. This is useful for animations that have a `fill` value of `both` or `forwards`.

```

```
