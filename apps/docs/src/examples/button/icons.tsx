import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

const options = [
  { value: 'sm', iconSize: 'icon-sm', label: '小' },
  { value: 'md', iconSize: 'icon', label: '中' },
  { value: 'lg', iconSize: 'icon-lg', label: '大' },
] as const;

export function ButtonIcons() {
  return (
    <Grid gap={16} align="center" style={{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }}>
      {options.map(({ value, iconSize, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" gap={8} wrap>
            <Button size={value}>
              <Plus />
              新建项目
            </Button>
            <Button size={value} variant="outline">
              继续下一步
              <ArrowRight />
            </Button>
            <Button size={iconSize} variant="outline" aria-label="添加项目">
              <Plus />
            </Button>
            <Button size={iconSize} variant="danger" aria-label="删除项目">
              <Trash2 />
            </Button>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
