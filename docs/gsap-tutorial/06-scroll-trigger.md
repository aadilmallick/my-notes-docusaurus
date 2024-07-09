# Scroll trigger

## SeTUP

1. `npm i gsap`
2. `npm i lenis`
3. Use this started code to set up lenis smooth scrolling and gsap:

   ```ts
   const lenis = new Lenis();

   lenis.on("scroll", (e) => {
     console.log(e);
   });

   lenis.on("scroll", ScrollTrigger.update);

   gsap.ticker.add((time) => {
     lenis.raf(time * 1000);
   });

   gsap.ticker.lagSmoothing(0);
   ```

## Parallax

Parallax refers to the phenomenon where obejcts closer to you seem to move faster while objects in the background move slower. This effect can be achieved by using the `gsap` library.

### Creating assets

To create parallax assets, you need to export the same size image as layers. For example, if you have a background image, you need to export the same image in layers. The layers should be in the same size and position as the background image.

:::info
It's important to export the layers as svg files.
:::

Here is an example of how we do so in figma:

![figma example](https://www.webpagescreenshot.info/image-url/abS2HJqOY)

### Setup

You need to register the GSAP plugin and use the lenis smooth scroll library to get started.

```ts
import { gsap } from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/all";

function smoothScrollSetup() {
  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  gsap.registerPlugin(ScrollTrigger);
}

smoothScrollSetup();
```

### HTML

Each parallax layer will be a div with a background image. The parallax container will be relatively positioned and have its children divs be the absolutely positioned parallax layers.

```css
#parallax-container {
  position: relative;
  height: 100vh;
}

.parallax-layer {
  background-position: center bottom;
  background-repeat: none;
  background-size: cover;
  /* take up entire screen */
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  /* appear behind content */
  z-index: -1;
}
```

### JS

Use this simple function to accept filepaths and speeds for each layer, and then creates the animations:

```ts
function createParallax(
  parallaxContainer: HTMLElement,
  layers: string[],
  speeds: number[]
) {
  const parallaxLayers: { element: HTMLElement; speed: number }[] = [];

  if (layers.length !== speeds.length) {
    throw new Error("The number of layers and speeds must be the same");
  }

  layers.forEach((layer, index) => {
    const element = document.createElement("div");
    element.classList.add("parallax-layer");
    element.style.backgroundImage = `url(${layer})`;
    parallaxContainer.appendChild(element);
    parallaxLayers.push({ element, speed: speeds[index] });
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: parallaxContainer,
      start: "top top",
      scrub: true,
    },
  });

  parallaxLayers.forEach(({ element, speed }) => {
    tl.to(
      element,
      {
        y: 60 * speed,
        duration: 2,
      },
      0
    );
  });

  return parallaxLayers;
}
```

ANd here is an example of me using it:

```ts
import layer1 from "./assets/layer1.svg";
import layer2 from "./assets/layer2.svg";
import layer3 from "./assets/layer3.svg";

// 1. setup smooth scroll ...

// 2. query for parallax container
const parallaxContainer = selectWithThrow(
  "#parallax-container"
) as HTMLDivElement;

// 3. create parallax effect by providing image sources and speeds
createParallax(parallaxContainer, [layer1, layer2, layer3], [0.2, 1, 1.5]);
```
