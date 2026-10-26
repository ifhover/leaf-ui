import { Button, MenuGroup, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function MenuCustomGroup() {
  const [created, setCreated] = useState(false);
  return (
    <MenuGroup title="快捷操作">
      <Space direction="vertical" align="start">
        <Button onClick={() => setCreated(true)}>创建项目</Button>
        {created && <Text role="status">项目已创建</Text>}
      </Space>
    </MenuGroup>
  );
}
