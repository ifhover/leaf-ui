import { Flex, Grid, Switch, Text } from '@ifhover/leaf-ui';

export function SwitchStates() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">禁用</Text>
      <Flex align="center" wrap>
        <Switch disabled defaultChecked>
          开启通知
        </Switch>
      </Flex>
      <Text tone="muted">加载</Text>
      <Flex align="center" wrap>
        <Switch loading defaultChecked>
          开启通知
        </Switch>
      </Flex>
    </Grid>
  );
}
