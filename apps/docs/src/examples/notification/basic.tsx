import { Button, useNotification } from '@ifhover/leaf-ui';

export function NotificationBasic() {
  const notification = useNotification();
  return (
    <Button
      onClick={() =>
        notification.open({
          title: '报告已生成',
          description: '月度报告已准备好，可以前往报告列表查看。',
        })
      }
    >
      显示通知
    </Button>
  );
}
