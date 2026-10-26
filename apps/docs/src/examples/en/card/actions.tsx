import { Button, Card, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardActions() {
  const [saved, setSaved] = useState(false);

  return (
    <Card
      title="Project details"
      extra={
        <Button variant="link" disabled={!saved} onClick={() => setSaved(false)}>
          Reset
        </Button>
      }
      footer={
        <Flex justify="end">
          <Button disabled={saved} onClick={() => setSaved(true)}>
            Save
          </Button>
        </Flex>
      }
    >
      <Text role="status">{saved ? 'Changes saved.' : 'There are unsaved changes.'}</Text>
    </Card>
  );
}
