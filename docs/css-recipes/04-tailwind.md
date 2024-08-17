## Tailwind merge + clsx

1. `npm i tailwind-merge`
2. `npm i clsx`

```ts
import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```