# 14: deploying on vercel

```bash
npm install -g vercel
vercel login
```

Use the `vercel login` command to login into vercel.

Anytime you want to deploy your app, use the `vercel --prod` command.

```json
{
  "scripts": {
    "deploy": "vercel --prod"
  }
}
```

Simply run `npm run deploy` to deploy your app.

## Ignoring typescript errors

Your files must be all error-free for typescript linting, otherwise vercel will not deploy your app. To do this, put a `//@ts-nocheck` comment at the top of all typescript files with errors in them.

Now you can deploy with `npm run deploy`

```ts

```
