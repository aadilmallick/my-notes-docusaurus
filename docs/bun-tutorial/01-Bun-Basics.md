# 01: Bun basics

## `bun init`

To initialize a `package.json` along with other project specifications, run the command `bun init`, which also sets up typescript in your project

## `bun run`

`bun run` is the stand-in replacement for the `npm run` command, used to run scripts or individual files.

However, where it differs is in automatic support for watch mode and hot reload with these options: 

- `--watch` : runs the file in watch mode, restarting state
- `--hot` : runs the file with hot reloading, keeping current state

The difference between watch mode and hot reload is that watch mode is *stateless*, meaning any state it has is reinitialized when it reloads the file, as opposed to hot reloading, which keeps the state. 

### Environment variables 

All environment variables from any `.env` files are automatically loaded into `process.env`, so just use `process.env` to access any environment variables. 

You can also set environment variables in scripts, like so by setting it in front of the command you're trying to run.

```json title="package.json"
{
  "scripts": {
    "dev": "NODE_ENV=development bun run --watch index.ts"
  }
}
```

You can also manually specify env files to load with the `--env-file=` option:

```bash
bun --env-file=.env.abc --env-file=.env.def run build
```


### running HTML files

Bun has first class support for running html files, which works exactly like **live server** does for VSCode. This is great because you don't have to set up a server for simple frontend development.

```bash
bun index.html
```

All references to TSX and CSS in your HTML code will just work and compile out of the box.

You can also specify multiple index HTML entrypoints by manually adding them or specifying through a globa pattern.

![](https://i.imgur.com/4LXoYIR.png)


## `bun install`

`bun install` is the stand-in replacement for `npm install`

## `bunx`

`bunx` is the standard replacement for `npx` , used to run scripts or local dependencies without installing them. 

## JSX

Bun supports JSX out of the box, but you can specify options in your `tsconfig.json` to support using different frameworks like preact or solidjs.

Here are the key configuration fields in the `tsconfig.json` to do:

- `jsx`: Controls how JSX is transpiled. Options include `"react"`, `"react-jsx"`, and `"react-jsxdev"`
-  `jsxImportSource`: Module for JSX runtime when `jsx` is `"react-jsx"` or `"react-jsxdev"` (e.g., `"preact"`) .

You can also set pragmas on an individual file if you want to avoid overriding for all JSX files:

```ts
// @jsxImportSource preact
```

The most important thing to realize here is that you can only change the JSX import source if the `jsx` setting is set to `"react-jsx"` or `"react-jsxdev"`

## `bun build`

### CLI

```json
{
	"scripts": {
		"build": "bun build --outdir=./dist --watch ./src/app.ts ./src/sw.ts"
	}
}
```

- `--outdir` : the directory to put the bundle files into
- `--watch` : builds in watch mode

The other arguments are the entrypoints for bundling. Each entrypoint outputs to 1 js bundle file. 

### Building CSS

You can use `bun build` to compile CSS linking/importing other CSS files into one large, production-optimized CSS file:

```css title="main.css"
@import "foo.css";
@import "bar.css";
```

Just like other bundlers, you can simply import your CSS into your JS or TS to make it work and then build with the TS as the entry point:

```ts
import "./style.css";
import MyComponent from "./MyComponent.tsx";

// ... rest of your app
```

### compiling to binary

You can use the `bun build --compile` option to compile a tyepscript entry point into a binary for windows or mac.

```bash
bun build --compile --target=bun-windows-x64 app.ts
```

Here are the options you can configure:

- `--windows-icon=`: for this option you pass the filepath to `.ico` file you want to be the icon for the binary
- `--windows-hide-console`: If set, then the console window will not be shown when executing the binary.
- `--bytecode`: makes your app startup faster by compiling to bytecode.
- `--minify`: makes the app executable smaller by minifying your code
- `--sourcemap`: builds a source map
- `--outfile <file>`: lets you name the executable

**building for mac**

```bash
bun build --compile --target=bun-darwin-arm64 ./path/to/my/app.ts --outfile myapp
```

**building for production**

Here are the best options to use when building for production:

```bash
bun build --compile --minify --sourcemap --bytecode ./path/to/my/app.ts --outfile myapp
```

### Using `Bun.build()`

The `Bun.build()` method is a powerful API that lets you bundle your frontend code at blazing speed. It works with TS entrypoints, HTML entrypoints, and even CSS entrypoints. 

```ts
await Bun.build({
  entrypoints: [path.join(import.meta.dir, "frontend", "index.html")],
  outdir: path.join(import.meta.dir, "dist"),
});
```

Here are all the options you can pass in to configure the build:

- `entrypoints`: **required**. A list of entrypoints to build from
- `outdir`: **required**. the path to the directory you want the bundle to go to.
- `target`: the environment to build for. Here are the values you can pass:
	- `"bun"`: build for bun
	- `"node"`: build for node
	- `"browser"`: build for the browser
- `minify`: whether to minify the bundle, a boolean. The default is `false`

## TypeScript 

By default, typescript with bun only works for server-side node and bun types. If you want to use typescript definitions in a browser context, like for `window` and `document`, put these triple slash directives at the top of any ts file that will get bundled into a browser js file: 

```typescript
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
```

## Important API notes

Bun supports most web standards while also offering node compatibility. This leads to a lot of important details when it comes to Bun vs Node:

### Bun vs Node

Bun prefers the ES6 syntax of using the `import.meta` instead of `__dirname`, so use that.

### Supported web standards

- request and response web standards
- text decoder

### Importing JSON files

You can import JSON files into your bun code directly as javascript objects to use:

```ts
import json from "./package.json" with { type: "json" };
typeof json; // "object"

import html from "./index.html" with { type: "text" };
typeof html; // "string"

import toml from "./bunfig.toml" with { type: "toml" };
typeof toml; // "object"
```