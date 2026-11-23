import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Modal } from '../modal';
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

it('stacks Tour above an already-open modal', () => {
  render(
    <ConfigProvider locale="en-US">
      <Modal open title="Underlying dialog" />
      <Tour open steps={[{ title: 'Overlay step', description: 'Guided step.' }]} />
    </ConfigProvider>,
  );
  const tourDialog = screen.getByRole('dialog', { name: 'Overlay step' });
  const tourRoot = tourDialog.closest<HTMLElement>('.leaf-tour-root');
  expect(tourRoot?.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 2)');
  expect(tourDialog.style.zIndex).toBe('calc(var(--leaf-z-index-modal, 1100) + 3)');
});

it('clamps spotlight mask slices to viewport bounds and renders the spotlight outline inside Tour root', () => {
  const targetNode = document.createElement('button');
  targetNode.textContent = 'Target';
  document.body.appendChild(targetNode);
  const rectSpy = vi
    .spyOn(targetNode, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(2, 3, 80, 32));
  const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  try {
    render(
      <ConfigProvider locale="en-US">
        <Tour open steps={[{ title: 'Spotlight', target: () => targetNode }]} padding={8} />
      </ConfigProvider>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Spotlight' });
    expect(dialog.closest('.leaf-tour-root')).not.toBeNull();
    const maskSlices = Array.from(
      document.querySelectorAll<HTMLElement>('.leaf-tour__mask > div:not(.leaf-tour__spotlight)'),
    );
    expect(maskSlices).toHaveLength(4);
    for (const slice of maskSlices) {
      expect(Number.parseFloat(slice.style.top || '0')).toBeGreaterThanOrEqual(0);
      expect(Number.parseFloat(slice.style.left || '0')).toBeGreaterThanOrEqual(0);
      expect(Number.parseFloat(slice.style.width || '0')).toBeGreaterThanOrEqual(0);
      expect(Number.parseFloat(slice.style.height || '0')).toBeGreaterThanOrEqual(0);
    }
    const spotlight = document.querySelector<HTMLElement>('.leaf-tour__spotlight');
    expect(spotlight?.style.top).toBe('0px');
    expect(spotlight?.style.left).toBe('0px');
  } finally {
    rafSpy.mockRestore();
    rectSpy.mockRestore();
    targetNode.remove();
  }
});
