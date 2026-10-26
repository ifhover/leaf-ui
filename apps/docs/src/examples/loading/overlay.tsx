import { Button, Card, Flex, Loading, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingOverlay() {
  const [spinning, setSpinning] = useState(true);
  const [edited, setEdited] = useState(false);

  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button variant="outline" onClick={() => setSpinning((value) => !value)}>
          {spinning ? '结束加载' : '开始加载'}
        </Button>
      </Flex>
      <Loading spinning={spinning} tip="正在读取项目">
        <Card title="项目概览">
          <Flex direction="column" gap="md">
            <Text>在此查看项目进度。</Text>
            <Flex>
              <Button variant="outline" onClick={() => setEdited(true)}>
                编辑项目
              </Button>
            </Flex>
            {edited && <Text role="status">已打开项目编辑</Text>}
          </Flex>
        </Card>
      </Loading>
    </Flex>
  );
}
