# 02: Canvas 

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

#### Basic style

- `ctx.fillStyle` : gets/sets the fill color for fill operations
- `ctx.strokeStyle` : sets the color of outlining shapes on the canvas. Accepts a color property.
- `ctx.font` : the font style for text creation methods. Set this to a string
- `ctx.lineWidth` : sets the line width of the pen, the thickness of it. Accepts a number value.
- `ctx.globalAlpha`: sets the global opacity for all drawing methods. Accepts a value from 0 to 1.
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

**rectangles**

- `ctx.fillRect(x, y, width, height)` : draws and fills a rectangle at the points.


### Paths

#### Basic

Drawing paths to the canvas involves beginning a path, moving to a starting point, drawing the path with methods, and then submitting the path to the canvas by stroking it or filling it.

1. You start a path with the `ctx.beginPath()` method. 
2. Then you instantiate a starting point with the `ctx.moveTo(x, y)` method, which moves the canvas cursor to a specific location. 
3. Then you start drawing lines with the `ctx.rect()`, `ctx.arc()`, and `ctx.lineTo()` methods to draw on the path.
4. Submit the path to the canvas for drawing or filling with the `ctx.stroke()` or `ctx.fill()` methods.
  
**methods**

You use this method to begin the path:

- `ctx.beginPath()` : begins drawing for stuff like circles. Need to execute this before drawing stuff like circles.

These are the various path methods that you can use:

- `ctx.rect(x, y, width, height)` : draws a rectangular path.
- `ctx.lineTo(x, y)` : draws a line to the specified point from its current position.
- `ctx.arc(x, y, radius, radians)` : draws an arc around the specified center coordinates (x, y), with the specified `radius`, and for the amount of radians you specify.
	- The default direction is clockwise.
- `ctx.arcTo(x1, y1, x2, y2, radius)`: draws an arc from one point to the other.

You can then use these methods to close a path:

-  `ctx.closePath()` : closes the path and then moves canvas cursor back to the original position set by `moveTo()`.
- `ctx.stroke()` : end the path by stroking it.
- `ctx.fill()` : end the path by filling it.

```ts
let drawing = document.getElementById("drawing");
 
let context = drawing.getContext("2d");
 
// start the path
context.beginPath();
 
// draw outer circle
context.arc(100, 100, 99, 0, 2 * Math.PI, false);
 
// draw inner circle
context.moveTo(194, 100);
context.arc(100, 100, 94, 0, 2 * Math.PI, false);
 
// draw minute hand
context.moveTo(100, 100);
context.lineTo(100, 15);
 
// draw hour hand
context.moveTo(100, 100);
context.lineTo(35, 100);
 
// stroke the path
context.stroke();
```

#### `Path2D`

The `Path2D` class is used as an abstraction over creating paths with canvas, and even has interop with SVG paths. It has performance as its main benefit since it caches drawing.

Here is the basic way of constructing:

```ts
const path = new Path2D()
```

This automatically begins a path, and on a path object, you have access to all the path methods, like `path.arc()`, `path.lineTo()`, etc.

To close a path, you would use the `ctx.stroke()` or `ctx.fill()` methods and pass in the `Path2D` instance.

```ts
const rectangle = new Path2D();
rectangle.rect(10, 10, 50, 50);

const circle = new Path2D();
circle.arc(100, 35, 25, 0, 2 * Math.PI);

ctx.stroke(rectangle);
ctx.fill(circle);
```

You can also create paths by passing in an svg string of `<path />` syntax, which automatically begins and draws the path for you. You can then end the path by filling or stroking it.

```ts
const p = new Path2D("M10 10 h 80 v 80 h -80 Z");
```
### Drawing text

Use these methods to draw text to the canvas:

- `ctx.fillText(font, x, y)` : draws filled text on canvas at the specified center coordinates
- `ctx.strokeText(font, x, y)` : draws unfilled text on canvas at the specified center coordinates

Set these properties to change how text is drawn to the canvas:

- `ctx.font`: sets the font family and size of the font, like `"20px Bangers"`.

### Drawing shadows

To draw shadows, use these properties: 

- `ctx.shadowColor`—The CSS color in which the shadow should be drawn. The default is black.
- `ctx.shadowOffsetX`—The x-coordinate offset from the x-coordinate of the shape or path. The default is 0.
- `ctx.shadowOffsetY`—The y-coordinate offset from the y-coordinate of the shape or path. The default is 0.
- `ctx.shadowBlur`—The number of pixels to blur. If set to 0, the shadow has no blur. The default is 0.

```ts
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgb(0 0 0 / 50%)"
```
### Drawing gradients

#### Linear Gradient

Here are the steps to draw gradients: 

1. Create a gradient with `context.createLinearGradient()` method. 
	- The 4 arguments you need to pass into this method are the x and y coordinates for the top left point of the gradient, and the x and y coordinates for the bottom right point of the gradient. 
```ts
const gradient = context.createLinearGradient(start_x, start_y, end_x, end_y);
```
2. Add color stops between 0 and 1 using the `gradient.addColorStop(ratio, color)` method, that adds a specific color stop at the specified percentage point in the gradient. 
```js
gradient.addColorStop(0, "white");
gradient.addColorStop(0.5, "gray");
gradient.addColorStop(1, "black");
```
3. Set the fill style of the canvas context to the gradient
```js
context.fillStyle = gradient
```
4. Draw shapes and see how the gradient appears!



```ts
// 1. create gradient
let gradient = context.createLinearGradient(30, 30, 70, 70);
gradient.addColorStop(0, "white");
gradient.addColorStop(0.5, "gray");
gradient.addColorStop(1, "black");

// 2. set fill style to gradient
context.fillStyle = gradient

// 3. draw shapes with exact coordinates as gradient
context.fillRect(30, 30, 70, 70)
```

Here is a simple utility function to draw gradients on rectangles: 

```ts
function createRectLinearGradient(context, x, y, width, height) {
  return context.createLinearGradient(x, y, x+width, y+height);
}

let gradient = createRectLinearGradient(context, 30, 30, 50, 50);
gradient.addColorStop(0, "white");
gradient.addColorStop(1, "black");
// draw a gradient rectangle
context.fillStyle = gradient;
context.fillRect(30, 30, 50, 50);
```

#### Radial Gradient

The arguments for the `context.createRadialGradient()` method are as follows: 
- The first three arguments are the x, y, and radius respectively for the starting circle. 
- The last three arguments are the x, y, and radius respectively for the ending circle. 

```ts
let gradient = context.createRadialGradient(55, 55, 10, 55, 55, 30);
gradient.addColorStop(0, "white");
gradient.addColorStop(1, "black");
// draw a red rectangle
context.fillStyle = "#ff0000";
context.fillRect(10, 10, 50, 50);
// draw a gradient rectangle
context.fillStyle = gradient;
context.fillRect(30, 30, 50, 50);
```

```ts
const radGrad4 = ctx.createRadialGradient(0, 150, 50, 0, 140, 90);
  radGrad4.addColorStop(0, "#F4F201");
  radGrad4.addColorStop(0.8, "#E4C700");
  radGrad4.addColorStop(1, "rgb(228 199 0 / 0%)");
```

### Images
#### Drawing images

The `ctx.drawImage()` method is used to render images. The first argument will always be the image source, which should be an `Image` instance. 

- `ctx.drawImage(src, x, y, width, height)`: renders an image using the coordinates you pass as the top left coordinate of the image, with the width and height you want to the image to be. 
	- Aspect ratio is not preserved. 
- `ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh)`: Renders a certain portion of the image using image cropping. Here is how to use the arguments: 
	- `sx`, `sy`, `sw`, and `sh` refer to the x, y, width, and height respectively of the source, which concerns the image dimensions. So these values refer to the part you want to crop out on the image
	- `sx`, `sy`, `sw`, and `sh` refer to the x, y, width, and height respectively of the destination, which concerns the coordinates and dimensions of the canvas. It's basically where you want to the render the cropped out image on the canvas. 

#### Accessing image data from canvas

```javascript
ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
```

THe `ctx.getImageData()` method returns an `ImageData` instance, and on the `ImageData.data` property, you get a byte array of the rgba color values for each pixel in the image.

Every 4 consecutive elements in the array refers to the rgba values, respectively, of a single pixel in the image.

These are the properties returned by the `ImageData` instance:

- `imageData.width` - the width of the image in pixels
- `imageData.height` - the height of the image in pixels
- `imageData.data` - a byte array of the rgba values for each pixel in the image

This is a standard way of looping through the image data byte array and accessing/manipulating those rgba values:

```javascript
for (let i = 0; i < imageData.data.length; i += 4) {
  const red = imageData.data[i];
  const green = imageData.data[i + 1];
  const blue = imageData.data[i + 2];
  const alpha = imageData.data[i + 3];
}
```

After manipulating the image data, you can modify how the image is drawn on canvas by using the `ctx.putImageData(ImageData, x, y)` method, which just takes in an image data instance.

```javascript
ctx.putImageData(imageData, x, y);
ctx.putImageData(imageData, 0, 0);
```

You can manipulate those pixels to do something like a grayscale effect:

A grayscale effect involves taking adding all the rgb values for a single pixel, and then dividing by three, getting the average color. You then set that average for all three components to make the pixel gray, but varying in intensity.

```javascript
function grayscale() {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  // 1. get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const average =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = average;
    imageData.data[i + 1] = average;
    imageData.data[i + 2] = average;
  }

  ctx.putImageData(imageData, 0, 0);
}
```


#### saving canvas as an image

Use the `ctx.toDataURL()` method to save what the current canvas looks like as a base 64 image string (by default PNG). You can then do stuff like save the base64 string as a file. 

```ts
let drawing = document.getElementById("drawing");
 
// get data URI of the image
let imgURI = ctx.toDataURL("image/png");
 
// display the image
let image = document.createElement("img");
image.src = imgURI;
document.body.appendChild(image);
```

#### Image quality on canvas

You have these two properties to change image smoothing quality when drawing images to the canvas:

- `ctx.imageSmoothingEnabled`: whether to enable image smoothing (making images fuzzy) or not. By default, this is enabled,
- `ctx.imageSmoothingQuality`: the quality of the image to set

```ts
context.imageSmoothingEnabled = false;
context.imageSmoothingQuality = "high";
```
## Canvas performance 

The `canvas.width` and `canvas.height` properties aren't just used to size the canvas. They actually represent the number of bytes allocated to render graphics. 

Each pixel on the canvas uses 4 bytes of data. Thus a `canvas.width` of 100 and a `canvas.height` of 100 would use 40,000 bytes of data.

Here is the best technique to get the optimum image quality using a canvas: 
1. Size the canvas first using CSS `width` and `height` styles
2. In the js, set the `canvas.width` and `canvas.height` to your corresponding CSS values, but multiply by the pixel ratio to ensure crisp graphics on high-end devices, which you can get from `window.devicePixelRatio`.

## Canvas animations

### `requestAnimationFrame()`

The `requestAnimationFrame()` method is used to run some code every frame. An example is as follows: 

```ts
function updateProgress() {
  var div = document.getElementById("status");
  div.style.width = (parseInt(div.style.width, 10) + 5) + "%";
  if (div.style.left != "100%") {
	  // you need to call requestAnimationFrame() again to run on every frame
	  requestAnimationFrame(updateProgress);
  }
}

requestAnimationFrame(updateProgress);
```

The `requestAnimationFrame()` method returns an id, which you can use to cancel the recursive frames with the `cancelAnimationFrame(requestID)` method. 

```ts
let requestID = window.requestAnimationFrame(() => {
  console.log('Repaint!');
});
window.cancelAnimationFrame(requestID);
```
## Canvas Examples

### Canvas Paint App

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

