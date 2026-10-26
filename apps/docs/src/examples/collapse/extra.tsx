import { Button, Collapse, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CollapseExtra() {
  const [read, setRead] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Collapse
        items={[
          {
            key: 'notice',
            label: '通知',
            children: '文档已更新。',
            extra: (
              <Button size="sm" disabled={read} onClick={() => setRead(true)}>
                标记已读
              </Button>
            ),
          },
        ]}
      />
      <Text role="status" tone="muted">
        {read ? '已读' : '未读'}
      </Text>
    </Flex>
  );
}
