import { Flex, Tag } from '@ifhover/leaf-ui';

export function TagWeight() {
  return (
    <Flex gap="md" align="center" wrap>
      <Tag color="primary">Bold by default</Tag>
      <Tag color="primary" bold={false}>
        Regular text
      </Tag>
    </Flex>
  );
}
