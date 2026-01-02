

## Server components vs Client Components

Server components cannot be nested inside client components except through a trick where you render them as children, like so:

1. Make the client component you want to render accept a `children` prop
2. Render the server component as a child of the client component.

```tsx
export const App = () => {
  return (
    <ClientComponent>
	    <ServerComponent />
    </ClientComponent>
  )
}
```
## File-based routing


File based routing on NextJS makes route names based on folders, and renders page content with the `page.tsx`. Besides that, there are several other special files in NextJS that live within a route folder:

- `loading.tsx`: loading placeholder that is displayed while the `page.tsx` is in the process of rendering.
- `layout.tsx`: a layout that wraps the `page.tsx`, only rendered once.
- `template.tsx`: a layout that wraps the `page.tsx`, with the ability to rerender.
- **`loading.tsx`**: Loading UI for a segment
- **`error.tsx`**: Error handling UI for a segment
- **`not-found.tsx`**: 404 UI for a segment. 

**opting out of routing**

To opt a folder and all subfolders and files in that folder out of routing, you can prefix the foldername with an underscore, like `app/_lib`.

You can also create route groups that opt out of routing just at the folder level br wrapping the folder name in parentheses, like so: `(marketing)`. This is useful for grouping related content together.

**examples**

- `app/page.tsx`: Renders content at the `/` route
- `app/(auth)/signin/page.tsx`: Renders content at the `/signin` route
- `app/(auth)/signout/page.tsx`: Renders content at the `/signout` route

**layout**

This is what a typical layout page will look like:

```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested layout */}
        <main>{children}</main>
      </body>
    </html>
  )
}
```

**error.tsx**

This is what an `error.tsx` would look like, which would catch any error produced in a page component, accept that error as a prop, and display a UI based on it.

Here are the 2 props you can accept:

- `error`: the error that caused the page to break.
- `reset`: a function that when invoked, tries rerendering the page.

```tsx
"use client"
export default function Error({error, reset}) {
	return (
		<div>
			<p>{e.message}</p>
			<button onClick={reset}>Try again</button>
		</div>
	)
}
```

### Route param pages

You can create dynamic file-based routing with route params by using square brackets around the folder name, like using `app/[id]/page.tsx` to render content according to the `/:id` dynamic route.

When dealing with route param pages, we can access the route params like so:

```tsx
import { notFound } from 'next/navigation'

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 1. get route params
  const { id } = await params

  // 2. render rest of page
  if (!listOfValidIds.includes(id)) {
	  return notFound()
  }

  return  // ...
}
```

> [!NOTE]
> The `params` prop is a promise, so you have to await it.

By default, since NextJS has no idea which params will be passed to the dynamic route param page, it dynamically renders to page. To bypass this, you can choose a subset of route parameters to prebuild and generate static pages for, like so, by exporting the async `generateStaticParams()` method.

```ts
export async function generateStaticParams() {
  const posts = await fetch('https://api.vercel.app/blog', {
    cache: 'force-cache',
  }).then((res) => res.json())
 
  return posts.map((post: Post) => ({
    id: String(post.id),
  }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)
 
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### Search Param Pages

You can also access the query parameters on a route by destructuring the `searchParams` prop on a page component and type hinting it.

```ts
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams).filters
}
```

- Use the `searchParams` prop when you need search parameters to **load data for the page** (e.g. pagination, filtering from a database).
- Use `useSearchParams` when search parameters are used **only on the client** (e.g. filtering a list already loaded via props).

### **Parallel Routes**

Parallel Routes in Next.js enable the simultaneous or conditional rendering of multiple pages or components within the same layout. This is especially beneficial for sections of an application that require dynamic content changes without navigating away from the page, like social media feeds or analytics dashboards.

Here are the key benefits of parallel routes:

- **Simultaneous Rendering:** Multiple components or pages can be rendered at the same time within the same layout, enhancing the user experience by providing a composite view of related content.
- **Conditional Rendering:** Depending on the application state or user actions, specific components can be rendered, allowing for a highly responsive and interactive interface.

> [!NOTE]
> The main benefit of using parallel routes is reusability. You don't have to rewrite the logic for fetching each individual page and rebuilding them from scratch, you can just use them as components, gaining all the benefits that comes with being a page component, like SSR.

Next.js manages the active state for each slot, ensuring that the content within each slot is appropriate to the current navigation context.

Here is the behavior of the two navigation types when using route slots:

- **Soft Navigation:** Changes content within a slot during client-side navigation without reloading the entire page. This maintains the state of other slots, ensuring a seamless user experience.
- **Hard Navigation:** On a full page reload, Next.js will attempt to recover the state of slots. If it cannot determine the active state for a slot, a default component (usually **`default.js`**) is rendered, or a 404 error if no default exists.

**implementing parallel routes**

You create a parallel route folder by prefixing with a `@`. The folder structure can be like so:

```
app
	dashboard
	  @events
		  page.tsx
		  
	  @rsvps
		  page.tsx
		  
	  layout.tsx
	  page.tsx
```

In each route slot folder, you should have these two special components:

- `page.tsx`: what gets rendered for that route
- `default.tsx`: what gets rendered if that route does not match after a hard reload

Then in the layout that is the parent for the route slots, you can accept each route slot as a prop:

```tsx
// /app/dashboard/layout.tsx
'use client'
import Shell from '@/components/Shell'
import { usePathname } from 'next/navigation'

const DashboardLayout = ({ children, rsvps, events }) => {
  const path = usePathname()

  return (
    <Shell>
      {path === '/dashboard' ? (
        <div className="flex w-full h-full">
          <div className="w-1/2 border-r border-default-50">{rsvps}</div>
          <div className="w-1/2 flex flex-col">
            <div className="border-b border-default-50 w-full h-1/2">
              {events}
            </div>
            <div className="w-full h-1/2">{children}</div>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </Shell>
  )
}

export default DashboardLayout
```
## Miscellaneous

### `<Image>`

The `<Image>` tag in NextJS provides lazy loading, preventing layout shift, and optimizing to webp. There are two different ways you can use it:

**Local images**

When you load local image paths to the `src=` attribute of the `<Image>` component, NextJS can automatically infer the width, height, and placeholder blur.

```tsx
import Image from 'next/image'
import profilePic from './me.png'
 
export default function Page() {
  return (
    <Image
      src={profilePic}
      alt="Picture of the author"
      // width={500} automatically provided
      // height={500} automatically provided
      // blurDataURL="data:..." automatically provided
      // placeholder="blur" // Optional blur-up while loading
    />
  )
}
```

**remote images**

When loading remote images from base64 data or any url, you need to provide the `width=` and `height=` props to prevent layout shift.

```ts
import Image from 'next/image'
 
export default function Page() {
  return (
    <Image
      src="https://s3.amazonaws.com/my-bucket/profile.png"
      alt="Picture of the author"
      width={500}
      height={500}
    />
  )
}
```

To safely allow images from remote servers, you need to define a list of supported URL patterns in [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js). Be as specific as possible to prevent malicious usage.

```ts
import { NextConfig } from 'next'
 
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/my-bucket/**',
        search: '',
      },
    ],
  },
}
 
export default config
```

### Fonts

Next.js downloads font files at build time and hosts them with your other static assets. This means when a user visits your application, there are no additional network requests for fonts which would impact performance.

here is how you can load a google font:

```tsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} antialiased`}
	>
      <body>{children}</body>
    </html>
  )
}
```

Here is how you can load a local font:

```ts
import localFont from 'next/font/local'
 
const myFont = localFont({
  src: './my-font.woff2',
})
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={myFont.className}>
      <body>{children}</body>
    </html>
  )
}
```

You can them use them in your CSS by referencing them as normal CSS variables:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```
### Metadata

You can dynamically generate metadata for each route based like so in a `page.tsx`:

```tsx
import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug
 
  // fetch post information
  const post = await fetch(`https://api.vercel.app/blog/${slug}`).then((res) =>
    res.json()
  )
 
  return {
    title: post.title,
    description: post.description,
  }
}
 
export default function Page({ params, searchParams }: Props) {}
```
## Routing

### `<Link>`

The `<Link />` component is used for client-side soft routing that basically changes only the content that needs to change. It uses **soft navigation**:

- **soft navigation**: navigation like react router - only changing the DOM to give the illusion of a page navigation instead of performing an HTTP request to fetch the new route.
- **hard navigation**: Performing a HTTP request to fetch the content under a new route.

```tsx
import Link from 'next/link'

export const Signout = () => {
 return (
	 <Link href="/signup">
        <Button size="lg">Get Started</Button>
    </Link>
 )
}
```

### `useRouter()`

```ts
import { useRouter } from 'next/navigation'

const router = useRouter()
```

- `router.back()`: goes back to the previous route
- `router.refresh()`: refreshes the page (does a hard refresh)
### Navigation functions

Here are the navigation functions you can import from `next/navigation`:

- `redirect(route: string)`: redirects to the given route
- `notFound()`: renders 404 not found page

> [!WARNING]
> There is a known bug that if you invoke `redirect()` within a try-catch block, it will error out. So only invoke redirection outside of a try catch.



```ts
import { redirect } from 'next/navigation'
import IssueForm from './IssueForm'
import { getCurrentUser } from '@/lib/dal'

const NewIssue = async () => {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return <IssueForm userId={user.id} />
}

export default NewIssue
```


## Rendering strategies

### CSR

Client-side rendering is the traditional react way of using javascript to build out the page.

In next.js, you can opt into this by using the `"use client"` directive on any component, making it client-side only.

```tsx
// components/UpvoteButton.tsx
"use client"; // 👈 Marks this as a Client Component

import { useState } from "react";

export default function UpvoteButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Upvote ({count})
    </button>
  );
}
```

> [!NOTE]
> "Client Components" in Next.js are pre-rendered once on the server for the initial HTML, then "hydrated" in the browser to become interactive, so if you want to make pages static, use client-side data fetching to let the page be static but take advantage of hydration.

### SSR

SSR is the default in nextjs, where async page components means that the entire page is rendered server-side (except for nested client components) and is dynamic, meaning it fetches the data each and every time.

- **Concept:** The page is rendered on the server **on demand** for every single request. 
	- This happens automatically if you access runtime information (Cookies, Headers, Search Params).
	- This can also happen when you use dynamicIO and wrap an async component within suspense instead of caching it with `"use cache"`
- **Use Case:** Personalized dashboards, pages behind authentication, real-time data.

### SSG

Static site generation involves building out pages ahead of time, which is a technique we can use on route param routes like `/websites/[id]`.

We do this by returning the `params` from `generateStaticParams()` on a dynamic route param route, and then for all params, nextjs will build out a version of that page for each param.

```tsx file="app/posts/[id]/page.tsx"

export async function generateStaticParams() {
  const posts = await prisma.post.findMany();
  
  // Returns [{ id: '1' }, { id: '2' }]
  // Next.js will build HTML for these specific pages at build time.
  return posts.map((post) => ({ id: String(post.id) }));
}

export default async function PostPage({ params }) {
  // ... renders static post
}
```

### ISR

Use nextjs caching to only revalidate or invalidate the cache for a page when the data the page uses has been mutated. You yourself need to manually set rules to invalidate the cache.

### PPR

Partial prerendering is new in nextjs and it is the "Holy Grail" of rendering. It prevents making a whole route/page dynamic if it has a `<Suspense>` somewhere in its component tree.

- **concept**: combines SSG and Dynamic Rendering in the **same page**. You keep the outer shell (Navbar, Footer, Main Content) static, while isolating dynamic parts (like a "Recently Viewed" sidebar) in holes that are filled in dynamically.
- **The Problem it Solves:** Previously, if one tiny child component inside a page was asynchronous (called `fetch()`, `cookies()`, etc.), the _entire page_ became Dynamic (SSR). With PPR, only that component is Dynamic.

Here's an example:

```tsx file="app/posts/page.tsx"
import { Suspense } from "react";
import { cookies } from "next/headers";

// 1. The Page itself remains STATIC (SSG)
export default function Page() {
  return (
    <main>
      <h1>Static Blog Content</h1>
      <p>This part is pre-rendered at build time.</p>

      {/* 2. Boundary: Isolate the dynamic part */}
      <Suspense fallback={<div>Loading personal history...</div>}>
        <RecentlyViewed />
      </Suspense>
    </main>
  );
}

// 3. This component accesses cookies, so it renders dynamically (SSR)
async function RecentlyViewed() {
  const cookieStore = cookies(); // 👈 This reads runtime info
  const history = getHistory(cookieStore);
  return <div>You recently viewed: {history}</div>;
}
```

**Concept:** Historically, you had to choose a rendering strategy for your **entire page**.
- **Static (SSG):** Fast, cached at the edge, but cannot handle personalized data (e.g., "Welcome, User").
- **Dynamic (SSR):** Personalized, but slower because the server must calculate the entire page before sending anything.
    

**The "Poisoning" Effect:** In Next.js, if you use a dynamic API (like `cookies()` or `headers()`) anywhere in your component tree, the **entire route** switches to Dynamic Rendering. This means even your static footer and logo wait for the database call to finish before loading.

**Concept:** PPR uses **React Suspense** boundaries to isolate dynamic code. Next.js detects these boundaries at build time.

1. **The Shell:** Everything _outside_ the Suspense boundary is pre-rendered as static HTML (the "Shell").
    
2. **The Holes:** Everything _inside_ the Suspense boundary is treated as dynamic. It is replaced with a fallback (loading state) in the initial HTML.
    
3. **Runtime:** When a user visits, they get the Shell immediately (from the Edge). The dynamic parts run on the server and stream in parallel.


Therefore, the new best practice is the following:

- Always put your dynamic code `cookies()`, `fetch()`, etc. in an async component that is nested farther down the page level rather than wrapping the entire page, so you can take advantage of PPR and leave some parts of the page static while you leave other parts dynamic.
- In next 16, all you have to do is use `<Suspense>` to wrap dynamic asyn components, and then you automatically opt into partial prerendering

#### Next 15

In next 15, you enable it in the next config:

```
nextConfig.experimental.ppr = true
```

and then specify ppr for a page like so:

```ts
export const experimental_ppr = true;
```

#### Next 16

Partial prerendering is now baked into nextjs 16 and thus is the default. 

## Server Actions

Server actions are syntactic sugar in NextJS that from a normal javascript function running server-side, creates a POST API route behind the scenes that is automatically fetched when a user invokes the server action.

There are three different ways to use server actions:

1. **form action**: The reason why they are called *Server Actions* is because you can pass the server action function to the `action=` attribute on a form, which will then trigger the server action with the `FormData` when the form is submitted.
2. **button action**: On any button inside a form, you can pass in a server action function to the `formAction=` attribute.
3. **invoke it manually**: Simply invoke it manually, passing in whatever params you want and returning whatever you want.

Here are the benefits of server actions over normal API routes you can make in NextJS:

- You get type safety since server actions are just normal javascript functions you import into your client components.
- You don't have to write cumbersome `fetch()` requests. Just set the `action=` prop on a form and set it to the server action function, and you're done.

### Server actions as form actions

Server actions are normal javascript functions running server-side that you define. To define a server action, use the `"use server"` directive at the top of the file containing all your actions code.

What the `"use server"` directive does is that it transforms what would otherwise be a normal JS function running in the node runtime into an HTTP route handler. Thus there are two important things that must be understood here:

1. You CAN ONLY use server actions in client components, and attach them to the `action=` prop on a `<form>` element.
2. You CANNOT use server actions in server components, since they are essentially HTTP route handlers and do not work outside of that context.

**step 1: create the form action**

1. In some arbitrarily named file like `actions.ts`, put a `"use server"` directive at the top of the file.

```ts
'use server'

export async function signIn(formData: FormData): Promise<ActionResponse> {

    // Extract data from form
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

	// 1. check email and password against database
	redirect("/dashboard")
	
}
```

2. In your form, to actually populate the form data, you need to put `name=` attributes on your input elements.
3. Pass the action function to the `action=` prop on a `<form>` tag to connect the server action as the handler for the form.

This was the most basic way to use server actions, preventing forms from having to become client components.

```tsx
// 1. import server action called "action"

export default function MyForm() {
	return (
		<form action={action}>
		 { /* input elements here ... */}
		</form>
	)
}
```

#### `useActionState` hook

Then the next step is to actually use the server action in your form submission by following these two steps:

1. Use the `useActionState()` hook, passing in your server action, which returns the form action to pass in to the `action=` prop, a loading state, and state representing the return result from the server action.
2. Define more what you want to happen in the callback to the hook.

Here is how the basic usage of the hook works:

```ts
import { useActionState } from 'react'

const [state, formAction, isPending] = useActionState(cb, initialState)
```

Here are the arguments you pass in:

- `initialState`: the initial state of the server action response. The `state` variable will have the exact same form
- `cb`: a callback that takes in two arguments: the previous state and the form data, and you must return the new state in the callback.

Here are the variables that are returned from the hook:

- `state`: the current state of the server action response
- `formAction`: the action object you pass into the `action=` prop of the form. Remember that callback you passed into the `useActionState()` hook? Yeah, that callback will get triggered when the form gets submitted, all connected through passing the `formAction` to the `action=` prop of that form.


```tsx
'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/app/components/ui/Button'
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
} from '@/app/components/ui/Form'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { signIn, ActionResponse } from '@/app/actions/auth'

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

export default function SignInPage() {
  const router = useRouter()

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    try {
      const result = await signIn(formData)

      // Handle successful submission
      if (result.success) {
        toast.success('Signed in successfully')
        router.push('/dashboard')
        router.refresh()
      }

      return result
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || 'An error occurred',
        errors: undefined,
      }
    }
  }, initialState)

  return (
    //... rest of the component
    <Form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <FormError>{state.message}</FormError>
      )}

      <FormGroup>
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          aria-describedby="email-error"
          className={state?.errors?.email ? 'border-red-500' : ''}
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-red-500">
            {state.errors.email[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="password">Password</FormLabel>
        <FormInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          aria-describedby="password-error"
          className={state?.errors?.password ? 'border-red-500' : ''}
        />
        {state?.errors?.password && (
          <p id="password-error" className="text-sm text-red-500">
            {state.errors.password[0]}
          </p>
        )}
      </FormGroup>

      <div>
        <Button type="submit" className="w-full" isLoading={isPending}>
          Sign in
        </Button>
      </div>
    </Form>
    //... rest of the component
  )
}
```

Here's a simpler example:

```tsx
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(
	  // first argument is callback
    async (prevState, formData) => {
      const response = await addNoteAction(formData);
      if (response.success) {
        router.refresh();
        return {
          success: true,
          message: "Note added successfully",
          error: "",
        };
      }
      return response;
    },
    // 2nd argument is initial state
    {
      success: false,
      message: "",
      error: "",
    }
  );
```

Here's another example:

```tsx
'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Issue, ISSUE_STATUS, ISSUE_PRIORITY } from '@/db/schema'
import Button from './ui/Button'
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
} from './ui/Form'
import { createIssue, ActionResponse } from '@/app/actions/issues'

interface IssueFormProps {
  issue?: Issue
  userId: string
  isEditing?: boolean
}

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
}

export default function IssueForm({
  issue,
  userId,
  isEditing = false,
}: IssueFormProps) {
  const router = useRouter()

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    // Extract data from form
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as
        | 'backlog'
        | 'todo'
        | 'in_progress'
        | 'done',
      priority: formData.get('priority') as 'low' | 'medium' | 'high',
      userId,
    }

    try {
      // Call the appropriate action based on whether we're editing or creating
      const result = isEditing
        ? await updateIssue(Number(issue!.id), data)
        : await createIssue(data)

      // Handle successful submission
      if (result.success) {
        router.refresh()
        if (!isEditing) {
          router.push('/dashboard')
        }
      }

      return result
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || 'An error occurred',
        errors: undefined,
      }
    }
  }, initialState)

  const statusOptions = Object.values(ISSUE_STATUS).map(({ label, value }) => ({
    label,
    value,
  }))

  const priorityOptions = Object.values(ISSUE_PRIORITY).map(
    ({ label, value }) => ({
      label,
      value,
    })
  )

  return (
    <Form action={formAction}>
      {state?.message && (
        <FormError
          className={`mb-4 ${
            state.success ? 'bg-green-100 text-green-800 border-green-300' : ''
          }`}
        >
          {state.message}
        </FormError>
      )}

      <FormGroup>
        <FormLabel htmlFor="title">Title</FormLabel>
        <FormInput
          id="title"
          name="title"
          placeholder="Issue title"
          defaultValue={issue?.title || ''}
          required
          minLength={3}
          maxLength={100}
          disabled={isPending}
          aria-describedby="title-error"
          className={state?.errors?.title ? 'border-red-500' : ''}
        />
        {state?.errors?.title && (
          <p id="title-error" className="text-sm text-red-500">
            {state.errors.title[0]}
          </p>
        )}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description">Description</FormLabel>
        <FormTextarea
          id="description"
          name="description"
          placeholder="Describe the issue..."
          rows={4}
          defaultValue={issue?.description || ''}
          disabled={isPending}
          aria-describedby="description-error"
          className={state?.errors?.description ? 'border-red-500' : ''}
        />
        {state?.errors?.description && (
          <p id="description-error" className="text-sm text-red-500">
            {state.errors.description[0]}
          </p>
        )}
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup>
          <FormLabel htmlFor="status">Status</FormLabel>
          <FormSelect
            id="status"
            name="status"
            defaultValue={issue?.status || 'backlog'}
            options={statusOptions}
            disabled={isPending}
            required
            aria-describedby="status-error"
            className={state?.errors?.status ? 'border-red-500' : ''}
          />
          {state?.errors?.status && (
            <p id="status-error" className="text-sm text-red-500">
              {state.errors.status[0]}
            </p>
          )}
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="priority">Priority</FormLabel>
          <FormSelect
            id="priority"
            name="priority"
            defaultValue={issue?.priority || 'medium'}
            options={priorityOptions}
            disabled={isPending}
            required
            aria-describedby="priority-error"
            className={state?.errors?.priority ? 'border-red-500' : ''}
          />
          {state?.errors?.priority && (
            <p id="priority-error" className="text-sm text-red-500">
              {state.errors.priority[0]}
            </p>
          )}
        </FormGroup>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? 'Update Issue' : 'Create Issue'}
        </Button>
      </div>
    </Form>
  )
}
```

### Other ways to use server actions

Since server actions are just syntactic sugar for fetching an API route you make, you can invoke them anywhere, in any event handler like `onClick=` or as a result of a form submission with the `action=` prop.

#### button with `formAction=`

If you want to launch a server action with a button click instead of doing stuff with a form, you can do it by passing a server action to the `formAction=` prop or the `onClick=` to the `<button>` component.

1. Create a server action that does not take any form data arguments:

```ts
'use server'
 
export async function createPost() {}
```

2. Pass in the server action to the `formAction=` prop of the button that when clicked, you want it to trigger the server action:

```ts
'use client'
 
import { createPost } from '@/app/actions'
 
export function Button() {
  return <button formAction={createPost}>Create</button>
}
```

#### Button with `onClick=`

You can create a server action that accepts any arguments and returns data in any form, and then you can manually call that server action as a normal javascript function inside an event handler to data fetch it in a `useEffect`.

For example, you can use a server action in an `onClick=` prop like so:
`
```ts title="actions.ts"
export async function deleteNoteAction(id: number) {
  "use server";
  notesModel.deleteNote(id);
  notesCacher.uncache();
}
```

```tsx title="DeleteButton.tsx"
"use client";

import { deleteNoteAction } from "@/actions/actions";
import { TrashIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useRouter } from "next/navigation";

export const TrashButton = ({ id }: { id: number }) => {
  const router = useRouter();
  return (
    <button
      className="text-sm text-gray-500 hover:text-red-500 cursor-pointer"
      onClick={async () => {
        await deleteNoteAction(id);
        router.refresh();
      }}
    >
      <TrashIcon className="w-4 h-4" />
    </button>
  );
};
```

### Things you can do in server actions

#### Redirecting users

You can do stuff like redirecting a user in a server action:

```ts
'use server'
 
import { redirect } from 'next/navigation'
 
export async function createPost(formData: FormData) {
  // Update data
  // ...
 
  redirect('/posts')
}
```



> [!IMPORTANT] 
> You CANNOT use the `redirect()` function within a try-catch block. You can only use it outside.

#### `useFormStatus`

There is the `useFormStatus` hook from React that allows you to access form loading state and thus change UI based on that state. 

The only rule is that whatever component you use this hook in must be rendered somewhere inside a form.

```tsx
'use client'
 
import { useFormStatus } from 'react-dom'
 
export function SubmitButton() {
  const { pending } = useFormStatus()
 
  return (
    <button disabled={pending} type="submit">
      Sign Up
    </button>
  )
}
```

Here are the properties on the object returned from the `useFormStatus()` hook:

- `data`
- `pending`

#### `useTransition`

`useTransition()` is a react 19 hook that lets you perform blocking operations like server actions while keeping the UI snappy.

- **Non-blocking updates**: Marking an update as a transition prevents it from blocking interaction with the UI.
- **Handling multiple transitions**: Currently, React batches multiple transitions, although this may change in future releases.
- **Limitations**: Transitions are not suitable for controlling text inputs and must be synchronous.

```tsx
// /actions/events.ts
'use server'

import { db } from '@/db/db'
import { events } from '@/db/schema'
import { delay } from '@/utils/delay'
import { getCurrentUser } from '@/utils/users'
import randomName from '@scaleway/random-name'

export const createNewEvent = async () => {
  await delay(1000)
  const user = await getCurrentUser()

  await db.insert(events).values({
    startOn: new Date().toUTCString(),
    createdById: user.id,
    isPrivate: false,
    name: randomName('event', ' '),
  })
}
```

```tsx
// /components/Nav.tsx
'use client'
import { Input } from '@nextui-org/react'
import { createNewEvent } from '@/actions/events'
import { Button, Tooltip } from '@nextui-org/react'
import { CirclePlus } from 'lucide-react'
import { useTransition } from 'react'

const Nav = () => {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      createNewEvent()
    })
  }

  return (
    <nav className="h-[65px] border-b border-default-50 flex items-center px-6 gap-4">
      <div>
        <Tooltip content="New Event">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            isLoading={isPending}
            onClick={handleClick}
          >
            <CirclePlus size={16} />
          </Button>
        </Tooltip>
      </div>
      <div className="w-1/2">
        <Input size="sm" variant="faded" placeholder="search" />
      </div>
    </nav>
  )
}

export default Nav

```
## Caching

### dynamic vs static in nextjs

In NextJS 15, caching is heavily improved. To setup caching on the canary version of nextjs, do the following and first install the canary version with `npm install next@canary`. You then need to enable **dynamicIO**.

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
}

export default nextConfig
```

If in next 16, this feature is now stable and you can enable it via `cacheComponents` flag in the next config:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true
};

export default nextConfig;
```

Caching is done on the page level in the `page.tsx` component. NextJS forces you to explicitly define if you want a static cached page or a dynamic page. 

These behaviors sometimes happen by default:

- **static by default**: A page component will be static by default if it is not asynchronous, meaning it does no data fetching or does not fetch anything like cookies or search parameters. All it does is return HTML.
- **should be dynamic**: A page component is most likely dynamic if it is asynchronous or it uses `fetch()`, `cookies()`, `headers()`, or `searchParams()`

> [!NOTE]
> You MUST define either caching or dynamic behavior if any server component rendered in your page is asynchronous. NextJS will throw an error until you decide whether to make the page dynamic with `<Suspense>` or implement some sort of caching strategy with `"use cache"`

### `"use cache"`

The `"use cache"` directive in NextJS 15 is the new way to opt into caching server-side.

The `"use cache"` directive when placed at the top of the file caches all the exports from the file, and when placed as the first line in a function, it caches the return value from that function, memoizing it. And when used in a page component, it caches the entire page.

To make a page cached forever with the **cache-first** strategy, use the `"use cache"` directive at the top of the `page.tsx`.

There are three ways you can cache with the `"use cache"` directive.

1. Caching at the page level with `page.tsx`
2. Caching a React server component
3. Caching a function's return value

```tsx
// File/page level
'use cache'
 
export default async function Page() {
  // ...
}
 
// Component level
export async function MyComponent() {
  'use cache'
  return <></>
}
 
// Function level
export async function getData() {
  'use cache'
  const data = await fetch('/api/data')
  return data
}
```

> [!IMPORTANT]
> It is extremely important to understand that "use cache" caches server-side, making it a global cache that affects all clients. For client-side or per-request caching, use the `cache()` function from React.

#### Revalidation techniques

By default, the `"use cache"` directive caches the page/component/function forever, revalidating the cache every 15 minutes. You can change how often the cache revalidates or gets invalidated through three main caching techniques in NextJS:

1. **tag based caching**: use `cacheTag(name)` and `revalidateTag(name)` functions to manually cache and invalidate functions.
2. **path based caching**: use `revalidatePath(route)` to revalidate the cache for a page, which is useful if you used `"use cache"` at the top of a page.
3. **cache life**: You can manually change the cache life of a page in nextjs from being infinitely cached to something different using the `cacheLife()` function.


**tag based revalidation**
****

To implement manual revalidation, you can used a tags-based approach that lets you revalidate content connected to a specific tag:

- `cacheTag(tag: string)`: caches the function/component under the specified tag
- `revalidateTag(tag: string)`: from the specified tag, removes the function from the cache. However, this has **stale while revalidate** behavior, meaning that it still shows the initial cached version before getting the fresh data back.
- `updateTag(tag: string)`: invalidates the cache of the function that the tag references. However, it immediately serves fresh data.

**page based revalidation**
****

You can also revalidate entire paths, if you cache at the page level:

- `revalidatePath(path: string)`: revalidates a page cached with `"use cache"`

**cache life**
****

There are three components to cache life that you should understand before invoking this function:

- **revalidate time**: the period of time data stays cached until checking for revalidation server-side
- **stale time**: the client side cache time, duration the client should cache a value before falling back to the server. (Obviously, data should only be cached client side to store the data on their end instead of the server)
- **expiration time**: sets the time to wait before the cache will get deleted, after which no caching will take place.

Here are the default string values you can pass into the `cacheLife()` function, which are presets of combinations of all three components. By default, stale time is infinite, cache never expires, and is revalidated every 15 minutes.

- `"seconds"`: Revalidated every second, cache only lasts 1 second.
- `"minutes"`: Revalidated every 5 minutes, cache only lasts 5 minute.
```ts
"use cache" // 1. must cache page with 'use cache' directive to use cache life

import {unstable_cacheLife as cacheLife } from "next/cache"

export default async function Page() {
	cacheLife('hours')
	return <><>
}
```

You can also add different combinations manually by passing in an object of those three time components into the `cacheLife()` function:

- `stale`: how long the client side cache should store in seconds.
- `revalidate`: the cache revalidation interval length in seconds.
- `expire`: how long after the cache should expire in seconds.

```ts
import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  
  cacheLife({
    stale: 300,      // 5 minutes - client uses cache without checking
    revalidate: 900, // 15 minutes - server revalidates in background
    expire: 3600     // 1 hour - cache completely expires
  })
  
  return await fetch('/api/data').then(r => r.json())
}
```

```tsx
'use cache'
cacheLife('seconds') // Ultra-fresh data
// stale: 30s, revalidate: 1s, expire: 1m

cacheLife('minutes') // Rapidly changing data
// stale: 5m, revalidate: 1m, expire: 1h

cacheLife('hours') // Moderately fresh data
// stale: 5m, revalidate: 1h, expire: 1d

cacheLife('days') // Stable content
// stale: 5m, revalidate: 1d, expire: 1w

cacheLife('weeks') // Very stable content
// stale: 5m, revalidate: 1w, expire: 30d

cacheLife('max') // Nearly immutable
// stale: 5m, revalidate: 30d, expire: never

cacheLife('default') // Balanced
// stale: 5m, revalidate: 15m, expire: never
```


#### 1) Caching at the page level

When you cache at the page level, you are telling NextJS to **statically prerender** that page, and to only dynamically regenerate by revalidating the cache manually, which you can do by revalidating the path or a tag.

> [!WARNING]
> Since `"use cache"` has buildtime behavior here, you CANNOT use dynamic data associated with requests like `cookies()` or `headers()`.

Remember to implement revalidation with `revalidatePath()` if you choose to cache at the page level, which invalidates all caches used in a route.

1. Call `"use cache"` at the page level
2. In some server action or server side function that mutates backend data, call `revalidatePath(path)` and pass in the route your want to invalidate the cache for.

```tsx file="post/actions.ts"
'use server'

import { revalidatePath } from 'next/cache'

export async function updateUserProfile(userId: string) {
  await db.users.update(userId)
  
  revalidatePath('/profile')         // Single page
  revalidatePath(`/users/${userId}`) // Dynamic route
  revalidatePath('/blog', 'layout')  // All pages in /blog
}
```
#### 2) Caching at the component level

Caching at the component level essentially memoizes the props and any computations that happen inside the component. The cached value will be returned as long as all the serialized props are the same across each call.

```ts
export async function Bookings({ type = 'haircut' }: BookingsProps) {
  'use cache'
  async function getBookingsData() {
    const data = await fetch(`/api/bookings?type=${encodeURIComponent(type)}`)
    return data
  }
  return //...
}
 
interface BookingsProps {
  type: string
}
```

The one exception to the serialized props is `children`, which can be different each time.
#### 3) Caching at the function level.

You can cache async function calls with the `"use cache"` directive to cache the function's return value. 

1. To opt into caching the return values of functions, use the `"use cache"` directive at the first line of the function body.
2. To invalidate the cache for the function, first attach a specific reference name to that function by invoking `cacheTag(some_tag)` within the function body, and then call `revalidateTag(some_tag)` to invalidate the cache of the function referenced by that tag.

You have two methods for invalidation:
- `revalidateTag(tag, cachelife)`: performs stale while revalidate with some cache life
	- **use case**: for content where slight delays are acceptable, like blogs or product catalogs.
- `updateTag(tag)`: invalidates the cache and immediately serves fresh data
	- **use case**: for immediate consistency, like user-created content where the user needs to immediately see the data they created.

A basic technique is to cache data fetching functions and to reset the cache when a new resource is created or updated:

```ts
import { unstable_cacheTag as cacheTag } from 'next/cache'

const getIssues = async () => {
  'use cache'
  cacheTag('issues')
  // ...rest
}
```

```ts
import { revalidateTag } from 'next/cache'

export const createIssue = async () => {
  // after mutating data by adding issues, revalidate it
  revalidateTag('issues')
}
```

**`revalidateTag(tag)`**

```ts
'use server'

import { revalidateTag } from 'next/cache'

export async function updateArticle(articleId: string) {
  await db.articles.update(articleId)
  
  // Mark as stale - users see old content while it revalidates
  revalidateTag(`article-${articleId}`, 'max')
}
```

**`updateTag(tag)`**

```ts
'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const post = await db.posts.create({
    title: formData.get('title'),
    content: formData.get('content'),
  })
  
  // Immediately expire - user must see new post now
  updateTag('posts')
  updateTag(`post-${post.id}`)
  
  redirect(`/posts/${post.id}`)
}
```

#### Server-side refresh

Before after invalidating the cache after mutating some server-side data, you had to send the response back to the client so that the client could call `router.refresh()` to soft refresh and see the new, fresh data.

Now, you can do that server side via `refresh()` from the `"next/cache"` library in nextjs 16, which will make the current route the user is on perform a soft refresh client-side.

### Dynamic pages: `<Suspense>`

Using the `<Suspense>` component and rendering it anywhere within your `Page.tsx` tells NextJS that you want the page to be a dynamic route. 

> [!TIP]
> The best strategy is to push the `<Suspense>` as far down the rendering stack as possible so most of your app never re-renders - only the part that is necessary.

If you fetch data at the page level and want to wrap the whole page in a `<Suspense>`, there is syntactic sugar to do so via the special `loading.tsx` component within a route folder, which tells NextJS to wrap the entire `page.tsx` component within a `<Suspense>`, with the fallback being rendered with the content being whatever you default export from the `loading.tsx`



### memoizing with react's `cache()`

You can also use memoization to basically act as a cache if the function is called with the same arguments, using the `cache()` function from React. 

The main difference of this function vs the other cache tag helpers is that this is NOT a global cache. Rather, `cache()` works on a per-request level, local to each client.

```ts
import { cache } from 'react'
import { db } from '@/app/lib/db'
 
// getPost will be used twice, but execute only once
export const getPost = cache(async (slug: string) => {
  const res = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  return res
})
```

**important characteristics**

- Request-scoped: The cache is per-request, not global across all users
- Automatic: No manual cache management needed
- Transparent: The function signature remains the same as long as the arguments remain the same.

### Parallelism vs Sequential

When performing asynchronous data fetching in your RSCs, it's vital to understand how to speed up your data fetching by awaiting promises in parallel.

```ts
import Albums from './albums'
 
async function getArtist(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}`)
  return res.json()
}
 
async function getAlbums(username: string) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`)
  return res.json()
}
 
export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const artistData = getArtist(username)
  const albumsData = getAlbums(username)
 
  // Initiate both requests in parallel
  const [artist, albums] = await Promise.all([artistData, albumsData])
 
  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums} />
    </>
  )
}
```


### Next 16 Three cache directives

The main issue with dynamicIO caching was that the cache was global across the server, meaning all users shared the same cache.

But now, Next.js 16 offers three cache types for different use cases:

- **`"use cache"`**: global in-memory cache during the server's lifetime, shared by all clients who use your app.

	- **use case**: caching server-side data that is accessible by all clients.
	- **in code**: cannot cache any function or component using `cookies()`, `headers()`, or any other dynamic request-based code.
	
- **`"use cache 'remote'"`**: caches to a third-party dedicated cache database like vercel kv or redis. This cache persists even across server restarts, since it's cached in the cloud.

	- **use case**: caching server-side data that is accessible by all clients, anything you would use Redis for.
	- **in code**: cannot cache any function or component using `cookies()`, `headers()`, or any other dynamic request-based code.
	
- `"use cache 'private'"`: local storage cache that lives only in browser memory, meaning it gets cleared once the browser is closed.

	- **use case**: caching stuff only for the user, based on their private browser data like `cookies()` or `headers()`
	- **in code**: you can cache anything using `cookies()`, `headers()`, or any other dynamic request-based code.

| Feature                                 | `use cache`                     | `'use cache: remote'`             | `'use cache: private'` |
| --------------------------------------- | ------------------------------- | --------------------------------- | ---------------------- |
| **Server-side caching**                 | In-memory or cache handler      | Remote cache handler              | None                   |
| **Cache scope**                         | Shared across all users         | Shared across all users           | Per-client (browser)   |
| **Can access cookies/headers directly** | No (must pass as arguments)     | No (must pass as arguments)       | Yes                    |
| **Server cache utilization**            | May be low outside static shell | High (shared across instances)    | N/A                    |
| **Additional costs**                    | None                            | Infrastructure (storage, network) | None                   |
| **Latency impact**                      | None                            | Cache handler lookup              | None                   |

#### 1. Static Cache (Default `use cache`)

**When to use:** Build-time data shared by all users

typescript

```typescript
async function getProductDetails(id: string) {
  'use cache'
  cacheTag(`product-${id}`)
  
  // Cached at BUILD TIME, shared across all users
  return db.products.find({ where: { id } })
}
```

- ✅ Cached at build time
- ✅ Included in static HTML shell
- ✅ Zero database load
- ❌ Can't access runtime APIs (cookies, headers)

#### 2. Remote Cache (`use cache: remote`)

**When to use:** Runtime data shared across users

typescript

```typescript
import { connection } from 'next/server'
import { cacheLife, cacheTag } from 'next/cache'

async function DashboardStats() {
  await connection() // Defer to request time
  
  const stats = await getGlobalStats()
  return <StatsDisplay stats={stats} />
}

async function getGlobalStats() {
  'use cache: remote'
  cacheTag('global-stats')
  cacheLife({ expire: 60 }) // 1 minute
  
  // Cached at RUNTIME, shared across all users
  const stats = await db.analytics.aggregate({
    total_users: 'count',
    active_sessions: 'count',
  })
  
  return stats
}
```

- ✅ Cached at request time
- ✅ Shared across serverless instances
- ✅ Can run after dynamic operations
- ⚠️ Requires `await connection()` to defer
- ❌ Higher database load than static cache

**Use cases:**

- Expensive computations after auth checks
- Data that changes frequently but can be shared
- Product prices for all users with same currency

#### 3. Private Cache (`use cache: private`)

**When to use:** Per-user personalized data

typescript

```typescript
async function getRecommendations(productId: string) {
  'use cache: private'
  cacheTag(`recommendations-${productId}`)
  cacheLife({ stale: 60 }) // Minimum 30s required
  
  const sessionId = (await cookies()).get('session-id')?.value
  
  // Cached PER USER, never shared
  return db.recommendations.findMany({
    where: { productId, sessionId }
  })
}
```

- ✅ Cached per user
- ✅ Can access cookies, headers
- ✅ Enables runtime prefetching for personalized content
- ⚠️ Requires minimum 30s stale time
- ❌ Higher memory usage (one cache per user)

**Use cases:**

- Shopping cart contents
- User-specific recommendations
- Personalized dashboards



#### Combining all three

```tsx
import { Suspense } from 'react'

export default async function ProductPage({ params }) {
  const { id } = await params
  
  return (
    <div>
      {/* Static cache - build time */}
      <ProductDetails id={id} />
      
      {/* Remote cache - runtime shared */}
      <Suspense fallback={<div>Loading price...</div>}>
        <ProductPrice productId={id} />
      </Suspense>
      
      {/* Private cache - per user */}
      <Suspense fallback={<div>Loading recommendations...</div>}>
        <Recommendations productId={id} />
      </Suspense>
    </div>
  )
}

// Build-time static cache
async function ProductDetails({ id }: { id: string }) {
  'use cache'
  cacheTag(`product-${id}`)
  
  return db.products.find({ where: { id } })
}

// Runtime shared cache
async function ProductPrice({ productId }: { productId: string }) {
  await connection() // Defer to request time
  
  const price = await getProductPrice(productId)
  return <div>Price: ${price}</div>
}

async function getProductPrice(productId: string) {
  'use cache: remote'
  cacheTag(`product-price-${productId}`)
  cacheLife({ expire: 300 })
  
  const currency = (await cookies()).get('currency')?.value ?? 'USD'
  return db.products.getPrice(productId, currency)
}

// Per-user private cache
async function Recommendations({ productId }: { productId: string }) {
  const recommendations = await getRecommendations(productId)
  return <RecommendationsList items={recommendations} />
}

async function getRecommendations(productId: string) {
  'use cache: private'
  cacheLife({ stale: 60 })
  
  const sessionId = (await cookies()).get('session-id')?.value
  return db.recommendations.findMany({ where: { productId, sessionId } })
}
```
## API routes and middleware

### API routes

API route handlers in NextJS are not an actual server - rather, they are deployed as serverless functions that vercel hosts. Vercel is not a server-environment deployer - rather like Netlify, they are simple static page hosters that support serverless functions.

Here is the difference between serverless and server:


| serverless                                                            | server                                                                        |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| scales infinitely since you can spin up infinite cloud function calls | Needs load-balancing and scaling procedures once it reaches concurrency limit |
| Has cold starts since it needs to spin up mini-server each time       | No cold-start once launched.                                                  |

```ts file=app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello, World!' })
}

export async function POST(request: Request) {
  const data = await request.json()

  return NextResponse.json(
    {
      message: 'Todo created successfully',
      todo: data,
    },
    { status: 201 }
  )
}
```

Here are the 6 best practices to keep in mind when writing API routes:

1. **Validation**: Always validate input data before processing
2. **Error Handling**: Provide meaningful error messages and appropriate status codes
3. **Rate Limiting**: Implement rate limiting for public APIs
4. **Authentication**: Secure sensitive endpoints with proper authentication
5. **Logging**: Log API requests and errors for debugging
6. **Testing**: Write tests for your API routes
#### Retrieving search params

To retrieve search params from a api route, just retrieve them from the `URL()` object, wrapping the url from the `request.url` from the request.

```ts
const { searchParams } = new URL(request.url)
```

```ts
// app/api/search/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const limit = searchParams.get('limit') || '10'

  return NextResponse.json({
    message: `Searching for: ${query}`,
    limit: parseInt(limit),
  })
}
```

#### Dynamic API routes

```ts
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id

  // In a real app, fetch user data from a database
  const userData = {
    id,
    name: 'John Doe',
    email: 'john@example.com',
  }

  return NextResponse.json(userData)
}
```

#### CORS

You can set CORS setting per API route like so:

```ts
// app/api/cors-example/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint supports CORS' },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}
```
### API Route utilities

API routes in NextJS are augmented with the use of several utility helpers available:

#### `NextResponse`

#### `cookies()`

```ts
'use server'
 
import { cookies } from 'next/headers'
 
export async function exampleAction() {
  const cookieStore = await cookies()
 
  // Get cookie
  cookieStore.get('name')?.value
 
  // Set cookie
  cookieStore.set('name', 'Delba')
 
  // Delete cookie
  cookieStore.delete('name')
}
```

### Edge Runtime

The edge runtime is a low-memory, slimmed down version of the Node runtime that allows you to deploy your API routes and middlewares around the world to be as close to your users as possible, using Vercel's extensive edge server network.

Unlike traditional server environments, Edge Runtime is designed to be lightweight and fast-starting, with minimal cold starts. It's optimized for functions that need to execute quickly and close to the user, such as authentication, personalization, A/B testing, and other request-time operations.

| Feature            | Edge Runtime                                            | Node.js Runtime                         |
| ------------------ | ------------------------------------------------------- | --------------------------------------- |
| **Startup Time**   | Milliseconds (cold start)                               | Seconds (cold start)                    |
| **Location**       | Distributed globally                                    | Centralized regions                     |
| **API Support**    | Limited subset of Web APIs                              | Full Node.js APIs                       |
| **Memory Limit**   | Lower (typically 128MB)                                 | Higher (up to several GB)               |
| **Execution Time** | Short (seconds)                                         | Longer (minutes)                        |
| **Use Cases**      | Authentication, personalization, simple transformations | Complex processing, database operations |

Here are examples of things that DO work in the Edge runtime:

- `fetch` and Request/Response objects
- `URLSearchParams` and `URL`
- `Headers`
- `TextEncoder` and `TextDecoder`
- `crypto` (including subtle crypto)
- `setTimeout` and `setInterval`
- `atob` and `btoa`
- `ReadableStream` and `WritableStream`
- `console` methods
- `structuredClone`
- `NextRequest` and `NextResponse` with enhanced functionality
- `cookies()` for reading and setting cookies
- `headers()` for accessing request headers
- `userAgent()` for client information
- `geolocation` data via `request.geo`

Here are examples of things that DON'T work in the Edge runtime:

- Using any native node modules like `fs` or `process`
- Using the CLI and related commands.

Here are the 6 main limitations of using the Edge runtime:

1. **Limited API Access**: No access to Node.js-specific APIs like `fs` for file system operations
2. **No Native Modules**: Cannot use modules that require compilation
3. **Memory Constraints**: Limited memory compared to Node.js environments
4. **Execution Time Limits**: Functions must complete within seconds, not minutes
5. **Bundle Size Limits**: Your code and dependencies must be relatively small
6. **No Long-Lived Connections**: WebSockets and similar technologies aren't supported

You can opt into the edge runtime for route handlers with the following code in a `route.ts`:

```ts
export const runtime = "edge"
```

There are also special edge functions and objects that vercel provides that only works in the edge runtime:
### Middleware

Middleware in nextjs are request interceptors that run on the routes you choose, and must send back some type of web response, or a `NextResponse.next()` to continue to the next middleware or route handler. 

> [!NOTE]
> The most important thing to realize about middleware is that **they always run on the edge runtime**. This means that you should only put extremely fast, essential operations inside middleware.

There are several benefits to using middleware in NextJS:

1. **Authentication & Authorization**: Protect routes by checking if users are authenticated before allowing access to certain pages.
2. **Internationalization (i18n)**: Detect a user's language preference and redirect them to the appropriate localized version of your site.
3. **A/B Testing**: Direct different users to different versions of your site to test new features or designs.
4. **Bot Protection**: Identify and block malicious bots from accessing your application.
5. **Custom Headers**: Add security headers or other custom headers to all responses.
6. **URL Rewrites**: Change the URL structure without changing the actual page structure.
7. **Edge Functionality**: Run code at the edge (closer to users) for better performance.

**writing middleware**

To start writing middleware, create a single `middleware.ts` at the root of your application:

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Your middleware logic here
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

- You have access to the request in middleware, and you have to send back a response using the `NextResponse` helper or a simple `Response` instance.
- You can configure which routes the middleware runs on with the `export const config` object, keeping in mind that by default, the middleware runs on all requests to your app.

In a middleware, you either return back a response or you go to the next route handler or middleware by returning `NextResponse.next()`.

Here is a complete middleware example:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization')

    // If no Authorization header is present, return a 401 Unauthorized response
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      )
    }

    // You can add additional authorization logic here
    // For example, validate JWT tokens, check specific auth schemes, etc.
  }

  // Continue with the request for non-API routes or if authorization is valid
  return NextResponse.next()
}

// Configure the middleware to only run on API routes
export const config = {
  matcher: '/api/:path*',
}
```

**best practices**

1. **Keep it Light**: Middleware runs on every request to matched routes, so keep the code efficient.
2. **Error Handling**: Implement proper error handling to prevent your middleware from crashing.
3. **Testing**: Test your middleware thoroughly to ensure it behaves as expected.
4. **Use the Edge Runtime**: Middleware runs on the Edge runtime, which has limitations compared to Node.js. Make sure your code is compatible.
5. **Caching Considerations**: Be aware of how your middleware might affect caching strategies.

#### Middleware examples

**changing headers**

You can change request headers for the request object coming into the middleware and then that request will have those new headers before heading to the next route handler. We can do this via two steps

1. Access the request headers from `request.headers` and set new headers on them.
2. Go to next route handler with `NextResponse.next()`, and passing the headers to the `request.headers` option.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // 1) Clone the request headers and set a new header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-hello-from-middleware1', 'hello')
 
  // 2) request headers in NextResponse.next
  const nextHandler = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  })
 
  // You can also set request headers like so: 
  nextHandler.headers.set('x-hello-from-middleware2', 'hello')
  return nextHandler
}
```

You can also use to to set something like CORS on every request.

```ts

import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

**authentication route guard**

```ts
// /middleware.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { COOKIE_NAME } from './utils/constants'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!request.cookies.has(COOKIE_NAME)) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/'],
}

```

**running background work**

A second argument you can accept into your middleware is the `event` object of type `NextFetchEvent`, and by using the `event.waitUntil()` method, you can launch and run background work while immediately returning a response.

```ts
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
 
export function middleware(req: NextRequest, event: NextFetchEvent) {
  event.waitUntil(
    fetch('https://my-analytics-platform.com', {
      method: 'POST',
      body: JSON.stringify({ pathname: req.nextUrl.pathname }),
    })
  )
 
  return NextResponse.next()
}
```

### route protection

#### Limiting ai

To limit AI and prevent it from costing too much money, you can employ the following tactics:

- **Set max tokens**: set the max output tokens when prompting the AI to make sure its response doesn't exceed a set maximum amount of tokens.
- **Limit user input**: Limit user input to a set amount of maximum tokens.

#### Rate limiting with arcjet

You can use this logic-agnostic way of rate limiting things in your server by going here:

```embed
title: "Arcjet - Painless security for developers"
image: ""
description: "Implement bot protection, rate limiting, email validation & more in just a few lines of code. Developer-first security for Node.js, Next.js, Deno, Bun, SvelteKit, NestJS, Vercel, Netlify, Fly.io"
url: "https://arcjet.com/?ref=bytegrad-2025-06-13"
favicon: ""
```

1. Install arcjet

```bash
npm i @arcjet/next @arcjet/inspect
```

2. Add the `ARCJET_KEY` secret to your env vars.

Now you have a reusable way to rate limit:

```ts
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { NextRequest } from "next/server";

export const arcjetIPLimiter = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track reqests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export async function rateLimit(
  arcjetLimiter: typeof arcjetIPLimiter,
  req: NextRequest
) {
  const decision = await arcjetLimiter.protect(req, { requested: 5 });
  let response = {
    status: 200,
    errorMessage: null,
    reason: null,
  } as {
    status: number;
    errorMessage: string | null;
    reason: any;
  };
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      response = {
        status: 429,
        errorMessage: "Too Many Requests",
        reason: decision.reason,
      };
    } else if (decision.reason.isBot()) {
      response = {
        status: 403,
        errorMessage: "No bots allowed",
        reason: decision.reason,
      };
    } else {
      response = {
        status: 403,
        errorMessage: "Forbidden",
        reason: decision.reason,
      };
    }
  }
  return response;
}
```

Now we can go in depth on the different rate limiting plugins arcjet has available:

- `shield()`: shields apps from SQL injection
- `detectBot()`: blocks scraper bots with an optional allowlist for search crawlers.
- `tokenBucket()`: standard rate limiting configuration

```ts
export const arcjetIPLimiter = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  characteristics: ["ip.src"], // Track reqests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});
```

A token bucket is a useful way of configuring data to rate limit stuff like AI responses by having an imaginary bucket with tokens, and a request will use a certain amount of tokens you configure, and when the bucket is empty, nobody can launch a request. The bucket refills itself periodically and automatically.

For example, to take away 5 tokens from a bucket on a request, we would do something like this:

```ts
const decision = await arcjetLimiter.protect(req, { requested: 5 });
```



### Extending function execution duration

The default timeout for a cloud function in Vercel is 10 seconds, which might be too small especially if you're doing some AI calls. You can set the max duration on a route handler by exporting this special value in a `route.ts` file:

```ts
export const maxDuration = 60
```

The minimum value you can set is 10, and the maximum is 60.
## NextJS Config

### The basic config

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
  // ignore ts errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // ignore eslint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
```

### Experimental features

All experimental features go under the `experimental` property:

- `experimental.dynamicIO`: if set to true, then enables dynamicIO caching.
- `experimental.ppr`: if set to true, then enables partial prerendering.

### Config reference

- `reactCompiler`: setting this flag to `true` enables the react compiler and omits the need for `useMemo`, `useCallback`, `memo`, etc.

**typescript config**

The typescript config goes under the `typescript` key:

- `typescript.ignoreBuildErrors` : if true, ignores tsc warnings during the build process, which prevents the build from failing due to errors.

**eslint config**

The typescript config goes under the `eslint` key:

- `eslint.ignoreDuringBuilds` : if true, ignores eslint warnings during the build process, which prevents the build from failing due to errors.




## Libraries





## Auth

### Clerk

### Better Auth



## Vercel-specific offerings

### Vercel KV

#### Basics

Through the vercel marketplace, you can add veercel KV and connect to it through env vars.

```ts
import { kv } from '@vercel/kv';

// string
await kv.set('key', 'value');
let data = await kv.get('key');
console.log(data); // 'value'

await kv.set('key2', 'value2', { ex: 1 });

// sorted set
await kv.zadd(
  'scores',
  { score: 1, member: 'team1' },
  { score: 2, member: 'team2' },
);
data = await kv.zrange('scores', 0, 0);
console.log(data); // [ 'team1' ]

// list
await kv.lpush('elements', 'magnesium');
data = await kv.lrange('elements', 0, 100);
console.log(data); // [ 'magnesium' ]

// hash
await kv.hset('people', { name: 'joe' });
data = await kv.hget('people', 'name');
console.log(data); // 'joe'

// sets
await kv.sadd('animals', 'cat');
data = await kv.spop('animals', 1);
console.log(data); // [ 'cat' ]

// scan for keys
for await (const key of kv.scanIterator()) {
  console.log(key);
}
```

#### Rate limiting

You can ratelimit using vercel kv and combining with the `@upstash/ratelimit` package.

```ts title="middleware.ts"
import {kv} from "@vercel/kv"
import { Ratelimit } from '@upstash/ratelimit'

const ratelimiter = new RateLimit({
	redis: kv,
	limiter: Ratelimit.slidingWindow(5, '10 s')
})

// which routes to rate limit on
export const config = {
	matcher: "/"
}

export default async function middleware(request: NextRequest) {
  // You could alternatively limit based on user ID or similar
  const ip = request.ip ?? '127.0.0.1'
  const { success, pending, limit, reset, remaining } =
    await ratelimit.limit(ip)

  return success
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/blocked', request.url))
}
```

### vercel blob storage

1. Go to your vercel deployment and click on "storage" -> "add blob storage"
2. Copy the read write blob token to your env vars
3. Install with `npm i @vercel/blob`

There are two different ways you can store files with vercel blob:

- **server uploads**: Get binary form data from API routes or server actions in your nextjs project, then upload that with a max request body size of 4.5mb for a file.
- **client-side upload**: Up to 5TB file for uploading via client-side.

#### API route upload

You can make an API request to an endpoint you set up for file handling like so:

There are three components to the fetch request you make in order for your API route to handle it correctly to upload to vercel blob storage:

1. **method**: should be a POST request
2. **headers**: should pass the mime type for `Content-type` header and have filename passed for the `"x-vercel-filename"` header.
3. **body**: request body should be `Blob` or `File` instance.

```ts
async function uploadFile(file: File) {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file?.type || "application/octet-stream",
      "x-vercel-filename": file?.name || "image.png",
    },
    body: file,
  });

  if (!res.ok) throw new Error("image upload failed")

  const { url } = (await res.json()) as { url: string };
  return url
}
```

To add a blob to vercel storage, we just use the `put` method:

```ts
import { put } from '@vercel/blob'

 const blob = await put(filename, file, options)
```

- `filename`: the filename to set
- `file`: the `File` or `Blob` instance to uplaod
- `options`: important options
	- `contentType`: the mimetype of the file
	- `access`: "public" for public access.

Then we can handle the API route like so:

```ts
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      "Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.",
      {
        status: 401
      }
    )
  }

  const file = req.body
  const filename = req.headers.get('x-vercel-filename') || "file"
  const contentType = req.headers.get('content-type')
  const fileExtendion = `.${contentType.split('/')[1]}`

  // construct final filename based on content-type if not provided
  const finalName = filename.includes(fileType)
    ? filename
    : `${filename}${fileType}`
    
  const blob = await put(finalName, file, {
    contentType,
    access: 'public'
  })

  return NextResponse.json(blob)
}
```

#### Server Action upload

```ts
"use server"
import { put } from '@vercel/blob';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  const blob = await put(file.name, file, { 
	  access: 'public', 
	  addRandomSuffix: true 
  });

  return Response.json(blob);
}
```

### Vercel Inngest background jobs

## Best practices

### Folder structure

- `services`: a folder to store abstractions around third party libraries, like clerk, inngest, resend, etc. Each file in the `services` folder should correspond to one service.
- `store`: any hooks that act as a global store
- `db`: your database code
- `features`: a folder that colocates all code for a feature in your nextjs app. It has these subfolders:
	- `components`: all components used in the feature
	- `hooks`: all hooks that are used solely for the feature
	- `actions`: contains the server actions used for that feature
		- `actions.ts`: contains the server actions, has `"use server"` at top.
		- `schema.ts`: zod schema for the feature and server actions

```
/src
  /features
    /job-listing
      /components
        - JobCard.tsx
        - FilterSidebar.tsx
      /hooks
        - useJobSearch.ts
      /actions
        - createJob.ts
    /users
      /components
        - UserAvatar.tsx
      /db
        - userQueries.ts
  /services
    /clerk
    /stripe
```

Whenever you're calling a lot of third party code sprinkled throughout your app, it's always a good idea to colocate all that logic into one single abstraction class, which lets you refactor very easily.

### DAL

DAL (data access layer) functions are server-side only functions meant for fetching data that will then be passed to the frontend and displayed.

DAL functions are NOT server actions. They're just normal ass functions you run server-side.

#### DAL with auth

You almost always want to cache your main server-side auth function that retrieves the user. Cache it per request, using `cache()` from react to do so.

```tsx file="services/clerk.ts"
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSession } from "@/lib/auth"; // Your auth provider

// ✅ Cached for performance in a single render pass
export const requireUser = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
});
```

And then inside DAL functions performing authenticated actions, call this authentication function that blocks the DAL if not authenticated.

```tsx file="dal/todos.tsx"
import "server-only"; // 🛡️ Prevents client-side usage
import { db } from "@/lib/db";
import { requireUser } from "./auth";

export async function getTodos() {
  // ✅ Auth check happens INSIDE the fetcher
  // Impossible to fetch data without being logged in
  const user = await requireUser();

  return await db.todo.findMany({
    where: { userId: user.id }
  });
}
```

#### DAL junior vs senior

A junior dev implementation of DAL would look something like this:

```ts
// ⚠️ data/todos.ts
import { redirect } from "next/navigation";

export async function getTodos() {
  const user = await getCurrentUser();
  if (!user) redirect("/login"); // 🔒 Hard-coded behavior
  
  return await db.query.todos.findMany();
}
```

- **pros**: simple, easy to use
- **cons**: not very reusable. For example, in API routes you may want to throw an error if the user is not authenticated, rather than redirecting.

So this is the senior implementation:

- **Concept:** The Data Access Layer should **only return data or errors**, never side effects (like redirects). It uses a standardized **Result Object** pattern. This allows the _consumer_ (the Page or the API) to decide how to handle the failure.

```tsx
// types.ts
// STEP 1) TYPES
type DalError = "NO_USER" | "NO_ACCESS" | "DB_ERROR" | "UNKNOWN";

export type DalResult<T> = 
  | { success: true; data: T }
  | { success: false; error: DalError };

// data/dal-helpers.ts
import { getCurrentUser } from "@/auth";

// STEP 2) HELPERS
// Wrapper for operations requiring Authentication
export async function dalRequireAuth<T>(
  callback: (user: User) => Promise<T>,
  roles: string[] = []
): Promise<DalResult<T>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "NO_USER" };

  if (roles.length > 0 && !roles.includes(user.role)) {
    return { success: false, error: "NO_ACCESS" };
  }

  try {
    const data = await callback(user);
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: "DB_ERROR" };
  }
}

// STEP 3) IMPLEMENTATION
// data/todos.ts
import "server-only";
import { db } from "@/db";
import { dalRequireAuth } from "./dal-helpers";

export async function getTodos() {
  // Wraps logic in Auth + Error handling
  return dalRequireAuth(async (user) => {
    return await db.query.todos.findMany({
      where: { userId: user.id }
    });
  });
}
```

Now you can reuse the same DAL implementations in server actions, server components, or route handlers, and then choose to either throw an error or redirect based on the result.

### Data fetching on pages

**The Mistake:** Fetching user data on the **Server** inside the root `layout.tsx` (e.g., for a Navbar).

> [!WARNING]
> **Consequence:** Because the Layout wraps _every_ page, fetching dynamic data there opts the **entire application** out of Static Site Generation (SSG). Every page becomes dynamic and slower.

**The Solution:** For layout components like Navbars, fetch user session data on the **Client Side** (or use a specific client-hook provided by your Auth library).

If one component is async and thus dynamic, every child of that component will also be dynamic and thus opt out of being statically rendered.

```tsx
// layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <body>
        {/* ✅ Navbar fetches auth on client, preserving static pages */}
        <NavbarClient /> 
        {children}
      </body>
    </html>
  );
}
```