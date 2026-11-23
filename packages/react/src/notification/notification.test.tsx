import { act, render, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { NotificationProvider, useNotification } from './notification';

it('exposes danger as the canonical feedback method and keeps error compatible', async () => {
  let notification: ReturnType<typeof useNotification> | undefined;
  function Example() {
    notification = useNotification();
    return null;
  }
  render(
    <NotificationProvider>
      <Example />
    </NotificationProvider>,
  );
  await act(async () => {
    notification?.danger({ title: 'Danger notification', duration: 0 });
  });
  expect(screen.getByRole('alert')).toHaveClass('leaf-notification--danger');
  act(() => notification?.close());
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  await act(async () => {
    notification?.error({ title: 'Legacy error notification', duration: 0 });
  });
  expect(screen.getByRole('alert')).toHaveClass('leaf-notification--danger');
});

it('inherits scoped theme appearance, direction, lang, and density tokens from caller config', async () => {
  let notification: ReturnType<typeof useNotification> | undefined;
  function Trigger() {
    notification = useNotification();
    return null;
  }
  render(
    <NotificationProvider>
      <ConfigProvider
        locale="ar-EG"
        direction="rtl"
        density="compact"
        theme={{ appearance: 'dark', primaryColor: '#1d4ed8' }}
      >
        <Trigger />
      </ConfigProvider>
    </NotificationProvider>,
  );
  await act(async () => {
    notification?.info({ title: 'Scoped notice', duration: 0 });
  });
  const slot = screen.getByRole('status').closest<HTMLElement>('.leaf-notification-slot');
  expect(slot).toHaveAttribute('data-leaf-theme', 'dark');
  expect(slot).toHaveAttribute('dir', 'rtl');
  expect(slot).toHaveAttribute('lang', 'ar-EG');
  expect(slot?.style.getPropertyValue('--leaf-control-height')).toBe('28px');
  expect(slot?.style.getPropertyValue('--leaf-color-primary')).toBe('#1d4ed8');
});
