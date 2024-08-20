---
title: Docusaurus notes
sidebar_position: 1
---

# Learn Docusaurus

## Basics

### Headings

- `h1` : an h1 heading in a markdown file becomes the page title of the sidebar and the page.
- `h2` and `h3` : up to `h3`, the headings will be shown on the right sidebar.

### pages

Create new pages in the `src/pages` directory. You can then reach these pages through a new HTTP route, which is just the file name. You can create pages using either react or plain markdown files.

- Creating a `src/pages/mymd.md` file will create a new page at `localhost:3000/mymd`.

Any javascript page creates inside the `pages` directory will be rendered as a new page on a new route.

If you don't want some files to be created as pages, prefix them with an `_`, like `_index.js`

### Docs

For pages to appear in the sidebar instead of a brand new route, add markdown files inside of the `docs` folder.

Full code block support is given, plus you can use the `title=` attribute to set the title of the code block

```jsx title="src/pages/my-react-page.js"
import React from "react";
import Layout from "@theme/Layout";

export default function MyReactPage() {
  return (
    <Layout>
      <h1>My React page</h1>
      <p>This is a React page</p>
    </Layout>
  );
}
```

### Code block features

#### Code block metadata: titles and copying

You can add metadata to configure the position of the page in the sidebar, and the title of the page.

```mdx title="src/pages/my-markdown-page.md"
---
sidebar_label: "Hi!"
sidebar_position: 3
---

# Hello

This is my **first Docusaurus document**!
```

- `sidebar_label` : The label of the page in the sidebar
- `sidebar_position` : The position order of the page in the sidebar. 1 means it will be the first page in the sidebar, and no position means it will be the last page.

You can also specify the number of line from the code block you want to copy, like so:

```md title="docs/hello.md" {1-4}
---
sidebar_label: "Hi!"
sidebar_position: 3
---

# Hello

This is my **first Docusaurus document**!
```

````md title="docs/hello.md"
```md title="docs/hello.md" {1-4}
---
sidebar_label: "Hi!"
sidebar_position: 3
---

# Hello

This is my **first Docusaurus document**!
```
````

- The `-` syntax specifies a range of copying. The `{1-4}` specifies we will copy from lines 1 through 4.
- Using a comma `,` specifies different lines of copying. The `{1,4}` specifies we will copy line 1 and line 4.

#### Code block highlighting

You can also do highlithing of lines in code blocks. This is accomplished with code comments, like these:

- `//highlight-next-line` : highlights the next line
- `// highlight-start` : Start of a highlighting secton. highlights all the lines until the next `// highlight-end` comment

````
```js
function HighlightSomeText(highlight) {
  if (highlight) {
    // highlight-next-line
    return 'This text is highlighted!';
  }

  return 'Nothing highlighted';
}

function HighlightMoreText(highlight) {
  // highlight-start
  if (highlight) {
    return 'This range is highlighted!';
  }
  // highlight-end

  return 'Nothing highlighted';
}
````

### Markdown features: Toggles

```md
### Details element example

<details>
  <summary>Toggle me!</summary>
  <div>
    <div>This is the detailed content</div>
    <br/>
    <details>
      <summary>
        Nested toggle! Some surprise inside...
      </summary>
      <div>😲😲😲😲😲</div>
    </details>
  </div>
</details>
```

<details>
  <summary>Toggle me!</summary>
  <div>
    <div>This is the detailed content</div>
    <br/>
    <details>
      <summary>
        Nested toggle! Some surprise inside...
      </summary>
      <div>😲😲😲😲😲</div>
    </details>
  </div>
</details>

### Markdown features: Callouts

There are 5 tiypes of callouts you cn use, all of them come with regular markdown syntax. Use the syntax below to create these callouts:

```md
:::tip My tip
Use this awesome feature option
:::

:::danger Take care
This action is dangerous
:::
```

:::tip My tip

Use this awesome feature option

:::

:::danger Take care

This action is dangerous

:::

- `:::tip` : creates a tip callout
- `:::danger` : creates a danger callout
- `:::note` : creates a note callout
- `:::caution` : creates a caution callout
- `:::info` : creates an info callout

### Using MDX

Inside `.mdx` files, you can create React components and render them inside your markdown.

```jsx title="src/pages/my-mdx-page.mdx"
export const Highlight = ({ children, color }) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: "20px",
      color: "#fff",
      padding: "10px",
      cursor: "pointer",
    }}
    onClick={() => {
      alert(`You clicked the color ${color} with label ${children}`);
    }}
  >
    {children}
  </span>
);

This is <Highlight color="#25c2a0">Docusaurus green</Highlight> !

This is <Highlight color="#1877F2">Facebook blue</Highlight> !
```

### Production

1. `npm run build` to build dist folder
2. `npm run serve` to view production build locally

## Blog posts

### Basic

All blog posts are under the `/blog` route.

We can tamper with the authors in the yamp file, or just define them like so.

```yml title="authors.yml"
aadil:
  name: Aadil Mallick
  title: Just That Guy
  url: https://github.com/aadilmallick
  image_url: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCuM8Mktsx7UMiSCv4GUpu4ajHLEb6-NMLFUrXQUcaew&s
```

We can create a blog post by naming it following a specific structure: create a folder with publication date, like `2023-07-04`, and then create an `index.md` file inside of it.

```md title="blog/2023-07-04/index.md"
---
slug: first-blog-post
title: My First Blog Post
authors: [aadil]
tags: [coding]
---

Hello, this text will be truncated because of the `<!-- truncate -->` separator. Everything above this tag will be shown in the blog post list and in the blog post page. Everything below will only be shown in the blog post page.

<!-- truncate -->

## Blog posts
```

Here is what the fields of the metadata represent:

- `slug` : the value of this is the route of the blog post after `/blog`, so this one will be available at `localhost:3000/blog/greetings`
- `title` : the title of the blog post. This will change what appears in the sidebar as well.
- `authors` : the authors of the blog post. You can set up your author in the yaml, and then just reference them here using their name.
- `tags` : the tags of the blog post. You can use these to filter blog posts in the sidebar.

Remember to also use the `<!-- truncate -->` separator to truncate the blog psot tet so that users only see an excerpt of text and not the whole thing.

### Using MDX

You can use MDX to make your blogs interactive with javascript.

## Changing site design

### docusaurus config

You can change most of the content in your site by going to the `docusaurus.config.js` file and changing stuff there. Here is an example of some of the stuff you can change:

- Title of the site
- Footer links
- Copyright footer text
- Remove "Edit this page" suggesstion

### css

In the `src/css/custom.css` file, you can change you sites theme by modifying the color css variables there.

### Extending docusaurus configuration

Inside the `docusaurus.config.js` file, you can add custom values inside the `customFields` object. You can then access these values in your react code using the `useDocusaurusContext` hook.

```js title="docusaurus.config.js" {3-6}
module.exports = {
  // ...
  customFields: {
    image: "",
    keywords: [],
  },
  // ...
};
```

```jsx title="src/pages/index.jsx" {2,5}
import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const Hello = () => {
  const { siteConfig } = useDocusaurusContext();
  const { title, tagline } = siteConfig;

  return <div>{`${title} · ${tagline}`}</div>;
};
```

## Latex

Follow the isntructions [here](https://docusaurus.io/docs/markdown-features/math-equations#configuration) to enable latex rendering in docusaurus

First install the dependencies:

```bash
npm install --save remark-math@3 rehype-katex@5 hast-util-is-element@1.1.0
```

Then make the following changes to your `docusaurus.config.js` file:

```javascript
const math = require("remark-math");
const katex = require("rehype-katex");

module.exports = {
  title: "Docusaurus",
  tagline: "Build optimized websites quickly, focus on your content",
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "docs",
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
      },
    ],
  ],
  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
      type: "text/css",
      integrity:
        "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
      crossorigin: "anonymous",
    },
  ],
};
```

## Markdown specific things

You can have markdown specific alert blocks that work great in all types of markdown.

[article](https://www.freecodecamp.org/news/how-to-create-notice-blocks-in-markdown/?ref=dailydev)

### Toggle

You can add toggle blocks by rendering HTML inside markdown like so: 

<details>  
<summary>Toggle me!</summary>  
  
This is the detailed content  
  
```js  
console.log("Markdown features including the code block are available");  
```  
  
You can use Markdown here including **bold** and _italic_ text, and [inline link](https://docusaurus.io)  
<details>  
<summary>Nested toggle! Some surprise inside...</summary>  
  
😲😲😲😲😲  
</details>  
</details>

```ts
<details>
  <summary>Toggle me!</summary>

  This is the detailed content!


  You can use Markdown here including **bold** and _italic_ text, and [inline link](https://docusaurus.io)
  <details>
    <summary>Nested toggle! Some surprise inside...</summary>

    😲😲😲😲😲
  </details>
</details>
```
### Callouts

All markdown processors support the markdown callout syntax. Below are the different blocks you can have. 

#### Note block

```md
> [!NOTE]
> I want the readers to read it carefully as it contains many important docs.
```

> [!NOTE]
> I want the readers to read it carefully as it contains many important docs.

#### Tip block

```md
> [!TIP]
> Use the command line to detect and resolve the errors!
```

> [!TIP]
> Use the command line to detect and resolve the errors!

#### Warning block

```md
> [!WARNING]
> DON'T DELETE THE `package.json` file!
```

> [!WARNING]
> DON'T DELETE THE `package.json` file!

#### Caution block

```md
> [!CAUTION]
> Don't execute the code without commenting the test cases.
```

> [!CAUTION]
> Don't execute the code without commenting the test cases.

#### Important block

```md
> [!IMPORTANT]  
> Read the contribution guideline before adding a pull request.
```

## MDX

Docusaurus markdown files have built in support for rendering React components and the like. 

Here is how you can basically create your own MDX component: 

1. Create a React component:

```ts title="src/components/Highlight.tsx"
import React from 'react';

export default function Highlight({children, color}) {
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: '2px',
        color: '#fff',
        padding: '0.2rem',
      }}>
      {children}
    </span>
  );
}
```

2. Import the component into your markdown file using the `@site` import alias for importing custom components

```ts title="docs/tutorial.md"
import Highlight from '@site/src/components/Highlight';

<Highlight color="#25c2a0">Docusaurus green</Highlight>
```

### Built in components

#### Tabs

```ts
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="apple" label="Apple" default>
    This is an apple 🍎
  </TabItem>
  <TabItem value="orange" label="Orange">
    This is an orange 🍊
  </TabItem>
  <TabItem value="banana" label="Banana">
    This is a banana 🍌
  </TabItem>
</Tabs>
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="apple" label="Apple" default>
    This is an apple 🍎
  </TabItem>
  <TabItem value="orange" label="Orange">
    This is an orange 🍊
  </TabItem>
  <TabItem value="banana" label="Banana">
    This is a banana 🍌
  </TabItem>
</Tabs>

