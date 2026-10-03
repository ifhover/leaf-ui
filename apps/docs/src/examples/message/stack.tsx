import { Button, useMessage } from '@sudden3/leaf-ui';

export function MessageStack() {
  const { message, contextHolder } = useMessage();
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          message.close();
          message.open({ key: 'stack-first', content: '第一条消息将在一秒后消失', duration: 1 });
          message.open({
            key: 'stack-second',
            content: '后续消息会平滑上移',
            duration: 5,
            closable: true,
          });
          message.open({
            key: 'stack-third',
            content: '较长的消息内容也会根据实际高度自然收起，不会跳到新的位置。',
            type: 'success',
            duration: 7,
            closable: true,
          });
        }}
      >
        连续显示三条消息
      </Button>
      {contextHolder}
    </>
  );
}
