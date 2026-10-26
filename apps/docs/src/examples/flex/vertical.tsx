import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexVertical() {
  return (
    <Flex direction="column" align="start" gap="sm">
      <Button>保存</Button>
      <Button>取消</Button>
      <Button>更多操作</Button>
    </Flex>
  );
}
