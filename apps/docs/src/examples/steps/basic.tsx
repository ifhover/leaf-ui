import type { StepItem } from '@ifhover/leaf-ui';
import { Button, Flex, Space, Steps, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items: readonly StepItem[] = [
  { title: '创建项目', description: '填写基本信息' },
  { title: '确认配置', description: '检查项目信息' },
  { title: '完成', description: '开始使用' },
];
export function StepsBasic() {
  const [current, setCurrent] = useState(1);
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>可切换步骤</Text>
        <Steps items={items} current={current} onChange={setCurrent} />
      </Flex>
      <Flex gap="md" align="center" wrap justify="center">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          上一步
        </Button>
        <Button disabled={current === 2} onClick={() => setCurrent(current + 1)}>
          下一步
        </Button>
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>错误反馈</Text>
        <Steps items={items} current={1} direction="vertical" status="error" size="sm" />
      </Flex>
    </Space>
  );
}
