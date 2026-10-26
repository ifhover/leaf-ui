import { Button, Space, Text, useConfirm } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfirmSimple() {
  const { confirm } = useConfirm();
  const [result, setResult] = useState('');
  return (
    <Space direction="vertical" align="start">
      <Button
        onClick={async () => {
          const accepted = await confirm({
            title: 'Save changes?',
            children: 'The new settings will take effect immediately.',
            confirmText: 'Save',
            cancelText: 'Keep editing',
          });
          setResult(accepted ? 'Changes saved' : 'Save cancelled');
        }}
      >
        Save changes
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
