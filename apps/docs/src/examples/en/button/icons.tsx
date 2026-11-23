import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

const options = [
  { value: 'sm', iconSize: 'icon-sm', label: 'Small' },
  { value: 'md', iconSize: 'icon', label: 'Medium' },
  { value: 'lg', iconSize: 'icon-lg', label: 'Large' },
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
              New project
            </Button>
            <Button size={value} variant="outline">
              Continue
              <ArrowRight />
            </Button>
            <Button size={iconSize} variant="outline" aria-label="Add project">
              <Plus />
            </Button>
            <Button size={iconSize} variant="danger" aria-label="Delete project">
              <Trash2 />
            </Button>
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
