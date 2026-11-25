import { render, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { useRowMotion } from './row-motion';

function MotionRowFixture({
  collapsed,
  enabled = true,
}: {
  collapsed: boolean;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLTableRowElement>(null);
  const hidden = useRowMotion(ref, collapsed, enabled);
  return (
    <table>
      <tbody>
        <tr ref={ref} hidden={hidden || undefined}>
          <td>
            <div className="leaf-table__row-content">Child row</div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

describe('useRowMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('toggles hidden immediately when motion is disabled', () => {
    const { container, rerender } = render(
      <ConfigProvider theme={{ motion: false }}>
        <MotionRowFixture collapsed={false} />
      </ConfigProvider>,
    );
    const row = container.querySelector('tr') as HTMLTableRowElement;
    expect(row.hidden).toBe(false);
    rerender(
      <ConfigProvider theme={{ motion: false }}>
        <MotionRowFixture collapsed />
      </ConfigProvider>,
    );
    expect(row.hidden).toBe(true);
  });

  it('animates collapse and cancels keyframes on finish', async () => {
    let finishAll: Array<() => void> = [];
    const cancel = vi.fn();
    Element.prototype.animate = vi.fn().mockImplementation(() => {
      const finished = new Promise<Animation>((resolve) => {
        finishAll.push(() => resolve({} as Animation));
      });
      return { finished, cancel } as unknown as Animation;
    });

    const { container, rerender } = render(<MotionRowFixture collapsed={false} />);
    const row = container.querySelector('tr') as HTMLTableRowElement;
    expect(row.hidden).toBe(false);

    rerender(<MotionRowFixture collapsed />);
    expect(Element.prototype.animate).toHaveBeenCalled();
    expect(row.hidden).toBe(false);

    for (const done of finishAll) done();
    finishAll = [];

    await waitFor(() => expect(row.hidden).toBe(true));
    expect(cancel).toHaveBeenCalled();
  });
});
