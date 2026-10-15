import { Button, ButtonGroup, Flex, Space, SplitButton, Text } from '@ifhover/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="start">
      <Flex direction="column" gap="sm" align="center">
        <Text>Button group</Text>
        <ButtonGroup>
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </ButtonGroup>
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>Split button</Text>
        <SplitButton
          items={[
            { key: 'copy', label: 'Save a copy' },
            { key: 'draft', label: 'Save draft' },
          ]}
        >
          Save
        </SplitButton>
      </Flex>
    </Space>
  );
}
