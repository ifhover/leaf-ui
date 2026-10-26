import { Button, Space, useNotification } from '@ifhover/leaf-ui';

export function NotificationStates() {
  const notification = useNotification();
  return (
    <Space wrap>
      <Button onClick={() => notification.info({ title: 'You have a new comment' })}>Info</Button>
      <Button onClick={() => notification.success({ title: 'Changes saved' })}>Success</Button>
      <Button onClick={() => notification.warning({ title: 'You have unsaved changes' })}>
        Warning
      </Button>
      <Button onClick={() => notification.danger({ title: 'Unable to save. Please try again.' })}>
        Error
      </Button>
    </Space>
  );
}
