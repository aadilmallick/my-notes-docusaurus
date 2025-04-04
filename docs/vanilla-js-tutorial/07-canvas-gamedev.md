# Canvas with game development: recipes

## Basic Recipes 

This is going to be a catalog of basic game development recipes in JavaScript instead of game-dev specific concepts like the animation loop and the OOP side of things.

### Wall boundary detection

How do you prevent players and objects from going outside the canvas boundaries? 

The way to prevent an object from going past canvas boundaries is to check for when the object's coordinates has breached those boundaries, and then setting their coordinates back to some max threshold. 

It's kind of like this syntax: 

```
if player.x breached leftEdge|rightEdge coord: 
  player.x = leftEdge|rightEdge coord

if player.y breached topEdge|bottomEdge coord: 
  player.y = topEdge|bottomEdge coord
```

**prevent collision on left**

Prevents going left once you reach x = 0

```javascript
if (player.x < 0) {
  player.x = 0;
}
```

**prevent collision on right**

Prevents going right once player's right edge coordinate is greater than canvas width

```javascript
if (player.x + player.width > canvas.width) {
  player.x = canvas.width - player.width;
}
```

**prevent collision on top edge**

Prevents going up once player's y = 0

```javascript
  if (player.y < 0) {
    player.y = 0;
  }
```

**prevent collision on bottom edge**

if player's bottom edge coordinate is greater than canvas height, set max threshold of canvas height

```javascript
if (player.y + player.h > canvas.height) {
  player.y = canvas.height - player.h;
}
```

All together it's like this: 

```javascript
function wallDetection() {
  // Boundary detection on left edge
  // if player's x coordinate is less than 0, set their x coordinate to 0. 
  if (player.x < 0) {
    player.x = 0;
  }

  // Boundary Detection on right edge
  // if player's right edge coordinate is greater than the canvas width, set max threshold of canvas width
  if (player.x + player.w > canvas.width) {
    player.x = canvas.width - player.w;
  }

  // Boundary Detection on left edge
  // if player's y coordinate is less than 0, set max threshold of 0
  if (player.y < 0) {
    player.y = 0;
  }

  // Boundary Detection on bottom edge
  // if player's bottom edge coordinate is greater than canvas height, set max threshold of canvas height
  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
  }
}
```

## Game dev design patterns

### Event Emitter

We can emit game events by creating our own implementation of an event emitter class: 

```javascript
//set up an EventEmitter class that contains listeners
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
//when a message is received, let the listener to handle its payload
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }
//when a message is sent, send it to a listener with some payload
  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach(l => l(message, payload))
    }
  }
}
```

### Loading image assets: promisify

We can promisify loading image assets like so: 

```javascript
function loadAsset(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      // image loaded and ready to be used
      resolve(img);
    }
  })
}
```