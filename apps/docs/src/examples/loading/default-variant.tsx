import { ConfigProvider, Flex, Grid, Loading, Text } from '@ifhover/leaf-ui';

export function LoadingDefaultVariant() {
  return (
    <ConfigProvider components={{ Loading: { variant: 'dots' } }}>
      <Grid columns={2} gap={32} align="center">
        <Flex direction="column" align="center" justify="center" gap={12}>
          <Loading />
          <Text tone="muted">全局默认（dots）</Text>
        </Flex>
        <Flex direction="column" align="center" justify="center" gap={12}>
          <Loading variant="ring" />
          <Text tone="muted">单独覆盖（ring）</Text>
        </Flex>
      </Grid>
    </ConfigProvider>
  );
}
