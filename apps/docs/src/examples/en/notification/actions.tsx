import { Button, Space, Text, useNotification } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function NotificationActions() {
  const notification = useNotification();
  const key = useId();
  const [read, setRead] = useState(false);
  return (
    <Space direction="vertical" align="start">
      <Button
        onClick={() => {
          setRead(false);
          notification.open({
            key,
            title: 'New document comment',
            description: 'Someone left a comment on your document.',
            duration: 0,
            actions: (
              <Button
                size="sm"
                onClick={() => {
                  setRead(true);
                  notification.close(key);
                }}
              >
                Mark as read
              </Button>
            ),
          });
        }}
      >
        Show notification with action
      </Button>
      {read && (
        <Text tone="muted" role="status">
          Marked as read
        </Text>
      )}
    </Space>
  );
}
