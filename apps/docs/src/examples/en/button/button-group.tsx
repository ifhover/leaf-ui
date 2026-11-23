import { Button, ButtonGroup, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function ButtonGroupDemo() {
  const [result, setResult] = useState('');

  return (
    <Flex direction="column" gap="md" align="start">
      <Flex align="center" gap={12} wrap>
        <ButtonGroup aria-label="Step actions">
          <Button>Previous</Button>
          <Button>Next</Button>
        </ButtonGroup>
        <ButtonGroup variant="solid">
          <Button onClick={() => setResult('Saved')}>Save</Button>
          <Dropdown
            items={[
              { key: 'copy', label: 'Save a copy', onClick: () => setResult('Copy saved') },
              { key: 'draft', label: 'Save draft', onClick: () => setResult('Draft saved') },
            ]}
          >
            <Button size="icon" aria-label="More save options">
              <ChevronDown />
            </Button>
          </Dropdown>
        </ButtonGroup>
      </Flex>
      <Text tone="muted" role="status">
        {result}
      </Text>
    </Flex>
  );
}
