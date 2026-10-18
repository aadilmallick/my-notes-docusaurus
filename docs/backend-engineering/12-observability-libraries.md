## Sentry

### Project basics

1. Create a new project by connecting it to your Github Repo and selecting the framework of use, like nextjs
2. Register your sentry project with the sentry wizard like so:

```bash
npx @sentry/wizard@latest -i nextjs --saas --org aadil-mallick --project sat-question-tutor
```

3. Start your development server and visit `/sentry-example-page` if you have set it up. Click the button to trigger a test error.

Or just thell your AI to do it for you:

```
Use curl to download, read and follow https://skills.sentry.dev/instrument to set up the Sentry Next.js SDK.
```

## PostHog