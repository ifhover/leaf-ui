import { Button, ButtonGroup, Flex, Text } from '@ifhover/leaf-ui';

export function ButtonGroupDemo() {
  return (
    <Flex align="center" direction="column" gap="sm">
      <Text>Adjacent actions</Text>
      <ButtonGroup>
        <Button variant="outline">Previous</Button>
        <Button variant="outline">Next</Button>
      </ButtonGroup>
    </Flex>
  );
}
