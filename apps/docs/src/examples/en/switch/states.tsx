import { Flex, Grid, Switch, Text } from '@ifhover/leaf-ui';

export function SwitchStates() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Disabled</Text>
      <Flex align="center" wrap>
        <Switch disabled defaultChecked>
          Enable notifications
        </Switch>
      </Flex>
      <Text tone="muted">Loading</Text>
      <Flex align="center" wrap>
        <Switch loading defaultChecked>
          Enable notifications
        </Switch>
      </Flex>
    </Grid>
  );
}
