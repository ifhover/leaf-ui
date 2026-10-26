import { Flex, Grid, Tag, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const;

export function TagSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Tag size={value}>In progress</Tag>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
