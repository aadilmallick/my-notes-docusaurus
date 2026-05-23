import BoopExample from "@site/src/components/examples/Boop";

## React Basics

### When to use state

The most important mental model in React to keep in mind is that the view (UI) is a function of the state of a component:

$$v = f(s)$$
This means that you should declare variables as states using the `useState()` hook if the value of the variable is used to render the UI. Else, it should not be state.

### React rendering pipeline


The react rendering pipeline consists of three components:

1. **component code**: The code that defines the state and JSX that a component has
2. **snapshot**: Before any state update takes place that would trigger a re-render,  React creates a snapshot of your component which captures everything React needs to update the view at that particular moment in time. props, state, event handlers, and a description of the UI (based on those props and state) are all captured in this snapshot.
3. **view**: Based on the snapshot, React takes that description of the UI and uses it to update the View eventually, doing it after **batching** state calls.

### React rerendering

React will only re-render when the state of a component changes. This unintiuitively, however, leads to multiple caveat of React rerendering:

- **entire component tree re-renders**: If a component has state changes requiring a re-render, then the entire subtree of that component (all subcomponents and JSX) will also re-render, regardless if those sub-components have state changes or not.

When some event handler or effect changes state, React does the re-render pipeline as so:

1. React takes a snapshot of the current values of the props and state inside the component and freezes those for the evaluation of what happens during the event handler.
2. After all state updates in the triggered event-handlers or effects are run, then React takes a new snapshot of all current prop values and state values and compares it to the previous snapshot, and if anything is different (using value equality), then React re-renders. Else it doesn't.

**event handlers and effects**

State changes can only occur in the context of event handlers or effects, so React treats them specially by taking a **snapshot** before an event handler or effect that has a state change gets invoked:

> [!NOTE]
> When an event handler is invoked, that event handler has access to the props and state as they were in the moment in time when the snapshot was created. 
> 
> Another way you can think about this is whenever an event occurs, regardless of when or how it was triggered, that event will have the same props and state as the snapshot that was created with the render that event is associated with. 

if an event handler or effect contains an invocation of `useState`'s updater function **and** React sees that the new state is different than the state in the snapshot, React will trigger a re-render of the component – creating a new snapshot and updating the view.

Take a look at this example:

```tsx
import * as React from "react"

export default function VibeCheck () {
  const [status, setStatus] = React.useState("clean")

  const handleClick = () => {
    setStatus("dirty")
    alert(status)
  }

  return (
    <button onClick={handleClick}>
      {status}
    </button>
  )
}
```

What gets alerted is the string `"clean"` due to this line of reasoning:

1. Event handlers that contain state updates use variables in the snapshot captured by react right before the invocation of the event handler.
2. In the snapshot, the `status` state has a value of `"clean"`, thus even though we do the state update with `setStatus("dirty")`, the state update doesn't happen until all event handler and effects scheduled to run have finished. Thus what gets alerted is `"clean"`

Even if an event handler has a state update, the component will only re-render if the state update changes the state to a value that is unequal (value checking) to the snapshot state value.

In the below example, even though the `handleClick()` event handler has a state update, because the updated state doesn't differ between snapshots, the component does not re-render.

```tsx
import * as React from "react"

export default function Counter () {
  console.count("Rendering Counter")
  const [count, setCount] = React.useState(0)

  const handleClick = () => {
    console.count("click")
    setCount(count)
  }

  return (
    <button onClick={handleClick}>
      🤨
    </button>
  )
}

```

> [!IMPORTANT]
> Again, React will only re-render if the event handler contains an invocation of `useState`'s updater function (✅) **and** React sees that the new state is different than the state in the snapshot (❌).

The new snapshot is taken AFTER all state update functions in the invoked event handlers or effects have run. This prevents unnecessary re-renders after each state change, where React lazily takes the snapshot after all state-update functions have run, and uses only the last snapshot to update the UI.

This leads into an algorithm called batching:
#### **batching**

> [!NOTE]
> Basically, after a bunch of `setState()` calls, there is only one re-render with all new updated state values after all effects and event handler executions have completed.

So in an event handler or effect, if multiple `setState()` calls for a specific state are invoked, then only the **last** set state call will be set as the updated state. This is called **batching**.

React will only re-render once per event handler invocation or effect change, after all state updates are completed.

Whenever React encounters multiple invocations of the same updater function (e.g. `setCount` in our example), it will keep track of each of them, but only the result of the last invocation will be used as the new state.

```ts
const handleClick = () => {
  // queued snapshot: count = 1
  setCount(1)
  // queued snapshot: count = 2
  setCount(2)
  // queued snapshot: count = 3
  setCount(3)
  
  // final snapshot: count = 3
}
```

So in this example, the new state will of course be `3`.

**overriding batching**

there is a way to tell React to use the value of the previous invocation of the updater function instead of replacing it. To do that, you pass the updater function a function itself that will take in the value from the most recent invocation as its argument.

```ts
const handleClick = () => {
  // queued snapshot: count = 1
  setCount(1)
  // queued snapshot: count = 2
  setCount(2)
  // queued snapshot: count = count + 3 -> count = 5
  setCount((c) => c + 3)
  
  // final snapshot: count = 5
}
```

#### Memoization

If a component has state changes requiring a re-render, then the entire subtree of that component (all subcomponents and JSX) will also re-render, regardless if those sub-components have state changes or not.

A React performance enhancement to mitigate this excessive re-rendering of child components  is called **memoization**, where we memoize components by wrapping them in the `memo()` function from React.

Any memoized child component will only re-render during a parent's re-render cycle if the props passed to that child component change (or state in the child component changes), where props are compared via primitive value equality.

#### Strict Mode

React **strict mode** is used for development use cases where by wrapping your entire app in the `<React.StrictMode>` component, you enable strict mode, where every component will re-render at least twice regardless of what memoization tactics you use.

> [!TIP]
> This is helpful in unveiling common bugs.

In production, strict mode is disabled.

### Effects in React

#### Rules of side effects in components

1. **components must be pure**: To keep the component function pure, no side effects can be executed within the main body of the component. When a component renders, it should do so without running into any side effects
2. **side effects triggered by an event should be put in that event handler**
3. **If a side effect is synchronizing your component with some external system, put that side effect in a `useEffect()` hook**.

> [!NOTE]
> Basically, the main rule of having side effects in components is that they should be encapsulated into code that doesn't deal with render cycle, like in `useEffect` blocks and event handlers.

**No, this state hack doesn't work**

Take a look at this example below. You might think that it's fine to use a side-effect like fetching from local storage if it's for initializing state, but it's still a side effect and thus will rerun on every re-render of the component, not behaving as planned.

- **what you think should happen**: the `index` state gets initialized with the locally stored value
- **what actually happens**: on every re-render, the side effect runs again, thus the state gets reinitialized every time with the locally stored value, even if that's not what you want.

```ts
import * as React from "react"

function Greeting ({ name }) {
  const [index, setIndex] = React.useState(
    Number(localStorage.getItem("index"))
  )

  const greetings = ['Hello', "Hola", "Bonjour"]

  const handleClick = () => {
    const nextIndex = index === greetings.length - 1
      ? 0
      : index + 1
    setIndex(nextIndex)

    localStorage.setItem("index", nextIndex)
  }

  return (
    <main>
      <h1>{greetings[index]}, {name}</h1>
      <button onClick={handleClick}>Next Greeting</button>
    </main>
  )
}
```

What's the solution for initializing state with local storage? Put that side effect in a `useEffect()` with an empty dependency array so it only runs once.

#### `useEffect`

The `useEffect()` hook can contain side-effects and state update invocations, all of which run after every render or re-render.

> [!NOTE]
> **when to use `useEffect()`**
> ***
> If a side effect is synchronizing your component with some external system, put that side effect inside useEffect. Here are some use cases:
> - Syncing with local storage
> - Using `fetch()` API or fetching external data
> - Querying DOM data

However, to prevent unnecessary re-renders, we make use of the **dependency array** to let React know which variables the side effect code in our `useEffect()` invocation is dependent on, and to only run the side effect when those variables change (value equality or reference equality).

**`useEffect` lifecycle**

`useEffect` works by removing the side effect from React's rendering flow and delaying its execution until **after** the component has rendered.

Here is the simplified lifecycle.

1. React re-renders
2. All `useEffect` blocks will run, executing any side-effects

However, if you have a dependency array, then this changes and the `useEffect` block will only run after a re-render if one of its dependencies have changed.

> [!NOTE]
> **Another way to think about it**
> ***
> The whole goal of `useEffect` is to synchronize your component with some external system. Whenever **any** of the dependencies that the effect needs in order to synchronize change, React, should resynchronize.

#### **`useEffect` antipattern** and reactive values

`useEffect` blocks should NOT be used for reacting to changes in values. That's what event handlers are for. Rather, you should only use `useEffect` blocks for synchronizing UI and state to external systems.

**Reactive values** are any values that change between re-renders, for example, like state.

> [!WARNING]
> Having reactive values in your dependency array is a red flag that you might be in the anti-pattern of reacting to state changes, but it's fine to have reactive values in the dependency array if you are using that value to sync to an external system, like the network or local storage.

> [!NOTE]
> A reactive value is any value that can change between re-renders. Props, state, or any variables defined inside of a component are all reactive values.

#### `useEffect` cleanup function

The cleanup function in a `useEffect` block runs in two scenarios:

- **Scenario 1 (component unmounts)**: When the component unmounts, the cleanup function will run 
- **Scenario 2 (effect is scheduled to rerun)**: If any of the values in the dependency array changes, then the effect is scheduled to rerun, and thus the cleanup function is called before the rerun of that effect.

> [!NOTE]
> If you return a function from your effect, React will call that function each time before it ever calls your effect again, and then one final time when the component is removed from the DOM.

Here is the general lifecycle of rerendering and running effects:

1. React renders for first time
2. If scheduled to run, `useEffect` block runs
3. On all subsequent re-renders: if `useEffect` is scheduled to run again, then cleanup function executes first with previous snapshot, then the effect runs.

#### Complete Data Fetching Example

First, notice that our dependency array only includes one element, `id`. Again, this **isn't** telling React to re-run the effect when `id` changes (though, that's what happens). Instead, we're giving React an array of all of the dependencies our effect needs to re-synchronize with the outside system. As a _byproduct_ of that, whenever React sees that `id` has changed between renders, it will re-run the effect.

```tsx
import React, { useState } from 'react'

async function fetchPokemon(id) {
  const abortController = new AbortController()
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${id}`,
      {
        signal: abortController.signal
      }
    )

    if (res.ok === true) {
      return {
        error: null,
        response: await res.json(),
        abortController
      }
    }

    throw new Error(`Error fetching pokemon #${id}`)
  } catch (e) {
    return {
      error: e,
      response: null,
      abortController
    }
  }
}

// export default function MyApp() {
//   return <div>Hello World</div>;
// }


// Main App
export default function App() {
  const [id, setId] = React.useState(1)
  const [pokemon, setPokemon] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const handleFetchPokemon = async () => {
      setLoading(true)
      setError(null)

      const { error, response } = await fetchPokemon(id)

      if (error) {
        setError(error.message)
      } else {
        setPokemon(response)
      }

      setLoading(false)
    }

    handleFetchPokemon()
  }, [id])

  if (loading) {
    return <p>loading...</p>
  }

  if (error) {
    return <p>error {error}</p>
  }

  if (!pokemon && !loading) {
    return "no pokemon"
  }

  return (
    <main>
      {JSON.stringify({ id, pokemon }, null, 2)}
    </main>
  )
}
```

However, there is still a main problem we have to deal with.

Whenever we call `fetchPokemon`, because it's an asynchronous request, we have no idea how long that request will take to resolve. It's completely possible that, while we're in the process of waiting for a response, our Carousel updates `id`, which causes a re-render, which causes our effect to run again with a different `id`.

In this scenario, we now have two requests in flight, both with different `id`s. Worse, we have no way of knowing which one will resolve first. In both scenarios, we're calling `setPokemon` when the request resolves. That means, because we don't know in which order they'll resolve, `pokemon`, and therefor our UI, will eventually be _whatever request was resolved last_. To make it worse, you'll also get a flash of the Pokémon that resolves first, before the second one does.

To solve this, we will use a cleanup function in the effect which will cleanup the stale fetch requests in the previous snapshot by aborting them.

Notice that the cleanup function is only called for `id`s that are no longer relevant. This makes sense because the cleanup function for the most recent effect won't be called until either _another_ effect runs (making it stale) or the component has been removed from the DOM (irrelevant in this scenario).

```tsx
import React, { useState } from 'react'
import Carousel from "./Carousel"
import PokemonCard from "./PokemonCard"

function fetchPokemon(id) {
  const abortController = new AbortController()
    const res = fetch(
      `https://pokeapi.co/api/v2/pokemon/${id}`,
      {
        signal: abortController.signal
      }
    )

    return {
      response: res,
      abortController
    }
}


// Main App
export default function App() {
  const [id, setId] = React.useState(1)
  const [pokemon, setPokemon] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

   const handlePrevious = () => {
    if (id > 1) {
      setId(Math.max(id - 1, 1)) 
    }
  }

  const handleNext = () => setId(id + 1)

  React.useEffect(() => {
  // 1. Create the controller instance *inside* the effect
  const controller = new AbortController();
  
  const handleFetchPokemon = async () => {
    setLoading(true);
    setError(null);

    try {
      // Pass the signal directly to the fetch request
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${id}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error(`Error fetching pokemon #${id}`);
      
      const data = await res.json();
      setPokemon(data);
    } catch (e) {
      // 3. When a fetch is aborted, it throws an 'AbortError'. 
      // We ignore it so we don't flash error states for stale requests.
      if (e.name !== 'AbortError') {
        console.error(e);
        setError(e);
        setPokemon(null);
      }
    } finally {
      // Only turn off loading if this request wasn't aborted
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  handleFetchPokemon();

  // 2. The Cleanup Function: Runs when 'id' changes or component unmounts
  return () => {
    controller.abort();
  };
}, [id]);

  if (loading) {
    return <p>loading...</p>
  }

  if (error) {
    return <p>error</p>
  }

  if (!pokemon && !loading) {
    return "no pokemon"
  }

  return (
    <Carousel onPrevious={handlePrevious} onNext={handleNext}>
      {JSON.stringify({
        name: pokemon.name,
        id
      }, null, 2)}
    </Carousel>
  )
}
```

### Refs in React

Sometimes you need to preserve a variable value across renders but you don't use that variable to render the UI. Making this value a state would be an antipattern, as React re-renders when state gets updated.

The `useRef` hook creates a value that is preserved across renders but won't trigger a re-render when it changes. Here are some use cases:

- **`setInterval()` or `setTimeout()` Id**: It's important to keep track of the id so you can cancel intervals or timeouts, but you never actually directly render the id in the UI, so it should NOT be state. This is the perfect use case for a Ref.
- **DOM element**: If you want to keep track of some DOM element across re-renders, you should use refs rather than state because you never directly render this DOM element, so it should not be state, otherwise it would cause unnecessary re-renders.
- **debouncing and throttling**: stores debouncing timers in a ref to avoid unnecessary rerenders




**ref vs state example**

Here is an example where we incorrectly use state when we should be using a ref:

- **main issue**: The `id` state is not rendered anywhere in the view, so invoking `setId` causes unnecessary re-renders and is thus an antipattern.

```tsx
import * as React from "react"
import { formatTime } from "./utils"

export default function Stopwatch () {
  const [seconds, setSeconds] = React.useState(0)
  const [running, setRunning] = React.useState(false)
  const [id, setId] = React.useState(null)

  const handleClick = () => {
    if (running === false) {
      const id = window.setInterval(() => {
        setSeconds(s => s + 1) 
      }, 1000)
      setId(id)
      setRunning(true)
    } else {
      window.clearInterval(id)
      setId(null)
      setRunning(false)
    }
  }

  return (
    <main>
      <h1>{formatTime(seconds)}</h1>
      <button
        style={{background: running === true ? 'var(--red)' : 'var(--green)'}}
        onClick={handleClick}>
          {running === true ? 'Stop' : 'Start'}
      </button>
    </main>
  )
}
```

This is the improved version of this example, where we use a ref for the `id` state as to preserve the variable across re-renders but not use it for the view:

```tsx
import * as React from "react"
import { formatTime } from "./utils"

export default function Stopwatch () {
  const [seconds, setSeconds] = React.useState(0)
  const [running, setRunning] = React.useState(false)
  const ref = React.useRef(null)

  const handleClick = () => {
    if (running === false) {
      ref.current = window.setInterval(() => {
        setSeconds(s => s + 1) 
      }, 1000)
      setRunning(true)
    } else {
      window.clearInterval(ref.current)
      setRunning(false)
    }
  }

  return (
    <main>
      <h1>{formatTime(seconds)}</h1>
      <button
        style={{background: running === true ? 'var(--red)' : 'var(--green)'}}
        onClick={handleClick}>
          {running === true ? 'Stop' : 'Start'}
      </button>
    </main>
  )
}
```


> [!TIP] 
> Basically use `useState` for a persistent variable whenever you reference it anywhere in the JSX (even if you don't directly render it). Else use `useRef`, if it's nowhere in the JSX return rendering portion.





**ref vs effects summary**

- **When to use `useEffect`**: If you have a side effect that is triggered by an event, put it in an event handler. If you have a side effect that is synchronizing your component with some outside system, put it inside of `useEffect`. 
- **When to use `useRef`**: If you need to preserve a value across renders, but that value has nothing to do with the view, and therefore, React doesn't need to re-render when it changes, put it in a `ref` using `useRef`.

#### Refs with DOM elements

By putting the `ref=` prop on a JSX element or React component and passing a ref variable, you can control that JSX element or component via DOM APIs through the ref variable.

```tsx
import * as React from "react"
import Toolbar from "./Toolbar"

export default function App() {
  const white = React.useRef(null)
  const black = React.useRef(null)
  const yellow = React.useRef(null)

  const handleClick = (type) => {
    let ref = null

    if (type === "white") ref = white
    if (type === "yellow") ref = yellow
    if (type === "black") ref = black

    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }

  return (
    <div>
      <Toolbar handleClick={handleClick} />
      <div ref={white} className="white" />
      <div ref={yellow} className="yellow" />
      <div ref={black} className="black" />
    </div>
  )
}

```

Here is a ref example with multiple moving parts, where the main goal is to provide a dynamic debounce timing where the user cannot switch the toggle while the element is animating.

- **`active` state**: updates the toggle switch, thus should be state since it renders to the view.
- **`node` ref**: attaches to the animating element so we can hook into its animations and wait for them to finish.
- **`animating` ref**: persistent boolean flag used to mark whether the element is currently animating or not. If the element is not currently animating (`animating.current === false`) then we are allowed to change the toggle.

```tsx
import * as React from "react"
import Diagram from "./Diagram"
import ReactLogo from "./ReactLogo"

export default function App() {
  const [active, setActive] = React.useState(false)
  const node = React.useRef(null)
  const animating = React.useRef(false)

  React.useEffect(() => {
    const checkAnimations = async () => {
	  // mark animating as true
      animating.current = true;
      
      // await all animations of node.current to finish
      const animations = node.current.getAnimations({ subtree: true })
      const promises = animations.map((animation) => animation.finished)
      await Promise.all(promises)
      
      // mark animating as false
      animating.current = false;
    }

    checkAnimations()
  })

  const handleToggle = () => {
	// if element is not animating, then user can change toggle state.
    if (animating.current === false) {
      setActive(!active)
    }
  }

  return (
    <div
      ref={node}
      className={`diagram ${active ? "react-approach" : "trad-approach"}`}
    >
      <Diagram />
      <div className="toggle-diagram">
        <input
          id="toggle"
          className="toggle-input"
          type="checkbox"
          checked={active}
          onChange={handleToggle}
        />
        <label htmlFor="toggle" className="toggle-label">
          <div
            className="toggle-options"
            data-checked="React"
            data-unchecked="Traditional"
          >
            <div className="toggle-switch">
              <span className="toggle-marker">
                <ReactLogo />
              </span>
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}
```

### React context

#### When to use context

> [!IMPORTANT]
> This is a huge misconception when it comes to Context. Whether what you're teleporting is a static object, function, state, or anything else – it doesn't change that fact that Context is a teleporter, not a manager of state.

Re-rendering data in context follows the common react model of $v=f(s)$, where if state in a context changes, then the entire component tree of the context provider and what ever subcomponents are nested inside it gets re-rendered.

This means it's extremely important to use context only when you don't have a lot of re-renders, otherwise you will have to constantly repaint your app. Because context providers often wrap your whole app, when the context provider must re-render due to a state change in the context, that re-renders the entire app. 

To avoid a shit ton of re-renders when using context, here are some tips to keep in mind:

1. **pick the right tool for the job**: only use react context when it makes sense to do so, like when any state in the context does not change often.
2. **use `useRef` for persistent context values when it makes sense**: If you need a persistent variable to export in the context but it's not used anywhere in your app to update the view, make it a ref instead of state as to avoid unnecessary re-renders.


### `useReducer`

#### Intro

The reducer pattern is a functional programming pattern that takes a collection as input and returns a single value as output. The way you get to that single value is by invoking a reducer function for every element in the collection.

What if instead of our collection being an array, it was a collection of user actions that happened over time? Then, whenever a new user action occurred, we could invoke our reducer to get the new state of our application.

![](https://i.imgur.com/FItB79z.jpeg)


#### How to use `useReducer`

Because it's such a helpful pattern, React comes with a built-in Hook called `useReducer` that functionally behaves like `useState`, but allows you to manage your state using the reducer pattern.

The API for `useReducer` is similar to what we saw earlier with `Array.reduce`, but with one big difference. Instead of just returning the state, similar to `useState`, `useReducer` also returns a way to _update_ that state.

What's different is instead of returning an updater function, it returns a function called `dispatch` that when called, will invoke the `reducer` function.

```tsx
import * as React from "react"

function reducer(state, value) {
  const nextState = state + value

  console.log(
    `Reducer invoked. state: ${state}, value: ${value}, nextState: ${nextState}`
  )

  return nextState
}

const initialState = 0

export default function Counter() {
  const [count, dispatch] = React.useReducer(
    reducer, initialState
  )

  const handleIncrement = () => {
    dispatch(1) // invokes reducer with state, value=1
  }

  return (
    <main>
      <h1>{count}</h1>
      <button onClick={handleIncrement}>+</button>
    </main>
  )
}
```

#### `useReducer` vs `useState`

Here is when to use `useReducer` vs `useState`:

- **use `useState`** when If different pieces of state update independently from one another
- **use `useReducer`** when if your state tends to be updated together or if updating one piece of state is based on another piece of state

When using a reducer, we decouple how the state updates from the action that triggered the update. This makes using `useReducer` preferable to using `useState` in the following scenarios:

- **minimizing event listeners and interval teardown and setup**: in a `useEffect` where we want to setup event listeners or intervals and we depend on a piece of state
	- if we use `useState`, then we're recreating and tearing down those event listeners and intervals on every state change.
	- If we use `useReducer`, then we don't have dependecy on the state, instead we just dispatch actions, which means we can omit state from the dependency array and thus run the `useEffect` block less.
- **updating state where state updates are tightly coupled**
- **Form state**: in forms, you may need lots of state variables, and clearing and submitting forms require an imperative way of state updates, while `useReducer` updates state in a declarative way.

**use case 1: tightly coupled state updates**
 
Here is an example where state updates rely on other pieces of state, so it's better to use `useReducer` rather than `useState`:

```tsx
import * as React from "react"
import Slider from "./Slider"

function reducer(state, action) {
  if (action.type === "increment") {
    return {
      count: state.count + state.step,
      step: state.step,
    }
  } else if (action.type === "decrement") {
    return {
      count: state.count - state.step,
      step: state.step,
    }
  } else if (action.type === "reset") {
    return {
      count: 0,
      step: state.step,
    }
  } else if (action.type === "updateStep") {
    return {
      count: state.count,
      step: action.step,
    }
  } else {
    throw new Error("This action type isn't supported.")
  }
}

export default function Counter() {
  const [state, dispatch] = React.useReducer(reducer, {
    count: 0,
    step: 1
  })

  const handleIncrement = () => dispatch({type: "increment"})
  const handleDecrement = () => dispatch({type: "decrement"})
  const handleReset = () => dispatch({type: "reset"})
  const handleUpdateStep = (step) => dispatch({type: "updateStep", step})

  return (
    <main>
      <h1>{state.count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>0</button>
      </div>
      <Slider 
        min={1}
        max={10}
        onChange={handleUpdateStep} 
      />
    </main>
  )
}

```

With that, we see another subtle but powerful benefit of `useReducer` you might have missed. Because the `reducer` function is passed the current `state` as the first argument, it's simple to update one piece of state based on another piece of state. In our example, we can see this in how we're updating `count` based on the value of `step`.

> [!TIP]
> In fact, I'd go as far as to say whenever updating one piece of state depends on the value of another piece of state, reach for `useReducer`.

**use case 2: imperative vs declarative state updates**

The reason `useReducer` can be more declarative is because it allows us to map actions to state transitions. This means, instead of having a collection of `setX` invocations, we can simply `dispatch` the action type that occurred. Then our `reducer` can encapsulate the imperative, instructional like code.

```tsx
const handleSubmit = async (e) => {
  // e.preventDefault()
  // setSubmitting(true)
  // setError(null)
  // setSuccess(false)

  // try {
  //   await subscribe({ name, email, marketing })
  //   setSubmitting(false)
  //   setName("")
  //   setEmail("")
  //   setMarketing(true)
  //   setSuccess(true)
  // } catch (e) {
  //   setSubmitting(false)
  //   setSuccess(false)
  //   setError(e.message)
  // }
  
  e.preventDefault()
  dispatch({ type: "submit" })

  try {
    await subscribe({ name, email, marketing })
    dispatch({ type: "success" })
  } catch (e) {
    dispatch({ type: "error", error: e.message })
  }
}
```

Notice that we're describing **what** we want to do - `submit`. Then, based on that result, `success` or `error`. That's a lot cleaner and easier to reason about than our imperative solution.

```tsx
import * as React from "react";

const initialFormData = {
  name: "",
  email: "",
  address: "",
  city: "",
  zipcode: ""
};

const initialState = {
  currentStep: 1,
  formData: initialFormData
}

function reducer(state, action) {
  
  if (action.type === "next") {
    return {
      ...state,
      currentStep: state.currentStep + 1
    }
  }
  else if (action.type === "previous") {
    return {
      ...state,
      currentStep: state.currentStep - 1
    }
  }

  else if (action.type === "change") {
    if (!action.payload) throw new Error("empty payload for 'change' action")
    const {name, value} = action.payload
    return {
      formData: {
        ...state.formData,
        [name]: value
      },
      currentStep: state.currentStep
    }
  }

  else if (action.type === "submit") {
    return initialState
  }

  else {
    throw new Error("unhandled action type " + action.type)
  }
  
}


export default function MultistepFormReducer() {
  // const [currentStep, setCurrentStep] = React.useState(1);
  // const [formData, setFormData] = React.useState(initialFormData);
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const {currentStep, formData} = state

  const handleNextStep = () => {
    // setCurrentStep(currentStep + 1);
    dispatch({type: "next"})
  };

  const handlePrevStep = () => {
    dispatch({type: "previous"})
    
  };

  const handleChange = (e) => {
    dispatch({
      type: "change",
      payload: {
        name: e.target.name,
        value: e.target.value
      }
    })
    // setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your submission");
    dispatch({type: "submit"})
    // setCurrentStep(1);
    // setFormData(initialFormData);
  };

  if (currentStep === 1) {
    return (
      <form onSubmit={handleSubmit}>
        <h2>Personal Information</h2>
        <div>
          <label>Step {currentStep} of 3</label>
          <progress value={currentStep} max={3} />
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            required
            name="name"
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            required
            name="email"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <button type="button" className="secondary" onClick={handleNextStep}>
          Next
        </button>
      </form>
    );
  } else if (currentStep === 2) {
    return (
      <form onSubmit={handleSubmit}>
        <h2>Address</h2>
        <div>
          <label>Step {currentStep} of 3</label>
          <progress value={currentStep} max={3} />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input
            required
            name="address"
            id="address"
            type="address"
            placeholder="What is your address?"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="city">City</label>
          <input
            required
            name="city"
            id="city"
            placeholder="What city do you live in?"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="zipcode">Zipcode</label>
          <input
            required
            name="zipcode"
            id="zipcode"
            type="number"
            placeholder="What is your zipcode?"
            value={formData.zipcode}
            onChange={handleChange}
          />
        </div>
        <div>
          <button className="secondary" type="button" onClick={handleNextStep}>
            Next
          </button>
          <button type="button" className="link" onClick={handlePrevStep}>
            Previous
          </button>
        </div>
      </form>
    );
  } else if (currentStep === 3) {
    return (
      <form onSubmit={handleSubmit}>
        <h2>Confirm your information:</h2>
        <div>
          <label>Step {currentStep} of 3</label>
          <progress value={currentStep} max={3} />
        </div>
        <table>
          <tbody>
            {Object.keys(formData).map((key) => {
              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{formData[key]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div>
          <button className="primary" type="submit">
            Submit
          </button>
          <button type="button" className="link" onClick={handlePrevStep}>
            Previous
          </button>
        </div>
      </form>
    );
  } else {
    return null;
  }
}

```

**use case 3: decoupling state updates from state values, leading to less setup and tear down**

This is the way where if we use state, then we create an interval and tear it down each time `step` changes, which is not ideal:

```tsx
import * as React from "react"
import Slider from "./Slider"

export default function Counter() {
  const [count, setCount] = React.useState(0)
  const [step, setStep] = React.useState(1)

  const handleIncrement = () => setCount(count + step)
  const handleDecrement = () => setCount(count - step)
  const handleReset = () => setCount(0)
  const handleUpdateStep = (step) => setStep(step)

  React.useEffect(() => {
    console.log('useEffect called')
    const id = window.setInterval(() => {
      setCount((c) => c + step)
    }, 1000)

    return () => window.clearInterval(id)
  }, [step])

  return (
    <main>
      <h1>{count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>0</button>
      </div>
      <Slider 
        min={1}
        max={10}
        onChange={handleUpdateStep} 
      />
    </main>
  )
}
```

But if we use `useReducer`, we solve this issue since we decouple state updates from their current values, thus meaning we can have an empty dependency array:

```tsx
import * as React from "react"
import Slider from "./Slider"

function reducer(state, action) {
  if (action.type === "increment") {
    return {
      count: state.count + state.step,
      step: state.step,
    }
  } else if (action.type === "decrement") {
    return {
      count: state.count - state.step,
      step: state.step,
    }
  } else if (action.type === "reset") {
    return {
      count: 0,
      step: state.step,
    }
  } else if (action.type === "updateStep") {
    return {
      count: state.count,
      step: action.step,
    }
  } else {
    throw new Error("This action type isn't supported.")
  }
}

export default function Counter() {
  const [state, dispatch] = React.useReducer(reducer, {
    count: 0,
    step: 1
  })

  const handleIncrement = () => dispatch({ type: "increment" })
  const handleDecrement = () => dispatch({ type: "decrement" })
  const handleReset = () => dispatch({ type: "reset" })
  const handleUpdateStep = (step) => dispatch({ type: "updateStep", step })

  React.useEffect(() => {
    console.log("useEffect called")
    const id = window.setInterval(() => {
      dispatch({ type: "increment" })
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  return (
    <main>
      <h1>{state.count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>0</button>
      </div>
      <Slider 
        min={1}
        max={10}
        onChange={handleUpdateStep} 
      />
    </main>
  )
}

```

> [!NOTE]
> `useReducer` also offers a bit more flexibility than `useState` since it allows you to decouple how the state is updated from the action that triggered the update - typically leading to more declarative state updates.

### `useLayoutEffect`

The `useLayoutEffect` runs side effects the same way as `useEffect` except that the side effects (including state changes) run BEFORE the rendering stage.

> [!NOTE]
> Use `useLayoutEffect` if you need to synchronize state with the DOM or layout, basically for some use case where the side effect needs to run before the browser paints the screen.

Don't use `useLayoutEffect` unless you're synchronizing externally with the layout.

## 101 Tips

### 1. HOC

A higher order component transforms a component into a better version of itself, adding additional functionality to it. It is a function that takes in a component and returns a new component

HOC are named with the `with` convention, as prefixed function started with “with” as a way of saying that HOCs enhance components with some funcitonality. 

Here are some rules for creating a good higher order component

1. Don’t mutate the passed-in component
2. Don’t destroy the structure of props for the passed-in component 
    - Spread across all the props, and then you can add new ones. 
3. Don’t instantiate HOCs inside other components
    - Instantiating an enhanced component inside another component makes it vulnerable to re-renders. 
    - Only instantiate HOCs outside components. 
    ```jsx
    const Component = (props) => {
      // This is wrong. Never do this
      const EnhancedComponent = HOC(WrappedComponent);
      return <EnhancedComponent />;
    };
    
    // This is the correct way
    const EnhancedComponent = HOC(WrappedComponent);
    const Component = (props) => {
      return <EnhancedComponent />;
    };
    ```

Here is an example of an HOC: 

```jsx
function withMousePosition(WrappedComponent) {
	return (props) => {
		const [mouseX, setMouseX] = useState(0); 
		const [mouseY, setMouseY] = useState(0); 

		useEffect(() => {
			const handleMouseMove = (e) => {
				setMouseX(e.clientX)
				setMouseY(e.clientY)
			}

			window.addEventListener("mousemove", handleMouseMove)
			return () => window.removeEventListener("mousemove", handleMouseMove)
		}, [])

		return <WrappedComponent {...props} mouseX={mouseX}, mouseY={mouseY} />
	}
}
```


### 2. Dealing with Form state

The best way to deal with form state is to use object state and then create handler that sets state using `event.target.value`.

```ts
function Form() {
  const [{ name, email }, setFormState] = useState({
    name: "",
    email: "",
  });

  const createFormValueChangeHandler = (field) => {
    return (event) => {
      setFormState((formState) => ({
        ...formState,
        [field]: event.target.value,
      }));
    };
  };

  return (
    <>
      <h1>Class Registration Form</h1>
      <form>
        <label>
          Name:{" "}
          <input
            type="text"
            value={name}
            onChange={createFormValueChangeHandler("name")}
          />
        </label>
        <label>
          Email:{" "}
          <input
            type="email"
            value={email}
            onChange={createFormValueChangeHandler("email")}
          />
        </label>
      </form>
    </>
  );
}
```

And here is the custom hook version of that: 

```ts
import React, { useState } from "react";

export function useFormObjectState<T extends Record<string, any>>(
  initialData: T
) {
  const [formState, setFormState] = useState(initialData);

  const createFormValueChangeHandler = (field: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((formState) => ({
        ...formState,
        [field]: event.target.value,
      }));
    };
  };

  return { formState, createFormValueChangeHandler };
}
```

### 3. Master `useRef`

You can use `useRef` hook to keep a reference to pretty much anything, and then pass that around. 

Here is how we can use refs with a function call, where we pass in a function to the `ref` prop. The function will take in the DOM element.

This pattern is useful to prevent us from doing a `useEffect` to access and do stuff on the ref - instead the function is called whenever the ref is available or null. 

```ts
function App() {
  // executes the function with HTMLInputElement as soon as mounted or unmounted
  // inputNode can be defined or null.
  const ref = useCallback((inputNode) => {
    inputNode?.focus();
  }, []);

  return <input ref={ref} type="text" />;
}
```

You can also use `useRef` as a way to keep the value of a variable persisting across re-renders. 

```ts
function Timer() {
  const [time, setTime] = useState(new Date());
  const intervalIdRef = useRef();
  const intervalId = intervalIdRef.current;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1_000);
    intervalIdRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  const stopTimer = () => {
    intervalId && clearInterval(intervalId);
  };

  return (
    <>
      <>Current time: {time.toLocaleTimeString()} </>
      <button onClick={stopTimer}>Stop timer</button>
    </>
  );
}
```

You can also use **forward refs** to allow passing a ref to a custom component you made. 

```ts
import React from 'react'

const LabelledInput = (props, ref) => {
  const { id, label, value, onChange } = props

  return (
    <div class="labelled--input">
      <label for={id}>{label}</label>
      <input id={id} onChange={onChange} value={value} ref={ref}/>
    </div>
  )
}

export default React.forwardRef(LabelledInput)
```

The last thing you need to understand is that to prevent memory leaks, you need to clean up refs in the useEffect cleanup. 

```ts
import React, { useRef, useEffect } from 'react';

function MyComponent() {
  const myRef = useRef();

  useEffect(() => {
    // Cleanup when the component unmounts
    return () => {
      myRef.current = null;
    };
  }, []);

  return (
    <div>
      <h1>My Component</h1>
      <div ref={myRef}>This is a DOM element.</div>
    </div>
  );
}

export default MyComponent;
```



### 4. Don't create state unnecessarily

If you can derive a value from state already set up in your component, then just do that. Don't create another state - just use `useMemo`.

## React + Typescript

### `ComponentProps`

The `ComponentProps<>` generic type allows you to get the props of a component easily. You can do this with HTML elements or other components: 

- `ComponentProps<"button">`: returns the prop types of a `<button>` element
- `ComponentProps<typeof MyComponent>`: returns the prop types of a custom component you have. 

```ts
const ButtonWithLogging = (props: ComponentProps<"button">) => {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log("Button clicked"); //TODO: Better logging
    props.onClick?.(e);
  };
  return <button {...props} onClick={handleClick} />;
};
```

### Events

Here are the types for events and event handlers: 

**event object `e` typing**

- `MouseEvent<T>`: for "click" event
- `FocusEvent<T>`: for "focus" event
- `ChangeEvent<T>`: for "change" event

```ts
const MyComponent = ({ onClick, onFocus, onChange }: {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onFocus: (e: FocusEvent<HTMLButtonElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  //   …
};
```

**event handler**

- `MouseEventHandler<T>`: event handler for click event
- `FocusEventHandler<T>`: event handler for "focus" event
- `ChangeEventHandler<T>`: event handler for change event

```ts
const MyComponent = ({ onClick, onFocus, onChange }: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  onFocus: FocusEventHandler<HTMLButtonElement>;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  //   …
};
```

## React best practices

```embed
title: "GitHub - davidkpiano/frontend-masters-state-workshop"
image: "https://opengraph.githubassets.com/d31d699dbb499b07d4056766d19c8d3f58be25dfca69ae3be31d8d82e83ea43c/davidkpiano/frontend-masters-state-workshop"
description: "Contribute to davidkpiano/frontend-masters-state-workshop development by creating an account on GitHub."
url: "https://github.com/davidkpiano/frontend-masters-state-workshop"
favicon: ""
aspectRatio: "50"
```


### Antipatterns

Here are the three antipatterns you should look out for and how to fix them:

1. **Fix Derived State Anti-patterns**
    
    - Remove unnecessary state and effects
    - Calculate derived values directly in render
    - Use `useMemo` only when needed, when computation is expensive.
    
2. **Convert useState to useRef**
    
    - Identify values that don't need re-renders
    - Replace `useState` with `useRef` where appropriate
    - Ensure cleanup is handled properly

3. **Eliminate Redundant State**
    
    - Store minimal required state
    - Derive values instead of duplicating state
    - Use proper data normalization

#### Deriving state antipattern

- **Rule**: If you can calculate (derive) it, don't store it
- **Anti-pattern**: Using `useState` + `useEffect` to sync derived data
- **Best practice**: Calculate derived values directly in render or with `useMemo`
- **Benefits**:
    - Eliminates synchronization bugs
    - Reduces state complexity
    - Automatically stays in sync with source data
- Examples of derived state:
    - Filtered/sorted lists from original data + criteria
    - Computed totals from item arrays
    - Status calculations from multiple boolean flags
    - Available items from excluded items + full list
- When to `useMemo`: Only when the calculation is expensive and dependencies change infrequently

**Before (Anti-pattern):**

```tsx
function TripSummary() {
  const [tripItems] = useState([
    { name: 'Flight', cost: 500 },
    { name: 'Hotel', cost: 300 },
  ]);
  const [totalCost, setTotalCost] = useState(0); // ❌ Unnecessary state

  useEffect(() => {
    setTotalCost(tripItems.reduce((sum, item) => sum + item.cost, 0)); // ❌ Sync effect
  }, [tripItems]);

  return <div>Total: ${totalCost}</div>;
}
```

**After (Best practice):**

```tsx
function TripSummary() {
  const [tripItems] = useState([
    { name: 'Flight', cost: 500 },
    { name: 'Hotel', cost: 300 },
  ]);

  // ✅ Derive the value directly
  const totalCost = tripItems.reduce((sum, item) => sum + item.cost, 0);

  return <div>Total: ${totalCost}</div>;
}
```

#### Refs vs state


- **Rule**: Use `useRef` for values that don't affect rendering
- **Anti-pattern**: Using `useState` for mutable values that don't need re-renders
- **Best practice**: `useRef` for DOM references, timers, counters, previous values
- **Key differences**:
    - `useState`: Triggers re-render when changed
    - `useRef`: No re-render when `.current` changes
- **Common use cases**:
    - Timer IDs (`setInterval`/`setTimeout`)
    - Scroll position tracking
    - Analytics/tracking data
    - Caching expensive calculations
    - Storing previous prop values

**Before (Anti-pattern):**

```tsx
function Timer() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null); // ❌ Causes re-renders

  const startTimer = () => {
    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    setTimerId(id); // ❌ Triggers unnecessary re-render
  };

  useEffect(() => {
    return () => timerId && clearInterval(timerId);
  }, [timerId]); // ❌ Effect runs every time timerId changes

  return <div>{timeLeft}s remaining</div>;
}
```

**After (Best practice):**

```tsx
function Timer() {
  const [timeLeft, setTimeLeft] = useState(60);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null); // ✅ No re-renders

  const startTimer = () => {
    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    timerIdRef.current = id; // ✅ No re-render triggered
  };

  useEffect(() => {
    return () => timerIdRef.current && clearInterval(timerIdRef.current);
  }, []); // ✅ Effect runs only once

  return <div>{timeLeft}s remaining</div>;
}
```
#### Redundant State

Basically, do not store arrays of entire javascript objects within state, as this has increased memory usage. Rather, just store the IDs, and then lookup the full object when needed. 
- **Rule**: Single source of truth for each piece of data
- **Anti-pattern**: Storing the same data in multiple places
- **Best practice**: Store minimal state, derive everything else
- **Common redundancy patterns**:
    - Storing full objects when only ID is needed
    - Duplicating data already available in props/context
    - Storing both raw and formatted versions of same data
    - Keeping derived calculations in separate state
- **Problems with redundant state**:
    - Synchronization bugs when data gets out of sync
    - More complex update logic
    - Increased memory usage
    - Harder to debug and maintain
- **Solutions**:
    - Store only IDs, look up full objects when needed
    - Use props/context data directly
    - Format data during render, not in state
    - 
**Before (Anti-pattern):**

```tsx
function HotelSelection() {
  const [hotels] = useState([
    { id: 'h1', name: 'Grand Hotel', price: 200 },
    { id: 'h2', name: 'Budget Inn', price: 80 },
  ]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null); // ❌ Stores entire object

  const handleSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel); // ❌ Duplicates data from hotels array
  };

  return (
    <div>
      {selectedHotel && (
        <div>
          {selectedHotel.name} - ${selectedHotel.price}
        </div>
      )}
    </div>
  );
}
```

**After (Best practice):**

```tsx
function HotelSelection() {
  const [hotels] = useState([
    { id: 'h1', name: 'Grand Hotel', price: 200 },
    { id: 'h2', name: 'Budget Inn', price: 80 },
  ]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null); // ✅ Store only ID

  const handleSelect = (hotelId: string) => {
    setSelectedHotelId(hotelId); // ✅ Store minimal data
  };

  // ✅ Derive the full object when needed
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  return (
    <div>
      {selectedHotel && (
        <div>
          {selectedHotel.name} - ${selectedHotel.price}
        </div>
      )}
    </div>
  );
}
```

#### Cascading use effects

Cascading use effects where each effect not only triggers a re-render but another effect leads to buggy, hard-to-trace code and is a complete antipattern

```tsx
// Effect 1: Trigger search when inputs change
useEffect(() => {
  if (destination && startDate && endDate) {
    setIsSearchingFlights(true);
  }
}, [destination, startDate, endDate]);

// Effect 2: Perform flight search
useEffect(() => {
  if (!isSearchingFlights) return;
  // ... search logic
}, [isSearchingFlights]);

// Effect 3: Trigger hotel search when flight selected
useEffect(() => {
  if (selectedFlight) {
    setIsSearchingHotels(true);
  }
}, [selectedFlight]);

// Effect 4: Perform hotel search
useEffect(() => {
  if (!isSearchingHotels) return;
  // ... search logic
}, [isSearchingHotels]);
```

Here is a better solution using a reducer, which allows for only one `useEffect` where we run different code based on the state from the reducer:

```ts
type Action =
  | { type: 'SET_INPUT'; inputs: Partial<SearchInputs> }
  | { type: 'flightUpdated'; flight: Flight }
  | { type: 'hotelUpdated'; hotel: Hotel }
  | { type: 'SET_ERROR'; error: string };

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'SET_INPUT':
      const inputs = { ...state.inputs, ...action.inputs };
      return {
        ...state,
        inputs,
        status: allInputsValid(inputs) ? 'searchingFlights' : state.status,
      };
    case 'flightUpdated':
      return {
        ...state,
        status: 'searchingHotels',
        selectedFlight: action.flight,
      };
    // ... other cases
  }
}

// Single effect handles all async operations based on status
useEffect(() => {
  if (state.status === 'searchingFlights') {
    searchFlights().then((flight) =>
      dispatch({ type: 'flightUpdated', flight })
    );
  }
  if (state.status === 'searchingHotels') {
    searchHotels().then((hotel) => dispatch({ type: 'hotelUpdated', hotel }));
  }
}, [state]);
```

#### Deeply nested data


- **Rule**: Flatten data structures by storing entities in separate collections with ID references
- **Anti-pattern**: Deep nesting creates complex dependencies and update patterns
- **Best practice**: Normalize data to avoid redundancy and ensure consistency
- **Benefits**:
    - Simplified updates with O(1) lookups instead of O(n+m) traversals
    - Better performance with minimal re-renders
    - Cleaner, more maintainable reducer logic
    - Easier implementation of cross-entity operations



Deeply nested data structures like so where an object has a sub-collection (an array of objects) lead to O(n x m) updates and traversals, leading to less performant code.


```ts
// ❌ Nested structure
interface NestedState {
  destinations: Array<{
    id: string;
    name: string;
    todos: Array<{
      id: string;
      text: string;
    }>;
  }>;
}
```

This is bad. for example, to find a specific todo within a specific destination, the code complexity would be O(n + m):

```ts
function findTodo(state: NestedState, destinationId: string, todoId: string) {
	// O(n)
	const destination = state.destinations.find(
		dest => dest.id === destinationId
	)
	// O(m)
	const todo = destination.todos.find(todo => todo.id === todoId)
	return todo // O (n + m)
}
```

You can normalize it better, like so, modeling relational tables like SQL, and instead of using arrays, you can model a collection as a large, flat object, where each key in a collection object is an ID that maps to the actual record, resulting in O(1) lookup, especially when used with a map.

```ts
// ✅ Normalized structure
interface NormalizedState {
  destinations: { [id: string]: { id: string; name: string } };
  todos: { [id: string]: { id: string; text: string; destinationId: string } };
}
```

Now to find a specific todo, the code becomes O(1):


```ts
function findDestinationOfTodo(state: NestedState, todoId: string) {
	const destinationId = state.todo[todoId].destinationId // O(1)
	return state.destinations[destinationId] // O(1)
}
```

**Deeply Nested Updates**

The current travel itinerary application stores data in a deeply nested structure where each destination contains an array of todos. This creates several problems:

When updating or deleting a todo item, the reducer must:

1. Find the correct destination by mapping through all destinations
2. Find the correct todo within that destination's todos array
3. Create a new nested structure preserving immutability

```ts
// ❌ Complex nested update - hard to read and error-prone
destinations: state.destinations.map((dest) =>
  dest.id === action.destinationId
    ? {
        ...dest,
        todos: dest.todos.filter((todo) => todo.id !== action.todoId),
      }
    : dest
);
```

**Performance Issues**

- **O(n×m) complexity**: Every todo operation requires iterating through destinations AND todos
- **Unnecessary re-renders**: Updating one todo causes the entire destinations array to be recreated
- **Memory overhead**: Deeply nested objects are harder for JavaScript engines to optimize

**Code Complexity**

- Reducer logic becomes increasingly complex with more nesting levels
- Difficult to implement features like global todo search or cross-destination operations
- Error-prone when adding new nested relationships

**benefits of data normalization**

Normalization flattens the data structure by storing entities in separate collections and using IDs to reference relationships:

**Simplified Updates**

```ts
// ✅ Normalized - direct and clear
case 'DELETE_TODO':
  return {
    ...state,
    todos: state.todos.filter(todo => todo.id !== action.todoId)
  }
```

**Better Performance**

- **O(1) lookups**: Direct access to entities by ID using objects/Maps
- **Minimal re-renders**: Only affected components re-render
- **Efficient operations**: No need to traverse nested structures

**Code Clarity**

- Each entity type has clear, focused update logic
- Easy to implement complex queries and cross-entity operations
- Reducer actions become more predictable and testable

---
### When to use reducers

When dealing with a lot of event driven code, then reach for reducers. If we have a bunch of useEffects, each triggering the other, that's an antipattern and we should reach for a reducer.

1. **Effects should be minimal**: Use effects only for synchronizing with external systems
2. **State updates should be explicit**: Use actions that clearly describe what happened
3. **Business logic belongs in reducers**: Keep effects simple and focused
4. **Think in events, not reactions**: Model user interactions and business events

A good use case for reducers is to expose it in a context provider so that state is shared across your app with easy ways to update the context state.

```tsx
// Context eliminates prop drilling
const BookingContext = createContext();

function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
}

function FlightForm() {
  const { state, dispatch } = useBooking(); // Direct access to state
}
```

You can then use the context like so:

```tsx
// Custom hook with validation
function useBooking() {
  const context = use(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
}
```

Another use case for reducers is to avoid cascading use effects and isntead just abstract that into one `useEffect` that relies on the state of the reducer.

```tsx
type Action =
  | { type: 'SET_INPUT'; inputs: Partial<SearchInputs> }
  | { type: 'flightUpdated'; flight: Flight }
  | { type: 'hotelUpdated'; hotel: Hotel }
  | { type: 'SET_ERROR'; error: string };

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'SET_INPUT':
      const inputs = { ...state.inputs, ...action.inputs };
      return {
        ...state,
        inputs,
        status: allInputsValid(inputs) ? 'searchingFlights' : state.status,
      };
    case 'flightUpdated':
      return {
        ...state,
        status: 'searchingHotels',
        selectedFlight: action.flight,
      };
    // ... other cases
  }
}

// Single effect handles all async operations based on status
useEffect(() => {
  if (state.status === 'searchingFlights') {
    searchFlights().then((flight) =>
      dispatch({ type: 'flightUpdated', flight })
    );
  }
  if (state.status === 'searchingHotels') {
    searchHotels().then((hotel) => dispatch({ type: 'hotelUpdated', hotel }));
  }
}, [state]);
```

A main use case of reducers is avoiding 

### Pure functions for app logic


- **Rule**: All business logic should be represented in pure functions
- **Anti-pattern**: Mixing side effects with state updates
- **Best practice**: Separate pure state transitions from side effects
- **Benefits**:
    - Deterministic behavior - same input always produces same output
    - Easy to test in isolation
    - Composable and reusable logic
    - Better performance through memoization

### State machines for modeling (using status)


- **Rule**: Make impossible states impossible through explicit state modeling
- **Anti-pattern**: Using multiple boolean flags that can create invalid combinations
- **Best practice**: Use state machines to define valid states and transitions
- **Benefits**:
    - Prevents impossible states at compile time
    - Makes state transitions clear and predictable
    - Better error handling and edge case management
    - Self-documenting state logic

When trying to conditionally render things based on conditions with many boolean states, you can often arrive at a bug or an impossible state. By instead changing the boolean condition state to string enums, we explicitly say what types of state are possible and what we want to handle. 

- **Rule**: Use discriminated unions to model different application states
- **Anti-pattern**: Using boolean flags that can create impossible states
- **Best practice**: Define explicit states with their associated data
- **Benefits**:
    - Impossible states become impossible
    - Type safety ensures correct data access
    - Clearer component logic
    - Better error handling

```tsx
// ❌ Boolean flags can create impossible states
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// ✅ Type states prevent impossible combinations
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: FlightData };

const [state, setState] = useState<State>({ status: 'idle' });
```

You can also take this one step further and take advantage of discriminated unions in typescript to ensure correct state updates. For example, you can update state based on the status and create a type like this:

- Notice the object overloads, where a unique object is created based on the `status` property.

```ts
type FlightData = {
  destination: string;
  departure: string;
  arrival: string;
  passengers: number;
  error: string | null;
} & (
  | {
      status: 'idle';
      flightOptions: null;
    }
  | {
      status: 'submitting';
      flightOptions: null;
    }
  | {
      status: 'error';
      error: string;
    }
  | {
      status: 'success';
      flightOptions: FlightOption[];
    }
);
```


### Combining Related State


- **Rule**: Group related state variables into single objects for better organization
- **Anti-pattern**: Having many individual `useState` calls for related data
- **Best practice**: Combine related state into objects and use single state updates
- **Benefits**:
    - Fewer state variables to manage
    - Atomic updates ensure consistency
    - Easier to understand relationships between data
    - Less boilerplate code for state management

**Before:**

```tsx
// ❌ Multiple individual states for related data
const [destination, setDestination] = useState('');
const [departure, setDeparture] = useState('');
const [arrival, setArrival] = useState('');
const [passengers, setPassengers] = useState(1);

// Updating a single field
setDestination('Paris');
```

**After:**

```tsx
// ✅ Combined related state
const [searchForm, setSearchForm] = useState({
  destination: '',
  departure: '',
  arrival: '',
  passengers: 1,
});

// Updating a single field
setSearchForm({
  ...searchForm,
  destination: 'Paris',
});

setSearchForm((prev) => ({
  ...prev,
  destination: 'Paris',
}));
```

### External state management in react

When to use external state management libraries in react? You use it when you have more than one react context provider in your app, which signals that your app is growing in complexity.

Context is not that performant, since it was meant for states that don't frequently change. 

> [!NOTE]
> In summary, choose libraries like zustand or nanostores over context when you have lots of state (multiple context providers) and state that changes frequently

There are two types of state management systems: stores and atoms.
#### stores vs atom

**Store-based solutions** (Zustand, Redux Toolkit, XState Store) use a **centralized approach** - all state lives in one or few stores.

**Atomic solutions** (Jotai, Recoil, XState Store) use a **distributed approach** - state is broken into independent atoms that can be composed.

**Choose stores when you have:**

- **Complex state relationships** - Many pieces of state depend on each other
- **Clear data flow requirements** - You need predictable, traceable state updates
- **Team coordination needs** - Multiple developers working on shared state logic

**Store benefits:**

- Single source of truth
- Excellent debugging with dev tools
- Clear separation of business logic
- Predictable state updates
- Great TypeScript support

**Choose atoms when you have:**

- **External state** - State is updated from an external source
- **Independent pieces of state** - Most state doesn't depend on other state
- **Component-specific concerns** - State is primarily tied to specific UI components
- **Performance-critical applications** - Need fine-grained subscriptions

**Atomic benefits:**

- Automatic optimization and caching
- Excellent performance with selective rendering
- Highly composable and reusable
- Bottom-up architecture flexibility
- Natural code splitting

You can also combine both approaches:

- Use **stores** for core business logic and complex workflows
- Use **atoms** for UI-specific state and independent pieces of data

```tsx
// Core business logic in store
const useBookingStore = create<BookingStore>(...);

// UI-specific state as atoms
const themeAtom = atom<'light' | 'dark'>('light');
const sidebarOpenAtom = atom<boolean>(false);
```

> [!NOTE]
> In summary, use **atoms** for simple state (user settings) and use **stores** for the main state of your application (user data, things with CRUD operations)

#### Xstate

Here is an example of creating a store in xstate:

```ts
import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';

const bookingStore = createStore({
  context: initialState,
  on: {
    flightSearchUpdated: (
      context,
      event: Partial<{
        destination: string;
        departure: string;
        arrival: string;
        passengers: number;
        isOneWay: boolean;
      }>
    ) => {
      return {
        ...context,
        flightSearch: { ...context.flightSearch, ...event },
      };
    },
    searchFlights: (context) => {
      return {
        ...context,
        currentStep: Step.FlightResults,
      };
    },
    flightSelected: (context, event: { flight: FlightOption }) => {
      return {
        ...context,
        selectedFlight: event.flight,
        currentStep: Step.HotelSearch,
      };
    },
    changeFlight: (context) => {
      return {
        ...context,
        currentStep: Step.FlightSearch,
      };
    },
    hotelSearchUpdated: (
      context,
      event: Partial<{
        checkIn: string;
        checkOut: string;
        guests: number;
        roomType: string;
      }>
    ) => {
      return {
        ...context,
        hotelSearch: { ...context.hotelSearch, ...event },
      };
    },
    searchHotels: (context) => {
      return {
        ...context,
        currentStep: Step.HotelResults,
      };
    },
    hotelSelected: (context, event: { hotel: HotelOption }) => {
      return {
        ...context,
        selectedHotel: event.hotel,
        currentStep: Step.Review,
      };
    },
    changeHotel: (context) => {
      return {
        ...context,
        currentStep: Step.HotelSearch,
      };
    },
    book: (context) => {
      return {
        ...context,
        currentStep: Step.Confirmation,
      };
    },
    back: (context) => {
      switch (context.currentStep) {
        case Step.FlightResults:
          return {
            ...context,
            currentStep: Step.FlightSearch,
          };
        case Step.HotelSearch:
          return {
            ...context,
            currentStep: Step.FlightResults,
          };
        case Step.HotelResults:
          return {
            ...context,
            currentStep: Step.HotelSearch,
          };
        case Step.Review:
          return {
            ...context,
            currentStep: Step.HotelResults,
          };
        default:
          return context;
      }
    },
  },
});
```

## Performance

### Lazy Loading/Code splitting

#### Basic Code Splitting

**Code splitting** refers to the practice of requesting JavaScript only when you need it or the user interacts with it. It prevents a large JS bundle from slowing down initial page load.

Here is how you can asynchronously load React components and code split them: 

1. Import a component asynchronously with the `React.lazy()` method
    
    ```tsx
    import {lazy} from "React"
    
    const DetailsPage = lazy(() => import("./Details"))
    ```
    
2. Wrap the lazy-loaded component in a `<Suspense>` component, and provide the loading element to render in the `fallback=` prop.
    
    ```tsx
    const Dashboard = () => {
    	return (
    		<Suspense>
    			<DetailsPage />
    		</Suspense>
    	)
    }
    ```

> [!NOTE] Is code splitting worth it?
> You need to splitting at least dozens of kilobytes for code-splitting to be actually worth it.

#### Lazy loading only when component is visible

For the best performance gains, you could load a component only when it is about to visible in the DOM. 

There are two methods you could use for this: 
- Use the `react-intersection-observer` library
- Use the `react-loadable-visibility` library

**react-intersection-observer**

We can combine the intersection observer along with `<Suspense>` and `React.lazy()` to lazy load components and show them only when they are in view, boosting our performance. 

1. Install with `npm i react-intersection-observer`
2. Use the `useInView()` hook to load a component only when it is in view.

```ts
import { Suspense, lazy } from "react";
import { useInView } from "react-intersection-observer";
const Listing = lazy(() => import("./components/Listing"));

function ListingCard(props) {
  const { ref, inView } = useInView();

  return (
    <div ref={ref}>
      <Suspense fallback={<div />}>{inView && <Listing />}</Suspense>
    </div>
  );
}
```

If using React Router, you can enable code splitting for routes like so: 

```ts
import React, { lazy, Suspense } from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";

const App = lazy(() => import("./App"));
const About = lazy(() => import("./About"));
const Contact = lazy(() => import("./Contact"));

ReactDOM.render(
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/">
          <App />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/contact">
          <Contact />
        </Route>
      </Switch>
    </Suspense>
  </Router>,
  document.getElementById("root")
);
```

**react-loadable-visibility**

```ts
import LoadableVisibility from "react-loadable-visibility/react-loadable";
import Loading from "./my-loading-component";
 
const LoadableComponent = LoadableVisibility({
  loader: () => import("./my-component"),
  loading: Loading
});
 
export default function App() {
  return <LoadableComponent />;
}
```



### State-lifting vs colocation

There are two ways we provide state to components in React.


The default behavior of React is to rerender the entire component tree if any component within that tree has a state change. If we lift state too much, then the component tree becomes larger and larger and thus the app not only rerenders more often, but renders also become more expensive.

We should prefer colocation to state lifting whenever possible.
### Memoization in React: main performance boost
#### `useMemo()` and `useCallback()` and `memo()`

In React, JSX elements only rerender once their props change. To check if their props changed, they use a referential equality check `===`, which works for primitives but not for objects or functions. 

> [!NOTE]
> This means that if you create a function or object inside a component and then pass that as a prop to a JSX element, then that function or object gets recreated every single time and thus the props strict equality check does not work because the references are different, leading to the JSX element rerendering every time if you pass an object or a callback as a prop.

The solution? Memoizing objects with `useMemo()` and functions with `useCallback()`

- `useMemo(cb, deps)`: takes in a callback and a dependency array, returning the return value of the callback.
	- The callback should return a value, and that value will be memoized, only changing when at least one of the variables in the dependency array changes.
- `useCallback(cb, deps)`: takes in a callback and a dependency array, returns the callback as a memoized version of it.
	- The callback will only get invoked again if any of the dependencies in the dependencies array changes. 
	- This returns the callback itself.

The dependency arrays check if any dependency variables changed by strict equality (by reference with `===`). 

This means that for both of the dependency arrays of `useMemo()` and `useCallback()`, the variables you pass into the dependency array must either be primitive values or memoized. 

- **bad scenario**: If you pass unmemoized objects and functions as variables into the dependency array, then those objects/functions are getting recreated every time, thus have different references and thus `useMemo()` and `useCallback()` fails and just recreate the object/function each and every time.

We can fix this bad scenario by adhering to two good techniques:

- **mitigation 1 (use primitive dependencies only)**: Instead of putting entire objects as variables into the dependency array, put object properties that are primitive values. 
	- Primitive values work with strict equality.
- **mitigation 2 (memoize objects and callbacks)**: Go up the chain and use `useMemo()` and `useCallback()` to memoize any objects or functions you put inside the dependency array. This leads to referential equality working.

Here's an example of mitigation 1:

```tsx
function App({person} : {person : {name: string; age: number}}) {
	const greeting = useMemo(() => {
		return `Hello ${person.name}. You are ${person.age} years old`
	}, [person.name, person.age])
}
```

Here's an example of mitigation 2:

```tsx
function App({person} : {person : {name: string; age: number}}) {

	// memoized version of person
	const newPerson = useMemo(() => {
		return person
	}, [person.name, person.age])
	
	// now it's safe to use newPerson as dependency, as it only changes
	// when Object.is(newPerson, person) is false
	const greeting = useMemo(() => {
		return `Hello ${newPerson.name}. You are ${newPerson.age} years old`
	}, [newPerson])
}
```

> [!NOTE]
> You should use `useMemo()` primarily for memoizing objects instead of primitive values. This is because there is no need to memoize primitive values (since they pass strict equality checks). Only memoize primitive values if they are derived from an expensive calculation that should be cached for better performance.

> [!IMPORTANT]
> An also important thing to remember is that any `setState` callback is automatically memoized, so you don't need to pass that function into the dependency array as that function always has the same reference.

Now if you pass objects memoized with `useMemo()` and callbacks memoized with `useCallback()` as props to JSX elements, then that JSX element will not rerender unless the variables in the dependency arrays change.

However, it's a different story for components. Because React likes to err on the side of caution, components always rerender any time 1) a parent component rerenders 2) a state change in the component occurs.

We use the `memo()` function to wrap a component such that the component will not rerender unless its props change from the last render. However, the props are compared with strict equality, so we must use `useMemo()` and `useCallback()` to also memoize any object/function props passed to the component, in tandem with wrapping with `memo()`.

In summary, if you are passing an object or function as a prop:

- **to prevent JSX Element rerender**: simply memoize that object or function with `useMemo()` or `useCallback()`
- **to prevent component rerender**: You must wrap the component with `memo()` and then  memoize the object or function props with `useMemo()` or `useCallback()`

**useMemo vs useCallback**

The main difference between `useMemo()` and `useCallback()` is that `useMemo()` should be used for objects while `useCallback()` should be used to explicitly cache functions.

However, `useCallback()` is just `useMemo()` but returning a function instead of a object - it's essentially just syntactic sugar.

**when to use each one**

- **use `useMemo()` when**:
	- **case 1**: trying to get a constant or predictable reference to an object so it only gets recreated when one of its dependencies changes.
	- **case 2**: memoizing an expensive calculation result so it doesn't recompute on every rerender.
- **use `useCallback()` when**
	- **case 1**: needing to memoize a callback so it passes referential equality, only being recreated when one of its dependencies changes.


#### Context

Understanding how to use context is important for improving performance in React applications: 

>When a component uses some value from context, and the context value changes, the component will re-render.

Based off that, here are two important tips to implement:

1. A good rule of thumb is to wrap the component you directly nest inside the context provider with `React.memo()`.
2. Memoize any objects/functions/primitives that you provide to the `value` prop in the `<Context.Provider>` component, either using `useMemo()` or `useCallback()` to prevent unnecessary recreations.


### Transitions and deferred values

#### `useTransition()`

For anything we would want to debounce, like a search bar that performs an expensive search operation for every keystroke, we want to use the `useTransition()` hook.

Often what happens for something like an expensive search query is that a user will typ a keystroke, initiating a laggy response, and then find that it's clunky and janky since the user input is disabled while the long search operation is taking place.

This hooks solves that problem. The purpose of this hook is to keep the UI and user interactions snappy by setting low priority work (the search operation) to happen later when the DOM is not budy, so you can tackle the high priority work (setting keystroke state to keep snappy user interactions ) instead.


> [!NOTE] 
> What marks high priority work? It's anything that deals with immediate DOM manipulation that is visible to the user, or DOM manipulation created by some user interaction.
> 
> Reflecting user input back to them is high priority because if the UI starts lagging and freezing, preventing users from seeing the results of their actions (like typing, hovering, or animations), it creates an infuriating user experience. Users expect immediate feedback from their interactions.




```tsx
function App() {
	const [isPending, startTransition] = useTransition()
	
	// state that handles input user interaction, high priority
	const [input, setInput] = useState("")
	// state that is logical value of input, low prioirity, expensive work
	const [query, setQuery] = useState("")
	
	
	function onKeystroke(value) {
		// high piroity work: immediately reflect user interaction in DOM
		setInput(value)
		
		// low priority work: set state that will then kickoff expensive operation
		startTransition(() => {
			setQuery(value)
		})
	}
	
	useEffect(() => {
		// perform expensive operation in idle time
		expensiveSearchOperation(query)
	}, [query])
	
	
	
}
```

Here are two cases when NOT to use transitions:

- **state changes are user-visible and important**: navigations, error validation, alerts, are all high priority DOM manipulation work.
- **state changes are simple and inexpensive**: Transitioning any simple state change that doesn't kick off any expensive operation or giant component tree rerender just causes additional overhead that doesn't solve anything.

Here's another example:

```tsx
import { useTransition, useState } from 'react';

// ✅ Smooth typing with transitions
function SearchResults() {
  const [query, setQuery] = useState('');
  const [filteredQuery, setFilteredQuery] = useState('');
  const [items] = useState(generateLargeDataset());
  const [isPending, startTransition] = useTransition();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(filteredQuery.toLowerCase()),
  );

  const handleSearch = (value: string) => {
    setQuery(value); // Urgent: update input immediately

    startTransition(() => {
      setFilteredQuery(value); // Non-urgent: defer filtering
    });
  };

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search..." />
      {isPending && <div>Filtering...</div>}
      {filteredItems.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

- **Immediate update**: `setQuery(value)` runs synchronously, and this sets the state of the controlled input, handling DOM manipulation and updates keystrokes so that they immediately visible to the user and so typing stays responsive
- **Deferred update**: `setFilteredQuery(value)` inside `startTransition` gets lower priority, since we run expensive computation based on the value of that state3.
- **Loading state**: `isPending` tells us when the transition is still processing, basically `isPending` will be true as long as the DOM is busy (doing a `setState()` call somewhere). 
	- Think of it as automatic debouncing. It will be pending until the DOM sotps being busy (the user stops typing).


Here is an example of combining debouncing with a transition

```tsx
function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  // Debounce the search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      startTransition(() => {
        // This could be an API call or expensive filtering
        performSearch(searchQuery).then(setResults);
      });
    }, 300),
    [],
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query, debouncedSearch]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />

      {isPending && <div>Searching...</div>}

      <div className="results">
        {results.map((result) => (
          <SearchResult key={result.id} item={result} />
        ))}
      </div>
    </div>
  );
}
```

There are two common problems to look out for, and tips on how to mitigate them:


##### Stale Closures in Transitions

Be careful with closures inside `startTransition`:

```tsx
// ❌ This captures stale values
const handleUpdate = () => {
  startTransition(() => {
    // `someValue` might be stale if the transition is interrupted
    setResults(processData(someValue));
  });
};

// ✅ Get fresh values inside the transition
const handleUpdate = () => {
  startTransition(() => {
    setResults((currentResults) => processData(getCurrentValue()));
  });
};
```

##### Transitions Don’t Make Code Faster

Transitions don’t magically speed up your code—they just prevent slow code from blocking urgent updates:

```tsx
// ❌ Still slow, just non-blocking
startTransition(() => {
  setResults(reallySlowOperation(data)); // This is still slow!
});

// ✅ Combine with other optimizations
startTransition(() => {
  // Use web workers, memoization, virtualization, etc.
  setResults(optimizedOperation(data));
});
```
#### `useDeferredValue()`

`useDeferredValue()` defers state changes that trigger expensive computation, delegating them to be run during browser idle time.

```tsx
import { useDeferredValue, useState, useMemo } from 'react';

function SearchResults({ query }: { query: string }) {
  // Defer state change based on prop `query` changing.
  const deferredQuery = useDeferredValue(query);

  // Only recompute when the deferred value changes
  const results = useMemo(() => {
    return searchExpensiveDatabase(deferredQuery);
  }, [deferredQuery]);

  return (
    <div>
      {results.map((result) => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
}

function App() {
  const [query, setQuery] = useState('');

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />
      <SearchResults query={query} />
    </div>
  );
}
```

> [!IMPORTANT]
> Always pair `useDeferredValue` with `useMemo` or `useCallback`—otherwise, your components will still re-render on every change, defeating the purpose.

However, using `useDeferredValue()` leads to stale values while the transition is taking place, as opposed to the `isPending` variable from the `useTransition()` hook. 

To mitigate this, we can simply say that the loading state happens when the data is stale, and that happens when the deferred value is not equal to the normal state value.

```tsx
function SearchWithLoadingState() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    // Simulate expensive search
    return performExpensiveSearch(deferredQuery);
  }, [deferredQuery]);

  // Key insight: results are "stale" when the current query
  // doesn't match the deferred query
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />

      <div className="results-container">
        {isStale && <div className="loading-overlay">Searching...</div>}
        <div className={isStale ? 'results stale' : 'results'}>
          {results.map((result) => (
            <div key={result.id}>{result.title}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Here are some examples of when to use this hook and when not to use it:

```tsx
// ❌ Don't defer critical user feedback
function LoginForm() {
  const [email, setEmail] = useState('');
  const deferredEmail = useDeferredValue(email); // Bad idea!

  const validationErrors = useMemo(() => {
    return validateEmail(deferredEmail);
  }, [deferredEmail]);

  // User expects immediate validation feedback
  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {validationErrors.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </div>
  );
}

// ❌ Don't defer simple computations
function SimpleCounter() {
  const [count, setCount] = useState(0);
  const deferredCount = useDeferredValue(count); // Unnecessary overhead

  return <div>Count: {deferredCount}</div>;
}

// ✅ DO use it for expensive, non-critical updates
function AnalyticsDashboard() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const expensiveStats = useMemo(() => {
    return calculateComplexAnalytics(deferredQuery);
  }, [deferredQuery]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ComplexChart data={expensiveStats} />
    </div>
  );
}
```

Here are some common gotchas:

##### Gotcha #1: Missing Memoization

```tsx
// ❌ Still re-renders on every change
function BadExample({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);

  // This runs on every render!
  const results = expensiveComputation(deferredQuery);

  return <div>{results}</div>;
}

// ✅ Properly memoized
function GoodExample({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    return expensiveComputation(deferredQuery);
  }, [deferredQuery]);

  return <div>{results}</div>;
}
```

##### Gotcha #2: Deferring the Wrong Thing

```tsx
// ❌ Deferring the final result instead of the input
function BadExample({ items, query }: { items: Item[]; query: string }) {
  const filteredItems = items.filter((item) => item.name.includes(query));
  const deferredItems = useDeferredValue(filteredItems); // Wrong!

  return <ItemList items={deferredItems} />;
}

// ✅ Defer the input, memoize the computation
function GoodExample({ items, query }: { items: Item[]; query: string }) {
  const deferredQuery = useDeferredValue(query);

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.name.includes(deferredQuery));
  }, [items, deferredQuery]);

  return <ItemList items={filteredItems} />;
}
```
#### Transitions vs deferred values

- `useTransition` is used when you control the code and allows you to pass a function that marks certain operations as low priority. 
	- **this is more common**
- `useDeferredValue` is used when you don't control the code and works with a value that may trigger expensive operations, allowing you to defer updates to that value.
	- **this is uncommon**


> [!NOTE] 
> You should reach for `useTransition` first when you control the code. If that doesn't fit due to constraints where you only have access to a value and don't have total control of the situation, then use `useDeferredValue`.


### Using virtualized lists

JUst like `<FlatList>` component in react native, we can virtualize lists of elements to make them more performant. In react we do this through the `react-window` library from npm:

```ts
import React from "react";
import ReactDOM from "react-dom";
import { FixedSizeList as List } from "react-window";

const itemsArray = [...]; // our data

const Row = ({ index, style }) => (
  <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
    {itemsArray[index].name}
  </div>
);

const Example = () => (
  <List
    className="List"
    height={150}
    itemCount={itemsArray.length}
    itemSize={35}
    width={300}
  >
    {Row}
  </List>
);

ReactDOM.render(<Example />, document.getElementById("root"));
```

## React query

### Setup

Here is how to setup react query:

```tsx
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {

  return (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
	        <Routes>
	          <Route path="/" element={<Index />} />
	          {/* more routes */}
	        </Routes>
	    </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}

export default App
```

### `useQuery`

Here is a basic example of how to use react query:

- `queryKey`: a string array that will be an ID to be used for caching
- `queryFn`: an async function that returns something, which is the actual querying.
- `staleTime`: how long to cache for in milliseconds, infinite by default.
- `retry`: how many times to retry. By default, it's 0.
- `refetchInterval`: the interval of time to wait before refetching again, in milliseconds.
- `enabled`: lets you conditionally execute the hook by passing a boolean to enable or disable the hook. If true, enables the hook (default), if false, disables the hook.

```ts
function FlightSearchResults() {
  const {
    data: flights,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['flights', flightSearch], // ✅ Automatic caching by key
    queryFn: () => fetchFlights(flightSearch), // ✅ Simple data fetching
    staleTime: 5 * 60 * 1000, // ✅ Cache for 5 minutes
    retry: 2, // ✅ Automatic retry on failure
  });

  // ✅ Same conditional rendering, but managed automatically
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* render flights */}</div>;
}
```

```tsx
// src/components/PostDetail.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';

const fetchPostById = async (postId) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  return response.json();
};

function PostDetail({ postId }) {
  const { data, isLoading, isError, error } = useQuery({
    // Query key includes postId, so changing postId will refetch
    queryKey: ['post', postId],
    // queryFn receives a query context object, from which you can destructure queryKey
    queryFn: ({ queryKey }) => fetchPostById(queryKey[1]), // queryKey[1] is postId
    // `enabled` option: only run this query if `postId` is truthy
    enabled: !!postId,
  });

  if (!postId) {
    return <div>Select a post to view details.</div>;
  }

  if (isLoading) {
    return <div>Loading post {postId}...</div>;
  }

  if (isError) {
    return <div>Error loading post: {error.message}</div>;
  }

  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.body}</p>
    </div>
  );
}

export default PostDetail;
```

### `useMutation`

To create a mutation with the `useMutation` hook, you pass in these options to the `useMutation()` hook:

- `mutationFn`: an async function that performs some mutation, like a POST request, and can also return data. It can accept any number of arguments, since it's a function you create.
- `onMutate(data)`: a callback that gets triggered during mutation, intended to be used for optimistic updates. The `data` arg provided is whatever was returned from the async mutation fn.


You also have these optional, less important callback you can pass in to hook into the mutation lifecycle.
- `onSuccess(data, args)`: callback that gets triggered when the async mutation function successfully executed.
	- `data`: the data that gets returned from the mutation function.
	- `args`: the arguments that were passed into the create mutation
- `onError(err, args)`: callback that gets triggered when the async mutation function fails and throws an error.
	- `err`: the error thrown
	- `args`: the arguments that were passed into the create mutation
- `onSettled(data, err args)`: callback that gets triggered when the async mutation function promise settles.
	- `data`: the data that gets returned from the mutation function.
	- `err`: the error thrown
	- `args`: the arguments that were passed into the create mutation



```tsx
// src/components/CreatePostForm.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createPost = async (newPost) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost),
  });
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
  return response.json();
};

function CreatePostForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const {
    mutate,       // The function to trigger the mutation
    isLoading,    // True while the mutation is in progress
    isError,      // True if the mutation failed
    isSuccess,    // True if the mutation succeeded
    error         // Error object
  } = useMutation({
    mutationFn: createPost,
    onSuccess: (data, variables, context) => {
      // data: the response from createPost
      // variables: the `newPost` object passed to mutate
      // context: optional context object from onMutate

      console.log('Post created successfully:', data);

      // --- Invalidation and Refetching ---
      // Invalidate the 'posts' query to trigger a refetch of the list
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Optionally, you could also directly update the cache:
      // queryClient.setQueryData(['posts'], oldPosts => {
      //   return oldPosts ? [...oldPosts, data] : [data];
      // });
    },
    onError: (error, variables, context) => {
      console.error('Error creating post:', error);
      // Rollback optimistic update if any
    },
    onSettled: (data, error, variables, context) => {
      // Runs regardless of success or error
      console.log('Mutation settled.');
    },
    // --- Optimistic Updates ---
    // Optimistically update the UI BEFORE the server responds
    // onMutate is called before the mutationFn
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches for the posts list (important!)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the current cached posts list (for potential rollback)
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update the 'posts' cache
      queryClient.setQueryData(['posts'], oldPosts => {
        // Generate a temporary ID for the new post
        const tempId = Math.random().toString(36).substring(7);
        const optimisticPost = { id: tempId, ...newPost, userId: 1 }; // Add any default server-side props

        return oldPosts ? [...oldPosts, optimisticPost] : [optimisticPost];
      });

      // Return a context object with the snapshot
      return { previousPosts };
    },
    // If the mutation fails, use the context to roll back the cache
    onError: (err, newPost, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ title, body }); // Trigger the mutation
    setTitle('');
    setBody('');
  };

  return (
    <div>
      <h2>Create New Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="body">Body:</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isLoading}
          ></textarea>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
      {isSuccess && <p style={{ color: 'green' }}>Post created!</p>}
      {isError && <p style={{ color: 'red' }}>Error: {error.message}</p>}
    </div>
  );
}

export default CreatePostForm;
```

### queryClient

You can access the query client through the `useQueryClient()` hook, which allows you to ahve global access to all data querying and mutation operations throughout your app, and programmatically refetch and invalidate them at will:

```ts
  const queryClient = useQueryClient();

```

- `queryClient.invalidateQueries({ queryKey: key })`: Marks queries matching the key as stale. They will refetch when next observed or on global refetch triggers (focus, reconnect).
- `queryClient.refetchQueries({ queryKey: key })`: Forces an immediate refetch of queries matching the key, regardless of their stale status.
- `queryClient.cancelQueries({ queryKey: key })`: cancels all queries regarding the filter.

Here are single-query specific things you can do, doing something with a query attached to a specific key.

- `queryClient.getQueryData(key)`: gets the query data associated with the specified key.
- `queryClient.setQueryData(key, data)`: sets the query data associated with the specified key to some new data.

```ts
// Invalidate all queries
queryClient.invalidateQueries();

// Invalidate all queries starting with 'posts'
queryClient.invalidateQueries({ queryKey: ['posts'] });

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['post', 123] });

// Invalidate all queries for a specific type and status
queryClient.invalidateQueries({ queryKey: ['todos'], exact: false }); // All todos
queryClient.invalidateQueries({ queryKey: ['todos', { status: 'pending' }], exact: true }); // Only pending todos

// Force refetch all
queryClient.refetchQueries();
```

### Pagination

```tsx
// src/components/PaginatedPosts.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const fetchPaginatedPosts = async (page) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`);
  if (!response.ok) throw new Error('Failed to fetch paginated posts');
  return response.json();
};

function PaginatedPosts() {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error,
    isPreviousData // True if data from previous query key is being shown
  } = useQuery({
    queryKey: ['paginatedPosts', page], // Query key changes with page number
    queryFn: ({ queryKey }) => fetchPaginatedPosts(queryKey[1]),
    keepPreviousData: true, // Keep old data visible while fetching new
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Paginated Posts (Page {page})</h1>
      <ul>
        {data.map(post => (
          <li key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.body.substring(0, 100)}...</p>
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => setPage(old => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          Previous Page
        </button>
        <button
          onClick={() => {
            // Placeholder for knowing if there's a next page.
            // In a real app, API would return total pages/count.
            // For JSONPlaceholder, we assume there are more pages until 100
            if (data.length === 10) { // If we got 10 items, there might be more
              setPage(old => old + 1);
            }
          }}
          disabled={isPreviousData || data.length < 10} // Disable if previous data is shown or no more items
        >
          Next Page
        </button>
        {isPreviousData && <p>Loading next page in background...</p>}
      </div>
    </div>
  );
}

export default PaginatedPosts;
```

### Infinite scrolling

```tsx
// src/components/InfinitePosts.jsx
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchInfinitePosts = async ({ pageParam = 1 }) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=10`);
  if (!response.ok) throw new Error('Failed to fetch infinite posts');
  return response.json();
};

function InfinitePosts() {
  const {
    data,         // Contains pages: [{ data: [...], ... }, { data: [...], ... }]
    fetchNextPage, // Function to load the next page
    hasNextPage,  // True if there's a next page to fetch
    isFetchingNextPage, // True while fetching the next page
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['infinitePosts'],
    queryFn: fetchInfinitePosts,
    getNextPageParam: (lastPage, allPages) => {
      // lastPage: The data for the last fetched page
      // allPages: An array of all fetched pages so far
      // Return the pageParam for the next fetch, or undefined if no more pages
      const nextPage = allPages.length + 1;
      // For JSONPlaceholder, max posts are 100, so max 10 pages
      if (nextPage <= 10) {
        return nextPage;
      }
      return undefined;
    },
    // Optional: initialData for immediate display from SSR or pre-existing cache
    // initialData: { pages: [initialPosts], pageParams: [1] },
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Infinite Posts</h1>
      {data.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.map(post => (
            <div key={post.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
            </div>
          ))}
        </React.Fragment>
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>
    </div>
  );
}

export default InfinitePosts;
```
## React 19 changes

The React 19 changes remove a lot of annoying optimization code we once had to write ourselves, like `useMemo()` or `useCallback()` or `memo()`. This is because the react compiler looks ahead of time at the correct optimizations to make. But besides this main feature, there are new changes:

### removal of `forwardRef()`

If you want to pass a `ref` prop to a custom child component, you needed to wrap it in a `forwardRef()` call. Well, not anymore. All you need to do know is to destructure the `ref` prop in the child component props and type annotate it accordingly.

![new react 19 ref example](https://gcdnb.pbrd.co/images/xLWcZYBJKGSs.png?o=1)


### `use()` hook

![use hook example](https://gcdnb.pbrd.co/images/ioK7W5ZqddWI.png?o=1)

The `use()` hook is a way to asynchronously deal with data fetching and other things that take time without having to use a `useEffect()` call.

```tsx
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchData() {
  await delay(1000);
  return "Hello, world!";
}

const UseExample = () => {
  const message = use(fetchData());
  return <div>{message}</div>;
};

const App = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <UseExample />
      </Suspense>
    </div>
  );
};
```

```ts
import { use } from 'react'
 
export default function Posts({
  posts,
}: {
  posts: Promise<{ id: string; title: string }[]>
}) {
  const allPosts = use(posts)
 
  return (
    <ul>
      {allPosts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### `useTransition()`


The `useTransition()` hook allows developers to mark state updates as transitions. This can help keep the UI responsive by treating certain updates as non-urgent. Updates marked as transitions won't block urgent updates, such as typing in an input field.`

The `useTransition()` hook is used to keep the UI interactive while doing some asynchronous operation. It yields to the main thread while ensuring the final state change is correct.

```ts
export function Example() {
	const [isPending, startTransition] = useTransition()
}
```

- `isPending`: a boolean value representing the loading state
- `startTransition()`: a function that takes in an async callback of some code you want to run. This will defer to the main thread while still running the callback.

**example**

In a tabbed interface, switching tabs might fetch new data for each tab. Using useTransition ensures that the UI remains responsive, even if the data fetch is slow. The user can switch tabs without delay, and data for each tab loads without causing the UI to freeze.

```ts

import { useState, useTransition } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('home');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    // Tab UI components here
  );
}
```

**key points**

- **Non-blocking updates**: Marking an update as a transition prevents it from blocking interaction with the UI.
- **Handling multiple transitions**: Currently, React batches multiple transitions, although this may change in future releases.
- **Limitations**: Transitions are not suitable for controlling text inputs and must be synchronous.

### Optimistic UI udpates: `useOptimistic()`

An optimistic uI update is the UI updating to reflect the result of some data fetching or long-running asynchronous action before the data action actually completes

This can lead to the UI feeling snappy, but if the server action fails, you have to rollback the ui updates to reflect the true result of the server action. This can be confusing for a user who was led to believe that the server action succeeded because of the optimistic UI update.

To use this hook you need two existing pieces of code:

- **transitions**: You need to nest any optimistic update code inside a `startTransition()` invocation from the `useTransition()` hook, since optimistic updates are always low-priority operations.
- **standard state**: You need to pass in a standard state to the `useOptimistic()` hook so it can perform automatic rollbacks to that state. 

```ts
export function Example() {
	const [isPending, startTransition] = useTransition()
	const [notes, setNotes] = useState<Note[]>([])
	const [optimisticNotes, addOptimisticNote] = useOptimistic(
		notes, 
		(oldNotes, newNote) => {
			// if pending, optimistically show new note
			if (newNote.isPending) {
				return [...oldNotes, newNote]
			}
			// if not pending, roll back to old version
			return oldNotes.filter(n -> n.id !== newNote.id)
		}
	)
}
```

- The first argument we pass to the `useOptimistic()` hook is the base state, which will be the initial value of the `optimisticNotes` state and also the rollback value for when the true state changes with `setNotes()`
- The second argument we pass to the `useOptimistic()` hook is a mutation callback where we set the state
- The `isPending` property allows the UI to differentiate between optimistic (temporary) items and real items that have been confirmed by the server. This can be used to apply visual styling, such as a faded state, to indicate to the user that the item is still being saved and hasn't been confirmed yet.






### `useDeferredValue()`

In react, everything is marked a high priority render by default. If you want to change expensive computational state changes to low priority renders, then you have to explicitly mark them as low priority with the `useOptimistic()` nad `useDeferredValue()` hooks.

The `useDeferredValue()` hook specifically is used for stuff like debouncing and throttling, where it only assumes the most recent state change after a rapid succession of state changes. It takes in a state variable as an argument:

```ts
const [state, setState] = useState()
const deferredState = useDefrredValue(state)
```

You can then create a "debouncing" effect by preventing action when the original state is not equal to the deferred value:

```ts
const isUpdating = state !== deferredState
```

### `useEffectEvent()`

The `useEffectEvent()` hook creates a method that can be used in `useEffect` but doesn't need to be added to the dependency array.

1. `useEffectEvent(cb)` takes in a callback and returns the callback, but no need for the dependency array.
2. You can then use this callback inside a `useEffect` and no need to pass in that callback to the effect's dependency array.

```tsx
import { useEffect, useEffectEvent } from 'react';

function Page({ url }) {
  const { cartItems } = useContext(ShoppingCartContext);

  // This is an Effect Event: it ALWAYS sees the latest cartItems
  // but it is NOT a dependency for the Effect.
  const onVisit = useEffectEvent((visitedUrl) => {
    logAnalytics('visit', {
      url: visitedUrl,
      numberOfItems: cartItems.length // Fresh data, but non-reactive
    });
  });

  useEffect(() => {
    onVisit(url);
    // ✅ The Effect only re-runs when the 'url' changes.
    // Changes to 'cartItems' do NOT trigger a new log.
  }, [url]); 
}

```




### `useActionState()`

The `useActionState()` hook in react 19 is also available in nextJS and is used as a better way of handling forms, falling back to the OG way: using actions.

However, in client side react, we can replace the `onSubmit=` handler with the `action=` prop, and pass in an async function called a **handler** that passes the `FormData` gathered from the form submission. This means we can use this hook in our client side code and get rid of controlled inputs, which cause unnecessary re-renders.

```tsx
async function submitForm(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  
  const travelFormSchema = z.object({
	  firstName: z.string().min(1, 'First name is required'),
	  lastName: z.string().min(1, 'Last name is required'),
	  email: z.string().email('Invalid email address'),
	  age: z.coerce.number().min(18, 'Must be 18 or older'),
	});

  // Validate with Zod
  const result = travelFormSchema.safeParse(rawData);

  if (!result.success) {
    return {
      status: 'error',
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Now we have type-safe, validated data
  const validData = result.data;
  // perform some mutation or a fetch request ...
  
  return {
	  error: null,
	  status: "success"
  }
}

const initialState = {
	error: null,
	status: "none"
}

export function Form() {
	const [state, submitAction, isPending] = useActionState(
	  serverAction,
	  initialState
	);

	return (
	  <form action={submitAction}>
	    {/* isPending gives you loading state */}
	    {/* state contains response/errors */}
	  </form>
	);
}
```

 **Use FormData when:**


- Building traditional forms with submit buttons
- Working with server actions/mutations
- Need progressive enhancement
- Forms have many fields
- File uploads are involved
- Working with Next.js app router

 **Use useState when:**

- Building real-time/interactive UIs
- Need immediate validation on every keystroke
- Complex client-side logic between fields
- Building search/filter interfaces
- Need granular control over individual field updates
- Working with controlled components that need precise state

### SSR from scratch in React

**Step 1) typescript needs to be happy**
****
In your `tsconfig.json` or `deno,json`, make sure that React gets the appropriate syntax highlighting through these compiler options:

```json title="tsconfig.json"
"compilerOptions": {
	"jsx": "react-jsx",
	"jsxImportSource": "react"
}
```

**Step 2) create React App entry point**
****
Create a react app, standard:

```tsx
import React from "react";
// import { JSX } from "npm:react/jsx-runtime";

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
};

export default App;
```

**Step 3: render on the server**

Using the `react-dom/server` package from npm, we can render react to HTML in two different ways:

- **rendering to static markup**: Strips away all javascript and returns just the static HTML formed from the react pp.
- **rendering with hydration**: Uses hydration to add in javascript once app is statically rendered.

The `react-dom/server` package exposes two methods that let us tap into rendering either way:

```tsx
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import App from "./frontend/App.tsx";

const hydratedHTML = renderToString(App());
const staticHTML = renderToStaticMarkup(App());
```

- `renderToString(component)`: Renders the react app with hydration
- `renderToStaticMarkup(component)`: Renders the react app completely statically.

This is how you would do completely static rendering:

```tsx
import { DenoRouter } from "./DenoRouter.ts";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./frontend/App.tsx";
const router = new DenoRouter();

router.get("/", (req, res) => {
  const html = renderToStaticMarkup(App());
  return router.renderHTML(html);
});

router.initServer(8000);
```

#### Hydration

Hydration is a bit more difficult since you need to explicitly create a separate javascript client that gets loaded in and does the hydration (making the page interactive, which lets stuff like hooks work) for us. 

The thing that hydrates our app is on the client side, the `hydrateRoot()` method from react dom. Below is the main javascript file we want to separately bundle as a javascript file that we then serve in the HTML:

```ts title="client.ts"
import { hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import React from "react";

hydrateRoot(document.getElementById("root")!, React.createElement(App));
```

Then on the server, we'll do two important things:

1. Make the client hydration JS file statically available on our server, serve it statically.
2. Render the react app and enable the possibility of hydration with `renderToString()`, then serve it as HTML and referencing the client JS script to fetch


```tsx
import { DenoRouter } from "./DenoRouter.ts";
import { renderToString } from "react-dom/server";
import React, { createElement } from "react";
import App from "./frontend/App.tsx";
import { Intellisense } from "./is.ts";
import path from "node:path";

const router = new DenoRouter();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Serve the client-side bundle
router.get("/client.js", async (req, res) => {
  const clientCode = `
import React from "https://esm.sh/react@19.1.0";
import { hydrateRoot } from "https://esm.sh/react-dom@19.1.0/client";

const App = () => {
  const [count, setCount] = React.useState(0);
  return React.createElement("div", null,
    React.createElement("h1", null, "Hello World"),
    React.createElement("button", { onClick: () => setCount(count + 1) }, "Click me"),
    React.createElement("p", null, "Count: ", count)
  );
};

hydrateRoot(document.getElementById("root"), React.createElement(App));
  `;

  return new Response(clientCode, {
    headers: { "Content-Type": "application/javascript" },
  });
});

router.get("/", (req, res) => {
// 1. render static HTML
  const html = renderToString(React.createElement(App));
  return router.renderHTML(
    Intellisense.html`
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <! -- reference the client side bundle that does hydration -->
        <script type="module" async defer src="/client.js"></script>
      </body>
    `
  );
});

router.initServer(8000);
```

#### RSCs from scratch: react flight protocol

The main difference between RSCs and SSR is that RSCs are just react components that only run on the server. SSR does the initial rendering on the server, and then client side rendering through hydration takes over. 

With RSCs, there is no client side rendering nor hydration. However, you can nest client components within server components. 

The main way RSCs get translated to actual HTML is through the **react flight protocol**, which is an HTTP request with content type `application/octet-stream` that is basically a JSON representation of the JSX to render. 

```tsx
const MANIFEST = readFileSync(
  path.resolve(__dirname, "../dist/react-client-manifest.json"),
  "utf8"
);
const MODULE_MAP = JSON.parse(MANIFEST);

fastify.get("/react-flight", function reactFlightHandler(request, reply) {
  try {
    reply.header("Content-Type", "application/octet-stream");
    const { pipe } = renderToPipeableStream(
      React.createElement(App),
      MODULE_MAP
    );
    pipe(reply.raw);
  } catch (err) {
    request.log.error("react-flight err", err);
    throw err;
  }
});
```

## Deploying on Vercel

### redirects with Vite

When doing client side routing, you MUST have a `vercel.json` in the root of your project that specifies to redirect all requests to the index HTML:

```json title="vercel.json"
    {
      "rewrites": [
        {
          "source": "/:path*",
          "destination": "/index.html"
        }
      ]
    }
```

## Custom Hooks

### `useWaitForAnimationsToFinish`

- **main idea**: given an HTML element ref, we want to wait for until all of its CSS animations have finished.
- **execution**: Await all CSS animation status promises of the ref, store the finished state in a ref (not state because we don't use that to update the view)
## Custom components
### Boop

The "Boop" animation is basically based on hover state. On a mouse enter animation, we toggle some state and turn it off after a certain timeout.

<BoopExample />

```ts
import React from "react";

const useBoop = (timing: number = 150) => {
  const [isBooped, setIsBooped] = React.useState(false);
  React.useEffect(() => {
    if (!isBooped) {
      return;
    }
    // reset the state after the timeout
    const timeoutId = setTimeout(() => {
      setIsBooped(false);
    }, timing);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isBooped, timing]);

  const trigger = () => {
    setIsBooped(true);
  };

  return { trigger, isBooped };
};

export default useBoop;
```

Then here is a component to wrap any element and give it the Boop effect:

```ts
const Boop = ({ rotation = 20, timing = 150, children }) => {
  const { isBooped, trigger } = useBoop(timing);
  const style = {
    display: "inline-block",
    transform: isBooped ? `rotate(${rotation}deg)` : `rotate(0deg)`,
    transition: `transform ${timing}ms`,
  };
  return (
    <span onMouseEnter={trigger} style={style}>
      {children}
    </span>
  );
};
```

