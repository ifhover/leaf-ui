import { Button, Space, useNotification } from '@ifhover/leaf-ui';

export function NotificationStates() {
  const notification = useNotification();
  return (
    <Space wrap>
      <Button onClick={() => notification.info({ title: '有一条新的评论' })}>信息</Button>
      <Button onClick={() => notification.success({ title: '更改已保存' })}>成功</Button>
      <Button onClick={() => notification.warning({ title: '还有未保存的更改' })}>警告</Button>
      <Button onClick={() => notification.danger({ title: '保存失败，请重试' })}>失败</Button>
    </Space>
  );
}
