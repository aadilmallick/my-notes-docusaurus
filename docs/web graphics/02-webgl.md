## Basics

### WebGL initialization

- `canvas.height` and `canvas.width` represent the raster image resolution. You can set this to whatever you want.
- `canvas.clientHeight` and  `canvas.clientWidth` represent the actual dimensions of the html canvas

```ts
const canvas = document.querySelector("canvas")
const gl = canvas.getContext("webgl")!;

// set raster image resolution to HTML canvas width and height
const pixelRatio = window.devicePixelRatio || 1;
canvas.width = Math.floor(canvas.clientWidth * pixelRatio);
canvas.height = Math.floor(canvas.clientHeight * pixelRatio);

// 1. set viewport toi set webgl to cover entire canvas
gl.viewport(0, 0, canvas.width, canvas.height);

// 2. set clear color
gl.clearColor(1.0, 1.0, 1.0, 0.0);

// 3. set line width
gl.lineWidth(1.0);
```

- `gl.viewport(top, left, width, height)`: sets the viewport for the webgl context, meaning it designates the coordinate bounds.
- `gl.clearColor(r, g, b, a)`: sets the clear color
- `gl.lineWidth(width)`: sets line width when drawing lines between vertices. Minimum is 1.0

**pixel ratio**

Some devices have different DPRs, and the higher they are, the more pixels they use per pixel, meaning that they are higher resolution.

To account for this, we multiply the standard image resolution by the dpr so for higher DPRs, we create higher resolution images so that the quality is not lost when the device scales up the image, which happens on high DPR devices.

```ts
const pixelRatio = window.devicePixelRatio || 1;
canvas.width = Math.floor(canvas.clientWidth * pixelRatio);
canvas.height = Math.floor(canvas.clientHeight * pixelRatio);
```