import type { StepItem } from '@ifhover/leaf-ui';
import { Button, Flex, Space, Steps, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items: readonly StepItem[] = [
  { title: 'Create project', description: 'Enter basic information' },
  { title: 'Review settings', description: 'Review project information' },
  { title: 'Done', description: 'Get started' },
];
export function StepsBasic() {
  const [current, setCurrent] = useState(1);
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>Interactive steps</Text>
        <Steps items={items} current={current} onChange={setCurrent} />
      </Flex>
      <Flex gap="md" align="center" wrap justify="center">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Previous
        </Button>
        <Button disabled={current === 2} onClick={() => setCurrent(current + 1)}>
          Next
        </Button>
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Error feedback</Text>
        <Steps items={items} current={1} direction="vertical" status="error" size="sm" />
      </Flex>
    </Space>
  );
}
