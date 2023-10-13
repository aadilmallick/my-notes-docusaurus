# Vite starter

## Dependencies

```bash
npm create vite@latest
npm i gsap three lil-gui
npm i --save-dev @types/three
```

## CSS

```css
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
```

## Javascript

### Imports

```javascript
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "lil-gui";
```

### Setup code

```javascript
let scene!: THREE.Scene;
let camera!: THREE.PerspectiveCamera;
let renderer!: THREE.WebGLRenderer;
let orbitControls!: OrbitControls;
```

### add orbit controls

```javascript
function addOrbitControls() {
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  return orbitControls;
}
```

### Add GUI

```javascript
function addGui() {
  const gui = new dat.GUI();
  gui.add(orbitControls, "enabled").name("toggle orbit controls");
  gui.add(axes, "visible").name("show axes");

  const parameters = {};

  return gui;
}
```

### Add axes

```javascript
function addAxesHelper() {
  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);
  return axesHelper;
}
```

### Load textures

```javascript
function loadTextures() {
  const loadingManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loadingManager);

  loadingManager.onStart = (url, loaded, total) => {};
  loadingManager.onLoad = () => {};
  loadingManager.onProgress = (url, loaded, total) => {};
  loadingManager.onError = (url) => {};

  return { textureLoader };
}
```

### Window resize

```javascript
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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
```

### Fullscreen event

```javascript
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

### Animation loop

```javascript
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  orbitControls.update();

  renderer.render(scene, camera);
}
```

### Scene setup and init

```javascript
function sceneSetup() {
  scene = new THREE.Scene();
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // instantiate axes, orbit controls, gui, etc
}
```

```javascript
function init() {
  sceneSetup();
  camera.position.z = 5;

  // create meshes, add them to scene, return them
}
```
