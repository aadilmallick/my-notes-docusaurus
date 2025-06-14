
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

## rxjs