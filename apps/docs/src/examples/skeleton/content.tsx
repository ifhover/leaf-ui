import { Button, Flex, Skeleton, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SkeletonContent() {
  const [loading, setLoading] = useState(true);

  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? '显示内容' : '显示占位'}
        </Button>
      </Flex>
      <Skeleton loading={loading}>
        <Text>项目内容已加载完成。</Text>
      </Skeleton>
    </Flex>
  );
}
