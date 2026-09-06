## Vite

### tsconfig paths

If you want the TS config paths aliases to work via the `compilerOptions.paths` option for easier imports, and you're using Vite, please follow these instructions to the letter:

1. In `tsconfig.json` add your path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@amplify/*": ["./amplify/*"]
    }
  }
}
```

```json title="tsconfig.json"
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@amplify/*": ["./amplify/*"]
    }
  }
}
```

2. Add the `compilerOptions.paths` to the `tsconfig.app.json` as well

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@amplify/*": ["./amplify/*"]
    }
  },
  "include": ["src"]
}

```

3. Install the `vite-tsconfig-paths` Vite plugin, which automatically tells vite to use tsconfig paths for module aliases.

```bash
npm install vite-tsconfig-paths --save-dev
```

4. Add the plugin to the vite plugin list in the `vite.config.ts`

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});

```