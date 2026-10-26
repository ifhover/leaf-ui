import { Button, Dropdown, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { ChevronDown, Copy, Pencil } from 'lucide-react';

const sizes = [
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Default' },
  { size: 'lg', label: 'Large' },
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
              { key: 'edit', label: 'Edit', icon: <Pencil /> },
              { key: 'copy', label: 'Copy link', icon: <Copy />, extra: 'Ctrl C' },
            ]}
          >
            <Button variant="outline" endIcon={<ChevronDown size={16} />}>
              More actions
            </Button>
          </Dropdown>
        </Grid>
      ))}
    </Flex>
  );
}
