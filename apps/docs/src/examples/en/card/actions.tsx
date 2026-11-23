import { Button, Card, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardActions() {
  const [saved, setSaved] = useState(false);

  return (
    <Card
      title="Project details"
      description="Heading, description, footer divider and button alignment match Modal."
      extra={
        <Button variant="link" disabled={!saved} onClick={() => setSaved(false)}>
          Reset
        </Button>
      }
      footer={
        <>
          <Button variant="outline" disabled={!saved} onClick={() => setSaved(false)}>
            Revert
          </Button>
          <Button variant="solid" disabled={saved} onClick={() => setSaved(true)}>
            Save
          </Button>
        </>
      }
    >
      <Text role="status">{saved ? 'Changes saved.' : 'There are unsaved changes.'}</Text>
    </Card>
  );
}
