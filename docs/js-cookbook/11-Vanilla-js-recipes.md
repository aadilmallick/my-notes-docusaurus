# Vanilla JS Cookbook



## Text animations

### Typewriter animations

#### Basic Typewriter

```ts
export class BasicTypeWriter {
  private speed;
  private currentIndex: number = 1;
  private text: string = "";
  constructor(public element: HTMLElement, charsPerSecond: number = 20) {
    this.speed = 1000 / charsPerSecond;
    this.text = element.innerText;
  }

  write() {
    // get substring of text
    const curText = this.text.slice(0, this.currentIndex);

    // end recursive loop if we have reached the end of the text
    if (this.currentIndex > this.text.length) {
      return;
    }
    this.element.innerText = curText;

    // recursive setTimeout call
    setTimeout(() => {
      this.currentIndex++;
      this.write();
    }, this.speed);
  }

  // sets timeout delay for changing typewriter effect speed
  setSpeed(charsPerSecond: number) {
    this.speed = 1000 / charsPerSecond;
  }
}
```

And here is the basic usage:

```ts
const textEl = document.querySelector("p")
const writer = new BasicTypewriter(textEl, 43)
writer.write() // continues writing at 43 wpm until text ends
```

#### Typewriter that rotates through words

This typewriter class below rotates through an array of words you give it. It also has a static store that keeps track of instances to prevent hot-reloading from messing things up.

```ts
export class TypeWriter {
  private wordIndex = 0;
  private isDeleting = false;
  private txt = "";

  static store = [] as TypeWriter[];

  private static instanceExists(id: string) {
    const instance = TypeWriter.store.find((tw) => tw.id === id);
    if (instance) {
      return true;
    }
  }

  private static getInstance(id: string) {
    return TypeWriter.store.find((tw) => tw.id === id);
  }
  constructor(
    private txtElement: HTMLElement,
    private words: string[],
    private id: string,
    private wait = 3000
  ) {
    console.log(TypeWriter.store);
    if (TypeWriter.instanceExists(id)) {
      return TypeWriter.getInstance(id) as this;
    }
    TypeWriter.store.push(this);
    this.type();
  }

  private type() {
    // Current index of word
    const current = this.wordIndex % this.words.length;
    // Get full text of current word
    const fullTxt = this.words[current];

    // Check if deleting
    if (this.isDeleting) {
      // Remove char
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      // Add char
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    // Insert txt into element
    this.txtElement.textContent = this.txt;

    // Initial Type Speed
    let typeSpeed = 300;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    // If word is complete
    if (!this.isDeleting && this.txt === fullTxt) {
      // Make pause at end
      typeSpeed = this.wait;
      // Set delete to true
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      // Move to next word
      this.wordIndex++;
      // Pause before start typing
      this.txtElement.textContent = "...";
      typeSpeed = 1000;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}
```

### Animated Follower Counter

[example: ](https://github.com/aadilmallick/50-vanilla-js-projects/tree/main/src/day15)

For this follower number cool animation iterator project, we have a simple HTML structure where we use `requestAnimationFrame()` to continuously update the text for the number of followers.

```html
<p class="counter" data-target="12000"></div>
```

We use the `data-target` attribute to store the target number of followers. We then use `requestAnimationFrame()` to recursively call a function that will increment the number of followers until it reaches the target number.

```typescript
const counters = document.querySelectorAll<HTMLDivElement>(".counter");

// 1. initialize all counters to 0
counters.forEach((counter) => {
  counter.innerText = "0";
});

// 2. requestAnimationFrame recursive call
function increment() {
  // boolean flag to break out of recursive call
  let isFinished = false;
  counters.forEach((counter) => {
    const target = +counter.getAttribute("data-target")!;
    const currentNum = +counter.innerText;

    // 3. increment counter based on desired fps and animation duration
    const fps = 30;
    const numSeconds = 2;
    const increment = Math.ceil(target / (fps * numSeconds));

    if (currentNum >= target) {
      isFinished = true;
      counter.innerText = target.toString();
    } else {
      counter.innerText = (currentNum + increment).toString();
    }
  });
  if (isFinished) return;
  requestAnimationFrame(increment);
}

increment();
```

For a more OOP approach, we use a `Counter` class 

```ts
export class AnimatedCounter {
  private currentNum = 0;
  private target: number;
  private fps = 30;
  private numSeconds = 3;
  constructor(
    private element: HTMLElement,
    options: {
      target: number;
      fps?: number;
      numSeconds?: number;
    }
  ) {
    this.target = options.target;
    if (options.fps) {
      this.fps = options.fps;
    }
    if (options.numSeconds) {
      this.numSeconds = options.numSeconds;
    }
  }

  private increment() {
    const increment = Math.ceil(this.target / (this.fps * this.numSeconds));
    if (this.currentNum >= this.target) {
      this.currentNum = this.target;
    } else {
      this.currentNum += increment;
    }
  }

  private isFinished() {
    return this.currentNum >= this.target;
  }

  startLoop() {
    requestAnimationFrame(() => {
      if (!this.isFinished()) {
        this.startLoop();
        this.element.textContent = this.currentNum.toString();
        this.increment();
      } else {
        this.element.textContent = this.target.toString();
      }
    });
  }
}

const textEl = document.querySelector<HTMLParagraphElement>("[data-target]");
const counter = new AnimatedCounter(textEl, {
  target: 12000,
});
counter.startLoop();
```

### Text Split animations

Text split animations work by taking all the text content inside an element and breaking out each individual letter and nesting it in a `<span>` element so we can animate those elements.

We are going to apply text animations to all elements with a class of `.text-animation` and then specify the exact time of animation with `data-letter-animation` dataset attribute.

```html
  <p class="text-animation" data-letter-animation="wave">Email</p>
  <p class="text-animation" data-letter-animation="breath">
	Breathing Text
  </p>
  <p class="text-animation" data-letter-animation="hover">
	Hover over me text
  </p>
```

Then add these CSS styles.


> [!WARNING] display of spans
> Spans have `inline` display, meaning you can't add padding, margin, or use the `transform` property. To animate spans properly, make sure to apply `display: inline-block` first.


```ts
$glow-color: #bcf476;
@keyframes breath {
  from {
    animation-timing-function: ease-out;
  }

  to {
    transform: scale(1.25) translateY(-5px) perspective(1px);
    text-shadow: 0 5px 40px $glow-color;
    animation-timing-function: ease-in-out;
  }
}

.text-animation {
  // in order for transform to work, we need to set display to inline-block
  span {
    display: inline-block;
    white-space: break-spaces;
  }
  &[data-letter-animation="wave"] {
    --brand-color: #84b547;
    span {
      transition: transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1),
        color 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
      transition-delay: calc(var(--index) * 50ms);
    }
    &:hover {
      span {
        transform: translateY(-5px) perspective(1px);
        color: var(--brand-color);
      }
    }
  }
  
  &[data-letter-animation="hover"] {
    &:hover {
      span {
        transform: scale(0.75) perspective(1px);
      }
    }
    span {
      // span styles
      text-transform: uppercase;
      font-weight: 100;
      letter-spacing: 2px;
      // add transition
      transition: transform 0.3s ease;
      cursor: pointer;
      will-change: transform;
      // scale up on hover
      &:hover {
        transform: scale(1.25) perspective(1px);
      }
    }
  }

  &[data-letter-animation="breath"] {
    span {
      animation: breath 1.2s ease calc(var(--index) * 100 * 1ms) infinite
        alternate;
      // span styles
      text-transform: uppercase;
      font-weight: 100;
      letter-spacing: 2px;
    }
  }
}
```

And then we use this javascript for text-splitting

```ts
const textAnimationElements =
  document.querySelectorAll<TextAnimationElement>(".text-animation");

type AnimationType = "breath" | "hover" | "wave";

interface TextAnimationElement extends HTMLElement {
  dataset: {
    letterAnimation: AnimationType;
  };
}

textAnimationElements.forEach((element) => {
  const text = element.textContent?.trim();
  if (!text) return;
  element.innerHTML = "";

  const animationType = element.dataset["letterAnimation"];
  text.split("").forEach((letter, i) => {
    const span = document.createElement("span");
    span.textContent = letter;
    switch (animationType) {
      case "breath":
      case "wave":
        // add css variable to span for choreography
        span.style.setProperty("--index", `${i}`);
        break;
    }
    element.appendChild(span);
  });
});
```



## Custom Classes
### Toast class

### Page Loader class

Use the page loader class to hide page content while the page is loading and instead show a cool loading spinner. 

```ts
export class CSSVariablesManager<T = Record<string, string>> {
  constructor(private element: HTMLElement) {}

  private formatName(name: string) {
    if (name.startsWith("--")) {
      return name;
    }
    return `--${name}`;
  }

  set(name: keyof T, value: string) {
    this.element.style.setProperty(this.formatName(name as string), value);
  }

  get(name: keyof T) {
    return this.element.style.getPropertyValue(this.formatName(name as string));
  }
}

interface Variables {
  size: `${number}rem`;
  color: string;
  time: `${number}s`;
  loaderBackground: string;
}

export default class PageLoader {
  id = `page-loader-${crypto.randomUUID()}`;
  loaderContainerSelector = `#${this.id}.loader-container`;
  HTMLcontent = `
    <div class="loader-container" id="${this.id}">
        <div class="loader"></div>
    </div>
  `;

  cssVariables: Variables = {
    size: "4rem" as `${number}rem`,
    color: "orange",
    time: "1.5s" as `${number}s`,
    loaderBackground: "#222",
  };

  private CSSLoaderContent = `
    ${this.loaderContainerSelector} {
        /* variables to configure */
        --size: 4rem;
        --color: orange;
        --time: 1.5s;
        --loader-background: #222;

        /* take up whole screen */
        position: fixed;
        inset: 0;
        background-color: var(--loader-background);
        display: grid;
        place-content: center;
        opacity: 1;
        transition: opacity 1s ease-in-out;
        z-index: 9000;

        /* fade out styles */
        &.hide-loader {
            opacity: 0;
            pointer-events: none;
        }
    }

    ${this.loaderContainerSelector} .loader {
        /* creates spinner */
        height: var(--size);
        width: var(--size);
        border-radius: 9999px;
        border: rgba(255, 255, 255, 0.3) solid 0.25rem;
        position: relative;
        z-index: 1;
        animation: loader var(--time) infinite linear;
        &::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            border-left: var(--color) solid 0.25rem;
            animation: loader var(--time) infinite linear;
            z-index: 2;
        }
    }

    @keyframes loader {
        0% {
            transform: rotate(0deg) scale(1);
        }
        50% {
            transform: rotate(180deg) scale(1.2);
        }
        to {
            transform: rotate(360deg) scale(1);
        }
    }
  `;

  private CSSBodyContent = `
    body:has(:not(${this.loaderContainerSelector}.hide-loader)) {
        overflow: hidden;
        height: 100vh;
    }

    body:has(${this.loaderContainerSelector}.hide-loader) {
        overflow: visible;
        height: fit-content;
    }
  `;

  private loaderElement: HTMLDivElement;

  constructor(options?: Partial<PageLoader["cssVariables"]>) {
    this.handleOptions(options);
    let loaderElement = document.querySelector<HTMLDivElement>(
      this.loaderContainerSelector
    );
    if (!loaderElement) {
      loaderElement = this.injectLoader();
    }
    this.loaderElement = loaderElement;
    const stylesManager = new CSSVariablesManager<Variables>(
      this.loaderElement
    );
    stylesManager.set("size", this.cssVariables.size);
    stylesManager.set("color", this.cssVariables.color);
    stylesManager.set("time", this.cssVariables.time);
    stylesManager.set("loaderBackground", this.cssVariables.loaderBackground);
  }

  private handleOptions(options?: Partial<PageLoader["cssVariables"]>) {
    if (options) {
      options.size && (this.cssVariables.size = options.size);
      options.color && (this.cssVariables.color = options.color);
      options.time && (this.cssVariables.time = options.time);
      options.loaderBackground &&
        (this.cssVariables.loaderBackground = options.loaderBackground);
    }
  }

  private injectLoader() {
    const style = document.createElement("style");
    style.innerHTML = `
      ${this.CSSLoaderContent}
      ${this.CSSBodyContent}
    `;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML("afterbegin", this.HTMLcontent);
    return document.querySelector(
      this.loaderContainerSelector
    ) as HTMLDivElement;
  }

  private hideLoader() {
    setTimeout(() => {
      this.loaderElement.classList.add("hide-loader");
    }, 500);
    setTimeout(() => {
      this.loaderElement.remove();
    }, 1500);
  }

  loadPage() {
    if (document.readyState !== "loading") {
      this.hideLoader();
      return;
    }
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        this.hideLoader();
      },
      {
        once: true,
      }
    );
  }
}
```
### Border Gradient Class

```ts
export const exampleBorderGradientStyles = {
  rainbow: `
        background-image: conic-gradient(
            from var(--angle),
            #ff4545,
            #00ff99,
            #006aff,
            #ff0095,
            #ff4545
        )
    `,
  blueTransparent: `
        background-image: conic-gradient(
            from var(--angle),
            transparent 70%,
            blue
        )
    `,
};

class DOMClassManipulator {
  static addCSS(css: string) {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}

class BorderGradientModel {
  private selector!: string;
  private element: HTMLElement;

  getStaticCSS({
    glowLevel = "low",
    borderRadius,
    conicGradient,
    gradientThickness = "medium",
  }: {
    conicGradient: string;
    borderRadius: string;
    glowLevel?: "low" | "medium" | "high";
    gradientThickness?: "thin" | "medium" | "thick";
  }) {
    const filterBlurLevel =
      glowLevel === "low" ? "0.2" : glowLevel === "medium" ? "0.5" : "1";
    const gradientThicknessValue =
      gradientThickness === "thin"
        ? "2px"
        : gradientThickness === "medium"
        ? "4px"
        : "6px";
    const cssContent = `
            ${this.selector}::after,
            ${this.selector}::before {
                    content: "";
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    ${conicGradient};
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: -1;
                    padding: ${gradientThicknessValue};
                    border-radius: ${borderRadius};
                }
                ${this.selector}::before {
                    filter: blur(1.5rem);
                    opacity: ${filterBlurLevel};
                }
            `;
    return cssContent;
  }

  getCSS({
    glowLevel = "low",
    animationDurationInSeconds = 3,
    borderRadius,
    conicGradient,
    gradientThickness = "medium",
  }: {
    conicGradient: string;
    borderRadius: string;
    animationDurationInSeconds?: number;
    glowLevel?: "low" | "medium" | "high";
    gradientThickness?: "thin" | "medium" | "thick";
  }) {
    const filterGlowLevel =
      glowLevel === "low" ? "0.2" : glowLevel === "medium" ? "0.5" : "1";
    const gradientThicknessValue =
      gradientThickness === "thin"
        ? "2px"
        : gradientThickness === "medium"
        ? "4px"
        : "6px";
    const cssContent = `
            @property --angle {
                syntax: "<angle>";
                initial-value: 0deg;
                inherits: false;
            }
    
        ${this.selector}::after,
        ${this.selector}::before {
                content: "";
                position: absolute;
                height: 100%;
                width: 100%;
                ${conicGradient};
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: -1;
                padding: ${gradientThicknessValue};
                border-radius: ${borderRadius};
                animation: ${animationDurationInSeconds}s spin linear infinite;
            }
        ${this.selector}::before {
                filter: blur(1.5rem);
                opacity: ${filterGlowLevel};
            }
            @keyframes spin {
                from {
                    --angle: 0deg;
                }
                to {
                    --angle: 360deg;
                }
            }
        `;
    return cssContent;
  }

  private prepareElement(element: HTMLElement) {
    const position = window.getComputedStyle(element).position;
    if (position === "static") {
      throw new Error("Element must have a position other than static");
    }
    const borderRadius = window.getComputedStyle(element).borderRadius;
    if (!element.id) {
      const newId = crypto.randomUUID();
      element.id = newId;
      this.selector = `#${newId}`;
    } else {
      this.selector = `#${element.id}`;
    }
    return { borderRadius };
  }

  constructor(
    selector: string | HTMLElement,
    gradientMaker: BorderGradientMaker | StaticBorderGradientMaker,
    options?: {
      animationDurationInSeconds?: number;
      glowLevel?: "low" | "medium" | "high";
      gradientThickness?: "thin" | "medium" | "thick";
    }
  ) {
    let element: HTMLElement;
    if (typeof selector === "string") {
      element = document.querySelector(selector) as HTMLElement;
      this.selector = selector;
      if (!element) {
        throw new Error(`Element with selector ${selector} not found`);
      }
    } else {
      element = selector;
      if (!element) {
        throw new Error(`Element ${element} not found`);
      }
    }
    this.element = element;
    if (gradientMaker.key === "animated") {
      this.createAnimatedGradient(gradientMaker, options);
    } else {
      this.createStaticGradient(gradientMaker, options);
    }
  }

  private createAnimatedGradient(
    gradientMaker: BorderGradientMaker,
    options?: {
      animationDurationInSeconds?: number;
      glowLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    const { borderRadius } = this.prepareElement(this.element);
    const gradientStyles = gradientMaker.createConicGradientStyles();

    const css = this.getCSS({
      conicGradient: gradientStyles,
      borderRadius,
      animationDurationInSeconds: options?.animationDurationInSeconds,
      glowLevel: options?.glowLevel,
      gradientThickness: options?.gradientThicknessValue,
    });
    DOMClassManipulator.addCSS(css);
  }

  private createStaticGradient(
    gradientMaker: StaticBorderGradientMaker,
    options?: {
      glowLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    const { borderRadius } = this.prepareElement(this.element);
    const gradientStyles = gradientMaker.createConicGradientStyles();

    const css = this.getStaticCSS({
      conicGradient: gradientStyles,
      borderRadius,
      gradientThickness: options?.gradientThicknessValue,
      glowLevel: options?.glowLevel,
    });

    DOMClassManipulator.addCSS(css);
  }
}

export default class BorderGradientFactory {
  static createClosedCustomGradient(
    selector: string | HTMLElement,
    colorStops: string[],
    options?: {
      animationDurationInSeconds?: number;
      blurLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    return new BorderGradientModel(
      selector,
      new ClosedCustomGradientMaker(colorStops),
      options
    );
  }

  static createOpenCustomGradient(
    selector: string | HTMLElement,
    colorStops: string[],
    sliverPercent = 0.7,
    options?: {
      animationDurationInSeconds?: number;
      glowLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    return new BorderGradientModel(
      selector,
      new OpenCustomGradientMaker(colorStops, sliverPercent),
      options
    );
  }

  static createPresetGradient(
    selector: string | HTMLElement,
    gradientType: keyof typeof exampleBorderGradientStyles,
    options?: {
      animationDurationInSeconds?: number;
      glowLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    return new BorderGradientModel(
      selector,
      new PresetGradientMaker(gradientType),
      options
    );
  }

  static createStaticPresetGradient(
    selector: string | HTMLElement,
    gradientType: keyof typeof exampleBorderGradientStyles,
    options?: {
      glowLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    return new BorderGradientModel(
      selector,
      new StaticPresetGradientMaker(gradientType),
      options
    );
  }

  static createStaticCustomGradient(
    selector: string | HTMLElement,
    gradientType: keyof typeof exampleBorderGradientStyles,
    options?: {
      glowLevel?: "low" | "medium" | "high";
      gradientThicknessValue?: "thin" | "medium" | "thick";
    }
  ) {
    return new BorderGradientModel(
      selector,
      new StaticCustomGradientMaker(gradientType),
      options
    );
  }
}

interface BorderGradientMaker {
  createConicGradientStyles: () => string;
  key: "animated";
}

interface StaticBorderGradientMaker {
  createConicGradientStyles: () => string;
  key: "static";
}

class ClosedCustomGradientMaker implements BorderGradientMaker {
  key = "animated" as const;
  constructor(private colorStops: string[]) {
    if (colorStops.length < 2) {
      throw new Error("At least two color stops are required");
    }
  }
  createConicGradientStyles() {
    const string = `
            background-image: conic-gradient(
                from var(--angle),
                ${this.colorStops.join(", ")},
                ${this.colorStops[0]}
            )
        `;
    return string;
  }
}

class OpenCustomGradientMaker implements BorderGradientMaker {
  key = "animated" as const;

  constructor(private colorStops: string[], private sliverPercent = 0.7) {
    if (sliverPercent < 0.1 || sliverPercent > 0.9) {
      throw new Error("Sliver percent must be between 0.1 and 0.9");
    }
    if (colorStops.length < 1) {
      throw new Error("At least one color is required");
    }
  }
  createConicGradientStyles() {
    const string = `
              background-image: conic-gradient(
                  from var(--angle),
                  transparent ${Math.floor(this.sliverPercent * 100)}%,
                  ${this.colorStops.join(", ")},
                  transparent
              )
          `;
    return string;
  }
}

class PresetGradientMaker implements BorderGradientMaker {
  key = "animated" as const;

  constructor(private gradientType: keyof typeof exampleBorderGradientStyles) {}
  createConicGradientStyles() {
    return exampleBorderGradientStyles[this.gradientType];
  }
}

class StaticPresetGradientMaker implements StaticBorderGradientMaker {
  key = "static" as const;

  constructor(private gradientType: keyof typeof exampleBorderGradientStyles) {}
  createConicGradientStyles() {
    return exampleBorderGradientStyles[this.gradientType];
  }
}

class StaticCustomGradientMaker implements StaticBorderGradientMaker {
  key = "static" as const;

  constructor(private gradientType: keyof typeof exampleBorderGradientStyles) {}
  createConicGradientStyles() {
    return exampleBorderGradientStyles[this.gradientType];
  }
}
```

We use the Liskov Substitution principle to pass interfaces in to do the work creating the gradient based on what the user wants, and they all use the same exact method. 

This class applies border animation CSS styles to an element, and scopes it appropriately if it doesn't have an id.


### SQL query builder class

```ts
class QueryBuilder<T extends Record<string, any>> {
  private table: string;
  private _select: (keyof T)[] = [];
  private _where: string[] = [];
  private _orderBy: string[] = [];
  constructor(tableName: string) {
    this.table = tableName;
  }
  select(columns: (keyof T & string)[]) {
    this._select = columns;
    return this;
  }

  where<K extends keyof T>(field: K, operator: "=" | ">" | "<", value: T[K]) {
    let stringBuilder = value as string;
    if (typeof value === "string") {
      stringBuilder = `'${value}'`;
    }
    this._where.push(`${field as string} ${operator} ${stringBuilder}`);
    return this;
  }

  orderBy(field: keyof T & string, direction: "ASC" | "DESC" = "ASC") {
    this._orderBy.push(`${field} ${direction}`);
    return this;
  }

  build() {
    const select = this._select.join(", ");
    const where = this._where.length
      ? `WHERE ${this._where.join(" AND ")}`
      : "";
    const orderBy = this._orderBy.length
      ? `ORDER BY ${this._orderBy.join(", ")}`
      : "";
    return `SELECT ${select} FROM ${this.table} ${where} ${orderBy};`;
  }
}

const usersTable = new QueryBuilder<{
  name: string;
  age: number;
  id: number;
}>("users");

const thing = usersTable
  .select(["name", "age"])
  .where("name", "=", "John")
  .orderBy("age", "DESC")
  .build();

// SELECT name, age FROM users WHERE name = 'John' ORDER BY age DESC;
console.log(thing); 
```

## One-liners

### Formatting numbers as currency

```ts
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});

formatter.format(2345); // '$2,345.00'
formatter.format('2345'); // '$2,345.00'
formatter.format('10000000'); // '$10,000,000.00'
```

### Random Color

```ts
// returns random hex color
function generateRandomColor() {
    return `#${Math.floor(Math.random() * 0xffffff).toString(16)}`
}
```

### Optionally adding properties to objects

Use the short circuit `&&` operator in combination with the `...` spread operator to add optional properties to objects. 

```ts
const obj = {
    foo: 'Baz',
    ...(condition && { bar: 'Qux' }),
};
```

Here it is in typescript form:, with a nice utility funciton

```ts
function addOptionalProperties<T extends Record<string, any>>(
	obj: T, 
	condition: boolean, 
	partial: Partial<T>
) {
    const objec : T = {
        ...obj,
        ...(condition && partial),
    };
    return objec
}

const objec : {name: string; age?: number} = {
    name: "aadil"
}

const newObj = addOptionalProperties(objec, 2 > 1, {
    age: 20
})

console.log(newObj)
```