# 02: Canvas Basics

The first step is to resize the canvas to the window size.

```javascript
// * 1: get canvas context
const ctx = canvas.getContext("2d");

// *2: resize canvas to entire window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

## How to let user draw to the canvas

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
