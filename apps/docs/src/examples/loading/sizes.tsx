import { Flex, Grid, Loading, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const sizes = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中（默认）' },
  { value: 'lg', label: '大' },
] as const;

export function LoadingSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {sizes.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex>
            <Loading size={value} />
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
