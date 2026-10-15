import { Button, ButtonGroup, Flex, Space, SplitButton, Text } from '@ifhover/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="start">
      <Flex direction="column" gap="sm" align="center">
        <Text>按钮组</Text>
        <ButtonGroup>
          <Button variant="outline">上一步</Button>
          <Button variant="outline">下一步</Button>
        </ButtonGroup>
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>分裂按钮</Text>
        <SplitButton
          items={[
            { key: 'copy', label: '保存副本' },
            { key: 'draft', label: '存为草稿' },
          ]}
        >
          保存
        </SplitButton>
      </Flex>
    </Space>
  );
}
