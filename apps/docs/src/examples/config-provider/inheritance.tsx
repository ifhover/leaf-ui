import { Button, ConfigProvider, Flex, Grid, Text } from '@ifhover/leaf-ui';

export function ConfigProviderInheritance() {
  return (
    <ConfigProvider components={{ Button: { size: 'sm' } }}>
      <Grid columns={1} gap={24}>
        <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
          <Text tone="muted">外层配置</Text>
          <Flex align="start">
            <Button>继续</Button>
          </Flex>
        </Grid>
        <ConfigProvider components={{ Button: { size: 'lg' } }}>
          <Grid columns={1} gap={24}>
            <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
              <Text tone="muted">内层覆盖</Text>
              <Flex align="start">
                <Button>继续</Button>
              </Flex>
            </Grid>
            <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
              <Text tone="muted">实例覆盖</Text>
              <Flex align="start">
                <Button size="md">继续</Button>
              </Flex>
            </Grid>
          </Grid>
        </ConfigProvider>
      </Grid>
    </ConfigProvider>
  );
}
