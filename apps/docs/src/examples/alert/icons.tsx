import { Alert, Flex, Text } from '@ifhover/leaf-ui';
import { ShieldCheck } from 'lucide-react';

export function AlertIcons() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">自定义图标</Text>
        <Alert
          type="success"
          title="访问权限已更新"
          description="成员列表与协作权限会在数秒内同步生效。"
          icon={<ShieldCheck size={16} />}
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">隐藏图标</Text>
        <Alert
          type="success"
          title="访问权限已更新"
          description="已隐藏左侧图标，适合空间更紧凑的区域。"
          showIcon={false}
        />
      </Flex>
    </Flex>
  );
}
