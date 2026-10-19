import { Flex, Tag } from '@ifhover/leaf-ui';

export function TagWeight() {
  return (
    <Flex gap="md" align="center" wrap>
      <Tag color="primary">默认加粗</Tag>
      <Tag color="primary" bold={false}>
        常规字重
      </Tag>
    </Flex>
  );
}
