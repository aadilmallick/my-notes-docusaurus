---
title: "05: transformations"
---

## Intro

There are 4 positions which we can use to change a mesh's orientation and position on screen:

- `position` : the object's position in 3d space
- `scale` : the object's size
- `rotation` : the object's rotation
- `quaternion` : the object's rotation, but using a different system

### Axes helper

The `AxesHelper` class is a visual aid that shows the axes of the 3D coordinate system on screen. It's useful for debugging and visualising the orientation of objects in 3D space.

To add it, all you have to do is to create an instance of the class and add it to the scene. The constructor takes in a single argument, the unit size of the axes.

```javascript
const axesHelper = new THREE.AxesHelper(unitSize);
```

```javascript
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);
```

- The red line corresponds to the `x` axis
- The green line corresponds to the `y` axis
- The blue line corresponds to the `z` axis

### OrbitControls

1. Import the `OrbitControls` class from the `three/examples/jsm/controls/OrbitControls` module.

   ```javascript
   import { OrbitControls } from "three/addons/controls/OrbitControls.js";
   ```

2. Instantiate the controls class, passing in the camera and the renderer's DOM element.

   ```javascript
   const controls = new OrbitControls(camera, renderer.domElement);
   ```

## Position

The `position` property on a mesh is actually a `Vector3` instance, so it has special properties we can take advantage of.

```javascript
const mesh = new THREE.Mesh(geometry, material);
mesh.position.x = 2;
mesh.position.y = 1;
mesh.position.z = 1;
```

Here are some useful properties and methods on the `mesh.position` property. Also keep in mind that these same properties will exist on the `Vector3` class as well.

- `mesh.position.x` : the x position of the mesh
- `mesh.position.y` : the y position of the mesh
- `mesh.position.z` : the z position of the mesh
- `mesh.position.set(x, y, z)` : sets the position of the mesh to the given x, y, and z values
- `mesh.position.copy(vector3)` : sets the position of the mesh to the given `Vector3` instance
- `mesh.position.distanceTo(vector3)` : returns the distance between the mesh and the given `Vector3` instance
- `mesh.position.normalize()` : normalizes the mesh's position, returns a unit vector.

### Vector3 class

```javascript
const a = new THREE.Vector3(0, 1, 0);

//no arguments; will be initialised to (0, 0, 0)
const b = new THREE.Vector3();

const d = a.distanceTo(b);
```

Here are some helpful mathematical methods you can use on the `Vector3` class:

- `vector3.distanceToSquared(vector3)` : returns the squared distance between the vector and the given `Vector3` instance
- `vector3.add(vector3)` : adds the given `Vector3` instance to the vector's position
- `vector3.sub(vector3)` : subtracts the given `Vector3` instance from the vector's position
- `vector3.multiply(vector3)` : multiplies the vector's position by the given `Vector3` instance
- `vector3.divide(vector3)` : divides the vector's position by the given `Vector3` instance

## Scaling

The `mesh.scale` property is also an instance of the `Vector3` class, so we can use vector properties and methods to modify the scale.

```javascript
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.x = 2;
mesh.scale.y = 1;
mesh.scale.z = 1;
```

## Rotation

The `mesh.roation` property is an instance of the `Euler` class.

The important thing with rotation is that the units are in **radians**, so we should use `Math.PI` in our calculations.

```javascript
const mesh = new THREE.Mesh(geometry, material);
// rotate 360 degrees
mesh.rotation.x = Math.PI * 2;
```

### Reordering axes

Another thing to consider is that the axes will also rotate as you rotate the object, so to avoid this unpredictable behavior, you can reorder the axes.

Reorder your axes before doing any rotations.

```javascript
mesh.rotation.reorder("YXZ");
```

## Grouping

**Groups** in threejs are a way of applying transformations to multiple meshes at once. You add the group to the scene, and then add the meshes to the group.

You achieve this by adding meshes to the group, and then since a group inherits from a 3D object class, it has the same 4 transformation properties available on all objects, like `position` and `scale`.

You then modify those vector transformation properties to transform all the meshes in the group at once.

This is how you create a group:

```javascript
const group = new THREE.Group();
scene.add(group);
```

And this is how you add a mesh to a group, using `group.add(mesh)`:

```javascript
const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
cube1.position.x = -1.5;
// highlight-start
group.add(cube1);
// highlight-end
group.scale.y = 2;
```

In the example above, we created a group, added it to the scene, create a cube, added it to the group, and then applied a transformation on the entire group.
