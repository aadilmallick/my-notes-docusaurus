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

