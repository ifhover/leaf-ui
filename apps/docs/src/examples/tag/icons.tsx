import { Flex, Tag, Text } from '@ifhover/leaf-ui';
import { Check, CircleAlert, CircleX, Info, Sparkles, Tag as TagIcon } from 'lucide-react';

export function TagIcons() {
  return (
    <Flex direction="column" gap="sm" align="start">
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">soft</Text>
        <Tag icon={<TagIcon />}>默认</Tag>
        <Tag color="success" icon={<Check />}>
          成功
        </Tag>
        <Tag color="info" icon={<Info />}>
          信息
        </Tag>
        <Tag color="warning" icon={<CircleAlert />}>
          警告
        </Tag>
        <Tag color="danger" icon={<CircleX />}>
          危险
        </Tag>
        <Tag color="#722ed1" icon={<Sparkles />}>
          自定义
        </Tag>
      </Flex>
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">solid</Text>
        <Tag variant="solid" icon={<TagIcon />}>
          默认
        </Tag>
        <Tag color="success" variant="solid" icon={<Check />}>
          成功
        </Tag>
        <Tag color="info" variant="solid" icon={<Info />}>
          信息
        </Tag>
        <Tag color="warning" variant="solid" icon={<CircleAlert />}>
          警告
        </Tag>
        <Tag color="danger" variant="solid" icon={<CircleX />}>
          危险
        </Tag>
        <Tag color="#722ed1" variant="solid" icon={<Sparkles />}>
          自定义
        </Tag>
      </Flex>
    </Flex>
  );
}
