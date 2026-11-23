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
            title: '第一步：确认发布内容？',
            children: '关闭当前框后，队列中的下一个确认框会自动弹出。',
            confirmText: '下一步',
          });
          const second = confirm({
            type: 'warning',
            title: '第二步：覆盖线上版本？',
            children: '发布后旧版本链接将切换为新版本内容。',
            confirmText: '发布',
          });
          const [step1, step2] = await Promise.all([first, second]);
          setSummary(
            `步骤一：${step1 ? '已确认' : '已取消'}；步骤二：${step2 ? '已确认' : '已取消'}`,
          );
        }}
      >
        连续确认两次
      </Button>
      {summary && (
        <Text tone="muted" role="status">
          {summary}
        </Text>
      )}
    </Space>
  );
}
