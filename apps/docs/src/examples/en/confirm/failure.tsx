import { Button, Space, Text, useConfirm } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfirmFailure() {
  const { confirm } = useConfirm();
  const [result, setResult] = useState('');
  return (
    <Space direction="vertical" align="start">
      <Button
        onClick={async () => {
          setResult('');
          const accepted = await confirm({
            type: 'warning',
            title: 'Submit configuration changes?',
            children: 'This action fails so the dialog closes and opens a failure notice.',
            onConfirm: async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 600));
              throw new Error('Unable to reach the server. Check your connection and try again.');
            },
          });
          setResult(accepted ? 'Changes submitted' : 'Action failed or cancelled');
        }}
      >
        Submit (simulate failure)
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
