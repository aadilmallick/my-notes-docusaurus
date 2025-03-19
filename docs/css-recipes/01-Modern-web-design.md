# Modern Web Design

## Modern Web Design recipes

### Hamburger button

This is the basic HTML structure of creating a hamburger from scratch, we will animate the bars to get a nice effect.

```html
<div class="hamburger">
  <div class="bar bar-1"></div>
  <div class="bar bar-2"></div>
  <div class="bar bar-3"></div>
</div>
```

- `.bar` : create tiny horizontal lines that will each look like a bar.
- `.hamburger` : give a defined height and width, separate the bars evenly using flexbox. We hide by default on large screens. But on small screens, we make it visible again by giving back its `flex` display.

```css
.bar {
  height: 4px;
  width: 100%;
  background-color: black;
  border-radius: 10px;
}

.hamburger {
  height: 24px;
  width: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  // hide by default
  display: none;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
}
```

#### Bar animations

Using Javascript, we will toggle **"animation"** classes on each of our bars, which have these certain animations:

- `.animate-bar-1` : The top bar will rotate down 45 degrees, using its top left corner as the pivot point.
- `.animate-bar-2` : the middle bar will shrink and dissappear, animating to `transform: scaleX(0)` and `opacity(0)`
- `.animate-bar-3` : The third bar will rotate 45 degrees up, using the bottom left corner as its pivot point.

```css
.animate-bar-1 {
  transform-origin: top left;
  animation: flip-bar-1 1s 1;
  animation-fill-mode: forwards;
}

.animate-bar-2 {
  animation: 1s fade-bar-2;
  animation-fill-mode: forwards;
}

.animate-bar-3 {
  transform-origin: bottom left;
  animation: flip-bar-3 1s 1;
  animation-fill-mode: forwards;
}

@keyframes flip-bar-1 {
  to {
    transform: rotate(45deg) translateY(7px) translateX(-3px);
  }
}

@keyframes fade-bar-2 {
  to {
    transform: scaleX(0);
    opacity: 0;
  }
}

@keyframes flip-bar-3 {
  to {
    transform: rotate(-45deg) translateY(-5px) translateX(-3px);
  }
}
```

Then use javascript to add the animation classes on click: 

```ts
const hamburger = document.querySelector(".hamburger");
const bars = hamburger.querySelectorAll(".bar");
const sidebar = document.querySelector(".mobile-nav");

hamburger.addEventListener("click", (e) => {
  bars[0].classList.toggle("animate-bar-1");
  bars[1].classList.toggle("animate-bar-2");
  bars[2].classList.toggle("animate-bar-3");
  sidebar.classList.toggle("show-sidebar");
});
```
### getting icons

Use this fontawesome link

``` css
<link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.6.1/css/all.css"
      integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP"
      crossorigin="anonymous"
    />
```

### Transparent Sticky Navbar

On the background image, a transparent navbar effect is very attractive. However, we want to add the backgrounf to the navbar once we scroll past a certain point. Here's how we achieve this:

1. Create a `.transparent` class that sets the background color to transparent. Set it on the navbar
2. In a `<script>` tag, if scrolled past a certain point, remove the transparent class. Else, keep add the transparent class.

```ts
.transparent {
    background-color: transparent;
}
```

```js
const nav = document.querySelector(".navbar");
	window.addEventListener("scroll", (e) => {
	if (window.pageYOffset > 100) {
	  nav.classList.remove("transparent");
	} else {
	  nav.classList.add("transparent");
	}
});
```
## HSL theming

```css
* {
  /* brand foundation */
  --brand-hue: 200;
  --brand-saturation: 100%;
  --brand-lightness: 50%;

  /* light */
  --brand-light: hsl(
    var(--brand-hue) var(--brand-saturation) var(--brand-lightness)
  );
  --text1-light: hsl(var(--brand-hue) var(--brand-saturation) 10%);
  --text2-light: hsl(var(--brand-hue) 30% 30%);
  --surface1-light: hsl(var(--brand-hue) 25% 90%);
  --surface2-light: hsl(var(--brand-hue) 20% 99%);
  --surface3-light: hsl(var(--brand-hue) 20% 92%);
  --surface4-light: hsl(var(--brand-hue) 20% 85%);
  --surface-shadow-light: var(--brand-hue) 10% 20%;
  --shadow-strength-light: 0.02;

  /* dark */
  --brand-dark: hsl(
    var(--brand-hue) calc(var(--brand-saturation) / 2) calc(var(
            --brand-lightness
          ) / 1.5)
  );
  --text1-dark: hsl(var(--brand-hue) 15% 85%);
  --text2-dark: hsl(var(--brand-hue) 5% 65%);
  --surface1-dark: hsl(var(--brand-hue) 10% 10%);
  --surface2-dark: hsl(var(--brand-hue) 10% 15%);
  --surface3-dark: hsl(var(--brand-hue) 5% 20%);
  --surface4-dark: hsl(var(--brand-hue) 5% 25%);
  --surface-shadow-dark: var(--brand-hue) 50% 3%;
  --shadow-strength-dark: 0.8;

  /* dim */
  --brand-dim: hsl(
    var(--brand-hue) calc(var(--brand-saturation) / 1.25) calc(var(
            --brand-lightness
          ) / 1.25)
  );
  --text1-dim: hsl(var(--brand-hue) 15% 75%);
  --text2-dim: hsl(var(--brand-hue) 10% 61%);
  --surface1-dim: hsl(var(--brand-hue) 10% 20%);
  --surface2-dim: hsl(var(--brand-hue) 10% 25%);
  --surface3-dim: hsl(var(--brand-hue) 5% 30%);
  --surface4-dim: hsl(var(--brand-hue) 5% 35%);
  --surface-shadow-dim: var(--brand-hue) 30% 13%;
  --shadow-strength-dim: 0.2;
}

:root {
  color-scheme: light;

  /* set defaults */
  --brand: var(--brand-light);
  --text1: var(--text1-light);
  --text2: var(--text2-light);
  --surface1: var(--surface1-light);
  --surface2: var(--surface2-light);
  --surface3: var(--surface3-light);
  --surface4: var(--surface4-light);
  --surface-shadow: var(--surface-shadow-light);
  --shadow-strength: var(--shadow-strength-light);
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;

    --brand: var(--brand-dark);
    --text1: var(--text1-dark);
    --text2: var(--text2-dark);
    --surface1: var(--surface1-dark);
    --surface2: var(--surface2-dark);
    --surface3: var(--surface3-dark);
    --surface4: var(--surface4-dark);
    --surface-shadow: var(--surface-shadow-dark);
    --shadow-strength: var(--shadow-strength-dark);
  }
}

[color-scheme="light"] {
  color-scheme: light;

  --brand: var(--brand-light);
  --text1: var(--text1-light);
  --text2: var(--text2-light);
  --surface1: var(--surface1-light);
  --surface2: var(--surface2-light);
  --surface3: var(--surface3-light);
  --surface4: var(--surface4-light);
  --surface-shadow: var(--surface-shadow-light);
  --shadow-strength: var(--shadow-strength-light);
}

[color-scheme="dark"] {
  color-scheme: dark;

  --brand: var(--brand-dark);
  --text1: var(--text1-dark);
  --text2: var(--text2-dark);
  --surface1: var(--surface1-dark);
  --surface2: var(--surface2-dark);
  --surface3: var(--surface3-dark);
  --surface4: var(--surface4-dark);
  --surface-shadow: var(--surface-shadow-dark);
  --shadow-strength: var(--shadow-strength-dark);
}

[color-scheme="dim"] {
  color-scheme: dark;

  --brand: var(--brand-dim);
  --text1: var(--text1-dim);
  --text2: var(--text2-dim);
  --surface1: var(--surface1-dim);
  --surface2: var(--surface2-dim);
  --surface3: var(--surface3-dim);
  --surface4: var(--surface4-dim);
  --surface-shadow: var(--surface-shadow-dim);
  --shadow-strength: var(--shadow-strength-dim);
}

/* READY TO USE! */
.brand {
  color: var(--brand);
  background-color: var(--brand);
}

.surface1 {
  background-color: var(--surface1);
  color: var(--text2);
}

.surface2 {
  background-color: var(--surface2);
  color: var(--text2);
}

.surface3 {
  background-color: var(--surface3);
  color: var(--text1);
}

.surface4 {
  background-color: var(--surface4);
  color: var(--text1);
}

.text1 {
  color: var(--text1);
}

p.text1 {
  font-weight: 200;
}

.text2 {
  color: var(--text2);
}
```

You can then easily switch between themes by changing the `color-scheme` attribute on the `html` element.

```js
const switcher = document.querySelector("#theme-switcher");
const doc = document.firstElementChild;

switcher.addEventListener("input", (e) => setTheme(e.target.value));

const setTheme = (theme) => doc.setAttribute("color-scheme", theme);
```

### Dark Mode switcher

```html
<button
  class="theme-toggle"
  id="theme-toggle"
  title="Toggles light & dark"
  aria-label="auto"
  aria-live="polite"
>
  <svg
    class="sun-and-moon"
    aria-hidden="true"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <mask class="moon" id="moon-mask">
      <rect x="0" y="0" width="100%" height="100%" fill="white" />
      <circle cx="24" cy="10" r="6" fill="black" />
    </mask>
    <circle
      class="sun"
      cx="12"
      cy="12"
      r="6"
      mask="url(#moon-mask)"
      fill="currentColor"
    />
    <g class="sun-beams" stroke="currentColor">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
</button>
```

```css
@import "https://unpkg.com/open-props/easings.min.css";

.sun-and-moon > :is(.moon, .sun, .sun-beams) {
  transform-origin: center;
}

.sun-and-moon > :is(.moon, .sun) {
  fill: var(--icon-fill);
}

.theme-toggle:is(:hover, :focus-visible) > .sun-and-moon > :is(.moon, .sun) {
  fill: var(--icon-fill-hover);
}

.sun-and-moon > .sun-beams {
  stroke: var(--icon-fill);
  stroke-width: 2px;
}

.theme-toggle:is(:hover, :focus-visible) .sun-and-moon > .sun-beams {
  stroke: var(--icon-fill-hover);
}

[data-theme="dark"] .sun-and-moon > .sun {
  transform: scale(1.75);
}

[data-theme="dark"] .sun-and-moon > .sun-beams {
  opacity: 0;
}

[data-theme="dark"] .sun-and-moon > .moon > circle {
  transform: translateX(-7px);
}

@supports (cx: 1) {
  [data-theme="dark"] .sun-and-moon > .moon > circle {
    cx: 17;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .sun-and-moon > .sun {
    transition: transform 0.5s var(--ease-elastic-3);
  }

  .sun-and-moon > .sun-beams {
    transition: transform 0.5s var(--ease-elastic-4), opacity 0.5s var(--ease-3);
  }

  .sun-and-moon .moon > circle {
    transition: transform 0.25s var(--ease-out-5);
  }

  @supports (cx: 1) {
    .sun-and-moon .moon > circle {
      transition: cx 0.25s var(--ease-out-5);
    }
  }

  [data-theme="dark"] .sun-and-moon > .sun {
    transition-timing-function: var(--ease-3);
    transition-duration: 0.25s;
    transform: scale(1.75);
  }

  [data-theme="dark"] .sun-and-moon > .sun-beams {
    transition-duration: 0.15s;
    transform: rotateZ(-25deg);
  }

  [data-theme="dark"] .sun-and-moon > .moon > circle {
    transition-duration: 0.5s;
    transition-delay: 0.25s;
  }
}
```

```js
const storageKey = "theme-preference";

const onClick = () => {
  // flip current value
  theme.value = theme.value === "light" ? "dark" : "light";

  setPreference();
};

const getColorPreference = () => {
  if (localStorage.getItem(storageKey)) return localStorage.getItem(storageKey);
  else
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
};

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value);
  reflectPreference();
};

const reflectPreference = () => {
  document.firstElementChild.setAttribute("data-theme", theme.value);

  document
    .querySelector("#theme-toggle")
    ?.setAttribute("aria-label", theme.value);
};

const theme = {
  value: getColorPreference(),
};

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = () => {
  // set on load so screen readers can see latest value on the button
  reflectPreference();

  // now this script can find and listen for clicks on the control
  document.querySelector("#theme-toggle").addEventListener("click", onClick);
};

// sync with system changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    theme.value = isDark ? "dark" : "light";
    setPreference();
  });
```

## Gradients

### Gradient theory

When making a gradient of two highly saturated colors like blue and yellow, in the middle of the gradient you end up with a desaturated color like gray, which is the _gray dead zone_. We want to avoid this problem.

Instead of using rgb colors, we can use HSL colors and keep the saturation and brightness constant. This way, we can avoid the gray dead zone.

```css
.gradient {
  /* middle value will be hsl(125, 100%, 50%), which is not gray. It's green! */
  background: linear-gradient(
    to right,
    hsl(200, 100%, 50%),
    hsl(50, 100%, 50%)
  );
}
```

Just use this tool to generate gradients: [gradient generator](https://www.joshwcomeau.com/gradient-generator/)

## Shadows

### Theory

We want to model our shadows from a ight source, and the shadows should be consistent across the site, as if they are all created from the same light source.

More info: [https://tobiasahlin.com/blog/layered-smooth-box-shadows/](https://tobiasahlin.com/blog/layered-smooth-box-shadows/)

Also use this [shadow generator tool](https://shadows.brumm.af/)

![alt](https://www.webpagescreenshot.info/image-url/RERkp7oFw)

Here is how you can layer box shadows:

```css
.layered.box {
  box-shadow: 0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% /
          0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% /
          0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075);
}
```

And here are the elevation levels you can use. In general, the closer an element should be to the user, the higher elevation it should have.

```js
const ELEVATIONS = {
  small: `
    0.5px 1px 1px hsl(var(--shadow-color) / 0.7)
  `,
  medium: `
    1px 2px 2px hsl(var(--shadow-color) / 0.333),
    2px 4px 4px hsl(var(--shadow-color) / 0.333),
    3px 6px 6px hsl(var(--shadow-color) / 0.333)
  `,
  large: `
    1px 2px 2px hsl(var(--shadow-color) / 0.2),
    2px 4px 4px hsl(var(--shadow-color) / 0.2),
    4px 8px 8px hsl(var(--shadow-color) / 0.2),
    8px 16px 16px hsl(var(--shadow-color) / 0.2),
    16px 32px 32px hsl(var(--shadow-color) / 0.2)
  `,
};
```

## Images

### Fancy Images: before and after borders


## Forms

### CSS-only form validation styling

A good way to style inputs based on a valid and invalid state is to use these pseudoselectors:

- `:user-valid` : applies styles smartly when the input has valid text inside it 
- `:user-invalid` : applies styles smartly when the input does not have valid text inside it 
- `:focus:invalid`: applies styles when the input is invalid and the user is currently focused on the input. 

```css
input {
  outline: 3px solid hsl(203, 30%, 26%);
}

input:user-valid {
  outline-color: var(--clr-success);
}

input:user-invalid {
  outline-color: var(--clr-error);
}

input:focus:invalid {
  outline-color: var(--clr-warning)
}
```

### Styling form fields

The `accent-color` property styles the inside color of form elements. The `caret-color` property styles the cursor color for text input and text area elements.

## CSS Layouts

### Centering

We can center items relative to their parent container with a grid display and `place-items: center`.

```css
.centering-parent {
	display: grid;
	place-items: center;
}
```

### Flex wrap equal size boxes

We give the flex parent a `flex: wrap` property and all the flex children these three properties:
1. `flex-basis`: to set the minimum width for each child
2. `flex-shrink: 0`: prevents children from shrinking
2. `flex-grow: 1`: lets children grow to fill container and all take up equal width.

### Auto size header and footer

![pancake stack](https://www.webpagescreenshot.info/image-url/bZT08-D5C)

You can have a full screen dashboard type layout by using the `grid-template-rows` property like so: 

```css
.dashboard {
	display: grid;
	grid-template-rows: auto 1fr auto;
	height: 100vh;
}
```

### RAM (repeat, auto-fill, minmax)

```css
.ram {
	display: grid;
	--basis-width: 350px;
	grid-template-columns: repeat(auto-fill, minmax(var(--basis-width), 1fr));
	place-items: center; 
}
```

### aspect ratio

The `aspect-ratio` property is great for maintaining the aspect ratio of an element. 
## UI trends

### Glassmorphism

Glassmorphism is where you have an image or gradient background, and then you have a card that is mostly transparent and has a `backdrop-filter: blur()` set on it, blurring the background. 

Here are the main elements of the style: 

- **necessary** : Translucent/transparent background color
- **necessary**: blur backdrop filter
- Box shadow
- high border radius
- Translucent border

```ts
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(7px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

### Neumorphism

Neumorphism design is based off of using realistic shadows. The top right corner of an element should have a light-colored shadow, while the bottom right corner of an element gets a dark-colored shadow. 

This produces a soft, realistic look.

```css
.neumorphism {
  --top-left-shadow: 12px 12px 12px rgba(0, 0, 0, 0.1);
  --bottom-right-shadow: -10px -10px 10px rgba(0, 0, 0, 0.1);
  box-shadow: var(--top-left-shadow), var(--bottom-right-shadow);
}
```

## Scrolling

### Styling scrollbars

This is a basic example of how to style a scrollbar:

```css
.fancy-scroll {
  --size: 10px;
  --track-color: hsl(190, 23%, 90%);
  --track-active: hsl(192, 8%, 74%);
  --thumb-color: hsl(191, 20%, 38%);
  --thumb-hover: hsl(191, 30%, 44%);
  --thumb-active: hsl(191, 40%, 48%);
  &::-webkit-scrollbar {
    height: var(--size);
    width: var(--size);
  }
  &::-webkit-scrollbar-track {
    border-radius: 5px;
    background-color: var(--track-color);
  }

  &::-webkit-scrollbar-track:hover {
    background-color: var(--track-active);
  }

  &::-webkit-scrollbar-track:active {
    background-color: var(--track-active);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: var(--thumb-color);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--thumb-hover);
  }

  *::-webkit-scrollbar-thumb:active {
    background-color: var(--thumb-active);
  }
}
```

### Scroll snap

```css
.parent {
	/* aggressive scroll snap */
	scroll-snap-type: y mandatory;
}

.child {
	/* align with start of element */
	scroll-snap-align: start;
}
```

- `scroll-snap-type`: the property you set on the parent, which is the scroll container. 
	- **first value**: the axis to which to scroll on, `x` for horizontal and `y` for vertical.
	- **second value**: the behavior. `mandatory` to force always scroll snapping, and `proximity` only snaps if close to the `scroll-snap-align` of the child.


> [!NOTE] 
> In most cases you should set the `scroll-snap-type` property on the `html` element.


