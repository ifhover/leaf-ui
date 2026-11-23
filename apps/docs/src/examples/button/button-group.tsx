import { Button, ButtonGroup, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function ButtonGroupDemo() {
  const [result, setResult] = useState('');

  return (
    <Flex direction="column" gap="md" align="start">
      <Flex align="center" gap={12} wrap>
        <ButtonGroup aria-label="步骤操作">
          <Button>上一步</Button>
          <Button>下一步</Button>
        </ButtonGroup>
        <ButtonGroup variant="solid">
          <Button onClick={() => setResult('已保存')}>保存</Button>
          <Dropdown
            items={[
              { key: 'copy', label: '保存副本', onClick: () => setResult('副本已保存') },
              { key: 'draft', label: '存为草稿', onClick: () => setResult('草稿已保存') },
            ]}
          >
            <Button size="icon" aria-label="更多保存方式">
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
