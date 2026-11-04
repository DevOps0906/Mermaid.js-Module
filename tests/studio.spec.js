import { test, expect } from '@playwright/test';
import { diagrams } from '../src/catalog.js';

async function ready(page) {
  await expect(page.locator('#valid-badge')).toHaveText('✓ 유효한 코드', { timeout: 30000 });
  await expect(page.locator('#diagram svg')).toBeVisible();
}

test('all 13 diagram types and 26 presets render, with PNG exports', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await ready(page);
  for (const item of diagrams) {
    await page.locator(`.nav-link[href="#${item.id}"]`).click();
    await expect(page.locator('#diagram-title')).toHaveText(item.title);
    await ready(page);
    await expect(page.locator('#error')).toBeHidden();
    await page.locator('[data-preset="1"]').click();
    await ready(page);
    await expect(page.locator('#error')).toBeHidden();
    await expect(page.locator('#code')).toHaveValue(item.presets[1].code);
    await page.locator('#export-button').click();
    const downloaded = page.waitForEvent('download', { timeout: 10000 });
    await page.locator('[data-export="png"]').click();
    const download = await downloaded;
    expect(download.suggestedFilename()).toBe(`${item.id}.png`);
    expect(await download.failure()).toBeNull();
    const stream = await download.createReadStream();
    const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    const png = Buffer.concat(chunks);
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBeGreaterThan(0);
    expect(png.readUInt32BE(20)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test('invalid code preserves valid SVG, then Markdown input recovers and persists', async ({ page }) => {
  await page.goto('/'); await ready(page);
  const svg = await page.locator('#diagram').innerHTML();
  await page.locator('#code').fill('flowchart TD\n A[broken');
  await expect(page.locator('#error')).toBeVisible();
  expect(await page.locator('#diagram').innerHTML()).toEqual(svg);
  await expect(page.locator('#export-button')).toBeDisabled();
  await page.locator('#code').fill('# 문서\n\n```mermaid\nflowchart LR\n A[한글 입력] --> B[복구 완료]\n```');
  await ready(page);
  await expect(page.locator('#diagram')).toContainText('복구 완료');
  await page.reload(); await ready(page);
  await expect(page.locator('#diagram')).toContainText('복구 완료');
  await page.locator('#theme').selectOption('dark'); await ready(page);
  await expect(page.locator('#canvas')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#theme').selectOption('forest'); await ready(page);
  await page.locator('#theme').selectOption('neutral'); await ready(page);
});

test('manual mode, navigation race, search, file imports and exports work', async ({ page }) => {
  await page.goto('/'); await ready(page);
  await page.locator('#auto-render').uncheck();
  await page.locator('#export-button').click();
  await expect(page.locator('#export-menu')).toBeVisible();
  await page.locator('#code').fill('flowchart LR\n A[수동] --> B[실행]');
  await expect(page.locator('#export-menu')).toBeHidden();
  await expect(page.locator('#valid-badge')).toHaveText('변경됨');
  await page.locator('#code').press('Control+Enter'); await ready(page);
  await expect(page.locator('#diagram')).toContainText('수동');
  await page.locator('#auto-render').check(); await ready(page);
  await page.locator('#search').fill('sequence');
  await expect(page.locator('.nav-link')).toHaveCount(1);
  await page.locator('.nav-link').click(); await ready(page);
  await page.locator('#search').fill('');
  await page.locator('.nav-link[href="#pie"]').click();
  await page.locator('.nav-link[href="#flowchart-lr"]').click(); await ready(page);
  await expect(page.locator('#diagram')).toContainText('입력 데이터');
  await page.locator('#import-file').setInputFiles({ name: 'example.md', mimeType: 'text/markdown', buffer: Buffer.from('```mermaid\nflowchart TD\n A[가져오기 성공] --> B[파일]\n```') });
  await ready(page);
  await expect(page.locator('#diagram')).toContainText('가져오기 성공');
  for (const format of ['svg', 'png', 'mmd']) {
    await page.locator('#export-button').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator(`[data-export="${format}"]`).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`flowchart-lr.${format}`);
    expect(await download.failure()).toBeNull();
    if (format === 'png') {
      const stream = await download.createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      expect(Buffer.concat(chunks).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    }
  }
});

test('desktop and mobile layout, zoom, guide and reset', async ({ page }) => {
  await page.goto('/'); await ready(page);
  await page.locator('#zoom-in').click();
  await expect(page.locator('#zoom-label')).toHaveText('110%');
  await page.locator('#fit').click();
  await expect(page.locator('#zoom-label')).toHaveText('100%');
  await page.locator('#module-help').click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('#close-guide').click();
  await page.locator('[data-preset="1"]').click(); await ready(page);
  await page.locator('#code').fill('flowchart LR\n A --> B'); await ready(page);
  await page.locator('#reset').click(); await ready(page);
  await expect(page.locator('#code')).toHaveValue(diagrams[0].presets[1].code);
  await page.locator('[data-preset="0"]').click(); await ready(page);
  await page.screenshot({ path: 'docs/dashboard.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('#menu-toggle').click();
  await page.locator('.nav-link[href="#sequence"]').click(); await ready(page);
  await expect(page.locator('#sidebar')).not.toHaveClass(/open/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'docs/mobile.png', fullPage: true });
});
