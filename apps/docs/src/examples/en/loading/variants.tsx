import { Flex, Grid, Loading, Text } from '@ifhover/leaf-ui';

const variants = [
  'spinner',
  'ring',
  'dual',
  'orbit',
  'chase',
  'dots',
  'wave',
  'bars',
  'pulse',
  'grid',
  'blocks',
  'flip',
] as const;

export function LoadingVariants() {
  return (
    <Grid columns={{ xs: 2, sm: 3, md: 4 }} gap={[36, 32]} align="center">
      {variants.map((variant) => (
        <Flex key={variant} direction="column" align="center" justify="center" gap={12}>
          <Loading variant={variant} />
          <Text tone="muted">{variant}</Text>
        </Flex>
      ))}
    </Grid>
  );
}
