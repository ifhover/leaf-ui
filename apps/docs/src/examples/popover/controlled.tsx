import { Button, Form, FormField, Input, Popover } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function PopoverControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      title="编辑项目"
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
          <FormField label="项目名称">
            <Input defaultValue="Leaf Garden" />
          </FormField>
          <Button type="submit">保存并关闭</Button>
        </Form>
      }
    >
      <Button variant="outline">点击编辑</Button>
    </Popover>
  );
}
