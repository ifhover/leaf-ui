import { Button, Flex, Grid, Text, Tooltip } from '@ifhover/leaf-ui';

const placements = [
  { placement: 'top', label: 'Top' },
  { placement: 'bottom', label: 'Bottom' },
  { placement: 'left', label: 'Left' },
  { placement: 'right', label: 'Right' },
] as const;

export function TooltipPlacements() {
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
          <Tooltip placement={placement} content="Save changes to the current project">
            <Button variant="outline">Save</Button>
          </Tooltip>
        </Grid>
      ))}
    </Flex>
  );
}
