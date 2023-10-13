# 09: Geometry

All geometries are essentially just a bunch of vertices creating triangles, and those many triangles create faces of 3D objects

All geometries inherit from the `BufferGeometry` class, which is the most basic geometry class. On this class, you have the ability to manipulate the individual vertices of the geometry.

## Types of geometries

### BoxGeometry

Besides specifying the width, height, and depth when creating a geometry, you can specify the **subdivisions** in width segments, height segments, and depth segments.

Th amount of segments you have multiplies the amounts of triangles you have on each face by 2.

- `widthSegments` : the amount of subdivisions in the width of the box
- `heightSegments` : the amount of subdivisions in the height of the box
- `depthSegments` : the amount of subdivisions in the depth of the box

For example, 3 width segments and 2 height segments with 1 depth segment creates 6 subdivisions, so 12 triangles on each face.

The more subdivisions you have, the more detailed your geometry will be.

```js
const geometry = new THREE.BoxGeometry(
  width,
  height,
  depth,
  widthSegments,
  heightSegments,
  depthSegments
);
```

## BufferGeometry

We can create shapes from a set of vertices using `BufferGeometry`. From an array of vertices, where each entry is a float value corresponding to an `x`, `y`, or `z` coordinate, we can create triangles from those points and create shapes from those triangles.

Each vertex has 3 points, (x,y,z), and each triangle has 3 vertices.

- an array of size 9 will create 1 triangle
- an array of size 450 will create 50 triangles

```javascript
function createBufferGeometry() {
  const positionsArray = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0]);

  const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", positionsAttribute);

  return geometry;
}
```

Here are the basic steps to create a buffer geometry:

- Create a `Float32Array` with the vertices of the geometry. Each 3 consecutive numbers correspond to a single vertex, and each 3 consecutive vertices correspond to a single triangle.
  - In the above example, a float array of size 9 creates 3 vertices, which creates 1 triangle.
- Create a `BufferAttribute` from the `Float32Array` and specify the number of points per vertex. In this case, we have 3 points per vertex, so we pass in 3.

  - The `Three.BufferAttribute` constructor takes in 2 arguments: the `Float32Array` and the number of points per vertex.

  ```javascript
  const positionsAttribute = new THREE.BufferAttribute(
    floatArray,
    numPointsInVertex
  );
  ```

- Create a `BufferGeometry` and set the `position` attribute to the `BufferAttribute` we created.

  ```javascript
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", positionsAttribute);
  ```
