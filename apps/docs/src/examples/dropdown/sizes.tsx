import { Button, Dropdown, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { ChevronDown, Copy, Pencil } from 'lucide-react';

const sizes = [
  { size: 'sm', label: '小' },
  { size: 'md', label: '默认' },
  { size: 'lg', label: '大' },
] as const;

export function DropdownSizes() {
  return (
    <Flex direction="column" gap="md">
      {sizes.map(({ size, label }) => (
        <Grid
          key={size}
          role="group"
          aria-label={label}
          columns={{ xs: 1, sm: 2 }}
          gap="8px"
          align="center"
        >
          <Text tone="muted">{label}</Text>
          <Dropdown
            size={size}
            items={[
              { key: 'edit', label: '编辑', icon: <Pencil /> },
              { key: 'copy', label: '复制链接', icon: <Copy />, extra: 'Ctrl C' },
            ]}
          >
            <Button variant="outline" endIcon={<ChevronDown size={16} />}>
              更多操作
            </Button>
          </Dropdown>
        </Grid>
      ))}
    </Flex>
  );
}
