# Text plugin

Setup the plugin like so:

```javascript
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);
```

You use the `text` property for the typewriter effect. You basically animate the text content of the elements you're animating.

In this example, the `h1` already has some text content, and we're animating from no text content to its original text content.

```javascript
const h1 = document.querySelector("h1")!;

gsap.from(h1, {
  text: "",
  duration: 5,
});
```
