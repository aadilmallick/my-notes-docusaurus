
## Observables Intro

Observables are a mix between iterators and observer pattern, and follow this idea of being an asynchronous observer that pushes events and data to a consumer asynchronously.

![](https://i.imgur.com/22MGRON.png)

The main difference between iterators and observers is who's in control:

- **iterator pattern**: In the iterator pattern, you pull events, meaning you control the iteration and when to iterate.
- **observer pattern**: In the observer pattern, the observer is in control, pushing events and notifying you whenever data is ready to be consumed.

The **observable** is a combination of these two patterns, and you can think of it as a collection notifying you of events over time. Something that can help you is this metaphor:

> The *iterator* pattern is when you go up to the chef to ask for cake and he gives it you. You can keep going back as many times as you want until you're full or the chef runs out of cake. You're the one in control.
> 
> The *observable*/*observer* pattern is when the chef keeps throwing cake at you whether you're ready for it or not, and then the chef tells you when he runs out of cake. The chef is in control.

This is what a basic observable would look like:

![](https://i.imgur.com/AliYL8e.png)

### Observables from scratch

#### basics

this observable implementation works:

```ts
class Observer {
  static fromEvent<T extends keyof HTMLElementEventMap, V extends HTMLElement>(
    event: T,
    element: V,
    observer: {
      onNext: (event: Event) => void;
      onError?: (err: Error) => void;
      onComplete?: () => void;
    }
  ) {
    // return new Observer(element, event, (event) => {
    //   return event.target as V;
    // });
    const handler = (e: HTMLElementEventMap[T]) => {
      try {
        observer.onNext(e);
      } catch (e) {
        if (e instanceof Error) {
          observer.onError?.(e);
        }
      }
    };
    element.addEventListener(event, handler);

    return {
      dispose: () => {
        element.removeEventListener(event, handler);
        observer?.onComplete?.();
      },
    };
  }
}

const observer = Observer.fromEvent("keydown", document.body, {
    onNext: (e) => {
        if (e instanceof KeyboardEvent) {
        console.log(e.key)
            if (e.key === "q") {
                observer.dispose()
            }
        }
    },
    onError: (err) => console.log(err),
    onComplete: () => console.log("data complete!")
})
```

#### Creating a `filter()`

You can filter observables like so, where the `observable.filter()` method which takes in an individual observable data chunk and returns a boolean.

- **if true**, then the `observable.onNext()` method will get called.
- **if false**, then the `observable.onNext()` method will NOT get called.

```ts
class Observer<U> {
  static fromEvent<T extends keyof HTMLElementEventMap, V extends HTMLElement>(
    event: T,
    element: V,
    observer: Observer<HTMLElementEventMap[T]>
  ) {
    const handler = (e: HTMLElementEventMap[T]) => {
      try {
        observer.onNext(e);
      } catch (e) {
        if (e instanceof Error) {
          observer.onError?.(e);
        }
      }
    };
    element.addEventListener(event, handler);

    return {
      dispose: () => {
        element.removeEventListener(event, handler);
        observer?.onComplete?.();
      },
    };
  }

  constructor(observer: {
    onNext: (data: U) => void;
    onError?: (err: Error) => void;
    onComplete?: () => void;
  }) {
    this.onNext = observer.onNext;
    this.onComplete = observer.onComplete;
    this.onError = observer.onError;
  }

  onNext: (data: U) => void;
  onError?: (err: Error) => void;
  onComplete?: () => void;


  filter(cb: (data: U) => boolean) {
    const filteredObserver = new Observer<U>({
      onNext: (data) => {
        if (cb(data)) {
          this.onNext(data);
        }
      },
      onComplete: this.onComplete,
      onError: this.onError,
    });
    return filteredObserver;
  }
}

const observer = new Observer<HTMLElementEventMap["keydown"]>({
    onNext: (e) => {
        if (e instanceof KeyboardEvent) {
        console.log(e.key)
            if (e.key === "q") {
                cleanup()
            }
        }
    },
    onError: (err) => console.log(err),
    onComplete: () => console.log("data complete!")
})
.filter((data) => data.key === "c" || data.key === "q")

const subscription = Observer.fromEvent("keydown", document.body, observer)

function cleanup() {
    subscription.dispose()
}
```

### Basic observable methods

These are the classic observable methods and functions that will be on any observable library.

> [!NOTE]
> By convention, variables that are `Observable` objects are prefixed with `$` just to differentiate them.

- `from(iterable)`: creates an observable from an iterable
- `of(...args)`: creates an observable from a series of arguments

Then here are methods that would live on an `Observable` object instance:

- `take(n)`: creates an observable that only deals with the first `n` elements.
- `drop(n)`: creates an observable that drops with the first `n` elements and streams the rest
- `filter(cb)`: creates an observable of only the values that pass the predicate
- `map(cb)`: creates an observable that maps all streamed values to a new value
## rxjs

### Observable Object

The internals of an `Observable` object from RXJS include these methods:

**subscriptions**

To start a subscription, you use the `observable$.subscribe()` method, which also returns a subscription object you can use to unsubscribe:

```ts
const subscription = observable$.subscribe({
	next: (chunk) => {}, // runs for all values on stream
	error: () => {}, // runs if error occurs
	complete: () => {} // runs on completion of stream
})

function unsubscribe() {
	subscription.unsubscribe()
}
```

### Creating observables

#### `fromEvent()`

The `fromEvent(element : HTMLElement, eventType: string)` method from rxjs is a way to create an observable that streams in values whenever the event is triggered.

```ts
const buttonClicks$ = fromEvent(button, 'click');

buttonClicks$.subscribe(console.log);
```

#### `interval()`

The `interval()` method from rxjs creates an observable from an interval

```ts
const interval$ = interval(1000);

const subscription = interval$.subscribe(console.log);

setTimeout(() => subscription.unsubscribe(), 5000);
```

### operators

You can perform stream modifications and operations using **stream operators**, which pipes in a stream through the `observable$.pipe()` method and then passes in a bunch of stream operator methods. 

The result of `observable$.pipe()` method is a new observable that applies all stream operators included in the pipeline to the original

Here's a list of common stream operators:

- `take(n)`: streams through only the first `n` elements of the stream
- `skip(n)`: skips the first `n` elements of the stream and streams the rest
- `takeWhile(predicate)`: keeps streaming elements while the condition is true, then stops when condition is false
- `skipWhile(predicate)`: keeps skipping elements while the condition is true, then starts streaming when condition is false
- `filter(predicate)`: streams only the elements that pass the condition.
- `map(cb)`: maps elements in the stream to new values

Here's how we can use operators:

```ts
import {from, take, filter} from "rxjs"

export function* fibonacci() {
  let values = [0, 1];

  while (true) {
    let [current, next] = values;

    yield current;

    values = [next, current + next];
  }
}

// 1. stream only first 10 from fibonacci
const example$ = from(fibonacci()).pipe(take(10));
example$.subscribe((val) => console.log(val));

// 2. multiple operators:
const over100$ = from(fibonacci()).pipe(
  skipWhile((value) => value > 100),
  take(4),
);
over100$.subscribe(console.log);

// 3. using filter
const evenNumbers$ = from(fibonacci()).pipe(
  filter((n) => n % 2 === 0),
  take(4)
);
evenNumbers$.subscribe((val) => console.log(val));


// 4. using map
const doubledNumbers$ = of(1, 2, 3).pipe(map((n) => n * 2));
doubledNumbers$.subscribe(console.log);
```

> [!IMPORTANT]
> The most important thing to understand here is that in the pipeline, each operator runs in order.

**`reduce()`**
****
The `reduce()` operator basically performs aggregation on the stream and returns only a single value:

```ts
const under200$ = from(fibonacci()).pipe(
  takeWhile((value) => value &lt; 200),
  reduce((total, value) => total + value, 0),
);

under200$.subscribe(console.log);
```

#### Operators that use observables

We can make use of conditional operators that only start or stop once an observable starts streaming or stops streaming:

- `skipUntil(observable$)`: skips all values and only starts streaming once the specified observable starts streaming.
- `takeUntil(observable$)`: streams all values and only stops streaming once the specified observable starts streaming.

```ts
const start$ = fromEvent(start, 'click');
const pause$ = fromEvent(pause, 'click');

const counter$ = interval(1000).pipe(
  skipUntil(start$),
  scan((total) => total + 1, 0),
  takeUntil(pause$),
);
```