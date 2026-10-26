import { Button, Card, CardTitle, Flex, Text, Typography } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ContentRegion() {
  const [saved, setSaved] = useState(false);
  return (
    <Typography>
      <Flex direction="column" gap="lg">
        <CardTitle level={2} size="lg" description="Maintain project notes and delivery resources.">
          Project resources
        </CardTitle>
        <Card title="Release notes" variant="layered">
          <Flex direction="column" gap="md">
            <Text>This update includes component usage and integration notes.</Text>
            <Flex align="center" justify="space-between" gap="sm" wrap>
              <Text tone="muted" role="status">
                {saved ? 'Saved' : 'Unsaved changes'}
              </Text>
              <Button variant="solid" onClick={() => setSaved(true)}>
                Save changes
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Typography>
  );
}
