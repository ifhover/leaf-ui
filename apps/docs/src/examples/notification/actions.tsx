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
            title: '文档有新评论',
            description: '有人在你的文档中留下了评论。',
            duration: 0,
            actions: (
              <Button
                size="sm"
                onClick={() => {
                  setRead(true);
                  notification.close(key);
                }}
              >
                标记已读
              </Button>
            ),
          });
        }}
      >
        显示带操作的通知
      </Button>
      {read && (
        <Text tone="muted" role="status">
          已标记为已读
        </Text>
      )}
    </Space>
  );
}
