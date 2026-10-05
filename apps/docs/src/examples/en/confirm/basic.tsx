import { Button, useConfirm, useMessage } from '@sudden3/leaf-ui';
export function ConfirmBasic() {
  const { confirm } = useConfirm();
  const { message } = useMessage();
  return (
    <>
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
      <div className="leaf-demo-row">
        {(['default', 'info', 'success', 'warning'] as const).map((type) => (
          <Button
            key={type}
            variant="outline"
            onClick={() =>
              confirm({
                type,
                title: {
                  default: 'Confirmation',
                  info: 'Information',
                  success: 'Success',
                  warning: 'Warning',
                }[type],
                children: 'Please review this notice.',
              })
            }
          >
            {type}
          </Button>
        ))}
      </div>
    </>
  );
}
