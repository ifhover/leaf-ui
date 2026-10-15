import { Button, Flex, Text } from '@ifhover/leaf-ui';

export function FlexAlignment() {
  return (
    <Flex direction="column" gap="lg">
      <Flex justify="space-between" align="center" gap="sm" wrap>
        <Text>Project settings</Text>
        <Button size="sm">Save</Button>
      </Flex>
      <Flex justify="end" gap="sm" wrap>
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </Flex>
    </Flex>
  );
}
