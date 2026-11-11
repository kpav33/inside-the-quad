import type { Page } from '@playwright/test';

/** Simulates a translation about 40% longer: lengthens every word in the explorer. */
export async function stretchText(page: Page) {
  await page.evaluate(() => {
    const root = document.querySelector('.part-explorer');
    if (!root) throw new Error('no explorer');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      node.textContent = (node.textContent ?? '').replace(
        /[A-Za-z]{3,}/g,
        (w) => w + w.slice(0, Math.ceil(w.length * 0.4)),
      );
    }
  });
}
