import { Button, Space, Text, useConfirm } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ConfirmQueue() {
  const { confirm } = useConfirm();
  const [summary, setSummary] = useState('');
  return (
    <Space direction="vertical" align="start">
      <Button
        onClick={async () => {
          setSummary('');
          const first = confirm({
            title: 'Step 1: Confirm release notes?',
            children: 'The next queued dialog opens after this one closes.',
            confirmText: 'Next',
          });
          const second = confirm({
            type: 'warning',
            title: 'Step 2: Overwrite live build?',
            children: 'Existing links will point to the new release.',
            confirmText: 'Publish',
          });
          const [step1, step2] = await Promise.all([first, second]);
          setSummary(
            `Step 1: ${step1 ? 'confirmed' : 'cancelled'}; Step 2: ${step2 ? 'confirmed' : 'cancelled'}`,
          );
        }}
      >
        Queue two confirmations
      </Button>
      {summary && (
        <Text tone="muted" role="status">
          {summary}
        </Text>
      )}
    </Space>
  );
}
