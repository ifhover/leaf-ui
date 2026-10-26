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
            title: '删除项目',
            children: '删除后无法恢复，请确认是否继续。',
            type: 'danger',
            onConfirm: () => new Promise<void>((resolve) => setTimeout(resolve, 900)),
          });
          setResult(accepted ? '项目已删除' : '已取消删除');
        }}
      >
        删除项目
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
