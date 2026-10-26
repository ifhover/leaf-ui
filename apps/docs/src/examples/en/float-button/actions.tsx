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
          { key: 'share', label: 'Share', icon: <Share2 />, onClick: () => setAction('Share') },
          {
            key: 'comment',
            label: 'Comment',
            icon: <MessageSquare />,
            onClick: () => setAction('Comment'),
          },
        ]}
      />
      {action && (
        <Text tone="muted" role="status">
          Selected: {action}
        </Text>
      )}
    </Space>
  );
}
