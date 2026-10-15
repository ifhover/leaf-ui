import { Button, ConfigProvider, Flex, Space, Text } from '@ifhover/leaf-ui';

export function ConfigProviderInheritance() {
  return (
    <ConfigProvider components={{ Button: { variant: 'outline', size: 'sm' } }}>
      <Space direction="vertical" align="stretch">
        <Flex justify="space-between" align="center" gap="md">
          <Text tone="muted">外层配置</Text>
          <Button>小尺寸 · 边框</Button>
        </Flex>
        <ConfigProvider components={{ Button: { size: 'lg' } }}>
          <Space direction="vertical" align="stretch">
            <Flex justify="space-between" align="center" gap="md">
              <Text tone="muted">内层覆盖尺寸</Text>
              <Button>大尺寸 · 继承边框</Button>
            </Flex>
            <Flex justify="space-between" align="center" gap="md">
              <Text tone="muted">实例覆盖参数</Text>
              <Button size="md" variant="solid">
                默认尺寸 · 主要
              </Button>
            </Flex>
          </Space>
        </ConfigProvider>
      </Space>
    </ConfigProvider>
  );
}
