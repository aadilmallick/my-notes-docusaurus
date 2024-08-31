# 03: Devtools

[devtool tips](https://devtoolstips.org/)

## 21 tips

1. **Design mode**: you can edit text directly in the website by running this code in the console:

   ```js
   document.designMode = "on";
   ```

2. **$0**: The variable `$0` refers to the last element you selected in the elements tab.
3. **Ctrl + shift + P**: opens up command pallete so you can find commands and options easier.
4. **built-in JQUery** : The `$(selector)` function is built into chrome devtools, and is a much more concise way of doing `document.querySelector(selector)`.
	- `$('h1')` : equivalent of `document.querySelector('h1')`
	- `$$('h1')` : equivalent of `document.querySelectorAll('h1')`
5. **vizbug extension** : allows you to visually design your website.
6. **coverage**: Open up the coverage tab in devtools to see how much javascript and css is used and unused. You can optimize your bundle with the info from this page.
7. **live expressions**: Use live expressions to keep track of a variable across the lifetime of a page. Click on the eye icon in the top to create a new live expression. 
	- ![](https://www.webpagescreenshot.info/image-url/yQjT7dxu2)

### Taking high quality screenshots

1. In DevTools, click the **Toggle device toolbar** icon (`Cmd+Shift+M` or `Ctrl+Shift+M`) to enter the responsive design mode.
2. In the device toolbar, click **More options** (`⋮`) > **Add device pixel ratio**. In the action bar at the top of the viewport, select a DPR value from the new DPR drop-down menu. Default is 2, but you can bump it upto 3!
3. Click **More options** > select **Capture screenshot** for viewport or **Capture full size screenshot** for the entire page.

By putting devtools in device mode and then increasing the device pixel ratio, you can take super high quality screenshots. 

![devtools image](https://www.webpagescreenshot.info/image-url/oUNn0LU7t)


## Firefox devtools

### Taking screenshots

1. Open the **Console** panel, run the command `:screenshot --dpr 3` to take a high definition screenshot of the page with the device pixel ratio set to 3.
2. To capture a full page screenshot, just add `--fullpage` to the end and `--screenshot .header` to capture a screenshot of a node that can be identified by a selector.
## Console logs

### Logging in NodeJS

To see the entire object and not get the annoying `[Object object]` when console logging in nodejs, use the `console.dir(obj, {depth: null})` method.

```ts
console.dir(person, { depth: null });
/*
{
    username: 'johndoe',
    meta: {
        firstName: 'John',
        lastName: 'Doe',
        profile: {
            address: { street: '123 Main St', city: 'AnyTown' }
        }
    }
}
*/

```

### Styling logs

Using the `%c` interpolator at the beginning of a log message will style it accordingly with CSS in the console.

The second argument to `console.log()` will then be the appropriate CSS styles in a string

```js
console.log("%c some text here", "font-size:2rem;color:blue");
```

For this reason, I also built this class for logging colors in the browser: 

```ts
const defaultConsoleStyles = {
  error: "color: red; font-weight: bold;",
  info: "color: blue; font-weight: bold;",
  success: "color: green; font-weight: bold;",
};

export const BasicColorLogger = createColorLogger(defaultConsoleStyles);

export function createColorLogger<T extends Record<string, string>>(
  consoleStyles: T
) {
  const temp: Partial<
    Record<keyof typeof consoleStyles, (message: any) => void>
  > = {};
  for (const [key, value] of Object.entries(consoleStyles)) {
    temp[key as keyof typeof consoleStyles] = (message: any) => {
      console.log(`%c${message}`, value);
    };
  }

  const ColorLogger = temp as Record<
    keyof typeof consoleStyles,
    (message: any) => void
  >;
  return ColorLogger;
}
```
### Log levels

- `console.warn(string)` : displays a message as a warning
- `console.error()` : displays a message as an error
- `console.info()` : displays a message as information
- `console.clear()` : clears the console

```js
console.clear();
console.warn("A warning with console.warn()");
console.error("A message styled like an error with console.error()");
console.info("A message styled as information with console.info()");
```

### Viewing DOM elements

- `console.dir(element)` : console logs the element not just as HTML, but as a DOM element object, allowing you to see all its properties.

### Console groups

Console groups organize all log messages inside a group to be inside a collapsible toggle.

- `console.group(groupname)` : begins a logging group with the specified group name.
- `console.groupEnd()` : ends the most recent logging group, closing the toggle.

Using console groups allows you neaten out console messages by grouping them together under a toggle. The way to do this is to position all related log messages inside a group, using this syntax:

```js
console.group("groupname");
// log messages here
console.groupEnd();
```

```js
console.group("dictionary stuff");
console.log(dogs[0].name);
console.log(dogs[1].name);
console.groupEnd();
```

### Timing

- `console.time(tag)` : starts timing with a specified tag
- `console.timeEnd(tag)` : ends timing with the specified tag, and displays elapsed time to the console.

```js
console.time("saying hello");
console.log("hello");
console.timeEnd("saying hello");
```

the way to use this is to start time for a specific activity using `console.time()`, and then end print out the elapsed time using `console.timeEnd()` when the activity is finished.


### `console.table()`

The `console.table()` method takes in an array of objects all with the same structure and displays them in a table.

### Console assertions

Use `console.assert()` to assert a truthy value and print out an error message if not true

```ts
console.assert(condition: boolean, message: any)
```
## Devtools basics

### Mastering the Context menu

When you right click on an element, here all the different options you have available to you:

- **copy element** : you can copy an element, it's selector, or xpath. You can then paste the element back in the elements panel
- **hide element**: You can choose to visually hide an element or delete it from the page.
- **scroll into view**: You can scroll to the selected element

### Symbols

These builtin variables can be used in the devtools console.

- `$0` : the last selected element. You can continue this pattern with `$1` for the 2nd recently selected, and so on. Think of it exactly like a stack. Last in, first out.
- `$_` : the last returned values
- `$(selector : string)` : JQuery builtin for `document.querySelector()`
- `$$(selector : string)` : JQuery builtin for `document.querySelectorAll()`
- `copy(variable)`: Copies whatever value of the variable you pass in to the clipboard. Super helpful.  