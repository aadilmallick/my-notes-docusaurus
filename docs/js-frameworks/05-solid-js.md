## Reactivity and signals from scratch

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