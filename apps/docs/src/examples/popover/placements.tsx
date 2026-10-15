import { Button, Flex, Popover } from '@ifhover/leaf-ui';
export function PopoverPlacements() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Popover
          key={placement}
          placement={placement}
          title="项目提示"
          content="浮层会根据可用空间调整位置。"
        >
          <Button variant="outline">
            {{ top: '上方', bottom: '下方', left: '左侧', right: '右侧' }[placement]}
          </Button>
        </Popover>
      ))}
    </Flex>
  );
}
