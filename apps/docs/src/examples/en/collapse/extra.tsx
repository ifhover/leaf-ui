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
            label: 'Notice',
            children: 'The documentation has been updated.',
            extra: (
              <Button size="sm" disabled={read} onClick={() => setRead(true)}>
                Mark read
              </Button>
            ),
          },
        ]}
      />
      <Text role="status" tone="muted">
        {read ? 'Read' : 'Unread'}
      </Text>
    </Flex>
  );
}
