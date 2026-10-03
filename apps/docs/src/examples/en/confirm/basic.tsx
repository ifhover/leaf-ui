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
            title: 'Delete project',
            children: 'This cannot be undone. Continue?',
            danger: true,
            onConfirm: () => new Promise((resolve) => setTimeout(resolve, 900)),
          });
          if (accepted) feedback.message.success('Project deleted');
        }}
      >
        Delete project
      </Button>
      {contextHolder}
      {feedback.contextHolder}
    </>
  );
}
