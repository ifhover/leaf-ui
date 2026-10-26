import { Flex, Tag } from '@ifhover/leaf-ui';

export function TagColors() {
  return (
    <Flex gap="sm" wrap>
      <Tag color="primary">Primary</Tag>
      <Tag color="success">Success</Tag>
      <Tag color="info">Info</Tag>
      <Tag color="warning">Warning</Tag>
      <Tag color="danger">Danger</Tag>
      <Tag color="#7654c6">Custom</Tag>
    </Flex>
  );
}
