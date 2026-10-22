import { Button, ButtonGroup, Flex, Text } from '@ifhover/leaf-ui';

export function ButtonGroupDemo() {
  return (
    <Flex align="center" direction="column" gap="sm">
      <Text>相邻操作</Text>
      <ButtonGroup>
        <Button variant="outline">上一步</Button>
        <Button variant="outline">下一步</Button>
      </ButtonGroup>
    </Flex>
  );
}
