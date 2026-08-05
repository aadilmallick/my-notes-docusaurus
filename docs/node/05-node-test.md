## Basics

### First test and running it

```ts
// math.test.js
const { test } = require('node:test');
const assert = require('node:assert');

test('adds 1 + 2 to equal 3', () => {
  assert.strictEqual(1 + 2, 3);
});
```

Run the file directly using the `--test` flag:

```bash
node --test math.test.js
```

Or, if you name your files `*.test.js` or place them in a `test/` directory, you can simply run:


```bash
node --test
```

> [!NOTE]
> Node will automatically discover and run files matching `*.test.js`, `*-test.js`, or `test.js`.

### Test suites

You can create test suites with the `describe()` function from the `node:test` library

```ts
const { test, describe, it } = require('node:test');
const assert = require('node:assert');

// Using basic test()
test('a simple test', () => {
  assert.ok(true);
});

// Using describe and it
describe('Math operations', () => {
  it('should add correctly', () => {
    assert.strictEqual(1 + 1, 2);
  });

  it('should subtract correctly', () => {
    assert.strictEqual(2 - 1, 1);
  });
});
```

#### Test filtering

```ts
const { test } = require('node:test');
const assert = require('node:assert');

// Skip a test
test('skip this test', { skip: true }, () => {
  // This will not run
});

// Skip with a reason
test('skip this test', { skip: 'Feature not implemented yet' }, () => {});

// Focus: Run ONLY this test (using the 'only' option)
test('run only this test', { only: true }, () => {
  assert.strictEqual(1, 1);
});

// To run 'only' tests, you must pass the --test-only flag in the CLI:
// node --test --test-only
```

### Assertions in depth

Assertions come from the `node:assert` library:

```ts
const assert = require('node:assert');

// 1. Equality (strict comparison, use this 95% of the time)
assert.strictEqual(1, 1); // Passes
// assert.strictEqual(1, '1'); // Fails

// 2. Deep Equality (for objects and arrays)
assert.deepStrictEqual([1, 2], [1, 2]); // Passes
assert.deepStrictEqual({ a: 1 }, { a: 1 }); // Passes

// 3. Truthy / Falsy
assert.ok(true); // Passes if value is truthy
assert.ok(1); 

// 4. Expected to throw
assert.throws(() => {
  throw new Error('Something went wrong');
}, /Something went wrong/); // Optional regex or error object matching

// 5. Expected to reject (for Promises)
assert.rejects(
  async () => { throw new Error('Async error'); },
  /Async error/
);
```

### Hooks

```ts
const { describe, test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

describe('Database Suite', () => {
  before(() => {
    console.log('Runs once before all tests in this suite');
  });

  after(() => {
    console.log('Runs once after all tests in this suite');
  });

  beforeEach(() => {
    console.log('Runs before every test');
  });

  afterEach(() => {
    console.log('Runs after every test');
  });

  test('test 1', () => {
    assert.ok(true);
  });

  test('test 2', () => {
    assert.ok(true);
  });
});
```

### Async tests

```ts
const { test } = require('node:test');
const assert = require('node:assert');

// Async/await
test('async test', async () => {
  const result = await Promise.resolve(42);
  assert.strictEqual(result, 42);
});

// Callbacks (using Node's util.promisify or standard async patterns)
// Note: Node's test runner does NOT support "done" callbacks like Mocha.
// If you have callback-based code, wrap it in a Promise.
test('callback-based test wrapped in promise', async () => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      assert.ok(true);
      resolve();
    }, 100);
  });
});
```

## Mocking

### Basics

```ts
const { test, mock } = require('node:test');
const assert = require('node:assert');

test('mocking a function', () => {
  // Create a mock function
  const myMock = mock.fn((x) => x * 2);

  myMock(5);
  myMock(10);

  // Assert it was called correctly
  assert.strictEqual(myMock.mock.calls.length, 2);
  assert.strictEqual(myMock.mock.calls[0].arguments[0], 5);
  assert.strictEqual(myMock.mock.results[0].value, 10);

  // ALWAYS restore mocks after the test to prevent side effects
  mock.restoreAll();
});

test('mocking an object method', () => {
  const calculator = {
    add: (a, b) => a + b,
  };

  // Mock the method
  mock.method(calculator, 'add', () => 100);

  assert.strictEqual(calculator.add(1, 2), 100);
  assert.strictEqual(calculator.add.mock.calls.length, 1);

  mock.restoreAll();
});
```