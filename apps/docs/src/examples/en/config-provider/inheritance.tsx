import { Button, ConfigProvider, Flex, Space, Text } from '@ifhover/leaf-ui';

export function ConfigProviderInheritance() {
  return (
    <ConfigProvider components={{ Button: { variant: 'outline', size: 'sm' } }}>
      <Space direction="vertical" align="stretch">
        <Flex justify="space-between" align="center" gap="md">
          <Text tone="muted">Outer scope</Text>
          <Button>Small · Outline</Button>
        </Flex>
        <ConfigProvider components={{ Button: { size: 'lg' } }}>
          <Space direction="vertical" align="stretch">
            <Flex justify="space-between" align="center" gap="md">
              <Text tone="muted">Inner size override</Text>
              <Button>Large · Outline</Button>
            </Flex>
            <Flex justify="space-between" align="center" gap="md">
              <Text tone="muted">Instance override</Text>
              <Button size="md" variant="solid">
                Default · Solid
              </Button>
            </Flex>
          </Space>
        </ConfigProvider>
      </Space>
    </ConfigProvider>
  );
}
