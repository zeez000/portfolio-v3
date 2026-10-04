import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const sizes = [[320,740],[390,844],[768,1024],[1440,900],[1920,1080]];
for (const [w, h] of sizes) test(`no horizontal overflow ${w}x${h}`, async ({ page }) => {
  await page.setViewportSize({ width: w, height: h }); await page.goto('./');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('repo links and résumé', async ({ page }) => {
  await page.goto('./');
  for (const h of ['https://github.com/zeez000/ecommerce-platform', 'https://github.com/zeez000/devops/tree/main/linux-digital-detective'])
    await expect(page.locator(`a[href="${h}"]`).first()).toBeVisible();
  for (const a of await page.locator('a[data-resume]').all()) {
    const url = new URL(await a.evaluate((el) => el.href));
    expect(url.pathname, 'résumé must live under the configured base path').toBe(new URL('./resume.pdf', page.url()).pathname);
  }
  await expect(page.locator('a[download][data-resume]')).toHaveCount(1);
});
test('placeholders are replaced before launch', async ({ page }) => {
  await page.goto('./'); expect(await page.locator('[data-todo]').count(), 'fill email/LinkedIn then remove data-todo').toBe(0);
});
test('skip link and keyboard focus', async ({ page }) => {
  await page.goto('./'); await page.keyboard.press('Tab'); await expect(page.locator('.skip')).toBeFocused();
});
test('mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('./');
  await page.click('#menu-btn'); await expect(page.locator('#menu')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('#menu')).toBeHidden();
});
test('reduced motion leaves native scroll', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' }); const page = await ctx.newPage(); await page.goto('./');
  expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false);
});
test('content visible with JS disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false }); const page = await ctx.newPage(); await page.goto('./');
  await expect(page.locator('h1')).toBeVisible(); await expect(page.locator('#case h2')).toBeVisible();
});
test('wheel produces movement within 100ms', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('./'); await page.waitForTimeout(1200);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 300); await page.waitForTimeout(60);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(20);
});

test('résumé request returns 200 (needs public/resume.pdf)', async ({ page, request }) => {
  test.skip(!fs.existsSync('public/resume.pdf'), 'add public/resume.pdf to enable this check');
  await page.goto('./');
  for (const a of await page.locator('a[data-resume]').all()) {
    const res = await request.get(await a.evaluate((el) => el.href));
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
  }
});
