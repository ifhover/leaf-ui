import { Button, Space, Text, useConfirm } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfirmBasic() {
  const { confirm } = useConfirm();
  const [result, setResult] = useState('');
  return (
    <Space direction="vertical" align="start">
      <Button
        danger
        variant="outline"
        onClick={async () => {
          setResult('');
          const accepted = await confirm({
            title: 'Delete project',
            children: 'This cannot be undone. Continue?',
            type: 'danger',
            onConfirm: () => new Promise<void>((resolve) => setTimeout(resolve, 900)),
          });
          setResult(accepted ? 'Project deleted' : 'Deletion cancelled');
        }}
      >
        Delete project
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
