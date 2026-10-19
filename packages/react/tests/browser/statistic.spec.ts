import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });

for (const theme of ['light', 'dark']) {
  test(`counts through browser frames and retargets smoothly in ${theme} mode`, async ({
    page,
  }) => {
    await page.clock.install({ time: new Date('2026-10-19T00:00:00') });
    await page.goto(`/?fixture=statistic&theme=${theme}`);
    await page.clock.pauseAt(new Date('2026-10-19T00:01:00'));
    const metric = page.getByTestId('metric');
    const number = metric.locator('.leaf-statistic__number');
    await expect(metric).toHaveAttribute('aria-busy', 'true');
    // Drive the browser clock so slow WebKit protocol calls cannot miss a whole animation.
    const click = (name: string) =>
      page.getByRole('button', { name, exact: true }).click({ force: true });
    await click('Start');
    await expect(metric.locator('.leaf-statistic__accessible')).toHaveText('1,000.00');
    const samples: number[] = [];
    for (let index = 0; index < 4; index++) {
      await page.clock.runFor(100);
      samples.push(Number((await number.textContent())?.replaceAll(',', '')));
    }
    expect(samples[0]).toBeGreaterThanOrEqual(500);
    expect(samples.at(-1)).toBeLessThan(1000);
    expect(new Set(samples).size).toBeGreaterThan(1);
    expect(samples).toEqual([...samples].sort((a, b) => a - b));
    await page.clock.runFor(700);
    await expect(number).toHaveText('1,000.00');
    await click('Decrease');
    await page.clock.runFor(100);
    await expect
      .poll(async () => Number((await number.textContent())?.replaceAll(',', '')))
      .toBeLessThan(900);
    await click('Increase');
    const intermediate = Number((await number.textContent())?.replaceAll(',', ''));
    expect(intermediate).toBeLessThan(2000);
    expect(intermediate).toBeGreaterThan(-1000);
    await page.clock.runFor(1100);
    await expect(number).toHaveText('2,000.00');
    await expect(number).not.toHaveAttribute('aria-hidden');
    await click('Decrease');
    await click('Disable motion');
    await expect(number).toHaveText('-1,000.00');
    await expect(metric.locator('.leaf-statistic__accessible')).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await click('Increase');
    await expect(number).toHaveText('2,000.00');
  });
}
