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

This is how you would do static rendering:

```tsx
import { DenoRouter } from "./DenoRouter.ts";
import { renderToString } from "react-dom/server";
import App from "./frontend/App.tsx";
const router = new DenoRouter();

router.get("/", (req, res) => {
  const html = renderToString(App());
  return router.renderHTML(html);
});

router.initServer(8000);
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

