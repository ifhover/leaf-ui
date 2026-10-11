import { Button, Space, useConfirm, useMessage } from '@ifhover/leaf-ui';
export function ConfirmBasic() {
  const { confirm } = useConfirm();
  const { message } = useMessage();
  return (
    <Space direction="vertical" align="center">
      <Button
        danger
        variant="outline"
        onClick={async () => {
          const accepted = await confirm({
            title: 'Delete project',
            children: 'This cannot be undone. Continue?',
            type: 'danger',
            onConfirm: () => new Promise((resolve) => setTimeout(resolve, 900)),
          });
          if (accepted) message.success('Project deleted');
        }}
      >
        Delete project
      </Button>
    </Space>
  );
}
