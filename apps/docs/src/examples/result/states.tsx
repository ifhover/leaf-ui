import { Button, Flex, Result, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ResultStates() {
  const [created, setCreated] = useState(false);
  const [retried, setRetried] = useState(false);

  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">空数据</Text>
        <Result
          status="empty"
          title="还没有项目"
          description="创建的项目会显示在这里。"
          extra={
            <Button variant="solid" onClick={() => setCreated(true)}>
              创建项目
            </Button>
          }
        />
        {created && <Text role="status">项目已创建</Text>}
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">成功</Text>
        <Result status="success" title="项目已创建" description="现在可以开始添加项目内容。" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">警告</Text>
        <Result status="warning" title="存储空间即将用完" description="请清理不需要的内容。" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">危险</Text>
        <Result
          status="danger"
          title="发布未完成"
          description="请检查连接后重试。"
          extra={<Button onClick={() => setRetried(true)}>重试</Button>}
        />
        {retried && <Text role="status">重试已完成</Text>}
      </Flex>
    </Flex>
  );
}
