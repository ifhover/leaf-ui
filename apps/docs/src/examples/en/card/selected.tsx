import { Button, Card, Flex } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function CardSelected() {
  const [selected, setSelected] = useState('personal');
  return (
    <Flex direction="column" gap={16}>
      {[
        { key: 'personal', title: 'Personal' },
        { key: 'team', title: 'Team' },
      ].map((option) => (
        <Card
          key={option.key}
          title={option.title}
          selected={selected === option.key}
          footer={
            <Button aria-pressed={selected === option.key} onClick={() => setSelected(option.key)}>
              Select plan
            </Button>
          }
        >
          {option.key === 'personal' ? 'For individual use.' : 'For team collaboration.'}
        </Card>
      ))}
    </Flex>
  );
}
