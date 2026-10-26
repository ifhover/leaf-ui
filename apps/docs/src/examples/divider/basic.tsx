import { Divider, Flex, Text } from '@ifhover/leaf-ui';

export function DividerBasic() {
  return (
    <Flex direction="column" gap="sm">
      <Text>项目资料</Text>
      <Divider />
      <Text>团队成员</Text>
    </Flex>
  );
}
