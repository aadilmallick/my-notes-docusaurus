# 02: Canvas Basics

The first step is to resize the canvas to the window size.

```javascript
// * 1: get canvas context
const ctx = canvas.getContext("2d");

// *2: resize canvas to entire window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

## Canvas API

### Style
- `ctx.fillStyle` : gets/sets the fill color for fill operations
- `ctx.strokeStyle` : sets the color of outlining shapes on the canvas. Accepts a color property.
- `ctx.font` : the font style for text creation methods. Set this to a string
- `ctx.lineWidth` : sets the line width of the pen, the thickness of it. Accepts a number value.
```javascript
ctx.font = "30px Comic Sans MS";
ctx.fillStyle = "red";
ctx.textAlign = "center";
```

#### `lineCap` and `lineJoin`

![linecap and linejoin](https://learning.oreilly.com/api/v2/epubs/urn:orm:book:9781491952016/files/assets/js7e_1508.png)

When your line width gets above 2 pixels, the `lineCap` and `lineJoin` concepts come in handy to control how lines look and connect. 

- The `ctx.lineCap` property defines how the ends of a line look
- The `ctx.lineJoin` property defines how lines look when connecting to each other in a path.

The `ctx.lineCap` property can be these values: `"butt"`, `"square"`, `"round"`
The `ctx.lineJoin` property can be these values: `"miter"`, `"round"`, `"bevel"`
### Simple Shapes
- `ctx.fillRect(x, y, width, height)` : draws and fills a rectangle at the points.

### Paths
Drawing paths to the canvas involves beginning a path, moving to a starting point, drawing the path with methods, and then submitting the path to the canvas by stroking it or filling it.

1. You start a path with the `ctx.beginPath()` method. 
2. Then you instantiate a starting point with the `ctx.moveTo(x, y)` method, which moves the canvas cursor to a specific location. 
3. Then you start drawing lines with the `ctx.rect()`, `ctx.arc()`, and `ctx.lineTo()` methods to draw on the path.
4. Submit the path to the canvas for drawing or filling with the `ctx.stroke()` or `ctx.fill()` methods.
  
**methods**
- `ctx.rect(x, y, width, height)` : draws a rectangular path.
- `ctx.lineTo(x, y)` : draws a line to the specified point from its current position.
- `ctx.beginPath()` : begins drawing for stuff like circles. Need to execute this before drawing stuff like circles.
-  `ctx.closePath()` : closes the path by moving the canvas cursor back to the original position set by `moveTo()`.
- `ctx.arc(x, y, radius, radians)` : draws an arc around the specified center coordinates (x, y), with the specified `radius`, and for the amount of radians you specify.
- `ctx.stroke()` : end the path by stroking it.
- `ctx.fill()` : end the path by filling it.

### Drawing text
- `ctx.fillText(font, x, y)` : draws filled text on canvas at the specified center coordinates
- `ctx.strokeText(font, x, y)` : draws unfilled text on canvas at the specified center coordinates
### Drawing images
The `ctx.fillImage()` method is used to render images. The first argument will always be the image source, which should be an `Image` instance. 

- `ctx.fillImage(src, x, y, width, height)`: renders an image using the coordinates you pass as the top left coordinate of the image, with the width and height you want to the image to be. 
	- Aspect ratio is not preserved. 
- `ctx.fillImage(src, sx, sy, sw, sh, dx, dy, dw, dh)`: Renders a certain portion of the image using image cropping. Here is how to use the arguments: 
	- `sx`, `sy`, `sw`, and `sh` refer to the x, y, width, and height respectively of the source, which concerns the image dimensions. So these values refer to the part you want to crop out on the image
	- `sx`, `sy`, `sw`, and `sh` refer to the x, y, width, and height respectively of the destination, which concerns the coordinates and dimensions of the canvas. It's basically where you want to the render the cropped out image on the canvas. 

## Canvas performance 

The `canvas.width` and `canvas.height` properties aren't just used to size the canvas. They actually represent the number of bytes allocated to render graphics. 

Each pixel on the canvas uses 4 bytes of data. Thus a `canvas.width` of 100 and a `canvas.height` of 100 would use 40,000 bytes of data.

Here is the best technique to get the optimum image quality using a canvas: 
1. Size the canvas first using CSS `width` and `height` styles
2. In the js, set the `canvas.width` and `canvas.height` to your corresponding CSS values, but multiply by the pixel ratio to ensure crisp graphics on high-end devices, which you can get from `window.devicePixelRatio`.
## Canvas paint app

We will have a boolean flag for whether the user can draw or not, triggered by the `mousedown` and `mouseup` events. So even the user is holding the mouse down, they should be able to draw, and not able to draw otherwise.

- Then get the mouse coordinates on the canvas, and draw a line from the previous mouse coordinates to the current mouse coordinates.

```javascript
// set able to draw flag, update coordinates
canvas.addEventListener("mousedown", (e) => {
  [lastX, lastY] = [e.pageX, e.pageY];
  isDrawing = true;
});

// set not able to draw flag
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});
```

```javascript
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  // * draw line
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.pageX, e.pageY);
  ctx.stroke();

  // * update coordinates
  [lastX, lastY] = [e.pageX, e.pageY];
  hue += 1;
  ctx.strokeStyle = `hsl(${hue}, 75%, 50%)`;
});
```
