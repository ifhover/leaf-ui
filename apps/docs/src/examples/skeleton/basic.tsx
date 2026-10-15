import { Button, Flex, Skeleton, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SkeletonBasic() {
  const [loading, setLoading] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Button variant="outline" onClick={() => setLoading(!loading)}>
        切换加载状态
      </Button>
      <Flex direction="column" gap="sm">
        <Text>内容加载</Text>
        <Skeleton loading={loading} avatar rows={3} rowWidths={['100%', '85%', '55%']} round>
          <p>项目内容已加载完成。</p>
        </Skeleton>
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>静态占位</Text>
        <Skeleton active={false} title={false} rows={2} />
      </Flex>
    </Space>
  );
}
