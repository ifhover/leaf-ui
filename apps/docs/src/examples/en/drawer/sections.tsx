import { Button, Drawer, Form, FormField, Input, Space } from '@ifhover/leaf-ui';
import { useId, useState } from 'react';

export function DrawerSections() {
  const [open, setOpen] = useState(false);
  const formId = useId();
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit name</Button>
      <Drawer
        open={open}
        title="Edit name"
        onClose={() => setOpen(false)}
        footer={
          <Space wrap>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="solid" type="submit" form={formId}>
              Save
            </Button>
          </Space>
        }
      >
        <Form
          id={formId}
          layout="vertical"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <FormField label="Name" required>
            <Input name="name" defaultValue="Leaf UI" />
          </FormField>
        </Form>
      </Drawer>
    </>
  );
}
