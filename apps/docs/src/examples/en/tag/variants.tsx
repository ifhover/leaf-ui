import { Flex, Tag, Text } from '@ifhover/leaf-ui';

export function TagVariants() {
  return (
    <Flex direction="column" gap="sm" align="start">
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">soft</Text>
        <Tag>Default</Tag>
        <Tag color="success">Success</Tag>
        <Tag color="info">Info</Tag>
        <Tag color="warning">Warning</Tag>
        <Tag color="danger">Danger</Tag>
        <Tag color="#722ed1">Custom</Tag>
      </Flex>
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">solid</Text>
        <Tag variant="solid">Default</Tag>
        <Tag color="success" variant="solid">
          Success
        </Tag>
        <Tag color="info" variant="solid">
          Info
        </Tag>
        <Tag color="warning" variant="solid">
          Warning
        </Tag>
        <Tag color="danger" variant="solid">
          Danger
        </Tag>
        <Tag color="#722ed1" variant="solid">
          Custom
        </Tag>
      </Flex>
    </Flex>
  );
}
