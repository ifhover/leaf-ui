import { Flex, Grid, Statistic, Text } from '@ifhover/leaf-ui';

export function StatisticFormatting() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">{'金额'}</Text>
      <Flex align="center" wrap>
        <Statistic value={12856.8} precision={2} prefix="¥" />
      </Flex>
      <Text tone="muted">{'百分比'}</Text>
      <Flex align="center" wrap>
        <Statistic value={12.5} precision={1} suffix="%" />
      </Flex>
    </Grid>
  );
}
