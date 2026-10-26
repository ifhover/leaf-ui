import { Button, Flex, FloatButtonGroup, Space, Text } from '@ifhover/leaf-ui';
import { Pencil, Star } from 'lucide-react';
import { useState } from 'react';

export function FloatButtonControlled() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  return (
    <Space direction="vertical" align="start" size={32}>
      <Flex gap="sm" wrap>
        <Button onClick={() => setOpen(true)}>展开</Button>
        <Button onClick={() => setOpen(false)}>收起</Button>
      </Flex>
      <FloatButtonGroup
        fixed={false}
        open={open}
        onOpenChange={setOpen}
        actions={[
          { key: 'edit', label: '编辑', icon: <Pencil />, onClick: () => setAction('编辑') },
          { key: 'favorite', label: '收藏', icon: <Star />, onClick: () => setAction('收藏') },
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
