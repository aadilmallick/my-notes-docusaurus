# Animations

## Intro animations

### Timing functions

- `ease-out` : starts fast, ends slow. Good for enter animations, like a modal appearing.
- `ease-in` : starts slow, ends fast. Good for exit animations, like a modal disappearing.
- `ease-in-out` : symmetrical easing animation
- `ease` : default easing function, assymmetrical. Use this for most animations

### will-change

Use the `will-change` property to tell the browser that an element will change in the future. This will allow the browser to optimize the rendering of the element.

Here are the numerous benefits:

- Uses hardware-acceleration to optimize animations and make them smoother.

```css
.element {
  /* says that the transform property will be animated, so optimize for it */
  will-change: transform;
}
```

### Transforms

#### Translate

The `transform: translate()` function is especially powerful because you can use percentages.

100% is relative to an element's size, so `transform: translateX(100%)` will move an element to the right by its width in px.

```css
.element {
  /* if an element is 500px wide, move it to right 500px */
  transform: translateX(100%);
}
```

### Animation accessibility

Use the media query below for accessible animations

```css
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
```

And here is a react hook to get the value in javascript

```tsx
const QUERY = "(prefers-reduced-motion: no-preference)";
const getInitialState = () => !window.matchMedia(QUERY).matches;
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    React.useState(getInitialState);
  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    const listener = (event) => {
      setPrefersReducedMotion(!event.matches);
    };
    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, []);
  return prefersReducedMotion;
}
```

## Practical Web Animations

### Button Background Swipe


These animations involve using the `::before` psuedoselector to create an element that will slide over the button on hover.

We variate how the overlay is shaped, and where it spawns.

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


### Border Gradients

Using pseudoelements and a conic gradient, we can animate the border gradient going around an element by animating the angle of a conic gradient. 
#### Basic glow

1. Create a container element that has `position: relative` since we need that to absolutely position the pseudoelements.
2. Create pseudoelements using `::before` and `::after` that are the same size as the container, add some padding so that they are slightly bigger, move them behind the container, and then center them on the container so they form a halo.
```css
.card::after, .card::before{
  content: '';
  /* 1. Make same size and center */
  position: absolute;
  height: 100%;
  width: 100%;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  /* 2. Move behind container */
  z-index: -1;
  /* 3. Add padding to make bigger than container and poke out from behind */
  padding: 3px;
  border-radius: 10px;
}
```
3. Apply a conic gradient on both pseudoelements. 
```css
.card::after, .card::before{
  background-image: conic-gradient(from 0deg, #ff4545, #ff0095, #ff4545);
}
```
4. On one of the pseudoelements, add a blur filter so that it produces more of a glow effect.
```css
.card::before{
  filter: blur(1.5rem);
  opacity: 1; /* decrease opacity if you want to reduce glow */
}
```

```css
/* 1. relative positioned container */
.card{
  margin: 0 auto;
  padding: 2em;
  width: 300px;
  background: #1c1f2b;
  text-align: center;
  border-radius: 10px;
  position: relative;
}

.card::after, .card::before{
  content: '';
  position: absolute;
  height: 100%;
  width: 100%;
  background-image: conic-gradient(from 0deg, #ff4545, #00ff99, #006aff, #ff0095, #ff4545);
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  z-index: -1;
  padding: 3px;
  border-radius: 10px;
  animation: 3s spin linear infinite;
}

.card::before{
  filter: blur(1.5rem);
  opacity: 1; /* decrease opacity if you want to reduce glow */
}
```


> [!NOTE] Color Stop Tip
> The last color in the color stop should always be the same the same as the first color in order to ensure a smooth transition.

#### Animating normally

To animate the border going around the container, we need to animate the angle of the conic gradient. You might think to do this by animating a CSS variable, which you can do only through JavaScript, but a native CSS way of doing it is using the `@property` syntax.

1. Declare that you want to create an animatable CSS property named `--angle`
```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```
2. Use that degree as the starting angle in the conic gradient
```css
.card::after,
.card::before {
  background-image: conic-gradient(
    from var(--angle),
    #ff4545,
    #00ff99,
    #006aff,
    #ff0095,
    #ff4545
  );
}
```
3. Create a keyframes animation that animates the animatable property and apply that animation on the pseudoelements
```css
@keyframes spin {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
}

.card::after,
.card::before {
  animation: 3s spin linear infinite;
  background-image: conic-gradient(
    from var(--angle),
    #ff4545,
    #00ff99,
    #006aff,
    #ff0095,
    #ff4545
  );
}
```

```css
.card {
  margin: 0 auto;
  padding: 2em;
  width: 300px;
  background: #1c1f2b;
  text-align: center;
  border-radius: 0.5rem;
  position: relative;
  transition: 0.3s background-color;
}

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.card::after,
.card::before {
  content: "";
  position: absolute;
  height: 100%;
  width: 100%;
  background-image: conic-gradient(
    from var(--angle),
    #ff4545,
    #00ff99,
    #006aff,
    #ff0095,
    #ff4545
  );

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0.25rem;
  z-index: -1;
  border-radius: 0.5rem;
  animation: 3s spin linear infinite;
}
.card::before {
  filter: blur(1.5rem);
  opacity: 0.5;
}
@keyframes spin {
  from {
    --angle: 0deg;
  }
  to {
    --angle: 360deg;
  }
}
```

#### Animating with transparency

For the illusion of a ray racing around the button, we can add the `transparent` color to the conic gradient and play around with color stops. 

```ts
  background-image: conic-gradient(
    from var(--angle),
    transparent 70%,
    blue,
    transparent
  );
```

#### Full Solution

Here is a pure CSS Solution, where we use the experimental `@property` syntax to animate CSS Variables since you can't do that by default.

```css
.card{
  position: relative;
}

/* for animating CSS variables */
@property --angle{
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.card::after, .card::before{
  content: '';
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: -1;
  padding: 3px;
  background-image: conic-gradient(from var(--angle), #ff4545, #00ff99, #006aff, #ff0095, #ff4545);
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  border-radius: 10px;
  animation: 3s spin linear infinite;
}
.card::before{
  filter: blur(1.5rem);
  opacity: 0.5;
}
@keyframes spin{
  from{
    --angle: 0deg;
  }
  to{
    --angle: 360deg;
  }
}
```
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

#### Image Tint

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
