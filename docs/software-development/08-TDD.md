# test driven development

This course teaches better than I do. Just go there. 

```embed
title: "Introduction to Testing | Steve Kinney"
image: "https://stevekinney.com/open-graph?title=Introduction+to+Testing&description=An+introduction+to+testing+using+JavaScript"
description: "An introduction to testing using JavaScript"
url: "https://stevekinney.com/courses/testing"
favicon: ""
aspectRatio: "52.5"
```


## Intro to testing

### First principles

**why test?**

Testing actually makes coding easier and more productive. Writing tests are easier than writing code, so it’s the path of least resistance.

> [!NOTE]
> Writing tests reduces the cognitive load.

**different kinds of tests**

- **unit tests:** testing single functions. Quick
- **integration tests:** testing entire flows between connected components, including IO operations (talking to API)
- **system tests:** testing entire systems
- **End to end tests:** running automated tests in the browser, simulating a user interacting in realtime. Very slow

When thinking about tests, we want to focus on the biggest band for our buck. We want most of our tests to comprise of unit tests, then integration tests, and last end to end tests.

> [!NOTE]
> Unit tests are fast and isolated, thus they should be the backbone of our testing.

#### **The golden rule of assertions**

The main principle behind testing is this:

> Your code should only fail if the code behind them is actually incorrect and broken.

What this means is that the goal during testing should be making the test robust enough so that you can't sneakily find a loophole to pass it. The test should be resilient to changes and should only fail if your actual API code is broken.

#### How to write good tests

> It is impossible to write good tests for bad code.

Testing is like flossing - it's good for you, but nobody wants to do it. To lower the barrier to entry for testing, you need to commit to writing **testable code**.

### Best Practices

#### Focus on abstractions, not details

Spies and mocks are ways to make your tests brittle and fail the golden rule of assertions since it makes your test rely on the implementation details of a function rather than the abstraction of just focusing on the inputs and outputs. 

Here is an example of BAD testing that uses spies that spy on implementation details:

![](https://i.imgur.com/eJPFSwa.png)
There are two main ways to solve this issue and prefer abstraction over details in your test implementations:

- **dependency injection**: Dependency injection avoids the mocking and spying issue
- **treat code as a black box**: Treat the code you're testing as a black box - you only know the inputs and outputs. Pretend you have no idea what the function is actually doing.

#### Making testable classes

When writing classes you want to later be able to test, make sure that all your class properties are able to be accessed. Give getters and setters for each one.

Here are things you should **avoid** in order to make testable classes.

- Declaring fields and methods as private
- Doing work and logic in the constructor besides initializing class properties
- Using singletons

Now, here is how to write testable code:

- Use dependency injection, keep loose coupling
- Pass variables/class properties into your constructor
- Enforce the single responsibility principle for classes

#### It's OK to repeat yourself

Don't worry about DRY code when writing tests. Tests are meant to stand on their own individually, and writing abstractions to promote DRY code makes your code inflexible and your tests more complicated. Just repeat them.

### TDD

TDD is a programming paradigm where we write tests before writing code, essentially designing our entire codebase out of those tests. It follows a principle of **red-green-refactor**.

These are the steps:

1. Write a failing test (red)
2. Write code to make the test pass (green)
3. Refactor the code

The main benefit of TDD is that it follows the rule of testing based on abstractions rather than implementation details.

## Vitest basics

### CLI and setup

Vitest is typescritp compatible and built from jest. You can import other files into your test files, which you couldn’t do with jest

1. `npm install -D vitest`
2. Create a test script. THe `vitest` command runs in watch mode by default
    
    ```jsx
    {
      "scripts": {
        "test": "vitest"
      }
    }
    ```
    

**Vitest CLI**

- `vitest --run` : runs your tests once
- `vitest` : runs your tests in watch mode
- `vitest --ui` : shows the test suite with the UI

#### Vitest reporter

TO get back a test report, you can use these options to get back test results in json format:

```bash
vitest --reporter=json --outputFile=./test-output.json
```

You can also do it in the vite config like so:

```jsx
export default defineConfig({
  test: {
    reporters: ['json'],
    outputFile: './test-output.json'
  },
})
```

Here are the different reporter options:

- `--reporter=verbose` : verbose test output
- `--reporter=basic` : basic test output
- `--reporter=json` : json report

### Creating test suites

Use the `it` method to create tests in vitest

```jsx
import { it, expect } from 'vitest';

it('should work', () => {
  expect(true).toBe(true);
});
```

You can also create test suites and nested test suites with the `describe()` method. In test suites, you can create multiple related tests with `it()` and also have setup and tear down functions.

```ts
describe("PSIModel", () => {
  const testUrl = "https://example.com";

  describe("getPSIUrl", () => {
    const psiModel = new PSIModel(apiKey);

    it("should construct a valid PSI URL with the correct base URL", () => {
      const url = psiModel.getPSIUrl(testUrl);
      expect(url).toContain(PSIModel.baseUrl);
    });

    it("should include the provided URL as a query parameter", () => {
      const url = psiModel.getPSIUrl(testUrl);
      expect(url).toContain(`url=${encodeURIComponent(testUrl)}`);
    });

    it("should include the API key as a query parameter", () => {
      const url = psiModel.getPSIUrl(testUrl);
      expect(url).toContain(`key=${apiKey}`);
    });
    
  });

})
```

#### Skipping tests

The `it.todo()` and `it.skip()` methods skip tests and mark them to do later.

#### Conditional tests

You can conditionally run tests or skip tests through the `it.runIf()` and `it.skipIf()` methods:

- `it.runIf(condition, description, testCb)`: runs the test if the condition is true.
- `it.skipIf(condition, description, testCb)`: skips the test if the condition is true.

```tsx
// only runs if the condition is true
it.runIf(process.env.NODE_ENV === 'development')(
  'it should run in development',
  () => {
    expect(process.env.NODE_ENV).toBe('development');
  },
);

// skips the test if the condition is true
it.skipIf(process.env.NODE_ENV !== 'test')('it should run in test', () => {
  expect(process.env.NODE_ENV).toBe('test');
});
```

#### Test lifecycle hooks

To avoid code duplication, you can write code that runs before and after each test with lifecycle hooks

- `beforeEach(cb)` : runs a callback before each test
- `afterEach(cb)` : runs a callback after each test
- `beforeAll(cb)` : runs a callback once before starting testing for the file
- `afterAll(cb)` : runs a callback once after finishing testing for the file

Each of these lifecycle hooks must live inside a `describe()` cb test suite

```ts
import { expect, test, beforeEach } from 'vitest';
import { counter } from './counter';

describe('Counter', () => {
  beforeEach(() => {
    counter.reset();
  });

  it('starts at zero', () => {
    expect(counter.value).toBe(0);
  });

  it('can increment', () => {
    counter.increment();
    expect(counter.value).toBe(1);
  });

  // Let's get this test to *not* fail.
  it('can decrement', () => {
    counter.increment();
    counter.decrement();
    expect(counter.value).toBe(0);
  });
});
```

### Testing API

#### `expect()`

Here is how we can use the powerful `expect()` method:

- `expect(variable).toBe(value)` : checks equality for primitive values, checks reference for objects
- `expect(variable).toEqual(value)` : checks equality for primitive values and objects, works by checking equality of values instead of references for objects.
- `expect(variable).toBeInstanceOf(class)` : asserts is the variable is an instance of the specified class.
- `expect(variable).toContain(value)` : asserts if the array contains the specified class
- `expect(func).toThrow()` : execute the function and asserts true if the function throws an error
- `expect(num1).toBeCloseTo(num2)` : asserts true if the two numbers are very close to each other, accounting for imprecision in computer systems.

```jsx
expect(["Backlog"]).toContain("backlog");
expect("important-things bruh").toMatch(/important\\-things/);
expect(() => throw new Error()).toThrow();
expect(() => throw new Error("it went wrong")).toThrowError(/went wrong/);
expect(0.2 + 0.1).toBeCloseTo(0.3);
```

**negating**

To negate these conditions, use the `not` property after the `expect()` method like so:

```jsx
expect(["Backlog"]).not.toContain(["Bruh"]);
```

**dealing with promises**

In most cases, you can just make your test asynchronous, but in some cases, you can use these properties:

- `expect(promise).resolves` : resolves the promise, and then you chain with assertion methods
- `expect(promise).rejects` : rejects the promise, and then you chain with assertion methods.

```jsx
expect(new Promise((res, rej) => res(undefined))).resolves.toBeUndefined();
```

**mocking with objects**

If you want to test whether an object has some properties defined on it or equal to something, you can do that by using the `expect` function to create mocking objects.

- `expect.objectContaining(obj)` : creates a mock object that has the required properties you define, but any other properties are also allowed, allowing flexibility.
- `expect.any(Class)` : creates a mock object that matches any instance of the specified class, like any string for `String`

```jsx
it.todo('supports adding an item with the correct name', () => {
  expect.hasAssertions();
  const result = reducer([], add({ name: 'iPhone' }));
  
  // expect result[0] to have property result[0].name == iPhone
  expect(result[0]).toBe(expect.objectContaining({ name: 'iPhone' }));
});
```

## Mocking, stubbing, spying

**Test doubles** is the concept of creating fake services that mirror the real ones so that when you do tests with those services or APIs, you're not actually tampering with real data.

We use test doubles to:

1. **Isolate the code under test**: By replacing real dependencies, we remove the risk of side effects, external failures, and unpredictable behavior.
2. **Control test scenarios**: With test doubles, we can simulate different responses, such as errors or specific data, without relying on the real implementation.
3. **Improve test reliability**: Test doubles make our tests more predictable, removing uncertainty and making sure tests pass or fail based on the actual code we’re testing.
4. **Speed up tests**: Real dependencies like databases or network calls can slow down tests. By using test doubles, we can run tests much faster.
5. **Verify interactions**: Test doubles allow us to observe how our code interacts with its dependencies, helping us ensure that methods are being called as expected.

To clarify the differences between these three types of test doubles:

- **spying**: Used to observe when a function or method is called and ensure it was called with the correct number of arguments, the correct number of times, etc.
- **stubbing**: Used to create a mock implementation of a method that simulates the real behavior without actually running the original implementation.
- **mocking**: A combination of spying and stubbing that allows you to simulate function calls and observe them.

While both mocks and stubs replace the real implementation of functions, there are important differences between them:

- **Stubs**: Stubs only provide predefined behavior when called, but they do not keep track of how many times the function was called or with what arguments.
- **Mocks**: Mocks not only replace the real implementation, but they also keep track of calls, arguments, and context, allowing you to verify interactions in more detail. Mocks can be configured dynamically to return specific values or simulate different conditions during the test.

| **Feature**           | **Stubs**                                         | **Spies**                                                        | **Mocks**                                                                     |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Primary Purpose**   | Replace a function with predefined behavior       | Record information about function calls                          | Combine behavior control with call tracking                                   |
| **Modifies Behavior** | Yes (returns predefined values or actions)        | No (only observes by default)                                    | Yes (can define behavior and observe)                                         |
| **Tracks Calls**      | No                                                | Yes                                                              | Yes                                                                           |
| **Tracks Arguments**  | No                                                | Yes                                                              | Yes                                                                           |
| **Usage Scenario**    | Simulate simple behaviors, like network responses | Monitor interactions, like verifying if a callback was triggered | Simulate complex interactions, combining behavior control with call recording |

> [!IMPORTANT]
> You should always prefer dependency injection to mocking or stubbing, since it becomes more flexible. The more you try to control the outer world (global variables and APIs), the less flexible your code becomes. 


### Spying

**spying** is the concept of watching over when a function or method gets called, as a way to ensure that it got called or that it wasn't called.

When should you use spies?

- You want to verify how many times a function is called and with what arguments.
- The function you are testing interacts with external or internal functions, and you need to monitor those interactions.
- You want to confirm whether a callback or handler was invoked during a specific operation.
- You are testing functions that are not easily isolatable or modifiable, but you still need to observe their usage.

**creating spies**

1. Create a spy using the `vi.spyOn(object, keyFn)` to spy on a specific method from an object.
    
2. Assert that the function you’re spying on has been called with this code
    
    ```jsx
    expect(spy).toHaveBeenCalled();
    ```
    
3. After each test, restore all mocks using the `vi.restoreAllMocks()` method for cleanup or restore individual mocks with the `mockRestore()`method that all test doubles have
    
    ```jsx
    afterEach(() => {
      vi.restoreAllMocks();
    });
    ```

This is an example of spying on a custom object:

```jsx
import { describe, expect, it, vi, afterEach } from "vitest";

const video = {
  play: () => {
    console.log("play");
  },
};

function playVideo() {
  video.play();
}

describe("spying test suit", () => {
	// 1. restore original function implementations during teardown
  afterEach(() => {
    vi.restoreAllMocks();
  });
	
  it("should call play method", () => {
	  // 2. create a spy
    const spy = vi.spyOn(video, "play");
	  // 3. call the function that should call the spy
    playVideo();
	  // 4. assert spy has been called
    expect(spy).toHaveBeenCalled();
  });
});
```

Spying can be done to ANY object in javascript, like this spy on `console.log()`, which spies on the `console` object and listens for the `log()` method on that object:

```ts
const logSpy = vi.spyOn()
```

**spying utility function**

```ts
function createSpyFromObject<T extends object>(obj: T, key: keyof T) {
  // @ts-ignore
  const spy = vi.spyOn(obj, key);
  return {
    spy,
    cleanup: () => {
      spy.mockRestore();
    },
    mockFn: (cb: (...args: any[]) => any) => {
      spy.mockImplementation(cb);
    },
  };
}
```

And here is how you can use it:

```ts
import { describe, it, expect, vi } from "vitest";

// 1. create mock and spyer over Math.random()
const randomMocker = createSpyFromObject(Math, "random");
randomMocker.mockFn(() => 0.5);

describe("testing", () => {
  it("should test", () => {
	 // 2. test mocker works correctly
    expect(Math.random()).toBe(0.5);
    expect(randomMocker.spy).toHaveBeenCalled();
    // 3. cleanup mocker, reset everything to original state
    randomMocker.cleanup();
    expect(Math.random()).not.toBe(0.5);
  });
});
```

#### Spying API reference

All these methods are what you can chain on the `expect(spy)` expectation clause:

- `expect(spy).toHaveBeenCalled()`: Passes if the spy was ever called.
- `expect(spy).toHaveBeenCalledTimes(times)`: Passes if the spy was called the correct number of times.
- `expect(spy).toHaveBeenCalledWith(…args)`: Passes if the function has _ever_ been called with the arguments that you specify.
- `expect(spy).toHaveBeenLastCalledWith`: Passes if the function was most recently called with the arguments that you specify.
- `expect(spy).toHaveBeenNthCalledWith(time, …args)`: Passes if the function was called whichever time you specified with the arguments you specified.
- `expect(spy).toHaveReturned()`: Passes if the function returned (e.g., it didn’t throw an error).
- `expect(spy).toHaveReturnedTimes(times)`: Passes if the function returned however many times you specify.
- `expect(spy).toHaveReturnedWith(value)`: Passes if the function has ever successfully returned with the value you specify.
- `expect(spy).toHaveLastReturnedWith(value)`: Passes if the function most recently returned with the value you specify.
- `expect(spy).toHaveNthReturnedWith(time, value)`: Passes if the function returned whichever time you specified with the value you specified.
### Mocking

Mocks are built on the same API of spying except that you can an additional method for changing how that method works and redefining its behavior with a simulation. 

Here are the main use cases for using mocks:

- **Configurable Behavior**: Mocks can replace the actual implementation and allow you to configure how they behave in different test cases.
- **Recording Calls**: Like spies, mocks keep track of how many times a function was called and with what arguments.
- **Versatile**: Mocks combine the benefits of both stubs and spies, making them useful in more complex testing scenarios.

Here is an example that removes the randomness from `Math.random()`:

```ts
import { describe, it, expect, vi } from "vitest";

const randomMocker = vi.spyOn(Math, "random").mockImplementation(() => 0.5);

describe("testing", () => {
  it("should test", () => {
    expect(Math.random()).toBe(0.5);
    expect(randomMocker).toHaveBeenCalled();
  });
});
```

There are two ways you can create mocks in vitest:

- **spy and `mockImplementation()`**: combines spying and stubbing to form mocking.
- **using `vi.fn()`**: this method is syntactic sugar over the first implementation, doing both spying and stubbing at once, where you pass in a function you create.

```ts
// method 1 - create mock implementation from spy
const spyer1 = vi.spyOn(Math, "random").mockImplementation(() => 0.5);

// method 2 - spies on the function you pass in, returns the cb
const getRandomNumber = vi.fn(() => 0.5);
```

Both of these methods have different use cases:

- **method 1**: Use the first method of creating mocks when you want to mock implementations for global variables, APIs, and any other objects you created. 
- **method 2**: Use the second method of creating mocks when you want to create just a completely new function and the only thing you want is the ability to spy on that function.

Let's dive into using method 2:

```ts
const getNumber = vi.fn(() => 5000);

const number = getNumber();

expect(number).toBe(5000);
expect(getNumber).toHaveBeenCalled();
expect(number).toHaveReturnedWith(5000);
```

Using the `vi.fn()` sets up a basic mock which is a function that can accept any number of arguments and can be used with `expect(mock)` clauses.

```ts
const mockFn = vi.fn()
```

Mocks are also spys, so they store function invocation history. These are the properties they have:

- `mockFn.mock.calls`: an array that represents the function invocation history.

**mocking utility function**

Here is a mocking utility function to better help you understand mocking:

```ts
function createMockFunction<T extends (...args: any[]) => any>(fn: T) {
  const mock = vi.fn(fn);
  return {
    mock,
    cleanup: () => {
      mock.mockRestore();
    },
  };
}
```

Then you use it like so, following these steps:

1. Create mock function
2. Set the global method you want to mock to the mock implementation, test
3. Restore mock

```ts
import { describe, it, expect, vi } from "vitest";

// 1. create mock function
const randomMocker = createMockFunction(() => 0.5);

it("should test", () => {

	  // 2. set global Math.random to mock implementation
	Math.random = randomMocker.mock;
	expect(Math.random()).toBe(0.5);
	
	// 3. cleanup
	randomMocker.cleanup();
	expect(Math.random()).not.toBe(0.5);
});
```

**mocking API reference**

You can create a basic, hollow mock with the `vi.fn()` method:

```ts
const mock = vi.fn()
```

and then chain these additional methods on to add functionality to the mock:


- `mock.mockImplementation()`: Takes a function that you want your mock function to call whenever it’s called.
- `mock.mockImplementationOnce()`: Accepts a function that will only be used the _next time_ a function is called.
- `mock.withImplementation()`: Overrides the original mock implementation temporarily while the callback is being executed. Calls the function immediately.
- `mock.mockReturnValue()`: Nevermind the implementation, we just know we want it to return whatever value.
- `mock.mockReturnValueOnce()`: Set the return value—but only the _next time_ it’s called.
- `mock.mockResolvedValue()`: Sets the value of the promise when it resolves.
- `mock.mockResolvedValueOnce()`: Set the resolved value of a promise _next time_ it resolves.
- `mock.mockRejectedValue()`: Rejects a promise with the error provided.
- `mock.mockRejectedValueOnce()`: Rejects a promise with the error provided _next time_.
- `mock.mockReturnThis()`: Sets the value of `this`.

Here's an example of using these methods:

```ts
// Mock a payment function
const paymentMock = vi.fn();

// Simulate successful and failed payments in different tests
paymentMock.mockReturnValueOnce('Payment Successful').mockReturnValueOnce('Payment Failed');

expect(paymentMock()).toBe('Payment Successful');
expect(paymentMock()).toBe('Payment Failed');

// Verify that the mock was called twice
expect(paymentMock).toHaveBeenCalledTimes(2);
```

#### **mocking time**

Here is the basic setup for mocking time in your tests to standardize what time you are working with:

- **setup**: In the `beforeEach()` lifecycle hook, you can mock the system time and date with the `vi.useFakeTimers()` method.
- **teardown**: In the `afterEach()` lifecycle hook, you need to clear up the fake timers and revert back to real time with the `vi.useRealTimers()` method.

`vi.useFakeTimers()` replaces the global `setTimeout`, `clearTimeout`, `setInterval`, `setImmediate`, `clearImmediate`, `process.hrtime`, `performance.now`, and `Date` with a custom implementation that you can control.

```jsx
beforeEach(() => {
	// 1. In setup, set fake timers
	vi.useFakeTimers()
	vi.setSystemTime(new Date(2024, 1, 1))
})

afterEach(() => {
	// 2. In teardown, restore to real time
	vi.useRealTimers()
	vi.restoreCurrentDate()
})
```

Time is also effectively frozen unless you choose to advance it yourself. This means that stuff like timers with `setTimeout()` and `setInterval()` WILL NOT WORK since time won't pass.

If you want time to move forward as it normally does, you can pass a option to `useFakeTimers()`.

```ts
vi.useFakeTimers({ shouldAdvanceTime: true });
```

However, you can get around this through **advancing time functions**, which manually advance time in a programmatic manner:

- `vi.advanceTimersByTime(ms)`: advances time forward by the specified number of milliseconds.

```ts
function delayedFunction(callback) {
  setTimeout(() => {
    callback('Done');
  }, 3000);
}

describe('delayedFunction', () => {
  it('should call callback after timeout', () => {
    // Mock the timer
    vi.useFakeTimers();

    const callback = vi.fn();

    // Call the function under test
    delayedFunction(callback);

    // Fast-forward the timer
    vi.advanceTimersByTime(3000);

    // Assert that the callback was called
    expect(callback).toHaveBeenCalledWith('Done');
  });
});
```


**mocking time functions**

Here are some additional mocking capabilities you have to mock time:

- `vi.setSystemTime(date: Date)`: mocks the system time to be a certain date.
- `vi.restoreCurrentDate()`: restores the current date to the real time. Should be run in the teardown of a test.

#### Mocking modules

> [!WARNING]
> A fair warning: dependency injection is almost always preferred over mocking modules to avoid test complexity.

If your code is tightly coupled and imports modules that you need to mock, then you can get out of a pinch by doing the following:

```ts
// Mock the api module
vi.mock('./api', () => ({
  getConcertDetails: vi
    .fn()
    .mockResolvedValue({ band: 'Green Day', venue: 'Madison Square Garden' }),
}));
```

And here is the full example, where you also must import from the module in order to register it for mocking:

```ts
// Imagine you have a module called 'api' with various functions
import * as api from './api';

// Code under test
async function getConcertDetails(bandName) {
  return await api.fetchConcerts(bandName);
}

describe('getConcertDetails', () => {
  // Mock the entire api module
  vi.mock('./api', () => ({
    fetchConcerts: vi.fn(() =>
      Promise.resolve([{ venue: 'Madison Square Garden'}]),
    ),
  }));

  it('should return mocked concert details', async () => {
    // Call the function with the mocked module
    const result = await getConcertDetails('Green Day');

    // Check that the fetchConcerts mock was called
    expect(api.fetchConcerts).toHaveBeenCalledWith('Green Day');

    // Assert the return value
    expect(result).toEqual([{ venue: 'Madison Square Garden' }]);
  });
});
```

You can also mock built in-modules, which is often easier:

```ts
import * as fs from 'fs';

// Code under test
function readConfigFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

describe('readConfigFile', () => {
  // Mock the fs module
  vi.mock('fs');

  it('should read the mocked config file', () => {
    // Mock the fs.readFileSync method
    vi.spyOn(fs, 'readFileSync').mockReturnValue('mocked file content');

    // Call the function under test
    const result = readConfigFile('/path/to/config');

    // Assert the returned file content
    expect(result).toBe('mocked file content');
  });
});
```

#### Mocking API requests

```embed
title: "Mock Service Worker"
image: "https://mswjs.io/og-image.jpg"
description: "API mocking library for browser and Node.js"
url: "https://mswjs.io/"
favicon: ""
aspectRatio: "52.5"
```

Use the mock service worker library `msw` to create a mock service worker that intercepts network requests and mocks them with fake data to simulate real API requests.

If you want to do it manually, you can just mock out the `fetch()` global function by setting `global.fetch` to a mock implementation.

```ts
import { test, vi, expect } from 'vitest';
import { getData } from './yourFunctionFile';

test('fetches data successfully from API', async () => {
  // Mock the fetch function.
  const mockResponse = {
    userId: 1,
    id: 1,
    title: 'Test Todo',
    completed: false,
  };

  // Here we tell Vitest to mock fetch on the `window` object.
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockResponse),
    }),
  );

  // Call the function and assert the result
  const data = await getData();
  expect(data).toEqual(mockResponse);

  // Check that fetch was called exactly once
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todos/1');
});
```
### Stubbing

Stubbing is just redefining a variable or function with your own simulated definition. A stub is a type of test double used to replace a real function with a simplified, controlled version for testing purposes. 

> [!NOTE]
> The primary purpose of a stub is to simulate the behavior of real code by providing predefined responses.

This helps avoid testing real data, doing real network requests, etc., all of which is bad if those things are computationally expensive and in production.

**when to use stubs**

Use stubs when:

- You want to replace a dependency to isolate the function under test.
- The real dependency involves side effects, such as I/O operations, network calls, or database queries, which you do not want to run during testing.
- You need to simulate different behaviors from the external systems (e.g., returning specific data or triggering an error) to cover various test cases.
- You want to speed up tests by eliminating real-time-consuming operations, such as network requests or file I/O.

Stubs are best suited for situations where you don’t need to verify how often or how a function is called but simply want to control what it returns.

**stub example**

Here's a basic stub example that is also kind of a mock since we straight up replace the global `fetch()` function with our own simulated stub. 

```ts
const stub = vi.fn(value)
```

However, what makes stubs useful is that we can always restore the original implementation of what we were stubbing/mocking whenever we want through the `mockRestore()` method:

```ts
// restore original implementation, erase all changes to globals
stub.mockRestore() 
```

And here's the complete example:

```ts
import { describe, it, expect, vi } from 'vitest';
import { getConcertDetails } from './concerts';

describe('getConcertDetails', () => {
  it('returns concert details from the API', async () => {
    // Stub the fetch function to simulate an API response
    const fetchStub = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ band: 'Green Day' }),
      }),
    );

    // Replace the global fetch function with our stub
    global.fetch = fetchStub;

    // Call the function under test
    const result = await getConcertDetails('Green Day');

    // Assert that the stubbed API returned the correct data
    expect(result).toEqual({ band: 'Green Day' });

    // Clean up: Restore the original fetch function
    fetchStub.mockRestore();
  });
});
```

#### **stubbing environment variables**

The below code helps stub environment variables into your code without you having to account for the correct loading of env variables in your app logic:

```ts
// stub process.env.ENV_VAR_NAME
vi.stubEnv('ENV_VAR_NAME', 'env_var_value')

// unstub the fake env variables
vi.unstubAllEnvs()
```

```ts
describe('production', () => {
  beforeEach(() => {
    vi.stubEnv('MODE', 'production');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not log to the console in production mode', () => {
    const spy = vi.spyOn(console, 'log');

   if (process.env.MODE !== "production") {
	   console.log('Hello, world!')
   }

    expect(spy).not.toHaveBeenCalledWith('Hello, world!');
  });
});
```
### combining stubbing, mocking, spying

Below is an implementation that combines mocking with spying on an object's mocked method.

```ts
// Create a mock and spy on one of its methods
const mockObject = {
  method: vi.fn().mockReturnValue('Mocked result'),
};

// Spy on the method
const spy = vi.spyOn(mockObject, 'method');

mockObject.method('argument');

// Verify the interaction
expect(spy).toHaveBeenCalledWith('argument');
expect(spy).toHaveReturnedWith('Mocked result');
```

The most important thing to understand is that all test doubles in vitest have a **unified API**, meaning they share most of the same methods. For the rest of this section, a **test double** will refer to a spy, mock, or stub in code. 

#### Cleaning up mocks

It is essential to clean up mocks, spies, and stubs once you are done using them. All of these test doubles share these same methods:

- `testDouble.mockRestore()`: resets the stub or mock to the original implementation it was mocking over.
- `testDouble.mockClear()`: clears all invocation history of the test double, essentially resetting it.
- `testDouble.mockReset()`: combines restoring with clearing, removing all mock invocation history and restoring the original implementation the mock was mocking over.

For a moment, let’s assume `const fn = vi.fn()`.

- `fn.mockClear()`: Clears out all of the information about how it was called and what it returned. This is effectively the same as setting `fn.mock.calls` and `fn.mock.results` back to empty arrays.
- `fn.mockReset()`: In addition to doing what `fn.mockClear()`, this method replaces the inner implementation with an empty function.
- `fn.mockRestore()`: In addition to doing what `fn.mockReset()` does, it replaces the implementation with the original functions.

You also have lifecycle methods for clearing up mocks, which you should run in the setup and teardown functions in your test suite:

You’d typically put these in an `afterEach` block within your test suite.

- `vi.clearAllMocks`: Clears out the history of calls and return values on the spies, but does _not_ reset them to their default implementation. This is effectively the same as calling `.mockClear()` on each and every spy.
- `vi.resetAllMocks`: Calls `.mockReset()` on all the spies. It will replace any mock implementations with an empty function.
- `vi.restoreAllMocks`: Calls `.mockRestore()` on each and every mock. This one returns the world to it’s original state

