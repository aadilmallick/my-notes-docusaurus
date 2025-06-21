import BoopExample from "@site/src/components/examples/Boop";



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

#### Context

Understanding how to use context is important for improving performance in React applications: 

When a component uses some value from context, and the context value changes, the component will re-render.
- A good rule of thumb is to wrap the component you directly nest inside the context provider with `React.memo()`.
- Put your context values that your provide to the `value` prop in the `<Context.Provider>` component in a `useMemo()` hook, to prevent unnecessary recreations.





### `memo()`

You can memoize a component by passing it into the `memo()` function from react, meaning that it won't rerender unless its props change.

### `useMemo()` and `useCallback()`

Objects are refferential and thus don't pass a strict equality check. Therefore you should use the two below hooks for optimizing and caching state that holds objects, class instances, or functions.

- `useMemo(cb, deps)`: takes in a callback and a dependency array. The callback should return a value, and that callback will only get invoked again if any of the dependencies in the dependencies array changes. This returns the return value of the callback.
- `useCallback(cb, deps)`: takes in a callback and a dependency array. The callback will only get invoked again if any of the dependencies in the dependencies array changes. This returns the callback itself.

You should never use `useMemo()` for primitive values. Only for returning objects.

The main difference between `useMemo()` and `useCallback()` is that `useMemo()` should be used for objects while `useCallback()` should be used to explicitly cache functions.

However, `useCallback()` is just `useMemo()` but returning a function instead of a object - it's essentially just syntactic sugar.

```ts
// render and render2 are functionally equivalent
const render = useMemo(() => (text) => marked.parse(text), []);
const render2 = useCallback((text) => marked.parse(text), []);
```

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

### `useTransition`

The `useTransition()` hook is used to keep the UI interactive while doing some asynchronous operation. It yields to the main thread while ensuring the final state change is correct.

```ts
export function Example() {
	const [isPending, startTransition] = useTransition()
}
```

- `isPending`: a boolean value representing the loading state
- `startTransition()`: a function that takes in an async callback of some code you want to run. This will defer to the main thread while still running the callback.

### Optimistic UI udpates: `useOptimistic()`

An optimistic uI update is the UI updating to reflect the desired state of some server action before the server action is actually completed. 

This can lead to the UI feeling snappy, but if the server action fails, you have to rollback the ui updates to reflect the true result of the server action. This can be confusing for a user who was led to believe that the server action succeeded because of the optimistic UI update.

To use this hook you need two existing pieces of code:

- **transitions**: You need to nest any optimistic update code inside a `startTransition()` invocation from the `useTransition()` hook.
- **standard state**: You need to pass in a standard state to the `useOptimistic()` hook so it can perform automatic rollbacks to that state. 

```ts
export function Example() {
	const [isPending, startTransition] = useTransition()
	const [notes, setNotes] = useState<Note[]>([])
	const [optimisticNotes, addOptimisticNote] = useOptimistic(
		notes, 
		(oldNotes, newNote) => {
			return [...oldNotes, newNote]
		}
	)
}
```

- The first argument we pass to the `useOptimistic()` hook is the base state, which will be the initial value of the `optimisticNotes` state and also the rollback value for when the true state changes with `setNotes()`
- The second argument we pass to the `useOptimistic()` hook is a mutation callback.




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

