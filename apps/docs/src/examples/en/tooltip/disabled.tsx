import { Button, Flex, Grid, Text, Tooltip } from '@ifhover/leaf-ui';

const states = [
  { disabled: false, label: 'Default' },
  { disabled: true, label: 'Disabled tooltip' },
];

export function TooltipDisabled() {
  return (
    <Flex direction="column" gap="md">
      {states.map(({ disabled, label }) => (
        <Grid
          key={label}
          role="group"
          aria-label={label}
          columns={{ xs: 1, sm: 2 }}
          gap="8px"
          align="center"
        >
          <Text tone="muted">{label}</Text>
          <Flex align="start">
            <Tooltip content="Save changes to the current project" disabled={disabled}>
              <Button variant="outline">Save</Button>
            </Tooltip>
          </Flex>
        </Grid>
      ))}
    </Flex>
  );
}
