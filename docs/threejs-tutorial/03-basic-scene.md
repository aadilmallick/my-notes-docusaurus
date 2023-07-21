---
title: "03: Basic Scene"
---

## Setup

1. Create a vite app
2. Install three.js with `npm install three --save`
3. Do the CSS reset

   ```css
   * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
   }
   ```

4. Import three js

```javascript
import * as THREE from "three";
import "./style.css";
```

## Scene setup

### 1: Creating a scene

```javascript
import * as THREE from "three";
import "./style.css";

const scene = new THREE.Scene();
```

The `Three.Scene()` constructor creates a new scene, which is where all our 3D objects will live. It's like a container for all the objects in our scene.

### 2: Creating a camera

```javascript
const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
```

Creating a camera requires 4 arguments to be passed into the `Three.PerspectiveCamera()` constructor:

- `fieldOfView`: The field of view of the camera. This is the extent of the scene that is seen on the display at any given moment. The value is in degrees.
- `aspectRatio`: The aspect ratio of the scene. This should be set to the width of the display divided by the height of the display.
- `near`: This is the distance between the camera and the closest visible object. Objects closer than the near value will be clipped from the scene, and not visible to the camera.
- `far`: This is the distance between the camera and the furthest visible object. Objects beyond the far value will be clipped from the scene, and not visible to the camera.

```javascript
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
```

### 3: Creating a renderer

```javascript
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

1. We create a renderer with the `Three.WebGLRenderer()` constructor. The renderer is what takes the scene and renders it on the screen. This creates a `<canvas>` element behind the scenes.
2. We set the size of the renderer to the full viewport with the `renderer.setSize()` method. So the canvas will be the full size of the screen.
3. We then append the canvas we created to the DOM. We can get the canvas with `renderer.domElement`.

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true });
```

You can also smooth out the edges of your shapes by setting the `antialias` property to `true` in the `Three.WebGLRenderer()` options.

### Complete setup

The `init()` pattern involves setting global variables for the scene, camera, and renderer. In our `sceneSetup()`, we do the standard scene setup, which includes the following:

- Intializing the scene, camera, and renderer
- Creating a canvas renderer element and appending it to the DOM

```javascript
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

function sceneSetup() {
  // scene init
  scene = new THREE.Scene();
  // camera init
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // renderer init
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}
```

## Shapes

### 4: Creating a Shape

There are two things you need to create a basic shape in threejs: A geometry, and a material.

> These combine to form a **mesh**, which is a 3d object. A **geometry** is the shape of the object. A **material** is the stuff the object is made of, be it a color or an image.

- You can create a rectangular prism geometry using `Three.BoxGeometry()`, which takes in three arguments: width, height, and depth of the rectangular prism.

  ```javascript
  const geometry = new THREE.BoxGeometry(width, height, depth);
  ```

- You can create a material using `Three.MeshBasicMaterial()`. You can pass in a color as an argument, for now.

  ```javascript
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  ```

- You then create an object by meshing these materials together.

  ```javascript
  const cube = new THREE.Mesh(geometry, material);
  ```

```javascript
const geometry = new THREE.BoxGeometry(4, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
```

### 5: Adding the shape to the scene

```javascript
scene.add(cube);
camera.position.z = 5;
```

- You add an object to the scene with the `scene.add()` method, passing in the 3D object.
- Then you have to set the position of the camera with the `camera.position.z` property, in order to see the scene well.

```javascript
const sphereGeometry = new THREE.SphereGeometry(2, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: "red",
  wireframe: true,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// the bigger this value, the farther away you are.
camera.position.z = 5;
```

## Rendering scenes: the animation loop

### 6: Rendering the scene

All scene rendering happens inside an animation frame loop, since threejs is all about animations. Create an `animate()` function, and then run a recursive `requestAnimationFrame()` inside it. Then call the `renderer.render()` method, passing in the scene and the camera.

```javascript
function animate() {
  requestAnimationFrame(animate);
  // custom code here, moving shapes around, etc.
  renderer.render(scene, camera);
}

animate();
```

- `renderer.render(scene, camera)` : renders the scene from the perspective of the camera.

## Responsivity

### 7: Listening for window resize events

In order to keep your scene responsive, you need to listen for the window resize event and update your camera perspective accordingly.

```javascript
function onWindowResize() {
  // update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  // update camera frustum
  camera.updateProjectionMatrix();
  // update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
}
```
