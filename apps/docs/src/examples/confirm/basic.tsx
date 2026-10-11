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
            title: '删除项目',
            children: '删除后无法恢复，请确认是否继续。',
            type: 'danger',
            onConfirm: () => new Promise((resolve) => setTimeout(resolve, 900)),
          });
          if (accepted) message.success('项目已删除');
        }}
      >
        删除项目
      </Button>
    </Space>
  );
}
