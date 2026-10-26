import { Button, Flex, Grid, Popover, Text } from '@ifhover/leaf-ui';

const placements = [
  { placement: 'top', label: '上方' },
  { placement: 'bottom', label: '下方' },
  { placement: 'left', label: '左侧' },
  { placement: 'right', label: '右侧' },
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
          <Popover placement={placement} title="项目信息" content="在此查看项目概览和最近更新。">
            <Button variant="outline">查看详情</Button>
          </Popover>
        </Grid>
      ))}
    </Flex>
  );
}
