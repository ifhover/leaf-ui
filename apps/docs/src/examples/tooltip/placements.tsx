import { Button, Flex, Grid, Text, Tooltip } from '@ifhover/leaf-ui';

const placements = [
  { placement: 'top', label: '上方' },
  { placement: 'bottom', label: '下方' },
  { placement: 'left', label: '左侧' },
  { placement: 'right', label: '右侧' },
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
          <Tooltip placement={placement} content="保存当前项目的修改">
            <Button variant="outline">保存</Button>
          </Tooltip>
        </Grid>
      ))}
    </Flex>
  );
}
