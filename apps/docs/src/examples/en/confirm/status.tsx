import { Button, Space, useConfirm } from '@ifhover/leaf-ui';

export function ConfirmStatus() {
  const { confirm } = useConfirm();
  return (
    <Space wrap>
      <Button
        onClick={() =>
          confirm({
            type: 'info',
            title: 'Share this link?',
            children: 'Anyone with the link can view this page.',
          })
        }
      >
        Information
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
    </Space>
  );
}
