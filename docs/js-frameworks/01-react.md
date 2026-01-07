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

