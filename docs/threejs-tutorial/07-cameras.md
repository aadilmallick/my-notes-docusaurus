# Cameras

There are many types of cameras in threejs:

- `ArrayCamera` : uses multiple cameras to render different scenes in the same page. Works exactly like the multiplayer screen view, with the split screen.
- `CubeCamera` : does 6 renders, renders its view from six directions, a cube like view.
- `StereoCamera` : uses two cameras to render the scene with the parallax effect. Only works with vr
- `OrthographicCamera` : renders the scene without perspective. All elements on screen will have the same size regardless of their distance to the camera.
- `PerspectiveCamera` : renders the scene with perspective. Elements that are further away from the camera will appear smaller than those close to the camera. Similar to how we see the world in real life.

## Perspective Camera

```js
const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
```

- `fieldOfView`: The vertical angle the camera can see. The value is in degrees.
  - The larger this value, the smaller objects will appear
  - The smaller this value, the larger objects will appear
- `aspectRatio`: The aspect ratio of the scene. This should be set to the width of the display divided by the height of the display.
- `near`: This is the distance between the camera and the closest visible object. Objects closer than the near value will be clipped from the scene, and not visible to the camera.
- `far`: This is the distance between the camera and the furthest visible object. Objects beyond the far value will be clipped from the scene, and not visible to the camera.

### Z-fighting

There is a phenonmenon called z-fighting, which is a bug when the `near` is very small, and the `far` is very large, like `near = 0.00001` and `far = 1000000`.

The gpu will have trouble knowing which elements are beyond the near and far, and instead renders them at the same distance.

## Orthographic Camera

The orthographic camera renders scene in a square. We define that square size.

```js
camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
```

The problem with rendering as a square is that all meshes will be stretched or squashed. TO prevent this from happening, we need to multiply the left and right sides of the camera by the aspect ratio.

```javascript
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -1 * aspectRatio,
  1 * aspectRatio,
  1,
  -1,
  0.1,
  100
);
```

## Controls

- `OrbitControls` : allows you to pan around the scene
- `TrackballControls` : allows you to pan around the scene, but with infinite rotation in all directions.
- `TransformControls` : allows you to move, rotate, and scale objects in the scene on a grid.
- `DragControls` : allows you to drag and drop objects around the scene.

### OrbitControls

```javascript
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
```

The `OrbitControls` constructor takes two arguments: the camera, and the canvas element that the scene is rendered on.

```javascript
const controls = new OrbitControls(camera, canvasElement);
```

We can enable **damping** on the orbit controls, which allows smooth panning. To this however, we need to update the controls in each frame in the animation loop.

- `controls.enableDamping` : if true, enables damping
- `controls.dampingFactor` : the amount of damping. The default is 0.25.
- `controls.update()` : updates the controls. Need this if damping is enabled, put inside animation loop.

```javascript
let orbitControls!: OrbitControls;

function addOrbitControls() {
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
}

function animate() {
    // ...
    orbitControls.update();
}
```
