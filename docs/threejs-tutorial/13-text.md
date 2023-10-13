# 13: 3D text

## Loading text

Go to [http://gero3.github.io/facetype.js/](http://gero3.github.io/facetype.js/) and upload a font, ask back for a JSON file.

We will then use this JSON file as a static public asset in our project, and use it to load 3d fonts in three js.

```javascript
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
```

```javascript
const fontLoader = new FontLoader();

fontLoader.load("/wildwords.json", (font) => {});
```

We use the `FontLoader` class to create a fontloader object, and then use the `fontLoader.load()` method to load the font, which takes in two arguments:

- the path to the font file
- A callback function when the font is loaded, that takes in the font as an argument

In this callback, we can do this like create text geometries from the font.

## Creating text geometries

```javascript
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
```

Using the `TextGeometry` class, we can create a geometry specifically designed for handling text.

```javascript
const textGeometry = new TextGeometry("Text", options);
```

The first argument is the text to display, and the second is a list of options:

- `font`: the font to use. You can get this form the font loader callback
- `size`: the size of the text
- `height`: the thickness of the text
- `curveSegments`: the number of segments to use for the curves
- `bevelEnabled`: whether to enable beveling. Beveling is the process of adding a 3d effect to the text
- `bevelThickness`: the thickness of the bevel. This is the distance between the original text and the beveled text
- `bevelSize`: the size of the bevel. This is the distance between the beveled text and the bevel
- `bevelOffset`: the offset of the bevel. This is the distance between the beveled text and the original text
- `bevelSegments`: the number of segments to use for the bevel

```javascript
fontLoader.load("/wildwords.json", (font) => {
  const textGeometry = new TextGeometry("Barack Obama", {
    font,
    size: 0.5,
    height: 0.2,
    curveSegments: 2,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 2,
  });
  textGeometry.center();

  const textMaterial = new THREE.MeshMatcapMaterial({
    matcap: matcapTexture,
  });

  const text = new THREE.Mesh(textGeometry, textMaterial);
  text.position.z = 1;
  scene.add(text);
});
```

You can also center the text by using the `textGeometry.center()` method.
