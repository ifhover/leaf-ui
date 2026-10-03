import { Button, useConfirm, useMessage } from '@sudden3/leaf-ui';
export function ConfirmBasic() {
  const { confirm, contextHolder } = useConfirm();
  const feedback = useMessage();
  return (
    <>
      <Button
        danger
        variant="outline"
        onClick={async () => {
          const accepted = await confirm({
            title: '删除项目',
            children: '删除后无法恢复，请确认是否继续。',
            danger: true,
            onConfirm: () => new Promise((resolve) => setTimeout(resolve, 900)),
          });
          if (accepted) feedback.message.success('项目已删除');
        }}
      >
        删除项目
      </Button>
      {contextHolder}
      {feedback.contextHolder}
    </>
  );
}
