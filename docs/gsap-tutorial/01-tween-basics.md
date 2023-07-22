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

## Tween methods

You can pass essentially anything into a tweening method. This can be an HTML element, a CSS selector, or a javascript object.

- `gsap.set(selector, animOptions)` : sets the default starting values for the animation. Useful for preventing having to abide by what you put in your CSS.
- `gsap.from(selector, animOptions)` : animates starting **from** the animation specifications you give, and then animates to the default properties set on the elements.
  - Think of it like reverse.
- `gsap.to(selector, animOptions)` : animates starting from the default properties, and then animates to the animation specs you give.
- `gsap.fromTo(selector, fromAnimOptions, toAnimOptions)` : animates starting **from** the starting specs, and then animates **to** the ending specs.

The animation options you can pass in vary depending on what you selected, whether it was a CSS selector or a JavaScript object. But there are some special properties on every animation config that defines how the animation will behave:

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
- `startAt` : an object of animation options, to define the starting values.

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
