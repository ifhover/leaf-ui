import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Tour } from './tour';

it('releases focus and scrolling during dismissal and cancels removal when reopened', () => {
  const close = vi.fn();
  const steps = [{ title: 'First step', description: 'A useful explanation.' }];
  const example = (open: boolean) => (
    <ConfigProvider locale="en-US">
      <button type="button">Launch</button>
      <Tour open={open} steps={steps} onClose={close} />
    </ConfigProvider>
  );
  const { rerender } = render(example(false));
  const trigger = screen.getByRole('button', { name: 'Launch' });
  trigger.focus();
  rerender(example(true));
  const dialog = screen.getByRole('dialog', { name: 'First step' });
  const root = dialog.closest<HTMLElement>('.leaf-tour-root');
  if (!root) throw new Error('Tour root missing');
  root.style.transitionDuration = '200ms';
  expect(document.body.style.overflow).toBe('hidden');
  rerender(example(false));
  expect(root).toHaveAttribute('inert');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(trigger).toHaveFocus();
  expect(document.body.style.overflow).toBe('');
  rerender(example(true));
  fireEvent.transitionEnd(root, { propertyName: 'opacity' });
  expect(screen.getByRole('dialog', { name: 'First step' })).toBe(dialog);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(close).toHaveBeenCalledOnce();
  rerender(example(false));
  fireEvent.transitionEnd(root, { propertyName: 'opacity' });
  expect(root).not.toBeInTheDocument();
});

it('keeps the existing action focused when changing a step', () => {
  render(
    <ConfigProvider locale="en-US">
      <Tour open steps={[{ title: 'First' }, { title: 'Second' }, { title: 'Third' }]} />
    </ConfigProvider>,
  );
  const next = screen.getByRole('button', { name: 'Next' });
  next.focus();
  fireEvent.click(next);
  expect(screen.getByRole('dialog', { name: 'Second' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBe(next);
  expect(next).toHaveFocus();
});
