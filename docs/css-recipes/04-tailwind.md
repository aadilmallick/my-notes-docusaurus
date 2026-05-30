## Tailwind merge + clsx

1. `npm i tailwind-merge`
2. `npm i clsx`

```ts
import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Crash course: Essentials

### **Section 1: Responsiveness**

When using breakpoints, the style applies to the specified breakpoint and all sizes above. Behind the scenes, breakpoints just execute media queries. 

- `sm` : 640 px and above
- `md` : 768 px and above
- `lg` : 1024 px and above
- `xl` : 1280 px and above
- `2xl` : 1536 px and above

Tailwind is **mobile-first**, meaning that whatever styles you apply are applied to the smallest screen size first: 0px - infinite px, and then the breakpoints apply.

```html
<!-- base style is small text, but on medium and above sizes, text is large -->
<button class="text-sm md:text-lg">
```

### **Section 2: gradients**

There are three classes concerned with gradients: 
1. `bg-gradient-to-[direction]` handles the direction of the gradient 
2. `from-[color]-[shade_weight]` defines the starting color of the gradient. 
3. `to-[color]-[shade_weight]` defines the ending color of the gradient.

```html
<div class="h-12 w-24 bg-gradient-to-tr from-cyan-600 to-cyan-100"></div>
```

### **Section 3: Adding background images**

Although there are no utility classes for background images, you can create a custom class in the tailwind config for a background image. 

1. In the example below, we create the `bg-hero-image` class by applying the `hero-image` key in the backgroundImage config. 
```js
const heroImageUrl =
  'https://img.freepik.com/free-vector/hand-painted-watercolor-pastel-sky-background_23-2148902771.jpg?w=2000'

module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'hero-image': `url('${heroImageUrl}')`,
      },
    },
  },
  plugins: [],
}
```
2. We use the `bg-hero-image` class along with other background utilities to create an effective hero section using a single div. 
```html
<div class="bg-hero-image h-screen w-screen bg-cover bg-no-repeat bg-center"></div>
```

Here are some useful background utilities:
- `bg-cover`: background-size of cover 
- `bg-center`: background-position of center 
- `bg-no-repeat`: background-repeat of no-repeat. 

### **Section 4: animation utility classes** 

- `animate-none` : no animation 
- `animate-spin` : rotation animation, in an infinite circle
- `animate-bounce`: bouncing animation, infinite. 
- `animate-ping` : pinging animation, infinite. 
- `animate-pulse`: pulsing animation, infinite. 

### Section 5: variants

You have variants for dealing with pseudoselectors and states of elements, which are prefixes that apply the styles if in the variant state. The general syntax for the style is as so:

```
<variant>:<utility-class>
```

- `dark`: applies class if in dark mode
- `hover`: applies class if element is being hovered over
- `focus`: applies class if element is currently focused
- `starting`: applies class using `@starting-style` directive for the element

For more info about variants, go here:

```embed
title: "State Variants | Tailwind | Steve Kinney"
image: "https://stevekinney.com/courses/tailwind/state-variants/open-graph.jpg?v=14bd06a4"
description: "Apply styles conditionally using Tailwind's state variants for pseudo-classes, media queries, and attribute selectors"
url: "https://stevekinney.com/courses/tailwind/state-variants"
favicon: ""
aspectRatio: "52.5"
```

## Configuring Tailwind

### TailwindV4 config

In tailwind v4, all configuration will be in the whatever css file you have the `@import "tailwindcss"` pragma declared, and then you configure using CSS layers that tailwind provides:

- `@theme`: for modifying CSS variables, adding new colors, modifying tailwind colors, spacing, etc.
- `@base`: for modifying the base tailwind CSS styles of HTML elements and typography
- `@layer components`: reusable patterns
- `@utility`: one-off helpers

#### Theme config

The `@theme` directive is used for setting global CSS variables that are available in tailwind and throughout your CSS code. In this directive, you should create or modify CSS variables, and those variables will be automatically defined across your app, available in tailwind intellisense, and able to used 

```css
/* ✅ Define consistent tokens */
@theme {
  --color-brand: #ff6b35;
  --spacing-section: 123px;
}
```

Now you can youse utilities like `bg-color-brand` or `spacing-section` in your tailwind code.

```css
@import 'tailwindcss';

@theme {
  /* Single colors */
  --color-primary: #007bff;
  --color-accent: oklch(71.7% 0.25 360);

  /* Color scales */
  --color-brand-50: oklch(0.97 0.01 250);
  --color-brand-500: oklch(0.56 0.18 250);
  --color-brand-900: oklch(0.28 0.09 250);
}
```

Below is an example of how customized theme values are available as CSS variables (e.g., `--perspective-custom`) for use in your own CSS.

```css
@import 'tailwindcss';

@theme {
  --perspective-custom: 2000px;
  --transform-origin-fancy: top left;
}

.custom-element {
  transform-origin: var(--transform-origin-fancy);
}
```

#### Custom variants

In tailwind, you can customize what selectors certain variants like `dark:`, `hover:`, etc. apply to by using the `@custom-variant` directive.

Here is an example where dark mode classes prefixed with `dark:` will only apply to elements that have the class `.dark` applied or are children of such an element:

```css
/* Override dark variant to use class */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-background: white;
  --color-text: black;
}

.dark {
  --color-background: #1a1a1a;
  --color-text: white;
}
```

### Dark mode

You can specify styling specific for dark mode using the `dark:` prefix for your tailwind classes.

To add a dark-mode toggle, follow these steps for what to add in your CSS:

1. Add a custom variant that targets the `dark:` variant and specified on which selectors dark mode styles apply to. In this case, when setting `data-theme="dark"` on the root `<html>` element, that enables dark mode.

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

2. Create dark theme overrides for the `[data-theme="dark"]` selector, changing the values of CSS variables you set in the `@theme`.

```css title="index.css"
@import 'tailwindcss';

/* Define color scheme trigger */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme {
  /* Semantic colors that change with theme */
  --color-surface: white;
  --color-surface-alt: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-muted: #666;

  /* Brand colors stay consistent */
  --color-brand: #5b21b6;
  --color-success: #10b981;
  --color-danger: #ef4444;
}

/* Dark theme overrides */
[data-theme='dark'] {
  --color-surface: #1a1a1a;
  --color-surface-alt: #2a2a2a;
  --color-text: #f5f5f5;
  --color-text-muted: #999;
}
```

### Overriding and adding styles

You can add or override tailwind styles by using the new CSS layers syntax. The base `@tailwind` directives are just CSS layers, and you can add or override styles within those bases.

Use the `@layer` directives to apply styling and put it into a custom bucket, like the tailwind base, components, or utilities. It can either override styling or add to the bucket.

- `@layer base` : override default styling for the base elements. 
- `@layer components`: Add custom classes that will ebr ecognized by Tailwind 


> [!TIP] 
> Although you can just directly write classes in the CSS file, it is better to bucket styles into base, components, and utilities, as they are best practice semantically.


```css
@tailwind base;
@tailwind components;
@tailwind utilities;


@layer base {
    h1 : {                  /* overrides default h1 styling */
        font-size: 15rem;
    }
}

@layer components {
  .btn-blue : {
    @apply font-bold py-2 px-4 rounded bg-blue-500;
  }
}

@layer utilities {
  .p-21 {
    padding: 5.5rem;
    @variants hover, focus {
      .p-21{
        padding: 5.5rem;
      }
    }
  }
}
```

When creating your own custom classes in the `styles.css`, Tailwind does not automatically create variants for that style. You have to do them yourself.

```css
@variants pseudoselector1 , psuedoselector2 ... {

}
```

```css
@variants hover, focus {
    .btn {
        @apply font-bold py-2 px-4 rounded bg-blue-500;
    }
}

@layer utilities {
  .p-21 {
    padding: 5.5rem;
    @variants hover, focus {
      .p-21{
        padding: 5.5rem;
      }
    }
  }
}
```

### Directives

#### `@apply`

The `@apply` directive allows you to create custom classes that combine tailwind classes.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.btn {
  @apply font-bold py-2 px-4 rounded bg-blue-500;
}
```

### Functions

The `screen()` function is used for providing responsive breakpoint styles to certain custom css classes.
- `@media screen(sm)` = `@media (min-width: 640px)`.

You can then use it like so: 

```css
@media screen(sm) {   // will activate on sm:btn
    .btn {
        @apply font-bold py-2 px-4 rounded bg-blue-500;
    }
}
```

## Tips and tricks

### Starting style

The `@starting-style` CSS rule defines initial styles for first render:

```css
.modal {
  opacity: 1;
  transition: opacity 0.3s;
}

@starting-style {
  .modal {
    opacity: 0; /* Starting state */
  }
}
```

We have the equivalent of this in tailwind using the `starting:` variant, which applies a `@starting-style` directive for whatever styles we suffix after the variant.

```html
<div class="translate-x-0 transition-transform duration-300 starting:translate-x-full">
  Slides in from right
</div>
```