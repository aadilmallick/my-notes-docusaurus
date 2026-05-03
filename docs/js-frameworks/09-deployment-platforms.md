## Vercel

### Intro

1. Install vercel with this command:

```bash
npm install -g vercel
```

2. login to your vercel account using `vercel login`

```bash
vercel login
```


Anytime you want to deploy your app, use the `vercel --prod` command.

```json
{
  "scripts": {
    "deploy": "vercel --prod"
  }
}
```

Simply run `npm run deploy` to deploy your app.


### Essential commands

- `vercel switch`: switch vercel team accounts
- `vercel list`: list all vercel projects


### Linking existing projects

Link existing vercel projects to your local codebase with `vercel link`

### Ignoring typescript errors

Your files must be all error-free for typescript linting, otherwise vercel will not deploy your app. To do this, put a `//@ts-nocheck` comment at the top of all typescript files with errors in them.

Now you can deploy with `npm run deploy`
