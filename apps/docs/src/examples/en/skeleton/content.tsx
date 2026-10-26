import { Button, Flex, Skeleton, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SkeletonContent() {
  const [loading, setLoading] = useState(true);

  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? 'Show content' : 'Show placeholder'}
        </Button>
      </Flex>
      <Skeleton loading={loading}>
        <Text>Project content is ready.</Text>
      </Skeleton>
    </Flex>
  );
}
