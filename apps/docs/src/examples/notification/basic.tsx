import { Button, useNotification } from '@sudden3/leaf-ui';

export function NotificationBasic() {
  const notification = useNotification();
  return (
    <Button
      onClick={() =>
        notification.open({
          title: '报告已生成',
          description: '你的月度报告已准备好，可以下载查看。',
          actions: (
            <Button size="sm" onClick={() => notification.close()}>
              知道了
            </Button>
          ),
        })
      }
    >
      显示通知
    </Button>
  );
}
