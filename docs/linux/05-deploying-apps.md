## Vercel


Here is an example of how to deploy express with vercel: https://github.com/vercel/examples/tree/main/solutions/express

### How to use vercel

1. Install Vercel CLI globally if you haven't already:

   ```bash
   npm install -g vercel
   ```

2. Login to vercel with `vercel login` command.
3. Create a new project with `vercel dev` command. This will create a `.vercel` directory in your project root.

### `vercel dev`

The `vercel dev` command is used to set up your vercel project, configure deployment settings, and start a local development server.

### `vercel`

The `vercel` command is used to deploy your project to the Vercel platform. It will automatically detect your project settings and deploy it to the cloud.

### Express with vercel complete steup guide

Express with vercel adapts express routes to be serverless functions, which means on each request the server is instantly fired up from a cold start.

This is could lead to millions of requests easily, so build express apps for vercel keeping in mind techniques like pooling, and avoid global state in a server.

1.  Create this `vercel.json` pointing to the entrypoint of your express app.

    ```json
    {
      "version": 2,
      "builds": [{ "src": "api/server.js", "use": "@vercel/node" }],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "api/server.js"
        }
      ]
    }
    ```

2.  Create a basic express app in your entrypoint and make it a default export.

    ```javascript
    // api/server.js

    import express from "express";

    const app = express();

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    export default app;
    ```

3.  Create a `package.json` file with a start script that begins your express server.

    ```json
    {
      "scripts": {
        "start": "node api/server.js"
      }
    }
    ```

