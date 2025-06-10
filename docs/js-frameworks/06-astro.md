## Astro basics

### File based routing

#### Layouts

Layouts in astro live in the `/layouts` directory, and they must be manually imported in each component to use them. It's better than the implicit, silent layout formatting that nextjs has.

Here is what a basic layout looks like:

```tsx title="layouts/Layout.astro"
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<meta name="generator" content={Astro.generator} />
		<title>Astro Basics</title>
	</head>
	<body>
		<slot />
	</body>
</html>

<style>
	html,
	body {
		margin: 0;
		width: 100%;
		height: 100%;
	}
</style>

```

#### Pages

Pages can either be a `.md`, `.mdx`, or `.astro` file. Pages should be in the `/pages` directory. 

- To have something like a `index.tsx` in filebased routing, the equivalent is `index.astro`. This means that the filepath `pages/dogs/index.astro` would be rendered on the `/dogs` route.
- If something is not named `index.astro`, its name will be the route path.

Here is what a basic astro page looks like:

```tsx title="pages/index.astro"
---
import Welcome from '../components/Welcome.astro';
import Layout from '../layouts/Layout.astro';

// Welcome to Astro! Wondering what to do next? Check out the Astro documentation at https://docs.astro.build
// Don't want to use any of this? Delete everything in this file, the `assets`, `components`, and `layouts` directories, and start fresh.
---

<Layout>
	<Welcome />
</Layout>

```

#### Markdown Pages

Markdown pages have frontmatter and look like this:

```ts
---
title: 'My First Blog Post'
pubDate: 2022-07-01
description: 'This is the first post of my new Astro blog.'
author: 'Astro Learner'
image:
    url: 'https://docs.astro.build/assets/rose.webp'
    alt: 'The Astro logo on a dark background with a pink glow.'
tags: ["astro", "blogging", "learning in public"]
---
# My First Blog Post

```

#### Dynamic route params

If you need to deal with dynamic route params, you would use file-based routing and put the route param name in brackets:

- `pages/blog/[id].astro`: matches the `/blog/:id` route
- `pages/blog/[...slug].astro`: matches the `/blog/*` route, matching any subpaths.

Then when in static generation mode, you must specify beforehand all the possible route params Astro should account for in its static generation of many dynamic route param pages. You do this trhough the special `getStaticPaths()` function:

```tsx
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/page.astro';

export const prerender = true;

export async function getStaticPaths() {
	const blogPosts = await getCollection('blog');

	return blogPosts.map((post) => {
		return {
			params: { slug: post.slug },
			props: { post },
		};
	});
}

// got the post from the props returned.
const { post } = Astro.props;

// get the markdown content from the post
const { Content } = await post.render();
---

<Layout>
	<h1>{post.data.title}</h1>
	<time datetime={post.data.date.toISOString()}>
		{post.data.date.toDateString()}
	</time>
	<Content />
</Layout>
```

You export the `getStaticPaths()` function, and it must return a list of objects, where each object has two keys:

- `params`: a key-value object of the route params and their values
- `props`: the props to pass into the astro component, fetching from `Astro.props`
#### Special pages

Here are some special pages you can have in astro:

- `/pages/404.astro`: renders a 404 page when there is a 404 error.

### Styling

Styling can be scoped to each astro component by just having a `<style>` tag. 

To have a global CSS, just put the `is:global` directive on the `<style>` tag.

### Island Architecture

#### Global state with nanostores

If your client side components are from different frameworks liek react and solid, then there is no way to share state between them. The way around this is to use the `nanostores` state management library.

The basic state in nanostores is the **atom**, and any variables that are atoms must be prefixed with a `$`.

```tsx
import {atom, computed} from "nanostores"

class StateManagerArray<T> {
	constructor(initialData: T) {
		this.$data = atom<T[]>(initialData)
	}

	set(newState: T[]) {
		this.$data.set(data)
	}

	get() {
		return this.$data.get()
	}

	add(data: T) {
		this.$data.set([...$this.$data.get(), data])
	}

	clear(data: T) {
		this.$data.set([])
	}

	createDerived<V>(cb : (state: T[]) => V) {
		return computed(this.$data, cb)
	}
}

class StateManager<T> {
	constructor(initialData: T) {
		this.$data = atom<T>(initialData)
	}

	set(newState: T) {
		this.$data.set(data)
	}

	get() {
		return this.$data.get()
	}
	
	createDerived<V>(cb : (state: T) => V) {
		return computed(this.$data, cb)
	}

}
```

#### Adding client interactity

By default, astro ships 0 JS. This means you have to explicitly enable javascript in client components with astro client directives:

- `client:only`: Hydrates the client component this directive is attached to on page load.
- `client:visible`: Hydrates the client component this directive is attached to when it is visible in the viewport.
- `client:idle`:  Hydrates the client component this directive is attached to when the page goes idle.
- `client:load`:  Hydrates the client component this directive is attached to in a blocking manner. Use only if hydrating this component is critical.

For all these directives, you must specify the client-side framework you are using through these strings:
	- `"solid-js"`: for solidjs
	- `"react"`: for react

```tsx title="page.astro"
<ClientComponent client:only="react" />
```

## Content collections

Content collections in astro are ways to define type-safe frontmatter for markdown. You specify content collections to live in the special `content` folder. 

All the important configuration for defining a schema will live the in the `src/content.config.ts` file:

```ts title="content/config.ts"
import { defineCollection, z } from "astro:content";

const tags = ["programming", "design", "productivity", "life", "tech"] as const;

export const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishedDate: z.coerce.date(),
    heroImage: z.string().optional(),
    tags: z.array(z.enum(tags)).default([]),
  }),
});
```

You can then fetch the collection programmatically like so:

```ts
---
import { getCollection } from 'astro:content';
const blogPosts = await getCollection('blog');

// gets the markdown content
const postContent = await blogPosts[0].render()
---
```

## SSR

Astro static renders by default, so if you need SSR there are two ways to enable it:

- **opt into SSR mode**: in the astro config, you can enable SSR for the entire astro site.
- **opt into hybrid rendering**: On the page level, you can specify whether you want a page to be statically generated or use server side rendering.

To enable server side rendering, you need to use an adapter that lets Astro create a server or serverless functions that work with the specific hosting provider, like Netlify or Vercel.

Here are the official adapters you can add first:

- **netlify**: `npx astro add netlify`
- **vercel**: `npx astro add vercel`
- **node**: `npx astro add node`, this command lets you deploy astro as a standalone server, powered by something like express.

### Adapters

#### Node adapter

This is what the astro config would look like to build astro as a separate server.

```ts
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  adapter: node({
    mode: 'standalone',
  }),
});
```

### Full SSR

To opt into full SSR, you need to change your astro config output to `"server"`:

```ts
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    output: "server"
});
```

You can then opt into SSG on specific pages by setting `prerender` to true:

```ts
export const prerender = true 
```
### Hybrid mode

Opting into hybrid mode is very easy and is actually the default.

Then you can specify the behavior of each page through exporting a special `prerender` variable:

```ts
export const prerender = false // use SSR
export const prerender = true // use SSG
```

- Setting `prerender = false` opts into SSR.
- Setting `prerender = true` opts into statically generating the site.