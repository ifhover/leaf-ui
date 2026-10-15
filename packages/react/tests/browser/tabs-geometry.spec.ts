import { expect, type Locator, test } from '@playwright/test';

async function expectAligned(root: Locator) {
  await expect
    .poll(() =>
      root.evaluate((node) => {
        const marker = node.querySelector('.leaf-tabs__indicator');
        const active = node.querySelector('[data-tab-key][data-active="true"]');
        if (!marker || !active) throw new Error('Missing selection geometry');
        const actual = marker.getBoundingClientRect();
        const expected = active.getBoundingClientRect();
        return Math.max(
          Math.abs(actual.x - expected.x),
          Math.abs(actual.y - expected.y),
          Math.abs(actual.width - expected.width),
          Math.abs(actual.height - expected.height),
        );
      }),
    )
    .toBeLessThan(1);
}

for (const direction of ['ltr', 'rtl']) {
  for (const type of ['line', 'card']) {
    test(`scaled ${direction} ${type} selection stays aligned through real scroll and resize`, async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(
        `/?fixture=tabs&narrow=1${direction === 'rtl' ? '&rtl=1' : ''}${type === 'line' ? '&line=1' : ''}`,
      );
      const root = page.getByTestId('motion-tabs');
      const list = root.locator('.leaf-tabs__list');
      const marker = root.locator('.leaf-tabs__indicator');
      await page.getByRole('textbox', { name: 'Retained draft', exact: true }).fill('Saved draft');
      await root.evaluate((node) => {
        node.style.transformOrigin = 'top left';
        node.style.transform = 'scale(0.8)';
      });
      await expectAligned(root);
      const localX = await marker.evaluate((node) =>
        node.style.getPropertyValue('--leaf-indicator-x'),
      );
      await list.evaluate((node, rtl) => {
        node.scrollLeft = rtl ? -40 : 40;
      }, direction === 'rtl');
      await expect
        .poll(() => list.evaluate((node) => node.scrollLeft))
        .toBe(direction === 'rtl' ? -40 : 40);
      await expectAligned(root);
      expect(
        await marker.evaluate((node) => node.style.getPropertyValue('--leaf-indicator-x')),
      ).toBe(localX);

      for (const name of ['A longer second tab', 'Third', 'First']) {
        await root.getByRole('tab', { name, exact: true }).click();
        await expectAligned(root);
      }
      await expect(root.getByRole('textbox', { name: 'Retained draft', exact: true })).toHaveValue(
        'Saved draft',
      );
      await root.getByRole('tab', { name: 'A longer second tab', exact: true }).click();
      await expectAligned(root);
      const before = await marker.evaluate((node) => node.getBoundingClientRect().width);
      await root.getByRole('tab', { name: 'A longer second tab', exact: true }).evaluate((node) => {
        node.append(' with more detail');
      });
      await expectAligned(root);
      expect(await marker.evaluate((node) => node.getBoundingClientRect().width)).toBeGreaterThan(
        before,
      );
      await root.evaluate((node) => {
        node.style.width = '300px';
      });
      await expectAligned(root);
      await expect(marker).toHaveCount(1);
      await testInfo.attach('scaled selection after scrolling and resizing', {
        body: await root.screenshot(),
        contentType: 'image/png',
      });
    });
  }
}
