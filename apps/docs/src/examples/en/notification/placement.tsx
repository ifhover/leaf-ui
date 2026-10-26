import { Button, Space, useNotification } from '@ifhover/leaf-ui';

const placements = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
] as const;

export function NotificationPlacement() {
  const notification = useNotification();
  return (
    <Space wrap>
      {placements.map(({ value, label }) => (
        <Button
          key={value}
          onClick={() =>
            notification.open({ title: 'You have a new notification', placement: value })
          }
        >
          {label}
        </Button>
      ))}
    </Space>
  );
}
