import { Button, MenuGroup, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function MenuCustomGroup() {
  const [created, setCreated] = useState(false);
  return (
    <MenuGroup title="快捷操作">
      <Space direction="vertical" align="start">
        <Text tone="muted">分组标题下可以放说明、按钮和其他自定义内容。</Text>
        <Button onClick={() => setCreated(true)}>创建项目</Button>
        {created && <Text role="status">项目已创建</Text>}
      </Space>
    </MenuGroup>
  );
}
