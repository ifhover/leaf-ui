import { Flex, SplitButton, Text } from '@ifhover/leaf-ui';

export function SplitButtonDemo() {
  return (
    <Flex align="center" direction="column" gap="sm">
      <Text>主要操作与更多操作</Text>
      <SplitButton
        items={[
          { key: 'copy', label: '保存副本' },
          { key: 'draft', label: '存为草稿' },
        ]}
        variant="solid"
      >
        保存
      </SplitButton>
    </Flex>
  );
}
