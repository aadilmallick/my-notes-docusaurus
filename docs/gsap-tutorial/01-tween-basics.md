# Tween basics

## Tween intro

A tween changes properties of a single object over time. This can be HTML elements form CSS Selectors, and also normal javascript objects.

You can create a tween of anything that has quantifiable properties as numbers.

## Settings defaults

Some default properties, like `duration`, is only 0.5 seconds. You can change this by setting the defaults.

These properties will then be applied across every tween by default.

```js
gsap.defaults({
  duration: 2,
  ease: "power2.inOut",
});
```

## Animation methods

You can pass essentially anything into a tweening method. This can be an HTML element, a CSS selector, or a javascript object.

All these methods return a `Tween` object that also has special properties you can control.

- `gsap.set(selector, animOptions)` : sets the default starting values for the animation. Useful for preventing having to abide by what you put in your CSS.
- `gsap.from(selector, animOptions)` : animates starting **from** the animation specifications you give, and then animates to the default properties set on the elements.
  - Think of it like reverse.
- `gsap.to(selector, animOptions)` : animates starting from the default properties, and then animates to the animation specs you give.
- `gsap.fromTo(selector, fromAnimOptions, toAnimOptions)` : animates starting **from** the starting specs, and then animates **to** the ending specs.

### animation options

The animation options you can pass in vary depending on what you selected, whether it was a CSS selector or a JavaScript object. But there are some special properties on every animation config that defines how the animation will behave:

#### properties

- `duration` : the animation duration in seconds, 0.5 seconds by default
- `delay` : the animation delay in seconds
- `ease` : the easing function. See [eases](https://greensock.com/docs/v3/Eases) for a list of details.
- `repeat` : how many times the animation should repeat. Default is 0, which means it will only play once.
  - `repeat: -1` : plays the animation infinitely
  - `repeat: 1` : repeats the animation once.
- `paused` : A boolean determining whether the animation should start paused or not. If true, the animation will start out as paused.
- `reversed` : if true, the animation will start out as reversed
- `stagger` : the stagger time in seconds for choreographing elements
- `yoyo` : a boolean value where if true, sets `animation-direction: alternate` .
- `yoyoEase` : the easing function of the reverse animation.
- `startAt` : an object of animation options, to define the starting values. For example, `startAt: {x: -100, opacity: 0}`

#### callbacks

- `onStart` : a function that runs when the animation starts
- `onUpdate` : a function that runs on every frame of the animation
- `onComplete` : a function that runs when the animation completes
- `onRepeat` : a function that runs when the animation repeats

## Tween class

Tweens are just an animation, and are what are returned from the gsap.set() , gsap.to(), gsap.from() , and gsap.fromTo() methods. You can then control the play state of the animation.

```javascript
const tween = gsap.from(".header", { yPercent: -100, ease: "bounce" });
tween.pause();
tween.seek(2);
tween.progress(0.5);
tween.play();
```

- `tween.pause()` : pause the animation
- `tween.resume()` : resume the animation
- `tween.reverse()` : reverse the animation, and play it
- `tween.play()` : play the animation
  - `tween.play(n)` : play the animation from n seconds in
- `tween.restart()` : restart the animation
- `tween.duration()` : gets the duration of the tween
- `tween.duration(seconds)` : sets the duration of the tween in seconds
- `tween.delay()` : gets the delay of the tween
- `tween.delay(seconds)` : sets the delay of the tween in seconds
- `tween.endTime()` : Returns the time at which the animation will finish according to the parent timeline's local time, in seconds.
- `tween.isActive()` : returns a boolean of whether or not the animation is currently playing.
- `tween.kill()` : immediately stop and kills the animation
- `tween.progress(percent)` : seeks to a position in the animation, being passed in a `percent`, which is a number between 0-1, where 0 is the start of the animation, and 1 is the end of the animation.

## Eases

WIth each tween, you can define an animation timing functions, which are combinations of **timings** and **easing functions**.

Eases are dfined using the `ease` property in the animation config object, which accepts a string corresponding to the easing function and the timing function.

```js
gsap.to(".box", { ease: "elastic" });
```

### Timing functions

Here are the three types of timing functions:

- **in** : the animation starts slow and speeds up. <u>Good for exits</u>
- **out** : the animation starts fast and slows down <u>Good for entrances</u>
- **inOut** : the animation starts slow, speeds up, and then slows down again

By default, all eases use an **out** timing. You can specify the timing function for the ease using this syntax:

```js
{
  ease: "easeName.timingFunction";
}
```

So a `elastic.inOut` would be an elastic ease with an inOut timing.

### Easing functions

- `power0` : complete linear
- `power1` : x^2
- `power2` : x^3
- `power3` : x^4
- `back` : overshoots the target value.
  - You can also configure the amount to overshoot by using it like a function, like `"back(6)"` , overshooting it 6 pixels.
- `elastic` : rubber band effect
- `bounce` : bounce effect

## Stagger

Staggering is a way to choreograph animations. You can stagger animations by using the `stagger` property in the animation config object.

When choreographing animations, stagger defines the amount of time to wait before starting the animation for each element in succession.

```js
gsap.to("img", {
  y: -100,
  stagger: 0.2
  duration: 3,
});
```

### Advancing staggering

We can change the configuration of our staggering, like defining the direction to stagger from, and the total staggering amount.

```javascript
gsap.to("img", {
  y: -100,
  stagger: {
    from: "edges",
    each: 0.2,
  },
  duration: 3,
});
```

- `from` : which elements to start the stagger from. `"start"` is default.
  - `"end"` : start from end, the last element
  - `"center"` : start from center elements and propagate outwards
  - `"edges"` : start from the edges, the beginning and end, and go to center.
- `each` : the stagger duration. You need this if not specifying amount.
- `amount` : the total amount of time for how long all the elements get to start their animation.
  - If `amount = 2` , then the last element will begin its tweening motion 2 seconds into the animation.

## transform origin

We can define transform origin either with keywords, or with two values representing the x and y coordinates of the origin. We can use standard CSS units to represent those values.

```javascript
transformOrigin: "center center";
transformOrigin: "50% 50%";
transformOrigin: "10px 40px";
```

The code below sets the transform origin to where you clicked on the element and then rotates around that point.

```javascript
const tween = gsap.to("#main-fred", {
  rotate: 360,
  duration: 1,
  paused: true,
});

document.querySelector("#main-fred").addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  gsap.set("#main-fred", { transformOrigin: `${x}px ${y}px` });
  tween.restart();
});
```

1. Create a tween, but make sure it starts paused so we can programatically start it later.
2. Listen to a click event, and we can get the coordinates of where they clicked on for transformOrigin by using the code below:

```javascript
const rect = e.target.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
```

3. Set the transform origin to the coordinates we got from the click event. Also restart the tween.

```javascript
gsap.set("#main-fred", { transformOrigin: `${x}px ${y}px` });
tween.restart();
```
