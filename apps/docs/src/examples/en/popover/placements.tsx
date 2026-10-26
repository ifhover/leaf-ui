import { Button, Flex, Grid, Popover, Text } from '@ifhover/leaf-ui';

const placements = [
  { placement: 'top', label: 'Top' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'left', label: 'Left' },
  { placement: 'right', label: 'Right' },
] as const;

export function PopoverPlacements() {
  return (
    <Flex direction="column" gap="md">
      {placements.map(({ placement, label }) => (
        <Grid
          key={placement}
          role="group"
          aria-label={label}
          columns={{ xs: 1, sm: 2 }}
          gap="8px"
          align="center"
        >
          <Text tone="muted">{label}</Text>
          <Popover
            placement={placement}
            title="Project details"
            content="See project details and recent updates here."
          >
            <Button variant="outline">View details</Button>
          </Popover>
        </Grid>
      ))}
    </Flex>
  );
}
