import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexBasic() {
  return (
    <Flex gap="sm" wrap>
      <Button variant="solid">保存</Button>
      <Button variant="outline">取消</Button>
      <Button variant="link">更多操作</Button>
    </Flex>
  );
}
