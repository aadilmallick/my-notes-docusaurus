## Reactivity and signals from scratch

### Reactivity from first principles 

An **effect** in reactivity is a callback function that runs side effects, first running when it is invoked and then running subsequently for each time one of its dependencies change.

**derivations** are values that recompute if any of their dependencies (signals) change.

![](https://i.imgur.com/p1f2Fk3.png)

> [!TIP]
> An important thing to understand is that derivations help "cache" high computation functions because they just don't do it. What can be derived should be derived.

### Signals from scratch

Let's learn signals and reactivity in scratch:

```ts
const context = [] as Effect[];
type Effect = {
  execute: () => void;
};

export function createSignal<T>(value: T) {
  const subscriptions = new Set<Effect>();
  /**
   *
   * When we read a signal, we want to add an observer
   */
  const read = () => {
    const observer = context.at(-1);
    if (observer) subscriptions.add(observer);
    return value;
  };

  /**
   *m Everytime we write to the signal (change its value), we also want to notify any registered effects that use that value.
   Thus we'll call effect.execute().
   */
  const write = (newValue: T) => {
    value = newValue;
    for (const effect of [...subscriptions]) {
      effect.execute();
    }
  };

  return [read, write] as const;
}

export function createEffect(cb: () => void) {
  const effect: Effect = {
    execute() {
      context.push(effect);
      cb();
      context.pop();
    },
  };

  effect.execute();
}

export function createMemo<T>(cb: () => T) {
  const [signal, setSignal] = createSignal(cb());
  createEffect(() => {
    setSignal(cb());
  });
  return signal;
}

const [count, setCount] = createSignal(0);
const [count2, setCount2] = createSignal(2);
const [runEffect, setRunEffect] = createSignal(true);

const count2Squared = createMemo(() => {
  return count2() ** 2;
});

// setCount(2);

// this always executes on the first time, not just reactive
createEffect(() => {
  if (runEffect()) {
    console.log(count());
  } else {
    console.log(count2());
    console.log("count 2 squared", count2Squared());
  }
});

// setCount(0);
setRunEffect(false);
setCount2(10);
setRunEffect(true);

```

## Solid basics

### The absolute basics

Solidjs is an easier version of React that is both leaner and faster because it compiles to actual javascript instead of using the virtual DOM.

Solid has JSX-like syntax and uses functional components, but components never rerender. They only run once. It's reactivity done right.

**rendering a solid app**

```tsx
import { render } from 'solid-js/web'

function App() {
	return <div>hello</div>
}

const root = document.getElementById('root')
render(() => <App />, root!)
```

**using signals**

**signals** are what state is in solid. To change state, you call the signal as a function.

1. create state
    
    ```tsx
    const [count, setCount] = createSignal(0);
    ```
    
2. Render state by executing the state function
    
    ```tsx
    <p>count is {count()}</p>
    ```
    
3. Set state using the setter as normal
    
    ```tsx
    const increment = () => {
    	setCount((prev) => prev + 1)
    }
    
    ```

Signals are only recomputed and can be used reactively in these two cases:

1. Signals are used in a `createEffect()` class
2. Signals are used somewhere in a return statement, like the returning of JSX.

The console.log below will NOT be recomputed, even though we invoke the signal. This is because component functions are only ever executed once, with the exeptions being effects and the signal in the return JSX.

```tsx
function App() {
  const [count, setCount] = createSignal(0);
  const squaredCountSignal = () => count() * count();
	
	// not used in an effect or in JSX return, so will not run again.
  console.log("this will not recompute", count());

  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
      <p>squared count is {squaredCountSignal()}</p>
    </>
  );
}
```

Here's a complete app example:

```tsx
import { createSignal } from "solid-js";
import "./App.css";

function App() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
    </>
  );
}

export default App;
```

**derived signals**

Derived signals are any functions you create that consume signal.

```tsx
const [count, setCount] = createSignal(0);
const squaredCountSignal = () => count() * count();
```

You can also pass in the derived signal function into a `createMemo()` call that automatically memoizes the the derived signal and changes only when the dependency signals change. No dependency array needed.

```tsx
function App() {
  const [count, setCount] = createSignal(0);
  const squaredCountSignal = createMemo(() => count() * count())

  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
      <p>squared count is {squaredCountSignal()}</p>
    </>
  );
}
```

**effects**

Like in React, you have the equivalent of `useEffect` in solid with `createEffect()`, except you don’t manually have to create a dependency array.

```tsx
function App() {
  const [count, setCount] = createSignal(0);
  const squaredCountSignal = () => count() * count();

  createEffect(() => {
    console.log("count is", count());
  });

  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count()}
      </button>
      <p>squared count is {squaredCountSignal()}</p>
    </>
  );
}
```

You also have on mount and cleanup methods.

- `onMount(cb)` : executes callback when the component is mounted
- `onCleanup(cb)` : executes callback when the component is unmounted

### Logic Flow

Solidjs works like react when it comes to conditionals, but it also offers components that optimize handling conditional flow with signal state changes:

![](https://i.imgur.com/zS6fQFZ.png)


#### `<Show>`

The `<Show>` component conditionally renders content, and is a substitute for the ternary operator when rendering JSX. The `when=` prop takes in a boolean.

- If `when={true}`, then the nested content inside the `<Show>` component will be rendered.
- If `when={false}`, then whatever content you set inside the optional `fallback=` prop will be rendered. If you did not provide a `fallback=` prop, then nothing will be rendered.

```tsx
  <Show when={9 + 10 === 21} fallback={<p>You stupid</p>}>
    <p>Yup yure smart</p>
  </Show>
```

> [!NOTE]
> Ternaries are optimized by solid's compiler so you can use them, but using this component is better.

#### `<For>`

The `<For>` component helps with mapping over lists and rendering some content for each list entry. No `key=` prop is needed. Here are the props you can use:

- `each=` : the list to loop over
- `fallback=` : the content to render if the list is empty

```tsx
import { createSignal, For } from "solid-js";

const User = () => {
  const [names, setNames] = createSignal(["bru", "huhu"]);

  return (
      <ul>
        <For each={names()} fallback={<p>No names provided</p>}>
          {(name) => <li>{name}</li>}
        </For>
      </ul>
  );
};
```


> [!NOTE]
> You're allowed to use the `array.map()` to loop over a list as well, but you'll lose out on optimziation.

#### `<Index />`

You can use the `<Index />` component as a way to grab the element and corresponding index in the array while looping over the list.

```tsx
import { createSignal, Index } from 'solid-js';

function App() {
  const [cats, setCats] = createSignal([
    { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
    { id: 'z_AbfPXTKms', name: 'Maru' },
    { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
  ]);
  
  return (
    <ul>
      <Index each={cats()}>{(cat, i) =>
        <li>
            <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
            {i + 1}: {cat().name}
            </a>
        </li>
        }
      </Index>
    </ul>
  );
}
```

#### `<Switch />`

The `<Switch />` component is a better improvement over a ternary where you want to render components in a complex conditional statement:

1. Create a  `<Switch />` component with a `fallback=` prop to render in case the switch falls to the default case.
2. Handle rendering individual cases with the `<Match />` component.

```tsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```

#### `<Dynamic />`

The `<Dynamic />` component is used to conditionally render a component from an object of type `Record<string, React.ReactNode>`, meaning a component map.

```tsx
const RedThing = () => <strong style="color: red">Red Thing</strong>;
const GreenThing = () => <strong style="color: green">Green Thing</strong>;
const BlueThing = () => <strong style="color: blue">Blue Thing</strong>;

const options = {
  red: RedThing,
  green: GreenThing,
  blue: BlueThing
}

function App() {
  const [selected, setSelected] = createSignal("red");

  return (
    <>
      <select value={selected()} onInput={e => setSelected(e.currentTarget.value)}>
        <For each={Object.keys(options)}>{
          color => <option value={color}>{color}</option>
        }</For>
      </select>
      <Dynamic component={options[selected()]} />
    </>
  );
}
```

#### `<ErrorBoundary />`

This component provides a fallback if any nested component inside it throws an error.

```tsx
<ErrorBoundary fallback={err => err}>
  <Broken />
</ErrorBoundary>
```

### Portals

Solid has a `<Portal>` component whose child content will be inserted at the location of your choosing. By default, its elements will be rendered in a `<div>` in the `document.body`.

You can use the `<Portal>` component for stuff like rendering modals and the like.

```tsx
<Portal>
  <div class="popup">
    <h1>Popup</h1>
    <p>Some text you might need for something or other.</p>
  </div>
</Portal>
```