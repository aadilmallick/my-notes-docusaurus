# Modern Web Design

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

## Images

### Fancy Images: before and after borders
