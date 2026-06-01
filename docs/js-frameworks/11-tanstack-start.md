## Tanstack Router

Tanstack router is a typesafe routing library that gives type safety for the routes in your application, and it does this by generating type definitions on the fly whenever you create a new route.

### Router composition (old way)

#### creating a router

This is how to compose a router with tanstack router:

```tsx
import { createRootRoute, createRoute, createRouter,
         RouterProvider, Outlet, Link } from '@tanstack/react-router'

// 1. Root layout — wraps everything
const rootRoute = createRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />  {/* child routes render here */}
    </div>
  ),
})

// 2. Child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <h1>Home</h1>,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <h1>About</h1>,
})

// 3. Assemble and create router
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])
const router = createRouter({ routeTree })

// 4. Provide to your app
export default function App() {
  return <RouterProvider router={router} />
}
```

- `createRootRoute(options)`: creates the base router layout, which wraps all routes. The `<Outlet />` component should render in the `component` JSX property you pass into this function.
- `createRoute(options)`: creates a nested route under a specific path. Here are the different options you can pass in:
	- `getParentRoute()`: a callback that should return the parent route object for the root.
	- `path`: the string url path the component should correspond to
	- `component()`: the component to render when the user navigates to the path.

#### Navigation tactics

- `<Link>`: a link component with type-safety 
- `navigate()`: a function that navigates to a link, building it out programmatically

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

// Type-safe: TS error if '/users/$id' doesn't exist
<Link to="/users/$id" params={{ id: user.id }}>
  View profile
</Link>

// Programmatic navigation
const navigate = useNavigate()
navigate({ to: '/dashboard', search: { tab: 'activity' } })
```

#### route params

Add a `$` prefix to a path segment to make it dynamic and adds type safety:

- `$userId` captures whatever is in that position in the URL:


```tsx
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserPage,
})

function UserPage() {
  const { userId } = userRoute.useParams()  // TypeScript knows this is a string
  return <p>Viewing user: {userId}</p>
}
```

Navigate to it with full type safety — TypeScript requires you to provide `params`:

```tsx
<Link to="/users/$userId" params={{ userId: '42' }}>View user</Link>
```

### File-based routing — the way most apps use TanStack Router

Instead of defining routes manually in JS, the Vite plugin reads your file system and generates the route tree automatically. Your folder structure _is_ your routes:

```
src/routes/
  __root.tsx          →  root layout (wraps everything)
  index.tsx           →  /
  about.tsx           →  /about
  users/
    index.tsx         →  /users
    $userId.tsx       →  /users/:userId
  _dashboard/         →  pathless layout (no URL segment, just UI)
    dashboard.tsx     →  /dashboard
    settings.tsx      →  /settings
```

The `_` prefix creates a **pathless layout route** — it contributes a shared UI wrapper (like a sidebar) without adding a segment to the URL. So `/dashboard` and `/settings` both get the dashboard shell, but the URL stays clean.

#### `createFileRoute` helper

In each file you use `createFileRoute`:


```tsx title="src/routes/users/$userId.tsx"
// src/routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/$userId')({
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  return <h1>User {userId}</h1>
}
```

The Vite plugin auto-generates `routeTree.gen.ts` — commit this file. It's what gives you full type safety everywhere.

The `createFileRoute(route)` function returns another function, which is a routing function to create a router. This is what you should pass in: 

- `component()`: The React component to render for the route
- `loader()`: an async callback that runs before the component mounts, used for fetching data on navigation. The component will not render until the `loader()` callback finishes executing.
- `beforeLoad()`: a callback that runs synchronously before the loader, used for stuff like auth guards and redirections
- `pendingComponent()`: the react component to render while the loader is executing
- `pendingMs`: a threshold in ms where the **pending**

#### typed search params

This is what makes TanStack Router genuinely different. Add a `validateSearch` schema to any route and all search params become typed, validated, and serialized automatically:


```tsx
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

export const Route = createFileRoute('/products')({
  validateSearch: zodValidator(z.object({
    page:  z.number().int().min(1).default(1),
    q:     z.string().optional(),
    sort:  z.enum(['asc', 'desc']).default('asc'),
  })),
  component: ProductList,
})

function ProductList() {
  const { page, q, sort } = Route.useSearch()
  // page is a number, sort is 'asc' | 'desc' — no casting, no parsing
  
  return (
    <Link to="/products" search={{ page: page + 1, sort }}>
      Next page
    </Link>
  )
}
```

If the URL has `?page=abc`, Zod rejects it and the route's `errorComponent` shows instead of crashing your component.

#### Route loaders

The `loader` function runs _before_ the component mounts. By the time your component renders, the data is already there — no `isLoading` checks needed inside the component:


```tsx
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetch(`/api/users/${params.userId}`).then(r => r.json())
    return { user }  // stored and typed
  },
  component: UserPage,
})

function UserPage() {
  const { user } = Route.useLoaderData()  // guaranteed to be defined
  return <h1>{user.name}</h1>
}
```

Loaders run in parallel for all matched routes on a navigation. So if you go to `/dashboard/settings`, both the dashboard layout's loader and the settings page's loader run at the same time — not sequentially.

#### Router context — dependency injection

Pass shared services into every loader using typed router context. This is the cleanest way to give loaders access to things like your API client, auth state, or query client:


```tsx
// 1. Declare the context shape on the root route
const rootRoute = createRootRouteWithContext<{
  auth: { userId: string | null; isLoggedIn: boolean }
  queryClient: QueryClient
}>()({ component: Root })

// 2. Provide actual values when creating the router
const router = createRouter({
  routeTree,
  context: { auth, queryClient },
})

// 3. Any loader can use it — fully typed, no imports needed
export const Route = createFileRoute('/dashboard')({
  loader: ({ context: { auth, queryClient } }) => {
    if (!auth.isLoggedIn) throw redirect({ to: '/login' })
    return queryClient.ensureQueryData(dashboardQuery)
  },
})
```

#### Authentication with beforeLoad

`beforeLoad` runs synchronously before the loader and is the right place to do auth guards:


```tsx
// _authenticated.tsx — wrap any routes you want to protect
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isLoggedIn) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },  // remember where they were going
      })
    }
  },
})

// login.tsx — redirect back after login
function LoginPage() {
  const search = Route.useSearch()
  
  async function handleLogin() {
    await auth.login()
    navigate({ to: search.redirect ?? '/dashboard' })
  }
}
```

#### TanStack Query integration

TanStack Router and TanStack Query are designed to work together. The pattern: use the loader to _ensure_ data is in the Query cache, then use `useQuery` in the component for reactivity and refetching:


```tsx
// Define your query options once, reuse everywhere
const userQueryOptions = (userId: string) => queryOptions({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
})

export const Route = createFileRoute('/users/$userId')({
  loader: ({ params, context: { queryClient } }) =>
    // primes the cache — no waterfall, data is ready when component mounts
    queryClient.ensureQueryData(userQueryOptions(params.userId)),

  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  // data is already cached — renders immediately, refetches in background
  const { data: user } = useQuery(userQueryOptions(userId))
  return <h1>{user?.name}</h1>
}
```

#### Pending UI

Control what shows while a loader is running:


```tsx
export const Route = createFileRoute('/users/$userId')({
  loader: fetchUser,
  pendingComponent: () => <Spinner />,
  pendingMs: 300,     // don't show spinner unless load takes >300ms (avoids flashes)
  pendingMinMs: 500,  // if spinner shows, keep it for at least 500ms (avoids flickers)
  component: UserPage,
})
```

#### Hooks

Tanstack router has three hooks that make access to route information a lot easier. These hooks live on the `Route` namespace:

- `Route.useLoaderData()`: returns the loader's return value — typed, always defined, no null checks.
- `Route.useParams()`:  returns typed route params
- `Route.useSearch()`: returns typed, validated search params. 

#### Code splitting

Any route can be split so its code is only loaded when the user actually navigates there. With file-based routing, create a companion `-lazy.tsx` file:

```
src/routes/
  admin.tsx       ← tiny: route definition, always in the bundle
  admin.lazy.tsx  ← big: component + loader, only loaded on demand
```


```tsx
// admin.lazy.tsx
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/admin')({
  component: AdminDashboard,  // this entire file is code-split
})
```

Your initial JS bundle has zero admin code. The browser only downloads it when the user hits `/admin`.

#### Deferred data

Sometimes you have two data fetches — one fast (critical for render), one slow (secondary content). `defer()` lets you start the slow fetch without blocking the route:

tsx

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // await the fast fetch — blocks until ready, but post renders immediately
    const post = await fetchPost(params.postId)
    
    // DON'T await this — starts fetching but doesn't block the route
    const comments = fetchComments(params.postId)
    
    return { post, comments: defer(comments) }
  },
  component: PostPage,
})

function PostPage() {
  const { post, comments } = Route.useLoaderData()
  
  return (
    <div>
      <h1>{post.title}</h1>       {/* renders immediately */}
      <Await promise={comments} fallback={<CommentSkeleton />}>
        {(data) => <CommentList comments={data} />}
      </Await>
    </div>
  )
}
```

The route renders as soon as `post` resolves. The `<Await>` wrapper streams in `comments` when they're ready, showing a skeleton in the meantime.

#### Scroll restoration

One line in your root layout, and TanStack Router remembers scroll position for every route on back/forward navigation:

tsx

```tsx
// __root.tsx
import { Outlet, ScrollRestoration } from '@tanstack/react-router'

function Root() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}
```

#### DevTools

During development, add the DevTools panel to inspect the route tree, loader data, and search params in real time:

tsx

```tsx
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

function Root() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}
```

## Tanstack Store

Tanstadck store is basically like zustand, but since it uses signals, it's framework agnostic and can be used anywhere.

TanStack Store is, first and foremost, a framework-agnostic signals implementation.

It can be used with any of our framework adapters, but can also be used in vanilla JavaScript or TypeScript. It's currently used to power many of our library's internals.

**Create the store**

```tsx
import { createStore } from '@tanstack/store';

const countStore = createStore(0);

console.log(countStore.state); // 0
countStore.setState(() => 1);
console.log(countStore.state); // 1
```

### **batch updates**

```ts
import { batch } from '@tanstack/store';

// countStore.subscribers will only trigger once at the end with the final state
batch(() => {
  countStore.setState(() => 1);
  countStore.setState(() => 2);
});
```

### **subscribe to changes**

```ts
const {unsubscribe} = countStore.subscribe(() => {
  console.log('The count is now:', countStore.state);
});

// Later, to cleanup
unsubscribe();
```

```tsx
const count = createStore(0);

const {unsubscribe} = count.subscribe((state) => {
  console.log('The count is now:', state);
});

count.setState(() => 5); // Logs: "The count is now: 5"

// Later, to cleanup
unsubscribe();
```



### Derived values 

You can create derived stores that automatically update when their dependencies change:

```tsx
const count = createStore(0);

const double = createStore(() => count.state * 2);

console.log(double.state); // 0
count.setState(() => 5);
console.log(double.state); // 10
```

You can access the previous value of a derived computation by using the prev argument passed to the function:

```tsx
const count = createStore(1);

const sum = createStore<number>((prev) => {
  return count.state + (prev ?? 0);
});

console.log(sum.state); // 1
count.setState(() => 2);
console.log(sum.state); // 3
```

### React example

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createStore, useSelector } from "@tanstack/react-store";

// You can instantiate the store outside of React components too!
export const store = createStore({
  dogs: 0,
  cats: 0,
});

// This will only re-render when `state[animal]` changes. If an unrelated store property changes, it won't re-render

const Display = ({ animal }) => {
  const count = useSelector(store, (state) => state[animal]);
  return <div>{`${animal}: ${count}`}</div>;
};

const updateState = (animal) => {
  store.setState((state) => {
    return {
      ...state,
      [animal]: state[animal] + 1,
    };
  });
};
const Increment = ({ animal }) => (
  <button onClick={() => updateState(animal)}>My Friend Likes {animal}</button>
);

function App() {
  return (
    <div>
      <h1>How many of your friends like cats or dogs?</h1>
      <p>
        Press one of the buttons to add a counter of how many of your friends
        like cats or dogs
      </p>
      <Increment animal="dogs" />
      <Display animal="dogs" />
      <Increment animal="cats" />
      <Display animal="cats" />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```


## Tanstack start basics

### Project structure

THe project structure is as follows:

![](https://i.imgur.com/XUtSBBu.jpeg)


- `routes`: the folder which contains all the routes for your application, doing file-based routing
- `router.tsx`: the file which contains the type-safety and router initialization for tanstack router for the file-based routing. The route objects in this file are automatically updated by tanstack start when you create new files.
- `routeTree.gen.ts`: a file managed by tanstack start which contains all the type definitions for the routes in the router.


### File-based routing
