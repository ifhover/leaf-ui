import { Button, Flex, Skeleton, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SkeletonBasic() {
  const [loading, setLoading] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Button variant="outline" onClick={() => setLoading(!loading)}>
        Toggle loading
      </Button>
      <Flex direction="column" gap="sm">
        <Text>Loading content</Text>
        <Skeleton loading={loading} avatar rows={3} rowWidths={['100%', '85%', '55%']} round>
          <p>Project content is ready.</p>
        </Skeleton>
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Static placeholder</Text>
        <Skeleton active={false} title={false} rows={2} />
      </Flex>
    </Space>
  );
}
