import { Button, Card, Flex } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function CardSelected() {
  const [selected, setSelected] = useState('personal');
  return (
    <Flex direction="column" gap={16}>
      {[
        { key: 'personal', title: '个人方案' },
        { key: 'team', title: '团队方案' },
      ].map((option) => (
        <Card
          key={option.key}
          title={option.title}
          selected={selected === option.key}
          footer={
            <Button aria-pressed={selected === option.key} onClick={() => setSelected(option.key)}>
              选择方案
            </Button>
          }
        >
          {option.key === 'personal' ? '适合个人使用。' : '适合团队协作。'}
        </Card>
      ))}
    </Flex>
  );
}
