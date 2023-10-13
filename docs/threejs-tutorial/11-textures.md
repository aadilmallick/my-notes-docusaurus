# 11: textures

## Texture types

- **Color** : a single color
- **Alpha** : grayscale image, white is visible, black is not visible.
- **Height** : grayscale image, white is high, black is low, gray is middle, giving the illusion of depth.
- **Normal** : RGB image, each color represents a direction, used to give the illusion of depth, lots of details and very performant
- **Ambient occlusion** : grayscale image, puts shadows in crevices, making good constrast
- **Metalness** : for reflections, white become metallic, black become non-metallic
- **Roughness** : for reflections, white is rough, black is smooth

Textures are special because they follow the PBR (physically based rendering) guidelines, which means that they are based on real world physics.

## Loading textures

:::info
Loading textures will only work on basic shapes, not on any custom shapes you created like a `BufferGeometry`
:::

You create a **texture loader** from the `TextureLoader` class, and then you can use the `load()` method to load the specified image. The `load()` method takes a path to the image, and returns a `Texture` object.

```javascript
const texture = new THREE.TextureLoader().load("/obama.jpg");
const material = new THREE.MeshBasicMaterial({ map: texture });
```

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const texture = new THREE.TextureLoader().load("/obama.jpg");
const material = new THREE.MeshBasicMaterial({ map: texture });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

### Callbacks

```javascript
const textureLoader = new THREE.TextureLoader();

const onLoaded = (texture: THREE.Texture) => {};

const onProgress = (event: ProgressEvent) => {};

const onError = (error: ErrorEvent) => {};

const texture = textureLoader.load("/obama.jpg", onLoaded, onProgress, onError);
```

The `load()` method takes in additional arguments. Here they are in order:

- **image source** : the path to the image
- `onLoad` : a callback function that is called when the image is successfully loaded
- `onProgress` : a callback function that is called when the image is loading, and gives you the progress of the loading
- `onError` : a callback function that is called when the image fails to load

### Loading manager

The loading manager is a better way of having event-driven callbacks when loading textures.

This is how you create a loading manager:

1. Instantiate it with the `LoadingManager` class
2. Pass in the loading manager instance as an argument to the texture loader constructor

```javascript
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
```

The loading manager has 4 properties that you can set callbacks for:

```javascript
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

loadingManager.onStart = (url, loaded, total) => {};
loadingManager.onLoad = () => {};
loadingManager.onProgress = (url, loaded, total) => {};
loadingManager.onError = (url) => {};
```

- `onStart` : called when the loading starts
  - `url` : the url of the image
  - `loaded` : the number of images that have been loaded
  - `total` : the total number of images to load
- `onLoad` : called when the loading for all the images is finished successfully
- `onProgress` : called when the loading for an image is finished successfully
  - `url` : the url of the image
  - `loaded` : the number of images that have been loaded
  - `total` : the total number of images to load
- `onError` : called when the loading for an image fails
  - `url` : the url of the image

## UV mapping

UV mapping is the principle behind how we apply textures to 3D objects. We take a 2D plane like an image, and wrap it around a 3D object. The 2D plane is called a **UV map**.

Each vertex also has UV coordinates, that map from 2D to 3D.

:::warning
The reason why textures don't work on custom shapes is because they don't have UV coordinates for the textures to successfully map onto the geometry. That's why you can't load textures on buffer geometry, as opposed to normal geometries that come with threejs, since they already have their own UV coordinates.

If you want to load textures on custom shapes, you need to provide the UV coordinates for that object.
:::

## Modifying the texture

There are many transformations you can make to the texture itself to get it look different, like rotating it, repeating it, and offsetting it.

### Rotation

- `texture.rotation` : the rotation of the texture in radians. A `number` value.
- `texture.center` : the center of the texture. A `Vector2` value, where (0.5, 0.5) is the direct center of the texture.

```javascript
texture.center.set(0.5, 0.5);
texture.rotation = Math.PI / 4;
```

### Repeating

The `texture.repeat` is a `Vector2` instance, and in there you can define how many times the texture should repeat in the x and y direction.

```javascript
// repeat 2 times in the x and 2 times in the y direction
texture.repeat.set(2, 2);
```

By default, the texture will repeat the last pixel on each side of the texture. If you don't want that behavior, and instead you want to repeat the image itself multiple times, you need to modify the `wrapS` and `wrapT` properties of the texture.

You can set these properties to two different values:

- `THREE.RepeatWrapping` : repeats the image normally, no flipping
- `THREE.MirroredRepeatWrapping` : repeats the image, but mirrors it each time, flipping horizontally when repeating on the x and vertically when repeating on the y

```javascript
const texture = textureLoader.load("/obama.jpg");
texture.repeat.x = 2;
texture.repeat.y = 2;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
```

## Mipmapping : go back and review

Mipmapping is a technique that improves the performance of textures. It's a technique that generates multiple versions of the same texture, but at different resolutions, halving and halving to fill up the material.

When the texture is far away, the lower resolution version is used, and when the texture is close, the higher resolution version is used.

If you don't want to use mipmapping, you can use the `minFilter` and `magFilter` properties on a texture.

- `minFilter` : the filter used when the texture is scaled down. Using a very large image as a texture
- `magFilter` : the filter used when the texture is scaled up. Using a very small image as a texture

```javascript
const texture = textureLoader.load("/obama.jpg");
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
texture.generateMipmaps = false;
```

When setting the filter to `THREE.NearestFilter`, you can disable mipmapping and get a performance boost. It also gives a minecraft texture effect.

### Image files

- jpegs: usually lighter file size, lossy compression.
- pngs: usually heavier file size, lossless compression.

Texture files, their width and height must be a power of 2, since mipmapping divides down the image until it becomes 1x1.
