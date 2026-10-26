import { Button, Grid, Space, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const sizes = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
] as const;

export function SpaceSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {sizes.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Space size={value} wrap>
            <Button>1</Button>
            <Button>2</Button>
            <Button>3</Button>
          </Space>
        </Fragment>
      ))}
    </Grid>
  );
}
