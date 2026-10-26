import { Button, Space, useMessage } from '@ifhover/leaf-ui';
import { useId } from 'react';

function StartAction({ messageKey }: { messageKey: string }) {
  const { message } = useMessage();
  return (
    <Button onClick={() => message.open({ key: messageKey, type: 'loading', content: '正在处理' })}>
      开始处理
    </Button>
  );
}

function ResultAction({ messageKey }: { messageKey: string }) {
  const { message } = useMessage();
  return (
    <Button onClick={() => message.open({ key: messageKey, type: 'success', content: '处理完成' })}>
      更新结果
    </Button>
  );
}

export function MessageShared() {
  const messageKey = useId();
  return (
    <Space wrap>
      <StartAction messageKey={messageKey} />
      <ResultAction messageKey={messageKey} />
    </Space>
  );
}
