import { Alert, Button, Flex } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AlertClosable() {
  const [version, setVersion] = useState(0);

  return (
    <Flex direction="column" gap="md">
      <Alert
        key={version}
        title="草稿已自动保存"
        description="即使关闭这条提示，当前编辑进度仍会保留。"
        closable
      />
      <Flex>
        <Button onClick={() => setVersion((value) => value + 1)}>重新显示</Button>
      </Flex>
    </Flex>
  );
}
