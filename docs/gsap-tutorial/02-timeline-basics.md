# Timelines

## Timeline Basics

The gsap.timeline() returns a timeline object, and you can pass in an object of options into the timeline, with a way to set default properties.

```javascript
const timeline = gsap
  .timeline({ defaults: { duration: 2, ease: "back" } })
  .from("#demo", { opacity: 0 })
  .from("img", { yPercent: 100, opacity: 0, stagger: 0.1 });
```

You can specify any default properties that you want to apply to all animations in the timeline, using the `defaults` property.

After creating the timeline, you can chain a bunch of from() , to(), and fromTo() methods to create animations.

## Position parameter

In the last argument in all animation methods in a timeline, you can specify a delay, called the **position parameter**, which helps in choreographing and staggering movements.

You can have either an absolute delay or a relative delay:

- **absolute delay:** Simply putting a number there specifies the absolute delay in number of seconds, relative to when the timeline first started.
- **Relative delay:** There are three ways to specify relative delay, all of which are a string. Then after each, you can append a number to specify a delay amount.
  - **label:** You can pass in a label as the position parameter to apply.
  - `<` : a relative pointer to the start of the previous animation.
    - You can think of this as starting a tween at the same time as the previous tween, if using by itself as `"<"`. If you add a number after it, like `"<2"`, then it will start 2 seconds after the previous tween starts.
  - `>` : a relative pointer to the end of the previous animation.
    - You can think of this as how a timeline normally works, where one tween animates after another. If you add a number after it, like `">2"`, then it will start 2 seconds after the previous tween ends.
    - This is also the same thing as `"+="`, which is also a relative pointer to the end of the previous animation. `"+=2"` is the same things as `">2"`, giving the animation a 2 second delay after the previous one finishes.

```javascript
tl.to(".class", { x: 100 }, 3); // insert exactly 3 seconds from the start of the timeline
tl.to(".class", { x: 100 }, "someLabel"); // insert at the "someLabel" label
tl.to(".class", { x: 100 }, "someLabel+=2"); // insert 2 seconds after the "someLabel" label
tl.to(".class", { x: 100 }, "<"); // insert at the START of the  previous animation
tl.to(".class", { x: 100 }, "<2"); // insert 2 seconds after the previous animation starts
tl.to(".class", { x: 100 }, ">"); // insert at the END of the previous animation
```

## Timeline methods

- `timeline.add(tween)` : adds the specified tween object to the timeline, appending it.
  - `timeline.add(tween, label)` : adds the specified tween to the place in the timeline where the specified label is at.
- `timeline.duration()` : returns the duration of the timeline
- `timeline.isActive()` : returns whether the timeline is active or not
- `timeline.addLabel(label, pos?)` : adds a label to the timeline, which helps for referring to in relative positioning. The `pos` is a relative delay, like `<1`
- `timeline.timeScale(speed)` : changes the speed of a timeline, where 1 is 100% of the speed, and 2 is 200%, and 0 is 0%.
- `timeline.pause()` : pause the animation
- `timeline.resume()` : resume the animation
- `timeline.reverse()` : reverse the animation, and play it
- `timeline.play()` : play the animation
  - `timeline.play(label)` : play the animation from the specified label
- `timeline.restart()` : restart the animation
- `timeline.progress(percent)` : seeks to a position in the timeline, being passed in a `percent`, which is a number between 0-1, where 0 is the start of the animation, and 1 is the end of the animation.
