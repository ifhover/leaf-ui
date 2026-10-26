import { Alert, Button, Flex } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AlertClosable() {
  const [version, setVersion] = useState(0);

  return (
    <Flex direction="column" gap="md">
      <Alert key={version} title="Your draft is saved" closable />
      <Flex>
        <Button onClick={() => setVersion((value) => value + 1)}>Show again</Button>
      </Flex>
    </Flex>
  );
}
