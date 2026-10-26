import { Avatar, Flex, Grid, Text } from '@ifhover/leaf-ui';
export function AvatarShapes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">圆形</Text>
      <Flex align="center" wrap>
        <Avatar shape="circle" alt="Leaf">
          LF
        </Avatar>
      </Flex>
      <Text tone="muted">方形</Text>
      <Flex align="center" wrap>
        <Avatar shape="square" alt="Leaf">
          LF
        </Avatar>
      </Flex>
    </Grid>
  );
}
