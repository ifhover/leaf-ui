import { Button, Card, CardTitle, Flex, Text, Typography } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ContentRegion() {
  const [saved, setSaved] = useState(false);
  return (
    <Typography>
      <Flex direction="column" gap="lg">
        <CardTitle level={2} size="lg" description="集中维护项目说明与交付资料。">
          项目资料
        </CardTitle>
        <Card title="发布说明" variant="layered">
          <Flex direction="column" gap="md">
            <Text>本次更新包含组件用法与接入说明。</Text>
            <Flex align="center" justify="space-between" gap="sm" wrap>
              <Text tone="muted" role="status">
                {saved ? '已保存' : '更改尚未保存'}
              </Text>
              <Button variant="solid" onClick={() => setSaved(true)}>
                保存更改
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Typography>
  );
}
