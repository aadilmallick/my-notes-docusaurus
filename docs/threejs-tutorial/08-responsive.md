# 08: Responsivity

## Resize event

```javascript
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function onWindowResize() {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
}

window.addEventListener("resize", onWindowResize);
```

There are three steps for listening to a window resize event and ensuring responsivity for our threejs projects:

1. Get the new window size we want to use, or the new canvas size we want.
2. Update the camera's aspect ratio, and update its projection matrix.
3. Set the canvas size using the `renderer.setSize()` method.

When changing properties like `camera.aspect`, you need to update the webgl matrices associated with that property, using the `updateProjectionMatrix()` method.

## Pixel ratio

**Pixel ratio** is how many physical pixels you have per unit pixel. All devices started out with a pixel ratio of 1.

- Devices with a pixel ratio of 2 divide each pixel unit into 4 parts, meaning 4 times the number of original pixels.
- Devices with a pixel ratio of 3 divide each pixel unit into 9 parts, meaning 9 times the number of original pixels.

Beyond a pixel ratio of 2, there is essentially no difference in visual quality. It's just marketing. So we want to set a max pixel ratio of 2.

```javascript
const pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setPixelRatio(pixelRatio);
```

- You can get your device's pixel ratio using `window.devicePixelRatio`.
- We set the pixel ratio of our canvas with `renderer.setPixelRatio()`, which takes in a number to set as the pixel ratio.

## Fullscreen

We listen for the double click event, see if we are already in fullscreen, and if not, we request to make that element go full screen.

```javascript
window.addEventListener("dblclick", (e) => {
  const isFullscreen = Boolean(document.fullscreenElement);
  const canvas = renderer.domElement;
  if (!isFullscreen) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
```

- `document.fullscreenElement` : a property that returns the element that is currently in fullscreen mode. If there is no element in fullscreen mode, it returns `null`.
- `Element.requestFullscreen()` : a method that requests the element to be put into fullscreen mode.
- `document.exitFullscreen()` : a method that exits fullscreen mode.

## Full code

```javascript
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
});

window.addEventListener("dblclick", (e) => {
  const isFullscreen = Boolean(document.fullscreenElement);
  const canvas = renderer.domElement;

  // if not already fullscrenn, go fullscreen
  if (!isFullscreen) {
    canvas.requestFullscreen();
  }
  // if already fullscreen, exit fullscreen
  else {
    document.exitFullscreen();
  }
});
```

:::tip In a nutshell

:::
