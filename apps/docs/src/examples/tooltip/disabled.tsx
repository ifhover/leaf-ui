import { Button, Flex, Grid, Text, Tooltip } from '@ifhover/leaf-ui';

const states = [
  { disabled: false, label: '默认' },
  { disabled: true, label: '禁用提示' },
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
            <Tooltip content="保存当前项目的修改" disabled={disabled}>
              <Button variant="outline">保存</Button>
            </Tooltip>
          </Flex>
        </Grid>
      ))}
    </Flex>
  );
}
