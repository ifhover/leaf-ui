import { Button, Flex, Popconfirm, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PopconfirmAsync() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Flex direction="column" gap="md" align="start">
      <Popconfirm
        title="提交审核？"
        onConfirm={async () => {
          await new Promise<void>((resolve) => setTimeout(resolve, 900));
          setSubmitted(true);
        }}
      >
        <Button variant="outline" disabled={submitted}>
          提交审核
        </Button>
      </Popconfirm>
      {submitted && <Text role="status">已提交审核。</Text>}
    </Flex>
  );
}
