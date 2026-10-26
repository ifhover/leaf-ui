import { Button, Flex, Popconfirm, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PopconfirmAsync() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Flex direction="column" gap="md" align="start">
      <Popconfirm
        title="Submit for review?"
        onConfirm={async () => {
          await new Promise<void>((resolve) => setTimeout(resolve, 900));
          setSubmitted(true);
        }}
      >
        <Button variant="outline" disabled={submitted}>
          Submit for review
        </Button>
      </Popconfirm>
      {submitted && <Text role="status">Submitted for review.</Text>}
    </Flex>
  );
}
