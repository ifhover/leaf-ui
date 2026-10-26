import { Button, Flex, Timeline } from '@ifhover/leaf-ui';
import { useState } from 'react';

const events = [
  { key: 'create', label: '09:00', children: 'Project created' },
  { key: 'review', label: '10:30', children: 'Review complete' },
];

export function TimelinePending() {
  const [completed, setCompleted] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Timeline
        items={
          completed
            ? [...events, { key: 'release', label: '12:00', children: 'Published' }]
            : events
        }
        pending={completed ? null : 'Publishing...'}
      />
      <Flex>
        <Button disabled={completed} onClick={() => setCompleted(true)}>
          Mark complete
        </Button>
      </Flex>
    </Flex>
  );
}
