import { Button, Tooltip } from '@ifhover/leaf-ui';

export function TooltipBasic() {
  return (
    <Tooltip content="Save changes to the current project">
      <Button variant="outline">Save</Button>
    </Tooltip>
  );
}
