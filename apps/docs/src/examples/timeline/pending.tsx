import { Button, Flex, Timeline } from '@ifhover/leaf-ui';
import { useState } from 'react';

const events = [
  { key: 'create', label: '09:00', children: '创建项目' },
  { key: 'review', label: '10:30', children: '完成审核' },
];

export function TimelinePending() {
  const [completed, setCompleted] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Timeline
        items={
          completed ? [...events, { key: 'release', label: '12:00', children: '发布成功' }] : events
        }
        pending={completed ? null : '正在发布…'}
      />
      <Flex>
        <Button disabled={completed} onClick={() => setCompleted(true)}>
          标记完成
        </Button>
      </Flex>
    </Flex>
  );
}
