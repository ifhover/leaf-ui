import { Button, Space, Text, useConfirm } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfirmRetry() {
  const { confirm } = useConfirm();
  const [result, setResult] = useState('');
  return (
    <Space direction="vertical" align="start">
      <Button
        onClick={async () => {
          let attempts = 0;
          setResult('');
          const accepted = await confirm({
            type: 'warning',
            title: 'Submit changes?',
            children: 'The first attempt simulates a failure. Confirm again to retry.',
            onConfirm: async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 600));
              if (++attempts === 1) throw new Error('Unable to submit. Please try again.');
            },
          });
          setResult(accepted ? 'Changes submitted' : 'Submission cancelled');
        }}
      >
        Submit with retry
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
