import { Button, Space, useConfirm } from '@ifhover/leaf-ui';
import { Trash2 } from 'lucide-react';

export function ConfirmIcon() {
  const { confirm } = useConfirm();
  return (
    <Space wrap>
      <Button
        onClick={() =>
          confirm({
            type: 'danger',
            icon: <Trash2 />,
            title: 'Delete chat?',
            children: 'This permanently deletes the conversation and saved memories.',
            confirmText: 'Delete',
          })
        }
      >
        Custom icon
      </Button>
      <Button
        onClick={() =>
          confirm({
            icon: null,
            title: 'Reset filters?',
            children: 'The table returns to its default sorting and columns.',
          })
        }
      >
        Hidden icon
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'warning',
            showCancel: false,
            confirmText: 'Got it',
            title: 'Scheduled maintenance',
            children: 'Service will restart at 23:00 for about 10 minutes.',
          })
        }
      >
        Single action
      </Button>
    </Space>
  );
}
