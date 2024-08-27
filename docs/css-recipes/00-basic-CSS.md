# Basic CSS

## The basics you might not know

### Emmet Crash Course

Here is how to use emmet to quickly scaffold out HTML:

- `h1.className` : the `class` attribute shortcut. Creates `h1` tag with the specified class.
- `>` : create child operator.
- `+` : adjacent element operator
- `h1*8` : creates 8 `<h1>` tags.
- `h1{someText}` : creates an `<h1>` tag and populates it with the provided text.

### Images

You should always style any media elements like images or videos with `display: block` to avoid the weird quirks with inline styling. And then always set their `max-width: 100%` and `height: auto` to avoid overfilling their container. 

Here are the best practices for images: 
1. Always give them **block** display
2. Make sure to always nest them in a div container.
3. Always set a `height` and `width` attribute on them to avoid layout shift.

Here are the base styles to set for all images: 

```css
img {
	display: block;
	height: auto;
	max-width: 100%;
}
```


#### Object fit with images

```css
img {
  max-width: 100%;
  height: 300px;
  display: block;
  object-fit: cover;
}
```

After setting a fixed width and height on an image, you can use the `object-fit` property to change the behavior of how the image fills its container.

### Margin collapsing

When two block level elements have vertical margin, like a `margin-top` and a `margin-bottom` pushing against each other, the margins collapse to use the larger margin. **Only vertical margins collapse**.

```html
<style>
  .h1 {
    margin-bottom: 10px;
  }
  .h2 {
    margin-top: 100px;
  }
</style>
<h1 class="h1">hello</h1>
<h2 class="h2">hello 2</h2>
```

In the example above, the resulting margin between the `<h1>` and `<h2>` is not `110px`, but rather the larger of the two, which is `100px`.

### background position

When using the keywords, they align the corners of the image with the corners of the container.

A `background-position: top left` makes the top left corner of the image align with the top left corner of the container.

## Flexbox Tutorial

### Controlling the size of flex items

#### Flex-grow

By default, all flex-children will never grow past their original size. We use the `flex-grow` property to allow flex children to grow past their original size.

The `flex-grow` property controls how the element will fill out the space of the container as the container size changes, relative to other flex-children.

- By default, all flex children have a `flex-grow: 0`, meaning that their initial size do not change at all.
- A flex child with `flex-grow: 1` will try to take up as much space as possible.

#### Flex-shrink

By default, all flex-children will never grow past their original size, but will shrink if necessary.

The `flex-shrink` property controls how flex-items shrink relative to other flex-children.

- By default, all flex children have a `flex-shrink: 1`: meaning they will shrink if necessary to stay in the container.

#### Flex-basis

The `flex-basis` property controls the minimum width or height for a flexbox item, making sure that the item can never shrink below what you set.

Setting a `flex-basis: 150px` for a flex child means that flex child will never shrink below 150px.


> [!WARNING] You need to set box sizing correctly
> It is advisable to set `border-sizing: border-box` to not get janky behavior with padding and `flex-basis`.

#### Flex

The `flex` property is a shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.

```css
flex: flex-grow flex-shrink flex-basis
```

The default value for `flex` is `flex: 0 1 auto`, meaning that flex items don't grow, they only shrink, and that their minimum width/height is whatever space their content inherently takes up.

A common split layout where each child takes up as much space as possible within their row is as follows: 

```css
.split-item {
	flex: 0 1 50%; /* only take up max 50% space, but shrink if necessary */
}
```

## Grid Tutorial

### Setting up rows and columns

`grid-template-columns` and `grid-template-rows` decide the number of columns and the number of rows along with their respectives widths/heights. You can use normal css measurement values, but you can also use `fr` fraction values, which will distribute in a fractional matter.

**fractions**
```
grid-template-columns: 1fr 1fr 1fr;
```
- Makes 3 columns, each 1/3 width

**repeat**
```
grid-template-columns: repeat(2, 200px);
```
- makes 2 columns, each 200px wide

**repeat with minmax**

The `minmax(min, max)` function sets a min and max value to choose from. You can combine this with repeat to set minimum widths for columns and rows, etc. 

The real power of minmax comes from using dynamic values as the minimum or maximum, like so: 
- `minmax(250px, 1fr)`: minimum is 250px, max is 1fr (as much space as possible)
- `minmax(auto, 300px)`: max is 300px, min is just inherent size of content

```css
.min-width-columns {
	/* 3 columns, min-width 250px, max 1fr */
	grid-template-columns: repeat(3, minmax(250px, 1fr))
}
```

### Assigning grid items to space

Use the `grid-row` and `grid-column` properties to define how many cells wide and tall a grid item should be. 

Grid lines start at 1, and you can refer to the end as -1.

```css
.box:first-child {
  grid-column: 4 / span 1;
  grid-row: 3 / span 1;
}
```

> [!TIP] Absolute positioning
> You can achieve an absolute positioning effect by stacking grid items in the same cell, stacking each grid item on top of each to produce the illusion of absolute positioning.

#### Naming grid lines

```css
.container {
  display: grid;
  grid-template-columns: [col1-start] 1fr [col1-end col2-start] 1fr [col2-end col3-start] 1fr [col3-end];
  grid-template-rows: [row1-start] 1fr [row1-end row2-start] 1fr [row2-end row3-start] 1fr [row3-end];
}
```

Inside brackets `[]` before each of the values defining the size of rows or columns, we can name our grid lines and refer to their names instead of the numbers.

- We can define multiple names for the same grid line by separating names with a space.

```css
.container {
  display: grid;
  grid-template-columns: [col1-start] 1fr [col1-end col2-start] 1fr [col2-end col3-start] 1fr [col3-end];
  grid-template-rows: [row1-start] 1fr [row1-end row2-start] 1fr [row2-end row3-start] 1fr [row3-end];
}

.box:first-child {
  grid-column: col3-start / col3-end;
  grid-row: row2-start / row3-end;
}
```


#### Using grid template areas

```scss
.container {
  grid-template-rows: repeat(4, 100px);
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas:
    "a a b"
    "c c b"
    "d e f"
    "g g f";
}
```

You can visually set up your layout with `grid-template-areas`, and then you assign your grid-items to certain areas in the layout using the `grid-area` property.

- Each string corresponds to a row
- Each value you put in a string corresponds to a column.
- You cannot use numbers to represent the columns in the `grid-template-areas` property.

```css
body {
    background-color: black;
}

.grid-item {
    background-color: blue;
    min-height: 100px;
    border: 3px solid red;
}

.grid-container {
    display: grid;
    border: 10px solid yellow;
    grid-auto-rows: minmax(150px, auto);
    gap: 50px 50px;
    
    /* 1. define how the grid should look like */
    grid-template-areas:
    "header header"
    "sidebar content";
}

/* 2. assign each grid item to their space using their grid are name */
.grid-item-1 {
    grid-area: header;
}

.grid-item-2 {
    grid-area: sidebar;
}

.grid-item-3 {
    grid-area: content;
}
```


### Implicit Grid

When you define a certain number of columns and rows, and the grid is completely filled up, and you add more grid items to the grid, the **implicit grid** kicks in. 

The default behavior is to add an extra row to the grid and just start adding elements in there, but you can configure that behavior with these properties: 

- `grid-auto-rows:` defines the height of the implicit row new grid items are added into. The default value is to only fit the content of the grid item added in.
- `grid-auto-flow`: determines how new grid items get added to the grid. The default behavior is `row`, meaning an extra implicit row is added, but you can change it to `column` to make extra implicit columns be added.
- `grid-auto-columns:` defines the width of the implicit column new grid items are added into. The default value is to only fit the content of the grid item added in.

### Content Layout in the grid

When dealing with content layout, you have two aspects to worry about: 
1. Aligning the grid item within their grid cell/area
2. Aligning the grid items with respect to each other and the grid layout.

**grid item content alignment**

The below properties are used for aligning the a grid item within their grid cell
- `align-items` : vertically aligns content within a grid cell. Default is `stretch`
- `justify-items` : horizontally aligns content within a grid cell. Default is `start`
- `align-self` : vertically aligns content for a specific grid item
- `justify-self` : horizontally aligns content for a specific grid item

**grid item alignment**

- `justify-content` : controls how grid items are aligned on the horizontal axis. Works only if using non-fraction values for the grid-template-columns. Default is `flex-start`.
- `align-content` : controls how grid items are aligned on the vertical axis. Default is `stretch`. Only works if you give a defined height to the grid container.

**short-hand alignment**

- `place-items`: shorthand for setting the same value for both `justify-items` and `align-items`
- `place-content`: shorthand for setting the same value for both `justify-content` and `align-content`


### auto-fit and auto-fill

Use the `auto-fit` and `auto-fill` properties in combination with `repeat()` to provide automatically change the column and grid numbers based on the size of the grid items.

> [!WARNING] the only use case
> These keywords only work when the grid container has a <u>defined height and width</u>

- `auto-fill` adds new columns whenever it gets the chance to.
- `auto-fit` grows grid-items to fill the entire container space

```scss
.example {
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
```


> [!TIP] 
> `auto-fit` is always a good default.

#### Card layout with `auto-fill`

For a responsive column layout, we should follow this formula:

```scss
.example {
  grid-template-columns: repeat(auto-fill min-width-item);
}
```

To find the minimum width of a grid item in our layout, we find the max width of our container, subtract it by the gap amount times the number of gaps, and then divide it by the number of columns we want when the container reaches its max size.

Let's dive into an example:

```scss
.container {
  max-width: 1170px;
  margin: 2rem auto;
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(
    auto-fill,
    minmax(calc((1170px - (2rem * 2)) / 3), 1fr)
  );
}
```

<a href="https://ibb.co/5xZxMgh"><img src="https://i.ibb.co/CsLs13K/image-2023-05-19-110048347.png" alt="image-2023-05-19-110048347" border="0"></a>

- `1170px` is our max width, and from that we'll subtract the two `2rem` gap values to just get the width of all the three cards.
- Then we divide by 3 to get the individual width of a card.
- So card in a 3-column layout with `2rem` will have a minimum width of `368px`.

## New CSS Features

### Container queries

Container queries are a way of responsively styling containers based on their width, not the width of the window. This helps ensure more reusable code and reliable responsiveness.

To use container queries, follow these steps: 

1. Declare your container to use container queries by using the `container-type` CSS property and give it a `container-name`. Here are the different values you can provide for the `container-type`: 
	- `inline-size` means you want to track only width
	- `size` means you want to track both width and height (rarely used).
```css
.container {
	container-type: inline-size;
	container-name: containerName;
}
```

2. Create a container query to style the container
```css
@container containerName (max-width: 800px) {
	/* something... */
}
```

### Layers

CSS layers allow you to ignore specificity of certain selectors and instead apply styling based on layer priority. 

You define layers with an `@layer` directive and then put all your CSS rulesets inside of it to include those styles in that layer.

- All rules not included inside a layer have the highest priority

A common pattern is to first have a one-liner that defines the order of layer priority at the top of your file, where the last layer before the semicolon has the highest priority.

In the example above, a `body < p` would have higher specificity than the `.text` selector, but because it is in the first-defined layer, it has less priority than any styles in later defined layers. so the text appears **green**

```html
<style>
	/* new layer has highest priority */
  @layer base, new;
  
  @layer base {
    body < p {
      color: black;
    }
  }

  @layer new {
    .text {
      color: green
    }
  }
</style>
<body>
	<p class="text">bruh</p>
</body>
```


> [!NOTE] Tip
> Having base styles be the first layer and utility class layers be the last is a great away to avoid specificity headaches.

## Dark Mode

Dark mode is a simple technique that only requires a few steps. It involves setting global CSS variables that you use everywhere in your application for styling, and then creating a class that overrides those CSS variables when applied. 

1. Create all the CSS variables you use for your app in the `:root` selector. 
```css
:root {
	--text-color: black;
}
```
2. Create a `.dark` class that overrides those exact same CSS variables with different values
```css
.dark {
	--text-color: white;
}
```
3. Use JavaScript to programmatically add and remove the `.dark` class from the `html` element. Combine with local storage to save the user's preference.


## CSS Tips

### CSS Functions

- `min(val1, val2)`: returns the minimum value. This is useful for container width styles, like so: 
```css
.container {
	width: min(90%, 1280px); /* max-width is 1280, else width = 90% */
}
```
- `max(val1, val2)` : returns the maximum value from the two passed in.

### CSS Tips

1. You can animate the `display` property now
2. Use the `:focus-visible` pseudo-selector when styling focus for text inputs in forms. It results so that the style only applies when the user uses the keyboard to focus on the input, which is what you always want. 
```css
input:focus {
	outline: none
}

input:focus-visible {
	outline: 5px solid black;
}
```
3. The `accent-color` property styles the inside color of form elements. The `caret-color` property styles the cursor color for text input and text area elements.
4. The `:any-link` selector selects all anchor tags that have valid href link values, and does not style any invalid links. 
5. You can now use comparison operators in media queries.
```css
@media (width <= 768px) {
	/* styles here */
}
```
6. You can use the `writing-mode` property to display text vertically. 
```css
.vertical-text {
	writing-mode: vertical-lr;
}
```
7. You can flip an image or any element by using `transform: translateX(-1)`.
8. Resize an element using the `resize` property. This property only works on elements where the overflow is **not** set to visible. 
	- `resize: horizontal` : resizes only horizontally
	- `resize: vertical`: resizes only vertically
	- `resize: both`: resizes both vertically and horizontally.
9. Use the `scroll-padding-top` and `scroll-margin-top` properties to add scroll padding to prevent content at the top of a page being hidden by a fixed navbar. Just set these values to the height of your navbar.
10. You can force yourself to hold good accessibility standards by making sure you notice any images that don't have an `alt` tag.
```css
img:not([alt]),
img[alt=''] {
    outline: 8px solid red;
}
```
### Advanced Selectors

#### has, is, not

- The `:has` pseudoselector lets you style parent elements based on some state of a child element.
- The `:not` pseudoselector basically does the opposite of the selection

These advanced CSS psuedoselectors are functions that take in multiple selectors. 

- `:is()` : selects an element if it matches any of the selectors inside the parenthesis
- `:has()` : selects an element if it has any of the specified selectors as its children. It’s useful because it styles the selected element, not its children.

```css
  /* If .container has an h2 descendant */
  .container:has(h2) {
    background: green;
  }

   /* If .content has an h2 direct child */
  .content:has(> h2) {
    background: green;
  }
```

In the above example, the `.container` elements will be styled with a green background only if they have an `<h2>` element as one of their children.

You can even nest these selectors inside each other: 

```css
/* If the container does not have an h2 inside it... */
.container:not(:has(h2)) {
	
}
```

#### nth child

```css
/* affects children 1-3 */
li:nth-child(-n + 3) {
    text-decoration: underline;
}

/* affects children 2-5 */
li:nth-child(n + 2):nth-child(-n + 5) {
    color: #2563eb;
}

/* affects the last 2 children */
li:nth-last-child(-n + 2) {
    text-decoration-line: line-through;
}
```
