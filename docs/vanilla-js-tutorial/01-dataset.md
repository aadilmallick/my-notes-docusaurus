# 01: Using Datasets

A quick way to store data on HTML elements is to use the `data-` prefix attributes. The idea is that any attributes prefixed with `data-` are dummy placeholders for some other type of data that you want to persist through the DOM.

```html
<div data-key="65" class="key"></div>
```

You can then access that value in your javascript through the `dataset` property on the element, which every HTML element has.

The `dataset` property is an object of all data attributes set on an HTML element.

```javascript
const div = document.querySelector(".key");
console.log(div.dataset.key); // 65
```
