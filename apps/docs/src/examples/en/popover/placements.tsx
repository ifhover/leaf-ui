import { Button, Popover } from '@sudden3/leaf-ui';
export function PopoverPlacements() {
  return (
    <div className="leaf-demo-row">
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
    </div>
  );
}
