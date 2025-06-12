
## Playwright

### Intro

1. Run `npm init playwright@latest` to initialize playwright in your repo
2. Run `npx playwright test` to test your application

**playwright code**

```jsx
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('<https://playwright.dev/>');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('<https://playwright.dev/>');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
```

Each test in playwright follows this format:

```jsx
import { test, expect } from '@playwright/test';

test('test title', async ({ page }) => {
  // do stuff with the page
  // have expect statement
});
```

### CLI

- `playwright test` : runs the end to end test. Here are additional options you can pass:
    - `--ui` : adds an interactive UI for seeing how the test works

### **page object**

The `page` object has properties related to the window element, and includes navigation, fetching DOM elements, and querying page titles. Here are some useful methods and properties the `page` object has, which are all async.

- `page.goto(url)` : navigates to the specified URL
- `page.locator(selector)` : fetches the element with the specified CSS selector.
- `page.click(selector)` : clicks the specified element queried by CSS selector
- `page.fill(selector, value)` : fills the specified element queried by CSS selector with the specified value.

### playwright testing

#### Best practices

Instead of using the plain page object to fetch elements and assert stuff related to those elements, we can use a more maintainable approach of wrapping each page in a class dedicated for its own route and elements.

1. Create a class that takes in a page object into its constructor
    
    ```jsx
    
    class ClusterPage {
      constructor(public page: Page) {}
    	
    	// navigation
      async goto(
        params: { size?: number; distance?: number; } = {}
      ) {
        const url = new URL("<http://localhost:5173/clustering/>");
        if (params.size) url.searchParams.set("size", params.size.toString());
        if (params.distance)
          url.searchParams.set("distance", params.distance.toString());
        return await this.page.goto(url.toString());
      }
    	
    	// interaction
      async setClusterParams(
        size: number,
        distance: number,
      ) {
        await this.page.fill('input[name="size"]', size.toString());
        await this.page.fill('input[name="distance"]', distance.toString());
        await this.page.click('button[type="submit"]');
      }
    	
    	// getting elements
      get title() {
        return this.page.title();
      }
    
      get size() {
        return this.page.locator("span.size");
      }
    
      get distance() {
        return this.page.locator("span.distance");
      }
    }
    ```
    
2. Use that class in your tests instead of the normal page object.
    
    ```jsx
    test("it prints current parameters", async ({ page }) => {
      const clusterPage = new ClusterPage(page);
      await clusterPage.goto({
        size: 100,
        distance: 10,
      });
      await expect(clusterPage.size).toHaveText("100");
      await expect(clusterPage.distance).toHaveText("10");
    });
    ```

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