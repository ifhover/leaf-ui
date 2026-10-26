import { FloatButtonGroup, Space, Text } from '@ifhover/leaf-ui';
import { MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';

export function FloatButtonActions() {
  const [action, setAction] = useState('');
  return (
    <Space direction="vertical" align="start">
      <FloatButtonGroup
        fixed={false}
        actions={[
          { key: 'share', label: '分享', icon: <Share2 />, onClick: () => setAction('分享') },
          {
            key: 'comment',
            label: '评论',
            icon: <MessageSquare />,
            onClick: () => setAction('评论'),
          },
        ]}
      />
      {action && (
        <Text tone="muted" role="status">
          已选择：{action}
        </Text>
      )}
    </Space>
  );
}
