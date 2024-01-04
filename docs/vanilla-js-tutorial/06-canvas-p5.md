# Canvas with P5

## Setup

The easiest way to get set up is using the p5 cdn, but if you want intellisense and other features, you can use the npm package.

### NPM

1. `npm i p5`
2. `npm i -D @types/p5`

Then you can setup the animation loop and canvas like so:

```javascript
import p5 from "p5";

const p5Manager = new p5((p: p5) => {
  // 1. runs first before setup(), use to download files
  p.preload = () => {};
  // 2. runs once before draw(), use to initialize variables and setup canvas
  p.setup = () => {
    p.createCanvas(400, 400);
  };
  // 3. draw() runs each frame, use to update variables and draw to canvas
  p.draw = () => {
    p.background(220);
  };
});
```

There are three special functions that p5 understands and automatically creates a game loop from that. In these methods, do the canvas setup and call other p5 specific methods to draw to the canvas.

- `preload()` : runs first before `setup()`, use to download files
- `setup()` : runs once before `draw()`, use to initialize variables and setup canvas
- `draw()` : runs each frame, use to update variables and draw to canvas. The code inside this function runs each frame.

### CDN

Use the p5 CDN:

```html
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.8.0/p5.min.js"
  integrity="sha512-pgK6Wo8doipc/IPQ0ilH3b47ww01345nR9ud1/6Qp0n+lQlEW9zuw6JhysRcUpBY4yKuVZjn1MAkDxbnncuGsQ=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
```

All p5 methods and variables are now added to the global scope. You get no intellisense, but development is easier. Here is how the setup looks like:

```javascript
function setup() {
  // create canvas, initialize variables
  createCanvas(400, 400);
}

function draw() {
  // animation loop code
  background(220);
}
```

## P5 special methods

P5 has special methods that when implemented, p5 will recognize them immediately as a part of the framework. For example, any function you name `draw()` will draw to the canvas every frame. No need for an animation loop.

If you're using p5 with npm, you don't have to describe these functions globally but rather on the p5 instance.

### Basic special methods

- `preload()` : runs first before `setup()`, use to download files
- `setup()` : runs once before `draw()`, use to initialize variables and setup canvas
- `draw()` : runs each frame, use to update variables and draw to canvas. The code inside this function runs each frame.

### Event methods

These are methods that p5 uses to hijack the original DOM events listeners. You can insert your own callback and run code to execute when these events are triggered:

- `mousePressed(() => {})` : runs when the mouse is pressed, when the user clicks
- `mouseReleased(() => {})` : runs when the mouse is released
- `mouseDragged(() => {})` : runs when the mouse is dragged, when the user holds down the mouse and drags across the screen.


## P5 methods and properties

In our npm setup, these are all the things we have available on the `p` variable:

### Properties

These are builtin properties that you can access on the `p5` instance.

**Canvas** properties:

- `width` : the canvas width
- `height` : the canvas height

**Dom** related properties:

- `mouseIsPressed` : boolean, true if the user is holding down the click button
- `mouseX` : the x coordinate of the mouse
- `mouseY` : the y coordinate of the mouse
- `pmouseX` : the previous x coordinate of the mouse (the last frame)
- `pmouseY` : the previous y coordinate of the mouse (the last frame)

### Basic methods

- `background(r, g, b, a?)` : paints the canvas with the given color, based on rgba. If only one argument is given, it is the grayscale value.
- `createCanvas(width, height)` : creates a canvas of the given width and height.
- `fill(r, g, b, a?)` : sets the canvas fill style, based on rgb. If only one argument is given, it is the grayscale value.
- `stroke(r, g, b, a?)` : sets the canvas stroke style, based on rgb. If only one argument is given, it is the grayscale value.
- `translate(x, y)` : moves the origin of the canvas to the given x and y coordinates.
- `noStroke()` : removes the stroke from the canvas by setting strokeStyle to none.
- `strokeWeight(n)` : sets the stroke width to the specified number
- `frameRate(n)` : sets the fps of the animation loop. Paired nicely with using random elements in your code

### Creating shapes

- `circle(x, y, diameter)` : draws an ellipse at the given x and y coordinates, with the given diameter
- `ellipse(x, y, width, height)` : draws an ellipse at the given x and y coordinates, with the given width and height
- `line(x1, y1, x2, y2)` : draws a line from the first x and y coordinates to the second x and y coordinates
- `rect(x, y, width, height)` : draws a rectangle at the given x and y coordinates, with the given width and height
  - Any additional arguments you pass after that relate to the border radius values for the top left, top right, bottom left, and bottom right corners respectively
- `point(x, y)` : draws a point at the given x and y coordinates. Make sure to change the stroke style and width for this to ensure its visibility
  - `point(Vector)` : draws a point at the given vector's x and y coordinates.
- `square(x, y, size)` : draws a square at the given x and y coordinates, with the given size.
  - Any additional arguments you pass after that relate to the border radius values for the top left, top right, bottom left, and bottom right corners respectively
- `triangle(x1, y1, x2, y2, x3, y3)` : draws a triangle with the given x and y coordinates for each point

### Images 


### Text

- `textFont(fontName)` : sets the font family for text operations
- `textSize(size)` : sets the font size for text operations
- `text(text, x, y)` : draws text to the canvas. First argument is the text string, then the second is the x coordinate, and the third is the y coordinate. 

```typescript
p.strokeWeight(1);
p.fill(0);
p.textFont("Arial");
p.textSize(16);
p.text("1", p.width - 15, 15);
p.text("2", p.width - 35, 15);
p.text("4", p.width - 55, 15);
```

### Math methods

- `random(n)` : returns a random number between 0 and n
- `random(min, max)` : returns a random number between min and max

## Using map

The `map()` method is a way of using semi-reactive programming where we define a range a value can be, and preferred values for when the variable is at the beginning or end of that range.

```javascript
function update() {
  this.position.add(this.velocity);
  // 1. establish a range for the y coordinate between 0 and the canvas height.
  // 2. when y-coordinate is 0, return 5. when y-coordinate is canvas height, return 20
  // 3. by mapping the particle size to the y position, particles grow larger as they move down the screen
  // the size will be between 5 and 20
  this.size = this.p.map(this.position.y, 0, this.p.height, 5, 20);

  // first argument: clamp this.position.y between a range
  // second argument: establish minimum value for the range of this.position.y: 0
  // third argument: establish maximum value for the range of this.position.y: canvas height
  // fourth argument: establish minimum value for the return value: 5
  // fifth argument: establish maximum value for the return value: 20
}
```

- `map(value, start1, stop1, valWhenStart, valWhenStop)` : maps a value from one range to another range, returning a number in between that clamped range. Let's do an example with `map(star.z, 0, 400, 1, 10)`
  - The first argument is the value to pass in that want to clamp. `star.z` is a number value, and incrementing or decrementing this value spits out a new number from the range.
  - The second and third arguments are the range of the value. `0` is the minimum value, and `400` is the maximum value. `star.z` will range from 0-400
  - The fourth and fifth arguments are the range to clamp the value to. `1` is the minimum value, and `10` is the maximum value. The returned value will be between 1-10, and will be clamped to that range. When `star.z == 0`, 1 will be returned. When `star.z == 400`, 10 will be returned. Then it's a linear interpolation for any values between 0-400.

## Sliders

Using the `createSlider()` method, you can add an input range to the DOM and automatically have an event listener binded to it, enabling reactive programming.

```javascript
let slider = p.createSlider(min, max, default, step);
```

The 4 arguments passed are the `min`, `max`, `default` value, and the `step`, which are all self-explanatory. The `slider` variable is an instance of the `p5.Element` class, which has the following useful properties and methods:

- `element.value()` : returns the current value of the element
- `element.mouseReleased()` : callback function that runs when the mouse is released on the element. You can do this as a hacky way of lsitening for when the user moves the slider
- `element.id(id)` : sets the id of the element to the passed-in id

Here is an example in action:

```typescript
import p5 from "p5";
import Particle from "./Particle";

let particlesArray: Particle[] = [];
let sizeSlider: p5.Element;
let speedSlider: p5.Element;

const p5Manager = new p5((p: p5) => {
  p.setup = () => {
    p.createCanvas(400, 400);

    // create slider for size. Range between 10-30, with default value of 10, and step of 1
    sizeSlider = p.createSlider(10, 30, 10, 1);
    // create slider for speed. Range between 1-10, with default value of 2, and step of 1
    speedSlider = p.createSlider(1, 10, 2, 1);

    particlesArray = Array.from({ length: 100 }, () => new Particle(p));

    // user selected value on input and released mouse
    speedSlider.mouseReleased(() => {
      particlesArray.forEach((particle) => {
        particle.setVelocity(Number(speedSlider.value()));
      });
    });
  };

  p.draw = () => {
    p.background(220, 124, 156, 100);
    particlesArray.forEach((particle, index) => {
      particle.update();
      particle.draw();
      particle.setSize(Number(sizeSlider.value()));
    });
  };
});
```

## Working with vectors

The `createVector(x, y)` method creates a vector, which represents an x and y point. This returns a `Vector` instance which has the following methods:

- `add(vector)` : adds the given vector to the current vector
- `sub(vector)` : subtracts the given vector from the current vector
- `mult(n)` : multiplies the vector by the given number
- `div(n)` : divides the vector by the given number
- `mag()` : returns the magnitude of the vector

You can also add as many dimensions as you want, doing like `createVector(x, y, z)`

You can access individual components of the vector through the `x`, `y`, and `z` (if you add a 3rd dimension) properties.

Here is an example of using vectors:

```typescript
import p5, { Vector } from "p5";

export default class Particle {
  private position: Vector; // particle (x, y)
  private velocity: Vector; // particle dx and dy
  private size: number; // particle size

  constructor(private p: p5) {
    // random position and velocity
    this.position = p.createVector(p.random(p.width), p.random(p.height));
    this.velocity = p.createVector(p.random(-2, 2), p.random(-2, 2));
    this.size = 10;
  }

  update() {
    this.detectEdges();
    // update position by adding velocity vector
    this.position.add(this.velocity);
  }

  draw() {
    this.p.noStroke();
    this.p.fill(255, 0, 0);
    this.p.circle(this.position.x, this.position.y, this.size);
  }

  // bounce off the edges of the canvas
  private detectEdges() {
    if (this.position.x < 0 || this.position.x + this.size > this.p.width) {
      // flip dx
      this.velocity.x *= -1;
    }
    if (this.position.y < 0 || this.position.y + this.size > this.p.height) {
      // flip dy
      this.velocity.y *= -1;
    }
  }
}
```

## Saving colors for later

If you want to save fill styles and stroke styles as variables, you can do that with the `color(r, g, b)` builtin method, which returns a canvas style. You can then store it as a variable and pass it to when you want to set the fill or stroke style.

You just pass a color object to a style as `fill(color)`

```typescript
const brush = p.color(255, 0, 0);
p.fill(brush);
```
## Canvas State 

There are multiple p5 methods we can use to control the state of the canvas, including rotating it, translating the origin, and more. 

- `translate(x, y)` : translates the canvas's origin to the following x and y coordinates. 
	- You could basically turn this into a normal cartesian plane by translating to `translate(width / 2, height / 2)`.
- `rotate(degrees)` : rotates the canvas around the origin by the specified number of degrees/radians. Useful for radial 

These other methods help for making some of the canvas state changes easier: 
- `angleMode(DEGREES)` : turns on degree mode for rotation operations, so you can use degrees instead of radians. 
- `rectMode(CENTER)` : makes it so that rectangles are built around their center rather than their top-left corner
- `rectMode(CORNER)` : makes it so that rectangles are built around their top-left corner, which is the default behavior. 

### push and pop 

The `push()` and `pop()` methods are used to temporarily alter the canvas state, just like how `ctx.save()` and `ctx.restore()` works. 

Let's say you're rotating the canvas around, but you want it to reset to normal without explicitly saying so. Then you would stack all canvas state-changing methods around inside `push()` and `pop()` , like so: 

```javascript
push()
translate(width / 2, height / 2)
angleMode(DEGREES)
rotate(45)
// draw stuff here
pop()

// canvas state is restored back to normal
```

## Working with images

Now we have a use case for the special `preload()` function: to load images. We can load either local or network images and then draw them to the canvas. The general flow is like this: 

1. In the `preload()` callback, use `loadImage(src)` method calls to load the image resources the canvas needs. 
2. Use the `image()` method to draw the image to the canvas. 

Here are useful methods for images: 
- `loadImage(src)` : loads the specified image src. This returns a `p5.Image` instance. Only run this in the preload function. 
- `image(image, x, y, width, height)` : draws the specified image to the canvas. The first argument should be a `p5.Image` type, so it should be the value you get back from `loadImage()`.

You can get the individual pixel color value of a pixel from an image using the `image.get(x, y)` method, which returns an array of 4 values corresponding to an rgba syntax. 

```typescript
import p5 from "p5";

let catImage: p5.Image;

export const imagePractice = new p5((p: p5) => {
  p.preload = () => {
    // make sure image is same size as canvas or less
    catImage = p.loadImage("https://placekitten.com/400/400");
  };

  p.setup = () => {
    p.createCanvas(400, 400);
  };

  p.draw = () => {
    p.background(220);
    p.image(catImage, 0, 0, p.width, p.height);
    // get the [r, g, b, a] value of the first pixel in the image
    const firstPixelColor = p.color(catImage.get(0, 0));
  };
});
```
## P5 project examples 

### Paint brush app 

For this paint brush app, we forego drawing the canvas background each frame so our drawings can stay on the screen. 
We draw a blue square and a red square, and when they are clicked, we want to change the stroke color. 
- Click on blue, change stroke color to blue
- Click on red, change stroke color to red.

#### Targetable

To detect a click on a canvas element, these are the basic steps to follow: 
1. Write all click-detection code in the `mousePressed()` callback, which is triggered when the user clicks on the canvas. 
2. See if the `mouseX` and `mouseY` are within the bounding box of the canvas element you want to see was clicked on. If so, then the canvas element was clicked. 

By defining the coordinate state of a canvas element ahead of time, I made an easier API for dealing with click detection.

```typescript
import p5 from "p5";

export default class Targetable {
  constructor(
    private p: p5,
    private x: number,
    private y: number,
    private width: number,
    private height: number
  ) {}

	// if user clicks on canvas and the mouseX mouseY is in obj coords, execute callback
  onClick(callback: () => void) {
    if (!this.p.mouseIsPressed) return;

    if (this.checkIfPointInObject(this.p.mouseX, this.p.mouseY)) {
      callback();
    }
  }

  private checkIfPointInObject(x: number, y: number) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}
```

#### Final code

Here is the code for that:

```typescript
import p5 from "p5";
import Targetable from "./Targetable";

let red: p5.Color;
let blue: p5.Color;
let redBox: Targetable;
let blueBox: Targetable;

let strokeColor: p5.Color;

const p5Manager = new p5((p: p5) => {
  p.setup = () => {
   // setup colors, background color, etc.
    p.createCanvas(400, 400);
    red = p.color(255, 0, 0);
    blue = p.color(0, 0, 255);
    strokeColor = p.color(0, 0, 0);
    p.background(220);

	// define the bounding box for our buttons
    redBox = new Targetable(p, 0, 0, 20, 20);
    blueBox = new Targetable(p, 20, 0, 20, 20);
  };

  p.draw = () => {
    p.noStroke();
    // draw red and blue squares
    p.fill(red);
    p.rect(0, 0, 20, 20);
    p.fill(blue);
    p.rect(20, 0, 20, 20);
  };

	// when user holds down mouse and moves around screen
  p.mouseDragged = () => {
    p.stroke(strokeColor);
    p.strokeWeight(5);
    // draw a line
    p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
  };

	// when user click the mouse
  p.mousePressed = () => {
	// can only set onClick listeners inside this method
	  
    redBox.onClick(() => {
	    // set brush color to red on click
      strokeColor = red;
    });

    blueBox.onClick(() => {
	    // set brush color to blue on click
      strokeColor = blue;
    });
  };
});
```

### Symmetrical paint brush app
### Canvas rotation for radial patterns

### 10 print + Grid

#### Basic Grid 

```typescript
function drawGrid(p: p5) {
  for (let x = 25; x < p.width; x += 50) {
    for (let y = 50; y < p.height; y += 50) {
      const size = p.random(10, 30);
      p.ellipse(x, y, size);
    }
  }
}
```

#### 10 print code

### Pointism and images and Linewalk 

#### Pointism 

Pointism is a mosaic-like effect where we draw the image with individual circles, using the fill color from each image pixel to resemble the image. 

Note that this will only work when we make the image the exact same size as the canvas so their pixel coordinates correspond with each other. 

Here are the basic pointism steps done in a draw loop: 
1. Get a random point on the canvas plane
2. Get the pixel color of the image at that random x and y
3. Draw a circle and set the fill style to that pixel color

```typescript
  p.draw = () => {
    // p.image(catImage, 0, 0, p.width, p.height)
    lineWalk();
  };

  function pointilism() {
  // for loop makes operation faster
    for (let i = 0; i < 25; i++) {
      // get a random point in the canvas, get the pixel color of the point's pixel
      const randomX = p.random(p.width);
      const randomY = p.random(p.height);
      const pixelColor = p.color(catImage.get(randomX, randomY));
      // drawing the circle with the image pixel color reveals the image
      p.fill(pixelColor);
      // stroke adds a mosaic effect
      p.stroke(0);
      p.strokeWeight(0.3);
      p.circle(randomX, randomY, 4);
    }
  }
```

#### Line walk 

Line walk is a technique where we draw random connected lines of a small length, where that line has the fill color of a pixel in the image in roughly the same location, for a drawing the image kind of effect. 

-  Set initial random coordinates to start the walk from 
```javascript
let initX = 0;
let initY = 0;
const stepSize = 10;
```
- Get the associated image pixel color from those x and y coordinates
```javascript
const pixelColor = p.color(catImage.get(initX, initY));
```
-  Select another random point a certain small number of units away from the first point, like 10 units away. 
```javascript
const randomX = p.random(-stepSize, stepSize);
const randomY = p.random(-stepSize, stepSize);
```
-  Draw a line with the stroke style set to the image pixel color
```javascript
p.stroke(pixelColor);
p.strokeWeight(2);
p.line(initX, initY, initX + randomX, initY + randomY);
```
- Increment the initial random coordinates by the 2nd pair of random coordinates. This makes a "walk" effect
```javascript
initX += randomX;
initY += randomY;
```
- If the coordinates end up being out of bounds, reassign them to make sure they get back in the canvas somewhere. 
```javascript
if (initX < 0 || initX > p.width || initY < 0 || initY > p.height) {
	initX = p.random(p.width);
	initY = p.random(p.height);
}
```

Here is the complete code:

```typescript
const stepSize = 10;
let initX = 0;
let initY = 0;

function lineWalk() {
    for (let i = 0; i < 25; i++) {
      // if step out of bounds, reset to somewhere random
      if (initX < 0 || initX > p.width || initY < 0 || initY > p.height) {
        initX = p.random(p.width);
        initY = p.random(p.height);
      }

      // radius of randomness is 10. Line width will be 10 in any direction
      const randomX = p.random(-stepSize, stepSize);
      const randomY = p.random(-stepSize, stepSize);
      const pixelColor = p.color(catImage.get(initX, initY));
      p.stroke(pixelColor);
      p.strokeWeight(2);
      // draw line of length 10 with image pixel color from initX, initY
      p.line(initX, initY, initX + randomX, initY + randomY);
      // incrementing makes it a walk
      initX += randomX;
      initY += randomY;
    }
  }
```