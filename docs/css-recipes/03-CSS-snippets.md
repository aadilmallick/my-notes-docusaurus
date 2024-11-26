# CSS Snippets

## Beautiful box shadows

- **soft shadow**: `box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);`

### Gradient Shadow

Gradient shadows involve using a before psuedoelement with a `conic-gradient` background and an `inset` with a positive number of pixels. 

```css
button::before {
	content: "";
	/* 1. set position absolute */
	position: absolute;
	/* 2. set positive inset */
	inset: 5px;
	/* 3. set conic gradient rainbow background */
	background: conic-gradient(
	  red 6deg,
	  orange 6deg 18deg,
	  yellow 18deg 45deg,
	  green 45deg 110deg,
	  blue 110deg 200deg,
	  purple 200deg,
	  white 200deg 240deg,
	  rgb(114, 24, 39) 240deg 300deg,
	  rgb(248, 33, 33) 300deg 360deg
	);
	/* 4. add blur */
	filter: blur(15px);
```
## CSS Reset

```css
/*
  1. Use a more-intuitive box-sizing model.
*/
*,
*::before,
*::after {
  box-sizing: border-box;
}
/*
  2. Remove default margin
*/
* {
  margin: 0;
}
/*
  Typographic tweaks!
  3. Add accessible line-height
  4. Improve text rendering
*/
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
/*
  5. Improve media defaults
*/
img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}
/*
  6. Remove built-in form typography styles
*/
input,
button,
textarea,
select {
  font: inherit;
}
/*
  7. Avoid text overflows
*/
p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}
/*
  8. Create a root stacking context
*/
#root,
#__next {
  isolation: isolate;
}
```



## Loaders

### Skeleton Loaders

#### Basic Skeleton Loader

Here are the basic styles for skeleton loading utilities:

```scss
// skeleton animation class
.animated-bg {
  background-image: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 10%,
    #f6f7f8 20%,
    #f6f7f8 100%
  );
  background-size: 200% 100%;
  animation: bgPos 1s linear infinite;
}

// component for skeleton text
.animated-bg-text {
  border-radius: 50px;
  display: inline-block;
  height: 0.5rem;
  width: 100%;
}

// component for skeleton avatar
.animated-bg-avatar {
  border-radius: 9999px;
  display: inline-block;
  height: 2rem;
  width: 2rem;
}

// animation that moves linear gradient
@keyframes bgPos {
  0% {
    background-position: 50% 0;
  }

  100% {
    background-position: -150% 0;
  }
}
```

THe skeleton animation is based on setting the background color to a grayish linear gradient, and then moving that gradient to the side continously by animating `background-position`

And here would be an example of HTML using the skeleton loading classes:

```html
<div class="card">
  <div class="animated-bg image-container"></div>
  <div class="content">
    <div class="header">
      <div class="animated-bg animated-bg-avatar"></div>
      <h3 class="animated-bg animated-bg-text"></h3>
    </div>
    <div class="body">
      <p class="animated-bg animated-bg-text"></p>
      <p class="animated-bg animated-bg-text"></p>
      <p class="animated-bg animated-bg-text"></p>
    </div>
  </div>
</div>
```
## Buttons

### Gradient buttons

#### Solid gradient button

```css
.gradient-btn {
  --color-1: #ff4545;
  --color-2: #00ff99;
  --radius: 9999px;
  border-radius: var(--radius);
  transition: box-shadow 0.25s;
  background-image: linear-gradient(
    to bottom right,
    var(--color-1),
    var(--color-2)
  );
  &:hover {
    box-shadow: 40px 0 100px var(--color-1), -40px 0 100px var(--color-2);
  }
}
```

#### Outline gradient button

For an outline gradient border button effect, you need to have a pseudoelement absolutely positioned on top of the button and a little larger, and then use z-index to position it behind the button.

1. HTML content should be a button with text content nested inside span to avoid z-indexing issues with span. The text should appear above gradient background when hovered on.
2. Add relative positioning to the button
3. Create absolutely positioned pseudoelement same size as button and give `z-index: -1` to put behind content. Also give it padding to poke out from behind.

On a hover effect, you can have a large colored block shadow appear, and to reduce the glow intensity, you can reduce the opacity of the shadow colors. 

```css
.gradient-btn-outline {
  --color-1: #ff4545;
  --color-2: #00ff99;
  --radius: 9999px;
  border-radius: var(--radius);

  position: relative;
  box-sizing: content-box;
  transition: box-shadow 0.25s;
  
  /* 1b. give span high z-index to avoid text being covered up */
  span {
    position: relative;
    z-index: 10;
  }
  
  /* 2. absolutely positioned pseudoelement. Adds padding and gradient */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    z-index: -1;
    background-image: linear-gradient(
      to bottom right,
      var(--color-1),
      var(--color-2)
    );
    padding: 2px;
    border-radius: var(--radius);
  }
  /* 3. shadow hover effect */
  &:hover {
    box-shadow: 40px 0 100px var(--color-1), -40px 0 100px var(--color-2);
    z-index: 0;
  }
}
```


#### Fancy solid gradient button

```ts
.bn29 {
  border: none;
  padding: 0.8em 2.5em;
  outline: none;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  position: relative;
  z-index: 1;
  cursor: pointer;
  background: none;
  text-shadow: 3px 3px 10px rgba(0, 0, 0, 0.45);
  box-shadow: 0 0.5rem 2rem 0.5rem rgba(0, 0, 0, 0.2);
}

.bn29:before,
.bn29:after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 10em;
  -webkit-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
  width: 105%;
  height: 105%;
  content: "";
  z-index: -2;
  background-size: 400% 400%;
  background: linear-gradient(
    60deg,
    var(--text-muted-blue),
    var(--primary),
    var(--secondary),
    var(--text-muted-primary)
  );
}

.bn29:before {
  -webkit-filter: blur(7px);
  filter: blur(7px);
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
  -webkit-animation: pulse 10s infinite ease;
  animation: pulse 10s infinite ease;
}

.bn29:after {
  -webkit-filter: blur(0.3px);
  filter: blur(0.3px);
}

.bn29:hover:before {
  width: 115%;
  height: 115%;
}
```

## Text

### Line clamp

```css
.line-clamp-3 {
	max-width: 75ch;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical
}
```

### Gradient Text

Below is how you make gradient text.

```css
h1 {
	background: linear-gradient(to right, red, blue);
	background-clip: text;
	color: transparent;
}
```

#### Animated gradient Text

We can animate the background position property to make our gradient move through the text: 

```css
.animated-text-gradient {
  --color-one: hsl(15 90% 55%);
  --color-two: hsl(40 95% 55%);
  --bg-size: 400%;

  background: linear-gradient(
      90deg,
      var(--color-one),
      var(--color-two),
      var(--color-one)
    )
    0 0 / 100% 100%;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: move-bg 8s infinite linear;
}

@media (prefers-reduced-motion: no-preference) {
  .animated-text-gradient {
    animation: move-bg 8s linear infinite;
  }
  @keyframes move-bg {
    to {
      background-position: var(--bg-size) 0;
    }
  }
}

@keyframes move-bg {
  to {
    background-position: var(--bg-size) 0;
  }
}
```

```html
<h1 class="animated-text-gradient">Hello World</h1>
```
### Changing Selection Color

The below ode changes the selection color of text.  Use the `::selection` pseudoelement to style this

```css
::-moz-selection {
  /* Code for Firefox */
  color: var(--secondary);
  background: white;
}

::selection {
  color: var(--secondary);
  background: white;
}
```