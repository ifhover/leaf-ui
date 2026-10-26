import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';

export function ButtonStates() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">禁用</Text>
      <Flex align="center" wrap>
        <Button disabled>保存</Button>
      </Flex>
      <Text tone="muted">加载</Text>
      <Flex align="center" wrap>
        <Button loading>保存</Button>
      </Flex>
    </Grid>
  );
}
