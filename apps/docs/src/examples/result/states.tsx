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
          size="sm"
          title="还没有项目"
          description="创建的项目会显示在这里。"
          extra={<Button onClick={() => setCreated(true)}>创建项目</Button>}
        />
        {created && <Text role="status">项目已创建</Text>}
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">警告</Text>
        <Result
          status="warning"
          size="sm"
          title="存储空间即将用完"
          description="请清理不需要的内容。"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">危险</Text>
        <Result
          status="danger"
          size="sm"
          title="发布未完成"
          description="请检查连接后重试。"
          extra={<Button onClick={() => setRetried(true)}>重试</Button>}
        />
        {retried && <Text role="status">重试已完成</Text>}
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">信息</Text>
        <Result status="info" size="sm" title="审核正在进行" description="审核结果将在此更新。" />
      </Flex>
    </Flex>
  );
}
