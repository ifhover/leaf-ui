import { Button, Space, useMessage } from '@ifhover/leaf-ui';
import { useId } from 'react';

function StartAction({ messageKey }: { messageKey: string }) {
  const { message } = useMessage();
  return (
    <Button
      onClick={() => message.open({ key: messageKey, type: 'loading', content: 'Processing' })}
    >
      Start processing
    </Button>
  );
}

function ResultAction({ messageKey }: { messageKey: string }) {
  const { message } = useMessage();
  return (
    <Button
      onClick={() =>
        message.open({ key: messageKey, type: 'success', content: 'Processing complete' })
      }
    >
      Update result
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
