import { Flex, Grid, Rate, Text } from '@ifhover/leaf-ui';

export function RateColors() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">By score</Text>
      <Flex align="center" wrap>
        <Rate aria-label="Score-based colors" defaultValue={2} colorByValue />
      </Flex>
      <Text tone="muted">Fixed color</Text>
      <Flex align="center" wrap>
        <Rate aria-label="Fixed color" defaultValue={2} color="#1d9bf0" />
      </Flex>
    </Grid>
  );
}
