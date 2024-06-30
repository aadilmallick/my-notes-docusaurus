# Declaration files

Declaration files are used to provide type checking for certain globals and other types that you know will be defined in your codebase and you want to be globally available.

## Adding to prototype

In a `.d.ts` file, you can add global declarations of the prototype that will then have type intellisense. 

```typescript
interface HTMLElement {
  on(
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  off(
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  $(selector: string): Element | null;
  $$(selector: string): NodeListOf<Element>;
}
```

## Global variables

You can also declare global variables that you know will be available at runtime like so: 

```typescript
declare const tsvscode: {
  getState: () => any;
  setState: (state: any) => void;
  postMessage: ({
    command,
    payload,
  }: {
    command: string;
    payload: any;
  }) => void;
};
```

## Allowing file imports

When using a bundler like webpack or vite, you can also import different files directly into your typescript. Here is an example of importing in HTML, which allows you to import an HTML file and get back its content as a string.

```ts
declare module "*.html" {
  const value: string;
  export default value;
}
```