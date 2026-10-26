import { Button, Flex, Popconfirm, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function PopconfirmRetry() {
  const attempted = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Popconfirm
        title="Submit for review?"
        onConfirm={async () => {
          setError('');
          await new Promise<void>((resolve) => setTimeout(resolve, 900));
          if (!attempted.current) {
            attempted.current = true;
            throw new Error('The network is temporarily unavailable.');
          }
          setSubmitted(true);
        }}
        onError={(reason) => setError(reason instanceof Error ? reason.message : String(reason))}
      >
        <Button variant="outline" disabled={submitted}>
          Submit with retry
        </Button>
      </Popconfirm>
      <Text role="status" tone="muted">
        {submitted ? 'Submitted for review.' : error}
      </Text>
    </Flex>
  );
}
