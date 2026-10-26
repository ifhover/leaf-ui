import { Alert, Button, ErrorBoundary, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <Text>内容正常显示。</Text>;
}

export function ErrorBoundaryCustom() {
  const [broken, setBroken] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button onClick={() => setBroken(true)}>测试备用界面</Button>
      </Flex>
      <ErrorBoundary
        fallback={({ reset }) => (
          <Flex direction="column" gap="md">
            <Alert type="danger" title="此区块不可用" description="可以重试加载内容。" />
            <Flex>
              <Button onClick={reset}>再次尝试</Button>
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
