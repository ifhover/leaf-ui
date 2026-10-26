import { Flex, Grid, Loading, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const sizes = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium (default)' },
  { value: 'lg', label: 'Large' },
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
