import { Flex, Grid, Rate, Text } from '@ifhover/leaf-ui';

export function RateStates() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">只读</Text>
      <Flex align="center" wrap>
        <Rate aria-label="只读评分" defaultValue={3} readOnly />
      </Flex>
      <Text tone="muted">禁用</Text>
      <Flex align="center" wrap>
        <Rate aria-label="禁用评分" defaultValue={3} disabled />
      </Flex>
    </Grid>
  );
}
