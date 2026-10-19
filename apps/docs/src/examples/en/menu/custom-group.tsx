import { Button, MenuGroup, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function MenuCustomGroup() {
  const [created, setCreated] = useState(false);
  return (
    <MenuGroup title="Quick actions">
      <Space direction="vertical" align="start">
        <Text tone="muted">
          Place descriptions, buttons and other custom content below the title.
        </Text>
        <Button onClick={() => setCreated(true)}>Create project</Button>
        {created && <Text role="status">Project created</Text>}
      </Space>
    </MenuGroup>
  );
}
