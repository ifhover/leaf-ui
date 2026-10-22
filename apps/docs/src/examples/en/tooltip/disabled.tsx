import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
export function TooltipDisabled() {
  return (
    <Flex gap="md" align="center" wrap>
      <Tooltip content="Disabled tooltip" disabled>
        <Button variant="outline">Disabled</Button>
      </Tooltip>
      <Tooltip content="Enabled tooltip">
        <Button variant="outline">Enabled</Button>
      </Tooltip>
    </Flex>
  );
}
