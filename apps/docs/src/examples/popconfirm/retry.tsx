import { Button, Flex, Popconfirm, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function PopconfirmRetry() {
  const attempted = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Popconfirm
        title="提交审核？"
        onConfirm={async () => {
          setError('');
          await new Promise<void>((resolve) => setTimeout(resolve, 900));
          if (!attempted.current) {
            attempted.current = true;
            throw new Error('网络暂时不可用。');
          }
          setSubmitted(true);
        }}
        onError={(reason) => setError(reason instanceof Error ? reason.message : String(reason))}
      >
        <Button variant="outline" disabled={submitted}>
          提交并重试
        </Button>
      </Popconfirm>
      <Text role="status" tone="muted">
        {submitted ? '已提交审核。' : error}
      </Text>
    </Flex>
  );
}
