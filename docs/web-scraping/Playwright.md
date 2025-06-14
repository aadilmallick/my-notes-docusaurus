
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

In playwright, you have two main objects: the page and locator.

- **page**: represents a page on an origin and able to perform DOM operations to that page
- **locator**: You can use pages to query for locators, which are representations of individual HTML elements.

Below is the API for using playwright with page and locator objects in testing.
#### Api

Playwright has a lot of the common assertion methods that we saw in Vitest. But it also has a few additional ones that are specific to Playwright.

- [`expect(locator).toBeChecked()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-checked): The checkbox is—umm—checked.
- [`expect(locator).toBeDisabled()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-disabled): The element is disabled.
- [`expect(locator).toBeEditable()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-editable): The element is editable.
- [`expect(locator).toBeEmpty()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-empty): The element is empty—as in, it has no children.
- [`expect(locator).toBeEnabled()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-enabled): The element is enabled (a.k.a. _not_ disabled).
- [`expect(locator).toBeFocused()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-focused): The element is focused.
- [`expect(locator).toBeHidden()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-hidden): The element is not visible. It's hidden.
- [`expect(locator).toBeInViewport()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-in-viewport): Is the element actually in the screen right now or is it something you'd have to scroll to get to.
- [`expect(locator).toBeVisible()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-visible): Element is visible. You know, it's not hidden or using `display: none;` or some other shenanigans.
- [`expect(locator).toContainText()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-contain-text): The element contains some test that you generously provided.
- [`expect(locator).toHaveAttribute()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-attribute): The element has a particularly DOM attribute.
- [`expect(locator).toHaveClass()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-class): The element has a specific CSS class.
- [`expect(locator).toHaveCount()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-count): The number has exactly _this_ many children.
- [`expect(locator).toHaveCSS()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-css): Specific CSS property.
- [`expect(locator).toHaveId()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-id): The element has a particular ID.
- [`expect(locator).toHaveJSProperty()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-js-property): The element has a JavaScript property.
- [`expect(locator).toHaveScreenshot()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-1): We have a screenshot of this element.
- [`expect(locator).toHaveText()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-text): The element has exactly this text.
- [`expect(locator).toHaveValue()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-value): There is some value in this particularly input field.
- [`expect(locator).toHaveValues()`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-values): This is used with a `<select />` or other element that allows for multiple selections.

There are also a few things that we get from the page itself.

- [`expect(page).toHaveScreenshot()`](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1): The page has a screenshot.
- [`expect(page).toHaveTitle()`](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-title): The page has a particular title
- [`expect(page).toHaveURL()`](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url): The page is located at a given URL.

We can also check in our our API responses and make sure that they are okay.

- [`expect(apiResponse).toBeOK()`](https://playwright.dev/docs/api/class-apiresponseassertions#api-response-assertions-to-be-ok): Response has an OK status

# Soft Assertions

Soft assertions will make a note that something didn't go as planned, but won't fail the test.

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

#### Recording network requests

With Playwright, you can record network requests into a HAR file.

You can either do that from the CLI:

```
npx playwright open --save-har=network-requests.har --save-har-glob="**/api**" http://localhost:3000
```

Or, from Playwright itself.

```ts
const context = await browser.newContext({
  recordHar: {
    mode: 'minimal',
    path: './network-requests.har',
  },
  serviceWorkers: 'block',
});
```

## Replaying

```ts
await browserContext.routeFromHAR(har);
await browserContext.routeFromHAR(har, { update: true });
await browserContext.routeFromHAR(har, { update: true, url: '**/api**' });
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