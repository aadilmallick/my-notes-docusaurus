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

## Custom Hook Snippets
