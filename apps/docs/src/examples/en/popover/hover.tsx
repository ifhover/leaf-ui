import { Button, Popover } from '@ifhover/leaf-ui';

export function PopoverHover() {
  return (
    <Popover
      title="Project details"
      content="See project details and recent updates here."
      trigger="hover"
    >
      <Button variant="outline">Hover for details</Button>
    </Popover>
  );
}
