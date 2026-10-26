import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';

export function ButtonStates() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Disabled</Text>
      <Flex align="center" wrap>
        <Button disabled>Save</Button>
      </Flex>
      <Text tone="muted">Loading</Text>
      <Flex align="center" wrap>
        <Button loading>Save</Button>
      </Flex>
    </Grid>
  );
}
