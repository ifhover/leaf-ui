import { Flex, Grid, Loading, Text } from '@ifhover/leaf-ui';

const sizes = ['sm', 'md', 'lg'] as const;

export function LoadingSizes() {
  return (
    <Grid columns={3} gap={32} align="end">
      {sizes.map((size) => (
        <Flex key={size} direction="column" align="center" justify="center" gap={12}>
          <Loading size={size} />
          <Text tone="muted">{size}</Text>
        </Flex>
      ))}
    </Grid>
  );
}
