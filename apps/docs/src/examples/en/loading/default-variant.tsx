import { ConfigProvider, Flex, Grid, Loading, Text } from '@ifhover/leaf-ui';

export function LoadingDefaultVariant() {
  return (
    <ConfigProvider components={{ Loading: { variant: 'dots' } }}>
      <Grid columns={2} gap={32} align="center">
        <Flex direction="column" align="center" justify="center" gap={12}>
          <Loading />
          <Text tone="muted">Global default (dots)</Text>
        </Flex>
        <Flex direction="column" align="center" justify="center" gap={12}>
          <Loading variant="ring" />
          <Text tone="muted">Instance override (ring)</Text>
        </Flex>
      </Grid>
    </ConfigProvider>
  );
}
