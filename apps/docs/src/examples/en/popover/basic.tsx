import { Button, Popover } from '@ifhover/leaf-ui';

export function PopoverBasic() {
  return (
    <Popover title="Project details" content="See project details and recent updates here.">
      <Button variant="outline">View details</Button>
    </Popover>
  );
}
