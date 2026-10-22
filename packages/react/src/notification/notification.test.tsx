import { act, render, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
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
