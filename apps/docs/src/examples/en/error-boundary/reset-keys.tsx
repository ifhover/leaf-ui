import { Button, ErrorBoundary, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <Text>Record content loaded successfully.</Text>;
}

export function ErrorBoundaryResetKeys() {
  const [recordId, setRecordId] = useState(1);
  const [broken, setBroken] = useState(false);

  return (
    <Flex direction="column" gap="md">
      <Flex gap="md" wrap>
        <Button onClick={() => setBroken(true)}>Simulate a record error</Button>
        <Button onClick={() => setRecordId((current) => current + 1)}>Switch record</Button>
      </Flex>
      <ErrorBoundary resetKeys={[recordId]} onReset={() => setBroken(false)}>
        <Content broken={broken} />
      </ErrorBoundary>
      <Text tone="muted" role="status">
        Record: {recordId}
      </Text>
    </Flex>
  );
}
