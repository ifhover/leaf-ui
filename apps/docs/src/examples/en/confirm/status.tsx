import { Button, Space, useConfirm } from '@ifhover/leaf-ui';
import { CircleX } from 'lucide-react';

export function ConfirmStatus() {
  const { confirm } = useConfirm();
  return (
    <Space wrap>
      <Button
        onClick={() =>
          confirm({
            title: 'Publish this article?',
            children: 'All workspace members will be able to read it.',
          })
        }
      >
        Default
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'success',
            title: 'Export ready',
            children: 'Your file is ready to download.',
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'warning',
            title: 'Leave this page?',
            children: 'Unsaved changes will be lost.',
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'danger',
            title: 'Delete project?',
            children: 'Related resources will be permanently removed.',
            confirmText: 'Delete',
          })
        }
      >
        Danger
      </Button>
      <Button
        onClick={() =>
          confirm({
            type: 'danger',
            icon: <CircleX />,
            showCancel: false,
            title: 'Import failed',
            children: 'Unsupported file format. Check the file and try again.',
          })
        }
      >
        Failure notice
      </Button>
    </Space>
  );
}
