---
title: "04: Vite standard file"
---

```javascript
import "./style.css";
import * as THREE from "three";

// tell typescript these will never be null.
let scene!: THREE.Scene;
let camera!: THREE.PerspectiveCamera;
let renderer!: THREE.WebGLRenderer;

function sceneSetup() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    antialias: true, // smooths out the edges
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function init() {
  sceneSetup();
  camera.position.z = 5;

  const material = new THREE.MeshBasicMaterial({ color: "blue" });
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { blueCube: mesh };
}

function animate() {
  requestAnimationFrame(animate);
  // custom code here, moving shapes around, etc.
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// main code
const { blueCube } = init();
animate();
window.addEventListener("resize", onWindowResize);
```

- `sceneSetup()` : sets up the scene, camera, and renderer
- `init()` : creates the shapes we want to use and access in the animation loop
- `animate()` : the animation loop, where we can move shapes around, etc.
- `onWindowResize()` : resizes the camera and renderer when the window is resized, allows responsivity.
