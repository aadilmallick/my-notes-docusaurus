
## Basics

### Intro

Here is the most basic test:

```ts
import { assertEquals, assertNotEquals, assertRejects } from "@std/assert";

Deno.test("2 + 2 = 4", () => {
	assertEquals(2 + 2, 4)
})
```

### Multi step test

Here is the basic way to create a multi-test step

- `Deno.test(testSuiteName, testContext)`: creates a test with a test context

Here is a good example that takes into a account the test context so you can have setup and tear down:

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

### Standard testing functions

