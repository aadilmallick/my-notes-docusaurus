import BoopExample from "@site/src/components/examples/Boop";

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
