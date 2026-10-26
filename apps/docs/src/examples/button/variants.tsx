import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'outline', label: '描边' },
  { value: 'solid', label: '实底' },
  { value: 'text', label: '文字' },
  { value: 'link', label: '链接' },
] as const;

export function ButtonVariants() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Button variant={value}>保存</Button>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
