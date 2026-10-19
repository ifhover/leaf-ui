import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexBasic() {
  return (
    <Flex gap="sm" wrap>
      <Button>保存</Button>
      <Button variant="outline">取消</Button>
      <Button variant="soft">更多操作</Button>
    </Flex>
  );
}
