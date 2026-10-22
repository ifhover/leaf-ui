import { Flex, SplitButton, Text } from '@ifhover/leaf-ui';

export function SplitButtonDemo() {
  return (
    <Flex align="center" direction="column" gap="sm">
      <Text>Primary action with more actions</Text>
      <SplitButton
        items={[
          { key: 'copy', label: 'Save a copy' },
          { key: 'draft', label: 'Save draft' },
        ]}
        variant="solid"
      >
        Save
      </SplitButton>
    </Flex>
  );
}
