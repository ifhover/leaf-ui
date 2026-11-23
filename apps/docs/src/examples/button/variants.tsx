import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const options = [
  { value: 'outline', label: '描边', text: '保存' },
  { value: 'solid', label: '实底', text: '保存' },
  { value: 'danger', label: '危险', text: '删除' },
  { value: 'text', label: '文字', text: '保存' },
  { value: 'link', label: '链接', text: '保存' },
] as const;

export function ButtonVariants() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="center">
      {options.map(({ value, label, text }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" wrap>
            <Button variant={value}>{text}</Button>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
