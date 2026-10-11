import { Button, Input, Popover, Space } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';
export function PopoverControlled() {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      title="Edit project"
      open={open}
      onOpenChange={setOpen}
      width={260}
      content={
        <Space direction="vertical" align="stretch" className="leaf-demo-stack">
          <label className="leaf-demo-field" htmlFor={id}>
            Project name
            <Input id={id} defaultValue="Leaf Garden" />
          </label>
          <Button onClick={() => setOpen(false)}>Save and close</Button>
        </Space>
      }
    >
      <Button variant="outline">Click to edit</Button>
    </Popover>
  );
}
