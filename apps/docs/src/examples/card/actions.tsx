import { Button, Card, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardActions() {
  const [saved, setSaved] = useState(false);

  return (
    <Card
      title="项目资料"
      extra={
        <Button variant="link" disabled={!saved} onClick={() => setSaved(false)}>
          重置
        </Button>
      }
      footer={
        <Flex justify="end">
          <Button disabled={saved} onClick={() => setSaved(true)}>
            保存
          </Button>
        </Flex>
      }
    >
      <Text role="status">{saved ? '修改已保存。' : '有尚未保存的修改。'}</Text>
    </Card>
  );
}
