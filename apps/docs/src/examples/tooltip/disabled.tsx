import { Button, Flex, Tooltip } from '@ifhover/leaf-ui';
export function TooltipDisabled() {
  return (
    <Flex gap="md" align="center" wrap>
      <Tooltip content="已禁用的提示" disabled>
        <Button variant="outline">禁用提示</Button>
      </Tooltip>
      <Tooltip content="可用的提示">
        <Button variant="outline">可用提示</Button>
      </Tooltip>
    </Flex>
  );
}
