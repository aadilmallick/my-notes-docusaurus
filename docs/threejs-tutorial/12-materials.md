# 12: Materials

## Working with materials

The same properties you instantiate materials with can also be accessed on them like normal property syntax.

```javascript
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});

material.map = doorColorTexture;
material.color.set("#ffffff");
```

- `color` : an instance of the `Color` class.
- `map` : the texture to map onto the material.
- `alphaMap` : the texture to use for the alpha channel. If you have a texture designed for alpha mapping, you can set it to this property. Only works when `material.transparent` is set to `true`.

### Opacity

Whenever you want to change the opacity of a material, you need to set its `transparent` property to `true`.

```javascript
material.opacity = 0.5;
material.transparent = true;
```

### Working with Colors

```

```

## MeshNormalMaterial

MeshNormalMaterial is used for lighting, reflection, and refraction properties.

```javascript
const material = new THREE.MeshNormalMaterial({
  flatShading: true,
});
```

Here are some basic properties you can set on a MeshNormalMaterial:

- `flatShading` : if set to `true`, the material will be rendered with flat shading. Otherwise, it will be rendered with smooth shading.
- `wireframe` : if set to `true`, the material will be rendered in wireframe mode.

## MeshMatcapMaterial

MeshMatcapMaterial is used for lighting, reflection, and refraction properties. It's a way to give the illusion of reality and lighting without actually adding light to a scene.

```javascript
const { matcapTexture } = loadTextures();

const material = new THREE.MeshMatcapMaterial();
material.matcap = matcapTexture;
```

You can find more matcaps at [this repo](https://github.com/nidorx/matcaps)

## Lights and materials

The next few materials need some light in the scene in order to be shown, as they have refraction and reflection properties using the laws of physics.

The `AmbientLight` and `PointLight` class constructors take in two arguments: the color of the light, and the intensity of the light, on a scale of 0 to 1.

```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
scene.add(pointLight);
pointLight.position.set(2, 3, 4);
```

### MeshLambertMaterial

A performant material that has basic reflection and refraction properties.

```javascript
const material = new THREE.MeshLambertMaterial({});
material.shininess = 1000;
material.specular = new THREE.Color("blue");
```

Here are some properties you can set on this material:

- `shininess` : the shininess of the material. The higher the value, the more shiny the material will be.
- `specular` : the color of the specular highlight of the material. This is the color of the reflection of the light source on the material. Set this to a `THREE.Color` instance.

### MeshPhongMaterial

A less performant material than the mesh lambert material, but has stronger reflection and refraction properties.

```javascript
const material = new THREE.MeshPhongMaterial({});
material.shininess = 1000;
material.specular = new THREE.Color("blue");
```

### MeshToonMaterial

The MeshToonMaterial is a material that has a cartoonish look to it.

```javascript
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;
const material = new THREE.MeshToonMaterial();
material.gradientMap = gradientTexture;
```

You can use the `gradientMap` property for a texture gradient if you have one, and make sure to use the min filter and mag filter properties on texture and prevent mipmapping, when casting a small image and mapping it onto large objects.

### MeshStandardMaterial

The `MeshStandardMaterial` is a material that has a metallic look to it. You can change how metallic and rough the material is.

```javascript
const material = new THREE.MeshStandardMaterial({
  metalness: 0.7,
  roughness: 0.2,
});
```

- `metalness` : the metalness of the material, on a scale of 0 to 1. The higher the value, the more metallic and reflective the material will be.
- `roughness` : the roughness of the material, on a scale of 0 to 1. The higher the value, the rougher the material will be. 1 means the material is completely rough, so no reflection, and 0 means the material is completely smooth.

## Texture Maps

You can set multiple maps at a time on a material, all converging into one texture map that you can make to have crisp looking objects.

Just like how there are different texture types, you can have different material mappings for those textures.

## Environment Maps

Instead of plain textures, you can map good looking backgrounds onto your objects using environment maps. The special thing about environment maps is that they are cubic textures, meaning they are six images composed into a single cube texture.

You need to load a cube texture by using the `THREE.CubeTextureLoader` class constructor, and passing in an array of six images. The order of the images is important, as it follows the order of the six sides of a cube.

```javascript
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  "img1.png",
  "img2.png",
  "img3.png",
  "img4.png",
  "img5.png",
  "img6.png",
]);
```

Next, you set the `material.envMap` property to that environment map texture.

```javascript
const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);

// create meshes, add them to scene, return them
const material = new THREE.MeshStandardMaterial({
  metalness: 0.7,
  roughness: 0.2,
});
material.envMap = environmentMapTexture;
```

### Finding Environment Maps

1. Go to [hdrihaven](https://polyhaven.com/), and download a hdri image
2. Go to [hdri to cubemap tool](https://matheowis.github.io/HDRI-to-CubeMap/) to generate the 6 images you need from that hdri image, in order to create a cube texture.
