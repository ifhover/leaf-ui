import { Button, Flex, Loading } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingDelay() {
  const [spinning, setSpinning] = useState(false);

  return (
    <Flex direction="column" gap="md" align="start">
      <Button onClick={() => setSpinning((value) => !value)}>
        {spinning ? 'Finish loading' : 'Start loading'}
      </Button>
      <Loading spinning={spinning} delay={600} tip="Loading" />
    </Flex>
  );
}
