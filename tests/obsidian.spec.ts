import { test, expect } from '@playwright/test';

test('converts Obsidian links to navigable HTML anchors correctly', async ({ page }) => {
  // Navigate to the test markdown page
  await page.goto('http://localhost:3000/docs/how-to-use');

  // Wait for the converted links to appear in the DOM
  const links = page.locator('a.obsidian-link');
  await expect(links).toHaveCount(4);

  // 1. [[#Create a profile context doc]]
  const link1 = links.nth(0);
  await expect(link1).toHaveText('Create a profile context doc');
  await expect(link1).toHaveAttribute('href', '/docs/how-to-use#Create%20a%20profile%20context%20doc');

  // 2. [[03-prompt-slop#Company deep research report prompt]]
  const link2 = links.nth(1);
  await expect(link2).toHaveText('Company deep research report prompt');
  await expect(link2).toHaveAttribute('href', 'http://localhost:3000/docs/03-prompt-slop#Company%20deep%20research%20report%20prompt');

  // 3. [[03-prompt-slop]]
  const link3 = links.nth(2);
  await expect(link3).toHaveText('03-prompt-slop');
  await expect(link3).toHaveAttribute('href', 'http://localhost:3000/docs/03-prompt-slop');

  // 4. [[03-prompt-slop#Company deep research report prompt|Deep Research Prompt Alias]]
  const link4 = links.nth(3);
  await expect(link4).toHaveText('Deep Research Prompt Alias');
  await expect(link4).toHaveAttribute('href', 'http://localhost:3000/docs/03-prompt-slop#Company%20deep%20research%20report%20prompt');
});
