
## Basics

### Intro

Here is the most basic test, in the following syntax:

```ts
Deno.test(testName, testFn)
```

```ts
import { assertEquals, assertNotEquals, assertRejects } from "@std/assert";

Deno.test("2 + 2 = 4", () => {
	assertEquals(2 + 2, 4)
})
```

You can instead pass an object of options to the `Deno.test()` method for more control and configuration of the behavior. 

```ts
Deno.test(options)
```

Here are the options you have available:

- `name`: test name, pass a **string**
- `fn()`: the test function implementation, pass a **function**
- `timeout`: the time limit for the test execution, pass a **number**
- `only`: a **boolean** value where if true, then it's like marking the test with `Deno.test.only()`.

```ts
Deno.test({
  name: "completes within deadline",
  timeout: 5000, // 5 seconds
  async fn() {
    const response = await fetch("https://example.com");
    await response.body?.cancel();
  },
});
```

### ignoring/skipping tests

- `Deno.test.ignore()`: ignores this test suite
- `Deno.test.only()`: runs only this test suite, ignores everything else

```ts
Deno.test.ignore("my test", () => {
  // your test code
});

Deno.test.only("my test", () => {
  // some test code
});
```

### Failing fast 

If you have a long-running test suite and wish for it to stop on the first failure, you can specify the `--fail-fast` flag when running the suite.

```shell
deno test --fail-fast
```

This will cause the test runner to stop execution after the first test failure.

### Multi step test

Here is the basic way to create a multi-test step

- `Deno.test(testSuiteName, testContext)`: creates a test with a test context

Here is a good example that takes into a account the test context so you can have setup and tear down:

Deno also supports test steps, which allow you to break down tests into smaller, manageable parts. This is useful for setup and teardown operations within a test:

```ts
Deno.test("database operations", async (t) => {
  using db = await openDatabase();
  await t.step("insert user", async () => {
    // Insert user logic
  });
  await t.step("insert book", async () => {
    // Insert book logic
  });
});
```

```ts
// Multi-step Test
Deno.test("database lib", async (t) => {
    // Setup Logic
    let db: Map<string | string> | null = new Map()

    await t.step("db exists", () => {
        assertExists(db)
    });

    await t.step("insert user", () => {
        db.set('user', 'jeff');

        assertGreater(db.size, 0)
        assertMatch(db.get('user'), /jeff/)
        assertNotMatch(db.get('user'), /Bob/)

    });
    
    // teardown logic
    
    db = null

});
```

```ts
import { assertEquals, assertNotEquals, assertRejects } from "@std/assert";
import { delay } from "jsr:@std/async/delay";
import { generateShortCode } from "../src/db.ts";

Deno.test("URL Shortener ", async (t) => {
  await t.step("should generate a short code for a valid URL", async () => {
    const longUrl = "https://www.example.com/some/long/path";
    const shortCode = await generateShortCode(longUrl);
    
    assertEquals(typeof shortCode, "string");
    assertEquals(shortCode.length, 11);
  });

  await t.step("should be unique for each timestamp", async () => {
    const longUrl = "https://www.example.com";
    const a = await generateShortCode(longUrl);
    await delay(5)
    const b = await generateShortCode(longUrl);
    
    assertNotEquals(a, b)
  });

  await t.step("throw error on bad URL", () => {
    const longUrl = "this aint no url";
 
    assertRejects(async () => {
     await generateShortCode(longUrl);
    })
  });
});
```

### Deno test hooks

Deno provides test hooks that allow you to run setup and teardown code before and after tests. These hooks are useful for initializing resources, cleaning up after tests, and ensuring consistent test environments.

- `Deno.test.beforeAll(fn)` - Runs once before all tests in the current scope
- `Deno.test.beforeEach(fn)` - Runs before each individual test
- `Deno.test.afterEach(fn)` - Runs after each individual test
- `Deno.test.afterAll(fn)` - Runs once after all tests in the current scope

This is the hooks execution order:

- **beforeAll/beforeEach**: Execute in FIFO (first in, first out) order
- **afterEach/afterAll**: Execute in LIFO (last in, first out) order

Here's a complete example using the test hooks:

```ts
import { DatabaseSync } from "node:sqlite";
import { assertEquals } from "jsr:@std/assert";

let db: DatabaseSync;

Deno.test.beforeAll(() => {
  console.log("Setting up test database...");
  db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    ) STRICT
  `);
});

Deno.test.beforeEach(() => {
  console.log("Clearing database for clean test state...");
  db.exec("DELETE FROM users");
});

Deno.test.afterEach(() => {
  console.log("Test completed, cleaning up resources...");
  // Any additional cleanup after each test
});

Deno.test.afterAll(() => {
  console.log("Tearing down test database...");
  db.close();
});

Deno.test("user creation", () => {
  const stmt = db.prepare(
    "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *",
  );
  const user = stmt.get("alice", "alice@example.com");
  assertEquals(user!.name, "alice");
});

Deno.test("user deletion", () => {
  const insertStmt = db.prepare(
    "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *",
  );
  const user = insertStmt.get("bob", "bob@example.com");

  const deleteStmt = db.prepare("DELETE FROM users WHERE id = ?");
  deleteStmt.run(user!.id);

  const selectStmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const deletedUser = selectStmt.get(user!.id);
  assertEquals(deletedUser, undefined);
});

```

### Standard testing functions



## Testing CLI

### Basic usage

```bash
# Run all tests in the current directory and all sub-directories
deno test

# Run all tests in the util directory
deno test util/

# Run just my_test.ts
deno test my_test.ts

# Run test modules in parallel
deno test --parallel

# Pass additional arguments to the test file that are visible in `Deno.args`
deno test my_test.ts -- -e --foo --bar

# Provide permission for deno to read from the filesystem, which is necessary
# for the final test above to pass
deno test --allow-read=. my_test.ts

```

Here are some important options you can pass to the `deno test` CLI:

- `--parallel`: run tests in parallel
- `-A`: run with all permissions