import { Button, Space, useNotification } from '@sudden3/leaf-ui';

export function NotificationOptions() {
  const notification = useNotification();
  return (
    <Space wrap>
      <Button
        variant="outline"
        onClick={() =>
          notification.success({
            title: 'Saved successfully',
            description: 'All changes were saved.',
            placement: 'bottom-right',
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        danger
        onClick={() =>
          notification.error({
            key: 'sync',
            title: 'Sync failed',
            description: 'Check your connection and retry.',
            duration: 0,
          })
        }
      >
        Persistent error
      </Button>
      <Button
        variant="ghost"
        onClick={() => notification.open({ key: 'sync', title: 'Syncing again', duration: 2 })}
      >
        Update notification
      </Button>
    </Space>
  );
}
