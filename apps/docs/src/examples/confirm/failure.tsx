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
            title: '提交配置变更？',
            children: '此示例会模拟请求失败：确认框自动关闭并弹出失败提示。',
            onConfirm: async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 600));
              throw new Error('无法连接服务器，请检查网络后重试。');
            },
          });
          setResult(accepted ? '变更已提交' : '操作未完成');
        }}
      >
        提交（模拟失败）
      </Button>
      {result && (
        <Text tone="muted" role="status">
          {result}
        </Text>
      )}
    </Space>
  );
}
