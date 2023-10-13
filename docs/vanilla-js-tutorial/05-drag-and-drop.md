# 05: Drag and Drop

## Enabling dragging

Make any elements you want to drag as draggable, by setting the HTML attribute `draggable` to `true` on any elements you want to drag.

```javascript
<div draggable="true" />
```

## Drag DOM events

We have a couple of drag DOM events that we need to listen to for enabling a drag and drop behavior.

- `dragstart` - fired when the user starts dragging an element or text selection. Only fires once, when the drag starts.
- `drag` - fired when the user is dragging an element or text selection. Fires multiple times, as the user drags.
- `dragend` - fired when the user has finished dragging an element or text selection. Fires once, when the drag ends.
- `dragenter` - fired when a dragged element or text selection enters a valid drop target. Fires multiple times, as the dragged element enters a new drop target.
- `dragover` - fired when a dragged element or text selection is being dragged over a valid drop target. Fires multiple times, as the dragged element is over a drop target.

### `dragstart`

### `dragover`

The `dragover` event is fired when dragging something over another element. By filling an implementation for this method, we can handle dropping elements into other elements.

```javascript
container.addEventListener("dragover", (e) => {
  e.preventDefault();
});
```

- Doing `e.preventDefault()` prevents the default behavior of showing a `not-allowed` cursor when dragging over an element.

## Drag Styling

## Sortable Drag and Drop example

### Bounding Box

The bounding box of an element lets us find it's width, height, and position relative to the viewport.

```javascript
const box = element.getBoundingClientRect();
```

Here are some properties of the bounding box:

- `box.top` - the top position of the element relative to the viewport.
- `box.left` - the left position of the element relative to the viewport.
- `box.width` - the width of the element.
- `box.height` - the height of the element.

We can use these properties to find the coordinates of the center of an element:

```javascript
const centerX = box.left + box.width / 2;
const centerY = box.top + box.height / 2;
```
