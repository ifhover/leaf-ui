import { Flex, SplitButton, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SplitButtonDemo() {
  const [result, setResult] = useState('');

  return (
    <Flex direction="column" gap="md" align="start">
      <SplitButton
        variant="solid"
        onClick={() => setResult('Saved')}
        menuLabel="More save options"
        items={[
          { key: 'copy', label: 'Save a copy', onClick: () => setResult('Copy saved') },
          { key: 'draft', label: 'Save draft', onClick: () => setResult('Draft saved') },
        ]}
      >
        Save
      </SplitButton>
      <Text tone="muted" role="status">
        {result}
      </Text>
    </Flex>
  );
}
