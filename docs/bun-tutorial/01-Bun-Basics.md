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

## `bun install`

`bun install` is the stand-in replacement for `npm install`

## `bunx`

`bunx` is the standard replacement for `npx` , used to run scripts or local dependencies without installing them. 

## `bun build`

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

## TypeScript 

By default, typescript with bun only works for server-side node and bun types. If you want to use typescript definitions in a browser context, like for `window` and `document`, put these triple slash directives at the top of any ts file that will get bundled into a browser js file: 

```typescript
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
```
