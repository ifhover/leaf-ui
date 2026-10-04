import { Button, useNotification } from '@sudden3/leaf-ui';

export function NotificationBasic() {
  const notification = useNotification();
  return (
    <Button
      onClick={() =>
        notification.open({
          title: 'Report ready',
          description: 'Your monthly report is ready to download.',
          actions: (
            <Button size="sm" onClick={() => notification.close()}>
              Got it
            </Button>
          ),
        })
      }
    >
      Show notification
    </Button>
  );
}
