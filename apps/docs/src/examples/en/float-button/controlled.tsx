import { Button, Flex, FloatButtonGroup, Space, Text } from '@ifhover/leaf-ui';
import { Pencil, Star } from 'lucide-react';
import { useState } from 'react';

export function FloatButtonControlled() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  return (
    <Space direction="vertical" align="start" size={32}>
      <Flex gap="sm" wrap>
        <Button onClick={() => setOpen(true)}>Expand</Button>
        <Button onClick={() => setOpen(false)}>Collapse</Button>
      </Flex>
      <FloatButtonGroup
        fixed={false}
        open={open}
        onOpenChange={setOpen}
        actions={[
          { key: 'edit', label: 'Edit', icon: <Pencil />, onClick: () => setAction('Edit') },
          {
            key: 'favorite',
            label: 'Favorite',
            icon: <Star />,
            onClick: () => setAction('Favorite'),
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
