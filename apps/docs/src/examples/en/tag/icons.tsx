import { Flex, Tag, Text } from '@ifhover/leaf-ui';
import { Check, CircleAlert, CircleX, Info, Sparkles, Tag as TagIcon } from 'lucide-react';

export function TagIcons() {
  return (
    <Flex direction="column" gap="sm" align="start">
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">soft</Text>
        <Tag icon={<TagIcon />}>Default</Tag>
        <Tag color="success" icon={<Check />}>
          Success
        </Tag>
        <Tag color="info" icon={<Info />}>
          Info
        </Tag>
        <Tag color="warning" icon={<CircleAlert />}>
          Warning
        </Tag>
        <Tag color="danger" icon={<CircleX />}>
          Danger
        </Tag>
        <Tag color="#722ed1" icon={<Sparkles />}>
          Custom
        </Tag>
      </Flex>
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">solid</Text>
        <Tag variant="solid" icon={<TagIcon />}>
          Default
        </Tag>
        <Tag color="success" variant="solid" icon={<Check />}>
          Success
        </Tag>
        <Tag color="info" variant="solid" icon={<Info />}>
          Info
        </Tag>
        <Tag color="warning" variant="solid" icon={<CircleAlert />}>
          Warning
        </Tag>
        <Tag color="danger" variant="solid" icon={<CircleX />}>
          Danger
        </Tag>
        <Tag color="#722ed1" variant="solid" icon={<Sparkles />}>
          Custom
        </Tag>
      </Flex>
    </Flex>
  );
}
