import { Card, Flex, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardLoading() {
  const [loading, setLoading] = useState(true);

  return (
    <Flex direction="column" gap="md">
      <Switch checked={loading} onChange={(event) => setLoading(event.currentTarget.checked)}>
        Loading
      </Switch>
      <Card title="Project details" loading={loading}>
        Keep project notes and related resources together.
      </Card>
    </Flex>
  );
}
