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

**Section 1: Responsiveness**

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

**Section 2: gradients**

There are three classes concerned with gradients: 
1. `bg-gradient-to-[direction]` handles the direction of the gradient 
2. `from-[color]-[shade_weight]` defines the starting color of the gradient. 
3. `to-[color]-[shade_weight]` defines the ending color of the gradient.

```html
<div class="h-12 w-24 bg-gradient-to-tr from-cyan-600 to-cyan-100"></div>
```

**Section 3: Adding background images**

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

**Section 4: animation utility classes** 

- `animate-none` : no animation 
- `animate-spin` : rotation animation, in an infinite circle
- `animate-bounce`: bouncing animation, infinite. 
- `animate-ping` : pinging animation, infinite. 
- `animate-pulse`: pulsing animation, infinite. 
## Configuring Tailwind

### Dark mode

You can specify styling specific for dark mode using the `dark:` prefix for your tailwind classes.

You can set your entire application to dark mode by first applying the `dark` class onto the `<html>` element, and then changing something in the tailwind config. 

1. Set `dark` class on the `<html>` element 
```html
<html class="dark"> 
```
2. Add the `darkMode` into the tailwind config and set it to `class`. 
```
darkMode: "class"
```

You can toggle dark mode in your application by adding and removing the `dark` class from the html element. 

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