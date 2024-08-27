import BoopExample from "@site/src/components/examples/Boop";


## React Tips

### 101 Tips

### Performance

#### Lazy Loading/Code splitting

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
## Boop

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
