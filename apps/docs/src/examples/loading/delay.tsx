import { Button, Flex, Loading } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingDelay() {
  const [spinning, setSpinning] = useState(false);

  return (
    <Flex direction="column" gap="md" align="start">
      <Button onClick={() => setSpinning((value) => !value)}>
        {spinning ? '结束加载' : '开始加载'}
      </Button>
      <Loading spinning={spinning} delay={600} tip="正在加载" />
    </Flex>
  );
}
