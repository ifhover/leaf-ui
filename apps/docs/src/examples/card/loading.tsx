import { Card, Flex, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardLoading() {
  const [loading, setLoading] = useState(true);

  return (
    <Flex direction="column" gap="md">
      <Switch checked={loading} onChange={(event) => setLoading(event.currentTarget.checked)}>
        加载中
      </Switch>
      <Card title="项目资料" loading={loading}>
        在这里整理项目的说明与相关资料。
      </Card>
    </Flex>
  );
}
