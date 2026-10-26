import { Checkbox, Flex, Grid, Text } from '@ifhover/leaf-ui';

export function CheckboxDisabled() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">未选中</Text>
      <Flex align="center" wrap>
        <Checkbox disabled>接收项目动态</Checkbox>
      </Flex>
      <Text tone="muted">已选中</Text>
      <Flex align="center" wrap>
        <Checkbox disabled defaultChecked>
          接收项目动态
        </Checkbox>
      </Flex>
    </Grid>
  );
}
