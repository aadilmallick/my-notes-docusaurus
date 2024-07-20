# CSS Snippets

## Beautiful box shadows

- **soft shadow**: `box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);`

## Glassmorphism

```css
.glassmorphism {
  background-color: transparent;
  backdrop-filter: blur(20px);
}

.glassmorphism-white {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.glassmorphism-card {
  padding: 2rem;
  border-radius: 1rem;
}
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
