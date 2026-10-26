import { Button, useMessage } from '@ifhover/leaf-ui';

export function MessageManual() {
  const { message } = useMessage();
  return (
    <Button
      onClick={() =>
        message.open({ content: '此消息会保留到手动关闭', duration: 0, closable: true })
      }
    >
      显示持续消息
    </Button>
  );
}
