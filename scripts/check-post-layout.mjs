import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:4321/Blog/";
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});
try {
  const page = await browser.newPage();
  for (const width of [1920, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    // Exercise a different page shell before entering the article from home.
    await page.goto(`${base}about/`, { waitUntil: "domcontentloaded" });
    await page.locator(`a[href="${new URL(base).pathname}"]`).first().evaluate(el => el.click());
    await page.waitForURL(base);
    await page.waitForTimeout(1500);
    await page.locator('a[href$="/posts/data-structure/queue/"]').first().evaluate(el => el.click());
    await page.waitForURL("**/posts/data-structure/queue/");
    for (const mode of ["click", "reload"]) {
      if (mode === "reload") await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("#post-container").waitFor();
      await page.waitForTimeout(1200);
      const sizes = await page.evaluate(() => {
        const grid = document.querySelector("#main-grid");
        const post = document.querySelector("#post-container");
        return {
          grid: grid.clientWidth,
          post: post.clientWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
          homeHero: document.body.classList.contains("has-home-hero"),
        };
      });
      console.log(width, mode, sizes);
      assert(sizes.post >= sizes.grid * 0.9, "Article must fill the content grid");
      assert(!sizes.overflow, "Page must not overflow horizontally");
      assert(!sizes.homeHero, "Homepage layout must not leak into articles");
    }
    await page.goBack({ waitUntil: "domcontentloaded" });
    assert.equal(new URL(page.url()).pathname, new URL(base).pathname);
    assert(await page.locator("body.has-home-hero").count(), "Back must restore home layout");
  }
} finally {
  await browser.close();
}
