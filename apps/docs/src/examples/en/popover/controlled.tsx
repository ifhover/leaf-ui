import { Button, Form, FormField, Input, Popover } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function PopoverControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      title="Edit project"
      open={open}
      onOpenChange={setOpen}
      width={260}
      content={
        <Form
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="Project name">
            <Input defaultValue="Leaf Garden" />
          </FormField>
          <Button type="submit">Save and close</Button>
        </Form>
      }
    >
      <Button variant="outline">Click to edit</Button>
    </Popover>
  );
}
