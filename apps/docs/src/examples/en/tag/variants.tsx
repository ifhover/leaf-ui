import { Flex, Grid, Tag, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'soft', label: 'Soft' },
  { value: 'outline', label: 'Outline' },
] as const;

export function TagVariants() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Tag variant={value}>In progress</Tag>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
