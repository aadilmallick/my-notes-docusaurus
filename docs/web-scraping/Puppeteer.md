# Puppeteer tutorial

All puppeteer methods are asynchronous.

The main idea is this:

1. Create a `Browser` instance with `puppeteer.launch()`
2. From that browser instance, you can create representations of tabs, as `Page` instances.
3. You do your scraping work in each `Page` instance, which lets you scrape the HTML, take screenshots, wait, and much more.

## Browser

### Basics

This is the most basic app you can have.
```ts
const puppeteer = require("puppeteer");

async function run() {
  const browser = await puppeteer.launch();
  await browser.close();
}

run();
```

### Browser methods and properties

These are all async methods.

- `broswer.close()` : closes the browser
- `broswer.newPage()` : creates a new tab and returns a `Page` instance
- `browser.disconnect()`: disconnects puppeteer but keeps the browser open.

**properties**

- `browser.pages` : returns a list of all tabs in the browser, represented by `Page[]`
- `browser.userAgent()`: returns the original user agent

## Page

### Basic Page methods and properties

All these methods are asynchronous.

**basic scripting methods**

- `page.goto(url)` : goes to the specified URL
- `page.waitForTimeout(ms)` : does an implicit wait for a certian number of milliseconds
- `page.click(css_selector)` : clicks on the specified element found by css selector
- `page.type(css_selector, text)` : types in the specified element found by css selector with the specified text
- `page.focus(css_selector)` : focuses on the specified CSS element
- `page.content()` : returns the entire HTML of the page as a string

**tab mangament methods**

- `page.bringToFront()` : makes the specified tab currently active and focuses on it
- `page.close()` : closes the tab
- `page.goForward()` : goes forward in history
- `page.goBack()` : goes back in history
- `page.reload()` : refreshes the page

**spoofing methods**

- `page.setUserAgent(user_agent)`: sets the user agent for the tab
- 

**properties**

- `page.url` : the url of the tab
- `page.browser` : the `Browser` instance the tab belongs to
- `page.title` : the title of the tab


### Querying elements

#### Locators

The `page.locator(css_selector)` method is the recommended way to access a single element and then perform actions on it. It returns an `Locator` instance

```ts
// 'button' is a CSS selector.
const button = await page.locator('button')
button.click()
```

Here are the different methods you can access on a locator, all asynchronous.: 

- `locator.hover()`: hovers over the element
- `locator.click()`: clicks on the element
- `locator.fill(text)`: fills the element with the specified text, like an input element.
- `locator.scroll(options)`: scrolls an element
```ts
// Scroll the div element by 10px horizontally
// and by 20 px vertically.
await page.locator('div').scroll({
  scrollLeft: 10,
  scrollTop: 20,
});
```
- `locator.wait()`: waits for the element to be visible.



#### evaluate

- `page.evaluate(callback)` : this method takes in a callback, and in that callback you get access to the DOM API. Whatever you return in this callback will be what is returned from this method.  
- `page.$(css_selector)` : returns the first element that satisfies the css_selector, the equivalent of `document.querySelector()`
- `page.$$(css_selector)` : returns all elements that satisfy the css_selector, the equivalent of `document.querySelectorAll()`

**evaluate in depth**

Since `page.evaluate()` runs within the context of the web browser, you cannot access server-side variables in your code.

However, you can pass arguments into the callback like so:

```javascript
const three = await page.evaluate((arg1, arg2) => {
  // code here
} , 1, 2);
```

```ts
// returns title string
const title = await page.evaluate(() => document.title);

// returns array of <a> elements
const links = await page.evaluate(() => {
  return [...document.querySelectorAll("a")].map(a => a.href)
});

// passing in arguments:
const three = await page.evaluate((a, b) => {
  window.alert(a+b);
  return a + b
} , 1, 2);
```

#### `$eval()` and `$$eval()`



The `page.$$eval()` method is basically the shorthand version of `page.evaluate()` where puppeteer automatically converts the nodeList into an array for us.

```javascript
// selects all matching eleements
await page.$$eval("css_selector", (elements) => {
  // elements is HTMLElement[]. return something here
})
```

SImilarly, `page.$eval()` is the single element version.

```javascript
// selects first matching element
await page.$eval("css_selector", (element) => {
  // return something here
})
```

### Elements: Element handles

You can do stuff with elements with three different ways: 

1. Using page methods like `page.click()`, `page.type()`
2. Using locator methods like `locator.click()`, `locator.wait()`
3. Using element handles.

Element handles have access to everything the page can do like `page.evaluate()`, etc., so they are more powerful than locators. 

Here is how you can get an `ElementHandle` instance back from a locator: use the `locator.waitHandle()` method.

```ts
const buttonHandle = await page.locator('button').waitHandle();
await buttonHandle.click();
```
### waits

**Explicit wait: navigation**

To perform an explicit wait in puppeteer, await the `Promise.all()` method and pass in the things you want to wait for.

For example, if you click on a button and then want to wait for the page to fully load, you would do something like this:

```javascript
const action = page.click("button")
await Promise.all([
  action,    // 1. element action
  page.waitForNavigation() // 2. explicit wait
])
```

**Explicit waits**

- `page.waitForSelector(css_selector)` : waits for the elements with the specified css selector to appear in the DOM. It returns an element
- `page.waitForNavigation()` : waits for the navigation to complete

**Implicit wait**

- `page.waitForTimeout(num_ms)` : waits for specified number of milliseconds.

Using the `page.exposeFunction()` method, you can expose a function on the window API and give it access to server side code.

```javascript
await page.exposeFunction('methodName', (...args) =>
  // server side code
);
```

THe first argument is the method name of the method to attach on the `window` object.

The second argument is the actual code that the method will run, and you can specify the number of arguments you want.

You can then use the newly added window method in the `page.evaluate()` function:

```javascript
await page.evaluate(async () => {
  window.methodName()
})
```

#### Waiting with locators

You can use the `element.wait()` method for any element you retrieve from the `page.locator(selector)` method, which will wait until the element is visible. 

You can even wait for promises to resolve like so: 

```ts
await page
  .locator(() => {
    let resolve!: (node: HTMLCanvasElement) => void;
    const promise = new Promise(res => {
      return (resolve = res);
    });
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.target instanceof HTMLCanvasElement) {
          resolve(record.target);
        }
      }
    });
    observer.observe(document);
    return promise;
  })
  .wait();
```

#### Different levels of navigation waiting

When using the `page.goTo(url, options)` method, we can specify three basic levels of how much we want to wait before we can start interacting with the page.

```ts
await page.goto("https://example.com", {
  waitUntil: "networkidle2",
});
```

These are ordered from shortest to longest.

1.  `"domcontentloaded"`: Waits for the 'DOMContentLoaded' event.
2. `'load'`: Waits for the 'load' event.
3. `"networkidle2"`: Waits till there are no more than 2 network connections for at least `500` ms.
### Exposing function on the window object

Using the `page.exposeFunction()` method, you can expose a function on the window API and give it access to server side code.

```javascript
await page.exposeFunction('methodName', (...args) =>
  // server side code
);
```

THe first argument is the method name of the method to attach on the `window` object.

The second argument is the actual code that the method will run, and you can specify the number of arguments you want.

You can then use the newly added window method in the `page.evaluate()` function:

```javascript
await page.evaluate(async () => {
  window.methodName()
})
```

### Intercept network requests

You can intercept each network request that happens on a page like so: 

```ts
const page = await browser.newPage();
page.on('request', request => {
  console.log(request.url());
});

page.on('response', response => {
  console.log(response.url());
});
```

### Taking screenshots

```ts
await page.goto('https://news.ycombinator.com', {
  waitUntil: 'networkidle2',
});
await page.screenshot({
  path: 'hn.png',
});
```

Use the `page.screenshot(options)` async method to take a screenshot of the viewport. Here are the properties you can pass in to the `options` object. 

- `path`: the filepath to write to
- `type`: the filetype to save as. By default, it's "png", but you can set it to "jpeg" or "webp"
- `quality`: the quality of the image, between 0 to 100. Not applicable to PNGs
- `omitBackground`: makes the screenshot background transparent if the background is white. Obviously, you'd need to save as a png for this. 
- `fullPage`: if set to `true`, then a screenshot of the full page is taken. By default it's `false`.

You can take a screenshot of a specific element by calling `element.screenshot(options)`:

```ts
const fileElement = await page.waitForSelector('div');
await fileElement.screenshot({
  path: 'div.png',
});
```

### Save as pdf

```ts
await page.goto('https://news.ycombinator.com', {
  waitUntil: 'networkidle2',
});
// Saves the PDF to hn.pdf.
await page.pdf({
  path: 'hn.pdf',
});
```

The `page.pdf()` method saves the website as a pdf. 


### Uploading files

Use the `elementHandle.uploadFile(filepaths)` method to upload an array of filepaths to the file input. 

```ts
const fileElement = await page.waitForSelector('input[type=file]');
await fileElement.uploadFile(['./path-to-local-file']);
```

### Manage cookies

- `page.cookies()`: async method that returns all the cookies as a list of objects
- `page.setCookie(cookies_list)`: sets cookies

## Plugins

### Puppeteer stealth plugin

```ts
// 1. import required libraries
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

async function login() {

  // 2. use plugin
  puppeteer.use(StealthPlugin());

  // 3. create browser instance
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  // 4. navigate to google sign in
  const page = await browser.newPage();
  await page.goto("https://accounts.google.com/signin/v2/identifier");

  // 5. enter in email and password
  await page.type('[type="email"]',  process.env.GOOGLE_EMAIL);
  await page.click("#identifierNext");
  await page.waitForTimeout(10000);
  await page.type('[type="password"', process.env.GOOGLE_PASSWORD);
  await page.click("#passwordNext");
  await page.waitForTimeout(55000);
}
```



## Guides

### Debugging

#### Capture console output

If you want to capture console output from the web page and output, listen to the `
`'console'` event on the page. 

```ts
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

await page.evaluate(() => console.log(`url is ${location.href}`));
```

### Scraping websites with infinite scroll 

Here's the basic algorithm

1. Get the scrollheight with `document.body.scrollHeight`. Store this as the previous scroll height variable.
2. Scroll to the bottom
3. Wait until this condition is true: the current scrollheight given by`document.body.scrollHeight` is greater than the previous scrollheight we recorded.

Basically we can just keep scraping like so. 