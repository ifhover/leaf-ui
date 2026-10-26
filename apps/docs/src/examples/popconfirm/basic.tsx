import { Button, Flex, Popconfirm, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PopconfirmBasic() {
  const [removed, setRemoved] = useState(false);
  return (
    <Flex direction="column" gap="md" align="start">
      <Popconfirm
        title="移除此项目？"
        description="移除后仍可在回收站中恢复。"
        onConfirm={() => setRemoved(true)}
      >
        <Button variant="outline" danger disabled={removed}>
          移除项目
        </Button>
      </Popconfirm>
      {removed && <Text role="status">项目已移除。</Text>}
    </Flex>
  );
}
