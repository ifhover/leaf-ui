import { Button, ErrorBoundary, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function Content({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Demo rendering error');
  return <Text>记录内容读取成功。</Text>;
}

export function ErrorBoundaryResetKeys() {
  const [recordId, setRecordId] = useState(1);
  const [broken, setBroken] = useState(false);

  return (
    <Flex direction="column" gap="md">
      <Flex gap="md" wrap>
        <Button onClick={() => setBroken(true)}>模拟记录异常</Button>
        <Button onClick={() => setRecordId((current) => current + 1)}>切换记录</Button>
      </Flex>
      <ErrorBoundary resetKeys={[recordId]} onReset={() => setBroken(false)}>
        <Content broken={broken} />
      </ErrorBoundary>
      <Text tone="muted" role="status">
        当前记录：{recordId}
      </Text>
    </Flex>
  );
}
