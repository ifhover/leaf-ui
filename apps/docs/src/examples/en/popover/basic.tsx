import { Button, Popover } from '@sudden3/leaf-ui';
export function PopoverBasic() {
  return (
    <div className="leaf-demo-row">
      <Popover title="Project details" content="See project details and recent updates here.">
        <Button variant="outline">Click for details</Button>
      </Popover>
      <Popover
        title="Hint"
        trigger="hover"
        placement="right"
        content="Find more project information here."
      >
        <Button variant="soft">Hover for details</Button>
      </Popover>
    </div>
  );
}
