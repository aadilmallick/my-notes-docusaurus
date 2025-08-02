
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

### Playwright in docker

To get playwright running in docker, you ahve different options:

1. Use an official playwright image with all the dependencies already installed
2. Use a compatible image like ubuntu
3. Do alpine, with extra steps

#### Alpine

To get docker working with alpine, you must omit playwright and instead use the `playwright-core` npm package, manually passing in an executable path:

```dockerfile
ARG NODE_VERSION=24.0.2


################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine



# 1. Add Alpine edge repos (to get the latest Chromium) and install Chromium + its deps
RUN echo "https://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
 && echo "https://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
 && apk update \
 && apk add \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      font-noto-emoji \
      libstdc++ 

# 2. Tell Playwright to skip downloading its own browsers,
#    and point it at the system Chromium executable
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# (optional) If you want Playwright’s helper to install any additional deps:
RUN npx -y playwright@latest install-deps || true


# rest of the image ...
```

You can then initialize playwright like so:

- The chromium path on alpine (in the docker container) is located at `/usr/bin/chromium-browser`.

```ts
import { chromium } from 'playwright-core'

export async function getBrowser() {

  // if in docker, point to path on alpine, else point to local version.
  const executablePath = process.env.IN_DOCKER_CONTAINER 
	  ? '/usr/bin/chromium-browser' 
	  : chromium.executablePath()
	  
  const browser = await chromium.launch({
    headless: true,
    executablePath: executablePath,
  })

	return browser
}
```

#### with proxy



### CLI

- `playwright test` : runs the end to end test. Here are additional options you can pass:
    - `--ui` : adds an interactive UI for seeing how the test works

### Browser object

You can create a basic browser like so:

```ts
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
```

Here are the options you can pass in when creating a browser with `chromium.launch()`

- `headless`: If true, spins up in headless mode, if false, opens a visible browser window.
- `executablePath`: the executable path of the chromium executable to run instead of using playwright's default one.

You can create a **page** object, which lets you interact with the website as a tab and scrape it, by calling the `browser.newPage()` method:

```ts
const page = await browser.newPage()
```

#### Creating pages and browsers effectively

It's bad practice to keep spinning up browsers and then shutting them down frequently in playwright, since each chromium launch takes up a lot of resources.

```ts
export const browserSingleton = {
  browser: null as Browser | null,
  closeBrowser: async () => {
    if (browserSingleton.browser) {
      await browserSingleton.browser.close()
      browserSingleton.browser = null
    }
  },
  initializing: false,
  initializingPromise: null as Promise<Browser> | null,
}

export async function getBrowser() {
  // PART 1: contstant
  const baseUrl = domain
  const executablePath = process.env.IN_DOCKER_CONTAINER ? '/usr/bin/chromium-browser' : chromium.executablePath()
  // constants.appGlobals.executablePath = executablePath
  const ink8dev = Boolean(process.env.LOCAL_K8S_DEV && process.env.IN_DOCKER_CONTAINER)
  Print.magenta(`ink8dev: ${ink8dev}`)
  const getPage = async (browser: Browser) => {
    const context = await browser.newContext(ink8dev
      ? {
        proxy: { server: 'http://host.docker.internal:8080' },
        ignoreHTTPSErrors: true,
      }
      : {
        ignoreHTTPSErrors: true,
      })
    const page = await context.newPage()
    return {
      page,
      close: async () => {
        await context.close()
      },
    }
  }

  // PART 2: if browser is initializing, wait for it to finish
  if (browserSingleton.initializing && browserSingleton.initializingPromise) {
    const browser = await browserSingleton.initializingPromise
    return {
      browser,
      baseUrl,
      ink8dev,
      getPage: getPage.bind(null, browser),
    }
  }

  if (browserSingleton.browser?.isConnected?.() === false) {
    browserSingleton.browser = null // Force a restart
    browserSingleton.initializing = true
    browserSingleton.initializingPromise = chromium.launch({
      headless: true,
      executablePath: executablePath,
      args: ['--ignore-certificate-errors', '--disable-gpu'],
    })
    browserSingleton.browser = await browserSingleton.initializingPromise
    browserSingleton.initializing = false
    browserSingleton.initializingPromise = null

    return {
      browser: browserSingleton.browser,
      baseUrl,
      ink8dev,
      getPage: getPage.bind(null, browserSingleton.browser),
    }
  }

  // PART 3: if browser is already open, return it
  if (browserSingleton.browser) {
    // const browserPool = new BrowserPool(browserSingleton.browserContext)
    return {
      browser: browserSingleton.browser,
      baseUrl,
      ink8dev,
      getPage: getPage.bind(null, browserSingleton.browser),
    }
  }

  // PART 4: if browser is not open, launch it
  browserSingleton.initializing = true
  browserSingleton.initializingPromise = chromium.launch({
    headless: true,
    executablePath: executablePath,
    args: ['--ignore-certificate-errors', '--disable-gpu'],
  })
  browserSingleton.browser = await browserSingleton.initializingPromise
  browserSingleton.initializing = false
  browserSingleton.initializingPromise = null

  return {
    browser: browserSingleton.browser,
    baseUrl,
    ink8dev,
    getPage: getPage.bind(null, browserSingleton.browser),
  }
}

// the main method you'll call
export async function safeGetPage() {
  try {
    const { getPage } = await getBrowser()
    return await getPage()
  }
  catch (e) {
    console.warn('Browser context failed, restarting browser...', e)
    await browserSingleton.closeBrowser()
    return (await getBrowser()).getPage()
  }
}
```
### **page object**

The `page` object has properties related to the window element, and includes navigation, fetching DOM elements, and querying page titles. Here are some useful methods and properties the `page` object has, which are all async.

#### Page DOM

- `page.goto(url)` : navigates to the specified URL
- `page.locator(selector)` : fetches the element with the specified CSS selector. Returns a `Locator` instance.
- `page.click(selector)` : clicks the specified element queried by CSS selector
- `page.fill(selector, value)` : fills the specified element queried by CSS selector with the specified value.

To run some code on the browser via injecting javascript, you can use the `page.evaluate()` method, which takes in a callback that lets you execute client-side code.

You can return any primitive values in the callback, but nothing client-specific like DOM elements.

```ts
const { height, width } = await page.evaluate(() => {
  return {
    height: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth,
  }
})
```

#### Screenshots

You can take a screenshot of any URL like so:

```ts
export async function getScreenshot(url: string) {
  const browser = await chromium.launch({ headless: true })
  let page;
  
  try {
    page = await browser.newPage()
    
    await page.goto(url, {
      waitUntil: 'networkidle',
    })

    const hostname = new URL(url).hostname

    const screenshotPath = `screenshots/${hostname}-${Date.now()}.jpg`
    const buffer = await page.screenshot({ 
	    path: screenshotPath, 
	    quality: 70, 
	    type: 'jpeg' 
    })
    return buffer
  }
  catch (error) {
    console.error('Failed to take screenshot:', error)
    throw error
  }
  finally {
    if (page) await page.close()
    await browser.close()
  }
}
```

#### Waits

You can have implicit or excplicit waits in web scraping. In this section, we'll learn about implicit waits.

**Drawbacks/anti-patterns:**

- Avoid using `waitForTimeout()` unless absolutely necessary; it leads to brittle tests.
- Overly broad waits (e.g., waiting for the whole page to be idle) can slow down tests.

**locator waits**

Using the `locator.waitFor(options)` method, you can configure an explicit wait for specific DOM elements to show up. Here are the options you can pass in:

- `state`: can be "visible", "attached"
	- `"visible"`: when the element is visible in the viewport
	- `"attached"`: when the element gets attached to the DOM.
	- `"enabled"`: when the element gets enabled

```ts
const locator = await page.locator('.dynamic-element')

// 1. visibility wait
await locator.waitFor({ 
	state: 'visible', timeout: 5000 
});
```

**page waits**

- `page.waitForLoadState(state)`: waits for one of the specified events to be triggered. `state` can be one of the following:
	- `"networkidle"`: waits until no more network requests are sent. **this is deprecated and its use is discouraged.**
	- `"load"`: waits for the window load event to trigger
	- `"domcontentloaded"`: waits for the document to load its DOM fully.

```ts
  // 6. Wait for network idle (navigation or AJAX-heavy pages)
  await page.waitForLoadState('networkidle');
```

You can also write custom wait logic dealing with variables from the browser, which is useful if you control a site.

The `page.waitForFunction(cb)` takes in a callback that returns a boolean. it starts an observer for that function, and keeps waiting until the return value of the callback becomes true.

```ts
  // 7. Wait for a custom JavaScript condition
  await page.waitForFunction(() => window['appReady'] === true);
```

**waiting for navigation**

You can wait for a URL navigation using the `page.waitForNavigation()` async method. 

This is best paired with a button or link click that navigates to a page, and then concurrently awaiting both of those for robust loading.

```ts
// 8. Wait for navigation after clicking a button
  await Promise.all([
    page.waitForNavigation(),
    page.locator('a#next-page').click(),
  ]);

async function navigate(locator: string) {
	await Promise.all([
		page.waitForNavigation(),
		page.locator(locator).click(),
	]);
}
```

### playwright testing

In playwright, you have two main objects: the page and locator.

- **page**: represents a page on an origin and able to perform DOM operations to that page
- **locator**: You can use pages to query for locators, which are representations of individual HTML elements.

Below is the API for using playwright with page and locator objects in testing.

```ts
import { test, expect } from '@playwright/test';

// Using advanced CSS selectors
test('CSS selector for dynamic class', async ({ page }) => {
  await page.goto('https://example.com');
  // Attribute selector for class containing 'active'
  const dynamicElement = page.locator('[class*="active"]');
  await expect(dynamicElement).toBeVisible();
});

// Using XPath for complex structures
test('XPath selector for dynamic table row', async ({ page }) => {
  await page.goto('https://example.com/table');
  // Find a row containing specific text in any cell
  const row = page.locator('//tr[td[contains(text(), "Target Value")]]');
  await expect(row).toBeVisible();
});
```
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

#### Replaying

```ts
await browserContext.routeFromHAR(har);
await browserContext.routeFromHAR(har, { update: true });
await browserContext.routeFromHAR(har, { update: true, url: '**/api**' });
```

### Advanced Web scraping

#### Pagination

This is an example of how you can handle pagination:

```ts
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com/products');

  let hasNext = true;
  while (hasNext) {
    // Extract data from current page
    const items = await page.$$eval('.product', nodes =>
      nodes.map(node => node.textContent?.trim())
    );
    console.log(items);

    // Check for and click next button if it exists
    const nextButton = await page.$('button.next');
    if (nextButton) {
      await Promise.all([
        page.waitForNavigation(),
        nextButton.click(),
      ]);
    } else {
      hasNext = false;
    }
  }
  await browser.close();
```

And here's a robust, reusable way of doing pagination:


```ts
async function paginate(
	page: Page, 
	onPage: (page: Page) => Promise<void>,
	nextButtonSelector: (pageNum: number) => string
) {
  let index = 0

  let hasNext = true;
  while (hasNext) {
    await onPage(page)

    // Check for and click next button if it exists
    const nextButton = await page.$(nextButtonSelector(i));
    if (nextButton) {
      await Promise.all([
        page.waitForNavigation(),
        nextButton.click(),
      ]);
    } else {
      hasNext = false;
    }
    
    index+=1
  }
}
```

#### Infinite scrolling

And here's a way to handle infinite scrolling:

```ts
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com/feed');

  let previousHeight = await page.evaluate('document.body.scrollHeight');
  let keepScrolling = true;

  while (keepScrolling) {
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(2000); // Allow new content to load

    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) {
      keepScrolling = false; // No more new content loaded
    } else {
      previousHeight = newHeight;
    }
  }

  // Now extract data from the fully loaded page
  const posts = await page.$$eval('.post', nodes =>
    nodes.map(node => node.textContent?.trim())
  );
  console.log(posts);

  await browser.close();
```

```ts
async function paginate(
	page: Page, 
	onPage: (page: Page, iteration: number) => Promise<void>,
	waitInterval = 5000
) {
  let iteration = 0

  let previousHeight = await page.evaluate('document.body.scrollHeight');
  let keepScrolling = true;

  while (keepScrolling) {
	await onPage(page, iteration)
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(5000); // Allow new content to load

	
    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) {
      keepScrolling = false; // No more new content loaded
    } else {
      previousHeight = newHeight;
    }
    iteration+=1
  }
  
}
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