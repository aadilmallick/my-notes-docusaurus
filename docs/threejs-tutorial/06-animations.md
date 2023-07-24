---
title: "06: animations"
---

## requestAnimationFrame

We use `requestAnimationFrame` to create an infinite animation loop for each frame our computer can run, but the problem is that for computers with different frame rates, the animations will happen slower and faster depending on the computer.

So we need a way to standardize the time between each frame.

### Delta time approach

**Delta time** is the time between each frame, and we can use it to standardize animation speed.

```javascript
let time = Date.now();

function animate() {
  requestAnimationFrame(animate);

  let currentTime = Date.now();
  const deltaTime = currentTime - time;
  currentTime = time;

  blueCube.rotation.x += 0.001 * deltaTime;

  renderer.render(scene, camera);
}
```

For faster computers, delta time will be smaller, thus you rotate a smaller amount each frame. But since you have a higher fps, you rotate more times per second. In the end, it evens out.

Let's go through a basic example:

- A fast computer running at 90fps may have a delta time of 10ms, so it rotates $0.001 \times 10 = 0.01$ radians per frame. Times 90 frames, gets you $0.01 \times 90 = 0.9$ radians per second.
- A slow computer running at 30fps may have a delta time of 30ms, so it rotates $0.001 \times 30 = 0.03$ radians per frame. Times 30 frames, gets you $0.03 \times 30 = 0.9$ radians per second.

## Clock

The `Clock` class lets you have a standard for elapsed time that works like delta time, but in a slightly different way.

```javascript
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  blueCube.rotation.x = elapsedTime;

  renderer.render(scene, camera);
}
```

The `clock.getElapsedTime()` method returns the time in seconds since the clock started. Since this will become only bigger as time goes on, we should not use incrementing operators like `+=`, but instead only assign the value using elapsedTime.

### Constructor

```javascript
const clock = new THREE.Clock(((autoStart: Boolean) = true));
```

You pass in one argument to the constructor, which is `autoStart`, determining whether or not to start the clock automatically. The default value is true.

### Properties

- `clock.elapsedTime` : the time in seconds since the clock started
- `clock.oldTime` : the time in seconds since the clock was last reset, or since it started
- `clock.startTime` : the time in seconds since the clock was started using `clock.start()`
- `clock.running` : whether the clock is running or not

### Methods

- `clock.start()` : starts the clock
- `clock.stop()` : stops the clock
- `clock.getElapsedTime()` : returns the time in seconds since the clock started

## GSAP

Do not put any gsap methods in the `requestAnimationFrame` loop, because behind the hood, gsap already runs all of its animations in an `requestAnimationFrame` loop.

```javascript
gsap.to(blueCube.scale, {
  duration: 1,
  x: 2,
  y: 0.5,
  z: 0.5,
  repeat: -1,
  yoyo: true,
  ease: "back",
});
```
