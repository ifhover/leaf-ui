import { expect, type Locator } from '@playwright/test';

export async function expectDataRowStripes(table: Locator) {
  const colors = await table.evaluate((node) => {
    const root = node.closest('.leaf-table');
    if (!root) throw new Error('Missing table surface');
    const probe = document.createElement('span');
    root.append(probe);
    const resolve = (variable: string) => {
      probe.style.backgroundColor = `var(${variable})`;
      return getComputedStyle(probe).backgroundColor;
    };
    const colors = [resolve('--leaf-table-surface'), resolve('--leaf-table-striped-background')];
    probe.remove();
    return colors;
  });
  expect(colors[0]).not.toBe(colors[1]);
  const rows = table.locator('tbody > tr[data-row-id]');
  expect(await rows.count()).toBeGreaterThan(1);
  await expect
    .poll(() =>
      rows.evaluateAll(
        (nodes, colors) =>
          nodes.flatMap((row) => {
            const index = Number(row.getAttribute('data-index'));
            const cell = row.firstElementChild;
            const color = cell && getComputedStyle(cell).backgroundColor;
            const expected = colors[index % 2];
            return color === expected ? [] : [{ index, color, expected }];
          }),
        colors,
      ),
    )
    .toEqual([]);
}

export async function expectShortHeaderSeparators(table: Locator) {
  const headings = await table.locator('thead th').evaluateAll((cells) =>
    cells.map((cell) => {
      const divider = getComputedStyle(cell, '::before');
      return {
        last: cell.nextElementSibling === null,
        leading: cell.matches('[data-pinned="end"][data-pin-edge]:not(:first-child)'),
        content: divider.content,
        height: Number.parseFloat(divider.height),
        cellHeight: cell.getBoundingClientRect().height,
        top: Number.parseFloat(divider.top),
        bottom: Number.parseFloat(divider.bottom),
        edge: divider.getPropertyValue('inset-inline-end'),
        startEdge: divider.getPropertyValue('inset-inline-start'),
        width: divider.borderInlineEndWidth,
        startWidth: divider.borderInlineStartWidth,
        cellBorder: getComputedStyle(cell).borderInlineEndWidth,
        pointerEvents: divider.pointerEvents,
      };
    }),
  );
  expect(headings.length).toBeGreaterThan(1);
  for (const heading of headings) {
    expect(heading.cellBorder).toBe('0px');
    if (heading.last && !heading.leading) {
      expect(heading.content).toBe('none');
      continue;
    }
    expect(heading.content).toBe('""');
    expect(heading.height).toBeGreaterThan(0);
    expect(heading.height / heading.cellHeight).toBeCloseTo(0.5, 1);
    expect(heading.top).toBeGreaterThan(0);
    expect(heading.top).toBeCloseTo(heading.bottom, 1);
    expect(heading.width).toBe(heading.last ? '0px' : '1px');
    expect(heading.startWidth).toBe(heading.leading ? '1px' : '0px');
    if (heading.leading) expect(heading.startEdge).toBe('-1px');
    expect(heading.edge).toBe('0px');
    expect(heading.pointerEvents).toBe('none');
  }
}
