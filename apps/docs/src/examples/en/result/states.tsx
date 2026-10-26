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
          size="sm"
          title="No projects yet"
          description="Projects you create will appear here."
          extra={<Button onClick={() => setCreated(true)}>Create project</Button>}
        />
        {created && <Text role="status">Project created</Text>}
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Warning</Text>
        <Result
          status="warning"
          size="sm"
          title="Storage is almost full"
          description="Remove unused content to free up space."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Danger</Text>
        <Result
          status="danger"
          size="sm"
          title="Publishing failed"
          description="Check your connection and try again."
          extra={<Button onClick={() => setRetried(true)}>Retry</Button>}
        />
        {retried && <Text role="status">Retry completed</Text>}
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Information</Text>
        <Result
          status="info"
          size="sm"
          title="Review in progress"
          description="The review result will appear here."
        />
      </Flex>
    </Flex>
  );
}
