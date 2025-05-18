
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

here is how you can load a google font.

```ts
import { Geist } from 'next/font/google'
 
const geist = Geist({
  subsets: ['latin'],
})
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.className}>
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

## Server Actions

Server actions are syntactic sugar in NextJS that from a normal javascript function running in node, creates an API route behind the scenes that is automatically executed when a user submits a form. The reason why they are called *Server Actions* is because you pass the server action to the `action=` attribute on a form, which then tells NextJS to create a POST API route with the path equal to the name of the server action function, and then immediately requests it. 

Here are the benefits of server actions over normal API routes you can make in NextJS:

- You get type safety since server actions are just normal javascript functions you import into your client components.
- You don't have to write cumbersome `fetch()` requests. Just set the `action=` prop on a form and set it to the server action function, and you're done.

### How to use server actions

Server actions are normal javascript functions that always get passed in a single argument of form data of type `FormData` and can return anything they want. However, to make normal node functions into server actions, you **must** use the `"use server"` directive at the top of the file containing all your actions code.

What the `"use server"` directive does is that it transforms what would otherwise be a normal JS function running in the node runtime into an HTTP route handler. Thus there are two important things that must be understood here:

1. You CAN ONLY use server actions in client components, and attach them to the `action=` prop on a `<form>` element.
2. You CANNOT use server actions in server components, since they are essentially HTTP route handlers and do not work outside of that context.

**step 1: create the form action**

In some arbitrarily named file like `actions.ts`, put a `"use server"` directive at the top of the file.

```ts
'use server'

interface ActionResponse {
	success: boolean;
	message: string;
	error?: string;
} 

export async function signIn(formData: FormData): Promise<ActionResponse> {

    // Extract data from form
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

	try {
		// save user logic
		return {
	      success: true,
	      message: 'User signed in successfully',
	    }
	}
	catch {
		return {
	      success: false,
	      message: 'An error occurred while signing in',
	      error: 'Failed to sign in',
	    }
	}
	
}
```

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

### Other ways to use server actions

Since server actions are just syntactic sugar for fetching an API route you make, you can invoke them anywhere, in any event handler like `onClick=` or as a result of a form submission with the `action=` prop.

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

## Caching

In NextJS 15, caching is heavily improved. To setup caching on the canary version of nextjs, do the following:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
}

export default nextConfig
```

Caching is done on the page level in the `page.tsx` component. NextJS forces you to explicitly define if you want a static cached page or a dynamic page.
### `"use cache"`

The `"use cache"` directive in NextJS 15 is the new way to opt into caching server-side.

The `"use cache"` directive when placed at the top of the file caches all the exports from the file, and when placed as the first line in a function, it caches the return value from that function, memoizing it.

To make a page cached forever with the **cache-first** strategy, use the `"use cache"` directive at the top of the `page.tsx`.

There are three ways you can cache:

1. Caching at the page level with `page.tsx`
2. Caching a React server component
3. Caching a function's return value

```tsx
// File level
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

To implement manual revalidation, you can used a tags-based approach that lets you revalidate content connected to a specific tag:

- `cacheTag(tag: string)`: caches the function/component under the specified tag
- `revalidateTag(tag: string)`: from the specified tag, removes the function from the cache.

You can also revalidate entire paths, if you cache at the page level:

- `revalidatePath(path: string)`: revalidates a page cached with `"use cache"`


#### 1) Caching at the page level

When you cache at the page level, you are telling NextJS to **statically prerender** that page, and to only dynamically regenerate by revalidating the cache manually, which you can do by revalidating the path or a tag.

> [!WARNING]
> Since `"use cache"` has buildtime behavior here, you CANNOT use dynamic data associated with requests like `cookies()` or `headers()`.

Remember to implement revalidation with `revalidatePath()` if you choose to cache at the page level.

```ts
'use server'
 
import { revalidatePath } from 'next/cache'
 
export async function createPost() {
  try {
    // ...
  } catch (error) {
    // ...
  }
 
  revalidatePath('/posts')
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
#### 3) Caching data fetching

You can cache async function calls with the `"use cache"` directive to cache the function's return value. To opt into caching the return values of functions, use the `"use cache"` directive at the first line of the function body.

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
  // after issue db insert
  revalidateTag('issues')
}
```

### Dynamic pages: `<Suspense>`

Using the `<Suspense>` component and rendering it anywhere within your `Page.tsx` tells NextJS that you want the page to be a dynamic route. 

> [!TIP]
> The best strategy is to push the `<Suspense>` as far down the rendering stack as possible so most of your app never re-renders - only the part that is necessary.

If you fetch data at the page level and want to wrap the whole page in a `<Suspense>`, there is syntactic sugar to do so via the special `loading.tsx` component within a route folder, which tells NextJS to wrap the entire `page.tsx` component within a `<Suspense>`, with the fallback being rendered with the content being whatever you default export from the `loading.tsx`



### memoizing

You can also use memoization to basically act as a cache if the function is called with the same arguments, using the `cache()` function from React. 

```ts
import { cache } from 'react'
import { db } from '@/app/lib/db'
 
// getPost will be used twice, but execute only once
export const getPost = cache(async (slug: string) => {
  const res = await db.query.posts.findFirst({ where: eq(posts.slug, slug) })
  return res
})
```

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

The most important thing to realize about middleware is that **they always run on the edge runtime**. Plan accordingly.

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

## NextJS Config

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

**experimental config**

**typescript config**

The typescript config goes under the `typescript` key:

- `typescript.ignoreBuildErrors` : if true, ignores tsc warnings during the build process, which prevents the build from failing due to errors.

**eslint config**

The typescript config goes under the `eslint` key:

- `eslint.ignoreDuringBuilds` : if true, ignores eslint warnings during the build process, which prevents the build from failing due to errors.
