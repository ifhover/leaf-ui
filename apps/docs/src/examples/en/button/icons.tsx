import { Button, Flex, Grid, Text } from '@ifhover/leaf-ui';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Fragment } from 'react';

const options = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const;

export function ButtonIcons() {
  return (
    <Grid gap={16} align="center" style={{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }}>
      {options.map(({ value, label }) => (
        <Fragment key={value}>
          <Text tone="muted">{label}</Text>
          <Flex align="center" gap={8} wrap>
            <Button size={value} startIcon={<Plus />}>
              New project
            </Button>
            <Button size={value} variant="outline" endIcon={<ArrowRight />}>
              Continue
            </Button>
            <Button size={value} variant="outline" aria-label="Add project" startIcon={<Plus />} />
            <Button
              size={value}
              danger
              variant="outline"
              aria-label="Delete project"
              startIcon={<Trash2 />}
            />
          </Flex>
        </Fragment>
      ))}
    </Grid>
  );
}
