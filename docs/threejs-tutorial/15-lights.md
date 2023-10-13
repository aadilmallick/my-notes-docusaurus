# 15: Lights

## Ambient Light

Ambient light is used to provide omnidirectional lighting that lights up all objects equally. It lights up every single part of the mesh uniformly.

The `AmbientLight` class takes in two arguments into its constructor:

```js
const ambientLight = new THREE.AmbientLight(color, intensity);
scene.add(ambientLight);
```

- `color` : required, the color of the light, which will be a `Three.Color` object.
- `intensity` : optional, the intensity of the light, which will be a number between 0 and 1. Default is 1.

You can also access these properties as normal class properties.

## Directional Light

Directional Light has a sun=like effect, where all the light rays are parallel to each other. It is used to simulate sunlight.

The `DirectionalLight` class takes in two arguments into its constructor:

```js
const directionalLight = new THREE.DirectionalLight(color, intensity);
directionalLight.position.set(2, 2, 2);
scene.add(directionalLight);
```

## Hemisphere Light

The hemisphere light has a different color coming from above and a different color coming from below. As such, it takes in three arguments into its constructor:

```js
const hemisphereLight = new THREE.HemisphereLight(
  skyColor,
  groundColor,
  intensity
);
scene.add(hemisphereLight);
```

It's similar to ambient light, but it has two color options for the top and bottom.

## Point Light

Point light is a light that comes from a single point in space. It spreads uniformly in all directions.

The `PointLight` class takes in two arguments into its constructor:

```js
const pointLight = new THREE.PointLight(color, intensity);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);
```

You also have additional arguments you can pass into the constructor:

- `distance` : optional, the distance from the light where the intensity is 0. Default is 0. Basically like the fade distance, where after this distance, the point light fades out completely.
- `decay` : optional, the amount the light dims along the distance of the light. Default is 1. Basically like the fade amount, where the light fades out as it gets further away from the light source.

## RectArea Light

RectArea light is a light that emits from a rectangular plane. It's similar to a point light, but it emits from a rectangular plane instead of a single point.

It illuminates objects with a plane of light.

The `RectAreaLight` class takes in four arguments into its constructor:

```js
const rectAreaLight = new THREE.RectAreaLight(color, intensity, width, height);
scene.add(rectAreaLight);
```

```js
const rectAreaLight = new THREE.RectAreaLight("#f4a552", 2, 1, 1);
scene.add(rectAreaLight);
```

## Spot Light

Spot light is a light that emits from a single point in a cone shape. It's like a flashlight.

The `SpotLight` class takes in six arguments into its constructor:

```js
const spotLight = new THREE.SpotLight(
  color,
  intensity,
  distance,
  angle,
  penumbra,
  decay
);

scene.add(spotLight);
```

- `color` : required, the color of the light, which will be a `Three.Color` object.
- `intensity` : optional, the intensity of the light, which will be a number between 0 and 1. Default is 1.
- `distance` : optional, the distance from the light where the intensity is 0. Default is 0. The higher this value, the further the light will shine.
- `angle` : optional, the angle of the spotlight in radians. Default is Math.PI / 3. The bigger this angle, the wider and bigger the spotlight.
- `penumbra` : The blur amount on the edge of light. The higher this value, the softer and more diffused the light is around the edges. Default is 0.
- `decay` : optional, the amount the light dims along the distance of the light. Default is 1. Basically like the fade amount, where the light fades out as it gets further away from the light source.

### SpotLight target

The spotlight target is like the wall the flashlight is shining on. We can't move the position of the spotlight, but we can move the position of the spotlight target.

First, we have to add the spotlight target to the scene

```js
const spotLight = new THREE.SpotLight("#2359e0", 0.9, 15, Math.PI * 0.1);

spotLight.target.position.set(0, 0, 0);
scene.add(spotLight.target);
```

## Performance

Lights are really expensive. Make sure to use as few lights as possible.

- Performant lights: ambient light, hemisphere light
- Moderate lights: directional light, point light
- Expensive lights: spot light, rect area light

## Light helpers

You can use light helpers to see the position of your lights and visually move them around.

You only have to pass in two arguments to each light helper class: the light object you want to visualize, and the size of the helper.

```js
const hemisphereLight = new THREE.HemisphereLight("#6dcfb8", "#dd3bc5", 0.5);
scene.add(hemisphereLight);

const hemisphereLightHelper = new THREE.HemisphereLightHelper(
  hemisphereLight,
  0.1
);
scene.add(hemisphereLightHelper);
```

In the above example, we passed our hemisphere light object into the hemisphere light helper class, and we passed in a size of 0.1.
