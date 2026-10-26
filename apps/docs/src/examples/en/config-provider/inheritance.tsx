import { Button, ConfigProvider, Flex, Grid, Text } from '@ifhover/leaf-ui';

export function ConfigProviderInheritance() {
  return (
    <ConfigProvider components={{ Button: { size: 'sm' } }}>
      <Grid columns={1} gap={24}>
        <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
          <Text tone="muted">Outer defaults</Text>
          <Flex align="start">
            <Button>Continue</Button>
          </Flex>
        </Grid>
        <ConfigProvider components={{ Button: { size: 'lg' } }}>
          <Grid columns={1} gap={24}>
            <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
              <Text tone="muted">Inner override</Text>
              <Flex align="start">
                <Button>Continue</Button>
              </Flex>
            </Grid>
            <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
              <Text tone="muted">Instance override</Text>
              <Flex align="start">
                <Button size="md">Continue</Button>
              </Flex>
            </Grid>
          </Grid>
        </ConfigProvider>
      </Grid>
    </ConfigProvider>
  );
}
