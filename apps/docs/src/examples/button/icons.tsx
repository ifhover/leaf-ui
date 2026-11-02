import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

const options = [
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
] as const;

export function ButtonIcons() {
  return (
    <Grid gap={16} align="center" style={{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }}>
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" gap={8} wrap>
            <Button size={value} startIcon={<Plus />}>
              新建项目
            </Button>
            <Button size={value} variant="outline" endIcon={<ArrowRight />}>
              继续下一步
            </Button>
            <Button size={value} variant="outline" aria-label="添加项目" startIcon={<Plus />} />
            <Button
              size={value}
              danger
              variant="outline"
              aria-label="删除项目"
              startIcon={<Trash2 />}
            />
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
