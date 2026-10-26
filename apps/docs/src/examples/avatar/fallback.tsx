import { Avatar, Flex, Grid, Text } from '@ifhover/leaf-ui';
export function AvatarFallback() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">文字回退</Text>
      <Flex align="center" wrap>
        <Avatar src="data:image/png;base64,broken" alt="Alex">
          AL
        </Avatar>
      </Flex>
      <Text tone="muted">默认图标</Text>
      <Flex align="center" wrap>
        <Avatar alt="访客" />
      </Flex>
    </Grid>
  );
}
