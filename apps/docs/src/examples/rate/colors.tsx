import { Flex, Grid, Rate, Text } from '@ifhover/leaf-ui';

export function RateColors() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">按评分</Text>
      <Flex align="center" wrap>
        <Rate aria-label="按评分配色" defaultValue={2} colorByValue />
      </Flex>
      <Text tone="muted">固定颜色</Text>
      <Flex align="center" wrap>
        <Rate aria-label="固定配色" defaultValue={2} color="#1d9bf0" />
      </Flex>
    </Grid>
  );
}
