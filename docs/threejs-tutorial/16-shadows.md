# 16: Shadows

There are two types of shadows, core shadows and drop shadows.

- Core shadows : the shadows that are cast by the object itself. Think of a the dark side of a sphere.
- Drop shadows: the shadows that an object casts on another object, kind of like our own shadows on the ground.

Drop shadows work by **shadow maps**, where each light in your scene takes a picture of how the shadows would look like when applying the light.

You will have one shadow map for each light in the scene, and then after collecting all those shadow maps, threejs mimics the illusion of shadows by coloring in pixels based on what the shadow maps are supposed to look like.

By default, lights in threejs have core shadows enabled, but drop shadows are disabled because of performance issues. There are some steps we can take to enable drop shadows

1. Enable drop shadows on the renderer by enabling shadow maps

   ```javascript
   renderer.shadowMap.enabled = true;
   ```

2. Enable drop shadows on the objects that will cast shadows and receive shadows. These are the `castShadow` and `receiveShadow` property on the meshes.

   ```javascript
   mesh.castShadow = true;
   mesh.receiveShadow = true;
   ```

3. Enable drop shadows on the light source by using the `light.castShadow` boolean property.

   ```javascript
   light.castShadow = true;
   ```

```javascript
// 1. enable shadow maps on the renderer
renderer.shadowMap.enabled = true;

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
// 2. enable drop shadows on the light source
directionalLight.castShadow = true;

// ... create sphere and plane mesh

// 3. enable drop shadows on the meshes
sphere.castShadow = true;
plane.receiveShadow = true;
```

## Shadow cameras

The **shadow camera** is the camera each individual light uses to render a shadow map.

For directional lights, the shadow camera is a **orthographic camera**, while for spotlights, the shadow camera is a **perspective camera**.

You can access the camera used to render the shadow maps on each light through the `light.shadow.camera` property. Here are some of the properties on the shadow camera:

- `left`, `right`, `top`, `bottom`: the dimensions of the shadow camera's view frustum. Only works if the shadow camera is an orthographic camera, like if using a directional light
- `near`, `far`: the near and far planes of the shadow camera's view frustum
- `fov`: the field of view of the shadow camera.

## Camera helpers

Just like how we have light helpers, we can have visual helpers for the shadow camera for each light.

All we do is create a camera helper by using the `Three.CameraHelper` class and passing in the shadow camera of the light we want to create a helper for.

```javascript
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
```

## Improving the quality of the shadows

We can make our shadows look better by increasing the size of the shadow maps taken, meaning that the resulting shadow map will be larger and thus higher quality.

We do this by increasing the `width` and `height` on the light's `light.shadow.mapSize` property.

```javascript
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
```

### Near and far

We can also increase the quality of the shadows by increasing the `near` and `far` properties on the light's `light.shadow.camera` property.

The `near` property is the distance from the camera where the shadow will start to be rendered, and the `far` property is the distance from the camera where the shadow will stop being rendered.

```javascript
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);

scene.add(directionalLightCameraHelper);
```

### Shadow radius

The `light.shadow.radius` property is a number that represents the amount of blur that will be applied to the shadow. The higher the number, the more blur will be applied.

```javascript
directionalLight.shadow.radius = 20;
```

## Baking shadows

Another performant way of showing drop shadows is **baking shadows**, where we draw the shadows into a texture in blender thus having the illusion of a shadow when it's just a texture.

Before baking shadows, we need to disable shadows on all lights and the renderer.

```javascript
renderer.shadowMap.enabled = false;
directionalLight.castShadow = false;
```

We can bake shadows in threejs by creating another mesh that essentially serves the purpose of being the shadow of another mesh.

We change the position of this shadow to follow wherever the mesh goes, giving the illusion of the mesh casting a shadow.

```javascript
const shadowMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    alphaMap: shadowTexture,
  })
);
shadowMesh.rotation.x = Math.PI * -0.5;
shadowMesh.position.y = plane.position.y + 0.01;
scene.add(shadowMesh);
```

To programmatically decrease the strength of the shadow, change the `opacity` property on the mesh.
