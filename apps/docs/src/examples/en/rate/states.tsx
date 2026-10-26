import { Flex, Grid, Rate, Text } from '@ifhover/leaf-ui';

export function RateStates() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Read only</Text>
      <Flex align="center" wrap>
        <Rate aria-label="Read-only rating" defaultValue={3} readOnly />
      </Flex>
      <Text tone="muted">Disabled</Text>
      <Flex align="center" wrap>
        <Rate aria-label="Disabled rating" defaultValue={3} disabled />
      </Flex>
    </Grid>
  );
}
