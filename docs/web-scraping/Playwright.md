
## Stagehand

Stagehand is the LLM version of playwright - it lets you prompt the LLM to scrape a web page, click buttons, and extract text.

In fact, the `page` object works the exact same as in playwright.

```ts
const page = stagehand.page;
await page.goto("https://docs.stagehand.dev");

// Use act() to take an action on the page
await page.act("Click the search box");

// Use observe() to plan an action before doing it
const [action] = await page.observe(
  "Type 'Tell me in one sentence why I should use Stagehand' into the search box"
);
await page.act(action);

// Cache actions to avoid redundant LLM calls!
await actWithCache(page, "Click the suggestion to use AI");
await page.waitForTimeout(2000);

// Use extract() to extract structured data from the page
const { text } = await page.extract({
  instruction: "extract the text of the AI suggestion from the search results",
  schema: z.object({
    text: z.string(),
  }),
});
```

### Stagehand basics

```ts
// You can use Stagehand tools to outline a specific workflow
const page = stagehand.page;
await page.goto("https://github.com/browserbase/stagehand");

await page.act("click on the contributors section");

const { title } = await page.extract({
	instruction: "the top contributor's username",
	schema: z.object({
		title: z.string(),
	}),
});

console.log(title);
```

### Stagehand agent

You can use stagehand's web-based agent

```ts
const page = stagehand.page;
await page.goto("https://github.com/browserbase/stagehand");

// Use a simple agent to automate a workflow
// You can save/replay these actions exactly the same way
const agent = stagehand.agent();
const { message, actions } = await agent.execute(
	"Extract the top contributor's username"
);

// Save/Replay your Stagehand actions
console.log(JSON.stringify(actions, null, 2));
console.log("Output:", message); // The agent's respons
```