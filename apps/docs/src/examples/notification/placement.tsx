import { Button, Space, useNotification } from '@ifhover/leaf-ui';

const placements = [
  { value: 'top-left', label: '左上' },
  { value: 'top-right', label: '右上' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-right', label: '右下' },
] as const;

export function NotificationPlacement() {
  const notification = useNotification();
  return (
    <Space wrap>
      {placements.map(({ value, label }) => (
        <Button
          key={value}
          onClick={() => notification.open({ title: '有一条新的通知', placement: value })}
        >
          {label}
        </Button>
      ))}
    </Space>
  );
}
