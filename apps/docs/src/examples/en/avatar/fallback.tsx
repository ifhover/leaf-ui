import { Avatar, Flex, Grid, Text } from '@ifhover/leaf-ui';
export function AvatarFallback() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      <Text tone="muted">Text fallback</Text>
      <Flex align="center" wrap>
        <Avatar src="data:image/png;base64,broken" alt="Alex">
          AL
        </Avatar>
      </Flex>
      <Text tone="muted">Default icon</Text>
      <Flex align="center" wrap>
        <Avatar alt="Guest" />
      </Flex>
    </Grid>
  );
}
