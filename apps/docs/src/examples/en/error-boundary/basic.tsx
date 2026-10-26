import { Button, ErrorBoundary, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <Text>Content is displayed normally.</Text>;
}

export function ErrorBoundaryBasic() {
  const [broken, setBroken] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button onClick={() => setBroken(true)}>Simulate a rendering error</Button>
      </Flex>
      <ErrorBoundary onReset={() => setBroken(false)}>
        <Content broken={broken} />
      </ErrorBoundary>
    </Flex>
  );
}
