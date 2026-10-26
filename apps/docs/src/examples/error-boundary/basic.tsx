import { Button, ErrorBoundary, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <Text>内容正常显示。</Text>;
}

export function ErrorBoundaryBasic() {
  const [broken, setBroken] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button onClick={() => setBroken(true)}>模拟内容异常</Button>
      </Flex>
      <ErrorBoundary onReset={() => setBroken(false)}>
        <Content broken={broken} />
      </ErrorBoundary>
    </Flex>
  );
}
