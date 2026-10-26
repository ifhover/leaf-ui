import { Flex, SplitButton, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SplitButtonDemo() {
  const [result, setResult] = useState('');

  return (
    <Flex direction="column" gap="md" align="start">
      <SplitButton
        variant="solid"
        onClick={() => setResult('已保存')}
        menuLabel="更多保存方式"
        items={[
          { key: 'copy', label: '保存副本', onClick: () => setResult('副本已保存') },
          { key: 'draft', label: '存为草稿', onClick: () => setResult('草稿已保存') },
        ]}
      >
        保存
      </SplitButton>
      <Text tone="muted" role="status">
        {result}
      </Text>
    </Flex>
  );
}
