
## Netlify

### Netlify TOML

`netlify.toml` is Netlify's project configuration file.

You generally put it at the root of your repository:

```
my-project/
├── netlify.toml
├── package.json
├── src/
└── netlify/
    └── functions/
```

It lets you put deployment configuration **in version control alongside your application**.

### Basics

For example:

```
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
```

Instead of configuring those settings manually in the Netlify dashboard, they're encoded in your repository.

> [!NOTE]
> Configuration in `netlify.toml` takes precedence over conflicting configuration in the Netlify UI.

Here's an example `netlify.toml` and what each key means:

- `[build]`: defines the build command and the output dist artifact folder to use and deploy
- `[functions]`: Defines the path to the directory that contains the netlify cloud functions for this app.
- `[dev]`: defines the development configuration for running the app
- `[[redirects]]`: defines the URL rewrites for the app, which is useful for static sites that use client-side routers like React router or proxying a route path to direct that traffic isntead to a netlify cloud function, calling it like an API.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[dev]
  command = "npm run dev"
  port = 5173

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

The `[[redirects]]` key lets  you query the `/api/users` route from your frontend and then redirects that to invoke the function code at `/.netlify/functions/users`.


### Netlify Runner configuration

#### Node environment

You can add files to the root of your project to change the node version and environment for the runner checking out your source code and building it. 


All three of these files achieve the exact same result:

- `.nvmrc`: set the node version the runner should install

```bash title=".nvmrc"
26
```

- `.node-version`: Same thing as `.nvmrc`.
- `netlify.toml`: you can set the node version like so:

```toml title="netlify.toml"
[build.environment]
  NODE_VERSION = "26"
```

You can also change the environment and how the runner installs and builds you code with environment variables set in the runner:

- `NODE_ENV`: If you set the `NODE_ENV` to `production`, any `devDependencies` in your `package.json` file will _not_ be installed for the build.

### Netlify functions

#### Basic functions

1. 