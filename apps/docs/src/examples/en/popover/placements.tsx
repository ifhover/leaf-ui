import { Button, Flex, Popover } from '@ifhover/leaf-ui';
export function PopoverPlacements() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Popover
          key={placement}
          placement={placement}
          title="Project hint"
          content="The panel adjusts to available space."
        >
          <Button variant="outline">
            {{ top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right' }[placement]}
          </Button>
        </Popover>
      ))}
    </Flex>
  );
}
