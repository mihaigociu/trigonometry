import { expect, test } from '@playwright/test';

const LABS = ['ratios', 'unit-circle', 'waves', 'triangles', 'angle-sum', 'identities'];

test('the root page sends visitors to a language', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveURL(/\/(ro|en)\/$/);
});

for (const lang of ['ro', 'en']) {
  for (const lab of LABS) {
    test(`${lang}/${lab} renders without errors or sideways scrolling`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(`${lang}/${lab}/`);
      await expect(page.locator('.lab__scene svg').first()).toBeVisible();
      await expect(page.locator('.prose h2').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
      expect(errors).toEqual([]);
    });
  }
}

test('quiz: answering a question gives feedback', async ({ page }) => {
  await page.goto('en/ratios/quiz/');
  await page.locator('.option').nth(1).click();
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByRole('status')).toContainText('Correct!');
});

test('waves: the lesson example shows the packet’s period of 225°', async ({ page }) => {
  await page.goto('en/waves/');
  await page.getByRole('button', { name: 'The lesson’s example' }).click();
  await expect(page.locator('.facts')).toContainText('225°');
  await expect(page.locator('.facts')).toContainText('left by 25°');
});

test('tower problem accepts the right height', async ({ page }) => {
  await page.goto('en/ratios/');
  await page.getByRole('radio', { name: /tower/ }).click();
  const text = (await page.locator('.card p').first().textContent()) ?? '';
  const [, d, a] = text.match(/(\d+) m from a tower .* angle of (\d+)°/) ?? [];
  await page.locator('input[type=number]').fill((Number(d) * Math.tan((Number(a) * Math.PI) / 180)).toFixed(2));
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.locator('.note--ok')).toBeVisible();
});

test('identities: guessing reveals the graphs', async ({ page }) => {
  await page.goto('en/identities/');
  await page.getByRole('button', { name: /Impostor/ }).click();
  await expect(page.locator('.lab__scene path').first()).toBeVisible();
  await expect(page.getByText(/Score: \d of 1/)).toBeVisible();
});

test('triangle: dragging a corner changes the angles, which still add to 180°', async ({ page }) => {
  await page.goto('en/triangles/');
  const before = await page.locator('.lab__panel .card').first().textContent();
  const c = page.getByRole('slider', { name: /Corner C/ });
  await c.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  const after = await page.locator('.lab__panel .card').first().textContent();
  expect(after).not.toBe(before);
  expect(after).toContain('180°');
});
