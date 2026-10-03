import { Button, Input, Popover } from '@sudden3/leaf-ui';

export function PopoverBasic() {
  return (
    <div className="leaf-demo-row">
      <Popover
        title="Project details"
        content={
          <div className="leaf-demo-stack">
            <Input aria-label="Project name" defaultValue="Leaf Garden" />
            <Button>Save</Button>
          </div>
        }
        width={260}
      >
        <Button variant="outline">Click to edit</Button>
      </Popover>
      <Popover
        title="Details"
        trigger="hover"
        placement="right"
        content="Read more details about this project."
      >
        <Button variant="soft">Hover for details</Button>
      </Popover>
    </div>
  );
}
