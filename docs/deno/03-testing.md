
## Basics

### Multi step test

Here is the basic way to create a multi-test step

- `Deno.test(testSuiteName, testContext)`: creates a test with a t

```ts
import { assertEquals, assertNotEquals, assertRejects } from "@std/assert";

Deno.test("my test suite", async (testSuite) => {
	// create 1st test
	await testSuite.step("2 + 2 = 4", async () => {
		assertEquals(2 + 2, 4)
	})
	
	// create 2nd test
	await testSuite.step("1 + 2 = 3", async () => {
		assertEquals(1 + 2, 3)
	})
})
```

Here is a good example:

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

