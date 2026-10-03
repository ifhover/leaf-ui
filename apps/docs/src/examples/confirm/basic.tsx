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
            type: 'danger',
            onConfirm: () => new Promise((resolve) => setTimeout(resolve, 900)),
          });
          if (accepted) feedback.message.success('项目已删除');
        }}
      >
        删除项目
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
                  default: '默认确认',
                  info: '信息提示',
                  success: '操作成功',
                  warning: '操作警告',
                }[type],
                children: '请查看提示内容。',
              })
            }
          >
            {type}
          </Button>
        ))}
      </div>
      {contextHolder}
      {feedback.contextHolder}
    </>
  );
}
