import { Button, useNotification } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function NotificationAsync() {
  const notification = useNotification();
  const [syncing, setSyncing] = useState(false);
  async function sync() {
    setSyncing(true);
    const key = notification.open({ title: 'Syncing', duration: 0 });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    notification.open({
      key,
      type: 'success',
      title: 'Sync complete',
      description: 'All changes have been synced.',
    });
    setSyncing(false);
  }
  return (
    <Button loading={syncing} onClick={sync}>
      Sync and update notification
    </Button>
  );
}
