import { Flex, Grid, Switch, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
] as const;

export function SwitchSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Switch size={value}>开启通知</Switch>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
