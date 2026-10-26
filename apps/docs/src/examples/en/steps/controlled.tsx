import { Flex, Steps, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items = [{ title: 'Create' }, { title: 'Review' }, { title: 'Done' }];

export function StepsControlled() {
  const [current, setCurrent] = useState(0);
  return (
    <Flex direction="column" gap="md">
      <Steps aria-label="Selectable steps" items={items} current={current} onChange={setCurrent} />
      <Text role="status" tone="muted">
        Current step: {items[current]?.title}
      </Text>
    </Flex>
  );
}
