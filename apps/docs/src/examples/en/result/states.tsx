import { Button, Flex, Result, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ResultStates() {
  const [created, setCreated] = useState(false);
  const [retried, setRetried] = useState(false);

  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Empty</Text>
        <Result
          status="empty"
          title="No projects yet"
          description="Projects you create will appear here."
          extra={
            <Button variant="solid" onClick={() => setCreated(true)}>
              Create project
            </Button>
          }
        />
        {created && <Text role="status">Project created</Text>}
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Success</Text>
        <Result
          status="success"
          title="Project created"
          description="You can now add content to the project."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Warning</Text>
        <Result
          status="warning"
          title="Storage is almost full"
          description="Remove unused content to free up space."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Danger</Text>
        <Result
          status="danger"
          title="Publishing failed"
          description="Check your connection and try again."
          extra={<Button onClick={() => setRetried(true)}>Retry</Button>}
        />
        {retried && <Text role="status">Retry completed</Text>}
      </Flex>
    </Flex>
  );
}
