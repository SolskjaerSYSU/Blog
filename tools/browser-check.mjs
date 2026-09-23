import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import { startPreview } from './preview-server.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const preview = process.env.TEST_BASE_URL ? null : await startPreview();
const base = process.env.TEST_BASE_URL || preview.url;
const posts = JSON.parse(await readFile('tools/migrated-posts.json', 'utf8')).filter(post => !post.draft);
const media = JSON.parse(await readFile('source/_data/media.json', 'utf8'));
let browser;
try {
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium'), headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const visit = async route => {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(650);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${route}`);
  };
  await visit('');
  assert.equal(await page.locator('#page-header').evaluate(e => e.clientHeight), 900);
  assert.equal(await page.locator('.hero-links a').count(), 3, 'Homepage should show three content shortcuts');
  assert(await page.locator('#recent-posts .feed-heading').count(), 'Homepage should label the recent-notes section');
  const heroBackground = await page.locator('#page-header').evaluate(e => getComputedStyle(e).backgroundImage);
  assert(heroBackground.includes('home-ambient.svg'), 'Homepage should use the abstract illustration instead of a photo');
  assert(!heroBackground.includes('banner1.webp'), 'Personal photography must not be used as the homepage hero');
  assert.equal(await page.locator('.recent-post-item').count(), Math.min(posts.length, 8));
  await page.mouse.move(720, 450);
  await page.waitForTimeout(100);
  assert(await page.locator('#cursor-orbit').isVisible(), 'Desktop should show the subtle cursor follower');
  if (process.env.SCREENSHOT_DIR) {
    await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/hexo-home-hero.png` });
  }
  await page.evaluate(() => scrollTo(0, innerHeight + 10));
  await page.waitForTimeout(350);
  if (process.env.SCREENSHOT_DIR) {
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/hexo-home-feed.png` });
  }
  await page.locator('#search-button').click();
  await page.locator('.local-search-input input').fill('队列');
  await page.locator('.search-result-list a').first().waitFor();
  assert((await page.locator('.search-result-list').innerText()).includes('队列'));
  await page.locator('.search-result-list a').first().click();
  await page.waitForURL('**/posts/**');
  assert(await page.locator('#post').evaluate(e => e.clientWidth > 700));
  await visit('posts/data-structure/queue/');
  const width = await page.locator('#post').evaluate(e => e.clientWidth);
  assert(width > 700, `Narrow article: ${width}`);
  assert(await page.locator('#article-container figure.highlight').count());
  for (const kind of ['photography', 'painting']) {
    const count = media.filter(p => kind === 'painting' ? /^draw\d+$/.test(p.id) : /^(\d+|DSC_1724)$/.test(p.id)).length;
    await visit(`artworks/${kind}/`);
    assert.equal(await page.locator('.portfolio-wall img').count(), count);
    assert.equal(await page.locator('#page-header').evaluate(e => e.clientHeight), 900);
    const first = page.locator('.portfolio-wall img').first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await page.locator('.medium-zoom-overlay').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const trigger = page.locator('.gallery-open').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.locator('.medium-zoom-overlay').waitFor();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    assert(await trigger.evaluate(e => e === document.activeElement), 'Lightbox must return keyboard focus');
  }
  await visit('about/');
  assert((await page.locator('#article-container').innerText()).includes('INTJ'));
  await page.locator('#darkmode').evaluate(e => e.click());
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  if (process.env.SCREENSHOT_DIR) {
    await page.locator('.personality').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/hexo-about-dark.png` });
  }
  await page.locator('#darkmode').evaluate(e => e.click());
  await visit('');
  await page.locator('#motion-toggle').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert(await page.locator('#motion-toggle').isDisabled());
  await page.setViewportSize({ width: 390, height: 844 });
  await visit('posts/data-structure/queue/');
  assert(await page.locator('#post').evaluate(e => e.clientWidth > 330));
  await visit('artworks/photography/');
  assert.equal(await page.locator('.portfolio-wall').evaluate(e => getComputedStyle(e).columnCount), '1');
  await page.locator('#toggle-menu').click();
  await page.waitForFunction(() => document.querySelector('#sidebar-menus').classList.contains('open'));
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const post of posts) {
      await visit(`posts/${post.slug}/`);
      const sizes = await page.locator('#post').evaluate(e => ({ width: e.clientWidth, content: e.querySelector('#article-container').clientWidth }));
      assert(sizes.width > Math.min(width * .7, 700), `${post.slug} is too narrow at ${width}: ${sizes.width}`);
      assert(sizes.content > Math.min(width * .6, 600), `${post.slug} content is too narrow`);
    }
  }
  assert.deepEqual(errors, [], 'Client errors');
  console.log(`PASS: ${posts.length} posts at 3 viewport widths, search navigation, galleries/keyboard lightbox, About, dark/reduced-motion modes, mobile menu.`);
} finally {
  await browser?.close();
  await preview?.close();
}
