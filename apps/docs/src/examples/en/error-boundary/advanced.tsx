import { Alert, Button, ErrorBoundary, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <Text>Content is displayed normally.</Text>;
}

export function ErrorBoundaryCustom() {
  const [broken, setBroken] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button onClick={() => setBroken(true)}>Test fallback</Button>
      </Flex>
      <ErrorBoundary
        fallback={({ reset }) => (
          <Flex direction="column" gap="md">
            <Alert
              type="danger"
              title="This section is unavailable"
              description="Try loading the content again."
            />
            <Flex>
              <Button onClick={reset}>Try again</Button>
            </Flex>
          </Flex>
        )}
        onReset={() => setBroken(false)}
      >
        <Content broken={broken} />
      </ErrorBoundary>
    </Flex>
  );
}
