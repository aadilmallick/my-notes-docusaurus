# Learning web performance

## Types of rendering patterns

### Client side rendering

Client-side rendering is where JavaScript is loaded and used to dynamically insert all the HTML for a website. 

- **pros**: benefits from caching
- **cons:** Bad for SEO, performance, and has large JS bundle size. 

### Server side rendering

HTML is generated on the server and sent to the client. 

- **pros:** super fast
- **cons:** not as dynamic as client-side rendering, and no soft navigations. 

### Static rendering

Static rendering is when the HTML for a page gets generated at build time and gets cached by the browser. This means the HTML lives right there in the browser cache, without any JavaScript to run and load it. 

This pattern is ideal for pages that don't change, like landing pages or About pages. 

#### Incremental static regeneration

Uses caching and cache invalidation to update static pages if any changes occur. 



## Core Web Vitals

The three core web vitals are LCP, DIF, and CLS, and we have to make sure we are in these ranges for these three performance benchmarks.

- **Largest contentful paint:** time it takes to render the largest element in the viewport
- **First input delay (FID):** Time it takes until the website is able to be interacted with
- **Cumulative layout shift:** How much elements shift layout around.

For these metrics, we have goal benchmarks we want to achieve:
- LCP: 2.5 - 4.0s
- FID: 100 - 300ms
- CLS: 0.1 - 0.25
### LCP

LCP measures the time it takes for the largest element on the viewport (part of the screen that’s visible) to be rendered.

> [!NOTE] 
> This is the most useful user-centric metric because it perfectly captures how fast a website feels to a user if the biggest thing is rendered quickly. If the biggest element is rendered quickly, users feel like the website loads fast.

A good measure for LCP is anything below 2.5 seconds. 

**Approaches to reduce LCP**

1. Use a server-side framework to avoid render blocking javascript so the LCP image can immediately be rendered instead of having to load the javascript first to render it. 
2. Set `fetchpriority="high"` on the LCP image to pre-download it and preload it by creating a preload link.

### FID

FID is the time it takes until the website is able to be interacted with. The main issue behind a large FID is render-blocking JS.

**Approaches to reduce FID**

1. Reduce render blocking JS by using workers or dynamic imports or code splitting.

### CLS

To avoid CLS, you need to prevent elements from shifting across the page all the time. You can achieve this by setting aspect-ratio appropriate `width=` and `height=` attributes on all `<img>` elements. 

## Images

### CLS with images

Always, always, always specify a `width=` and `height=` for the image, supplying the original dimensions of the image so the browser knows how to display the image based on its aspect ratio. 

### Lazy Loading

We can add `loading="lazy"` attribute to images to lazy load them, only loading them when they are about to be scrolled into the viewport.


> [!WARNING] 
> Do not use lazy loading on your LCP image. It changes the fetch priority to low.


### fetchpriority

The `fetchpriority` attribute determines the priority of a resource in the browser download queue.

We can set images in LCP with a `fetchpriority="high"` to immediately download them, and set things below the fold with a `fetchpriority="low"` .

```html
<link rel="preload" href="lcp.png" as="image" fetchpriority="high" />
```

### Resizing and optimizing images

The first step is to create multiple copies of our images, all resized for different viewport sizes. 

```js
/**
 * PNG Resizer
 * Fundamentals of Web Performance
 *
 * Build tool to generate responsive sizes for all the images on the size and
 * put in the `r` directory.
 * @see https://jimp-dev.github.io/jimp/
 */

import { parse } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { Jimp } from "jimp";
import { glob } from "glob";

const imageFolderPath = `public/assets/img`

const filePaths = await glob(`${imageFolderPath}/*.png`)
const widths = [360, 720, 1024, 1400, 2800];

console.log("Generating Responsive Images");


await mkdir(`${imageFolderPath}/r`, { recursive: true });

filePaths.forEach(async (path) => {
  widths.forEach(async (width) => {
    const sourcePath = parse(path);
    const file = await Jimp.read(path);
    const resizedFile = await file.resize({ w: width });
    await resizedFile.write(`${imageFolderPath}/r/${sourcePath.name}-${width}${sourcePath.ext}`);
  });
});
```

Then the next step is to optimize them

```js
/**
 * PNG Optimizer
 * Fundamentals of Web Performance
 *
 * Build tool to optimize the PNG images and place them in the `min` directory.
 *
 * If images have already been resized, the responsive images will be optimized
 * as well.
 *
 * @see https://www.npmjs.com/package/imagemin
 */

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

console.log("Optimizing PNG Images");

const imageFolderPath = `public/assets/img`

await imagemin([`public/assets/img/**/*.png`], {
  destination: 'public/assets/img/min',
  plugins: [
    imageminPngquant({
      quality: [0.6, 0.8]
    })
  ]
});
```

Then the next step is to convert them into webP.

```ts
/**
 * WebP Converter
 * Fundamentals of Web Performance
 *
 * Build tool to optimize convert the optimized PNGs in the `min` directory
 * into WebP files, placed in the `webp` directory.
 *
 * @see https://www.npmjs.com/package/imagemin
 */

import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

console.log("Converting to WebP Images",);

await imagemin(['public/assets/img/min/**/*.png', 'public/assets/img/*.png'], {
  destination: "public/assets/img/webp",
  plugins: [
    imageminWebp({ quality: 50 })
  ]
});
```
## Get better at performance

### Performance tools

Do an audit of your site at https://pagespeed.web.dev/. Also go here: https://speedvitals.com/
### Improve time to first byte

You can improve time to first byte via these three methods: 

1. Use HTTP 3 over HTTP 2
2. Enable GZIP and Brotli compression on your server. 
3. Use a CDN

#### HTTP3 vs HTTP2

HTTP 2 uses TCP connections, which is a redundant way of communicating ensuring lossless transfer of data. 

HTTP3 uses UDP connections, which is just the server rapid-firing sending data to the user in a lossy manner, resending packets where they were lost. 


> [!NOTE] 
> Try to use HTTP3 over HTTP2 whenever possible

#### Speculative loading

Speculative loading comes in two flavors: 

- **prefetching or prerendering**: prefetch or prerender pages in your app using the speculation rules api
- **preconnect**: preconnect to websites that you will fetch from in your app

Here is how you can you make a preconnect link:

```html
<link rel="preconnect" href="https://example.com" />
```

However, preconnecting is pretty expensive and should only be used for absolutely critical connections. For less critical connections, you should use the `rel="dns-prefetch"` to perform an inexpensive DNS lookup:

```html
<link rel="dns-prefetch" href="https://example.com" />
```


#### GZIP and Brotli

Enabling GZIP and Brotli compression for your assets is as simple as your server sending down a header to use gzip or brolti for that asset. 

Here is an express middleware that does it all: 

```ts
const compression = require('http-compression')
const express = require('express')

express()
  .use(compression({ 
	  // sensible defaults are already provided
	}))
  .use((req, res) => {
    // this will get compressed:
    res.end('hello world!'.repeat(1000))
  })
  .listen(3000)
```

#### CDN

A CDN is a cache devilery network that basically stores a copy of your website in a region of your choice. For example, your server might be living in LA, but if you want to serve users in Australia without delay, you need a CDN set up somewhere in Australia. 

The first time the user requests the CDN, it will be a cache miss and the CDN will have to take the long way around to request from the original server, but then it will have stored the copy of the website inside it and all succeeding requests will be cache hits. 

### Improve FCP

To improve FCP, we need to do these three things: 

1. Remove sequence chains
2. Preload resources
3. Lazy load render-blocking JS

#### Remove sequence chains

You need to eliminate any dependencies in render-blocking resources like CSS and fonts, because if we do so, then we can parallelize downloading them. 

For example, if your CSS requests a Google Font via URL and then requests another local CSS file via `@import()`, then you will create a dependency chain that is impossible to parallelize. 

The solution is to create a single bundle for your CSS that includes all its dependencies inside it, so instead you just make 1 request to one massive thing instead of 5 requests to 5 semi-massive things that can't be parallelized. 

#### Preload resources

It's important to preload resources on the internet, like google fonts, CDNs, and external stylesheets. 

Here are the attributes you should put on a `<link>` tag to make it preload a resource:

- `rel="preload"` : declares the link tag as a preload link
- `href=` : the resource to preload
- `as=` : tells the browser what type of resource you are preloading, like `"image"` , `"css"` , or `"font"`
- `crossorigin`: needed if you are requesting a resource over the internet. Otherwise it should be omitted. 

```html
<link rel="preload" href="lcp.png" as="image" />
```

The `as=` can have these values:

- `fetch`: Resource to be accessed by a fetch or XHR request, such as an ArrayBuffer, WebAssembly binary, or JSON file.
- `font`: Font file.
- `image`: Image file.
- `script`: JavaScript file.
- `style`: CSS stylesheet.

If you are trying to preload a javascript file, it's better to use think link below, which handles loading javascript modules well:

```html
<link rel="modulepreload" href="main.js" />
```

Preload rules:

1. When everything is important, nothing is important. Only use preload to improve LCP, like preloading the hero image


> [!TIP] 
> If you have `fetchpriority="high"` on an image, then you don't need to preload that image. 



#### Lazy loading JS

To lazy load JS and prevent it from being render blocking, put on it the `type="module"` or `defer` attribute.

### Improve LCP

There are three things we need to do to improve LCP:

1. Lazy load all non-LCP images and content
2. Eager load all above-the-fold content and LCP images.
3. Optimize images (compress them and serve them as webp)

#### Lazy loading non-LCP images

Just add the `loading="lazy"` attribute to load any non-LCP image, even if it's above-the-fold.

#### Eager load LCP images

Just use `fetchpriority="high"` on the LCP image

#### Optimize images

We need to serve different size images depending on the viewport size: 

The `<picture>` element is a way of swapping out higher and lower resolution images to gain higher performance on mobile devices.

```html
<picture>
  <source media="(min-width: 650px)" srcset="img_food.jpg">
  <source media="(min-width: 465px)" srcset="img_car.jpg">
  <img src="img_girl.jpg">
</picture>
```

You nest `<source>` and `<img>` elements in a picture element.

- `<source>` : a conditional image that will render an image based on the media query provided in `media` and the filepath provided in `srcset`.
- `<img>` : the default fallback for when none of the media queries match the source tags.

### yield back to main thread

Use `await scheduler.yield()` to break up long tasks, even if async, and yield back to the main thread. This helps keep the website responsive even as a long-running task is going on. 

![diagram example](https://www.webpagescreenshot.info/image-url/FRHJUMmwG)

```ts
async function this_func_takes_10_secs() {
	// do some work
	await scheduler.yield()
	// do some work
	await scheduler.yield()
	// do some more work
}
```

Here is a way to batch jobs and run them one at a time, yielding every 50ms:

```ts
async function runJobs(jobQueue : Function[], deadline=50) {
  let lastYield = performance.now();

  for (const job of jobQueue) {
    // Run the job:
    job();

    // If it's been longer than the deadline, yield to the main thread:
    if (performance.now() - lastYield > deadline) {
      await scheduler.yield()
      lastYield = performance.now();
    }
  }
}
```

### use speculation rules

#### Intro

Speculation rules can prerender or prefetch pages in a MPA like so:

```html
<script type="speculationrules">
  {
    "prerender": [
      {
        "where": {
          "and": [
            { "href_matches": "/*" },
            { "not": { "href_matches": "/logout" } },
            { "not": { "href_matches": "/*\\?*(^|&)add-to-cart=*" } },
            { "not": { "selector_matches": ".no-prerender" } },
            { "not": { "selector_matches": "[rel~=nofollow]" } }
          ]
        }
      }
    ],
    "prefetch": [
      {
        "urls": ["next.html", "next2.html"],
        "requires": ["anonymous-client-ip-when-cross-origin"],
        "referrer_policy": "no-referrer"
      }
    ]
  }
</script>
```

- **prefetching**: downloads the html of the page, but none of the subresources in that page
- **prerendering**: loads an invisible tab and basically invisibly renders that entire page, putting it in the cache. Navigation to that page and page load will be instant. 

#### In depth

The speculation rules API tries to prerender an entire page before a user navigates to it leading to instant navigation times. 

It only works with multipage apps since you can only prerender multipage apps, and it only works with prefetching links from the same origin. 

```html
 <script type="speculationrules">
  {
    "prerender": [
	      {
	          "urls": ["fish.html", "vegetatian-pho.html"]
	      }
      ]
  }
</script>
```

You can also specify matches to URLs based on regex patterns or css selectors with the `"where"` key

```html
 <script type="speculationrules">
  {
    "prerender": [
	      {
	          "where": {
		          "href_matches": "/*"
	          }
	      }
      ]
  }
</script>
```

```html
 <script type="speculationrules">
  {
    "prerender": [
	      {
	          "where": {
		          "selector_matches": ".prerender"
	          }
	      }
      ]
  }
</script>
```

You can also combine multiple conditions into one with the `where.and` key

```html
<script type="speculationrules">
{
  "prerender": [{
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": {"href_matches": "/wp-admin"}},
        { "not": {"href_matches": "/*\\?*(^|&)add-to-cart=*"}},
        { "not": {"selector_matches": ".do-not-prerender"}},
        { "not": {"selector_matches": "[rel~=nofollow]"}}
      ]
    }
  }]
}
</script>
```

**Eagerness settings**

You can dial in how fast speculation rules apply to your website. There are 4 settings, which you can set with the `"eagnerness"` key:

- **immediate:** Speculation rules immediately apply
- **eager:** a little less than immediate
- **moderate:** Speculation rules apply only after a user hovers over a link for 200 ms.
- **convservative:** Speculation rules apply only after the user clicks on a link


> [!WARNING] 
> There is an obvious tradeoff between a higher level of eagerness and page performance. Only do immediate eagerness on lightweight static sites where there is little to no overhead, and go for lower levels of eagerness on bigger, complex sites.


There is a limit on the number of rules you can have: 10 for prerender, 50 for prefetch. 

**Dynamically adding speculation rules with javascript**

```jsx
if (HTMLScriptElement.supports &&
    HTMLScriptElement.supports('speculationrules')) {
  const specScript = document.createElement('script');
  specScript.type = 'speculationrules';
  specRules = { 
    prerender: [
      {
        urls: ['/next.html'],
      },
    ],
  };
  specScript.textContent = JSON.stringify(specRules);
  console.log('added speculation rules to: next.html');
  document.body.append(specScript);
}
```