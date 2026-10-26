import { Button, useNotification } from '@ifhover/leaf-ui';

export function NotificationBasic() {
  const notification = useNotification();
  return (
    <Button
      onClick={() =>
        notification.open({
          title: 'Report ready',
          description: 'Your monthly report is available in the report list.',
        })
      }
    >
      Show notification
    </Button>
  );
}
