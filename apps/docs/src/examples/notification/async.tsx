import { Button, useNotification } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function NotificationAsync() {
  const notification = useNotification();
  const [syncing, setSyncing] = useState(false);
  async function sync() {
    setSyncing(true);
    const key = notification.open({ title: '正在同步', duration: 0 });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    notification.open({
      key,
      type: 'success',
      title: '同步完成',
      description: '所有更改已同步。',
    });
    setSyncing(false);
  }
  return (
    <Button loading={syncing} onClick={sync}>
      同步并更新通知
    </Button>
  );
}
