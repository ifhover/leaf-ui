import { Flex, Steps, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items = [{ title: '创建' }, { title: '确认' }, { title: '完成' }];

export function StepsControlled() {
  const [current, setCurrent] = useState(0);
  return (
    <Flex direction="column" gap="md">
      <Steps aria-label="可切换步骤" items={items} current={current} onChange={setCurrent} />
      <Text role="status" tone="muted">
        当前步骤：{items[current]?.title}
      </Text>
    </Flex>
  );
}
