import { Button, Flex, Text } from '@ifhover/leaf-ui';

export function FlexAlignment() {
  return (
    <Flex direction="column" gap="lg">
      <Flex justify="space-between" align="center" gap="sm" wrap>
        <Text>项目设置</Text>
        <Button size="sm">保存</Button>
      </Flex>
      <Flex justify="end" gap="sm" wrap>
        <Button variant="outline">取消</Button>
        <Button>确认</Button>
      </Flex>
    </Flex>
  );
}
