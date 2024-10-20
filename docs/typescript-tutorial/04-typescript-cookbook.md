# Typescript Cookbook

## How to add onto the prototype

You can give type annotations for adding onto the prototype like so: 

```ts
// Tell TypeScript about .zip
declare global {
	interface Array<T> { 
	  zip<U>(list: U[]): [T, U][]
	}
}

// Implement .zip
Array.prototype.zip = function<T, U>(
  this: T[], 2
  list: U[]
): [T, U][] {
  return this.map((v, k) =>
    tuple(v, list[k]) 3
  )
}
```

To prevent being able to use the `array.zip()` method even when a file hasn't imported it, we can do a trick by requiring the developer to manually import the file like so: 

1. Exclude the file where you augment the prototype in the TS config
```json
{
  exclude: [
    "./zip.ts"
  ]
}
```
2. You are now forced to import the file.
```ts
import './zip'

[1, 2, 3]
  .map(n => n * 2)        // number[]
  .zip(['a', 'b', 'c'])   // [number, string][]
```