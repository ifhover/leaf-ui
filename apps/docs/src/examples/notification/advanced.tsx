import { Button, Space, useNotification } from '@sudden3/leaf-ui';

export function NotificationOptions() {
  const notification = useNotification();
  return (
    <Space wrap>
      <Button
        variant="outline"
        onClick={() =>
          notification.success({
            title: '保存成功',
            description: '所有更改已保存。',
            placement: 'bottom-right',
          })
        }
      >
        成功通知
      </Button>
      <Button
        variant="outline"
        danger
        onClick={() =>
          notification.error({
            key: 'sync',
            title: '同步失败',
            description: '请检查连接后重试。',
            duration: 0,
          })
        }
      >
        持续错误通知
      </Button>
      <Button
        variant="ghost"
        onClick={() => notification.open({ key: 'sync', title: '重新同步中', duration: 2 })}
      >
        更新同一通知
      </Button>
    </Space>
  );
}
