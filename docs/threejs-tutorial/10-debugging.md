# 10: GUI for debugging

We will use the `lil-gui` library for debugging our threeJS applications. Lil gui allows us to visualize the properties of threeJS objects and the environment and change them in real time.

```bash
npm install --save-dev lil-gui
```

```javascript
import * as dat from "lil-gui";
```

:::tip cool tip
Lil gui works with any objects, not just threeJS. So you can use it as an easy way to change state within the app. But you need to pass in objects, since it needs the reference value.
:::

## Basic field debugging

`lil-gui` shows a GUI field for any object you pass in. It handles primitive types well, giving stuff like sliders for numbers, text fields for strings, and checkboxes for booleans.

Instantiate the GUI like so:

```javascript
const gui = new dat.GUI();
```

You add a field with the `gui.add()` method, which takes in two parameters - the object you want to debug, and the property of that object you want to debug.

Now any changes we make using the GUI will affect the object we passed in, changing state without having to explicitly say so.

```javascript
gui.add(object, "property");
```

You can chain methods on this as well, dependeing on whether you're dealing with a primitive type, different data types, etc. Each method returns the gui, so you can chain them together.

You can specify the field name of each field in the GUI by chaining on the `.name()` method.

```javascript
const parameters = {
  name: "Rocky",
};

gui.add(parameters, "name").name("My cat's name");
```

[![image.png](https://i.postimg.cc/R0QgYPCw/image.png)](https://postimg.cc/QBCg9JTM)

### Numbers and sliders

When working with numbers, you get back a slider, or you can have a dropdown.

Here are some methods you can chain on when working with numbers:

- `.min(num)` : sets the minimum value of the field to `num`
- `.max(num)` : sets the maximum value of the field to `num`
- `.step(num)` : sets the step value (the increment) of the field to `num`

```javascript
gui.add(blueCube.position, "y").min(-3).max(3).step(0.01).name("elevation");
```

### Dropdowns

If you don't want to have a slider, you can specify dropdown select values by passing in a third argument to the `gui.add()` method. This argument is an array of values you want to be able to select from.

```javascript
gui.add(blueCube.scale, "x", [0, 1, 2]).name("scale x");
```

If you want to provide your own labels to the dropdown, you can use an object instead, where the keys are the option labels, and the values are the option values.

```javascript
gui.add(blueCube.scale, "x", { none: 0, normal: 1, double: 2 }).name("scale x");
```

### Checkboxes

Creating fields with boolean values changes the field to a checkbox.

```javascript
gui.add(blueCube, "visible").name("show cube");
gui.add(orbitControls, "enabled").name("toggle orbit controls");
gui.add(blueCube.material, "wireframe").name("toggle wireframe");
gui.add(axes, "visible").name("show axes");
```

### Text fields

Passing in a string property makes the field a text field.

```javascript
gui.add(h1, "textContent").name("change title");
```

### Functions

You can also pass in functions to the `gui.add()` method, and it will create a button that calls the function when clicked.

Keep in mind this function actually has to be a method on an object, since the first argument of the `gui.add()` method must always be an object.

```javascript
const parameters = {
  spinCube: () => {
    blueCube.rotation.y += Math.PI / 4;
  },
};

gui.add(blueCube, "spinCube").name("spin cube");
```

## Advanced properties

For properties you want to keep state changes for, but they don't have any primitive value properties, you can take advantage of the `onChange()` method and the `parameters` pattern to use another object for state, and change the actual object you want to change in the `onChange()`.

1. create a `parameters` object that holds all the primitive properties you want to keep track of
2. On the `onChange()` chain method, make sure to change the actual object you want to change

### Colors

Since the `.material.color` property on the mesh is not a primitive but rather an object of `Color`, we have to create our own object using the `parameters` pattern, and then change the actual object in the `onChange()` method.

```javascript
const parameters = {
  color: "#6f9b6f",
};
```

Even though only the `parameters.color` state is changing, we can use that property to set the color on the threeJS object.

```javascript
gui.addColor(parameters, "color").onChange(() => {
  blueCube.material.color.set(parameters.color);
});
```

### Scale

```javascript
const parameters = {
  scale: 1,
};
```

```javascript
gui
  .add(parameters, "scale")
  .name("scale all")
  .max(5)
  .min(0.01)
  .onChange(() => {
    blueCube.scale.set(parameters.scale, parameters.scale, parameters.scale);
  });
```
