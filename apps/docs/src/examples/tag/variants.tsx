import { Flex, Grid, Tag, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'soft', label: '浅底' },
  { value: 'outline', label: '描边' },
] as const;

export function TagVariants() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Tag variant={value}>进行中</Tag>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
