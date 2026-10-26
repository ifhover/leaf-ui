import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexBasic() {
  return (
    <Flex gap="sm" wrap>
      <Button>保存</Button>
      <Button>取消</Button>
      <Button>更多操作</Button>
    </Flex>
  );
}
