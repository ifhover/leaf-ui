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
            title: '提交更改？',
            children: '首次提交模拟失败，再次确认即可重试。',
            onConfirm: async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 600));
              if (++attempts === 1) throw new Error('暂时无法提交，请重试。');
            },
          });
          setResult(accepted ? '更改已提交' : '已取消提交');
        }}
      >
        提交与重试
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
