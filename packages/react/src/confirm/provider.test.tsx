import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, ConfirmProvider, useConfirm, useMessage } from '../index';
import type { ConfirmApi } from './store';

describe('Managed confirmations', () => {
  it('shares a queue across consumers and waits for dismissal before showing the next request', async () => {
    let first: ConfirmApi | undefined;
    let second: ConfirmApi | undefined;
    const renders = vi.fn();
    function First() {
      first = useConfirm();
      expect(Object.keys(first)).toEqual(['confirm']);
      renders();
      return null;
    }
    function Second() {
      second = useConfirm();
      return null;
    }
    render(
      <ConfigProvider>
        <First />
        <Second />
      </ConfigProvider>,
    );
    const before = renders.mock.calls.length;
    let firstResult: Promise<boolean> | undefined;
    let secondResult: Promise<boolean> | undefined;
    act(() => {
      firstResult = first?.confirm({ title: 'First', children: 'First content' });
      secondResult = second?.confirm({ title: 'Second' });
    });
    expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('First');
    expect(renders).toHaveBeenCalledTimes(before);
    const mask = screen.getByRole('alertdialog').closest('.leaf-modal-mask');
    if (mask instanceof HTMLElement) mask.style.transitionDuration = '160ms';
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    await expect(firstResult).resolves.toBe(false);
    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.queryByText('Second')).toBeNull();
    if (mask) fireEvent.transitionEnd(mask, { propertyName: 'opacity' });
    expect(await screen.findByRole('alertdialog', { name: 'Second' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    await expect(secondResult).resolves.toBe(true);
  });

  it('retains rejected actions and blocks duplicate submissions until an async action finishes', async () => {
    let finish: () => void = () => {};
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Try again'))
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StrictMode>
        <ConfigProvider locale="en-US">{children}</ConfigProvider>
      </StrictMode>
    );
    const { result } = renderHook(() => useConfirm(), { wrapper });
    let answer: Promise<boolean> | undefined;
    act(() => {
      answer = result.current.confirm({ title: 'Save', onConfirm: submit });
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(submit).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await act(async () => finish());
    await expect(answer).resolves.toBe(true);
  });

  it('inherits and updates regional theme and language without replacing the API', async () => {
    let api: ConfirmApi | undefined;
    function Consumer() {
      api = useConfirm();
      return null;
    }
    const app = (english: boolean) => (
      <ConfigProvider theme={{ borderRadius: 8 }}>
        <ConfigProvider
          locale={english ? 'en-US' : 'zh-CN'}
          theme={{ primaryColor: english ? '#7654c6' : '#087f8c', borderRadius: english ? 4 : 16 }}
        >
          <Consumer />
        </ConfigProvider>
      </ConfigProvider>
    );
    const { rerender } = render(app(true));
    let answer: Promise<boolean> | undefined;
    act(() => {
      answer = api?.confirm({ title: 'Scoped' });
    });
    const original = api;
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    const scope = document.querySelector('.leaf-confirm-scope') as HTMLElement;
    expect(scope.style.getPropertyValue('--leaf-radius')).toBe('4px');
    expect(scope.style.getPropertyValue('--leaf-color-primary')).toBe('#7654c6');
    rerender(app(false));
    expect(api).toBe(original);
    expect(scope.style.getPropertyValue('--leaf-radius')).toBe('16px');
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(answer).resolves.toBe(false);
  });

  it('cancels an unmounted consumer and its queued requests without affecting another consumer', async () => {
    let first: ConfirmApi | undefined;
    let second: ConfirmApi | undefined;
    let finish: () => void = () => {};
    function First() {
      first = useConfirm();
      return null;
    }
    function Second() {
      second = useConfirm();
      return null;
    }
    const app = (show: boolean) => (
      <ConfigProvider>
        {show && <First />}
        <Second />
      </ConfigProvider>
    );
    const { rerender } = render(app(true));
    const late = first;
    let active: Promise<boolean> | undefined;
    let queued: Promise<boolean> | undefined;
    let other: Promise<boolean> | undefined;
    act(() => {
      active = first?.confirm({
        title: 'First',
        onConfirm: () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      });
      queued = first?.confirm({ title: 'Queued' });
      other = second?.confirm({ title: 'Other' });
    });
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    rerender(app(false));
    await expect(active).resolves.toBe(false);
    await expect(queued).resolves.toBe(false);
    await expect(late?.confirm({ title: 'Late' })).resolves.toBe(false);
    expect(await screen.findByRole('alertdialog', { name: 'Other' })).toBeInTheDocument();
    await act(async () => finish());
    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Other');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    await expect(other).resolves.toBe(true);
  });

  it('isolates explicit providers and resolves every pending request when a provider unmounts', async () => {
    let first: ConfirmApi | undefined;
    let second: ConfirmApi | undefined;
    function First() {
      first = useConfirm();
      return null;
    }
    function Second() {
      second = useConfirm();
      return null;
    }
    const root = render(
      <ConfirmProvider>
        <First />
      </ConfirmProvider>,
    );
    render(
      <ConfirmProvider>
        <Second />
      </ConfirmProvider>,
    );
    let active: Promise<boolean> | undefined;
    let queued: Promise<boolean> | undefined;
    let other: Promise<boolean> | undefined;
    act(() => {
      active = first?.confirm({ title: 'First root' });
      queued = first?.confirm({ title: 'Queued' });
      other = second?.confirm({ title: 'Second root' });
    });
    root.unmount();
    await expect(active).resolves.toBe(false);
    await expect(queued).resolves.toBe(false);
    await expect(first?.confirm({ title: 'Late' })).resolves.toBe(false);
    const dialog = screen.getByRole('alertdialog', { name: 'Second root' });
    fireEvent.click(within(dialog).getByRole('button', { name: '取消' }));
    await expect(other).resolves.toBe(false);
  });

  it('renders no confirmation on the server and hydrates without replacing the trigger', async () => {
    let api: ConfirmApi | undefined;
    let answer: Promise<boolean> | undefined;
    function Consumer() {
      api = useConfirm();
      return (
        <Button
          onClick={() => {
            answer = api?.confirm({ title: 'Hydrated' });
          }}
        >
          Open
        </Button>
      );
    }
    const app = (
      <ConfigProvider>
        <Consumer />
      </ConfigProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(app);
    document.body.append(container);
    const trigger = container.querySelector('button');
    expect(container.querySelector('.leaf-modal-mask')).toBeNull();
    const recover = vi.fn();
    const root = hydrateRoot(container, app, { onRecoverableError: recover });
    try {
      await act(async () => {});
      expect(recover).not.toHaveBeenCalled();
      expect(container.querySelector('button')).toBe(trigger);
      if (trigger) fireEvent.click(trigger);
      expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Hydrated');
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
    await expect(answer).resolves.toBe(false);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('requires an entry provider for both hooks', () => {
    expect(() => renderHook(() => useConfirm())).toThrow('ConfigProvider or ConfirmProvider');
    expect(() => renderHook(() => useMessage())).toThrow('ConfigProvider or MessageProvider');
  });
});
