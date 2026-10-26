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
            title: '保存更改？',
            children: '保存后，新设置会立即生效。',
            confirmText: '保存',
            cancelText: '继续编辑',
          });
          setResult(accepted ? '更改已保存' : '已取消保存');
        }}
      >
        保存更改
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
