import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { useRowMotion } from './row-motion';

const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate');
afterEach(() => {
  vi.restoreAllMocks();
  if (descriptor) Object.defineProperty(HTMLElement.prototype, 'animate', descriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

function Harness({ collapsed = false, motion = true, enabled = true }) {
  return (
    <ConfigProvider theme={{ motion }}>
      <table>
        <tbody>
          <Row collapsed={collapsed} enabled={enabled} />
        </tbody>
      </table>
    </ConfigProvider>
  );
}

function Row({ collapsed, enabled }: { collapsed: boolean; enabled: boolean }) {
  const ref = useRef<HTMLTableRowElement>(null);
  const hidden = useRowMotion(ref, collapsed, enabled);
  return (
    <tr ref={ref} hidden={hidden}>
      <td style={{ padding: '12px', borderBottom: '1px solid' }}>
        <div className="leaf-data-table__row-content" style={{ height: 36 }}>
          <input defaultValue="Draft" />
        </div>
      </td>
    </tr>
  );
}

function recordAnimations() {
  const records: {
    node: HTMLElement;
    frames: Keyframe[];
    cancel: ReturnType<typeof vi.fn>;
    finish: () => void;
  }[] = [];
  const animate = vi.fn(function (this: HTMLElement, frames: Keyframe[]) {
    let finish = () => {};
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const cancel = vi.fn();
    records.push({ node: this, frames, cancel, finish });
    return { finished, cancel } as unknown as Animation;
  });
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  return { records, animate };
}

it('reverses from the currently rendered height and preserves native content after finishing', async () => {
  const { records } = recordAnimations();
  const { container, rerender } = render(<Harness />);
  const input = container.querySelector('input') as HTMLInputElement;
  input.value = 'Unsaved draft';
  rerender(<Harness collapsed />);
  expect(records[0]?.frames[0]?.height).toBe('36px');
  expect(container.querySelector('tr')).not.toHaveAttribute('hidden');
  const content = records[0]?.node as HTMLElement;
  // Simulate the current browser-composited height partway through closing.
  content.style.height = '14px';
  rerender(<Harness />);
  expect(records[0]?.cancel).toHaveBeenCalledOnce();
  expect(records[2]?.frames[0]?.height).toBe('14px');
  expect(container.querySelector('input')).toBe(input);
  expect(input.value).toBe('Unsaved draft');
  await act(async () => {
    for (const record of records) record.finish();
  });
  expect(container.querySelector('tr')).not.toHaveAttribute('hidden');
  rerender(<Harness collapsed />);
  await act(async () => {
    for (const record of records) record.finish();
  });
  expect(container.querySelector('tr')).toHaveAttribute('hidden');
  expect(records.every((record) => record.cancel.mock.calls.length === 1)).toBe(true);
});

it('cancels running motion on preference changes and unmount and hides immediately when disabled', () => {
  const { records, animate } = recordAnimations();
  const { container, rerender, unmount } = render(<Harness />);
  rerender(<Harness collapsed />);
  rerender(<Harness collapsed motion={false} />);
  expect(records.every((record) => record.cancel.mock.calls.length === 1)).toBe(true);
  expect(container.querySelector('tr')).toHaveAttribute('hidden');
  animate.mockClear();
  rerender(<Harness motion={false} />);
  rerender(<Harness collapsed motion={false} />);
  expect(animate).not.toHaveBeenCalled();
  rerender(<Harness enabled={false} />);
  rerender(<Harness collapsed enabled={false} />);
  expect(animate).not.toHaveBeenCalled();
  rerender(<Harness />);
  expect(animate).toHaveBeenCalled();
  unmount();
  expect(records.every((record) => record.cancel.mock.calls.length === 1)).toBe(true);
});
